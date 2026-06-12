import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { briefDir } from "./site_config.js";
import type { LeadValidityResult } from "./lead_validity.js";
import type { SourceConfidenceSummary, SourceVerificationResult } from "./source_verification.js";
import type { WebsiteDiscoveryResult } from "./website_discovery.js";
import {
  buildImageManifestFromPhotos,
  type ImageManifestEntry,
} from "./image_gallery.js";
import type { FacebookGraphEvidence, FacebookMediaQuality } from "./facebook_graph.js";
import type { FacebookApifyEvidence } from "./apify_facebook.js";
import { type ManualAssetStatus } from "./image_priority.js";
import { assessAssetReadiness, type AssetReadinessResult } from "./asset_readiness.js";
import type { DirectoryImageProbeSummary } from "./directory_probe.js";
import type { ManualAssetManifest } from "./manual_assets.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type PlatformStatus = "found" | "not_found" | "not_attempted" | "blocked";

export interface AttemptedSource {
  platform: string;
  status: PlatformStatus;
  url?: string | null;
  search_query?: string;
  reason?: string;
}

export interface VerifiedSource {
  platform: string;
  url: string;
  verified: boolean;
  verification_method: string;
  phone_match: boolean;
  notes?: string;
}

export interface SourceEvidence {
  slug: string;
  gathered_at: string;
  attempted_sources: AttemptedSource[];
  sources: VerifiedSource[];
  sources_found: string[];
  sources_verified: string[];
  strongest_proof_source: {
    platform: string;
    metric: string;
    url: string;
  } | null;
  best_review_details: {
    text: string;
    author: string;
    rating: number;
    source: string;
  }[];
  image_source_summary: {
    google_photos: number;
    facebook_photos: number;
    directory_photos: number;
    manual_photos: number;
    other: number;
    preferred_source: string;
    notes: string;
    priority_order: string[];
  };
  manual_review_flags: string[];
  enrichment_complete: boolean;
  risks: string[];
  facebook_graph?: FacebookGraphEvidence;
  facebook_apify?: FacebookApifyEvidence;
  facebook_media_quality?: FacebookMediaQuality;
  manual_asset_review_recommended?: boolean;
  manual_asset_status?: ManualAssetStatus | "OK";
  asset_readiness?: AssetReadinessResult;
  directory_image_probes?: DirectoryImageProbeSummary[];
  manual_assets?: ManualAssetManifest | null;
  image_slots?: AssetReadinessResult["image_slots"];
}

export type { ImageManifestEntry } from "./image_gallery.js";

export interface EnrichedSourceEvidence extends SourceEvidence {
  email: string | null;
  email_found: boolean;
  email_domain_checked: boolean;
  email_domain_website: WebsiteDiscoveryResult | null;
  website_discovery: WebsiteDiscoveryResult | null;
  website_status: string | null;
  truly_no_website: boolean | null;
  logo_found: boolean;
  logo_path: string | null;
  facebook_url: string | null;
  facebook_verified: boolean;
  source_verifications: SourceVerificationResult[];
  source_confidence: SourceConfidenceSummary | null;
  image_manifest: ImageManifestEntry[];
  selected_images: string[];
  lead_validity_status: string | null;
  ready_for_build: boolean | null;
  registry_source_count: number;
}

interface Brief {
  business_name: string;
  phone: string | null;
  address: string;
  google_rating?: number | null;
  google_review_count?: number | null;
  google_review_count_sourced?: boolean;
  google_maps_url?: string | null;
  website_url?: string | null;
  website_status?: string | null;
  photos?: {
    local: string;
    source_url?: string;
    classification?: string;
    source_type?: string;
    selected?: boolean;
    selection_reason?: string;
  }[];
  reviews?: { text: string; reviewer: string; rating: number }[];
  social?: { facebook?: string | null; instagram?: string | null };
  facebook?: {
    url: string | null;
    verified: boolean;
    verification_reasons?: string[];
    photos_found?: number;
    logo_path?: string | null;
  };
  source_urls?: string[];
  notes?: string[];
  email?: string | null;
  email_available?: boolean;
  brand?: { logo_local?: string | null; logo_url?: string | null };
  lead_validity?: LeadValidityResult;
  enrichment?: { enriched_at?: string; email_domain_checked?: boolean; website_discovery_run?: boolean };
}

const DIRECTORY_PLATFORMS = [
  "checkatrade",
  "trustatrader",
  "mybuilder",
  "rated_people",
  "bark",
  "yell",
  "companies_house",
] as const;

function normalizePhone(p: string | null | undefined): string {
  if (!p) return "";
  return p.replace(/\D/g, "");
}

function urlFromBrief(brief: Brief, platform: string): string | null {
  const urls = brief.source_urls ?? [];
  for (const u of urls) {
    const lower = u.toLowerCase();
    if (platform === "google_places" && (lower.includes("maps.google") || lower.includes("google.com/maps"))) {
      return u;
    }
    if (platform === "facebook" && lower.includes("facebook.com")) return u;
    if (platform === "instagram" && lower.includes("instagram.com")) return u;
    if (platform === "official_website" && brief.website_url && u === brief.website_url) return u;
    if (platform === "checkatrade" && lower.includes("checkatrade.com")) return u;
    if (platform === "trustatrader" && lower.includes("trustatrader.com")) return u;
    if (platform === "mybuilder" && lower.includes("mybuilder.com")) return u;
    if (platform === "rated_people" && lower.includes("ratedpeople.com")) return u;
    if (platform === "bark" && lower.includes("bark.com")) return u;
    if (platform === "yell" && lower.includes("yell.com")) return u;
  }
  if (platform === "google_places" && brief.google_maps_url) return brief.google_maps_url;
  if (platform === "facebook" && brief.facebook?.url) return brief.facebook.url;
  if (platform === "facebook" && brief.social?.facebook) return brief.social.facebook;
  if (platform === "instagram" && brief.social?.instagram) return brief.social.instagram;
  if (platform === "official_website" && brief.website_url && !brief.website_url.includes("facebook")) {
    return brief.website_url;
  }
  return null;
}

function buildAttemptedSources(brief: Brief): AttemptedSource[] {
  const city = brief.address.split(",").slice(-2, -1)[0]?.trim() ?? "";
  const searchQuery = `${brief.business_name} ${city}`.trim();
  const attempts: AttemptedSource[] = [];

  const core: { platform: string; getUrl: () => string | null }[] = [
    { platform: "google_places", getUrl: () => urlFromBrief(brief, "google_places") },
    { platform: "google_reviews", getUrl: () => urlFromBrief(brief, "google_places") },
    { platform: "google_photos", getUrl: () => urlFromBrief(brief, "google_places") },
    { platform: "facebook", getUrl: () => urlFromBrief(brief, "facebook") },
    { platform: "instagram", getUrl: () => urlFromBrief(brief, "instagram") },
    { platform: "official_website", getUrl: () => urlFromBrief(brief, "official_website") },
  ];

  for (const c of core) {
    const url = c.getUrl();
    attempts.push({
      platform: c.platform,
      status: url ? "found" : "not_found",
      url,
      search_query: url ? undefined : searchQuery,
      reason: url ? undefined : "No URL in brief or source_urls (directory scrape not run in this phase)",
    });
  }

  for (const platform of DIRECTORY_PLATFORMS) {
    const url = urlFromBrief(brief, platform);
    attempts.push({
      platform,
      status: url ? "found" : "not_attempted",
      url,
      search_query: searchQuery,
      reason: url ? undefined : "Manual search required in this phase",
    });
  }

  attempts.push({
    platform: "directories",
    status: "not_attempted",
    search_query: searchQuery,
    reason: "Generic directory sweep not automated yet",
  });

  return attempts;
}

function buildVerifiedSources(brief: Brief): VerifiedSource[] {
  const sources: VerifiedSource[] = [];
  const phoneNorm = normalizePhone(brief.phone);

  const mapsUrl = urlFromBrief(brief, "google_places");
  if (mapsUrl) {
    sources.push({
      platform: "google_places",
      url: mapsUrl,
      verified: true,
      verification_method: "place_id_from_gather",
      phone_match: true,
      notes: "Primary gather source",
    });
  }

  if (brief.facebook?.verified && brief.facebook.url) {
    sources.push({
      platform: "facebook",
      url: brief.facebook.url,
      verified: true,
      verification_method: "facebook_source_module",
      phone_match: brief.facebook.verification_reasons?.some((r) => /phone/i.test(r)) ?? false,
      notes: brief.facebook.verification_reasons?.join("; "),
    });
  } else {
    const fbUrl = urlFromBrief(brief, "facebook");
    if (fbUrl) {
      sources.push({
        platform: "facebook",
        url: fbUrl,
        verified: false,
        verification_method: "url_in_brief_unverified",
        phone_match: false,
        notes: "Facebook URL present but not phone-verified",
      });
    }
  }

  const webUrl = urlFromBrief(brief, "official_website");
  if (webUrl && !webUrl.includes("facebook.com")) {
    sources.push({
      platform: "official_website",
      url: webUrl,
      verified: false,
      verification_method: "cross_check_needed",
      phone_match: phoneNorm.length > 0,
      notes: brief.website_status ?? undefined,
    });
  }

  for (const platform of DIRECTORY_PLATFORMS) {
    const url = urlFromBrief(brief, platform);
    if (url) {
      sources.push({
        platform,
        url,
        verified: false,
        verification_method: "url_in_source_urls",
        phone_match: false,
        notes: "Needs phone verification before use",
      });
    }
  }

  return sources;
}

function strongestProof(brief: Brief, sources: VerifiedSource[]): SourceEvidence["strongest_proof_source"] {
  const fb = sources.find((s) => s.platform === "facebook" && s.verified);
  if (fb) {
    return {
      platform: "facebook",
      metric: `${brief.facebook?.photos_found ?? 0} public photos, phone verified`,
      url: fb.url,
    };
  }
  if (brief.google_rating && brief.google_review_count_sourced) {
    return {
      platform: "google",
      metric: `${brief.google_rating} rating, ${brief.google_review_count} reviews`,
      url: brief.google_maps_url ?? "",
    };
  }
  if (brief.google_rating) {
    return {
      platform: "google",
      metric: `${brief.google_rating} rating`,
      url: brief.google_maps_url ?? "",
    };
  }
  return null;
}

function imageSummary(brief: Brief): SourceEvidence["image_source_summary"] {
  const photos = brief.photos ?? [];
  let google = 0;
  let facebook = 0;
  let directory = 0;
  let manual = 0;
  let other = 0;
  for (const p of photos) {
    const st = (p.source_type ?? "").toLowerCase();
    const src = (p.source_url ?? "").toLowerCase();
    if (st === "manual_asset" || st.includes("manual")) manual++;
    else if (st === "directory" || src.includes("checkatrade") || src.includes("trustatrader")) directory++;
    else if (src.includes("facebook") || src.includes("fbcdn") || st.startsWith("facebook")) facebook++;
    else if (src.includes("google") || src.includes("maps.googleapis") || st === "google_places") google++;
    else other++;
  }
  let preferred = "google_places";
  let notes = "Official website first when verified, then Google Places, directory, manual, Facebook evidence only";
  if (manual > 0) {
    preferred = "manual_asset";
    notes = "Validated manual assets available";
  } else if (directory > 0 && google === 0) {
    preferred = "directory";
    notes = "Directory photos available";
  } else if (brief.facebook?.verified && facebook > 0 && google === 0) {
    preferred = "facebook_evidence";
    notes = "Facebook thumbnails may be evidence only unless >= 600px saved locally";
  } else if (google > 0) {
    preferred = "google_places";
    notes = "Google Places photos preferred for gallery when high quality";
  } else if (photos.length === 0) {
    preferred = "proof_led";
    notes = "No usable photos - proof-led layout required";
  }
  return {
    google_photos: google,
    facebook_photos: facebook,
    directory_photos: directory,
    manual_photos: manual,
    other,
    preferred_source: preferred,
    notes,
    priority_order: [
      "official_website",
      "google_places",
      "directory",
      "manual_asset",
      "facebook_evidence",
      "proof_led",
    ],
  };
}

function bestReviews(brief: Brief): SourceEvidence["best_review_details"] {
  return (brief.reviews ?? [])
    .slice()
    .sort((a, b) => b.text.length - a.text.length)
    .slice(0, 3)
    .map((r) => ({
      text: r.text.slice(0, 400),
      author: r.reviewer,
      rating: r.rating,
      source: "google",
    }));
}

export function buildSourceEvidence(
  slug: string,
  brief: Brief,
  enrichContext?: {
    website_discovery?: WebsiteDiscoveryResult | null;
    email_domain_discovery?: WebsiteDiscoveryResult | null;
    source_verifications?: SourceVerificationResult[];
    source_confidence?: SourceConfidenceSummary | null;
    logo_found?: boolean;
    registry_attempts?: AttemptedSource[];
    facebook_url?: string | null;
    facebook_verified?: boolean;
    facebook_graph?: FacebookGraphEvidence;
    facebook_apify?: FacebookApifyEvidence;
    facebook_media_quality?: FacebookMediaQuality;
    manual_asset_review_recommended?: boolean;
    directory_image_probes?: DirectoryImageProbeSummary[];
    manual_assets?: ManualAssetManifest | null;
  }
): EnrichedSourceEvidence {
  const attempted = enrichContext?.registry_attempts?.length
    ? mergeAttemptedSources(buildAttemptedSources(brief), enrichContext.registry_attempts)
    : buildAttemptedSources(brief);
  const sources = buildVerifiedSources(brief);
  const manual_review_flags: string[] = [];
  const risks: string[] = [];

  if (brief.location_validation_status && brief.location_validation_status !== "OK") {
    manual_review_flags.push(brief.location_validation_status);
    risks.push(`Location: ${brief.location_validation_status}`);
  }
  for (const n of brief.notes ?? []) {
    if (/manual|mismatch|blocked/i.test(n)) {
      manual_review_flags.push(n);
    }
  }
  if (!(brief.reviews?.length ?? 0)) {
    risks.push("No review snippets in brief");
  }
  if ((brief.photos?.length ?? 0) <= 2) {
    risks.push("Very few photos - lean site recommended");
  }

  const facebookGraph =
    enrichContext?.facebook_graph ??
    (brief.facebook as { graph?: FacebookGraphEvidence } | undefined)?.graph ??
    null;
  const facebookApify =
    enrichContext?.facebook_apify ??
    (brief.facebook as { apify?: FacebookApifyEvidence } | undefined)?.apify ??
    null;
  const facebookMediaQuality =
    enrichContext?.facebook_media_quality ??
    (brief.facebook as { facebook_media_quality?: FacebookMediaQuality } | undefined)?.facebook_media_quality;
  const manualAssetReview =
    enrichContext?.manual_asset_review_recommended ??
    (brief.facebook as { manual_asset_review_recommended?: boolean } | undefined)?.manual_asset_review_recommended ??
    false;

  if (facebookMediaQuality === "LOW_RES_ONLY") {
    manual_review_flags.push("LOW_RES_FACEBOOK_ONLY");
    risks.push("Facebook media is thumbnail-only - photo-led design not recommended");
  }
  if (manualAssetReview) {
    manual_review_flags.push("NEEDS_MANUAL_ASSET_REVIEW");
  }
  if (facebookApify?.success && (facebookApify.largest_width ?? 0) >= 600) {
    manual_review_flags.push("APIFY_HIGH_RES_AVAILABLE");
  }

  const directoryImageProbes = enrichContext?.directory_image_probes ?? [];
  const manualAssets = enrichContext?.manual_assets ?? null;

  const assetReadiness = assessAssetReadiness({
    slug,
    photos: brief.photos?.map((p) => ({
      local: p.local,
      source_type: p.source_type,
      width: (p as { width?: number }).width,
      classification: p.classification,
    })),
    facebook_verified: enrichContext?.facebook_verified ?? Boolean(brief.facebook?.verified),
    facebook_url: enrichContext?.facebook_url ?? brief.facebook?.url ?? null,
    website_url: brief.website_url ?? null,
    directory_urls: directoryImageProbes.map((d) => d.profile_url),
    manual_asset_review_recommended: manualAssetReview,
    low_res_facebook_only: facebookMediaQuality === "LOW_RES_ONLY",
    manual_manifest: manualAssets,
  });

  let manualAssetStatus: ManualAssetStatus | "OK" = assetReadiness.manual_asset_status;
  if (manualAssetStatus === "MANUAL_ASSET_REVIEW_RECOMMENDED") {
    manual_review_flags.push("MANUAL_ASSET_REVIEW_RECOMMENDED");
  }
  if (manualAssetStatus === "MANUAL_ASSET_REVIEW_REQUIRED") {
    manual_review_flags.push("MANUAL_ASSET_REVIEW_REQUIRED");
    risks.push("Manual assets required before photo-led Open Design");
  }

  const facebookAttempt = attempted.find((a) => a.platform === "facebook");
  const facebookVerified = enrichContext?.facebook_verified ?? Boolean(brief.facebook?.verified);
  const enrichmentRan = Boolean(brief.enrichment?.website_discovery_run);
  const websiteDiscoveryDone = Boolean(
    enrichContext?.website_discovery || enrichContext?.email_domain_discovery || brief.enrichment?.email_domain_checked
  );
  const enrichment_complete = Boolean(
    enrichmentRan &&
      websiteDiscoveryDone &&
      facebookVerified &&
      (facebookAttempt?.status === "found" || Boolean(enrichContext?.facebook_url))
  );

  const imageManifest = buildImageManifestFromPhotos(
    brief.photos ?? [],
    enrichContext?.facebook_verified ?? Boolean(brief.facebook?.verified)
  );
  const email = brief.email ?? null;

  const base: EnrichedSourceEvidence = {
    slug,
    gathered_at: brief.enrichment?.enriched_at ?? new Date().toISOString(),
    attempted_sources: attempted,
    sources,
    sources_found: attempted.filter((a) => a.status === "found").map((a) => a.platform),
    sources_verified: sources.filter((s) => s.verified).map((s) => s.platform),
    strongest_proof_source: strongestProof(brief, sources),
    best_review_details: bestReviews(brief),
    image_source_summary: imageSummary(brief),
    manual_review_flags,
    enrichment_complete,
    risks,
    facebook_graph: facebookGraph ?? undefined,
    facebook_apify: facebookApify ?? undefined,
    facebook_media_quality: facebookMediaQuality,
    manual_asset_review_recommended: manualAssetReview,
    manual_asset_status: manualAssetStatus,
    asset_readiness: assetReadiness,
    directory_image_probes: directoryImageProbes.length ? directoryImageProbes : undefined,
    manual_assets: manualAssets ?? undefined,
    image_slots: assetReadiness.image_slots,
    email,
    email_found: Boolean(email),
    email_domain_checked: Boolean(brief.enrichment?.email_domain_checked),
    email_domain_website: enrichContext?.email_domain_discovery ?? null,
    website_discovery: enrichContext?.website_discovery ?? null,
    website_status: brief.website_status ?? null,
    truly_no_website: brief.lead_validity?.truly_no_website ?? null,
    logo_found: enrichContext?.logo_found ?? Boolean(brief.facebook?.logo_path || brief.brand?.logo_local),
    logo_path: brief.facebook?.logo_path ?? brief.brand?.logo_local ?? null,
    facebook_url: enrichContext?.facebook_url ?? brief.facebook?.url ?? brief.social?.facebook ?? null,
    facebook_verified: facebookVerified,
    source_verifications: enrichContext?.source_verifications ?? [],
    source_confidence: enrichContext?.source_confidence ?? null,
    image_manifest: imageManifest,
    selected_images: imageManifest.filter((i) => i.selected).map((i) => i.local),
    lead_validity_status: brief.lead_validity?.lead_validity_status ?? null,
    ready_for_build: brief.lead_validity?.ready_for_build ?? null,
    registry_source_count: enrichContext?.registry_attempts?.length ?? 0,
  };

  return base;
}

function mergeAttemptedSources(core: AttemptedSource[], registry: AttemptedSource[]): AttemptedSource[] {
  const byPlatform = new Map<string, AttemptedSource>();
  for (const a of registry) byPlatform.set(a.platform, a);
  for (const a of core) {
    const existing = byPlatform.get(a.platform);
    if (existing && a.status === "found") byPlatform.set(a.platform, { ...existing, ...a, status: "found" });
    else if (!existing || a.status === "found") byPlatform.set(a.platform, a);
  }
  return [...byPlatform.values()];
}

export function saveSourceEvidence(slug: string, evidence: EnrichedSourceEvidence): void {
  const dir = briefDir(slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "source-evidence.json"),
    JSON.stringify(evidence, null, 2) + "\n"
  );
  fs.writeFileSync(path.join(dir, "source-evidence.md"), renderSourceEvidenceMd(evidence));
}

function renderSourceEvidenceMd(e: EnrichedSourceEvidence): string {
  const lines = [
    `# Source evidence - ${e.slug}`,
    "",
    `- Gathered: ${e.gathered_at}`,
    `- Enrichment complete: ${e.enrichment_complete ? "yes" : "no"}`,
    `- Ready for build: ${e.ready_for_build === null ? "unknown" : e.ready_for_build ? "yes" : "no"}`,
    `- Lead validity: ${e.lead_validity_status ?? "not evaluated"}`,
    "",
    "## Website discovery",
    e.website_discovery
      ? `- Classification: ${e.website_discovery.classification}`
      : "- Not run",
    e.email_domain_website
      ? `- Email domain: ${e.email_domain_website.domain} -> ${e.email_domain_website.classification} (${e.email_domain_website.final_url ?? "-"})`
      : `- Email domain checked: ${e.email_domain_checked ? "yes" : "no"}`,
    `- Website status: ${e.website_status ?? "-"}`,
    `- Truly no website: ${e.truly_no_website === null ? "unknown" : e.truly_no_website ? "yes" : "no"}`,
    "",
    "## Facebook",
    `- URL: ${e.facebook_url ?? "not found"}`,
    `- Verified: ${e.facebook_verified ? "yes" : "no"}`,
    `- Email found: ${e.email_found ? "yes" : "no"} (${e.email ?? "-"})`,
    `- Logo found: ${e.logo_found ? "yes" : "no"}${e.logo_path ? ` (${e.logo_path})` : ""}`,
    e.facebook_graph
      ? `- Graph API attempted: ${e.facebook_graph.attempted ? "yes" : "no"}`
      : "- Graph API: not recorded",
    e.facebook_graph?.attempted
      ? `- Graph API success: ${e.facebook_graph.success ? "yes" : "no"} (page_id=${e.facebook_graph.page_id ?? "-"}, photos=${e.facebook_graph.photos_downloaded}/${e.facebook_graph.photos_found}, max ${e.facebook_graph.largest_width ?? 0}px)`
      : "",
    e.facebook_graph?.failure_reason ? `- Graph API failure: ${e.facebook_graph.failure_reason}` : "",
    e.facebook_apify
      ? `- Apify attempted: ${e.facebook_apify.attempted ? "yes" : "no"} (via_mcp=${e.facebook_apify.via_mcp ? "yes" : "no"})`
      : "- Apify: not recorded",
    e.facebook_apify?.attempted
      ? `- Apify success: ${e.facebook_apify.success ? "yes" : "no"} (actor=${e.facebook_apify.actor ?? "-"}, photos=${e.facebook_apify.photos_downloaded}/${e.facebook_apify.photos_found}, max ${e.facebook_apify.largest_width ?? 0}px, cost=${e.facebook_apify.cost_estimate ?? "-"})`
      : "",
    e.facebook_apify?.failure_reason ? `- Apify failure: ${e.facebook_apify.failure_reason}` : "",
    e.facebook_apify?.requires_login ? "- Apify requires login: yes (unsuitable)" : "",
    e.facebook_media_quality ? `- Facebook media quality: ${e.facebook_media_quality}` : "",
    e.manual_asset_review_recommended ? "- Manual asset review: recommended" : "",
    e.manual_asset_status ? `- Manual asset status: ${e.manual_asset_status}` : "",
    e.asset_readiness
      ? `- Usable automatic images: ${e.asset_readiness.usable_automatic_count}, manual: ${e.asset_readiness.usable_manual_count}, layout: ${e.asset_readiness.layout_recommendation}`
      : "",
    "",
    "## Source confidence",
    e.source_confidence
      ? `- Overall: ${e.source_confidence.overall}`
      : "- Not scored",
    ...(e.source_verifications.map(
      (v) =>
        `- ${v.platform}: ${v.confidence} (${v.verified ? "verified" : "unverified"})${v.rejected_reason ? ` - ${v.rejected_reason}` : ""}`
    )),
    "",
    "## Strongest proof",
    e.strongest_proof_source
      ? `- ${e.strongest_proof_source.platform}: ${e.strongest_proof_source.metric} (${e.strongest_proof_source.url})`
      : "- None identified",
    "",
    "## Verified sources",
    ...e.sources.map(
      (s) =>
        `- ${s.platform}: ${s.verified ? "verified" : "unverified"} (${s.verification_method}) ${s.url}`
    ),
    "",
    "## Attempted sources",
    ...e.attempted_sources.map(
      (a) =>
        `- ${a.platform}: ${a.status}${a.url ? ` - ${a.url}` : a.search_query ? ` - searched "${a.search_query}"` : ""}`
    ),
    "",
    "## Image summary",
    `- Priority: ${e.image_source_summary.priority_order.join(" > ")}`,
    `- Google: ${e.image_source_summary.google_photos}`,
    `- Facebook: ${e.image_source_summary.facebook_photos}`,
    `- Directory: ${e.image_source_summary.directory_photos ?? 0}`,
    `- Manual: ${e.image_source_summary.manual_photos ?? 0}`,
    `- Preferred: ${e.image_source_summary.preferred_source}`,
    `- Notes: ${e.image_source_summary.notes}`,
    "",
    "## Image slots (internal planning only)",
    ...(e.image_slots?.length
      ? e.image_slots.map((s) => `- ${s.slot}: ${s.desired} (${s.source_status})`)
      : ["- Not generated"]),
    "",
    "## Manual assets folder",
    `- Path: briefs/${e.slug}/images/manual/`,
    e.manual_assets
      ? `- Validated files: ${e.manual_assets.summary.usable_count}/${e.manual_assets.summary.total}`
      : "- Run npm run assets:manual after adding files",
    "",
    "## Image manifest",
    ...(e.image_manifest.length
      ? e.image_manifest.map(
          (i) =>
            `- ${i.local}: ${i.purpose} (${i.source_type}, ${i.confidence})${i.width ? ` ${i.width}x${i.height ?? "?"}px` : ""}${i.quality_score != null ? ` score=${i.quality_score}` : ""} selected=${i.selected ? "yes" : "no"}${i.selected_reason ? ` - ${i.selected_reason}` : ""}`
        )
      : ["- None"]),
    "",
    "## Best review details",
    ...e.best_review_details.map(
      (r) => `- ${r.author} (${r.rating}/5): "${r.text.slice(0, 120)}..."`
    ),
    "",
    "## Risks / manual review",
    ...(e.risks.length ? e.risks.map((r) => `- ${r}`) : ["- None"]),
    ...(e.manual_review_flags.length
      ? e.manual_review_flags.map((f) => `- Flag: ${f}`)
      : []),
  ];
  return lines.join("\n") + "\n";
}

function parseArgs(): { slug?: string } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  return { slug };
}

export function runSourceEvidenceCli(slug: string): EnrichedSourceEvidence {
  const briefPath = path.join(briefDir(slug), "brief.json");
  if (!fs.existsSync(briefPath)) {
    throw new Error(`Missing brief.json for ${slug}`);
  }
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as Brief;
  const evidence = buildSourceEvidence(slug, brief);
  saveSourceEvidence(slug, evidence);
  console.log(`Source evidence saved: briefs/${slug}/source-evidence.json`);
  console.log(`  Found: ${evidence.sources_found.join(", ") || "none"}`);
  console.log(`  Verified: ${evidence.sources_verified.join(", ") || "none"}`);
  console.log(`  Enrichment complete: ${evidence.enrichment_complete}`);
  return evidence;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { slug } = parseArgs();
  if (!slug) {
    console.error("Usage: npm run site:evidence -- --slug <slug>");
    process.exit(1);
  }
  runSourceEvidenceCli(slug);
}
