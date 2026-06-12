import type { WebsiteStatus } from "./db.js";
import type { SourceConfidenceSummary } from "./source_verification.js";
import type { WebsiteDiscoveryResult } from "./website_discovery.js";
import type { WebsiteCrawlResult } from "./website_crawler.js";
import type { ManualAssetStatus } from "./image_priority.js";
import { assessAssetReadiness } from "./asset_readiness.js";

export type LeadValidityStatus =
  | "NO_WEBSITE_READY"
  | "SOCIAL_ONLY_READY"
  | "DIRECTORY_ONLY_READY"
  | "BROKEN_SITE_READY"
  | "BAD_SITE_REDESIGN_CANDIDATE"
  | "HAS_REAL_SITE_SKIP"
  | "HAS_REAL_SITE_REDESIGN_ONLY"
  | "NEEDS_MANUAL_REVIEW"
  | "CONTACTABILITY_BLOCKED"
  | "INSUFFICIENT_EVIDENCE"
  | "LOCATION_BLOCKED";

export interface LeadValidityResult {
  lead_validity_status: LeadValidityStatus;
  lead_validity_reason: string;
  pitch_type: "no_website" | "social_only" | "redesign" | "skip" | "manual_review" | "none";
  website_status: WebsiteStatus | null;
  website_url: string | null;
  website_discovery_classification: string | null;
  email_domain_website: WebsiteDiscoveryResult | null;
  source_confidence_summary: SourceConfidenceSummary | null;
  ready_for_build: boolean;
  ready_for_design: boolean;
  ready_for_pitch: boolean;
  manual_review_required: boolean;
  has_real_website: boolean;
  truly_no_website: boolean;
  warnings: string[];
  manual_asset_status?: ManualAssetStatus | "OK";
  pause_before_open_design?: boolean;
  manual_asset_folder?: string;
}

const BUILD_OK_CLASSIFICATIONS = new Set([
  "NO_WEBSITE",
  "BROKEN_OR_BAD_SITE",
  "SOCIAL_OR_DIRECTORY_ONLY",
  "PARKED_DOMAIN",
  "UNDER_CONSTRUCTION",
  "REDIRECTS_TO_SOCIAL",
  "REDIRECTS_TO_DIRECTORY",
]);

const LOCATION_PITCH_BLOCKERS = new Set([
  "LOCATION_MISMATCH_NEEDS_REVIEW",
  "LOCATION_BLOCKED",
  "MISMATCH",
]);

function locationBlocksPitch(status: string | null | undefined): boolean {
  if (!status) return false;
  return LOCATION_PITCH_BLOCKERS.has(status) || status.includes("MISMATCH");
}

function locationBlocksBuild(status: string | null | undefined, allowMismatchBuild = false): boolean {
  if (allowMismatchBuild) return false;
  return locationBlocksPitch(status);
}

function brokenSiteReason(input: {
  facebook_verified?: boolean;
  email_domain_discovery?: WebsiteDiscoveryResult | null;
}): string {
  if (input.facebook_verified && isEmailDomainBrokenOrInaccessible(input.email_domain_discovery)) {
    return (
      "Verified Facebook page and email found. Email-domain website is inaccessible or broken, " +
      "so the business is still a potential WebForTrades lead, but location mismatch requires manual review before outreach."
    );
  }
  if (input.facebook_verified && input.email_domain_discovery?.classification === "NEEDS_MANUAL_REVIEW") {
    return "Verified Facebook and email found. Email-domain website needs manual review.";
  }
  return "Broken or inaccessible site - no-website style build may still be appropriate.";
}

export function isEmailDomainBrokenOrInaccessible(
  discovery: WebsiteDiscoveryResult | null | undefined
): boolean {
  if (!discovery) return false;
  if (discovery.classification === "BROKEN_OR_BAD_SITE") return true;
  if ([401, 403, 404, 410, 502, 503].includes(discovery.status_code ?? 0)) return true;
  const reason = discovery.reason ?? "";
  if (/bot_or_access|http_403|http_404|inaccessible|broken|parked/i.test(reason)) return true;
  if (
    discovery.classification === "NEEDS_MANUAL_REVIEW" &&
    (discovery.status_code === 202 || /bot_or_access|403|404/.test(reason))
  ) {
    return true;
  }
  return false;
}

export function evaluateLeadValidity(input: {
  business_name: string;
  website_status: WebsiteStatus | null;
  website_url: string | null;
  website_discovery: WebsiteDiscoveryResult | null;
  email_domain_discovery: WebsiteDiscoveryResult | null;
  website_crawl?: WebsiteCrawlResult | null;
  source_confidence: SourceConfidenceSummary | null;
  contactability_status?: string | null;
  location_validation_status?: string | null;
  prospect_region?: string | null;
  enrichment_complete?: boolean;
  logo_found?: boolean;
  gallery_photo_count?: number;
  facebook_verified?: boolean;
  manual_review_flags?: string[];
  redesign_candidate?: boolean;
  allow_location_mismatch_build?: boolean;
  photos?: { local?: string; source_type?: string; width?: number; classification?: string }[];
  manual_asset_review_recommended?: boolean;
  low_res_facebook_only?: boolean;
  slug?: string;
}): LeadValidityResult {
  const warnings: string[] = [...(input.manual_review_flags ?? [])];
  const discovery = input.email_domain_discovery ?? input.website_discovery;
  const classification = discovery?.classification ?? input.website_crawl?.classification ?? null;
  const crawl = input.website_crawl;
  const locStatus = input.location_validation_status ?? null;
  const locBlocksPitch = locationBlocksPitch(locStatus);
  const locBlocksBuild = locationBlocksBuild(locStatus, input.allow_location_mismatch_build);

  if (locStatus && locStatus !== "OK" && locStatus !== "LOCATION_OK") {
    if (locStatus.includes("MISMATCH") || locStatus === "LOCATION_MISMATCH_NEEDS_REVIEW") {
      warnings.push(`Location mismatch: ${locStatus} - pitch blocked until resolved`);
    }
  }

  if (locStatus === "LOCATION_BLOCKED") {
    return finish("LOCATION_BLOCKED", `Location validation: ${locStatus}`, input, {
      pitch_type: "none",
      ready_for_build: false,
      ready_for_design: false,
      ready_for_pitch: false,
      manual_review_required: true,
      has_real_website: false,
      truly_no_website: false,
      warnings,
      classification,
    });
  }

  const contactability = input.contactability_status ?? "unknown";
  if (contactability === "DISQUALIFIED_NO_CONTACT_METHOD") {
    return finish("CONTACTABILITY_BLOCKED", "No usable contact method", input, {
      pitch_type: "none",
      ready_for_build: false,
      ready_for_design: false,
      ready_for_pitch: false,
      manual_review_required: false,
      has_real_website: false,
      truly_no_website: false,
      warnings,
      classification,
    });
  }

  const hasRealFromDiscovery = classification === "HAS_REAL_SITE" || crawl?.is_real_site === true;
  const hasRealFromLead = input.website_status === "HAS_REAL_SITE";
  const has_real_website = hasRealFromDiscovery || hasRealFromLead;

  if (has_real_website) {
    warnings.push("Real website exists - do not use no-website pitch");
    const redesign = input.redesign_candidate || crawl?.is_outdated_hint === true;
    return finish(
      redesign ? "HAS_REAL_SITE_REDESIGN_ONLY" : "HAS_REAL_SITE_SKIP",
      discovery?.reason ?? crawl?.classification_reason ?? "HAS_REAL_SITE",
      input,
      {
        pitch_type: redesign ? "redesign" : "skip",
        ready_for_build: false,
        ready_for_design: false,
        ready_for_pitch: false,
        manual_review_required: true,
        has_real_website: true,
        truly_no_website: false,
        warnings,
        classification,
      }
    );
  }

  if (
    classification === "NEEDS_MANUAL_REVIEW" ||
    input.website_status === "NEEDS_MANUAL_REVIEW"
  ) {
    const emailBroken =
      input.facebook_verified && isEmailDomainBrokenOrInaccessible(input.email_domain_discovery);
    if (!emailBroken) {
      warnings.push("Website discovery needs manual review");
      return finish("NEEDS_MANUAL_REVIEW", discovery?.reason ?? "manual review", input, {
        pitch_type: "manual_review",
        ready_for_build: false,
        ready_for_design: false,
        ready_for_pitch: false,
        manual_review_required: true,
        has_real_website: false,
        truly_no_website: false,
        warnings,
        classification,
      });
    }
  }

  if (!input.enrichment_complete) {
    warnings.push("Source enrichment not complete - run enrich:lead before build");
  }

  if (input.source_confidence?.overall === "low" && !input.facebook_verified) {
    warnings.push("Source confidence is low - lean site or manual review recommended");
  }

  const photoCount = input.gallery_photo_count ?? 0;
  if (photoCount <= 2) {
    warnings.push("Very few photos - use proof-led or typography-led layout");
  }

  const assetReadiness = input.slug
    ? assessAssetReadiness({
        slug: input.slug,
        photos: input.photos,
        facebook_verified: input.facebook_verified,
        manual_asset_review_recommended: input.manual_asset_review_recommended,
        low_res_facebook_only: input.low_res_facebook_only,
        photo_led_design: photoCount >= 3,
      })
    : null;

  if (assetReadiness?.manual_asset_status === "MANUAL_ASSET_REVIEW_RECOMMENDED") {
    warnings.push("MANUAL_ASSET_REVIEW_RECOMMENDED: strong lead but automatic images weak");
  }
  if (assetReadiness?.manual_asset_status === "MANUAL_ASSET_REVIEW_REQUIRED") {
    warnings.push("MANUAL_ASSET_REVIEW_REQUIRED: add manual assets or use proof-led layout");
  }

  const manualAssetFields = {
    manual_asset_status: assetReadiness?.manual_asset_status ?? ("OK" as const),
    pause_before_open_design: assetReadiness?.pause_before_open_design ?? false,
    manual_asset_folder: assetReadiness?.manual_folder,
  };

  const done = (
    status: LeadValidityStatus,
    reason: string,
    extra: Omit<Parameters<typeof finish>[3], "manual_asset_status" | "pause_before_open_design" | "manual_asset_folder">
  ) => finish(status, reason, input, { ...manualAssetFields, ...extra });

  const truly_no_website =
    !has_real_website &&
    (classification === null ||
      BUILD_OK_CLASSIFICATIONS.has(classification as string) ||
      input.website_status === "NO_WEBSITE" ||
      input.website_status === "SOCIAL_OR_DIRECTORY_ONLY" ||
      input.website_status === "BROKEN_OR_BAD_SITE");

  const socialOnly =
    classification === "SOCIAL_OR_DIRECTORY_ONLY" ||
    classification === "REDIRECTS_TO_SOCIAL" ||
    input.website_status === "SOCIAL_OR_DIRECTORY_ONLY";

  const directoryOnly =
    classification === "REDIRECTS_TO_DIRECTORY" ||
    Boolean(input.website_url?.includes("checkatrade") || input.website_url?.includes("yell.com"));

  const emailDomainBroken = isEmailDomainBrokenOrInaccessible(input.email_domain_discovery);

  const brokenSite =
    classification === "BROKEN_OR_BAD_SITE" ||
    classification === "PARKED_DOMAIN" ||
    classification === "UNDER_CONSTRUCTION" ||
    input.website_status === "BROKEN_OR_BAD_SITE" ||
    emailDomainBroken ||
    crawl?.is_bad_site === true;

  const manual_review_required =
    contactability === "NEEDS_MANUAL_REVIEW" ||
    locBlocksPitch ||
    warnings.some((w) => /manual|blocked|low confidence|enrichment not complete/i.test(w));

  const evidenceOk =
    input.enrichment_complete === true &&
    (input.source_confidence?.overall === "high" ||
      input.source_confidence?.overall === "medium" ||
      input.facebook_verified === true);

  let ready_for_build =
    !has_real_website && !locBlocksBuild && evidenceOk && truly_no_website && !manual_review_required;

  const ready_for_design =
    ready_for_build &&
    input.logo_found !== false &&
    (photoCount > 0 || input.facebook_verified || input.source_confidence?.overall === "high") &&
    !(assetReadiness?.pause_before_open_design === true);

  const ready_for_pitch = ready_for_build && !locBlocksPitch && !manual_review_required;

  if (!evidenceOk) {
    return done("INSUFFICIENT_EVIDENCE", "Enrichment incomplete or source confidence too low", {
      pitch_type: "manual_review",
      ready_for_build: false,
      ready_for_design: false,
      ready_for_pitch: false,
      manual_review_required: true,
      has_real_website: false,
      truly_no_website,
      warnings,
      classification,
    });
  }

  if (brokenSite) {
    const badQuality = crawl?.is_outdated_hint || classification === "PARKED_DOMAIN";
    const reason = badQuality
      ? "Bad or outdated site - redesign pitch possible"
      : brokenSiteReason({ facebook_verified: input.facebook_verified, email_domain_discovery: input.email_domain_discovery });

    if (input.facebook_verified && emailDomainBroken && locBlocksPitch) {
      ready_for_build = false;
    }

    return done(
      badQuality ? "BAD_SITE_REDESIGN_CANDIDATE" : "BROKEN_SITE_READY",
      reason,
      {
        pitch_type: badQuality ? "redesign" : "no_website",
        ready_for_build,
        ready_for_design: ready_for_build && ready_for_design,
        ready_for_pitch: ready_for_build && !locBlocksPitch,
        manual_review_required: manual_review_required || locBlocksPitch,
        has_real_website: false,
        truly_no_website,
        warnings,
        classification,
      }
    );
  }

  if (directoryOnly) {
    return done("DIRECTORY_ONLY_READY", "Directory listing only", {
      pitch_type: "no_website",
      ready_for_build,
      ready_for_design,
      ready_for_pitch,
      manual_review_required,
      has_real_website: false,
      truly_no_website: true,
      warnings,
      classification,
    });
  }

  if (socialOnly && truly_no_website && !(input.facebook_verified && emailDomainBroken)) {
    return done("SOCIAL_ONLY_READY", "Social presence only, no real website", {
      pitch_type: "social_only",
      ready_for_build,
      ready_for_design,
      ready_for_pitch,
      manual_review_required,
      has_real_website: false,
      truly_no_website: true,
      warnings,
      classification,
    });
  }

  if (input.website_status === "NO_WEBSITE" || classification === "NO_WEBSITE") {
    return done("NO_WEBSITE_READY", "No website found - standard no-website build", {
      pitch_type: "no_website",
      ready_for_build,
      ready_for_design,
      ready_for_pitch,
      manual_review_required,
      has_real_website: false,
      truly_no_website: true,
      warnings,
      classification,
    });
  }

  return done("NO_WEBSITE_READY", "Eligible for no-website build pipeline", {
    pitch_type: "no_website",
    ready_for_build,
    ready_for_design,
    ready_for_pitch,
    manual_review_required,
    has_real_website: false,
    truly_no_website,
    warnings,
    classification,
  });
}

function finish(
  status: LeadValidityStatus,
  reason: string,
  input: Parameters<typeof evaluateLeadValidity>[0],
  extra: {
    pitch_type: LeadValidityResult["pitch_type"];
    ready_for_build: boolean;
    ready_for_design: boolean;
    ready_for_pitch: boolean;
    manual_review_required: boolean;
    has_real_website: boolean;
    truly_no_website: boolean;
    warnings: string[];
    classification: string | null;
    manual_asset_status?: ManualAssetStatus | "OK";
    pause_before_open_design?: boolean;
    manual_asset_folder?: string;
  }
): LeadValidityResult {
  const discovery = input.email_domain_discovery ?? input.website_discovery;
  return {
    lead_validity_status: status,
    lead_validity_reason: reason,
    pitch_type: extra.pitch_type,
    website_status: input.website_status,
    website_url: discovery?.final_url ?? input.website_url,
    website_discovery_classification: extra.classification,
    email_domain_website: input.email_domain_discovery,
    source_confidence_summary: input.source_confidence,
    ready_for_build: extra.ready_for_build,
    ready_for_design: extra.ready_for_design,
    ready_for_pitch: extra.ready_for_pitch,
    manual_review_required: extra.manual_review_required,
    has_real_website: extra.has_real_website,
    truly_no_website: extra.truly_no_website,
    warnings: extra.warnings,
    manual_asset_status: extra.manual_asset_status ?? "OK",
    pause_before_open_design: extra.pause_before_open_design ?? false,
    manual_asset_folder: extra.manual_asset_folder,
  };
}
