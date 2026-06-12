/**
 * Shared metadata generation and validation for prospect sites.
 */

export interface MetadataBrief {
  business_name: string;
  services: string[];
  service_area: string[];
  based_location?: string | null;
  phone?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  google_review_count_sourced?: boolean;
  metadata_official_approved?: boolean;
}

export interface SiteMetadata {
  title: string;
  description: string;
  ogImage: string | null;
  metadataBase: string;
  buildId: string;
  webfortradesSlug: string;
}

const FORBIDDEN_METADATA =
  /\b(demo|one-page demo|sample site|preview site|test site|speculative site|concept site|webfortrades)\b/i;

const OFFICIAL_CLAIM =
  /\b(official website|official site|approved by|owned by the business|business-approved)\b/i;

export function cityLabel(brief: MetadataBrief): string {
  if (brief.based_location?.trim()) {
    return brief.based_location.split(",")[0]?.trim() ?? "local area";
  }
  if (brief.service_area[0]?.trim()) return brief.service_area[0].trim();
  return "local area";
}

function tradeBlob(brief: MetadataBrief): string {
  return [brief.business_name, ...brief.services].join(" ").toLowerCase();
}

/** Short trade headline for title suffix, e.g. "Plumber for Repairs, Bathrooms and Heating" */
export function tradeTitleLine(brief: MetadataBrief): string {
  const blob = tradeBlob(brief);
  if (/plumb|bathroom|leak|tap|toilet|pipe|radiator|heating/.test(blob)) {
    return "Plumber for Repairs, Bathrooms and Heating";
  }
  if (/electric|rewir|light|fuse|socket/.test(blob)) {
    return "Electrician for Rewires, Lighting and Fault Finding";
  }
  if (/heat|boiler|gas|radiator/.test(blob)) {
    return "Heating Engineer for Boilers, Radiators and Servicing";
  }
  if (/roof|gutter|fascia|tile/.test(blob)) {
    return "Roofer for Repairs, Guttering and Replacements";
  }
  if (/decor|paint|plaster|wallpaper/.test(blob)) {
    return "Decorator for Painting, Plastering and Finishes";
  }
  if (/mechanic|motor|garage|brake|mot/.test(blob)) {
    return "Mechanic for Servicing, Repairs and MOT Work";
  }
  const first = brief.services.find((s) => s.trim()) ?? "Trade Services";
  return first.replace(/\brepairs?\b/i, "Repairs").replace(/^./, (c) => c.toUpperCase());
}

function naturalServicePhrase(brief: MetadataBrief): string {
  const picked = brief.services
    .slice(0, 3)
    .map((s) => s.trim().toLowerCase().replace(/^general /, ""))
    .filter(Boolean);

  if (picked.length === 0) return "local trade work";

  if (picked.length === 1) return picked[0];
  if (picked.length === 2) return `${picked[0]} and ${picked[1]}`;
  const last = picked[picked.length - 1];
  return `${picked.slice(0, -1).join(", ")} and ${last}`;
}

function proofPhrase(brief: MetadataBrief): string | null {
  const rating =
    typeof brief.google_rating === "number" && brief.google_rating > 0
      ? brief.google_rating
      : null;
  const count =
    brief.google_review_count_sourced === true &&
    typeof brief.google_review_count === "number"
      ? brief.google_review_count
      : null;

  if (rating !== null && count !== null) {
    return `Rated ${rating}★ from ${count} Google reviews.`;
  }
  if (rating !== null) return `Rated ${rating}★ on Google.`;
  return null;
}

export function buildSiteMetadata(
  brief: MetadataBrief,
  siteUrl: string,
  buildId: string,
  slug: string
): SiteMetadata {
  const city = cityLabel(brief);
  const tradeLine = tradeTitleLine(brief);
  const title = `${brief.business_name.trim()} - Local ${city} ${tradeLine}`;

  const services = naturalServicePhrase(brief);
  const proof = proofPhrase(brief);
  const phone = brief.phone?.trim();

  let description = `${brief.business_name.trim()} provides ${services} across ${city}.`;
  if (proof) description += ` ${proof}`;
  if (phone) {
    description += ` Call ${phone} to request a free quote.`;
  } else {
    description += " Request a free quote online.";
  }

  return {
    title,
    description,
    ogImage: "/og-image.png",
    metadataBase: siteUrl.replace(/\/$/, ""),
    buildId,
    webfortradesSlug: slug,
  };
}

export interface MetadataIssue {
  severity: "error" | "warn";
  message: string;
}

export function validateSiteMetadata(
  meta: SiteMetadata,
  brief: MetadataBrief
): MetadataIssue[] {
  const issues: MetadataIssue[] = [];
  const combined = `${meta.title} ${meta.description}`;

  if (/—/.test(combined)) {
    issues.push({ severity: "error", message: "Metadata contains em dash" });
  }

  if (FORBIDDEN_METADATA.test(combined)) {
    issues.push({
      severity: "error",
      message: "Metadata mentions demo, sample, preview, test, concept, or WebForTrades",
    });
  }

  if (OFFICIAL_CLAIM.test(combined) && !brief.metadata_official_approved) {
    issues.push({
      severity: "error",
      message: "Metadata claims official status without metadata_official_approved flag",
    });
  }

  if (!meta.title.includes(brief.business_name.trim())) {
    issues.push({
      severity: "error",
      message: "Metadata title must include business name",
    });
  }

  if (meta.title.trim() === brief.business_name.trim()) {
    issues.push({
      severity: "error",
      message: "Metadata title must not be business name only when more data exists",
    });
  }

  const city = cityLabel(brief);
  if (city !== "local area" && !meta.title.toLowerCase().includes(city.toLowerCase())) {
    issues.push({
      severity: "error",
      message: `Metadata title should include location (${city})`,
    });
  }

  const tradeHint =
    /plumber|electrician|roofer|decorator|mechanic|heating|engineer|services/i;
  if (brief.services.length > 0 && !tradeHint.test(meta.title)) {
    issues.push({
      severity: "error",
      message: "Metadata title should include main service category",
    });
  }

  const serviceListPattern = /^[^.]+\s+in\s+[A-Z]/i;
  const looksLikeRawList =
    brief.services.slice(0, 3).join(", ").length > 20 &&
    meta.description.startsWith(brief.services[0] ?? "");

  if (looksLikeRawList || /^[A-Z][a-z]+ [a-z]+, [A-Z]/.test(meta.description)) {
    const commaCount = (meta.description.match(/,/g) ?? []).length;
    if (commaCount >= 2 && !meta.description.includes("provides")) {
      issues.push({
        severity: "error",
        message: "Metadata description looks like a raw comma-separated service list",
      });
    }
  }

  if (serviceListPattern.test(meta.description) && meta.description.includes(",")) {
    issues.push({
      severity: "warn",
      message: "Metadata description may read like a service list",
    });
  }

  const unsourcedCount =
    /\b\d+\s+google reviews?\b/i.test(meta.description) &&
    brief.google_review_count_sourced !== true;
  const unsourcedRating =
    /\b\d(?:\.\d)?★\b/.test(meta.description) &&
    !(typeof brief.google_rating === "number" && brief.google_rating > 0);

  if (unsourcedCount || unsourcedRating) {
    issues.push({
      severity: "error",
      message: "Metadata includes unsourced rating or review count",
    });
  }

  return issues;
}

export function outreachAssetPaths(slug: string, root: string): {
  briefOutreachDir: string;
  heroMobile: string;
  ogBrief: string;
  ogPublic: string;
  ogOut: string;
  scrollVideo: string;
} {
  const briefOutreachDir = `${root}/briefs/${slug}/outreach`;
  return {
    briefOutreachDir,
    heroMobile: `${briefOutreachDir}/hero-mobile.png`,
    ogBrief: `${briefOutreachDir}/og-image.png`,
    ogPublic: `${root}/sites/${slug}/public/og-image.png`,
    ogOut: `${root}/sites/${slug}/out/og-image.png`,
    scrollVideo: `${briefOutreachDir}/site-scroll.mp4`,
  };
}
