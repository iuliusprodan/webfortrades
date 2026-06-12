/**
 * Optional Apify Facebook image extraction via official REST API.
 * Pipeline uses direct API (not MCP). MCP is for Cursor manual testing only.
 * Never uses personal Facebook login, cookies, or logged-in browser scraping.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { briefDir } from "./site_config.js";
import { cleanFacebookImageUrl, upscaleFacebookCdnUrl } from "./image_utils.js";
import {
  MIN_FACEBOOK_GALLERY_WIDTH,
  PREFERRED_FACEBOOK_GALLERY_WIDTH,
} from "./facebook_graph.js";
import type { FacebookAssetMeta } from "./facebook_source.js";

export const APIFY_POSTS_COST_PER_1000 = 2.0;
export const APIFY_PHOTOS_COST_PER_1000 = 1.1;
export const GALLERY_PREFERRED_WIDTH = 800;
export const HERO_MIN_WIDTH = 1000;
export const APIFY_BENCHMARK_MAX_ITEMS = 20;
export const APIFY_EARLY_STOP_SAVED_OVER = 800;
export const APIFY_EARLY_STOP_COUNT = 5;

export interface ApifyConfig {
  token: string | null;
  postsActor: string;
  photosActor: string | null;
  pagePhotosActor: string | null;
  altPhotosActor: string | null;
  pagesActor: string;
  configured: boolean;
}

export interface ApifyFacebookImage {
  url: string;
  width: number | null;
  height: number | null;
  post_url?: string | null;
  photo_url?: string | null;
  actor: string;
  source_field: string;
  storage_key?: string | null;
  apify_record_url?: string | null;
}

export interface FacebookApifyEvidence {
  attempted: boolean;
  success: boolean;
  actor: string | null;
  photos_found: number;
  photos_downloaded: number;
  largest_width: number | null;
  largest_height: number | null;
  failure_reason: string | null;
  cost_estimate: string | null;
  requires_login: boolean;
  via_mcp: boolean;
}

export interface ApifyRunSummary {
  run_id: string | null;
  dataset_id: string | null;
  key_value_store_id: string | null;
  status: string | null;
  item_count: number;
  actor: string;
}

export interface ApifyImageQuality {
  gallery_ready: boolean;
  hero_ready: boolean;
  preferred_gallery: boolean;
  largest_width: number | null;
  code:
    | "HIGH_RES"
    | "MEDIUM_RES"
    | "LOW_RES"
    | "APIFY_POSTS_IMAGES_TOO_SMALL"
    | "UNSUITABLE_REQUIRES_LOGIN"
    | "FBCDN_DOWNLOAD_BLOCKED"
    | null;
}

export interface ApifyActorBenchmarkResult {
  actor_id: string;
  attempted: boolean;
  success: boolean;
  accepts_page_url: boolean;
  page_id_required: boolean;
  requires_login: boolean;
  uses_apify_storage: boolean;
  images_found: number;
  images_downloaded: number;
  largest_metadata_width: number | null;
  largest_saved_width: number | null;
  count_gte_600: number;
  count_gte_800: number;
  count_gte_1000: number;
  cost_estimate: string | null;
  failure_reason: string | null;
  saved_paths: string[];
  quality: ApifyImageQuality;
}

export interface DownloadedApifyImage {
  buffer: Buffer;
  width: number;
  height: number;
  source: "apify_kv" | "direct_url" | "apify_record";
  url?: string;
  storage_key?: string;
}

interface ApifyActorRunResponse {
  data?: {
    id?: string;
    status?: string;
    defaultDatasetId?: string;
    defaultKeyValueStoreId?: string;
  };
}

type UnknownRecord = Record<string, unknown>;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function getApifyConfig(): ApifyConfig {
  const token = process.env.APIFY_TOKEN?.trim() || null;
  return {
    token,
    postsActor: process.env.APIFY_FACEBOOK_POSTS_ACTOR?.trim() || "apify/facebook-posts-scraper",
    photosActor: process.env.APIFY_FACEBOOK_PHOTOS_ACTOR?.trim() || "apify/facebook-photos-scraper",
    pagePhotosActor:
      process.env.APIFY_FACEBOOK_PAGE_PHOTOS_ACTOR?.trim() || "igview-owner/facebook-page-photos-downloader",
    altPhotosActor: process.env.APIFY_FACEBOOK_ALT_PHOTOS_ACTOR?.trim() || "simpleapi/facebook-photos-scraper",
    pagesActor: process.env.APIFY_FACEBOOK_PAGES_ACTOR?.trim() || "apify/facebook-pages-scraper",
    configured: Boolean(token),
  };
}

export function isApifyConfigured(): boolean {
  return getApifyConfig().configured;
}

export function normalizeApifyActorId(actor: string): string {
  return actor.replace(/\//g, "~");
}

export function estimateApifyCost(actor: string, itemCount: number): string {
  const rate = actor.includes("posts") ? APIFY_POSTS_COST_PER_1000 : APIFY_PHOTOS_COST_PER_1000;
  const usd = (itemCount / 1000) * rate;
  return `~$${usd.toFixed(3)} USD (${itemCount} items @ $${rate}/1000)`;
}

export function formatApifyStatusForLog(evidence: FacebookApifyEvidence, configured: boolean): string {
  if (!configured) return "Apify: not configured (set APIFY_TOKEN in .env for high-res Facebook fallback)";
  if (!evidence.attempted) return "Apify: skipped";
  if (evidence.requires_login) return "Apify: UNSUITABLE_REQUIRES_LOGIN";
  if (evidence.success) {
    return `Apify (${evidence.actor}): ${evidence.photos_downloaded}/${evidence.photos_found} photos (max ${evidence.largest_width ?? 0}px) ${evidence.cost_estimate ?? ""}`.trim();
  }
  return `Apify failed: ${evidence.failure_reason ?? "unknown"} (fallback to public HTML)`;
}

export function classifyApifyImageQuality(
  largestWidth: number | null,
  actor?: string,
  options?: { metadataOnly?: boolean; downloadBlocked?: boolean; requiresLogin?: boolean }
): ApifyImageQuality {
  const w = largestWidth ?? 0;
  if (options?.requiresLogin) {
    return {
      gallery_ready: false,
      hero_ready: false,
      preferred_gallery: false,
      largest_width: largestWidth,
      code: "UNSUITABLE_REQUIRES_LOGIN",
    };
  }
  if (options?.downloadBlocked && w > 0 && w < MIN_FACEBOOK_GALLERY_WIDTH) {
    return {
      gallery_ready: false,
      hero_ready: false,
      preferred_gallery: false,
      largest_width: largestWidth,
      code: "FBCDN_DOWNLOAD_BLOCKED",
    };
  }
  if (actor?.includes("posts") && w > 0 && w < MIN_FACEBOOK_GALLERY_WIDTH) {
    return {
      gallery_ready: false,
      hero_ready: false,
      preferred_gallery: false,
      largest_width: largestWidth,
      code: "APIFY_POSTS_IMAGES_TOO_SMALL",
    };
  }
  if (w >= HERO_MIN_WIDTH) {
    return { gallery_ready: true, hero_ready: true, preferred_gallery: true, largest_width: largestWidth, code: "HIGH_RES" };
  }
  if (w >= GALLERY_PREFERRED_WIDTH) {
    return { gallery_ready: true, hero_ready: false, preferred_gallery: true, largest_width: largestWidth, code: "HIGH_RES" };
  }
  if (w >= MIN_FACEBOOK_GALLERY_WIDTH) {
    return { gallery_ready: true, hero_ready: false, preferred_gallery: false, largest_width: largestWidth, code: "MEDIUM_RES" };
  }
  return { gallery_ready: false, hero_ready: false, preferred_gallery: false, largest_width: largestWidth, code: "LOW_RES" };
}

function isLogoOrProfileUrl(url: string): boolean {
  return /profile|avatar|s50x50|s60x60|s100x100|static\.xx\.fbcdn\.net\/rsrc\.php/i.test(url);
}

function asRecord(v: unknown): UnknownRecord | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as UnknownRecord) : null;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

/** Defensive normalization across heterogeneous Apify actor outputs. */
export function normalizeCommonFacebookImageFields(items: unknown[], actor: string): ApifyFacebookImage[] {
  const images: ApifyFacebookImage[] = [];
  const seen = new Set<string>();

  function add(img: ApifyFacebookImage): void {
    const key = img.storage_key ?? img.apify_record_url ?? img.url.split("?")[0] ?? "";
    if (!key || seen.has(key)) return;
    if (img.url && isLogoOrProfileUrl(img.url)) return;
    seen.add(key);
    images.push(img);
  }

  for (const raw of items) {
    for (const img of normalizeApifyFacebookImages([raw], actor)) add(img);
    const rec = asRecord(raw);
    if (!rec) continue;

    for (const field of [
      "imageUrl",
      "image_url",
      "photoUrl",
      "photo_url",
      "downloadUrl",
      "download_url",
      "fileUrl",
      "file_url",
      "src",
    ]) {
      const val = rec[field];
      if (typeof val !== "string") continue;
      add({
        url: val.startsWith("http") ? upscaleFacebookCdnUrl(val) : val,
        width: typeof rec.width === "number" ? rec.width : null,
        height: typeof rec.height === "number" ? rec.height : null,
        actor,
        source_field: field,
        apify_record_url: val.includes("api.apify.com") ? val : null,
        photo_url: typeof rec.url === "string" ? rec.url : null,
      });
    }

    if (typeof rec.storageKey === "string" || typeof rec.key === "string") {
      add({
        url: typeof rec.downloadUrl === "string" ? rec.downloadUrl : "",
        width: typeof rec.width === "number" ? rec.width : null,
        height: typeof rec.height === "number" ? rec.height : null,
        actor,
        source_field: "storageKey",
        storage_key: (rec.storageKey as string) ?? (rec.key as string),
        apify_record_url: typeof rec.downloadUrl === "string" ? rec.downloadUrl : null,
      });
    }

    for (const field of ["images", "photos", "attachments"]) {
      for (const entry of asArray(rec[field])) {
        if (typeof entry === "string") {
          add({
            url: upscaleFacebookCdnUrl(entry),
            width: null,
            height: null,
            actor,
            source_field: field,
          });
        } else {
          for (const nested of normalizeCommonFacebookImageFields([entry], actor)) add(nested);
        }
      }
    }
  }

  return images;
}

export function selectBestApifyImages(images: ApifyFacebookImage[]): ApifyFacebookImage[] {
  const byUrl = new Map<string, ApifyFacebookImage>();
  for (const img of images) {
    const key = img.storage_key ?? img.apify_record_url ?? img.url.split("?")[0]!;
    if (!img.url && !img.storage_key && !img.apify_record_url) continue;
    const clean = img.url ? cleanFacebookImageUrl(img.url) : img.url;
    if (clean && isLogoOrProfileUrl(clean)) continue;
    const existing = byUrl.get(key);
    const area = (img.width ?? 0) * (img.height ?? 0);
    const existingArea = (existing?.width ?? 0) * (existing?.height ?? 0);
    if (!existing || area > existingArea) {
      byUrl.set(key, { ...img, url: clean || img.url });
    }
  }
  const sorted = [...byUrl.values()].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const hasLarge = sorted.some((i) => (i.width ?? 0) >= MIN_FACEBOOK_GALLERY_WIDTH);
  if (hasLarge) {
    return sorted.filter((i) => (i.width ?? 0) >= MIN_FACEBOOK_GALLERY_WIDTH || (i.width ?? 0) === 0);
  }
  return sorted;
}

function readMediaImages(post: UnknownRecord, actor: string): ApifyFacebookImage[] {
  const out: ApifyFacebookImage[] = [];
  const postUrl = typeof post.url === "string" ? post.url : null;
  for (const raw of asArray(post.media)) {
    const media = asRecord(raw);
    if (!media) continue;
    const photoImage = asRecord(media.photo_image);
    const uri = typeof photoImage?.uri === "string" ? photoImage.uri : null;
    const thumb = typeof media.thumbnail === "string" ? media.thumbnail : null;
    const photoUrl = typeof media.url === "string" ? media.url : null;
    if (uri && !isLogoOrProfileUrl(uri)) {
      out.push({
        url: upscaleFacebookCdnUrl(uri),
        width: typeof photoImage?.width === "number" ? photoImage.width : null,
        height: typeof photoImage?.height === "number" ? photoImage.height : null,
        post_url: postUrl,
        photo_url: photoUrl,
        actor,
        source_field: "media.photo_image.uri",
      });
    } else if (thumb && !isLogoOrProfileUrl(thumb)) {
      out.push({
        url: upscaleFacebookCdnUrl(thumb),
        width: null,
        height: null,
        post_url: postUrl,
        photo_url: photoUrl,
        actor,
        source_field: "media.thumbnail",
      });
    }
  }
  const legacyFull = typeof post.fullPicture === "string" ? post.fullPicture : null;
  if (legacyFull && !isLogoOrProfileUrl(legacyFull)) {
    out.push({
      url: upscaleFacebookCdnUrl(legacyFull),
      width: null,
      height: null,
      post_url: postUrl,
      photo_url: null,
      actor,
      source_field: "fullPicture",
    });
  }
  return out;
}

function readPhotoScraperImages(item: UnknownRecord, actor: string): ApifyFacebookImage[] {
  const image = typeof item.image === "string" ? item.image : null;
  if (!image || isLogoOrProfileUrl(image)) return [];
  return [
    {
      url: upscaleFacebookCdnUrl(image),
      width: typeof item.width === "number" ? item.width : null,
      height: typeof item.height === "number" ? item.height : null,
      post_url: null,
      photo_url: typeof item.url === "string" ? item.url : null,
      actor,
      source_field: "image",
    },
  ];
}

export function normalizeApifyFacebookImages(items: unknown[], actor: string): ApifyFacebookImage[] {
  const images: ApifyFacebookImage[] = [];
  for (const raw of items) {
    const item = asRecord(raw);
    if (!item) continue;
    if (asArray(item.media).length || item.fullPicture) {
      images.push(...readMediaImages(item, actor));
    }
    if (item.image) images.push(...readPhotoScraperImages(item, actor));
  }
  return images;
}

export function detectActorInputShape(actorId: string): {
  accepts_page_url: boolean;
  page_id_required: boolean;
  cookie_fields: string[];
} {
  const id = actorId.toLowerCase();
  const cookie_fields: string[] = [];
  if (/cookie|session|login|auth/i.test(id)) cookie_fields.push("actor_name_hint");
  return {
    accepts_page_url: true,
    page_id_required: id.includes("page-id") || id.includes("by-id"),
    cookie_fields,
  };
}

export function buildActorInput(actorId: string, pageUrl: string, limit: number): Record<string, unknown> {
  const id = actorId.toLowerCase();
  if (id.includes("posts")) {
    return { startUrls: [{ url: pageUrl }], resultsLimit: limit };
  }
  if (id.includes("downloader")) {
    return {
      startUrls: [{ url: pageUrl }],
      resultsLimit: limit,
      maxPhotos: limit,
      maxResults: limit,
      downloadPhotos: true,
      savePhotos: true,
    };
  }
  return {
    startUrls: [{ url: pageUrl }],
    resultsLimit: limit,
    maxPhotos: limit,
    maxResults: limit,
  };
}

function inputRequiresLogin(input: Record<string, unknown>): boolean {
  const keys = Object.keys(input).map((k) => k.toLowerCase());
  if (keys.some((k) => /cookie|session|login|password|auth/i.test(k))) return true;
  for (const v of Object.values(input)) {
    if (typeof v === "string" && /cookie|sessionid|c_user/i.test(v)) return true;
  }
  return false;
}

export function actorInputRequiresLogin(input: Record<string, unknown>): boolean {
  return inputRequiresLogin(input);
}

async function apifyFetch(url: string, token: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  return fetch(url, { ...init, headers, signal: AbortSignal.timeout(120000) });
}

export async function runApifyActorGeneric(
  actorId: string,
  input: Record<string, unknown>,
  options: { maxWaitSec?: number; token?: string; maxItems?: number } = {}
): Promise<
  | { ok: true; items: unknown[]; summary: ApifyRunSummary; input_used: Record<string, unknown> }
  | { ok: false; error: string; requires_login: boolean }
> {
  if (inputRequiresLogin(input)) {
    return { ok: false, error: "UNSUITABLE_REQUIRES_LOGIN", requires_login: true };
  }
  return runApifyActor(actorId, input, options);
}

export async function runApifyActor(
  actor: string,
  input: Record<string, unknown>,
  options: { maxWaitSec?: number; token?: string; maxItems?: number } = {}
): Promise<
  | { ok: true; items: unknown[]; summary: ApifyRunSummary }
  | { ok: false; error: string; requires_login: boolean }
> {
  const config = getApifyConfig();
  const token = options.token ?? config.token;
  if (!token) return { ok: false, error: "APIFY_TOKEN not configured", requires_login: false };

  const actorId = normalizeApifyActorId(actor);
  const startRes = await apifyFetch(`https://api.apify.com/v2/acts/${actorId}/runs`, token, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!startRes.ok) {
    const errText = await startRes.text();
    const requiresLogin = /cookie|login|session|auth|UNSUITABLE_REQUIRES_LOGIN/i.test(errText);
    return {
      ok: false,
      error: requiresLogin ? "UNSUITABLE_REQUIRES_LOGIN" : `Apify run start failed HTTP ${startRes.status}`,
      requires_login: requiresLogin,
    };
  }

  const startBody = (await startRes.json()) as ApifyActorRunResponse;
  const runId = startBody.data?.id;
  const datasetId = startBody.data?.defaultDatasetId;
  const kvId = startBody.data?.defaultKeyValueStoreId ?? null;
  if (!runId || !datasetId) return { ok: false, error: "Apify run missing id or dataset", requires_login: false };

  const maxWait = options.maxWaitSec ?? 180;
  const deadline = Date.now() + maxWait * 1000;
  let status = startBody.data?.status ?? "RUNNING";

  while (Date.now() < deadline) {
    if (status === "SUCCEEDED") break;
    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      return { ok: false, error: `Apify run ${status}`, requires_login: false };
    }
    await sleep(3000);
    const pollRes = await apifyFetch(`https://api.apify.com/v2/actor-runs/${runId}`, token);
    if (!pollRes.ok) continue;
    const pollBody = (await pollRes.json()) as ApifyActorRunResponse;
    status = pollBody.data?.status ?? status;
  }

  if (status !== "SUCCEEDED") {
    return { ok: false, error: "Apify run timed out waiting for completion", requires_login: false };
  }

  const limit = options.maxItems ?? 200;
  const itemsRes = await apifyFetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?limit=${limit}&clean=true`,
    token
  );
  if (!itemsRes.ok) {
    return { ok: false, error: `Apify dataset fetch failed HTTP ${itemsRes.status}`, requires_login: false };
  }

  const items = (await itemsRes.json()) as unknown[];
  return {
    ok: true,
    items,
    summary: {
      run_id: runId,
      dataset_id: datasetId,
      key_value_store_id: kvId,
      status,
      item_count: items.length,
      actor,
    },
  };
}

export async function listApifyKeyValueStoreKeys(storeId: string, token?: string): Promise<string[]> {
  const t = token ?? getApifyConfig().token;
  if (!t) return [];
  const res = await apifyFetch(
    `https://api.apify.com/v2/key-value-stores/${storeId}/keys?limit=200`,
    t
  );
  if (!res.ok) return [];
  const body = (await res.json()) as { data?: { items?: { key: string }[] } };
  return (body.data?.items ?? []).map((i) => i.key);
}

export async function downloadApifyKeyValueRecord(
  storeId: string,
  key: string,
  token?: string
): Promise<Buffer | null> {
  const t = token ?? getApifyConfig().token;
  if (!t) return null;
  const encoded = encodeURIComponent(key);
  const res = await apifyFetch(
    `https://api.apify.com/v2/key-value-stores/${storeId}/records/${encoded}`,
    t,
    { headers: { Accept: "*/*" } }
  );
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

export async function downloadViaApifyStorageIfAvailable(
  summary: ApifyRunSummary,
  maxFiles = 20,
  token?: string
): Promise<DownloadedApifyImage[]> {
  const out: DownloadedApifyImage[] = [];
  if (!summary.key_value_store_id) return out;
  const keys = await listApifyKeyValueStoreKeys(summary.key_value_store_id, token);
  const imageKeys = keys.filter((k) => /\.(jpe?g|png|webp|gif|bmp|bin)$/i.test(k) || /photo|image|media|download/i.test(k));
  for (const key of imageKeys.slice(0, maxFiles)) {
    try {
      const buf = await downloadApifyKeyValueRecord(summary.key_value_store_id, key, token);
      if (!buf || buf.length < 1000) continue;
      if (buf.slice(0, 15).toString("utf8").includes("<html") || buf.slice(0, 5).toString("utf8").startsWith("<")) continue;
      const meta = await sharp(buf).metadata();
      const w = meta.width ?? 0;
      const h = meta.height ?? 0;
      if (w < 200 || h < 200) continue;
      out.push({ buffer: buf, width: w, height: h, source: "apify_kv", storage_key: key });
    } catch {
      continue;
    }
  }
  return out;
}

export async function downloadViaDirectUrlWithHeaders(
  url: string,
  referer = "https://www.facebook.com/"
): Promise<Buffer | null> {
  if (!url || url.includes("api.apify.com/v2/key-value-stores")) return null;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: referer,
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
      signal: AbortSignal.timeout(25000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return null;
    return buf;
  } catch {
    return null;
  }
}

async function downloadApifyRecordUrl(recordUrl: string, token?: string): Promise<Buffer | null> {
  const t = token ?? getApifyConfig().token;
  if (!t || !recordUrl.includes("api.apify.com")) return null;
  try {
    const res = await apifyFetch(recordUrl, t, { headers: { Accept: "*/*" } });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function downloadApifyImageCandidate(
  img: ApifyFacebookImage,
  summary: ApifyRunSummary | null,
  token?: string
): Promise<DownloadedApifyImage | null> {
  if (img.storage_key && summary?.key_value_store_id) {
    const buf = await downloadApifyKeyValueRecord(summary.key_value_store_id, img.storage_key, token);
    if (buf) {
      const meta = await sharp(buf).metadata();
      if ((meta.width ?? 0) >= 200) {
        return {
          buffer: buf,
          width: meta.width ?? img.width ?? 0,
          height: meta.height ?? img.height ?? 0,
          source: "apify_kv",
          storage_key: img.storage_key,
        };
      }
    }
  }
  if (img.apify_record_url) {
    const buf = await downloadApifyRecordUrl(img.apify_record_url, token);
    if (buf) {
      const meta = await sharp(buf).metadata();
      if ((meta.width ?? 0) >= 200) {
        return { buffer: buf, width: meta.width ?? 0, height: meta.height ?? 0, source: "apify_record", url: img.apify_record_url };
      }
    }
  }
  const direct = await downloadViaDirectUrlWithHeaders(img.url);
  if (direct) {
    try {
      const meta = await sharp(direct).metadata();
      if ((meta.width ?? 0) < 50) return null;
      return {
        buffer: direct,
        width: meta.width ?? img.width ?? 0,
        height: meta.height ?? img.height ?? 0,
        source: "direct_url",
        url: img.url,
      };
    } catch {
      return null;
    }
  }
  return null;
}

async function imageHash(buffer: Buffer): Promise<string> {
  const thumb = await sharp(buffer).resize(32, 32, { fit: "cover" }).greyscale().raw().toBuffer();
  return crypto.createHash("sha256").update(thumb).digest("hex");
}

export function isApifyHighResAvailable(largestWidth: number | null): boolean {
  return (largestWidth ?? 0) >= MIN_FACEBOOK_GALLERY_WIDTH;
}

export function isApifyGalleryReady(largestWidth: number | null): boolean {
  return (largestWidth ?? 0) >= GALLERY_PREFERRED_WIDTH;
}

export function isApifyHeroReady(largestWidth: number | null): boolean {
  return (largestWidth ?? 0) >= HERO_MIN_WIDTH;
}

export const APIFY_BENCHMARK_ACTORS = [
  "apify/facebook-posts-scraper",
  "apify/facebook-photos-scraper",
  "igview-owner/facebook-page-photos-downloader",
  "simpleapi/facebook-photos-scraper",
  "crawlerbros/facebook-photos-scraper",
] as const;

export async function benchmarkApifyActor(
  actorId: string,
  pageUrl: string,
  options: {
    slug: string;
    limit?: number;
    outDir?: string;
    token?: string;
  }
): Promise<ApifyActorBenchmarkResult> {
  try {
    return await benchmarkApifyActorInner(actorId, pageUrl, options);
  } catch (e) {
    const shape = detectActorInputShape(actorId);
    return {
      actor_id: actorId,
      attempted: true,
      success: false,
      accepts_page_url: shape.accepts_page_url,
      page_id_required: shape.page_id_required,
      requires_login: false,
      uses_apify_storage: false,
      images_found: 0,
      images_downloaded: 0,
      largest_metadata_width: null,
      largest_saved_width: null,
      count_gte_600: 0,
      count_gte_800: 0,
      count_gte_1000: 0,
      cost_estimate: estimateApifyCost(actorId, options.limit ?? APIFY_BENCHMARK_MAX_ITEMS),
      failure_reason: e instanceof Error ? e.message : "actor_benchmark_crash",
      saved_paths: [],
      quality: classifyApifyImageQuality(null),
    };
  }
}

async function benchmarkApifyActorInner(
  actorId: string,
  pageUrl: string,
  options: {
    slug: string;
    limit?: number;
    outDir?: string;
    token?: string;
  }
): Promise<ApifyActorBenchmarkResult> {
  const config = getApifyConfig();
  const token = options.token ?? config.token;
  const limit = Math.min(options.limit ?? APIFY_BENCHMARK_MAX_ITEMS, APIFY_BENCHMARK_MAX_ITEMS);
  const outDir = options.outDir ?? path.join(briefDir(options.slug), "images", "facebook-benchmark", actorId.replace(/\//g, "-"));
  const shape = detectActorInputShape(actorId);
  const input = buildActorInput(actorId, pageUrl, limit);

  const empty: ApifyActorBenchmarkResult = {
    actor_id: actorId,
    attempted: false,
    success: false,
    accepts_page_url: shape.accepts_page_url,
    page_id_required: shape.page_id_required,
    requires_login: false,
    uses_apify_storage: false,
    images_found: 0,
    images_downloaded: 0,
    largest_metadata_width: null,
    largest_saved_width: null,
    count_gte_600: 0,
    count_gte_800: 0,
    count_gte_1000: 0,
    cost_estimate: estimateApifyCost(actorId, limit),
    failure_reason: null,
    saved_paths: [],
    quality: classifyApifyImageQuality(null),
  };

  if (!token) {
    return { ...empty, failure_reason: "APIFY_TOKEN not configured" };
  }
  if (inputRequiresLogin(input)) {
    return {
      ...empty,
      attempted: true,
      requires_login: true,
      failure_reason: "UNSUITABLE_REQUIRES_LOGIN",
      quality: classifyApifyImageQuality(null, actorId, { requiresLogin: true }),
    };
  }

  const run = await runApifyActor(actorId, input, { token, maxWaitSec: 180, maxItems: limit });
  if (!run.ok) {
    return {
      ...empty,
      attempted: true,
      requires_login: run.requires_login,
      failure_reason: run.requires_login ? "UNSUITABLE_REQUIRES_LOGIN" : run.error,
      quality: classifyApifyImageQuality(null, actorId, { requiresLogin: run.requires_login }),
    };
  }

  const legacy = normalizeApifyFacebookImages(run.items, actorId);
  const normalized = selectBestApifyImages(normalizeCommonFacebookImageFields(run.items, actorId).concat(legacy));
  const metaMax = normalized.reduce((m, i) => Math.max(m, i.width ?? 0), 0) || null;

  const storedFromKv = await downloadViaApifyStorageIfAvailable(run.summary, limit, token);
  const usesStorage = storedFromKv.length > 0 || Boolean(run.summary.key_value_store_id);

  fs.mkdirSync(outDir, { recursive: true });
  const saved: { path: string; width: number; height: number }[] = [];
  let seq = 1;

  async function saveBuffer(buf: Buffer, width: number, height: number, tag: string): Promise<void> {
    try {
      const outPath = path.join(outDir, `${String(seq).padStart(2, "0")}-${tag}.webp`);
      await sharp(buf).webp({ quality: 85 }).toFile(outPath);
      const meta = await sharp(outPath).metadata();
      saved.push({ path: outPath, width: meta.width ?? width, height: meta.height ?? height });
      seq++;
    } catch {
      /* skip corrupt or non-image KV payload */
    }
  }

  for (const s of storedFromKv) {
    if (saved.length >= limit) break;
    await saveBuffer(s.buffer, s.width, s.height, "kv");
    if (saved.filter((x) => x.width >= APIFY_EARLY_STOP_SAVED_OVER).length >= APIFY_EARLY_STOP_COUNT) break;
  }

  if (saved.filter((x) => x.width >= APIFY_EARLY_STOP_SAVED_OVER).length < APIFY_EARLY_STOP_COUNT) {
    const skipPostsDownload =
      actorId.includes("posts") && (metaMax ?? 0) > 0 && (metaMax ?? 0) < MIN_FACEBOOK_GALLERY_WIDTH;
    if (!skipPostsDownload) {
      for (const img of normalized.slice(0, limit)) {
        if (saved.filter((x) => x.width >= APIFY_EARLY_STOP_SAVED_OVER).length >= APIFY_EARLY_STOP_COUNT) break;
        const dl = await downloadApifyImageCandidate(img, run.summary, token);
        if (!dl) continue;
        await saveBuffer(dl.buffer, dl.width, dl.height, "img");
        if (saved.filter((x) => x.width >= APIFY_EARLY_STOP_SAVED_OVER).length >= APIFY_EARLY_STOP_COUNT) break;
      }
    }
  }

  const savedWidths = saved.map((s) => s.width);
  const largestSaved = savedWidths.length ? Math.max(...savedWidths) : null;
  const count600 = savedWidths.filter((w) => w >= 600).length;
  const count800 = savedWidths.filter((w) => w >= 800).length;
  const count1000 = savedWidths.filter((w) => w >= 1000).length;

  let failure_reason: string | null = null;
  if (!saved.length && normalized.length) {
    failure_reason =
      actorId.includes("posts") && (metaMax ?? 0) < MIN_FACEBOOK_GALLERY_WIDTH
        ? "APIFY_POSTS_IMAGES_TOO_SMALL"
        : "FBCDN_DOWNLOAD_BLOCKED";
  } else if (!saved.length) {
    failure_reason = "no_images_in_apify_response";
  }

  const quality = classifyApifyImageQuality(largestSaved ?? metaMax, actorId, {
    downloadBlocked: failure_reason === "FBCDN_DOWNLOAD_BLOCKED",
    requiresLogin: false,
  });

  return {
    actor_id: actorId,
    attempted: true,
    success: saved.length > 0,
    accepts_page_url: shape.accepts_page_url,
    page_id_required: shape.page_id_required,
    requires_login: false,
    uses_apify_storage: usesStorage,
    images_found: normalized.length,
    images_downloaded: saved.length,
    largest_metadata_width: metaMax,
    largest_saved_width: largestSaved,
    count_gte_600: count600,
    count_gte_800: count800,
    count_gte_1000: count1000,
    cost_estimate: estimateApifyCost(actorId, run.summary.item_count || limit),
    failure_reason,
    saved_paths: saved.map((s) => s.path),
    quality,
  };
}

export async function benchmarkApifyActors(
  slug: string,
  pageUrl: string,
  options: { actors?: string[]; limit?: number; stopEarly?: boolean } = {}
): Promise<ApifyActorBenchmarkResult[]> {
  const actors = options.actors ?? [...APIFY_BENCHMARK_ACTORS];
  const results: ApifyActorBenchmarkResult[] = [];
  for (const actorId of actors) {
    const result = await benchmarkApifyActor(actorId, pageUrl, { slug, limit: options.limit });
    results.push(result);
    if (
      options.stopEarly !== false &&
      result.count_gte_800 >= APIFY_EARLY_STOP_COUNT &&
      (result.largest_saved_width ?? 0) >= APIFY_EARLY_STOP_SAVED_OVER
    ) {
      break;
    }
  }
  return results;
}

export async function runApifyFacebookPosts(pageUrl: string, options: { maxPosts?: number; token?: string } = {}) {
  const config = getApifyConfig();
  const actor = config.postsActor;
  const maxPosts = Math.min(options.maxPosts ?? 20, APIFY_BENCHMARK_MAX_ITEMS);
  const emptyEvidence = (): FacebookApifyEvidence => ({
    attempted: config.configured,
    success: false,
    actor,
    photos_found: 0,
    photos_downloaded: 0,
    largest_width: null,
    largest_height: null,
    failure_reason: null,
    cost_estimate: estimateApifyCost(actor, maxPosts),
    requires_login: false,
    via_mcp: false,
  });

  if (!config.configured) {
    return {
      ok: false as const,
      error: "APIFY_TOKEN not configured",
      requires_login: false,
      evidence: { ...emptyEvidence(), attempted: false, failure_reason: "APIFY_TOKEN not configured" },
    };
  }

  const run = await runApifyActor(actor, buildActorInput(actor, pageUrl, maxPosts), {
    token: options.token,
    maxWaitSec: 180,
    maxItems: maxPosts,
  });

  if (!run.ok) {
    return {
      ok: false as const,
      error: run.error,
      requires_login: run.requires_login,
      evidence: {
        ...emptyEvidence(),
        failure_reason: run.requires_login ? "UNSUITABLE_REQUIRES_LOGIN" : run.error,
        requires_login: run.requires_login,
      },
    };
  }

  const normalized = selectBestApifyImages(
    normalizeCommonFacebookImageFields(run.items, actor).concat(normalizeApifyFacebookImages(run.items, actor))
  );
  const metaMax = normalized.reduce((m, i) => Math.max(m, i.width ?? 0), 0);
  if (metaMax > 0 && metaMax < MIN_FACEBOOK_GALLERY_WIDTH) {
    return {
      ok: false as const,
      error: "APIFY_POSTS_IMAGES_TOO_SMALL",
      requires_login: false,
      evidence: {
        ...emptyEvidence(),
        photos_found: normalized.length,
        largest_width: metaMax,
        failure_reason: "APIFY_POSTS_IMAGES_TOO_SMALL",
      },
    };
  }

  return {
    ok: true as const,
    images: normalized,
    summary: run.summary,
    cost_estimate: estimateApifyCost(actor, run.summary.item_count || maxPosts),
  };
}

export async function runApifyFacebookPhotos(pageUrl: string, options: { maxPhotos?: number; token?: string } = {}) {
  const config = getApifyConfig();
  const actor = config.photosActor ?? "apify/facebook-photos-scraper";
  const maxPhotos = Math.min(options.maxPhotos ?? 20, APIFY_BENCHMARK_MAX_ITEMS);
  const emptyEvidence = (): FacebookApifyEvidence => ({
    attempted: config.configured,
    success: false,
    actor,
    photos_found: 0,
    photos_downloaded: 0,
    largest_width: null,
    largest_height: null,
    failure_reason: null,
    cost_estimate: estimateApifyCost(actor, maxPhotos),
    requires_login: false,
    via_mcp: false,
  });

  if (!config.configured) {
    return {
      ok: false as const,
      error: "APIFY_TOKEN not configured",
      requires_login: false,
      evidence: { ...emptyEvidence(), attempted: false, failure_reason: "APIFY_TOKEN not configured" },
    };
  }

  const run = await runApifyActor(actor, buildActorInput(actor, pageUrl, maxPhotos), {
    token: options.token,
    maxWaitSec: 180,
    maxItems: maxPhotos,
  });

  if (!run.ok) {
    return {
      ok: false as const,
      error: run.error,
      requires_login: run.requires_login,
      evidence: {
        ...emptyEvidence(),
        failure_reason: run.requires_login ? "UNSUITABLE_REQUIRES_LOGIN" : run.error,
        requires_login: run.requires_login,
      },
    };
  }

  const normalized = selectBestApifyImages(
    normalizeCommonFacebookImageFields(run.items, actor).concat(normalizeApifyFacebookImages(run.items, actor))
  );
  return {
    ok: true as const,
    images: normalized,
    summary: run.summary,
    cost_estimate: estimateApifyCost(actor, run.summary.item_count || maxPhotos),
  };
}

export async function downloadApifyFacebookImages(
  slug: string,
  pageUrl: string,
  options: {
    outDir?: string;
    existingHashes?: Set<string>;
    maxPosts?: number;
    minWidth?: number;
    preferPhotosActor?: boolean;
    actorId?: string;
  } = {}
): Promise<{
  evidence: FacebookApifyEvidence;
  assets: FacebookAssetMeta[];
  images: ApifyFacebookImage[];
}> {
  const config = getApifyConfig();
  const dir = options.outDir ?? path.join(briefDir(slug), "images", "facebook");
  const minWidth = options.minWidth ?? MIN_FACEBOOK_GALLERY_WIDTH;
  const seen = new Set(options.existingHashes ?? []);
  const evidence: FacebookApifyEvidence = {
    attempted: false,
    success: false,
    actor: null,
    photos_found: 0,
    photos_downloaded: 0,
    largest_width: null,
    largest_height: null,
    failure_reason: null,
    cost_estimate: null,
    requires_login: false,
    via_mcp: false,
  };
  const assets: FacebookAssetMeta[] = [];
  const images: ApifyFacebookImage[] = [];

  if (!config.configured) {
    evidence.failure_reason = "APIFY_TOKEN not configured";
    return { evidence, assets, images };
  }

  evidence.attempted = true;

  const actorOrder = options.actorId
    ? [options.actorId]
    : [
        config.pagePhotosActor,
        config.photosActor,
        config.altPhotosActor,
        config.postsActor,
      ].filter(Boolean) as string[];

  let runSummary: ApifyRunSummary | null = null;
  let runImages: ApifyFacebookImage[] = [];
  let lastFailure: string | null = null;

  for (const actor of actorOrder) {
    if (actor.includes("posts")) {
      const posts = await runApifyFacebookPosts(pageUrl, { maxPosts: options.maxPosts ?? 20 });
      if (!posts.ok) {
        lastFailure = posts.evidence.failure_reason ?? posts.error;
        if (posts.requires_login) {
          evidence.requires_login = true;
          evidence.failure_reason = "UNSUITABLE_REQUIRES_LOGIN";
          return { evidence, assets, images };
        }
        continue;
      }
      runImages = posts.images;
      runSummary = posts.summary;
      evidence.actor = actor;
      evidence.cost_estimate = posts.cost_estimate;
      break;
    }

    const run = await runApifyActor(actor, buildActorInput(actor, pageUrl, options.maxPosts ?? 20), {
      maxWaitSec: 180,
      maxItems: options.maxPosts ?? 20,
    });
    if (!run.ok) {
      lastFailure = run.requires_login ? "UNSUITABLE_REQUIRES_LOGIN" : run.error;
      if (run.requires_login) {
        evidence.requires_login = true;
        evidence.failure_reason = "UNSUITABLE_REQUIRES_LOGIN";
        return { evidence, assets, images };
      }
      continue;
    }
    runImages = selectBestApifyImages(
      normalizeCommonFacebookImageFields(run.items, actor).concat(normalizeApifyFacebookImages(run.items, actor))
    );
    if (runImages.length) {
      runSummary = run.summary;
      evidence.actor = actor;
      evidence.cost_estimate = estimateApifyCost(actor, run.summary.item_count);
      break;
    }
    lastFailure = "no_images_in_apify_response";
  }

  if (!runImages.length) {
    evidence.failure_reason = lastFailure ?? "no_images_in_apify_response";
    return { evidence, assets, images };
  }

  evidence.photos_found = runImages.length;
  images.push(...runImages);
  fs.mkdirSync(dir, { recursive: true });
  let seq = 1;

  const kvDownloads = runSummary ? await downloadViaApifyStorageIfAvailable(runSummary, options.maxPosts ?? 20) : [];
  for (const kv of kvDownloads) {
    if (kv.width < 200) continue;
    const accept = kv.width >= minWidth || kvDownloads.every((k) => k.width < minWidth);
    if (!accept && kv.width < minWidth) continue;
    const hash = await imageHash(kv.buffer);
    if (seen.has(hash)) continue;
    seen.add(hash);
    const outPath = path.join(dir, `${String(seq).padStart(2, "0")}-facebook-apify.webp`);
    await sharp(kv.buffer).webp({ quality: 85 }).toFile(outPath);
    const meta = await sharp(outPath).metadata();
    const finalW = meta.width ?? kv.width;
    const finalH = meta.height ?? kv.height;
    if (!evidence.largest_width || finalW > evidence.largest_width) {
      evidence.largest_width = finalW;
      evidence.largest_height = finalH;
    }
    assets.push({
      local: `images/facebook/${path.basename(outPath)}`,
      source_url: kv.storage_key ?? "apify_kv",
      source_type: "facebook_apify_photo",
      width: finalW,
      height: finalH,
      hash,
      cluster_id: null,
      selected: false,
      selection_reason: `Apify KV ${evidence.actor} (${finalW}x${finalH})`,
      classification: "completed_project",
    });
    seq++;
    evidence.photos_downloaded++;
  }

  if (evidence.photos_downloaded === 0 && !(evidence.actor?.includes("posts") && (runImages[0]?.width ?? 0) < minWidth)) {
    for (const img of runImages.slice(0, options.maxPosts ?? 20)) {
      const dl = await downloadApifyImageCandidate(img, runSummary, config.token ?? undefined);
      if (!dl) continue;
      const w = dl.width;
      const h = dl.height;
      const accept = w >= minWidth || runImages.every((i) => (i.width ?? w) < minWidth);
      if (!accept && w < minWidth) continue;
      const hash = await imageHash(dl.buffer);
      if (seen.has(hash)) continue;
      seen.add(hash);
      const outPath = path.join(dir, `${String(seq).padStart(2, "0")}-facebook-apify.webp`);
      await sharp(dl.buffer).webp({ quality: 85 }).toFile(outPath);
      const meta = await sharp(outPath).metadata();
      const finalW = meta.width ?? w;
      const finalH = meta.height ?? h;
      if (!evidence.largest_width || finalW > evidence.largest_width) {
        evidence.largest_width = finalW;
        evidence.largest_height = finalH;
      }
      assets.push({
        local: `images/facebook/${path.basename(outPath)}`,
        source_url: img.url,
        source_type: "facebook_apify_photo",
        width: finalW,
        height: finalH,
        hash,
        cluster_id: null,
        selected: false,
        selection_reason: `Apify ${evidence.actor} ${img.source_field} (${finalW}x${finalH})`,
        classification: "completed_project",
      });
      seq++;
      evidence.photos_downloaded++;
    }
  }

  evidence.success = evidence.photos_downloaded > 0;
  if (!evidence.success && !evidence.failure_reason) {
    if (evidence.actor?.includes("posts")) {
      const metaMax = runImages.reduce((m, i) => Math.max(m, i.width ?? 0), 0);
      evidence.failure_reason =
        metaMax > 0 && metaMax < minWidth ? "APIFY_POSTS_IMAGES_TOO_SMALL" : "FBCDN_DOWNLOAD_BLOCKED";
    } else {
      evidence.failure_reason = evidence.photos_found > 0 ? "FBCDN_DOWNLOAD_BLOCKED" : "no_images_in_apify_response";
    }
    evidence.largest_width = runImages.reduce((m, i) => Math.max(m, i.width ?? 0), 0) || null;
  }

  return { evidence, assets, images };
}
