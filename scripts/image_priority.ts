/**
 * Image source priority and quality thresholds for WebForTrades.
 * Public sites must never use visible placeholders.
 */

export const IMAGE_SOURCE_PRIORITY = [
  "official_website",
  "google_places",
  "directory",
  "manual_asset",
  "facebook_evidence",
  "proof_led",
] as const;

export type ImageSourceTier = (typeof IMAGE_SOURCE_PRIORITY)[number];

export const HERO_MIN_WIDTH = 1000;
export const GALLERY_PREFERRED_WIDTH = 800;
export const GALLERY_MIN_WIDTH = 600;
export const EVIDENCE_ONLY_MAX_WIDTH = 599;
export const MIN_USABLE_GALLERY_IMAGES = 3;

export type ManualAssetStatus =
  | "MANUAL_ASSET_REVIEW_RECOMMENDED"
  | "MANUAL_ASSET_REVIEW_REQUIRED";

export type ImageSlotSourceStatus = "automatic" | "manual_needed" | "manual_verified";

export type RecommendedImageUse = "hero" | "gallery" | "supporting" | "evidence_only" | "reject";

export interface ImageSlot {
  slot: string;
  desired: string;
  source_status: ImageSlotSourceStatus;
}

const WEBSITE_TYPES = new Set([
  "website_gallery",
  "website_schema",
  "website_og",
  "official_website",
]);

const DIRECTORY_TYPES = new Set(["directory"]);

const MANUAL_TYPES = new Set(["manual_asset", "manual_verified"]);

const FACEBOOK_TYPES = new Set([
  "facebook_photo",
  "facebook_graph_photo",
  "facebook_apify_photo",
  "facebook_post",
  "facebook_public_html",
]);

export function sourceTypeToTier(sourceType: string | undefined | null): ImageSourceTier {
  const t = (sourceType ?? "").toLowerCase();
  if (WEBSITE_TYPES.has(t) || t.includes("website")) return "official_website";
  if (t === "google_places" || t.includes("google")) return "google_places";
  if (DIRECTORY_TYPES.has(t) || t.includes("directory")) return "directory";
  if (MANUAL_TYPES.has(t) || t.includes("manual")) return "manual_asset";
  if (FACEBOOK_TYPES.has(t) || t.startsWith("facebook")) return "facebook_evidence";
  return "proof_led";
}

export function tierPriorityScore(tier: ImageSourceTier): number {
  const idx = IMAGE_SOURCE_PRIORITY.indexOf(tier);
  return idx >= 0 ? (IMAGE_SOURCE_PRIORITY.length - idx) * 100 : 0;
}

export function recommendImageUse(
  width: number,
  sourceType: string | undefined | null,
  hasLocalFile = true
): RecommendedImageUse {
  const tier = sourceTypeToTier(sourceType);
  const isFacebook = tier === "facebook_evidence";

  if (width < GALLERY_MIN_WIDTH) {
    return isFacebook || !hasLocalFile ? "evidence_only" : "reject";
  }
  if (isFacebook && width < GALLERY_MIN_WIDTH) return "evidence_only";
  if (width < GALLERY_MIN_WIDTH) return "reject";
  if (width >= HERO_MIN_WIDTH && tier !== "facebook_evidence") return "hero";
  if (width >= GALLERY_PREFERRED_WIDTH) return "gallery";
  if (width >= GALLERY_MIN_WIDTH) return "supporting";
  return "evidence_only";
}

export function isUsableDesignImage(input: {
  width: number;
  source_type?: string | null;
  local?: string | null;
  classification?: string | null;
}): boolean {
  if (input.classification === "logo_or_brand") return false;
  const use = recommendImageUse(input.width, input.source_type, Boolean(input.local));
  return use === "hero" || use === "gallery" || use === "supporting";
}

export function isFacebookThumbnailOnly(width: number, sourceType?: string | null): boolean {
  return sourceTypeToTier(sourceType) === "facebook_evidence" && width <= EVIDENCE_ONLY_MAX_WIDTH;
}

export function scoreImageByPriority(input: {
  width: number;
  height: number;
  sourceType: string;
}): number {
  let score = tierPriorityScore(sourceTypeToTier(input.sourceType));
  if (input.width >= HERO_MIN_WIDTH) score += 40;
  else if (input.width >= GALLERY_PREFERRED_WIDTH) score += 28;
  else if (input.width >= GALLERY_MIN_WIDTH) score += 12;
  else score -= 50;

  if (sourceTypeToTier(input.sourceType) === "facebook_evidence" && input.width < GALLERY_MIN_WIDTH) {
    score -= 80;
  }
  return score;
}

export const IMAGE_PRIORITY_RULES_MD = `
Image source priority (highest first):
1. Official website images, if verified and usable
2. Google Places photos, if high quality and relevant
3. Directory photos (Checkatrade, TrustATrader, Yell, MyBuilder, Rated People, Houzz, Bark, Nextdoor) where public and legally accessible
4. Manually supplied assets in briefs/<slug>/images/manual/
5. Facebook public thumbnails as supporting evidence only, not gallery or hero
6. Proof-led or typography-led layout if images are weak

Quality rules:
- Do not use Facebook thumbnails under 600px for hero or gallery
- Do not use Apify Facebook URLs for gallery unless saved locally and >= 600px
- Prefer >= 1000px for hero
- Prefer >= 800px for gallery
- 600px to 799px only for small cards or supporting images
- Below 600px is evidence only, not design imagery
- Never render visible placeholders on the final public site
`.trim();
