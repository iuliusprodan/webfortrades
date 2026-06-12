/**
 * Generate OG images and scroll-through preview videos for prospect sites.
 * Outputs:
 *   sites/<slug>/public/og.png, og.jpg
 *   previews/<slug>/scroll.mp4, poster.jpg
 *   (optional) scroll.webm, scroll-mobile.mp4, contact-sheet.jpg
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import { getLeadBySlug } from "./db.js";
import { withPreviewServer } from "./preview_server.js";
import {
  assertNoBannedCaptureText,
  headerVisibleInViewport,
  injectPreviewCaptureMode,
  pageHasDevIndicators,
} from "./preview_capture.js";
import {
  DEFAULT_VIDEO_CAPTURE,
  ffmpegBin,
  ffprobeBin,
  recordDesktopScrollVideo,
  SCROLL_PREVIEW_DESKTOP,
  SCROLL_PREVIEW_MOBILE,
  validateScrollVideo,
  type VideoValidationResult,
} from "./preview_video.js";
import { cityLabel, type MetadataBrief } from "./site_metadata.js";
import { isScrollVideoEnabled } from "./site_config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const OG_W = 1200;
const OG_H = 630;

export interface PreviewAssetPaths {
  ogPng: string;
  ogJpg: string;
  previewDir: string;
  scrollMp4: string;
  scrollWebm: string;
  scrollMobileMp4: string;
  poster: string;
  contactSheet: string;
}

export function previewAssetPaths(slug: string, root = ROOT): PreviewAssetPaths {
  const previewDir = path.join(root, "previews", slug);
  const publicDir = path.join(root, "sites", slug, "public");
  return {
    ogPng: path.join(publicDir, "og.png"),
    ogJpg: path.join(publicDir, "og.jpg"),
    previewDir,
    scrollMp4: path.join(previewDir, "scroll.mp4"),
    scrollWebm: path.join(previewDir, "scroll.webm"),
    scrollMobileMp4: path.join(previewDir, "scroll-mobile.mp4"),
    poster: path.join(previewDir, "poster.jpg"),
    contactSheet: path.join(previewDir, "contact-sheet.jpg"),
  };
}

function parseArgs(): {
  slugs: string[];
  desktopOnly: boolean;
  useLive: boolean;
  forceOg: boolean;
  liveUrls: Map<string, string>;
} {
  const args = process.argv.slice(2);
  const slugs: string[] = [];
  const liveUrls = new Map<string, string>();
  let desktopOnly = false;
  let useLive = false;
  let forceOg = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slugs.push(args[++i]);
    else if (args[i] === "--live-url" && args[i + 1] && slugs.length > 0) {
      liveUrls.set(slugs[slugs.length - 1]!, args[++i]!);
    } else if (args[i] === "--desktop-only") desktopOnly = true;
    else if (args[i] === "--use-live") useLive = true;
    else if (args[i] === "--force-og") forceOg = true;
  }
  return { slugs, desktopOnly, useLive, forceOg, liveUrls };
}

async function ogAlreadyValid(ogPng: string, ogJpg: string): Promise<boolean> {
  if (!fs.existsSync(ogPng) || !fs.existsSync(ogJpg)) return false;
  const meta = await sharp(ogPng).metadata();
  if (meta.width !== OG_W || meta.height !== OG_H) return false;
  if (fs.statSync(ogJpg).size > 300_000) return false;
  return true;
}

function assertFfmpegReady(): void {
  try {
    execSync(`"${ffmpegBin()}" -version`, { stdio: "pipe" });
  } catch {
    throw new Error(
      "ffmpeg not found. Install ffmpeg or set FFMPEG=/opt/homebrew/bin/ffmpeg"
    );
  }
}

function assertPlaywrightReady(): void {
  try {
    execSync("npx playwright --version", { stdio: "pipe", cwd: ROOT });
  } catch {
    throw new Error("Playwright not ready. Run: npx playwright install chromium");
  }
}

function assertDevIndicatorsFalse(siteDir: string): void {
  const configPath = path.join(siteDir, "next.config.ts");
  const configMjs = path.join(siteDir, "next.config.mjs");
  const configJs = path.join(siteDir, "next.config.js");
  const configFile = [configPath, configMjs, configJs].find((p) => fs.existsSync(p));
  if (!configFile) return;
  const src = fs.readFileSync(configFile, "utf8");
  if (!/devIndicators\s*:\s*false/.test(src)) {
    throw new Error(`${configFile}: devIndicators must be false for capture`);
  }
}

async function assertLiveUrlOk(url: string): Promise<void> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Live URL ${url} returned HTTP ${res.status}`);
  }
}

const DESKTOP_VIDEO_SETTINGS = {
  ...DEFAULT_VIDEO_CAPTURE,
  holdHeroMs: 1500,
  holdFormMs: 1500,
  videoSpeed: 1.35,
};

const DESKTOP_DURATION = { minDurationSec: 12, maxDurationSec: 15 };
const SITE_BUDGET_MS = 5 * 60 * 1000;

const SKIPPED_SCROLL_VIDEO: VideoValidationResult = {
  ok: true,
  issues: [],
  width: 0,
  height: 0,
  durationSec: 0,
  firstFrameBlank: false,
  earlyFrameBlank: false,
  reachedContactForm: false,
  maxHeaderJumpPx: 0,
  scrollModel: "disabled",
  devIndicatorDetected: false,
};

function loadBrief(siteDir: string): MetadataBrief {
  return JSON.parse(
    fs.readFileSync(path.join(siteDir, "data", "brief.json"), "utf8")
  ) as MetadataBrief;
}

async function waitForCaptureReady(page: import("playwright").Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
    );
  });
  await injectPreviewCaptureMode(page, false);
  if (await pageHasDevIndicators(page)) {
    throw new Error("Next.js dev indicators detected. Use production static export.");
  }
  await assertNoBannedCaptureText(page, "OG capture");
  await page.waitForTimeout(400);
}

async function generateOgImage(
  page: import("playwright").Page,
  brief: MetadataBrief,
  paths: PreviewAssetPaths
): Promise<void> {
  await page.setViewportSize({ width: OG_W, height: 900 });
  await waitForCaptureReady(page);

  if (!(await headerVisibleInViewport(page))) {
    throw new Error("OG capture: header not visible in viewport");
  }

  const heroShot = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: OG_W, height: OG_H },
  });
  if (await pageHasDevIndicators(page)) {
    throw new Error("OG hero: Next.js dev indicators detected in DOM");
  }

  fs.mkdirSync(path.dirname(paths.ogPng), { recursive: true });
  await sharp(heroShot)
    .resize(OG_W, OG_H, { fit: "cover", position: "top" })
    .png()
    .toFile(paths.ogPng);

  let quality = 85;
  let jpgBuf = await sharp(paths.ogPng).jpeg({ quality, mozjpeg: true }).toBuffer();
  while (jpgBuf.length > 300 * 1024 && quality > 50) {
    quality -= 5;
    jpgBuf = await sharp(paths.ogPng).jpeg({ quality, mozjpeg: true }).toBuffer();
  }
  fs.writeFileSync(paths.ogJpg, jpgBuf);

  const meta = await sharp(paths.ogPng).metadata();
  if (meta.width !== OG_W || meta.height !== OG_H) {
    throw new Error(`OG PNG dimensions ${meta.width}x${meta.height}, expected ${OG_W}x${OG_H}`);
  }
}

async function createContactSheet(videoPath: string, outPath: string): Promise<void> {
  const probe = execSync(
    `"${ffprobeBin()}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
    { encoding: "utf8" }
  ).trim();
  const duration = Number(probe) || 15;
  const tmpDir = path.join(path.dirname(outPath), ".contact-frames");
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  const fractions = [0.05, 0.35, 0.65, 0.95];
  const framePaths: string[] = [];
  for (let i = 0; i < fractions.length; i++) {
    const t = Math.max(0.05, duration * fractions[i]!);
    const fp = path.join(tmpDir, `f${i}.jpg`);
    execSync(
      `"${ffmpegBin()}" -y -ss ${t.toFixed(2)} -i "${videoPath}" -vframes 1 -q:v 2 "${fp}"`,
      { stdio: "pipe" }
    );
    framePaths.push(fp);
  }

  const thumbW = 320;
  const resized = await Promise.all(
    framePaths.map((fp) =>
      sharp(fp)
        .resize(thumbW, Math.round(thumbW * (800 / 1280)), { fit: "cover" })
        .jpeg({ quality: 88 })
        .toBuffer()
    )
  );

  const gap = 8;
  const sheetW = thumbW * resized.length + gap * (resized.length - 1);
  const sheetH = Math.round(thumbW * (800 / 1280));

  const composites = resized.map((buf, i) => ({
    input: buf,
    left: i * (thumbW + gap),
    top: 0,
  }));

  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 3,
      background: { r: 244, g: 247, b: 250 },
    },
  })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile(outPath);

  fs.rmSync(tmpDir, { recursive: true, force: true });
}

function updateSiteMetadata(siteDir: string, metadataBase: string): void {
  const metaPath = path.join(siteDir, "data", "site-metadata.json");
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as Record<string, string>;
  meta.ogImage = "/og.png";
  meta.metadataBase = metadataBase.replace(/\/$/, "");
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
}

export function updateLayoutOgMetadata(siteDir: string, brief: MetadataBrief): boolean {
  const layoutPath = path.join(siteDir, "app", "layout.tsx");
  if (!fs.existsSync(layoutPath)) return false;
  let src = fs.readFileSync(layoutPath, "utf8");
  if (src.includes("const ogImages = meta.ogImage")) return false;

  const location = cityLabel(brief);
  const ogBlock = `
const ogImages = meta.ogImage
  ? [{ url: meta.ogImage, width: 1200, height: 630, alt: \`\${brief.business_name}, ${location}\` }]
  : undefined;
`;

  const metaEnd = src.indexOf("export const metadata");
  if (metaEnd === -1) return false;
  src = src.slice(0, metaEnd) + ogBlock + src.slice(metaEnd);

  src = src.replace(
    /openGraph:\s*\{([^}]*)\}/s,
    (match, inner) => {
      if (inner.includes("images:")) return match;
      const trimmed = inner.trimEnd();
      const sep = trimmed.endsWith(",") ? "" : ",";
      return `openGraph: {${inner}${sep}\n    images: ogImages,\n  }`;
    }
  );

  src = src.replace(/twitter:\s*\{\s*card:\s*"summary"/, 'twitter: {\n    card: "summary_large_image"');
  src = src.replace(
    /twitter:\s*\{([^}]*)\}/s,
    (match, inner) => {
      if (inner.includes("images:")) return match;
      const trimmed = inner.trimEnd();
      const sep = trimmed.endsWith(",") ? "" : ",";
      return `twitter: {${inner}${sep}\n    images: meta.ogImage ? [meta.ogImage] : undefined,\n  }`;
    }
  );

  fs.writeFileSync(layoutPath, src);
  return true;
}

function resolveSiteUrl(
  slug: string,
  lead: { verified_site_url?: string | null; site_url?: string | null },
  override?: string
): string {
  if (override) return override.replace(/\/$/, "");
  const deployPath = path.join(ROOT, "briefs", slug, "deploy.json");
  if (fs.existsSync(deployPath)) {
    const deploy = JSON.parse(fs.readFileSync(deployPath, "utf8")) as {
      final_url?: string;
      verified_url?: string;
    };
    if (deploy.final_url) return deploy.final_url.replace(/\/$/, "");
    if (deploy.verified_url) return deploy.verified_url.replace(/\/$/, "");
  }
  return (lead.verified_site_url ?? lead.site_url ?? `https://${slug}.vercel.app`).replace(
    /\/$/,
    ""
  );
}

export interface PreviewAssetResult {
  slug: string;
  paths: PreviewAssetPaths;
  ogStrategy: string;
  ogDimensionsOk: boolean;
  layoutUpdated: boolean;
  metadataUpdated: boolean;
  desktopVideo: VideoValidationResult;
  mobileVideo?: VideoValidationResult;
  desktopMp4Bytes: number;
  mobileMp4Bytes?: number;
  productionBuild: boolean;
  liveUrl: string;
  elapsedMs: number;
  budgetHit?: string;
}

async function captureFromUrl(
  captureUrl: string,
  siteDir: string,
  brief: MetadataBrief,
  slug: string,
  paths: PreviewAssetPaths,
  opts: { desktopOnly: boolean; forceOg: boolean }
): Promise<{
  ogStrategy: string;
  desktopVideo: VideoValidationResult;
  mobileVideo?: VideoValidationResult;
}> {
  let ogStrategy = "reused";
  let desktopVideo!: VideoValidationResult;
  let mobileVideo: VideoValidationResult | undefined;

  const skipOg = !opts.forceOg && (await ogAlreadyValid(paths.ogPng, paths.ogJpg));

  if (skipOg) {
    console.log(`  ✓ OG image reused: ${paths.ogPng} (1200x630)`);
    ogStrategy = "reused";
  } else {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
      await page.goto(captureUrl, { waitUntil: "domcontentloaded" });
      await generateOgImage(page, brief, paths);
      ogStrategy = "hero-screenshot";
      console.log(`  ✓ OG image (${ogStrategy}): ${paths.ogPng}`);
      console.log(`  ✓ OG JPEG: ${paths.ogJpg} (${fs.statSync(paths.ogJpg).size} bytes)`);
    } finally {
      await browser.close();
    }
  }

  console.log(
    `  Recording desktop scroll (${SCROLL_PREVIEW_DESKTOP.width}x${SCROLL_PREVIEW_DESKTOP.height})...`
  );
  if (!isScrollVideoEnabled()) {
    console.log("  Scroll video skipped (site_design.scroll_video_enabled=false).");
    desktopVideo = SKIPPED_SCROLL_VIDEO;
    return { ogStrategy, desktopVideo, mobileVideo };
  }

  desktopVideo = await recordDesktopScrollVideo({
    siteDir,
    url: captureUrl,
    outputPath: paths.scrollMp4,
    webmPath: opts.desktopOnly ? undefined : paths.scrollWebm,
    posterPath: paths.poster,
    size: SCROLL_PREVIEW_DESKTOP,
    settings: DESKTOP_VIDEO_SETTINGS,
    scrollTarget: "full",
    ...DESKTOP_DURATION,
  });

  if (!opts.desktopOnly) {
    console.log(
      `  Recording mobile scroll (${SCROLL_PREVIEW_MOBILE.width}x${SCROLL_PREVIEW_MOBILE.height})...`
    );
    mobileVideo = await recordDesktopScrollVideo({
      siteDir,
      url: captureUrl,
      outputPath: paths.scrollMobileMp4,
      size: SCROLL_PREVIEW_MOBILE,
      settings: DESKTOP_VIDEO_SETTINGS,
      scrollTarget: "full",
    });
    await createContactSheet(paths.scrollMp4, paths.contactSheet);
    console.log(`  ✓ Contact sheet: ${paths.contactSheet}`);
  }

  return { ogStrategy, desktopVideo, mobileVideo };
}

export async function generateForSlug(
  slug: string,
  opts: { desktopOnly: boolean; useLive: boolean; forceOg: boolean; liveUrlOverride?: string }
): Promise<PreviewAssetResult> {
  const started = Date.now();
  const budgetLeft = () => SITE_BUDGET_MS - (Date.now() - started);
  const assertBudget = (step: string) => {
    if (budgetLeft() <= 0) {
      throw new Error(`5-minute budget exceeded during: ${step}`);
    }
  };

  const lead = getLeadBySlug(slug);
  if (!lead?.slug) throw new Error(`Lead not found: ${slug}`);

  const siteDir = path.join(ROOT, "sites", slug);
  if (!fs.existsSync(path.join(siteDir, "package.json"))) {
    throw new Error(`Site missing: ${siteDir}`);
  }

  assertDevIndicatorsFalse(siteDir);

  const paths = previewAssetPaths(slug);
  fs.mkdirSync(paths.previewDir, { recursive: true });

  const brief = loadBrief(siteDir);
  const siteUrl = resolveSiteUrl(slug, lead, opts.liveUrlOverride);

  if (opts.useLive) {
    await assertLiveUrlOk(siteUrl);
    console.log(`  Live URL OK: ${siteUrl}`);
  }

  let ogStrategy = "reused";
  let desktopVideo!: VideoValidationResult;
  let mobileVideo: VideoValidationResult | undefined;
  let productionBuild = false;

  if (opts.useLive) {
    const result = await captureFromUrl(siteUrl, siteDir, brief, slug, paths, opts);
    ogStrategy = result.ogStrategy;
    desktopVideo = result.desktopVideo;
    mobileVideo = result.mobileVideo;
    productionBuild = true;
    assertBudget("live capture");
  } else {
    await withPreviewServer(siteDir, async (previewUrl) => {
      assertBudget("production build");
      console.log(`  Preview server: ${previewUrl} (production static export)`);
      productionBuild = true;
      const result = await captureFromUrl(
        previewUrl,
        siteDir,
        brief,
        slug,
        paths,
        opts
      );
      ogStrategy = result.ogStrategy;
      desktopVideo = result.desktopVideo;
      mobileVideo = result.mobileVideo;
      assertBudget("preview server capture");
    });
  }

  updateSiteMetadata(siteDir, siteUrl);
  const layoutUpdated = updateLayoutOgMetadata(siteDir, brief);

  const ogMeta = await sharp(paths.ogPng).metadata();
  let desktopMp4Bytes = 0;
  if (isScrollVideoEnabled() && fs.existsSync(paths.scrollMp4)) {
    desktopMp4Bytes = fs.statSync(paths.scrollMp4).size;
    if (desktopMp4Bytes > 8 * 1024 * 1024) {
    console.log(
      `  Re-encoding desktop video (${(desktopMp4Bytes / 1024 / 1024).toFixed(2)} MB > 8 MB)...`
    );
    const tmp = `${paths.scrollMp4}.tmp.mp4`;
    execSync(
      `"${ffmpegBin()}" -y -i "${paths.scrollMp4}" -c:v libx264 -crf 28 -preset faster -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${tmp}"`,
      { stdio: "pipe" }
    );
    fs.renameSync(tmp, paths.scrollMp4);
    desktopMp4Bytes = fs.statSync(paths.scrollMp4).size;
    }
  }

  if (isScrollVideoEnabled() && !desktopVideo.ok) {
    throw new Error(`Desktop video failed: ${desktopVideo.issues.join("; ")}`);
  }
  if (isScrollVideoEnabled() && mobileVideo && !mobileVideo.ok) {
    throw new Error(`Mobile video failed: ${mobileVideo.issues.join("; ")}`);
  }

  return {
    slug,
    paths,
    ogStrategy,
    ogDimensionsOk: ogMeta.width === OG_W && ogMeta.height === OG_H,
    layoutUpdated,
    metadataUpdated: true,
    desktopVideo,
    mobileVideo,
    desktopMp4Bytes,
    mobileMp4Bytes: mobileVideo ? fs.statSync(paths.scrollMobileMp4).size : undefined,
    productionBuild,
    liveUrl: siteUrl,
    elapsedMs: Date.now() - started,
  };
}

async function main(): Promise<void> {
  assertFfmpegReady();
  assertPlaywrightReady();
  const { slugs: slugArgs, desktopOnly, useLive, forceOg, liveUrls } = parseArgs();
  const slugs =
    slugArgs.length > 0
      ? slugArgs
      : ["jt-plumbing", "greens-precise-plumbing-heating-ltd"];

  console.log(
    `Generating preview assets (OG + ${desktopOnly ? "desktop scroll only" : "scroll videos"}). ${useLive ? "Live URL capture." : "Production build only."}\n`
  );

  const results: PreviewAssetResult[] = [];
  for (const slug of slugs) {
    console.log(`\n=== ${slug} ===`);
    const t0 = Date.now();
    try {
      results.push(
        await generateForSlug(slug, {
          desktopOnly,
          useLive,
          forceOg,
          liveUrlOverride: liveUrls.get(slug),
        })
      );
      console.log(`  Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } catch (err) {
      const elapsed = Date.now() - t0;
      console.error(`  Failed after ${(elapsed / 1000).toFixed(1)}s:`, err);
      throw err;
    }
  }

  console.log("\n--- Summary ---");
  for (const r of results) {
    console.log(`\n${r.slug} (${(r.elapsedMs / 1000).toFixed(1)}s):`);
    console.log(`  OG: ${r.paths.ogPng} (${r.ogDimensionsOk ? "1200x630 OK" : "DIMENSION FAIL"})`);
    console.log(`  Layout OG metadata: ${r.layoutUpdated ? "updated" : "already set"}`);
    console.log(
      `  Desktop video: ${r.paths.scrollMp4} (${(r.desktopMp4Bytes / 1024 / 1024).toFixed(2)} MB, ${r.desktopVideo.durationSec.toFixed(1)}s)`
    );
    console.log(`  Poster: ${r.paths.poster}`);
    if (!desktopOnly) {
      console.log(`  WebM: ${r.paths.scrollWebm}`);
      console.log(
        `  Mobile video: ${r.paths.scrollMobileMp4} (${((r.mobileMp4Bytes ?? 0) / 1024 / 1024).toFixed(2)} MB)`
      );
      console.log(`  Contact sheet: ${r.paths.contactSheet}`);
    }
  }

  console.log("\nNo outreach sent. Preview assets only.");
}

const isDirectRun =
  process.argv[1] != null &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}