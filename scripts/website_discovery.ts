import type { WebsiteStatus } from "./db.js";
import {
  classifyProbeResult,
  detectBrokenSiteReason,
  type FetchProbe,
} from "./website_classify.js";

export type WebsiteDiscoveryClassification =
  | "HAS_REAL_SITE"
  | "BROKEN_OR_BAD_SITE"
  | "SOCIAL_OR_DIRECTORY_ONLY"
  | "PARKED_DOMAIN"
  | "UNDER_CONSTRUCTION"
  | "REDIRECTS_TO_SOCIAL"
  | "REDIRECTS_TO_DIRECTORY"
  | "NEEDS_MANUAL_REVIEW"
  | "NO_WEBSITE";

export interface WebsiteDiscoveryResult {
  classification: WebsiteDiscoveryClassification;
  db_status: WebsiteStatus;
  domain: string | null;
  initial_url: string | null;
  final_url: string | null;
  status_code: number | null;
  title: string | null;
  reason: string;
  probes: { url: string; ok: boolean; status_code: number | null; final_url: string }[];
  text_snippet: string | null;
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; WebForTradesProspector/1.0; +https://www.webfortradesuk.co.uk)";

const SOCIAL_HOSTS = [
  "facebook.com",
  "fb.com",
  "instagram.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "pinterest.com",
];

const DIRECTORY_HOSTS = [
  "yell.com",
  "yell.co.uk",
  "checkatrade.com",
  "trustatrader.com",
  "trust-a-trader.com",
  "mybuilder.com",
  "bark.com",
  "ratedpeople.com",
  "freeindex.co.uk",
  "thomsonlocal.com",
  "hotfrog.co.uk",
  "cylex.co.uk",
  "houzz.",
  "nextdoor.com",
  "nextdoor.co.uk",
  "google.com",
  "maps.google.com",
  "g.page",
  "business.site",
];

const GENERIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "yahoo.com",
  "yahoo.co.uk",
  "icloud.com",
  "live.com",
  "live.co.uk",
  "aol.com",
  "msn.com",
  "me.com",
  "protonmail.com",
  "mail.com",
]);

const PARKED_PATTERNS = [
  /domain (is )?for sale/i,
  /buy this domain/i,
  /parked free/i,
  /domain parking/i,
];

const UNDER_CONSTRUCTION_PATTERNS = [
  /coming soon/i,
  /under construction/i,
  /launching soon/i,
  /website coming soon/i,
  /site under maintenance/i,
];

function normalizeHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function parseUrlSafe(raw: string): URL | null {
  try {
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withScheme);
  } catch {
    return null;
  }
}

function hostMatches(host: string, patterns: string[]): boolean {
  const h = normalizeHost(host);
  return patterns.some((d) => h === d || h.endsWith(`.${d}`) || h.includes(d));
}

function isSocialHost(host: string): boolean {
  return hostMatches(host, SOCIAL_HOSTS);
}

function isDirectoryHost(host: string): boolean {
  return hostMatches(host, DIRECTORY_HOSTS);
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  return decodeHtmlEntities(m[1].replace(/\s+/g, " ").trim().slice(0, 200)) || null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isInvalidProspectWebsiteUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const lower = url.toLowerCase();
  return (
    lower.includes("googleusercontent.com") ||
    lower.includes("maps.googleapis.com") ||
    lower.includes("maps.google.com") ||
    lower.includes("facebook.com/share/") ||
    lower.includes("gstatic.com")
  );
}

export async function lightweightFetch(url: string, timeoutMs = 12000): Promise<FetchProbe> {
  const parsed = parseUrlSafe(url);
  if (!parsed) {
    return {
      ok: false,
      statusCode: null,
      finalUrl: url,
      title: null,
      bodyText: "",
      error: "invalid_url",
    };
  }

  try {
    const res = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const contentType = res.headers.get("content-type") ?? "";
    let bodyText = "";
    let title: string | null = null;

    if (contentType.includes("text/html") || contentType.includes("text/plain")) {
      const raw = await res.text();
      title = extractTitle(raw);
      bodyText = stripHtml(raw).slice(0, 8000);
    }

    return {
      ok: res.ok || (res.status >= 200 && res.status < 400),
      statusCode: res.status,
      finalUrl: res.url || parsed.toString(),
      title,
      bodyText,
      error: null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch_error";
    const code =
      msg.includes("timeout") || msg.includes("aborted")
        ? "timeout"
        : msg.includes("ENOTFOUND") || msg.includes("getaddrinfo")
          ? "dns_error"
          : msg.includes("certificate") || msg.includes("SSL")
            ? "ssl_error"
            : "network_error";
    return {
      ok: false,
      statusCode: null,
      finalUrl: parsed.toString(),
      title: null,
      bodyText: "",
      error: code,
    };
  }
}

export function extractDomainFromEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const m = trimmed.match(/^[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})$/i);
  if (!m) return null;
  const domain = m[1]!.toLowerCase();
  if (GENERIC_EMAIL_DOMAINS.has(domain)) return null;
  return domain;
}

export function buildDomainUrlCandidates(domain: string): string[] {
  const clean = domain.replace(/^www\./, "").toLowerCase();
  return [
    `https://${clean}`,
    `http://${clean}`,
    `https://www.${clean}`,
    `http://www.${clean}`,
  ];
}

function businessNameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["ltd", "limited", "services", "service", "company"].includes(w));
}

export function appearsToBelongToBusiness(
  businessName: string,
  title: string | null,
  bodyText: string
): boolean {
  const tokens = businessNameTokens(businessName);
  const compactName = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hay = `${title ?? ""} ${bodyText}`.toLowerCase();
  const hayCompact = hay.replace(/[^a-z0-9]/g, "");

  if (compactName.length >= 4 && hayCompact.includes(compactName.slice(0, Math.min(compactName.length, 12)))) {
    return true;
  }
  if (tokens.length === 0) return bodyText.length > 250;
  const hits = tokens.filter((t) => hay.includes(t)).length;
  if (hits >= 1) return true;
  if (tokens.length >= 2 && hits === 0) return false;
  return bodyText.length > 400;
}

function mapToDbStatus(classification: WebsiteDiscoveryClassification): WebsiteStatus {
  switch (classification) {
    case "HAS_REAL_SITE":
      return "HAS_REAL_SITE";
    case "NEEDS_MANUAL_REVIEW":
      return "NEEDS_MANUAL_REVIEW";
    case "NO_WEBSITE":
      return "NO_WEBSITE";
    case "SOCIAL_OR_DIRECTORY_ONLY":
    case "REDIRECTS_TO_SOCIAL":
    case "REDIRECTS_TO_DIRECTORY":
      return "SOCIAL_OR_DIRECTORY_ONLY";
    default:
      return "BROKEN_OR_BAD_SITE";
  }
}

function refineClassification(
  base: WebsiteCheckOutcomeLike,
  probe: FetchProbe,
  businessName: string
): WebsiteDiscoveryClassification {
  const finalHost = parseUrlSafe(probe.finalUrl)?.hostname ?? "";
  const combined = `${probe.title ?? ""} ${probe.bodyText}`;

  if (isSocialHost(finalHost)) return "REDIRECTS_TO_SOCIAL";
  if (isDirectoryHost(finalHost)) return "REDIRECTS_TO_DIRECTORY";

  for (const re of PARKED_PATTERNS) {
    if (re.test(combined)) return "PARKED_DOMAIN";
  }
  for (const re of UNDER_CONSTRUCTION_PATTERNS) {
    if (re.test(combined)) return "UNDER_CONSTRUCTION";
  }

  if (base.status === "NEEDS_MANUAL_REVIEW") return "NEEDS_MANUAL_REVIEW";
  if (base.status === "HAS_REAL_SITE") return "HAS_REAL_SITE";
  if (base.status === "SOCIAL_OR_DIRECTORY_ONLY") return "SOCIAL_OR_DIRECTORY_ONLY";
  if (base.status === "NO_WEBSITE") return "NO_WEBSITE";

  const badReason = detectBrokenSiteReason(probe.title, probe.bodyText);
  if (badReason === "parked_domain") return "PARKED_DOMAIN";
  if (badReason === "coming_soon_page") return "UNDER_CONSTRUCTION";

  return "BROKEN_OR_BAD_SITE";
}

interface WebsiteCheckOutcomeLike {
  status: WebsiteStatus;
  notes: string;
}

export async function discoverWebsiteAtUrl(
  url: string,
  businessName: string
): Promise<WebsiteDiscoveryResult> {
  const initial = url.trim();
  const parsed = parseUrlSafe(initial);
  const domain = parsed ? normalizeHost(parsed.hostname) : null;

  if (!initial) {
    return {
      classification: "NO_WEBSITE",
      db_status: "NO_WEBSITE",
      domain: null,
      initial_url: null,
      final_url: null,
      status_code: null,
      title: null,
      reason: "empty_url",
      probes: [],
      text_snippet: null,
    };
  }

  if (isSocialHost(parsed?.hostname ?? "")) {
    return {
      classification: "REDIRECTS_TO_SOCIAL",
      db_status: "SOCIAL_OR_DIRECTORY_ONLY",
      domain,
      initial_url: initial,
      final_url: initial,
      status_code: null,
      title: null,
      reason: "url_is_social_host",
      probes: [],
      text_snippet: null,
    };
  }

  if (isDirectoryHost(parsed?.hostname ?? "")) {
    return {
      classification: "REDIRECTS_TO_DIRECTORY",
      db_status: "SOCIAL_OR_DIRECTORY_ONLY",
      domain,
      initial_url: initial,
      final_url: initial,
      status_code: null,
      title: null,
      reason: "url_is_directory_host",
      probes: [],
      text_snippet: null,
    };
  }

  const probe = await lightweightFetch(initial);
  const finalHost = parseUrlSafe(probe.finalUrl)?.hostname ?? "";
  const finalIsSocial = isSocialHost(finalHost);
  const finalIsDirectory = isDirectoryHost(finalHost);

  const hasServicesOrContact =
    /\b(contact|call us|get in touch|our services|services|about us|plumbing|heating|electric|quote|bathroom)\b/i.test(
      probe.bodyText
    );

  const base = classifyProbeResult({
    initialUrl: initial,
    businessName,
    probe,
    finalUrlIsSocialOrDirectory: finalIsSocial || finalIsDirectory,
    appearsToBelongToBusiness: appearsToBelongToBusiness(businessName, probe.title, probe.bodyText),
    hasServicesOrContact,
  });

  const classification = refineClassification(base, probe, businessName);

  return {
    classification,
    db_status: mapToDbStatus(classification),
    domain,
    initial_url: initial,
    final_url: probe.finalUrl,
    status_code: probe.statusCode,
    title: probe.title,
    reason: base.notes,
    probes: [{ url: initial, ok: probe.ok, status_code: probe.statusCode, final_url: probe.finalUrl }],
    text_snippet: probe.bodyText.slice(0, 400) || null,
  };
}

export async function discoverWebsiteFromEmailDomain(
  email: string,
  businessName: string
): Promise<WebsiteDiscoveryResult> {
  const domain = extractDomainFromEmail(email);
  if (!domain) {
    return {
      classification: "NO_WEBSITE",
      db_status: "NO_WEBSITE",
      domain: null,
      initial_url: null,
      final_url: null,
      status_code: null,
      title: null,
      reason: "generic_or_invalid_email_domain",
      probes: [],
      text_snippet: null,
    };
  }

  const candidates = buildDomainUrlCandidates(domain);
  const probes: WebsiteDiscoveryResult["probes"] = [];
  let best: WebsiteDiscoveryResult | null = null;

  for (const url of candidates) {
    const result = await discoverWebsiteAtUrl(url, businessName);
    probes.push(...result.probes);
    if (!best) best = result;
    if (
      result.classification === "HAS_REAL_SITE" ||
      result.classification === "NEEDS_MANUAL_REVIEW"
    ) {
      best = { ...result, domain, probes };
      break;
    }
    if (
      result.classification !== "NO_WEBSITE" &&
      result.classification !== "BROKEN_OR_BAD_SITE" &&
      best.classification === "BROKEN_OR_BAD_SITE"
    ) {
      best = { ...result, domain, probes };
    }
  }

  return { ...(best ?? { classification: "NO_WEBSITE" as const, db_status: "NO_WEBSITE" as const, domain, initial_url: candidates[0]!, final_url: null, status_code: null, title: null, reason: "all_candidates_failed", probes, text_snippet: null }) };
}

export async function discoverBestWebsite(input: {
  businessName: string;
  googleWebsiteUrl?: string | null;
  emails?: string[];
}): Promise<{
  primary: WebsiteDiscoveryResult | null;
  email_domain: WebsiteDiscoveryResult | null;
  google_listing: WebsiteDiscoveryResult | null;
}> {
  let google_listing: WebsiteDiscoveryResult | null = null;
  if (input.googleWebsiteUrl?.trim()) {
    google_listing = await discoverWebsiteAtUrl(input.googleWebsiteUrl.trim(), input.businessName);
  }

  let email_domain: WebsiteDiscoveryResult | null = null;
  for (const email of input.emails ?? []) {
    const found = await discoverWebsiteFromEmailDomain(email, input.businessName);
    if (found.domain && found.classification !== "NO_WEBSITE") {
      email_domain = found;
      break;
    }
    if (!email_domain) email_domain = found;
  }

  let primary: WebsiteDiscoveryResult | null = null;
  if (email_domain?.classification === "HAS_REAL_SITE") primary = email_domain;
  else if (google_listing?.classification === "HAS_REAL_SITE") primary = google_listing;
  else if (email_domain && email_domain.classification !== "NO_WEBSITE") primary = email_domain;
  else if (google_listing) primary = google_listing;
  else primary = email_domain;

  return { primary, email_domain, google_listing };
}
