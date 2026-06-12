import type { DirectoryProbeResult } from "./directory_probe.js";
import type { FacebookImageDownloadStats } from "./photo_discovery_helpers.js";
import type { LeadValidityResult } from "./lead_validity.js";
import type { WebsiteUrlValidation } from "./brief_data_quality.js";

export type SourceQualityStatus = "PASS" | "PASS_WITH_WARNINGS" | "NEEDS_MANUAL_REVIEW" | "FAIL";

export interface SourceQualityResult {
  source_quality_status: SourceQualityStatus;
  source_quality_reason: string;
  website_url_validated: boolean;
  email_domain_checked: boolean;
  enrichment_complete: boolean;
  logo_discovery_attempted: boolean;
  photo_discovery_attempted: boolean;
  directory_probes_attempted: boolean;
  warnings: string[];
  blockers: string[];
}

export function evaluateSourceQuality(input: {
  website_url_validation?: WebsiteUrlValidation | null;
  website_url_validated_flag?: boolean;
  email?: string | null;
  email_domain_checked?: boolean;
  enrichment_complete?: boolean;
  logo_discovery_attempted?: boolean;
  photo_discovery_attempted?: boolean;
  facebook_image_stats?: FacebookImageDownloadStats | null;
  directory_probes?: DirectoryProbeResult[];
  lead_validity?: LeadValidityResult | null;
}): SourceQualityResult {
  const warnings: string[] = [];
  const blockers: string[] = [];

  const websiteOk =
    input.website_url_validated_flag === true ||
    input.website_url_validation?.issue === null ||
    !input.website_url_validation?.issue;

  if (!websiteOk) {
    warnings.push(`Invalid website_url cleaned: ${input.website_url_validation?.issue}`);
  }

  if (input.email && !input.email_domain_checked) {
    blockers.push("Email present but email-domain website discovery not completed");
  }

  if (!input.enrichment_complete) {
    blockers.push("Source enrichment not complete");
  }

  if (!input.logo_discovery_attempted) {
    warnings.push("Logo discovery not attempted");
  }

  if (!input.photo_discovery_attempted) {
    warnings.push("Photo discovery not attempted");
  }

  if (input.facebook_image_stats) {
    const { images_found, images_downloaded, failures } = input.facebook_image_stats;
    if (images_found > 0 && images_downloaded === 0) {
      warnings.push(`Facebook photos: 0/${images_found} downloaded`);
    } else if (failures.length > images_downloaded) {
      warnings.push(`Facebook photo failures: ${failures.length}`);
    }
  }

  if (input.lead_validity?.lead_validity_status === "HAS_REAL_SITE_SKIP") {
    blockers.push("HAS_REAL_SITE_SKIP");
  }

  if (input.lead_validity?.manual_review_required && input.lead_validity?.ready_for_build === false) {
    warnings.push("Lead validity requires manual review");
  }

  const directoryBlocked = (input.directory_probes ?? []).filter(
    (p) => p.status === "BLOCKED_OR_MANUAL_REVIEW"
  );
  if (directoryBlocked.length) {
    warnings.push(`Directory probes blocked: ${directoryBlocked.map((p) => p.platform).join(", ")}`);
  }

  let source_quality_status: SourceQualityStatus = "PASS";
  if (blockers.length) source_quality_status = "FAIL";
  else if (warnings.length >= 3) source_quality_status = "NEEDS_MANUAL_REVIEW";
  else if (warnings.length) source_quality_status = "PASS_WITH_WARNINGS";

  return {
    source_quality_status,
    source_quality_reason: blockers.length
      ? blockers.join("; ")
      : warnings.length
        ? warnings.join("; ")
        : "All source quality checks passed",
    website_url_validated: websiteOk,
    email_domain_checked: !input.email || Boolean(input.email_domain_checked),
    enrichment_complete: Boolean(input.enrichment_complete),
    logo_discovery_attempted: Boolean(input.logo_discovery_attempted),
    photo_discovery_attempted: Boolean(input.photo_discovery_attempted),
    directory_probes_attempted: Boolean(input.directory_probes?.length),
    warnings,
    blockers,
  };
}

export function buildAllowedForBatch(quality: SourceQualityResult, validity: LeadValidityResult | null): boolean {
  if (validity?.lead_validity_status === "HAS_REAL_SITE_SKIP") return false;
  if (validity?.has_real_website) return false;
  if (!validity?.ready_for_build) return false;
  if (quality.source_quality_status === "FAIL") return false;
  if (quality.source_quality_status === "NEEDS_MANUAL_REVIEW") return false;
  return quality.source_quality_status === "PASS" || quality.source_quality_status === "PASS_WITH_WARNINGS";
}
