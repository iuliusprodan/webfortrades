import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import { getLeadBySlug } from "./db.js";
import {
  buildSiteMetadata,
  cityLabel,
  outreachAssetPaths,
  tradeTitleLine,
  type MetadataBrief,
} from "./site_metadata.js";
import {
  assertPreviewAssetClean,
  injectPreviewCaptureMode,
  pageHasDevIndicators,
} from "./preview_capture.js";
import { withPreviewServer } from "./preview_server.js";
import { isScrollVideoEnabled } from "./site_config.js";
import {
  cleanupVideoArtifacts,
  DEFAULT_VIDEO_CAPTURE,
  parseHoldMs,
  parseVideoRatio,
  parseVideoSpeed,
  recordDesktopScrollVideo,
  VIDEO_SIZES,
  type VideoCaptureSettings,
  type VideoRatio,
  type VideoValidationResult,
} from "./preview_video.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function parseArgs(): {
  slug?: string;
  video: boolean;
  ratio: VideoRatio;
  videoSettings: VideoCaptureSettings;
} {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let video = false;
  let ratio: VideoRatio = "16:9";
  let videoSpeed = DEFAULT_VIDEO_CAPTURE.videoSpeed;
  let holdHeroMs = DEFAULT_VIDEO_CAPTURE.holdHeroMs;
  let holdFormMs = DEFAULT_VIDEO_CAPTURE.holdFormMs;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--video") video = true;
    else if (args[i] === "--ratio" && args[i + 1]) ratio = parseVideoRatio(args[++i]);
    else if (args[i] === "--video-speed" && args[i + 1]) videoSpeed = parseVideoSpeed(args[++i]);
    else if (args[i] === "--hold-hero-ms" && args[i + 1]) {
      holdHeroMs = parseHoldMs(args[++i], DEFAULT_VIDEO_CAPTURE.holdHeroMs);
    } else if (args[i] === "--hold-form-ms" && args[i + 1]) {
      holdFormMs = parseHoldMs(args[++i], DEFAULT_VIDEO_CAPTURE.holdFormMs);
    }
  }

  return {
    slug,
    video,
    ratio,
    videoSettings: {
      ...DEFAULT_VIDEO_CAPTURE,
      videoSpeed,
      holdHeroMs,
      holdFormMs,
    },
  };
}

function loadBrief(siteDir: string): MetadataBrief {
  return JSON.parse(
    fs.readFileSync(path.join(siteDir, "data", "brief.json"), "utf8")
  ) as MetadataBrief;
}

function loadDesignColors(siteDir: string): {
  accent: string;
  background: string;
  foreground: string;
} {
  const design = JSON.parse(
    fs.readFileSync(path.join(siteDir, "data", "design-system.json"), "utf8")
  ) as { colors: { accent: string; background: string; foreground: string } };
  return design.colors;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function generateBrandedOgCard(
  brief: MetadataBrief,
  colors: { accent: string; background: string; foreground: string },
  outPath: string
): Promise<void> {
  const city = cityLabel(brief);
  const trade = tradeTitleLine(brief);
  const rating =
    typeof brief.google_rating === "number" && brief.google_rating > 0
      ? `${brief.google_rating}★ Google rating`
      : "";
  const reviews =
    brief.google_review_count_sourced &&
    typeof brief.google_review_count === "number"
      ? `${brief.google_review_count} Google reviews`
      : "";
  const proof = [rating, reviews].filter(Boolean).join(" · ");
  const phone = brief.phone?.trim() ?? "";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${colors.background}"/>
  <rect x="0" y="0" width="1200" height="8" fill="${colors.accent}"/>
  <text x="80" y="120" font-family="Georgia, serif" font-size="52" font-weight="600" fill="${colors.foreground}">${escapeXml(brief.business_name)}</text>
  <text x="80" y="190" font-family="Arial, sans-serif" font-size="28" fill="${colors.foreground}" opacity="0.85">Local ${escapeXml(city)} · ${escapeXml(trade)}</text>
  ${proof ? `<text x="80" y="260" font-family="Arial, sans-serif" font-size="24" fill="${colors.accent}">${escapeXml(proof)}</text>` : ""}
  ${phone ? `<text x="80" y="330" font-family="Arial, sans-serif" font-size="22" fill="${colors.foreground}" opacity="0.75">Call ${escapeXml(phone)}</text>` : ""}
  <text x="80" y="560" font-family="Arial, sans-serif" font-size="18" fill="${colors.foreground}" opacity="0.5">Get a free quote online</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

async function captureHeroScreenshots(
  url: string,
  siteDir: string,
  paths: ReturnType<typeof outreachAssetPaths>
): Promise<"hero-screenshot" | "branded-card"> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await injectPreviewCaptureMode(page, false);

    if (await pageHasDevIndicators(page)) {
      throw new Error(
        "Next.js dev indicators detected during screenshot capture. Use production preview mode."
      );
    }

    await page.waitForTimeout(600);

    const header = page.locator('[data-review="header"]');
    const hero = page.locator('[data-review="hero"]');
    await header.first().waitFor({ state: "visible" });
    await hero.first().waitFor({ state: "visible" });

    const headerBox = await header.first().boundingBox();
    const heroBox = await hero.first().boundingBox();
    let heroShot: Buffer;
    if (headerBox && heroBox) {
      const y = headerBox.y;
      const height = heroBox.y + heroBox.height - y;
      heroShot = await page.screenshot({
        type: "png",
        clip: { x: 0, y, width: 390, height: Math.min(height, 700) },
      });
    } else {
      heroShot = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 390, height: 640 },
      });
    }
    await assertPreviewAssetClean(heroShot, 390, heroBox ? Math.min(heroBox.height, 700) : 640, "Hero mobile");
    fs.writeFileSync(paths.heroMobile, heroShot);

    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await injectPreviewCaptureMode(page, false);
    await page.waitForTimeout(600);

    let ogStrategy: "hero-screenshot" | "branded-card" = "hero-screenshot";
    let ogShot: Buffer | null = null;
    try {
      ogShot = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 1200, height: 630 },
      });
      await assertPreviewAssetClean(ogShot, 1200, 630, "OG image");
      fs.writeFileSync(paths.ogPublic, ogShot);
    } catch {
      ogStrategy = "branded-card";
    }

    if (!ogShot || ogShot.length < 5000) {
      ogStrategy = "branded-card";
    }

    if (ogStrategy === "branded-card") {
      const brief = loadBrief(siteDir);
      const colors = loadDesignColors(siteDir);
      await generateBrandedOgCard(brief, colors, paths.ogPublic);
    }

    return ogStrategy;
  } finally {
    await browser.close();
  }
}

function copyOgAssets(paths: ReturnType<typeof outreachAssetPaths>): void {
  fs.mkdirSync(paths.briefOutreachDir, { recursive: true });
  if (fs.existsSync(paths.ogPublic)) {
    fs.copyFileSync(paths.ogPublic, paths.ogBrief);
  }
  const outDir = path.dirname(paths.ogOut);
  if (fs.existsSync(outDir) && fs.existsSync(paths.ogPublic)) {
    fs.copyFileSync(paths.ogPublic, paths.ogOut);
  }
}

function appendPreviewNotes(
  siteDir: string,
  meta: ReturnType<typeof buildSiteMetadata>,
  ogStrategy: string,
  paths: ReturnType<typeof outreachAssetPaths>,
  videoResult: VideoValidationResult | null,
  ratio: VideoRatio | null
): void {
  const notesPath = path.join(siteDir, "build-notes.md");
  const videoLine =
    videoResult === null
      ? "not requested"
      : videoResult.ok
        ? `${paths.scrollVideo} (${ratio}, ${videoResult.width}x${videoResult.height}, ${videoResult.durationSec.toFixed(1)}s, production preview)`
        : `failed: ${videoResult.issues.join("; ")}`;

  const block = `
## Outreach previews (${new Date().toISOString().slice(0, 10)})
- Preview mode: production static export (no next dev)
- Metadata title: ${meta.title}
- Metadata description: ${meta.description}
- OG image strategy: ${ogStrategy}
- OG public path: ${paths.ogPublic}
- Hero mobile screenshot: ${paths.heroMobile}
- OG brief copy: ${paths.ogBrief}
- Scroll video: ${videoLine}
`;
  if (fs.existsSync(notesPath)) {
    const existing = fs.readFileSync(notesPath, "utf8");
    if (!existing.includes("## Outreach previews")) {
      fs.appendFileSync(notesPath, block);
    } else {
      fs.writeFileSync(
        notesPath,
        existing.replace(/## Outreach previews[\s\S]*?(?=\n## |$)/, block.trim()) + "\n"
      );
    }
  }
}

async function main(): Promise<void> {
  const { slug: slugArg, video, ratio, videoSettings } = parseArgs();
  if (!slugArg) {
    console.error(
      "Usage: npm run preview:site -- --slug <slug> [--video] [--ratio 16:9|4:3] [--video-speed 1.0] [--hold-hero-ms 1500] [--hold-form-ms 1500]"
    );
    process.exit(1);
  }

  const lead = getLeadBySlug(slugArg);
  if (!lead?.slug) {
    console.error(`Lead not found: ${slugArg}`);
    process.exit(1);
  }

  const slug = lead.slug;
  const siteDir = path.join(ROOT, "sites", slug);
  if (!fs.existsSync(path.join(siteDir, "package.json"))) {
    console.error(`Site not found: ${siteDir}. Run build:site first.`);
    process.exit(1);
  }

  const paths = outreachAssetPaths(slug, ROOT);
  fs.mkdirSync(paths.briefOutreachDir, { recursive: true });

  const brief = loadBrief(siteDir);
  const metaPath = path.join(siteDir, "data", "site-metadata.json");
  const deployManifestPath = path.join(ROOT, "briefs", slug, "deploy.json");
  let siteUrl =
    lead.verified_site_url ??
    lead.site_url ??
    `https://${slug}.vercel.app`;
  if (fs.existsSync(deployManifestPath)) {
    const deploy = JSON.parse(fs.readFileSync(deployManifestPath, "utf8")) as {
      verified_url?: string;
    };
    if (deploy.verified_url) siteUrl = deploy.verified_url;
  }
  let meta: ReturnType<typeof buildSiteMetadata>;
  if (fs.existsSync(metaPath)) {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as ReturnType<
      typeof buildSiteMetadata
    >;
    meta.metadataBase = siteUrl.replace(/\/$/, "");
  } else {
    const { generateBuildId } = await import("./build_marker.js");
    meta = buildSiteMetadata(brief, siteUrl, generateBuildId(slug), slug);
  }

  console.log(`Generating outreach previews for ${slug}...`);
  console.log(`Title: ${meta.title}`);

  const scrollVideo = video && isScrollVideoEnabled();
  if (video && !scrollVideo) {
    console.log(
      "Scroll video skipped: site_design.scroll_video_enabled is false in config.yaml."
    );
  }

  if (scrollVideo) {
    cleanupVideoArtifacts(slug, ROOT);
  }

  let ogStrategy: "hero-screenshot" | "branded-card" = "branded-card";
  let videoResult: VideoValidationResult | null = null;

  await withPreviewServer(siteDir, async (url) => {
    ogStrategy = await captureHeroScreenshots(url, siteDir, paths);
    copyOgAssets(paths);

    if (scrollVideo) {
      const size = VIDEO_SIZES[ratio];
      console.log(
        `Recording desktop scroll video (${ratio}, ${size.width}x${size.height}, constant-speed scroll, white capture header)...`
      );
      console.log(
        `  speed=${videoSettings.videoSpeed}, hold hero=${videoSettings.holdHeroMs}ms, hold form=${videoSettings.holdFormMs}ms`
      );
      videoResult = await recordDesktopScrollVideo({
        siteDir,
        url,
        outputPath: paths.scrollVideo,
        size,
        settings: videoSettings,
      });
    }
  });

  if (scrollVideo && videoResult) {
    if (videoResult.ok) {
      console.log(`✓ Video saved: ${paths.scrollVideo}`);
      console.log(
        `  ${videoResult.width}x${videoResult.height}, ${videoResult.durationSec.toFixed(1)}s, ${videoResult.scrollModel}`
      );
      console.log(
        `  header max jump ${videoResult.maxHeaderJumpPx.toFixed(1)}px, contact form reached: ${videoResult.reachedContactForm ? "yes" : "no"}, dev indicator: ${videoResult.devIndicatorDetected ? "yes" : "no"}`
      );
    } else {
      console.error("Video quality checks failed:");
      for (const issue of videoResult.issues) console.error(`  - ${issue}`);
      process.exit(1);
    }
  }

  appendPreviewNotes(siteDir, meta, ogStrategy, paths, videoResult, scrollVideo ? ratio : null);

  console.log(`\n✓ OG image (${ogStrategy}): ${paths.ogPublic}`);
  console.log(`✓ Hero mobile: ${paths.heroMobile}`);
  console.log(`✓ OG brief copy: ${paths.ogBrief}`);
  if (fs.existsSync(paths.ogOut)) console.log(`✓ OG in out/: ${paths.ogOut}`);
  console.log("\nNo outreach sent. Preview assets only (production mode).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
