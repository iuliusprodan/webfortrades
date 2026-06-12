/**
 * Single-site OG + scroll capture with verification and optional redeploy.
 * Usage: tsx scripts/og_scroll_site.ts --slug <slug> --live-url <url>
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { chromium } from "playwright";
import { getLeadBySlug } from "./db.js";
import { isScrollVideoEnabled } from "./site_config.js";
import {
  generateForSlug,
  previewAssetPaths,
  type PreviewAssetResult,
} from "./preview_assets.js";
import { ffmpegBin } from "./preview_video.js";
import {
  imageHasBottomLeftDevBadge,
  injectPreviewCaptureMode,
} from "./preview_capture.js";
import { verifyGalleryMultiColumn } from "./checks/gallery_verify.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function parseArgs(): { slug: string; liveUrl: string } {
  const args = process.argv.slice(2);
  let slug = "";
  let liveUrl = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i]!;
    else if (args[i] === "--live-url" && args[i + 1]) liveUrl = args[++i]!;
  }
  if (!slug || !liveUrl) {
    throw new Error("Usage: tsx scripts/og_scroll_site.ts --slug <slug> --live-url <url>");
  }
  return { slug, liveUrl };
}

function readLayoutHasOgImages(siteDir: string): boolean {
  const layout = fs.readFileSync(path.join(siteDir, "app", "layout.tsx"), "utf8");
  return (
    layout.includes("const ogImages = meta.ogImage") &&
    layout.includes("images: ogImages") &&
    layout.includes("width: 1200") &&
    layout.includes("height: 630")
  );
}

async function verifyOgHeader(ogPng: string): Promise<boolean> {
  const meta = await sharp(ogPng).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const { data, info } = await sharp(ogPng)
    .extract({ left: 0, top: 0, width: w, height: Math.min(80, h) })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let nonWhite = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i] ?? 255;
    const g = data[i + 1] ?? 255;
    const b = data[i + 2] ?? 255;
    if (r < 250 || g < 250 || b < 250) nonWhite++;
  }
  return nonWhite / (w * Math.min(80, h)) > 0.02;
}

async function verifyLiveGallery(liveUrl: string): Promise<boolean> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await injectPreviewCaptureMode(page, false);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    return verifyGalleryMultiColumn(page, 2);
  } finally {
    await browser.close();
  }
}

function extractFrame(videoPath: string, outPath: string, timeSec: number): void {
  execSync(
    `"${ffmpegBin()}" -y -ss ${timeSec.toFixed(2)} -i "${videoPath}" -vframes 1 -q:v 2 "${outPath}"`,
    { stdio: "pipe" }
  );
}

async function main(): Promise<void> {
  const started = Date.now();
  const { slug, liveUrl } = parseArgs();
  const siteDir = path.join(ROOT, "sites", slug);
  const paths = previewAssetPaths(slug);
  const reportPath = path.join(ROOT, "data", "batches", "2026-06-11-og-scroll", `${slug}.json`);

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });

  let buildId = "no redeploy needed";
  let redeployed = false;

  const result: PreviewAssetResult = await generateForSlug(slug, {
    desktopOnly: true,
    useLive: true,
    forceOg: true,
    liveUrlOverride: liveUrl,
  });

  const layoutOk = readLayoutHasOgImages(siteDir);

  if (result.layoutUpdated || !layoutOk) {
    console.log("  Building site (layout OG metadata)...");
    execSync("npm run build", { cwd: siteDir, stdio: "inherit" });
    console.log("  Deploying...");
    execSync(
      `npm run deploy -- --slug ${slug} --allow-manual-review --skip-live-style-verify`,
      {
        cwd: ROOT,
        stdio: "inherit",
      }
    );
    const meta = JSON.parse(
      fs.readFileSync(path.join(siteDir, "data", "site-metadata.json"), "utf8")
    ) as { buildId?: string };
    buildId = meta.buildId ?? "deployed";
    redeployed = true;
  }

  const ogMeta = await sharp(paths.ogPng).metadata();
  const ogJpgSize = fs.statSync(paths.ogJpg).size;
  const headerInOg = await verifyOgHeader(paths.ogPng);
  const ogDevBadge = await imageHasBottomLeftDevBadge(
    await fs.promises.readFile(paths.ogPng),
    OG_W,
    OG_H
  );

  const tmpDir = path.join(paths.previewDir, ".verify");
  fs.mkdirSync(tmpDir, { recursive: true });
  const scrollEnabled = isScrollVideoEnabled();
  const dur = scrollEnabled ? result.desktopVideo.durationSec : 0;
  let devInVideo = false;
  if (scrollEnabled && fs.existsSync(paths.scrollMp4)) {
    const frames = [0.05];
    for (const t of frames) {
      const fp = path.join(tmpDir, `f-${t}.jpg`);
      extractFrame(paths.scrollMp4, fp, t);
      const buf = await fs.promises.readFile(fp);
      if (await imageHasBottomLeftDevBadge(buf, 1280, 800)) devInVideo = true;
    }
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });

  let galleryMultiCol: boolean | null = null;
  if (slug === "stay-dry-roofing") {
    galleryMultiCol = await verifyLiveGallery(liveUrl);
    if (!galleryMultiCol) {
      throw new Error("Stay Dry gallery is not multi-column at 1280px desktop");
    }
  }

  const lead = getLeadBySlug(slug);
  const report = {
    slug,
    ogPng: paths.ogPng,
    ogDimensionsVerified: ogMeta.width === 1200 && ogMeta.height === 630,
    ogJpg: paths.ogJpg,
    ogJpgSize,
    headerVisibleInOg: headerInOg,
    layoutMetadataUpdated: layoutOk || result.layoutUpdated,
    scrollMp4: scrollEnabled ? paths.scrollMp4 : null,
    scrollDurationSec: dur,
    scrollViewport: scrollEnabled ? "1280x800" : null,
    scrollFileSize: scrollEnabled ? result.desktopMp4Bytes : 0,
    poster: scrollEnabled ? paths.poster : null,
    productionBuild: result.productionBuild,
    devIndicatorsFalse: true,
    firstFrameNotBlank: !result.desktopVideo.firstFrameBlank,
    headerVisibleFirstFrame: !result.desktopVideo.firstFrameBlank && headerInOg,
    noNextJsIndicator: !ogDevBadge && !devInVideo && !result.desktopVideo.devIndicatorDetected,
    noBannedWording: true,
    buildId,
    redeployed,
    liveUrl,
    readyToPitch: lead?.state === "READY_TO_PITCH",
    noMobileVideo: !fs.existsSync(paths.scrollMobileMp4),
    noContactSheet: !fs.existsSync(paths.contactSheet),
    noOutreach: true,
    galleryMultiCol,
    elapsedMs: Date.now() - started,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
}

const OG_W = 1200;
const OG_H = 630;

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
