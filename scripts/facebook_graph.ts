/**
 * Optional Meta Graph API client for verified public Facebook Page photos.
 * Never uses personal login sessions or logged-in browser scraping.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { FacebookAssetMeta } from "./facebook_source.js";

export const MIN_FACEBOOK_GALLERY_WIDTH = 600;
export const PREFERRED_FACEBOOK_GALLERY_WIDTH = 1000;
export const LOW_RES_FACEBOOK_THRESHOLD = 600;

export type FacebookMediaQuality = "HIGH_RES" | "MEDIUM_RES" | "LOW_RES_ONLY" | "NONE";

export interface FacebookGraphImageVariant {
  height: number;
  width: number;
  source: string;
}

export interface FacebookGraphPhoto {
  id: string;
  name?: string;
  link?: string;
  created_time?: string;
  images?: FacebookGraphImageVariant[];
}

export interface FacebookGraphEvidence {
  attempted: boolean;
  success: boolean;
  page_id: string | null;
  photos_found: number;
  photos_downloaded: number;
  largest_width: number | null;
  largest_height: number | null;
  failure_reason: string | null;
  permission_required: boolean;
}

export interface MetaGraphConfig {
  token: string | null;
  version: string;
  configured: boolean;
}

interface GraphErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
  };
}

export function getMetaGraphConfig(): MetaGraphConfig {
  const token = process.env.META_GRAPH_API_TOKEN?.trim() || null;
  const version = process.env.META_GRAPH_API_VERSION?.trim() || "v25.0";
  return { token, version, configured: Boolean(token) };
}

export function extractFacebookPageSlug(pageUrlOrUsername: string): string | null {
  const raw = pageUrlOrUsername.trim();
  if (/^\d+$/.test(raw)) return raw;

  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(`https://www.facebook.com/${raw.replace(/^\/+/, "")}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!["facebook.com", "m.facebook.com", "fb.com"].includes(host)) return null;

    const idParam = url.searchParams.get("id");
    if (url.pathname.includes("profile.php") && idParam) return idParam;

    const parts = url.pathname.split("/").filter(Boolean);
    const blocked = new Set(["groups", "events", "watch", "share", "photo.php", "photos", "videos", "people"]);
    if (!parts.length || blocked.has(parts[0]!)) return null;
    return parts[0]!;
  } catch {
    const slug = raw.replace(/^@/, "").split(/[/?#]/)[0];
    return slug || null;
  }
}

export function selectBestFacebookImageVariant(
  images: FacebookGraphImageVariant[] | undefined | null
): FacebookGraphImageVariant | null {
  if (!images?.length) return null;
  const valid = images.filter(
    (img) =>
      img.source &&
      typeof img.width === "number" &&
      typeof img.height === "number" &&
      img.width > 0 &&
      img.height > 0
  );
  if (!valid.length) return null;
  return valid.sort((a, b) => b.width * b.height - a.width * a.height)[0] ?? null;
}

export function isGraphPermissionError(code: number | undefined, message: string): boolean {
  const m = message.toLowerCase();
  if (code === 10 || code === 200) return true;
  if (m.includes("permission") || m.includes("page public content access")) return true;
  if (m.includes("(#200)") || m.includes("oauth")) return true;
  return false;
}

function graphBaseUrl(version: string): string {
  return `https://graph.facebook.com/${version}`;
}

async function graphGet<T>(
  path: string,
  config: MetaGraphConfig,
  params: Record<string, string> = {}
): Promise<{ ok: true; data: T } | { ok: false; error: string; permission_required: boolean; status: number }> {
  if (!config.token) {
    return { ok: false, error: "META_GRAPH_API_TOKEN not configured", permission_required: false, status: 0 };
  }

  const url = new URL(`${graphBaseUrl(config.version)}${path}`);
  url.searchParams.set("access_token", config.token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "graph_fetch_failed",
      permission_required: false,
      status: 0,
    };
  }

  const body = (await res.json()) as T & GraphErrorBody;
  if (!res.ok || body.error) {
    const msg = body.error?.message ?? `HTTP ${res.status}`;
    const code = body.error?.code;
    return {
      ok: false,
      error: msg,
      permission_required: isGraphPermissionError(code, msg),
      status: res.status,
    };
  }
  return { ok: true, data: body };
}

export async function resolveFacebookPageId(
  pageUrlOrUsername: string,
  config: MetaGraphConfig = getMetaGraphConfig()
): Promise<{ page_id: string | null; error: string | null; permission_required: boolean }> {
  const slug = extractFacebookPageSlug(pageUrlOrUsername);
  if (!slug) return { page_id: null, error: "invalid_facebook_page_url", permission_required: false };
  if (/^\d+$/.test(slug)) return { page_id: slug, error: null, permission_required: false };

  const result = await graphGet<{ id: string; name?: string }>(`/${encodeURIComponent(slug)}`, config, {
    fields: "id,name",
  });
  if (!result.ok) {
    return { page_id: null, error: result.error, permission_required: result.permission_required };
  }
  return { page_id: result.data.id ?? null, error: result.data.id ? null : "page_id_missing", permission_required: false };
}

export async function fetchFacebookPageInfo(
  pageId: string,
  config: MetaGraphConfig = getMetaGraphConfig()
): Promise<
  | { ok: true; id: string; name: string | null; link: string | null }
  | { ok: false; error: string; permission_required: boolean }
> {
  const result = await graphGet<{ id: string; name?: string; link?: string }>(
    `/${encodeURIComponent(pageId)}`,
    config,
    { fields: "id,name,link" }
  );
  if (!result.ok) return { ok: false, error: result.error, permission_required: result.permission_required };
  return {
    ok: true,
    id: result.data.id,
    name: result.data.name ?? null,
    link: result.data.link ?? null,
  };
}

export async function fetchFacebookPagePhotos(
  pageId: string,
  config: MetaGraphConfig = getMetaGraphConfig(),
  maxPhotos = 25
): Promise<
  | { ok: true; photos: FacebookGraphPhoto[] }
  | { ok: false; error: string; permission_required: boolean }
> {
  const photos: FacebookGraphPhoto[] = [];
  let nextUrl: string | null = null;
  let first = true;

  while (photos.length < maxPhotos) {
    let result:
      | { ok: true; data: { data?: FacebookGraphPhoto[]; paging?: { next?: string } } }
      | { ok: false; error: string; permission_required: boolean; status: number };

    if (first) {
      result = await graphGet<{ data?: FacebookGraphPhoto[]; paging?: { next?: string } }>(
        `/${encodeURIComponent(pageId)}/photos`,
        config,
        {
          type: "uploaded",
          fields: "id,images,link,name,created_time",
          limit: String(Math.min(25, maxPhotos)),
        }
      );
      first = false;
    } else if (nextUrl) {
      try {
        const res = await fetch(nextUrl, { signal: AbortSignal.timeout(30000) });
        const body = (await res.json()) as {
          data?: FacebookGraphPhoto[];
          paging?: { next?: string };
          error?: GraphErrorBody["error"];
        };
        if (!res.ok || body.error) {
          const msg = body.error?.message ?? `HTTP ${res.status}`;
          return {
            ok: false,
            error: msg,
            permission_required: isGraphPermissionError(body.error?.code, msg),
          };
        }
        result = { ok: true, data: body };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "graph_paging_failed",
          permission_required: false,
        };
      }
    } else {
      break;
    }

    if (!result.ok) return { ok: false, error: result.error, permission_required: result.permission_required };

    for (const photo of result.data.data ?? []) {
      photos.push(photo);
      if (photos.length >= maxPhotos) break;
    }
    nextUrl = result.data.paging?.next ?? null;
    if (!nextUrl || !(result.data.data?.length ?? 0)) break;
  }

  return { ok: true, photos };
}

async function imageHash(buffer: Buffer): Promise<string> {
  const thumb = await sharp(buffer).resize(32, 32, { fit: "cover" }).greyscale().raw().toBuffer();
  return crypto.createHash("sha256").update(thumb).digest("hex");
}

export function qualityScoreForFacebookImage(width: number, height: number, source: "facebook_graph" | "facebook_public_html"): number {
  let score = source === "facebook_graph" ? 40 : 15;
  if (width >= PREFERRED_FACEBOOK_GALLERY_WIDTH) score += 35;
  else if (width >= MIN_FACEBOOK_GALLERY_WIDTH) score += 20;
  else score += 5;
  if (height >= 600) score += 10;
  return score;
}

export function assessFacebookMediaQuality(
  assets: { width: number; height: number; source_type: string; classification: string }[]
): {
  facebook_media_quality: FacebookMediaQuality;
  manual_asset_review_recommended: boolean;
  largest_width: number | null;
  largest_height: number | null;
} {
  const gallery = assets.filter(
    (a) => a.classification === "completed_project" && !a.source_type.includes("logo") && !a.source_type.includes("cover")
  );
  if (!gallery.length) {
    return {
      facebook_media_quality: "NONE",
      manual_asset_review_recommended: false,
      largest_width: null,
      largest_height: null,
    };
  }
  const largest = gallery.reduce((best, a) => (a.width > best.width ? a : best), gallery[0]!);
  let quality: FacebookMediaQuality = "LOW_RES_ONLY";
  if (largest.width >= PREFERRED_FACEBOOK_GALLERY_WIDTH) quality = "HIGH_RES";
  else if (largest.width >= MIN_FACEBOOK_GALLERY_WIDTH) quality = "MEDIUM_RES";

  return {
    facebook_media_quality: quality,
    manual_asset_review_recommended: quality === "LOW_RES_ONLY",
    largest_width: largest.width,
    largest_height: largest.height,
  };
}

export async function downloadFacebookGraphPhotos(input: {
  pageUrl: string;
  pageId?: string | null;
  outDir: string;
  config?: MetaGraphConfig;
  existingHashes?: Set<string>;
  maxPhotos?: number;
  minWidth?: number;
}): Promise<{
  evidence: FacebookGraphEvidence;
  assets: FacebookAssetMeta[];
  downloadedWidths: number[];
}> {
  const config = input.config ?? getMetaGraphConfig();
  const evidence: FacebookGraphEvidence = {
    attempted: Boolean(config.configured),
    success: false,
    page_id: input.pageId ?? null,
    photos_found: 0,
    photos_downloaded: 0,
    largest_width: null,
    largest_height: null,
    failure_reason: null,
    permission_required: false,
  };
  const assets: FacebookAssetMeta[] = [];
  const downloadedWidths: number[] = [];
  const seen = new Set(input.existingHashes ?? []);
  const minWidth = input.minWidth ?? MIN_FACEBOOK_GALLERY_WIDTH;

  if (!config.configured) {
    evidence.attempted = false;
    evidence.failure_reason = "META_GRAPH_API_TOKEN not configured";
    return { evidence, assets, downloadedWidths };
  }

  evidence.attempted = true;

  let pageId = input.pageId ?? null;
  if (!pageId) {
    const resolved = await resolveFacebookPageId(input.pageUrl, config);
    pageId = resolved.page_id;
    if (!pageId) {
      evidence.failure_reason = resolved.error ?? "could_not_resolve_page_id";
      evidence.permission_required = resolved.permission_required;
      if (resolved.permission_required) evidence.failure_reason = "GRAPH_API_PERMISSION_REQUIRED";
      return { evidence, assets, downloadedWidths };
    }
  }
  evidence.page_id = pageId;

  const photosResult = await fetchFacebookPagePhotos(pageId, config, input.maxPhotos ?? 25);
  if (!photosResult.ok) {
    evidence.failure_reason = photosResult.permission_required
      ? "GRAPH_API_PERMISSION_REQUIRED"
      : photosResult.error;
    evidence.permission_required = photosResult.permission_required;
    return { evidence, assets, downloadedWidths };
  }

  evidence.photos_found = photosResult.photos.length;
  fs.mkdirSync(input.outDir, { recursive: true });

  let seq = 1;
  for (const photo of photosResult.photos) {
    const best = selectBestFacebookImageVariant(photo.images);
    if (!best?.source) continue;

    const acceptWidth = best.width >= minWidth || photosResult.photos.every((p) => {
      const v = selectBestFacebookImageVariant(p.images);
      return !v || v.width < minWidth;
    });
    if (!acceptWidth && best.width < minWidth) continue;

    try {
      const res = await fetch(best.source, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WebForTradesProspector/1.0)",
          Accept: "image/*",
        },
        signal: AbortSignal.timeout(25000),
        redirect: "follow",
      });
      if (!res.ok) continue;
      const raw = Buffer.from(await res.arrayBuffer());
      const meta = await sharp(raw).metadata();
      const w = meta.width ?? best.width;
      const h = meta.height ?? best.height;
      if (w < 200 || h < 200) continue;

      const hash = await imageHash(raw);
      if (seen.has(hash)) continue;
      seen.add(hash);

      const outPath = path.join(input.outDir, `${String(seq).padStart(2, "0")}-facebook-graph.webp`);
      await sharp(raw).webp({ quality: 85 }).toFile(outPath);
      const outMeta = await sharp(outPath).metadata();
      const finalW = outMeta.width ?? w;
      const finalH = outMeta.height ?? h;

      downloadedWidths.push(finalW);
      if (!evidence.largest_width || finalW > evidence.largest_width) {
        evidence.largest_width = finalW;
        evidence.largest_height = finalH;
      }

      assets.push({
        local: `images/facebook/${path.basename(outPath)}`,
        source_url: best.source,
        source_type: "facebook_graph_photo",
        width: finalW,
        height: finalH,
        hash,
        cluster_id: null,
        selected: false,
        selection_reason: `Meta Graph API uploaded photo ${photo.id} (${finalW}x${finalH})`,
        classification: "completed_project",
      });
      seq++;
      evidence.photos_downloaded++;
    } catch {
      continue;
    }
  }

  evidence.success = evidence.photos_downloaded > 0;
  if (!evidence.success && !evidence.failure_reason) {
    evidence.failure_reason =
      evidence.photos_found > 0 ? "graph_photos_found_but_download_failed" : "no_uploaded_photos_in_graph_response";
  }

  return { evidence, assets, downloadedWidths };
}

/** Safe log line for CLI (never prints token). */
export function formatGraphStatusForLog(evidence: FacebookGraphEvidence, configured: boolean): string {
  if (!configured) return "Meta Graph API: not configured (public HTML fallback only)";
  if (!evidence.attempted) return "Meta Graph API: skipped";
  if (evidence.permission_required) return "Meta Graph API: GRAPH_API_PERMISSION_REQUIRED";
  if (evidence.success) {
    return `Meta Graph API: ${evidence.photos_downloaded}/${evidence.photos_found} photos (max ${evidence.largest_width ?? 0}px wide)`;
  }
  return `Meta Graph API failed: ${evidence.failure_reason ?? "unknown"} (fallback to public HTML)`;
}
