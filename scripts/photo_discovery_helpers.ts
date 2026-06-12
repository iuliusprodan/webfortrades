import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";
import {
  facebookPhotoUrlVariants,
  isLikelyTrackingPixel,
  upscaleFacebookCdnUrl,
} from "./image_utils.js";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface ImageDownloadFailure {
  url: string;
  reason: string;
}

export interface FacebookImageDownloadStats {
  images_found: number;
  images_attempted: number;
  images_downloaded: number;
  images_rejected: number;
  failures: ImageDownloadFailure[];
}

export interface DownloadedImage {
  width: number;
  height: number;
  hash: string;
  source_url: string;
  method: "http" | "playwright";
}

async function imageHash(buffer: Buffer): Promise<string> {
  const thumb = await sharp(buffer).resize(32, 32, { fit: "cover" }).greyscale().raw().toBuffer();
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(thumb).digest("hex");
}

function rejectReasonFromMeta(
  contentType: string | null,
  width: number,
  height: number,
  minWidth: number
): string | null {
  if (contentType && !contentType.startsWith("image/")) {
    return `not_image_content_type:${contentType}`;
  }
  if (width === 0 || height === 0) return "invalid_dimensions";
  if (isLikelyTrackingPixel(width, height)) return "tracking_pixel";
  if (width < minWidth) return `too_small:${width}x${height}`;
  return null;
}

async function tryHttpDownload(
  sourceUrl: string,
  referer: string,
  minWidth: number
): Promise<{ buffer: Buffer; width: number; height: number } | { error: string }> {
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Referer: referer,
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(25000),
      redirect: "follow",
    });
    if (!res.ok) return { error: `http_${res.status}` };
    const contentType = res.headers.get("content-type");
    const raw = Buffer.from(await res.arrayBuffer());
    if (raw.length < 200) return { error: "body_too_small" };

    let meta: sharp.Metadata;
    try {
      meta = await sharp(raw).metadata();
    } catch {
      return { error: "not_decodable_image" };
    }
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const reject = rejectReasonFromMeta(contentType, w, h, minWidth);
    if (reject) return { error: reject };
    return { buffer: raw, width: w, height: h };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "fetch_error" };
  }
}

async function tryPlaywrightDownload(
  imageUrl: string,
  pageUrl: string,
  minWidth: number
): Promise<{ buffer: Buffer; width: number; height: number } | { error: string }> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => null);

    const response = await context.request.get(imageUrl, {
      headers: { Referer: pageUrl, Accept: "image/*" },
      timeout: 25000,
    });
    if (!response.ok()) return { error: `playwright_http_${response.status()}` };

    const contentType = response.headers()["content-type"] ?? null;
    const raw = Buffer.from(await response.body());
    if (raw.length < 200) return { error: "playwright_body_too_small" };

    const meta = await sharp(raw).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const reject = rejectReasonFromMeta(contentType, w, h, minWidth);
    if (reject) return { error: `playwright_${reject}` };
    return { buffer: raw, width: w, height: h };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "playwright_error" };
  } finally {
    await browser.close();
  }
}

export async function downloadFacebookImageWithRetry(input: {
  sourceUrl: string;
  outPath: string;
  minWidth: number;
  refererPageUrl: string;
  allowPlaywright?: boolean;
}): Promise<DownloadedImage | null> {
  const variants = facebookPhotoUrlVariants(input.sourceUrl);
  const errors: string[] = [];

  for (const url of variants) {
    const http = await tryHttpDownload(url, input.refererPageUrl, input.minWidth);
    if ("buffer" in http) {
      fs.mkdirSync(path.dirname(input.outPath), { recursive: true });
      await sharp(http.buffer).webp({ quality: 85 }).toFile(input.outPath);
      const hash = await imageHash(http.buffer);
      return { width: http.width, height: http.height, hash, source_url: url, method: "http" };
    }
    errors.push(`${url.slice(0, 80)}: ${http.error}`);
  }

  if (input.allowPlaywright !== false) {
    for (const url of [upscaleFacebookCdnUrl(input.sourceUrl), input.sourceUrl]) {
      const pw = await tryPlaywrightDownload(url, input.refererPageUrl, input.minWidth);
      if ("buffer" in pw) {
        fs.mkdirSync(path.dirname(input.outPath), { recursive: true });
        await sharp(pw.buffer).webp({ quality: 85 }).toFile(input.outPath);
        const hash = await imageHash(pw.buffer);
        return { width: pw.width, height: pw.height, hash, source_url: url, method: "playwright" };
      }
      errors.push(`pw:${url.slice(0, 60)}: ${pw.error}`);
    }
  }

  return null;
}

export async function downloadFacebookImagesBatch(input: {
  urls: string[];
  outDir: string;
  minWidth: number;
  refererPageUrl: string;
  maxPhotos?: number;
  seenHashes?: Set<string>;
}): Promise<{ downloads: DownloadedImage[]; stats: FacebookImageDownloadStats }> {
  const stats: FacebookImageDownloadStats = {
    images_found: input.urls.length,
    images_attempted: 0,
    images_downloaded: 0,
    images_rejected: 0,
    failures: [],
  };
  const downloads: DownloadedImage[] = [];
  const seen = input.seenHashes ?? new Set<string>();
  const max = input.maxPhotos ?? 18;

  let seq = 1;
  for (const rawUrl of input.urls.slice(0, max + 5)) {
    if (downloads.length >= max) break;
    stats.images_attempted++;

    const out = path.join(input.outDir, `${String(seq).padStart(2, "0")}-facebook.webp`);
    const result = await downloadFacebookImageWithRetry({
      sourceUrl: rawUrl,
      outPath: out,
      minWidth: input.minWidth,
      refererPageUrl: input.refererPageUrl,
    });

    if (!result) {
      stats.images_rejected++;
      stats.failures.push({
        url: rawUrl.slice(0, 120),
        reason: "all_variants_failed",
      });
      continue;
    }

    if (seen.has(result.hash)) {
      stats.images_rejected++;
      stats.failures.push({ url: rawUrl.slice(0, 120), reason: "duplicate_hash" });
      if (fs.existsSync(out)) fs.unlinkSync(out);
      continue;
    }

    seen.add(result.hash);
    stats.images_downloaded++;
    downloads.push(result);
    seq++;
    await new Promise((r) => setTimeout(r, 120));
  }

  return { downloads, stats };
}

export function dedupeByHash<T extends { hash: string; source_url: string }>(photos: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const p of photos) {
    const key = p.hash || p.source_url.split("?")[0]!;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}
