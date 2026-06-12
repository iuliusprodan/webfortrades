/**
 * Fast OG capture: shared Playwright browser, 1200x630 hero clip, minimal waits.
 */
import fs from "node:fs";
import path from "node:path";
import type { Browser, BrowserContext, Page } from "playwright";
import sharp from "sharp";
import {
  assertNoBannedCaptureText,
  assertPreviewAssetClean,
  headerVisibleInViewport,
  injectPreviewCaptureMode,
  pageHasDevIndicators,
} from "./preview_capture.js";
import { previewAssetPaths, updateLayoutOgMetadata } from "./preview_assets.js";
import type { MetadataBrief } from "./site_metadata.js";

export const OG_W = 1200;
export const OG_H = 630;
const PNG_MAX_BYTES = 2 * 1024 * 1024;
const JPG_MAX_BYTES = 200 * 1024;

export interface OgCaptureResult {
  slug: string;
  ogPng: string;
  ogJpg: string;
  pngBytes: number;
  jpgBytes: number;
  elapsedMs: number;
  layoutUpdated: boolean;
}

export interface OgCaptureTimings {
  gotoMs: number;
  fontsMs: number;
  heroDecodeMs: number;
  captureMs: number;
  encodeMs: number;
  verifyMs: number;
}

function assertDevIndicatorsFalse(siteDir: string): void {
  const configFile = ["next.config.ts", "next.config.mjs", "next.config.js"]
    .map((f) => path.join(siteDir, f))
    .find((p) => fs.existsSync(p));
  if (!configFile) return;
  const src = fs.readFileSync(configFile, "utf8");
  if (!/devIndicators\s*:\s*false/.test(src)) {
    throw new Error(`${configFile}: devIndicators must be false for OG capture`);
  }
}

async function waitForHeroReady(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const heroRoot =
      document.querySelector('[data-review="hero"]') ??
      document.querySelector('[data-section-id="hero"]') ??
      document.querySelector(".hero") ??
      document.body;
    const img =
      heroRoot.querySelector("img") ??
      document.querySelector('[data-review="hero"] img, [data-section-id="hero"] img, .hero img');
    if (img instanceof HTMLImageElement) {
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }
      if (img.decode) {
        await img.decode().catch(() => undefined);
      }
    }
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

async function assertHeaderInCaptureRegion(page: Page): Promise<void> {
  const ok = await page.evaluate(() => {
    const header =
      document.querySelector("header.site-header") ??
      document.querySelector('[data-review="header"]') ??
      document.querySelector("header");
    if (!header) return false;
    const rect = header.getBoundingClientRect();
    return rect.height > 20 && rect.bottom > 0 && rect.top < 630 && rect.right > 0;
  });
  if (!ok) throw new Error("OG capture: header does not intersect 1200x630 region");
}

function updateSiteMetadataOg(siteDir: string, metadataBase: string): void {
  const metaPath = path.join(siteDir, "data", "site-metadata.json");
  if (!fs.existsSync(metaPath)) return;
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as Record<string, string>;
  meta.ogImage = "/og.png";
  meta.metadataBase = metadataBase.replace(/\/$/, "");
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
}

export async function captureOgFromPage(
  page: Page,
  paths: { ogPng: string; ogJpg: string },
  label: string
): Promise<{ pngBytes: number; jpgBytes: number; timings: OgCaptureTimings }> {
  const timings: OgCaptureTimings = {
    gotoMs: 0,
    fontsMs: 0,
    heroDecodeMs: 0,
    captureMs: 0,
    encodeMs: 0,
    verifyMs: 0,
  };

  await page.setViewportSize({ width: OG_W, height: OG_H });

  const fontsStart = Date.now();
  await waitForHeroReady(page);
  timings.fontsMs = Date.now() - fontsStart;
  timings.heroDecodeMs = timings.fontsMs;

  await injectPreviewCaptureMode(page, false);
  if (await pageHasDevIndicators(page)) {
    throw new Error(`${label}: Next.js dev indicators visible in DOM`);
  }
  await assertNoBannedCaptureText(page, label);
  if (!(await headerVisibleInViewport(page))) {
    throw new Error(`${label}: header not visible`);
  }
  await assertHeaderInCaptureRegion(page);

  const captureStart = Date.now();
  const pngBuf = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: OG_W, height: OG_H },
  });
  timings.captureMs = Date.now() - captureStart;

  await assertPreviewAssetClean(pngBuf, OG_W, OG_H, label);

  fs.mkdirSync(path.dirname(paths.ogPng), { recursive: true });
  fs.writeFileSync(paths.ogPng, pngBuf);

  const encodeStart = Date.now();
  let quality = 82;
  let jpgBuf = await sharp(pngBuf).jpeg({ quality, mozjpeg: true }).toBuffer();
  while (jpgBuf.length > JPG_MAX_BYTES && quality > 55) {
    quality -= 3;
    jpgBuf = await sharp(pngBuf).jpeg({ quality, mozjpeg: true }).toBuffer();
  }
  fs.writeFileSync(paths.ogJpg, jpgBuf);
  timings.encodeMs = Date.now() - encodeStart;

  const verifyStart = Date.now();
  const meta = await sharp(pngBuf).metadata();
  if (meta.width !== OG_W || meta.height !== OG_H) {
    throw new Error(`${label}: PNG is ${meta.width}x${meta.height}, expected ${OG_W}x${OG_H}`);
  }
  if (pngBuf.length > PNG_MAX_BYTES) {
    throw new Error(`${label}: PNG ${pngBuf.length} bytes exceeds ${PNG_MAX_BYTES}`);
  }
  if (jpgBuf.length > JPG_MAX_BYTES) {
    throw new Error(`${label}: JPG ${jpgBuf.length} bytes exceeds ${JPG_MAX_BYTES}`);
  }
  timings.verifyMs = Date.now() - verifyStart;

  return { pngBytes: pngBuf.length, jpgBytes: jpgBuf.length, timings };
}

export async function captureOgForSite(
  browser: Browser,
  slug: string,
  liveUrl: string,
  root: string
): Promise<OgCaptureResult> {
  const started = Date.now();
  const siteDir = path.join(root, "sites", slug);
  assertDevIndicatorsFalse(siteDir);

  const brief = JSON.parse(
    fs.readFileSync(path.join(siteDir, "data", "brief.json"), "utf8")
  ) as MetadataBrief;
  const paths = previewAssetPaths(slug, root);
  fs.mkdirSync(path.dirname(paths.ogPng), { recursive: true });

  const context: BrowserContext = await browser.newContext({
    viewport: { width: OG_W, height: OG_H },
  });
  const page = await context.newPage();

  try {
    const gotoStart = Date.now();
    await page.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    const gotoMs = Date.now() - gotoStart;

    const { pngBytes, jpgBytes } = await captureOgFromPage(
      page,
      { ogPng: paths.ogPng, ogJpg: paths.ogJpg },
      slug
    );
    void gotoMs;

    updateSiteMetadataOg(siteDir, liveUrl);
    const layoutUpdated = updateLayoutOgMetadata(siteDir, brief);

    return {
      slug,
      ogPng: paths.ogPng,
      ogJpg: paths.ogJpg,
      pngBytes,
      jpgBytes,
      elapsedMs: Date.now() - started,
      layoutUpdated,
    };
  } finally {
    await context.close();
  }
}

export async function runOgWorker(
  browser: Browser,
  slugs: Array<{ slug: string; liveUrl: string }>,
  root: string
): Promise<OgCaptureResult[]> {
  const out: OgCaptureResult[] = [];
  for (const item of slugs) {
    out.push(await captureOgForSite(browser, item.slug, item.liveUrl, root));
  }
  return out;
}
