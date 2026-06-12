import sharp from "sharp";
import type { Page } from "playwright";

export const PREVIEW_CAPTURE_CSS = `
html.preview-capture, html.preview-capture * {
  scroll-behavior: auto !important;
}
html.preview-capture [data-review="header"],
html.preview-capture header.site-header,
html.preview-capture [data-review="utility"] {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
  transform: none !important;
  will-change: auto !important;
}
html.video-capture [data-review="header"],
html.video-capture header.site-header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 50 !important;
}
html.preview-capture #__next-build-watcher,
html.preview-capture nextjs-portal,
html.preview-capture [data-nextjs-toast],
html.preview-capture [data-nextjs-dev-tools-button],
html.preview-capture [data-next-badge-root],
html.preview-capture [class*="nextjs-portal"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
html.preview-capture a[href*="webfortradesuk.co.uk"] {
  visibility: hidden !important;
  opacity: 0 !important;
}
html.preview-capture .quote-form-intro > p:not(.section-label),
html.preview-capture .quote-form-notice {
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
}
`;

const BANNED_CAPTURE_TEXT =
  /\b(demo|test|preview|speculative|webfortrades)\b/i;

const DEV_INDICATOR_SELECTORS = [
  "#__next-build-watcher",
  "nextjs-portal",
  "[data-nextjs-toast]",
  "[data-nextjs-dev-tools-button]",
  "[data-next-badge-root]",
  '[class*="nextjs-portal"]',
];

export async function injectPreviewCaptureMode(
  page: Page,
  forVideo: boolean
): Promise<void> {
  await page.addInitScript((videoCapture: boolean) => {
    document.documentElement.classList.add("preview-capture");
    if (videoCapture) document.documentElement.classList.add("video-capture");
  }, forVideo);
  await page.addStyleTag({ content: PREVIEW_CAPTURE_CSS });
  await page.evaluate((videoCapture: boolean) => {
    document.documentElement.classList.add("preview-capture");
    if (videoCapture) document.documentElement.classList.add("video-capture");
  }, forVideo);
}

export async function pageHasDevIndicators(page: Page): Promise<boolean> {
  return page.evaluate((selectors: string[]) => {
    return selectors.some((sel) => document.querySelector(sel));
  }, DEV_INDICATOR_SELECTORS);
}

/** Heuristic: Next.js dev badge is a small dark mark in the absolute bottom-left corner only. */
export async function imageHasBottomLeftDevBadge(
  png: Buffer,
  width: number,
  height: number
): Promise<boolean> {
  const w = Math.floor(width);
  const h = Math.floor(height);
  const cropW = Math.min(20, w);
  const cropH = Math.min(20, Math.max(1, h));
  const top = Math.max(0, Math.floor(h - cropH));

  if (cropW <= 0 || cropH <= 0 || top + cropH > h) return false;

  const { data, info } = await sharp(png)
    .extract({ left: 0, top, width: cropW, height: cropH })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let darkCount = 0;
  const pixels = cropW * cropH;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i] ?? 255;
    const g = data[i + 1] ?? 255;
    const b = data[i + 2] ?? 255;
    if (r < 25 && g < 25 && b < 25) darkCount++;
  }

  return darkCount / pixels > 0.55;
}

export async function assertPreviewAssetClean(
  png: Buffer,
  width: number,
  height: number,
  label: string
): Promise<void> {
  if (await imageHasBottomLeftDevBadge(png, width, height)) {
    throw new Error(
      `${label}: Next.js dev indicator detected in bottom-left corner. Use production preview mode.`
    );
  }
}

export async function headerVisibleInViewport(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const header =
      document.querySelector("header.site-header") ??
      document.querySelector('[data-review="header"]') ??
      document.querySelector("header");
    if (!header) return false;
    const rect = header.getBoundingClientRect();
    return rect.height > 20 && rect.top >= -2 && rect.bottom > 0;
  });
}

export async function assertNoBannedCaptureText(
  page: Page,
  label: string
): Promise<void> {
  const text = await page.evaluate(() => {
    const lines: string[] = [];
    const viewportBottom = window.innerHeight;
    for (const el of document.querySelectorAll("body *")) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.closest('script, style, [hidden], a[href*="webfortradesuk.co.uk"]')) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.opacity === "0" || style.display === "none") {
        continue;
      }
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportBottom || rect.width === 0 || rect.height === 0) {
        continue;
      }
      const own = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent ?? "")
        .join("")
        .trim();
      if (own) lines.push(own);
    }
    return lines.join(" ").replace(/\s+/g, " ").trim();
  });
  if (BANNED_CAPTURE_TEXT.test(text)) {
    throw new Error(`${label}: banned wording visible on page (${text.slice(0, 120)})`);
  }
}
