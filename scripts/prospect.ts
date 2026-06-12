import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import {
  findLeadByNameAndRegion,
  insertLead,
  type WebsiteStatus,
} from "./db.js";
import {
  classifyUkPhone,
  isWhatsAppCandidate,
  normalizeUkPhoneDigits,
  type PhoneType,
} from "./phone_utils.js";
import {
  classifyGeoRelevance,
  geoBlocksQualifiedReady,
  type GeoRelevance,
} from "./geo_relevance.js";
import {
  classifyTradeRelevance,
  tradeRelevanceScoreDelta,
  type TradeRelevance,
} from "./trade_relevance.js";
import {
  accessHintsFromRawHtml,
  classifyProbeResult,
  formatCheckNotes,
  type FetchProbe,
} from "./website_classify.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FETCH_TIMEOUT_MS = 7000;
const MAX_HTML_CHARS = 350_000;
const MAX_STRIPPED_CHARS = 25_000;

interface Config {
  daily_build_cap: number;
  approval_mode: string;
}

interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string }[];
  types?: string[];
  website?: string;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string;
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string }[];
  reviews?: { time: number; text?: string }[];
  types?: string[];
  opening_hours?: { open_now?: boolean };
  vicinity?: string;
}

interface WebsiteCheckOutcome {
  status: WebsiteStatus;
  notes: string;
  initialUrl: string | null;
  finalUrl: string | null;
  statusCode: number | null;
  title: string | null;
}

const SOCIAL_OR_DIRECTORY_HOSTS = [
  "facebook.com",
  "fb.com",
  "m.facebook.com",
  "instagram.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "linktr.ee",
  "linktree.com",
  "yell.com",
  "yell.co.uk",
  "checkatrade.com",
  "trustatrader.com",
  "trust-a-trader.com",
  "mybuilder.com",
  "bark.com",
  "gumtree.com",
  "google.com",
  "maps.google.com",
  "g.page",
  "business.site",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "pinterest.com",
  "nextdoor.com",
  "tripadvisor.",
  "yelp.com",
  "freeindex.co.uk",
  "thomsonlocal.com",
  "hotfrog.co.uk",
  "cylex.co.uk",
  "wa.me",
  "whatsapp.com",
];

const BOOKING_QUOTE_HOSTS = [
  "calendly.com",
  "simplybook.me",
  "fresha.com",
  "acuityscheduling.com",
  "booksy.com",
  "square.site",
  "squarespace.com",
  "wixsite.com",
  "godaddysites.com",
];

const HIGH_MARGIN_NICHES = [
  "plumber",
  "electrician",
  "dentist",
  "solicitor",
  "accountant",
  "builder",
  "roofer",
  "landscap",
  "hvac",
  "heating",
  "vet",
  "physio",
  "chiropract",
  "architect",
  "surveyor",
  "locksmith",
  "garage",
  "beauty salon",
  "hairdress",
  "barber",
  "caterer",
  "cleaning",
];

const PAGINATION_WAIT_MS = 2000;
const PAGINATION_MAX_RETRIES = 3;
const DEFAULT_TARGET_UNIQUE = 40;

const BRISTOL_PLUMBER_EXPANDED = [
  "emergency plumbers in Bristol",
  "bathroom plumbers in Bristol",
  "plumbing repairs Bristol",
  "plumbers near Bristol",
  "plumbers in Bedminster",
  "plumbers in Clifton",
  "plumbers in Fishponds",
  "plumbers in Kingswood",
  "plumbers in Southville",
  "plumbers in Bishopston",
  "plumbers in Redland",
  "plumbers in St George Bristol",
];

const EMERGENCY_NICHE_HINTS = [
  "plumb",
  "electric",
  "locksmith",
  "roof",
  "builder",
  "heat",
  "hvac",
  "dentist",
  "gas",
  "drain",
];

const CITY_AREA_HINTS: Record<string, string[]> = {
  bristol: [
    "Bedminster",
    "Clifton",
    "Fishponds",
    "Kingswood",
    "Southville",
    "Bishopston",
    "Redland",
    "St George Bristol",
  ],
  london: ["Croydon", "Hackney", "Camden", "Islington", "Bromley", "Ealing"],
  manchester: ["Salford", "Stockport", "Didsbury", "Chorlton", "Withington"],
  birmingham: ["Edgbaston", "Moseley", "Kings Heath", "Sutton Coldfield"],
  leeds: ["Headingley", "Chapel Allerton", "Roundhay", "Horsforth"],
  glasgow: ["West End Glasgow", "Southside Glasgow", "Partick", "Dennistoun"],
};

function loadEnv(): Record<string, string> {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return {};
  const vars: Record<string, string> = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

function loadConfig(): Config {
  const raw = fs.readFileSync(path.join(ROOT, "config.yaml"), "utf8");
  return parseYaml(raw) as Config;
}

function parseArgs(): {
  location: string;
  niche: string;
  dryRun: boolean;
  targetUnique: number;
  showDuplicates: boolean;
  includeManualReview: boolean;
} {
  const args = process.argv.slice(2);
  let location = "";
  let niche = "";
  let dryRun = false;
  let targetUnique = DEFAULT_TARGET_UNIQUE;
  let showDuplicates = false;
  let includeManualReview = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--location" && args[i + 1]) location = args[++i];
    else if (args[i] === "--niche" && args[i + 1]) niche = args[++i];
    else if (args[i] === "--dry-run") dryRun = true;
    else if (args[i] === "--target-unique" && args[i + 1]) {
      targetUnique = Math.max(1, parseInt(args[++i], 10) || DEFAULT_TARGET_UNIQUE);
    } else if (args[i] === "--show-duplicates") showDuplicates = true;
    else if (args[i] === "--include-manual-review") includeManualReview = true;
  }

  if (!location && process.env.LOCATION) location = process.env.LOCATION;
  if (!niche && process.env.NICHE) niche = process.env.NICHE;

  return { location, niche, dryRun, targetUnique, showDuplicates, includeManualReview };
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

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

function isSocialOrDirectoryHost(hostname: string, pathname = ""): boolean {
  const host = normalizeHost(hostname);
  if (SOCIAL_OR_DIRECTORY_HOSTS.some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d))) {
    return true;
  }
  if (host.includes("google.") && pathname.includes("/maps")) return true;
  return false;
}

function isBookingOrQuoteOnlyHost(hostname: string): boolean {
  const host = normalizeHost(hostname);
  return BOOKING_QUOTE_HOSTS.some((d) => host === d || host.endsWith(`.${d}`));
}

function isSocialOrDirectoryUrl(url: string): boolean {
  const parsed = parseUrlSafe(url);
  if (!parsed) return false;
  if (isSocialOrDirectoryHost(parsed.hostname, parsed.pathname)) return true;
  if (isBookingOrQuoteOnlyHost(parsed.hostname)) return true;
  const path = parsed.pathname.toLowerCase();
  if (
    /^\/(book|booking|quote|request-quote|get-a-quote|appointments?)\/?$/i.test(path) &&
    parsed.searchParams.toString().length > 0
  ) {
    return true;
  }
  return false;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ");
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

async function lightweightFetch(url: string): Promise<FetchProbe> {
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
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WebForTradesProspector/1.0; +https://www.webfortradesuk.co.uk)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const contentType = res.headers.get("content-type") ?? "";
    let bodyText = "";
    let title: string | null = null;

    if (contentType.includes("text/html") || contentType.includes("text/plain")) {
      const raw = await res.text();
      title = extractTitle(raw);
      const clipped = raw.slice(0, MAX_HTML_CHARS);
      const hints = accessHintsFromRawHtml(clipped);
      bodyText = [hints, stripHtml(clipped).slice(0, MAX_STRIPPED_CHARS)]
        .filter(Boolean)
        .join(" ")
        .trim();
    }

    return {
      ok: true,
      statusCode: res.status,
      finalUrl: res.url,
      title,
      bodyText,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();
    let code = "fetch_error";
    if (lower.includes("abort") || lower.includes("timeout")) code = "timeout";
    else if (lower.includes("certificate") || lower.includes("ssl") || lower.includes("tls")) {
      code = "ssl_error";
    } else if (lower.includes("enotfound") || lower.includes("getaddrinfo")) code = "dns_error";
    else if (lower.includes("econnrefused") || lower.includes("network")) code = "network_error";

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

function businessNameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["ltd", "limited", "services", "service", "company"].includes(w));
}

function appearsToBelongToBusiness(
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

async function classifyWebsite(
  website: string | undefined,
  businessName: string
): Promise<WebsiteCheckOutcome> {
  if (!website?.trim()) {
    return {
      status: "NO_WEBSITE",
      notes: "google_places_website=empty",
      initialUrl: null,
      finalUrl: null,
      statusCode: null,
      title: null,
    };
  }

  const initialUrl = website.trim();

  if (isSocialOrDirectoryUrl(initialUrl)) {
    return {
      status: "SOCIAL_OR_DIRECTORY_ONLY",
      notes: formatCheckNotes({ reason: "social_or_directory_host", url: initialUrl }),
      initialUrl,
      finalUrl: initialUrl,
      statusCode: null,
      title: null,
    };
  }

  const probe = await lightweightFetch(initialUrl);

  const hasServicesOrContact =
    /\b(contact|call us|get in touch|our services|services|about us|plumbing|heating|electric|quote)\b/i.test(
      probe.bodyText
    );

  return classifyProbeResult({
    initialUrl,
    businessName,
    probe,
    finalUrlIsSocialOrDirectory: isSocialOrDirectoryUrl(probe.finalUrl),
    appearsToBelongToBusiness: appearsToBelongToBusiness(
      businessName,
      probe.title,
      probe.bodyText
    ),
    hasServicesOrContact,
  });
}

function nicheMarginBonus(niche: string): number {
  const lower = niche.toLowerCase();
  return HIGH_MARGIN_NICHES.some((n) => lower.includes(n)) ? 10 : 0;
}

function isSketchyListing(details: PlaceDetails): boolean {
  const reviews = details.user_ratings_total ?? 0;
  const rating = details.rating ?? 0;
  if (reviews < 3) return true;
  if (rating > 0 && rating < 3.5) return true;
  if (details.business_status && details.business_status !== "OPERATIONAL") return true;
  return false;
}

interface ScoreResult {
  score: number;
  reasons: string[];
  phoneType: PhoneType;
  whatsappCandidate: boolean;
}

function scoreLead(
  details: PlaceDetails,
  niche: string,
  websiteOutcome: WebsiteCheckOutcome,
  email: string | null | undefined,
  tradeRelevance: TradeRelevance
): ScoreResult {
  let score = 0;
  const reasons: string[] = [];

  switch (websiteOutcome.status) {
    case "NO_WEBSITE":
      score += 30;
      reasons.push("+30 NO_WEBSITE");
      break;
    case "SOCIAL_OR_DIRECTORY_ONLY":
      score += 25;
      reasons.push("+25 SOCIAL_OR_DIRECTORY_ONLY");
      break;
    case "BROKEN_OR_BAD_SITE":
      score += 20;
      reasons.push("+20 BROKEN_OR_BAD_SITE");
      break;
    case "NEEDS_MANUAL_REVIEW":
      score += 5;
      reasons.push("+5 NEEDS_MANUAL_REVIEW");
      break;
    case "HAS_REAL_SITE":
      score -= 20;
      reasons.push("-20 HAS_REAL_SITE");
      break;
  }

  const phone =
    details.formatted_phone_number ?? details.international_phone_number;
  const phoneType = classifyUkPhone(phone);
  const whatsappCandidate = isWhatsAppCandidate(phone);

  if (
    whatsappCandidate &&
    (websiteOutcome.status === "NO_WEBSITE" ||
      websiteOutcome.status === "SOCIAL_OR_DIRECTORY_ONLY" ||
      websiteOutcome.status === "BROKEN_OR_BAD_SITE")
  ) {
    score += 8;
    reasons.push("+8 mobile_whatsapp_priority");
  }

  if (phone) {
    score += 15;
    reasons.push("+15 phone_available");
  } else {
    score -= 30;
    reasons.push("-30 no_phone");
  }

  if (phoneType === "landline" && !email?.trim()) {
    score -= 12;
    reasons.push("-12 landline_only_no_email");
  }

  const reviewCount = details.user_ratings_total ?? 0;
  if (reviewCount >= 10) {
    score += 10;
    reasons.push("+10 reviews_10plus");
  }

  const rating = details.rating ?? 0;
  if (rating >= 4.5) {
    score += 10;
    reasons.push("+10 rating_4_5plus");
  }

  const photoCount = details.photos?.length ?? 0;
  if (photoCount >= 3) {
    score += 10;
    reasons.push("+10 photos_3plus");
  }

  const nicheBonus = nicheMarginBonus(niche);
  if (nicheBonus) {
    score += nicheBonus;
    reasons.push(`+${nicheBonus} strong_niche`);
  }

  if (websiteOutcome.status === "SOCIAL_OR_DIRECTORY_ONLY") {
    score += 5;
    reasons.push("+5 visible_social");
  }

  if (isSketchyListing(details)) {
    score -= 20;
    reasons.push("-20 sketchy_listing");
  }

  const tradeDelta = tradeRelevanceScoreDelta(tradeRelevance);
  if (tradeDelta) {
    score += tradeDelta;
    reasons.push(`${tradeDelta} trade_${tradeRelevance}`);
  } else {
    reasons.push("trade_primary_trade_match");
  }

  if (
    tradeRelevance === "primary_trade_match" &&
    whatsappCandidate &&
    (websiteOutcome.status === "NO_WEBSITE" ||
      websiteOutcome.status === "SOCIAL_OR_DIRECTORY_ONLY" ||
      websiteOutcome.status === "BROKEN_OR_BAD_SITE")
  ) {
    score += 5;
    reasons.push("+5 primary_trade_mobile_priority");
  }

  reasons.push(whatsappCandidate ? "whatsapp_candidate=true" : "whatsapp_candidate=false");
  reasons.push(`phone_type=${phoneType}`);

  return { score, reasons, phoneType, whatsappCandidate };
}

async function fetchPlacesPage(
  apiKey: string,
  query?: string,
  pageToken?: string
): Promise<{
  status: string;
  results?: PlaceSearchResult[];
  next_page_token?: string;
  error_message?: string;
}> {
  const params = new URLSearchParams({ key: apiKey });
  if (pageToken) params.set("pagetoken", pageToken);
  else if (query) params.set("query", query);
  else throw new Error("Places search requires query or pagetoken");

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
  const res = await fetch(url);
  return (await res.json()) as {
    status: string;
    results?: PlaceSearchResult[];
    next_page_token?: string;
    error_message?: string;
  };
}

function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function normalizePhoneKey(phone: string | null | undefined): string {
  if (!phone?.trim()) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("44")) digits = `0${digits.slice(2)}`;
  return digits;
}

function normalizeAddressKey(address: string | null | undefined): string {
  if (!address?.trim()) return "";
  return address
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function nicheSingular(niche: string): string {
  const n = niche.trim().toLowerCase();
  if (n.endsWith("ies")) return `${n.slice(0, -3)}y`;
  if (n.endsWith("s") && !n.endsWith("ss")) return n.slice(0, -1);
  return n;
}

function buildExpandedQueries(niche: string, location: string): string[] {
  const loc = location.trim();
  const n = niche.trim().toLowerCase();

  if (loc.toLowerCase() === "bristol" && n === "plumbers") {
    return [...BRISTOL_PLUMBER_EXPANDED];
  }

  const queries: string[] = [];
  const singular = nicheSingular(niche);

  if (EMERGENCY_NICHE_HINTS.some((h) => n.includes(h))) {
    queries.push(`emergency ${n} in ${loc}`);
  }

  if (n.includes("plumb")) {
    queries.push(`bathroom plumbers in ${loc}`);
    queries.push(`plumbing repairs ${loc}`);
  } else if (n.includes("electric")) {
    queries.push(`electrical repairs ${loc}`);
    queries.push(`${n} services ${loc}`);
  } else if (n.includes("roof")) {
    queries.push(`roof repairs ${loc}`);
    queries.push(`emergency ${n} ${loc}`);
  } else if (n.includes("paint") || n.includes("decor")) {
    queries.push(`${n} services ${loc}`);
    queries.push(`${singular} near ${loc}`);
  } else {
    queries.push(`${singular} repairs ${loc}`);
    queries.push(`${n} services ${loc}`);
  }

  queries.push(`${n} near ${loc}`);

  const areas =
    CITY_AREA_HINTS[loc.toLowerCase()] ??
    [`${loc} city centre`, `near ${loc}`];

  for (const area of areas) {
    queries.push(`${n} in ${area}`);
  }

  const base = `${niche} in ${location}`.toLowerCase();
  return [...new Set(queries.map((q) => q.trim()))].filter(
    (q) => q.toLowerCase() !== base
  );
}

class PlaceSearchDeduper {
  private readonly byPlaceId = new Set<string>();
  private readonly byNameAddress = new Set<string>();
  private readonly places = new Map<string, PlaceSearchResult>();

  addFromSearch(place: PlaceSearchResult): boolean {
    const placeId = place.place_id;
    if (!placeId || this.byPlaceId.has(placeId)) return false;

    const nameKey = normalizeBusinessName(place.name);
    const addrKey = normalizeAddressKey(place.formatted_address);
    if (nameKey && addrKey) {
      const nameAddr = `${nameKey}|${addrKey}`;
      if (this.byNameAddress.has(nameAddr)) return false;
      this.byNameAddress.add(nameAddr);
    }

    this.byPlaceId.add(placeId);
    this.places.set(placeId, place);
    return true;
  }

  uniqueCount(): number {
    return this.places.size;
  }

  all(): PlaceSearchResult[] {
    return [...this.places.values()];
  }
}

class DetailsDeduper {
  private readonly byNamePhone = new Set<string>();
  private readonly processedPlaceIds = new Set<string>();

  shouldProcess(details: PlaceDetails): boolean {
    if (this.processedPlaceIds.has(details.place_id)) return false;

    const nameKey = normalizeBusinessName(details.name);
    const phoneKey = normalizePhoneKey(
      details.formatted_phone_number ?? details.international_phone_number
    );

    if (nameKey && phoneKey) {
      const namePhone = `${nameKey}|${phoneKey}`;
      if (this.byNamePhone.has(namePhone)) return false;
      this.byNamePhone.add(namePhone);
    }

    this.processedPlaceIds.add(details.place_id);
    return true;
  }
}

async function googlePlacesTextSearch(
  query: string,
  apiKey: string
): Promise<{
  results: PlaceSearchResult[];
  pagesFetched: number;
  rawPlacesSeen: number;
  paginationFailed: boolean;
}> {
  const byId = new Map<string, PlaceSearchResult>();
  let pagesFetched = 0;
  let rawPlacesSeen = 0;
  let pageToken: string | undefined;
  let paginationFailed = false;

  const first = await fetchPlacesPage(apiKey, query);
  pagesFetched++;

  if (first.status !== "OK" && first.status !== "ZERO_RESULTS") {
    throw new Error(
      `Places Text Search failed: ${first.status}${first.error_message ? ` - ${first.error_message}` : ""}`
    );
  }

  for (const place of first.results ?? []) {
    rawPlacesSeen++;
    byId.set(place.place_id, place);
  }
  pageToken = first.next_page_token;

  while (pageToken) {
    await sleep(PAGINATION_WAIT_MS);

    let pageData: Awaited<ReturnType<typeof fetchPlacesPage>> | null = null;
    let pageOk = false;
    for (let attempt = 1; attempt <= PAGINATION_MAX_RETRIES; attempt++) {
      pageData = await fetchPlacesPage(apiKey, undefined, pageToken);
      if (pageData.status === "OK" || pageData.status === "ZERO_RESULTS") {
        pageOk = true;
        break;
      }
      if (pageData.status === "INVALID_REQUEST" && attempt < PAGINATION_MAX_RETRIES) {
        console.warn(
          `[${query}] page token not ready (attempt ${attempt}/${PAGINATION_MAX_RETRIES}), retrying...`
        );
        await sleep(PAGINATION_WAIT_MS);
        continue;
      }
      break;
    }

    if (!pageOk) {
      console.warn(
        `[${query}] pagination stopped after ${PAGINATION_MAX_RETRIES} retries: ${pageData?.status ?? "unknown"}${pageData?.error_message ? ` - ${pageData.error_message}` : ""}`
      );
      paginationFailed = true;
      break;
    }

    if (!pageData) break;
    if (pageData.status !== "OK" && pageData.status !== "ZERO_RESULTS") {
      paginationFailed = true;
      break;
    }

    pagesFetched++;
    for (const place of pageData.results ?? []) {
      rawPlacesSeen++;
      byId.set(place.place_id, place);
    }
    pageToken = pageData.next_page_token;
  }

  return {
    results: [...byId.values()],
    pagesFetched,
    rawPlacesSeen,
    paginationFailed,
  };
}

interface ExpandedSearchResult {
  baseQuery: string;
  expandedQueriesRun: string[];
  pagesFetched: number;
  totalRawPlacesSeen: number;
  totalUniquePlacesSeen: number;
  places: PlaceSearchResult[];
}

async function collectPlacesWithExpansion(
  niche: string,
  location: string,
  apiKey: string,
  targetUnique: number
): Promise<ExpandedSearchResult> {
  const baseQuery = `${niche} in ${location}`;
  const deduper = new PlaceSearchDeduper();
  let pagesFetched = 0;
  let totalRawPlacesSeen = 0;
  const expandedQueriesRun: string[] = [];

  const base = await googlePlacesTextSearch(baseQuery, apiKey);
  pagesFetched += base.pagesFetched;
  totalRawPlacesSeen += base.rawPlacesSeen;
  for (const place of base.results) {
    deduper.addFromSearch(place);
  }

  const needsExpansion =
    base.paginationFailed || deduper.uniqueCount() < targetUnique;

  if (needsExpansion) {
    const expanded = buildExpandedQueries(niche, location);
    for (const query of expanded) {
      if (deduper.uniqueCount() >= targetUnique) break;

      await sleep(350);
      try {
        const extra = await googlePlacesTextSearch(query, apiKey);
        pagesFetched += extra.pagesFetched;
        totalRawPlacesSeen += extra.rawPlacesSeen;
        let added = 0;
        for (const place of extra.results) {
          if (deduper.addFromSearch(place)) added++;
        }
        expandedQueriesRun.push(query);
        console.log(
          `  expanded: "${query}" -> +${added} unique (${deduper.uniqueCount()} total)`
        );
      } catch (err) {
        console.warn(`  expanded query failed "${query}": ${(err as Error).message}`);
      }
    }
  }

  return {
    baseQuery,
    expandedQueriesRun,
    pagesFetched,
    totalRawPlacesSeen,
    totalUniquePlacesSeen: deduper.uniqueCount(),
    places: deduper.all(),
  };
}

async function googlePlaceDetails(
  placeId: string,
  apiKey: string
): Promise<PlaceDetails> {
  const fields = [
    "place_id",
    "name",
    "formatted_address",
    "formatted_phone_number",
    "international_phone_number",
    "website",
    "url",
    "business_status",
    "rating",
    "user_ratings_total",
    "photos",
    "reviews",
    "types",
    "opening_hours",
    "vicinity",
  ].join(",");

  const params = new URLSearchParams({ place_id: placeId, fields, key: apiKey });
  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    result?: PlaceDetails;
    error_message?: string;
  };

  if (data.status !== "OK" || !data.result) {
    throw new Error(
      `Place Details failed for ${placeId}: ${data.status}${data.error_message ? ` - ${data.error_message}` : ""}`
    );
  }

  return data.result;
}

type LeadQueue = "qualified_ready" | "needs_manual_review" | "discarded";

interface ProcessedCandidate {
  details: PlaceDetails;
  websiteOutcome: WebsiteCheckOutcome;
  score: number;
  scoreReasons: string[];
  phoneType: PhoneType;
  tradeRelevance: TradeRelevance;
  tradeRelevanceNotes: string;
  geoRelevance: GeoRelevance;
  geoRelevanceNotes: string;
  manualReviewReasons: string[];
  duplicatePhoneCluster: boolean;
  duplicateOf: string | null;
  duplicateClusterId: string | null;
  queue: LeadQueue;
}

function phoneClusterKey(details: PlaceDetails): string | null {
  const phone =
    details.formatted_phone_number ?? details.international_phone_number;
  if (!phone?.trim()) return null;
  const digits = normalizeUkPhoneDigits(phone);
  return digits.length >= 10 ? digits : null;
}

function applyPhoneClusterDedupe(candidates: ProcessedCandidate[]): number {
  const byPhone = new Map<string, ProcessedCandidate[]>();
  for (const c of candidates) {
    const key = phoneClusterKey(c.details);
    if (!key) continue;
    const group = byPhone.get(key) ?? [];
    group.push(c);
    byPhone.set(key, group);
  }

  let clusterCount = 0;
  for (const [key, group] of byPhone) {
    if (group.length < 2) continue;
    clusterCount++;
    group.sort((a, b) => b.score - a.score);
    const primary = group[0];
    for (let i = 1; i < group.length; i++) {
      const dup = group[i];
      dup.duplicatePhoneCluster = true;
      dup.duplicateOf = primary.details.place_id;
      dup.duplicateClusterId = key;
    }
  }
  return clusterCount;
}

function applyGeoQuality(c: ProcessedCandidate, location: string): void {
  const phone =
    c.details.formatted_phone_number ?? c.details.international_phone_number ?? null;
  const geo = classifyGeoRelevance(
    {
      location,
      formattedAddress: c.details.formatted_address,
      vicinity: c.details.vicinity,
      name: c.details.name,
      phone,
    },
    { hasEmail: false }
  );
  c.geoRelevance = geo.relevance;
  c.geoRelevanceNotes = geo.notes;

  if (geoBlocksQualifiedReady(geo.relevance)) {
    if (geo.relevance === "foreign_phone_for_uk_query") {
      c.manualReviewReasons.push("foreign_phone_for_uk_query");
    } else if (geo.relevance === "geo_uncertain") {
      c.manualReviewReasons.push("geo_uncertain");
    } else if (geo.relevance === "no_uk_contact") {
      c.manualReviewReasons.push("no_uk_contact");
    }
  }
}

function assignLeadQueue(c: ProcessedCandidate): void {
  const reasons = [...c.manualReviewReasons];

  if (c.websiteOutcome.status === "NEEDS_MANUAL_REVIEW") {
    reasons.push("bot_or_access_blocked");
  }
  if (c.tradeRelevance === "mixed_trade_match") {
    reasons.push("mixed_trade");
  }
  if (c.tradeRelevance === "weak_trade_match") {
    reasons.push("weak_or_unclear_trade");
  }
  if (c.duplicatePhoneCluster) {
    reasons.push("duplicate_phone_cluster");
  }
  if (isSketchyListing(c.details)) {
    reasons.push("unclear_business_identity");
  }

  const unique = [...new Set(reasons)];
  c.manualReviewReasons = unique;
  if (c.websiteOutcome.status === "NEEDS_MANUAL_REVIEW") {
    c.queue = "needs_manual_review";
  } else {
    c.queue = unique.length ? "needs_manual_review" : "qualified_ready";
  }
}

function buildLeadNotes(
  websiteNotes: string,
  scoreReasons: string[],
  tradeRelevance: TradeRelevance,
  tradeRelevanceNotes: string,
  geoRelevance?: GeoRelevance,
  geoRelevanceNotes?: string,
  extra?: {
    duplicatePhoneCluster?: boolean;
    duplicateOf?: string | null;
    duplicateClusterId?: string | null;
    manualReviewReasons?: string[];
  }
): string {
  const parts = [
    websiteNotes,
    `trade_relevance=${tradeRelevance}`,
    tradeRelevanceNotes ? `trade_relevance_notes=${tradeRelevanceNotes}` : "",
    geoRelevance ? `geo_relevance=${geoRelevance}` : "",
    geoRelevanceNotes ? `geo_relevance_notes=${geoRelevanceNotes}` : "",
    `score_reasons=${scoreReasons.join(", ")}`,
  ];
  if (extra?.duplicatePhoneCluster) {
    parts.push("duplicate_phone_cluster=true");
    if (extra.duplicateOf) parts.push(`duplicate_of=${extra.duplicateOf}`);
    if (extra.duplicateClusterId) {
      parts.push(`duplicate_cluster_id=${extra.duplicateClusterId}`);
    }
  }
  if (extra?.manualReviewReasons?.length) {
    parts.push(`manual_review=${extra.manualReviewReasons.join(",")}`);
  }
  return parts.filter(Boolean).join("; ");
}

function approvalIncludesBuild(mode: string): boolean {
  return mode.includes("ask_before_build") || mode === "ask_both";
}

async function main(): Promise<void> {
  const {
    location,
    niche,
    dryRun,
    targetUnique,
    showDuplicates,
    includeManualReview,
  } = parseArgs();

  if (
    !location ||
    !niche ||
    location.includes("TYPE HERE") ||
    niche.includes("TYPE HERE")
  ) {
    console.error(
      'Usage: npx tsx scripts/prospect.ts --location "Bristol" --niche "plumbers" [--dry-run] [--target-unique 80] [--show-duplicates] [--include-manual-review]'
    );
    process.exit(1);
  }

  const env = { ...process.env, ...loadEnv() };
  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_PLACES_API_KEY in .env");
    process.exit(1);
  }

  const config = loadConfig();

  console.log(`Prospecting: ${niche} in ${location}`);
  if (dryRun) console.log("(dry-run: no leads will be inserted)\n");

  const search = await collectPlacesWithExpansion(
    niche,
    location,
    apiKey,
    targetUnique
  );

  console.log(`baseQuery: ${search.baseQuery}`);
  console.log(
    `expandedQueriesRun: ${search.expandedQueriesRun.length ? search.expandedQueriesRun.join(" | ") : "(none)"}`
  );
  console.log(`pagesFetched: ${search.pagesFetched}`);
  console.log(`totalRawPlacesSeen: ${search.totalRawPlacesSeen}`);
  console.log(`totalUniquePlacesSeen: ${search.totalUniquePlacesSeen}\n`);

  const detailsDeduper = new DetailsDeduper();

  const processed: ProcessedCandidate[] = [];
  let discardedRealSite = 0;
  let discardedIrrelevant = 0;
  let skippedDuplicate = 0;

  for (const place of search.places) {
    await sleep(120);
    let details: PlaceDetails;
    try {
      details = await googlePlaceDetails(place.place_id, apiKey);
    } catch (err) {
      console.warn(`Skipping ${place.name}: ${(err as Error).message}`);
      continue;
    }

    if (!detailsDeduper.shouldProcess(details)) {
      skippedDuplicate++;
      continue;
    }

    const websiteOutcome = await classifyWebsite(details.website, details.name);

    if (websiteOutcome.status === "HAS_REAL_SITE") {
      discardedRealSite++;
      console.log(`  discard (HAS_REAL_SITE): ${details.name}`);
      continue;
    }

    const reviewTexts = (details.reviews ?? [])
      .map((r) => r.text ?? "")
      .filter(Boolean)
      .slice(0, 5);
    const extraText = [
      websiteOutcome.title ?? "",
      websiteOutcome.notes ?? "",
    ].join(" ");

    const trade = classifyTradeRelevance({
      businessName: details.name,
      niche,
      types: details.types ?? place.types,
      reviewTexts,
      extraText,
    });

    if (trade.relevance === "irrelevant_trade") {
      discardedIrrelevant++;
      console.log(
        `  discard (irrelevant_trade): ${details.name} - ${trade.notes}`
      );
      continue;
    }

    const scored = scoreLead(details, niche, websiteOutcome, null, trade.relevance);
    const candidate: ProcessedCandidate = {
      details,
      websiteOutcome,
      score: scored.score,
      scoreReasons: scored.reasons,
      phoneType: scored.phoneType,
      tradeRelevance: trade.relevance,
      tradeRelevanceNotes: trade.notes,
      geoRelevance: "uk_location_match",
      geoRelevanceNotes: "",
      manualReviewReasons: [],
      duplicatePhoneCluster: false,
      duplicateOf: null,
      duplicateClusterId: null,
      queue: "qualified_ready",
    };
    applyGeoQuality(candidate, location);
    assignLeadQueue(candidate);
    processed.push(candidate);

    if (websiteOutcome.initialUrl && websiteOutcome.status !== "NO_WEBSITE") {
      await sleep(300);
    }
  }

  const duplicatePhoneClusters = applyPhoneClusterDedupe(processed);
  for (const c of processed) {
    if (c.duplicatePhoneCluster) assignLeadQueue(c);
  }

  const qualifiedReady = processed.filter((c) => c.queue === "qualified_ready");
  const needsManualReview = processed.filter(
    (c) => c.queue === "needs_manual_review"
  );
  const discardedCount = discardedRealSite + discardedIrrelevant;

  console.log(`qualifiedReadyCount: ${qualifiedReady.length}`);
  console.log(`needsManualReviewCount: ${needsManualReview.length}`);
  console.log(`discardedCount: ${discardedCount} (HAS_REAL_SITE: ${discardedRealSite}, irrelevant_trade: ${discardedIrrelevant})`);
  console.log(`duplicatePhoneClusters: ${duplicatePhoneClusters}`);
  if (skippedDuplicate > 0) {
    console.log(`skippedDuplicates: ${skippedDuplicate} (name+phone or name+address)`);
  }
  console.log("");

  const sortByScore = (a: ProcessedCandidate, b: ProcessedCandidate) =>
    b.score - a.score;

  const inserted: ProcessedCandidate[] = [];

  if (!dryRun) {
    for (const c of [...processed].sort(sortByScore)) {
      if (findLeadByNameAndRegion(c.details.name, location)) {
        console.log(`  skip duplicate: ${c.details.name}`);
        continue;
      }

      const phone =
        c.details.formatted_phone_number ??
        c.details.international_phone_number ??
        null;

      const sourceUrls = [
        c.details.url,
        c.websiteOutcome.initialUrl,
        c.websiteOutcome.finalUrl,
      ]
        .filter(Boolean)
        .join(",");

      const leadNotes = buildLeadNotes(
        c.websiteOutcome.notes,
        c.scoreReasons,
        c.tradeRelevance,
        c.tradeRelevanceNotes,
        c.geoRelevance,
        c.geoRelevanceNotes,
        {
          duplicatePhoneCluster: c.duplicatePhoneCluster,
          duplicateOf: c.duplicateOf,
          duplicateClusterId: c.duplicateClusterId,
          manualReviewReasons: c.manualReviewReasons,
        }
      );

      insertLead({
        business_name: c.details.name,
        niche,
        region: location,
        phone,
        score: c.score,
        slug: toSlug(c.details.name),
        source_urls: sourceUrls || null,
        notes: leadNotes,
        website_status: c.websiteOutcome.status,
        website_check_notes: c.websiteOutcome.notes || null,
        phone_type: c.phoneType,
      });
      inserted.push(c);
    }
    console.log(`Inserted ${inserted.length} new lead(s).\n`);
  }

  const qualifiedDisplay = [...qualifiedReady]
    .filter(
      (c) =>
        c.websiteOutcome.status !== "NEEDS_MANUAL_REVIEW" &&
        (showDuplicates || !c.duplicatePhoneCluster)
    )
    .sort(sortByScore);
  if (includeManualReview) {
    qualifiedDisplay.push(
      ...needsManualReview
        .filter((c) => showDuplicates || !c.duplicatePhoneCluster)
        .sort(sortByScore)
    );
    qualifiedDisplay.sort(sortByScore);
  }

  const manualDisplay = [...needsManualReview].sort(sortByScore);

  console.log("top 10 qualified_ready leads:\n");
  console.log(
    "name | score | trade_relevance | website_status | phone_type | phone | rating | reviews | score reasons"
  );

  if (qualifiedDisplay.length === 0) {
    console.log("(none)");
  } else {
    for (const c of qualifiedDisplay.slice(0, 10)) {
      const phone =
        c.details.formatted_phone_number ??
        c.details.international_phone_number ??
        "";
      console.log(
        [
          c.details.name,
          String(c.score),
          c.tradeRelevance,
          c.websiteOutcome.status,
          c.phoneType,
          phone || "-",
          c.details.rating != null ? String(c.details.rating) : "-",
          c.details.user_ratings_total != null
            ? String(c.details.user_ratings_total)
            : "-",
          c.scoreReasons.join(", "),
        ].join(" | ")
      );
    }
  }

  console.log("\ntop 10 needs_manual_review leads:\n");
  console.log(
    "name | reason | website_status | trade_relevance | phone | notes"
  );

  if (manualDisplay.length === 0) {
    console.log("(none)");
  } else {
    for (const c of manualDisplay.slice(0, 10)) {
      const phone =
        c.details.formatted_phone_number ??
        c.details.international_phone_number ??
        "";
      const notes = [
        c.tradeRelevanceNotes,
        c.websiteOutcome.notes,
        c.duplicatePhoneCluster && c.duplicateOf
          ? `duplicate_of=${c.duplicateOf}`
          : "",
      ]
        .filter(Boolean)
        .join("; ");
      console.log(
        [
          c.details.name,
          c.manualReviewReasons.join(", "),
          c.websiteOutcome.status,
          c.tradeRelevance,
          phone || "-",
          notes || "-",
        ].join(" | ")
      );
    }
  }

  if (approvalIncludesBuild(config.approval_mode) && !dryRun) {
    console.log(
      "\n⏸  approval_mode requires your picks before build. Reply with which leads to proceed with."
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
