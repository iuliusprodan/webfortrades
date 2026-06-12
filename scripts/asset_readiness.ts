import fs from "node:fs";
import path from "node:path";
import { briefDir } from "./site_config.js";
import {
  GALLERY_MIN_WIDTH,
  HERO_MIN_WIDTH,
  MIN_USABLE_GALLERY_IMAGES,
  type ImageSlot,
  type ManualAssetStatus,
  recommendImageUse,
  isUsableDesignImage,
  sourceTypeToTier,
} from "./image_priority.js";
import type { ManualAssetManifest } from "./manual_assets.js";

export interface AssetReadinessInput {
  slug: string;
  photos?: {
    local?: string;
    source_type?: string;
    width?: number;
    height?: number;
    classification?: string;
  }[];
  facebook_verified?: boolean;
  facebook_url?: string | null;
  website_url?: string | null;
  directory_urls?: string[];
  manual_asset_review_recommended?: boolean;
  low_res_facebook_only?: boolean;
  photo_led_design?: boolean;
  manual_manifest?: ManualAssetManifest | null;
}

export interface AssetReadinessResult {
  manual_asset_status: ManualAssetStatus | "OK";
  usable_automatic_count: number;
  usable_manual_count: number;
  usable_total_count: number;
  has_hero_candidate: boolean;
  pause_before_open_design: boolean;
  pause_message: string | null;
  layout_recommendation: "photo_led" | "proof_led";
  image_slots: ImageSlot[];
  manual_folder: string;
}

function countFromPhotos(
  photos: AssetReadinessInput["photos"],
  tierFilter?: (t: ReturnType<typeof sourceTypeToTier>) => boolean
): number {
  return (photos ?? []).filter((p) => {
    const w = p.width ?? 0;
    if (tierFilter && !tierFilter(sourceTypeToTier(p.source_type))) return false;
    return isUsableDesignImage({
      width: w,
      source_type: p.source_type,
      local: p.local,
      classification: p.classification,
    });
  }).length;
}

export function assessAssetReadiness(input: AssetReadinessInput): AssetReadinessResult {
  const manualFolder = `briefs/${input.slug}/images/manual/`;
  const manualManifest = input.manual_manifest;
  const usableManual =
    manualManifest?.summary.usable_count ??
    (manualManifest?.images.filter((i) => i.quality_status === "pass").length ?? 0);

  const usableAutomatic = countFromPhotos(
    input.photos,
    (t) => t !== "manual_asset"
  );
  const usableTotal = usableAutomatic + usableManual;

  const hasHeroAutomatic = (input.photos ?? []).some(
    (p) =>
      (p.width ?? 0) >= HERO_MIN_WIDTH &&
      sourceTypeToTier(p.source_type) !== "facebook_evidence" &&
      p.classification !== "logo_or_brand"
  );
  const hasHeroManual = (manualManifest?.images ?? []).some(
    (i) => i.recommended_use === "hero" && i.quality_status === "pass"
  );
  const hasHeroCandidate = hasHeroAutomatic || hasHeroManual;

  const photoLed = input.photo_led_design !== false && usableTotal >= MIN_USABLE_GALLERY_IMAGES;
  const layout: AssetReadinessResult["layout_recommendation"] =
    usableTotal >= MIN_USABLE_GALLERY_IMAGES && hasHeroCandidate ? "photo_led" : "proof_led";

  let status: AssetReadinessResult["manual_asset_status"] = "OK";
  const strongLead =
    input.facebook_verified ||
    Boolean(input.website_url) ||
    (input.directory_urls?.length ?? 0) > 0;

  const needsManualForDesign =
    photoLed &&
    usableTotal < MIN_USABLE_GALLERY_IMAGES &&
    (input.low_res_facebook_only || usableAutomatic < MIN_USABLE_GALLERY_IMAGES);

  if (needsManualForDesign) {
    status = "MANUAL_ASSET_REVIEW_REQUIRED";
  } else if (
    (input.manual_asset_review_recommended || input.low_res_facebook_only) &&
    strongLead &&
    usableAutomatic < MIN_USABLE_GALLERY_IMAGES &&
    usableManual === 0
  ) {
    status = "MANUAL_ASSET_REVIEW_RECOMMENDED";
  } else if (
    input.manual_asset_review_recommended &&
    strongLead &&
    usableTotal < MIN_USABLE_GALLERY_IMAGES + 2 &&
    usableManual === 0
  ) {
    status = "MANUAL_ASSET_REVIEW_RECOMMENDED";
  }

  const pauseBeforeOd =
    status === "MANUAL_ASSET_REVIEW_REQUIRED" && usableManual === 0;

  const pauseMessage = pauseBeforeOd
    ? `Manual asset review needed. Please add 4 to 8 public images to ${manualFolder}, then run npm run assets:manual -- --slug ${input.slug}.`
    : null;

  const imageSlots = buildImageSlots({
    usableAutomatic,
    usableManual,
    hasHeroCandidate,
    layout,
  });

  return {
    manual_asset_status: status,
    usable_automatic_count: usableAutomatic,
    usable_manual_count: usableManual,
    usable_total_count: usableTotal,
    has_hero_candidate: hasHeroCandidate,
    pause_before_open_design: pauseBeforeOd,
    pause_message: pauseMessage,
    layout_recommendation: layout,
    image_slots: imageSlots,
    manual_folder: manualFolder,
  };
}

function buildImageSlots(input: {
  usableAutomatic: number;
  usableManual: number;
  hasHeroCandidate: boolean;
  layout: "photo_led" | "proof_led";
}): ImageSlot[] {
  const slots: ImageSlot[] = [];

  const heroStatus: ImageSlot["source_status"] = input.hasHeroCandidate
    ? input.usableManual > 0
      ? "manual_verified"
      : "automatic"
    : input.layout === "proof_led"
      ? "automatic"
      : "manual_needed";

  slots.push({
    slot: "hero",
    desired: "Best finished project photo or strong proof visual",
    source_status: heroStatus,
  });

  for (let i = 1; i <= 4; i++) {
    const haveEnough = input.usableAutomatic + input.usableManual >= i + 1;
    slots.push({
      slot: `gallery_${i}`,
      desired: "Finished work close-up or wide project shot",
      source_status: haveEnough
        ? input.usableManual > 0 && i > input.usableAutomatic
          ? "manual_verified"
          : "automatic"
        : input.layout === "proof_led"
          ? "automatic"
          : "manual_needed",
    });
  }

  return slots;
}

export function loadAssetReadinessForSlug(slug: string): AssetReadinessResult | null {
  const dir = briefDir(slug);
  const briefPath = path.join(dir, "brief.json");
  if (!fs.existsSync(briefPath)) return null;

  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as AssetReadinessInput & {
    business_name?: string;
    facebook?: { url?: string; verified?: boolean; manual_asset_review_recommended?: boolean };
    directory_probes?: { candidate_url?: string | null; status?: string }[];
  };

  let manualManifest: ManualAssetManifest | null = null;
  const manifestPath = path.join(dir, "images", "manual", "manifest.json");
  if (fs.existsSync(manifestPath)) {
    try {
      manualManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as ManualAssetManifest;
    } catch {
      manualManifest = null;
    }
  }

  const evidencePath = path.join(dir, "source-evidence.json");
  let lowResFb = false;
  if (fs.existsSync(evidencePath)) {
    try {
      const ev = JSON.parse(fs.readFileSync(evidencePath, "utf8")) as {
        facebook_media_quality?: string;
        manual_review_flags?: string[];
      };
      lowResFb =
        ev.facebook_media_quality === "LOW_RES_ONLY" ||
        (ev.manual_review_flags ?? []).includes("LOW_RES_FACEBOOK_ONLY");
    } catch {
      /* ignore */
    }
  }

  const directoryUrls = (brief.directory_probes ?? [])
    .filter((p) => p.status === "FOUND_VERIFIED" && p.candidate_url)
    .map((p) => p.candidate_url!);

  return assessAssetReadiness({
    slug,
    photos: brief.photos as AssetReadinessInput["photos"],
    facebook_verified: brief.facebook?.verified,
    facebook_url: brief.facebook?.url ?? null,
    website_url: (brief as { website_url?: string }).website_url ?? null,
    directory_urls: directoryUrls,
    manual_asset_review_recommended: brief.facebook?.manual_asset_review_recommended,
    low_res_facebook_only: lowResFb,
    manual_manifest: manualManifest,
  });
}
