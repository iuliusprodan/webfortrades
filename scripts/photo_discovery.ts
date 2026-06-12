import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  extractGalleryImageUrls,
  extractSchemaLocalBusiness,
} from "./html_extract.js";
import { recommendLayoutForImageSet, type ImageManifestEntry } from "./image_gallery.js";
import { lightweightFetch } from "./website_discovery.js";
import { upscaleFacebookCdnUrl } from "./image_utils.js";
import { downloadFacebookImageWithRetry } from "./photo_discovery_helpers.js";
import type { FacebookPageData } from "./facebook_source.js";
import type { WebsiteCrawlResult } from "./website_crawler.js";
import {
  assessFacebookMediaQuality,
  downloadFacebookGraphPhotos,
  getMetaGraphConfig,
  MIN_FACEBOOK_GALLERY_WIDTH,
  qualityScoreForFacebookImage,
  type FacebookGraphEvidence,
  type FacebookMediaQuality,
} from "./facebook_graph.js";
import {
  downloadApifyFacebookImages,
  getApifyConfig,
  type FacebookApifyEvidence,
} from "./apify_facebook.js";
import {
  GALLERY_MIN_WIDTH,
  GALLERY_PREFERRED_WIDTH,
  isFacebookThumbnailOnly,
  scoreImageByPriority,
} from "./image_priority.js";
import { probeDirectoryImagesForLead, type DirectoryProbeResult } from "./directory_probe.js";
import { scanManualAssets } from "./manual_assets.js";

export type PhotoSourceType =
  | "google_places"
  | "facebook_photo"
  | "facebook_graph_photo"
  | "facebook_apify_photo"
  | "facebook_post"
  | "website_gallery"
  | "website_schema"
  | "website_og"
  | "directory"
  | "manual_asset";

export interface DiscoveredPhoto {
  source_url: string;
  source_type: PhotoSourceType;
  source_confidence: "high" | "medium" | "low";
  local: string | null;
  width: number;
  height: number;
  hash: string;
  score: number;
  classification: "completed_project" | "team_or_van" | "logo_or_brand" | "skip";
  relevance: string;
  selected: boolean;
  selection_reason: string;
  cluster_id: string | null;
}

export interface PhotoDiscoveryResult {
  photos_found: number;
  photos_selected: number;
  photos: DiscoveredPhoto[];
  manifest: ImageManifestEntry[];
  layout_recommendation: ReturnType<typeof recommendLayoutForImageSet>;
  dedupe_removed: number;
  failures: string[];
  facebook_graph?: FacebookGraphEvidence;
  facebook_apify?: FacebookApifyEvidence;
  facebook_media_quality?: FacebookMediaQuality;
  manual_asset_review_recommended?: boolean;
}

async function imageHash(buffer: Buffer): Promise<string> {
  const thumb = await sharp(buffer).resize(32, 32, { fit: "cover" }).greyscale().raw().toBuffer();
  return crypto.createHash("sha256").update(thumb).digest("hex");
}

function scorePhoto(input: {
  width: number;
  height: number;
  sourceType: PhotoSourceType;
  confidence: DiscoveredPhoto["source_confidence"];
  url: string;
}): { score: number; classification: DiscoveredPhoto["classification"]; relevance: string } {
  let score = 0;
  if (input.confidence === "high") score += 30;
  else if (input.confidence === "medium") score += 18;
  else score += 8;

  if (input.width >= GALLERY_PREFERRED_WIDTH) score += 25;
  else if (input.width >= GALLERY_MIN_WIDTH) score += 12;
  else score += 3;

  score += scoreImageByPriority({
    width: input.width,
    height: input.height,
    sourceType: input.sourceType,
  });

  const ratio = input.width / Math.max(input.height, 1);
  let classification: DiscoveredPhoto["classification"] = "completed_project";
  if (/logo|icon|favicon|avatar|profile/i.test(input.url) || (ratio > 0.85 && ratio < 1.15 && input.width <= 512)) {
    classification = "logo_or_brand";
    score -= 30;
  } else if (/team|van|vehicle|staff|crew/i.test(input.url)) {
    classification = "team_or_van";
    score += 10;
  }

  if (input.sourceType.startsWith("facebook")) score += 5;
  if (input.sourceType === "facebook_graph_photo") score += 10;
  if (input.sourceType === "facebook_apify_photo") score += 10;
  if (input.sourceType === "website_gallery") score += 12;
  if (input.sourceType === "directory") score += 18;
  if (input.sourceType === "manual_asset") score += 35;

  if (isFacebookThumbnailOnly(input.width, input.sourceType)) score -= 100;

  const relevance =
    classification === "logo_or_brand"
      ? "brand asset"
      : classification === "team_or_van"
        ? "team or van evidence"
        : "project or service work";

  return { score, classification, relevance };
}

async function probeImageUrl(
  url: string,
  sourceType: PhotoSourceType,
  confidence: DiscoveredPhoto["source_confidence"],
  referer?: string,
  refererPageUrl?: string
): Promise<DiscoveredPhoto | null> {
  if (sourceType.startsWith("facebook") && refererPageUrl) {
    try {
      const tmpPath = `/tmp/wft-probe-${Date.now()}.webp`;
      const dl = await downloadFacebookImageWithRetry({
        sourceUrl: url,
        outPath: tmpPath,
        minWidth: 200,
        refererPageUrl,
        allowPlaywright: true,
      });
      if (dl) {
        const fs = await import("node:fs");
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        const scored = scorePhoto({ width: dl.width, height: dl.height, sourceType, confidence, url });
        if (scored.classification === "logo_or_brand") return null;
        return {
          source_url: dl.source_url,
          source_type: sourceType,
          source_confidence: confidence,
          local: null,
          width: dl.width,
          height: dl.height,
          hash: dl.hash,
          score: scored.score + (dl.method === "playwright" ? 5 : 0),
          classification: scored.classification,
          relevance: scored.relevance,
          selected: false,
          selection_reason: `Facebook download via ${dl.method}`,
          cluster_id: null,
        };
      }
    } catch {
      /* fall through to generic fetch */
    }
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebForTradesProspector/1.0)",
        Referer: referer ?? url,
        Accept: "image/*",
      },
      signal: AbortSignal.timeout(20000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const raw = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(raw).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w < 200 || h < 200) return null;
    const hash = await imageHash(raw);
    const scored = scorePhoto({ width: w, height: h, sourceType, confidence, url });
    if (scored.classification === "logo_or_brand") return null;
    return {
      source_url: url,
      source_type: sourceType,
      source_confidence: confidence,
      local: null,
      width: w,
      height: h,
      hash,
      score: scored.score,
      classification: scored.classification,
      relevance: scored.relevance,
      selected: false,
      selection_reason: "Pending selection",
      cluster_id: null,
    };
  } catch {
    return null;
  }
}

export async function discoverPhotos(input: {
  slug: string;
  briefDir: string;
  existingPhotos?: { local: string; source_url?: string; source_type?: string; width?: number; height?: number }[];
  facebookPage?: FacebookPageData | null;
  facebookVerified?: boolean;
  websiteCrawl?: WebsiteCrawlResult | null;
  maxPhotos?: number;
  writeFiles?: boolean;
  directoryProbes?: DirectoryProbeResult[];
  includeManualAssets?: boolean;
  includeDirectoryImages?: boolean;
}): Promise<PhotoDiscoveryResult> {
  const failures: string[] = [];
  const collected: DiscoveredPhoto[] = [];
  const seenHashes = new Set<string>();
  const fbConf: DiscoveredPhoto["source_confidence"] = input.facebookVerified ? "high" : "medium";
  let facebookGraphEvidence: FacebookGraphEvidence | undefined;
  let facebookApifyEvidence: FacebookApifyEvidence | undefined;

  for (const p of input.existingPhotos ?? []) {
    if (!p.source_url) continue;
    collected.push({
      source_url: p.source_url,
      source_type: (p.source_type as PhotoSourceType) ?? "google_places",
      source_confidence: "medium",
      local: p.local,
      width: p.width ?? 0,
      height: p.height ?? 0,
      hash: crypto.createHash("md5").update(p.local).digest("hex"),
      score: scorePhoto({
        width: p.width ?? 800,
        height: p.height ?? 600,
        sourceType: "google_places",
        confidence: "medium",
        url: p.source_url,
      }).score,
      classification: "completed_project",
      relevance: "google places photo",
      selected: true,
      selection_reason: "Existing gather photo",
      cluster_id: null,
    });
  }

  if (input.facebookPage && input.facebookVerified) {
    const graphConfig = getMetaGraphConfig();
    const apifyConfig = getApifyConfig();
    let usedGraph = false;
    let usedApify = false;

    if (graphConfig.configured) {
      const graphDir = path.join(input.briefDir, "images", "facebook");
      const graphDl = await downloadFacebookGraphPhotos({
        pageUrl: input.facebookPage.page_url,
        outDir: graphDir,
        config: graphConfig,
        existingHashes: seenHashes,
        maxPhotos: 18,
        minWidth: MIN_FACEBOOK_GALLERY_WIDTH,
      });
      facebookGraphEvidence = graphDl.evidence;

      for (const asset of graphDl.assets) {
        if (seenHashes.has(asset.hash)) continue;
        seenHashes.add(asset.hash);
        const qScore = qualityScoreForFacebookImage(asset.width, asset.height, "facebook_graph");
        collected.push({
          source_url: asset.source_url,
          source_type: "facebook_graph_photo",
          source_confidence: fbConf,
          local: asset.local,
          width: asset.width,
          height: asset.height,
          hash: asset.hash,
          score: qScore,
          classification: asset.classification,
          relevance: "project or service work",
          selected: false,
          selection_reason: asset.selection_reason,
          cluster_id: null,
        });
        usedGraph = true;
      }

      if (!graphDl.evidence.success && graphDl.evidence.failure_reason) {
        failures.push(`Graph API: ${graphDl.evidence.failure_reason}`);
      } else if (graphDl.assets.every((a) => a.width < MIN_FACEBOOK_GALLERY_WIDTH)) {
        failures.push("LOW_RES_FACEBOOK_ONLY: Graph API returned no images >= 600px wide");
      }
    }

    const graphHighRes = collected.some(
      (p) => p.source_type.startsWith("facebook") && p.width >= MIN_FACEBOOK_GALLERY_WIDTH
    );

    if (!graphHighRes && apifyConfig.configured) {
      const apifyDir = path.join(input.briefDir, "images", "facebook");
      const apifyDl = await downloadApifyFacebookImages(input.slug, input.facebookPage.page_url, {
        outDir: apifyDir,
        existingHashes: seenHashes,
        maxPosts: 20,
        minWidth: MIN_FACEBOOK_GALLERY_WIDTH,
      });
      facebookApifyEvidence = apifyDl.evidence;

      for (const asset of apifyDl.assets) {
        if (seenHashes.has(asset.hash)) continue;
        seenHashes.add(asset.hash);
        const qScore = qualityScoreForFacebookImage(asset.width, asset.height, "facebook_graph");
        collected.push({
          source_url: asset.source_url,
          source_type: "facebook_apify_photo",
          source_confidence: fbConf,
          local: asset.local,
          width: asset.width,
          height: asset.height,
          hash: asset.hash,
          score: qScore + 15,
          classification: asset.classification,
          relevance: "project or service work",
          selected: false,
          selection_reason: asset.selection_reason,
          cluster_id: null,
        });
        usedApify = true;
      }

      if (!apifyDl.evidence.success && apifyDl.evidence.failure_reason) {
        failures.push(`Apify: ${apifyDl.evidence.failure_reason}`);
      } else if (apifyDl.assets.length && apifyDl.assets.every((a) => a.width < MIN_FACEBOOK_GALLERY_WIDTH)) {
        failures.push("LOW_RES_FACEBOOK_ONLY: Apify returned no images >= 600px wide");
      }
    }

    const hasHighResFacebook = collected.some(
      (p) => p.source_type.startsWith("facebook") && p.width >= MIN_FACEBOOK_GALLERY_WIDTH
    );

    if (!hasHighResFacebook) {
      const photoUrls = [
        ...input.facebookPage.photo_urls,
        ...input.facebookPage.post_image_urls,
      ]
        .map(upscaleFacebookCdnUrl)
        .slice(0, 24);

      for (const url of photoUrls) {
        const photo = await probeImageUrl(url, "facebook_photo", fbConf, input.facebookPage.page_url, input.facebookPage.page_url);
        if (!photo) continue;
        if (seenHashes.has(photo.hash)) continue;
        seenHashes.add(photo.hash);
        photo.score = qualityScoreForFacebookImage(photo.width, photo.height, "facebook_public_html");
        collected.push(photo);
      }
      if (photoUrls.length && collected.filter((p) => p.source_type.startsWith("facebook")).length === 0) {
        failures.push("Facebook photo URLs found but downloads failed");
      } else if (
        collected
          .filter((p) => p.source_type.startsWith("facebook"))
          .every((p) => p.width < MIN_FACEBOOK_GALLERY_WIDTH)
      ) {
        failures.push("LOW_RES_FACEBOOK_ONLY: public HTML thumbnails only");
      }
    }
  }

  if (input.websiteCrawl?.pages?.length) {
    for (const page of input.websiteCrawl.pages) {
      for (const img of page.images.slice(0, 12)) {
        const photo = await probeImageUrl(img, "website_gallery", "high", page.url);
        if (!photo) continue;
        if (seenHashes.has(photo.hash)) continue;
        seenHashes.add(photo.hash);
        collected.push(photo);
      }
    }
    for (const img of input.websiteCrawl.schema_images ?? []) {
      const photo = await probeImageUrl(img, "website_schema", "high", input.websiteCrawl.final_url ?? undefined);
      if (photo && !seenHashes.has(photo.hash)) {
        seenHashes.add(photo.hash);
        collected.push(photo);
      }
    }
  }

  if (input.includeDirectoryImages !== false && input.directoryProbes?.length) {
    const withImages = await probeDirectoryImagesForLead({
      slug: input.slug,
      briefDir: input.briefDir,
      probes: input.directoryProbes,
      writeFiles: input.writeFiles !== false,
    });
    for (const probe of withImages) {
      for (const c of probe.image_probe?.candidates ?? []) {
        if (!c.downloaded || !c.local || c.width < GALLERY_MIN_WIDTH) continue;
        const hash = crypto.createHash("md5").update(c.local).digest("hex");
        if (seenHashes.has(hash)) continue;
        seenHashes.add(hash);
        const scored = scorePhoto({
          width: c.width,
          height: c.height,
          sourceType: "directory",
          confidence: probe.status === "FOUND_VERIFIED" ? "high" : "medium",
          url: c.url,
        });
        collected.push({
          source_url: c.url,
          source_type: "directory",
          source_confidence: probe.status === "FOUND_VERIFIED" ? "high" : "medium",
          local: c.local,
          width: c.width,
          height: c.height,
          hash,
          score: scored.score,
          classification: scored.classification,
          relevance: `Directory photo (${probe.platform})`,
          selected: false,
          selection_reason: `Directory image from ${probe.platform}`,
          cluster_id: null,
        });
      }
    }
  }

  if (input.includeManualAssets !== false) {
    const manualManifest = await scanManualAssets(input.slug);
    for (const img of manualManifest.images) {
      if (img.quality_status === "reject") continue;
      if (img.recommended_use === "evidence_only" || img.recommended_use === "reject") continue;
      const local = `images/manual/${img.filename}`;
      const full = path.join(input.briefDir, local);
      if (!fs.existsSync(full)) continue;
      const hash = img.perceptual_hash ?? crypto.createHash("md5").update(local).digest("hex");
      if (seenHashes.has(hash)) continue;
      seenHashes.add(hash);
      const scored = scorePhoto({
        width: img.width,
        height: img.height,
        sourceType: "manual_asset",
        confidence: "high",
        url: img.source_url ?? local,
      });
      collected.push({
        source_url: img.source_url ?? local,
        source_type: "manual_asset",
        source_confidence: "high",
        local,
        width: img.width,
        height: img.height,
        hash,
        score: scored.score + 20,
        classification: scored.classification,
        relevance: "manual verified asset",
        selected: false,
        selection_reason: "User-supplied manual asset",
        cluster_id: null,
      });
    }
  }

  const beforeDedupe = collected.length;
  const deduped = dedupeByHash(collected);
  deduped.sort((a, b) => b.score - a.score);

  const maxPhotos = input.maxPhotos ?? 12;
  const galleryCandidates = deduped.filter((p) => p.classification !== "logo_or_brand");
  let selectedCount = 0;
  for (const p of galleryCandidates) {
    if (selectedCount >= maxPhotos) break;
    if (isFacebookThumbnailOnly(p.width, p.source_type)) {
      p.selected = false;
      p.selection_reason = "Facebook thumbnail under 600px - evidence only";
      continue;
    }
    if (p.source_type.startsWith("facebook") && p.width < GALLERY_MIN_WIDTH) {
      p.selected = false;
      p.selection_reason = "Facebook image under 600px - not for gallery";
      continue;
    }
    if (p.source_type.startsWith("facebook") && !p.local) {
      p.selected = false;
      p.selection_reason = "Facebook URL not saved locally - not for gallery";
      continue;
    }
    p.selected = true;
    p.selection_reason = `Top scored photo (${p.score}) from ${p.source_type}`;
    selectedCount++;
  }

  const imagesDir = path.join(input.briefDir, "images", "discovered");
  if (input.writeFiles !== false) {
    fs.mkdirSync(imagesDir, { recursive: true });
    let seq = 1;
    for (const p of galleryCandidates.filter((x) => x.selected)) {
      if (p.local && fs.existsSync(path.join(input.briefDir, p.local.replace(/^images\//, "images/")))) continue;
      try {
        const res = await fetch(p.source_url, {
          headers: { "User-Agent": "Mozilla/5.0", Accept: "image/*" },
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) continue;
        const raw = Buffer.from(await res.arrayBuffer());
        const out = path.join(imagesDir, `${String(seq).padStart(2, "0")}-${p.source_type}.webp`);
        await sharp(raw).webp({ quality: 85 }).toFile(out);
        p.local = `images/discovered/${String(seq).padStart(2, "0")}-${p.source_type}.webp`;
        seq++;
      } catch {
        failures.push(`Failed to save photo from ${p.source_type}`);
      }
    }
  }

  const manifest: ImageManifestEntry[] = deduped.map((p) => ({
    local: p.local ?? p.source_url,
    source: p.source_url,
    source_type: p.source_type,
    confidence: p.source_confidence,
    purpose: p.classification === "logo_or_brand" ? "logo" : p.selected ? "gallery" : "skipped",
    selected: p.selected,
    reason: p.selection_reason,
    width: p.width || undefined,
    height: p.height || undefined,
    quality_score: p.score,
    selected_reason: p.selection_reason,
  }));

  const layout_recommendation = recommendLayoutForImageSet(manifest);

  if (galleryCandidates.filter((p) => p.selected).length <= 2) {
    layout_recommendation.note =
      "Very few good photos - proof-led or typography-led layout required. No placeholder boxes.";
  }

  const fbPhotos = deduped.filter((p) => p.source_type.startsWith("facebook"));
  const mediaQuality =
    fbPhotos.length > 0
      ? assessFacebookMediaQuality(
          fbPhotos.map((p) => ({
            width: p.width,
            height: p.height,
            source_type: p.source_type,
            classification: p.classification,
          }))
        )
      : null;

  if (mediaQuality?.facebook_media_quality === "LOW_RES_ONLY" && !failures.some((f) => f.includes("LOW_RES_FACEBOOK_ONLY"))) {
    failures.push("LOW_RES_FACEBOOK_ONLY: public HTML thumbnails only");
  }

  return {
    photos_found: deduped.length,
    photos_selected: galleryCandidates.filter((p) => p.selected).length,
    photos: deduped,
    manifest,
    layout_recommendation,
    dedupe_removed: beforeDedupe - deduped.length,
    failures,
    facebook_graph: facebookGraphEvidence,
    facebook_apify: facebookApifyEvidence,
    facebook_media_quality: mediaQuality?.facebook_media_quality,
    manual_asset_review_recommended: mediaQuality?.manual_asset_review_recommended,
  };
}

function dedupeByHash(photos: DiscoveredPhoto[]): DiscoveredPhoto[] {
  const seen = new Set<string>();
  const out: DiscoveredPhoto[] = [];
  for (const p of photos) {
    const key = p.hash || p.source_url.split("?")[0]!;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export async function discoverWebsiteGalleryPhotos(websiteUrl: string): Promise<string[]> {
  const probe = await lightweightFetch(websiteUrl);
  if (!probe.ok) return [];
  const res = await fetch(probe.finalUrl || websiteUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (!res?.ok) return [];
  const html = await res.text();
  const schema = extractSchemaLocalBusiness(html);
  const fromSchema = schema?.image ?? [];
  const fromHtml = extractGalleryImageUrls(html, probe.finalUrl || websiteUrl);
  return [...new Set([...fromSchema, ...fromHtml])].slice(0, 30);
}
