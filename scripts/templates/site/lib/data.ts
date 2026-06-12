import briefJson from "@/data/brief.json";
import designJson from "@/data/design-system.json";
import type { Brief, DesignSystem } from "./types";

export const brief = briefJson as Brief;
export const design = designJson as DesignSystem;

export interface SiteStat {
  n: string;
  label: string;
}

export function photoPublicPath(local: string): string {
  return "/" + local.replace(/^images\//, "images/");
}

export function logoPublicPath(): string | null {
  const local = brief.brand.logo_local?.trim();
  if (!local) return null;
  return photoPublicPath(local);
}

export function useHeaderLogo(): boolean {
  return Boolean(logoPublicPath());
}

export function hasKnownOwner(): boolean {
  return Boolean(brief.owner_name?.trim());
}

export function hasContactName(): boolean {
  return Boolean(
    brief.contact_name_usage_allowed === true && brief.contact_name?.trim()
  );
}

export function contactName(): string | null {
  if (!hasContactName()) return null;
  return brief.contact_name!.trim();
}

export function ownerName(): string {
  if (hasKnownOwner()) return brief.owner_name!.trim();
  return headerBrandName();
}

/** Phone CTA label entity: owner > contact from reviews > business name */
export function callLabelEntity(): string {
  if (hasKnownOwner()) return ownerName();
  if (hasContactName()) return contactName()!;
  return brief.business_name;
}

/** Sticky header brand. Business name only - never a service or trade label. */
export function headerBrandName(): string {
  const name =
    brief.business_name?.trim() ||
    (brief as Brief & { name?: string | null }).name?.trim();
  if (!name) {
    throw new Error("Missing business name for header brand");
  }
  return name;
}

export function primaryTrade(): string {
  return brief.services[0] ?? "Local trade";
}

export function areaLabel(): string {
  if (brief.based_location?.trim()) {
    return brief.based_location.split(",")[0]?.trim() ?? "local area";
  }
  if (brief.service_area[0]) return brief.service_area[0];
  return "local area";
}

export function basedLocation(): string {
  if (brief.based_location?.trim()) return brief.based_location.trim();
  return areaLabel();
}

export function phoneHref(): string {
  return brief.phone ? `tel:${brief.phone.replace(/\s/g, "")}` : "#contact";
}

export function averageRatingFromSnippets(): number | null {
  if (!brief.reviews.length) return null;
  const sum = brief.reviews.reduce((a, r) => a + r.rating, 0);
  return Math.round((sum / brief.reviews.length) * 10) / 10;
}

/** @deprecated use googleRatingDisplay */
export function averageRating(): number | null {
  return googleRatingDisplay();
}

export function googleRatingSourced(): number | null {
  if (typeof brief.google_rating === "number" && brief.google_rating > 0) {
    return brief.google_rating;
  }
  return null;
}

export function googleRatingDisplay(): number | null {
  return googleRatingSourced() ?? averageRatingFromSnippets();
}

export function googleReviewCountSourced(): number | null {
  if (
    brief.google_review_count_sourced === true &&
    typeof brief.google_review_count === "number"
  ) {
    return brief.google_review_count;
  }
  return null;
}

export function googleProfileUrl(): string | null {
  const url = brief.google_maps_url?.trim();
  if (!url) return null;
  if (/google\.(com|[a-z]{2,3})\/maps|maps\.google|g\.page|goo\.gl\/maps|business\.google/i.test(url)) {
    return url;
  }
  return null;
}

/** Strong sourced stats only. No photo counts or services-listed filler. */
export function buildSafeStats(): SiteStat[] {
  const stats: SiteStat[] = [];

  const rating = googleRatingSourced();
  if (rating) {
    stats.push({ n: `${rating}★`, label: "Average rating" });
  }

  const reviewCount = googleReviewCountSourced();
  if (reviewCount !== null) {
    stats.push({ n: String(reviewCount), label: "Google reviews" });
  }

  const b = brief as Brief & {
    years_trading?: number | null;
    years_trading_sourced?: boolean;
    stat_insured_sourced?: boolean;
    stat_insured_label?: string | null;
    stat_emergency_sourced?: boolean;
    stat_emergency_label?: string | null;
    stat_quote_promise_sourced?: boolean;
    stat_quote_promise_label?: string | null;
  };

  if (b.years_trading_sourced && typeof b.years_trading === "number" && b.years_trading > 0) {
    stats.push({ n: String(b.years_trading), label: "Years trading" });
  }

  if (b.stat_insured_sourced && b.stat_insured_label?.trim()) {
    stats.push({ n: "✓", label: b.stat_insured_label.trim() });
  }

  if (b.stat_emergency_sourced && b.stat_emergency_label?.trim()) {
    stats.push({ n: "✓", label: b.stat_emergency_label.trim() });
  }

  if (b.stat_quote_promise_sourced && b.stat_quote_promise_label?.trim()) {
    stats.push({ n: "✓", label: b.stat_quote_promise_label.trim() });
  }

  return stats;
}

export function reviewsHeading(): string {
  const count = googleReviewCountSourced();
  if (count !== null) return `${count} reviews. Clear themes.`;
  return "Google reviews. Clear themes.";
}

export function reviewsSubheading(): string | null {
  const rating = googleRatingDisplay();
  const count = googleReviewCountSourced();
  if (rating && count !== null) {
    return `${rating}★ average across ${count} Google reviews.`;
  }
  if (rating) return `${rating}★ average from Google reviews.`;
  return null;
}

export function mapEmbedUrl(): string {
  const q = encodeURIComponent(`${brief.business_name} ${brief.address}`.trim());
  return `https://maps.google.com/maps?q=${q}&z=13&output=embed`;
}

export function mapSearchUrl(): string {
  if (brief.google_maps_url) return brief.google_maps_url;
  const q = encodeURIComponent(`${brief.business_name} ${brief.address}`);
  return `https://www.openstreetmap.org/search?query=${q}`;
}
