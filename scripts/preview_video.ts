import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { chromium, type Page } from "playwright";
import sharp from "sharp";
import {
  assertPreviewAssetClean,
  imageHasBottomLeftDevBadge,
  injectPreviewCaptureMode,
  pageHasDevIndicators,
} from "./preview_capture.js";

export type VideoRatio = "16:9" | "4:3";

export interface VideoSize {
  width: number;
  height: number;
  ratio: VideoRatio;
}

export const VIDEO_SIZES: Record<VideoRatio, VideoSize> = {
  "16:9": { width: 1280, height: 720, ratio: "16:9" },
  "4:3": { width: 1024, height: 768, ratio: "4:3" },
};

/** Desktop scroll-through preview (1280 x 800). */
export const SCROLL_PREVIEW_DESKTOP: VideoSize = {
  width: 1280,
  height: 800,
  ratio: "16:9",
};

/** Mobile scroll-through preview (390 x 844). */
export const SCROLL_PREVIEW_MOBILE: VideoSize = {
  width: 390,
  height: 844,
  ratio: "16:9",
};

export const REVIEW_SELECTORS = {
  header: '[data-review="header"], header.site-header, #site-header',
  hero: '[data-review="hero"], #hero, #top, section.hero',
  quote: '#quote, [data-review="contact"], #contact, [data-od-id="quote"]',
} as const;

export interface VideoCaptureSettings {
  holdHeroMs: number;
  holdFormMs: number;
  /** 1.0 default. Lower = slower scroll, higher = faster. */
  videoSpeed: number;
  /** Base constant scroll speed in px/s before videoSpeed multiplier. */
  baseScrollPxPerSec: number;
}

export const DEFAULT_VIDEO_CAPTURE: VideoCaptureSettings = {
  holdHeroMs: 1500,
  holdFormMs: 1500,
  videoSpeed: 1.0,
  baseScrollPxPerSec: 380,
};

const FPS = 30;
const PREFLIGHT_RETRIES = 8;
const PREFLIGHT_RETRY_MS = 500;
const SETTLE_MS = 750;
const BLANK_MEAN_THRESHOLD = 248;
const MIN_DURATION_SEC = 8;
const MAX_DURATION_SEC = 20;
const MAX_SCROLL_PHASE_MS = 15_000;
const MAX_HEADER_JUMP_PX = 2;

export function ffmpegBin(): string {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  const candidates = ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "ffmpeg"];
  for (const c of candidates) {
    if (c === "ffmpeg") return c;
    try {
      if (fs.existsSync(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return "ffmpeg";
}

export function ffprobeBin(): string {
  if (process.env.FFPROBE) return process.env.FFPROBE;
  const ff = ffmpegBin();
  if (ff.endsWith("ffmpeg")) return ff.replace(/ffmpeg$/, "ffprobe");
  return "/opt/homebrew/bin/ffprobe";
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function parseVideoRatio(raw?: string): VideoRatio {
  if (raw === "4:3") return "4:3";
  return "16:9";
}

export function parseVideoSpeed(raw?: string): number {
  if (!raw) return DEFAULT_VIDEO_CAPTURE.videoSpeed;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_VIDEO_CAPTURE.videoSpeed;
  return Math.min(1.5, Math.max(0.5, n));
}

export function parseHoldMs(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(4000, Math.max(500, Math.round(n)));
}

export async function bufferMostlyBlank(png: Buffer): Promise<boolean> {
  const { channels } = await sharp(png).stats();
  const mean =
    channels.slice(0, 3).reduce((sum, c) => sum + c.mean, 0) / Math.min(3, channels.length);
  return mean >= BLANK_MEAN_THRESHOLD;
}

async function injectVideoCaptureMode(page: Page): Promise<void> {
  await injectPreviewCaptureMode(page, true);
  const hasDev = await pageHasDevIndicators(page);
  if (hasDev) {
    throw new Error(
      "Next.js dev indicators still present during video capture. Use production preview server."
    );
  }
}

async function scrollToInteger(page: Page, y: number): Promise<void> {
  const top = Math.round(y);
  await page.evaluate((scrollTop) => {
    window.scrollTo(0, scrollTop);
  }, top);
}

async function waitForFrameSettle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      })
  );
  await sleep(16);
}

async function headerTopPx(page: Page): Promise<number> {
  return page.evaluate((sel) => {
    const header = document.querySelector(sel);
    if (!header) return 0;
    return header.getBoundingClientRect().top;
  }, REVIEW_SELECTORS.header);
}

async function waitForPageReady(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.locator(REVIEW_SELECTORS.header).first().waitFor({ state: "visible" });
  await page.locator(REVIEW_SELECTORS.hero).first().waitFor({ state: "visible" });
  await page.waitForFunction(
    (heroSel) => {
      const hero = document.querySelector(heroSel);
      if (!hero) return false;
      const rect = hero.getBoundingClientRect();
      const style = getComputedStyle(document.body);
      const bg = style.backgroundColor;
      const hasBg = bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
      return rect.height > 80 && hasBg;
    },
    REVIEW_SELECTORS.hero
  );
  await page
    .waitForFunction(async () => {
      const imgs = Array.from(document.querySelectorAll("img"));
      await Promise.all(
        imgs.slice(0, 20).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.addEventListener("load", () => resolve(), { once: true });
                img.addEventListener("error", () => resolve(), { once: true });
              })
        )
      );
      return true;
    })
    .catch(() => {});
  await injectVideoCaptureMode(page);
  await sleep(SETTLE_MS);
}

async function preloadScrollPath(page: Page, maxScroll: number): Promise<void> {
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    await scrollToInteger(page, (maxScroll * i) / steps);
    await waitForFrameSettle(page);
  }
  await scrollToInteger(page, 0);
  await waitForFrameSettle(page);
  await sleep(400);
}

async function preflightScreenshot(page: Page): Promise<Buffer> {
  for (let attempt = 1; attempt <= PREFLIGHT_RETRIES; attempt++) {
    await scrollToInteger(page, 0);
    await waitForFrameSettle(page);
    const shot = await page.screenshot({ type: "png" });
    if (!(await bufferMostlyBlank(shot))) {
      return shot;
    }
    await sleep(PREFLIGHT_RETRY_MS);
  }
  throw new Error(
    "Video preflight failed: page still blank after fonts, hero, and image load waits"
  );
}

async function measureContactScrollTarget(
  page: Page,
  mode: "quote" | "full" = "quote"
): Promise<number> {
  return page.evaluate(
    ({ quoteSel, mode: scrollMode }) => {
      const max = Math.max(0, document.body.scrollHeight - window.innerHeight);
      if (scrollMode === "full") return max;
      const contact = document.querySelector(quoteSel);
      const form = document.querySelector(`${quoteSel} form`);
      const anchor = form ?? contact;
      if (!anchor) return max;
      const rect = anchor.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const target = Math.round(top - 80);
      return Math.max(0, Math.min(max, target));
    },
    { quoteSel: REVIEW_SELECTORS.quote, mode }
  );
}

interface ConstantScrollTimeline {
  totalFrames: number;
  durationMs: number;
  targetScrollY: number;
  scrollYAtFrame: (frame: number) => number;
}

function buildConstantScrollTimeline(
  targetScrollY: number,
  settings: VideoCaptureSettings,
  maxScrollPhaseMs = MAX_SCROLL_PHASE_MS
): ConstantScrollTimeline {
  const requestedPxPerSec = settings.baseScrollPxPerSec * settings.videoSpeed;
  let scrollDurationMs =
    targetScrollY > 0 ? (targetScrollY / requestedPxPerSec) * 1000 : 0;

  if (scrollDurationMs > maxScrollPhaseMs) {
    scrollDurationMs = maxScrollPhaseMs;
  }

  const effectivePxPerSec =
    scrollDurationMs > 0 ? targetScrollY / (scrollDurationMs / 1000) : requestedPxPerSec;

  const durationMs = settings.holdHeroMs + scrollDurationMs + settings.holdFormMs;
  const totalFrames = Math.max(1, Math.round((durationMs / 1000) * FPS));

  const scrollStartMs = settings.holdHeroMs;
  const scrollEndMs = settings.holdHeroMs + scrollDurationMs;

  function scrollYAtTime(tMs: number): number {
    if (tMs <= scrollStartMs) return 0;
    if (tMs >= scrollEndMs) return targetScrollY;
    const elapsedSec = (tMs - scrollStartMs) / 1000;
    return Math.min(targetScrollY, Math.round(elapsedSec * effectivePxPerSec));
  }

  return {
    totalFrames,
    durationMs,
    targetScrollY,
    scrollYAtFrame: (frame) => scrollYAtTime((frame / FPS) * 1000),
  };
}

function encodeFrames(framesDir: string, outputPath: string, frameCount: number): void {
  const pattern = path.join(framesDir, "frame_%05d.png");
  const ffmpeg = ffmpegBin();
  execSync(
    [
      `"${ffmpeg}" -y`,
      `-framerate ${FPS}`,
      `-i "${pattern}"`,
      "-f lavfi",
      "-i anullsrc=channel_layout=stereo:sample_rate=48000",
      "-frames:v",
      String(frameCount),
      "-c:v libx264",
      "-crf 22",
      "-pix_fmt yuv420p",
      "-c:a aac",
      "-b:a 128k",
      "-shortest",
      "-movflags +faststart",
      `"${outputPath}"`,
    ].join(" "),
    { stdio: "pipe" }
  );
}

export function encodeFramesWebm(
  framesDir: string,
  outputPath: string,
  frameCount: number
): void {
  const pattern = path.join(framesDir, "frame_%05d.png");
  const ffmpeg = ffmpegBin();
  execSync(
    [
      `"${ffmpeg}" -y`,
      `-framerate ${FPS}`,
      `-i "${pattern}"`,
      "-frames:v",
      String(frameCount),
      "-c:v libvpx-vp9",
      "-crf 32",
      "-b:v 0",
      "-an",
      `"${outputPath}"`,
    ].join(" "),
    { stdio: "pipe" }
  );
}

function extractFrame(videoPath: string, outPath: string, timeSec: number): void {
  execSync(
    `"${ffmpegBin()}" -y -ss ${timeSec} -i "${videoPath}" -vframes 1 -q:v 2 "${outPath}"`,
    { stdio: "pipe" }
  );
}

function probeVideo(videoPath: string): {
  width: number;
  height: number;
  duration: number;
} {
  const raw = execSync(
    `"${ffprobeBin()}" -v error -select_streams v:0 -show_entries stream=width,height -show_entries format=duration -of json "${videoPath}"`,
    { encoding: "utf8" }
  );
  const data = JSON.parse(raw) as {
    streams?: { width?: number; height?: number }[];
    format?: { duration?: string };
  };
  const stream = data.streams?.[0];
  return {
    width: stream?.width ?? 0,
    height: stream?.height ?? 0,
    duration: Number(data.format?.duration ?? 0),
  };
}

export interface VideoValidationResult {
  ok: boolean;
  issues: string[];
  width: number;
  height: number;
  durationSec: number;
  firstFrameBlank: boolean;
  earlyFrameBlank: boolean;
  reachedContactForm: boolean;
  maxHeaderJumpPx: number;
  scrollModel: string;
  devIndicatorDetected: boolean;
}

export async function validateScrollVideo(
  videoPath: string,
  expected: VideoSize,
  captureMeta?: {
    targetScrollY: number;
    maxHeaderJumpPx: number;
    scrollModel: string;
    minDurationSec?: number;
    maxDurationSec?: number;
  }
): Promise<VideoValidationResult> {
  const issues: string[] = [];
  const scrollModel =
    captureMeta?.scrollModel ?? "hero hold plus constant-speed scroll to quote form";

  if (!fs.existsSync(videoPath)) {
    return {
      ok: false,
      issues: ["Video file missing"],
      width: 0,
      height: 0,
      durationSec: 0,
      firstFrameBlank: true,
      earlyFrameBlank: true,
      reachedContactForm: false,
      maxHeaderJumpPx: captureMeta?.maxHeaderJumpPx ?? 0,
      scrollModel,
      devIndicatorDetected: false,
    };
  }

  const fileSize = fs.statSync(videoPath).size;
  if (fileSize < 50_000) {
    issues.push(`Video file suspiciously small (${fileSize} bytes)`);
  }

  let width = 0;
  let height = 0;
  let durationSec = 0;
  try {
    const probe = probeVideo(videoPath);
    width = probe.width;
    height = probe.height;
    durationSec = probe.duration;
  } catch {
    issues.push("ffprobe could not read video metadata");
  }

  if (width !== expected.width || height !== expected.height) {
    issues.push(
      `Video resolution ${width}x${height} does not match expected ${expected.width}x${expected.height} (${expected.ratio})`
    );
  }
  if (durationSec < (captureMeta?.minDurationSec ?? MIN_DURATION_SEC)) {
    issues.push(
      `Video duration ${durationSec.toFixed(1)}s is shorter than ${captureMeta?.minDurationSec ?? MIN_DURATION_SEC}s`
    );
  }
  if (durationSec > (captureMeta?.maxDurationSec ?? MAX_DURATION_SEC)) {
    issues.push(
      `Video duration ${durationSec.toFixed(1)}s is longer than ${captureMeta?.maxDurationSec ?? MAX_DURATION_SEC}s`
    );
  }

  const maxHeaderJumpPx = captureMeta?.maxHeaderJumpPx ?? 0;
  if (maxHeaderJumpPx > MAX_HEADER_JUMP_PX) {
    issues.push(
      `Sticky header jumped up to ${maxHeaderJumpPx.toFixed(1)}px between frames during scroll`
    );
  }

  const reachedContactForm = (captureMeta?.targetScrollY ?? 0) > 0;
  if (!reachedContactForm) {
    issues.push("Video scroll target did not reach the quote/contact form");
  }

  const tmpDir = path.join(path.dirname(videoPath), ".video-check");
  fs.mkdirSync(tmpDir, { recursive: true });
  const firstFrame = path.join(tmpDir, "first.jpg");
  const earlyFrame = path.join(tmpDir, "early.jpg");
  const midFrame = path.join(tmpDir, "mid.jpg");
  const lastFrame = path.join(tmpDir, "last.jpg");

  let firstFrameBlank = true;
  let earlyFrameBlank = true;
  let devIndicatorDetected = false;

  try {
    const midTime = durationSec > 0 ? durationSec * 0.5 : 1.0;
    const lastTime = durationSec > 0.2 ? durationSec - 0.05 : 0.1;
    extractFrame(videoPath, firstFrame, 0.05);
    extractFrame(videoPath, earlyFrame, 1.0);
    extractFrame(videoPath, midFrame, midTime);
    extractFrame(videoPath, lastFrame, lastTime);
    const firstBuf = await fs.promises.readFile(firstFrame);
    const earlyBuf = await fs.promises.readFile(earlyFrame);
    const midBuf = await fs.promises.readFile(midFrame);
    const lastBuf = await fs.promises.readFile(lastFrame);
    firstFrameBlank = await bufferMostlyBlank(firstBuf);
    earlyFrameBlank = await bufferMostlyBlank(earlyBuf);
    devIndicatorDetected =
      (await imageHasBottomLeftDevBadge(firstBuf, width, height)) ||
      (await imageHasBottomLeftDevBadge(earlyBuf, width, height));
    if (firstFrameBlank) issues.push("First video frame is mostly blank or white");
    if (earlyFrameBlank) issues.push("Frame at ~1s is mostly blank or white");
    if (devIndicatorDetected) {
      issues.push("Next.js dev indicator detected in video frames");
    }
  } catch {
    issues.push("Could not extract frames for blank check");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  return {
    ok: issues.length === 0,
    issues,
    width,
    height,
    durationSec,
    firstFrameBlank,
    earlyFrameBlank,
    reachedContactForm,
    maxHeaderJumpPx,
    scrollModel,
    devIndicatorDetected,
  };
}

export interface RecordVideoOptions {
  siteDir: string;
  url: string;
  outputPath: string;
  size: VideoSize;
  settings?: Partial<VideoCaptureSettings>;
  /** Scroll to full page bottom (footer) or stop at quote section. */
  scrollTarget?: "quote" | "full";
  /** Also write VP9 webm alongside mp4 when outputPath ends with .mp4 */
  webmPath?: string;
  /** Save first captured frame as JPEG poster */
  posterPath?: string;
  minDurationSec?: number;
  maxDurationSec?: number;
}

export async function recordDesktopScrollVideo(
  options: RecordVideoOptions
): Promise<VideoValidationResult> {
  const { siteDir, url, outputPath, size } = options;
  const settings: VideoCaptureSettings = {
    ...DEFAULT_VIDEO_CAPTURE,
    ...options.settings,
  };

  const framesDir = path.join(siteDir, ".preview-video-frames");
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  let maxHeaderJumpPx = 0;
  let lastHeaderTop = 0;
  let targetScrollY = 0;
  const scrollModel = `hero hold ${settings.holdHeroMs}ms, constant scroll to quote form, hold ${settings.holdFormMs}ms`;

  try {
    await waitForPageReady(page, url);

    const maxScroll = await page.evaluate(() =>
      Math.max(0, document.body.scrollHeight - window.innerHeight)
    );
    await preloadScrollPath(page, maxScroll);
    await preflightScreenshot(page);

    targetScrollY = await measureContactScrollTarget(
      page,
      options.scrollTarget ?? "quote"
    );
    const maxScrollPhaseMs =
      options.maxDurationSec !== undefined
        ? Math.max(
            1000,
            options.maxDurationSec * 1000 - settings.holdHeroMs - settings.holdFormMs
          )
        : MAX_SCROLL_PHASE_MS;
    const timeline = buildConstantScrollTimeline(
      targetScrollY,
      settings,
      maxScrollPhaseMs
    );

    for (let frame = 0; frame < timeline.totalFrames; frame++) {
      const y = timeline.scrollYAtFrame(frame);
      await scrollToInteger(page, y);
      await waitForFrameSettle(page);

      const headerTop = await headerTopPx(page);
      if (frame > 0) {
        maxHeaderJumpPx = Math.max(maxHeaderJumpPx, Math.abs(headerTop - lastHeaderTop));
      }
      lastHeaderTop = headerTop;

      const framePath = path.join(framesDir, `frame_${String(frame).padStart(5, "0")}.png`);
      await page.screenshot({ path: framePath, type: "png" });

      if (frame === 0 && options.posterPath) {
        fs.mkdirSync(path.dirname(options.posterPath), { recursive: true });
        await sharp(await fs.promises.readFile(framePath))
          .jpeg({ quality: 90, mozjpeg: true })
          .toFile(options.posterPath);
      }
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    encodeFrames(framesDir, outputPath, timeline.totalFrames);
    if (options.webmPath) {
      fs.mkdirSync(path.dirname(options.webmPath), { recursive: true });
      encodeFramesWebm(framesDir, options.webmPath, timeline.totalFrames);
    }
  } finally {
    await context.close();
    await browser.close();
    fs.rmSync(framesDir, { recursive: true, force: true });
  }

  return validateScrollVideo(outputPath, size, {
    targetScrollY,
    maxHeaderJumpPx,
    scrollModel,
    minDurationSec: options.minDurationSec,
    maxDurationSec: options.maxDurationSec,
  });
}

export function cleanupVideoArtifacts(slug: string, root: string): void {
  const paths = [
    `${root}/briefs/${slug}/outreach/site-scroll.mp4`,
    `${root}/sites/${slug}/.preview-video`,
    `${root}/sites/${slug}/.preview-video-frames`,
  ];
  for (const p of paths) {
    fs.rmSync(p, { recursive: true, force: true });
  }
}
