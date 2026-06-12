import { namesMatch, phonesMatch } from "./facebook_source.js";
import type { SourceConfidenceLevel } from "./source_registry.js";
import type { WebsiteDiscoveryClassification } from "./website_discovery.js";

export interface SourceVerificationInput {
  platform: string;
  url: string | null;
  business_name: string;
  google_phone: string | null;
  google_email: string | null;
  google_address: string | null;
  google_maps_url?: string | null;
  town?: string | null;
  trade?: string | null;
  extracted?: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    business_name?: string | null;
    location?: string | null;
    logo_url?: string | null;
  };
}

export interface SourceVerificationResult {
  platform: string;
  url: string | null;
  confidence: SourceConfidenceLevel;
  verified: boolean;
  verification_reasons: string[];
  matches: {
    phone: boolean;
    email: boolean;
    website: boolean;
    business_name: boolean;
    location: boolean;
    service_trade: boolean;
    logo: boolean;
  };
  rejected_reason: string | null;
}

function emailsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function emailDomainsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a?.includes("@") || !b?.includes("@")) return false;
  const da = a.split("@")[1]?.toLowerCase();
  const db = b.split("@")[1]?.toLowerCase();
  return Boolean(da && db && da === db);
}

function locationMatch(
  extractedLocation: string | null | undefined,
  googleAddress: string | null | undefined,
  town: string | null | undefined
): boolean {
  const haystack = [extractedLocation, googleAddress, town].filter(Boolean).join(" ").toLowerCase();
  if (!haystack.trim()) return false;
  const tokens = [
    "bristol",
    "kingswood",
    "swansea",
    "cardiff",
    "bath",
    "south glos",
    "south gloucestershire",
    "gloucester",
    "newport",
  ];
  return tokens.some((t) => haystack.includes(t));
}

function tradeMatch(
  trade: string | null | undefined,
  text: string | null | undefined
): boolean {
  if (!trade?.trim() || !text?.trim()) return false;
  const t = trade.toLowerCase();
  const hay = text.toLowerCase();
  const keywords = ["plumb", "heat", "boiler", "bathroom", "electric", "builder", "roof"];
  const tradeHits = keywords.filter((k) => t.includes(k) || hay.includes(k));
  return tradeHits.length >= 1;
}

export function verifySource(input: SourceVerificationInput): SourceVerificationResult {
  const ex = input.extracted ?? {};
  const reasons: string[] = [];
  const matches = {
    phone: phonesMatch(ex.phone, input.google_phone),
    email: emailsMatch(ex.email, input.google_email) || emailDomainsMatch(ex.email, input.google_email),
    website: Boolean(ex.website?.trim()),
    business_name: namesMatch(ex.business_name ?? input.business_name, input.business_name),
    location: locationMatch(ex.location, input.google_address, input.town ?? null),
    service_trade: tradeMatch(input.trade ?? null, ex.location ?? ex.business_name ?? ""),
    logo: Boolean(ex.logo_url?.trim()),
  };

  if (matches.phone) reasons.push("Phone number matches Google/lead phone");
  if (matches.email) reasons.push("Email matches or shares domain with lead email");
  if (matches.business_name) reasons.push("Business name matches or clearly aliases Google listing");
  if (matches.location) reasons.push("Location or service area matches Google address/city");
  if (matches.website) reasons.push("Website or domain link visible on source");
  if (matches.logo) reasons.push("Logo or profile image visible on source");
  if (matches.service_trade) reasons.push("Trade or service type matches niche");

  const strongSignals =
    Number(matches.phone) +
    Number(matches.email) +
    Number(matches.business_name && matches.location) +
    Number(matches.phone && matches.business_name);

  let confidence: SourceConfidenceLevel = "low";
  if (matches.phone && (matches.business_name || matches.location)) confidence = "high";
  else if (matches.email && matches.business_name) confidence = "high";
  else if (matches.business_name && matches.location) confidence = "medium";
  else if (strongSignals >= 2) confidence = "medium";
  else if (matches.business_name && !matches.location && !matches.phone) {
    confidence = "low";
    reasons.push("Name match only - common name risk");
  }

  let rejected_reason: string | null = null;
  if (confidence === "low" && !matches.phone && !matches.email) {
    rejected_reason = "Insufficient verification signals for automatic use";
  }

  const verified = confidence !== "low" && confidence !== "rejected" && !rejected_reason;

  return {
    platform: input.platform,
    url: input.url,
    confidence,
    verified,
    verification_reasons: reasons,
    matches,
    rejected_reason,
  };
}

export interface SourceConfidenceSummary {
  overall: SourceConfidenceLevel;
  verified_platforms: string[];
  rejected_platforms: string[];
  notes: string[];
}

export function summarizeSourceConfidence(
  results: SourceVerificationResult[]
): SourceConfidenceSummary {
  const verified = results.filter((r) => r.verified);
  const rejected = results.filter((r) => r.rejected_reason);
  const notes: string[] = [];

  let overall: SourceConfidenceLevel = "low";
  if (verified.some((r) => r.confidence === "high")) overall = "high";
  else if (verified.some((r) => r.confidence === "medium")) overall = "medium";
  else if (verified.length === 0) {
    overall = "low";
    notes.push("No verified sources with medium or high confidence");
  }

  if (rejected.length) {
    notes.push(`${rejected.length} source(s) rejected for low confidence`);
  }

  return {
    overall,
    verified_platforms: verified.map((r) => r.platform),
    rejected_platforms: rejected.map((r) => r.platform),
    notes,
  };
}

export function websiteConfidenceFromDiscovery(
  classification: WebsiteDiscoveryClassification | null
): { blocks_build: boolean; note: string } {
  if (!classification) return { blocks_build: false, note: "No website discovery run" };
  if (classification === "HAS_REAL_SITE") {
    return { blocks_build: true, note: "Real website found - do not build by default" };
  }
  if (classification === "NEEDS_MANUAL_REVIEW") {
    return { blocks_build: true, note: "Website access blocked - manual review required" };
  }
  return { blocks_build: false, note: `Website status: ${classification}` };
}
