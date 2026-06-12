import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  getLeadById,
  getLeadBySlug,
  getNextNewLead,
  updateLead,
  type Lead,
  type WebsiteStatus,
} from "./db.js";
import {
  basedLocationLabel,
  normalizeServiceArea,
  normalizeServices,
} from "./site_content.js";
import {
  classifyUkPhone,
  isWhatsAppCandidate,
  type PhoneType,
} from "./phone_utils.js";
import { extractLikelyContactNameFromReviews } from "./contact_name.js";
import {
  contactabilityToLeadFields,
  leadStateForContactability,
  printContactabilitySummary,
  qualifyContactabilityAsync,
  type ContactabilityResult,
  type ContactabilityStatus,
  type WhatsAppAvailability,
} from "./contactability.js";
import {
  discoverFacebookForLead,
  downloadVerifiedFacebookAssets,
  isFacebookPageUrl,
  normalizeFacebookPageUrl,
  type FacebookBriefRecord,
} from "./facebook_source.js";
import { extractPalette } from "./palette.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const MIN_PX = 800;
const MAX_PHOTOS = 15;
const MIN_PHOTOS = 6;
const TARGET_WIDTH = 1600;

export type PhotoClassification =
  | "before_after_pair"
  | "completed_project"
  | "team_or_van"
  | "logo_or_brand"
  | "skip";

interface BriefReview {
  text: string;
  reviewer: string;
  rating: number;
}

interface BriefPhoto {
  local: string;
  source_url: string;
  width: number;
  height: number;
  classification: PhotoClassification;
  pair_id: string | null;
  source_type?: string;
  selected?: boolean;
  selection_reason?: string;
}

interface BriefSocial {
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
}

type ServiceConfidence = "direct" | "inferred" | "mixed" | "broad";

interface ServiceEntry {
  name: string;
  source: "google" | "review" | "name" | "social" | "directory" | "niche";
  direct: boolean;
}

interface Brief {
  business_name: string;
  owner_name: string | null;
  contact_name: string | null;
  contact_name_source: "google_reviews" | null;
  contact_name_confidence: "high" | "medium" | "low" | null;
  contact_name_evidence_count: number;
  contact_name_usage_allowed: boolean;
  possible_contact_name: string | null;
  phone: string | null;
  email: string | null;
  phone_type: PhoneType;
  whatsapp_candidate: boolean;
  email_available: boolean;
  whatsapp_available: WhatsAppAvailability;
  contactability_status: ContactabilityStatus;
  contactability_reason: string;
  preferred_channel: "whatsapp" | "email" | null;
  address: string;
  opening_hours: string[];
  services: string[];
  services_meta: ServiceEntry[];
  service_confidence: ServiceConfidence;
  service_sources: string[];
  service_area: string[];
  based_location: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_review_count_sourced: boolean;
  service_areas_inferred: boolean;
  google_maps_url: string | null;
  website_status: WebsiteStatus | null;
  website_check_notes: string | null;
  website_url: string | null;
  photos: BriefPhoto[];
  reviews: BriefReview[];
  social: BriefSocial;
  gallery_layout: "before_after_pairs" | "completed_project_gallery";
  photo_classification_summary: Record<string, number>;
  brand: { colours: string[]; logo_url: string | null; logo_local?: string | null };
  facebook?: FacebookBriefRecord;
  source_urls: string[];
  notes: string[];
  missing_fields: string[];
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string;
  types?: string[];
  opening_hours?: { weekday_text?: string[] };
  photos?: { photo_reference: string; html_attributions?: string[] }[];
  reviews?: {
    author_name?: string;
    rating?: number;
    text?: string;
    relative_time_description?: string;
  }[];
  editorial_summary?: { overview?: string };
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
}

const TYPE_LABELS: Record<string, string> = {
  plumber: "Plumbing",
  electrician: "Electrical services",
  roofing_contractor: "Roofing",
  general_contractor: "Building & construction",
  painter: "Painting & decorating",
  locksmith: "Locksmith",
  moving_company: "Removals",
  laundry: "Laundry",
  beauty_salon: "Beauty salon",
  hair_care: "Hairdressing",
  restaurant: "Restaurant",
  cafe: "Cafe",
  dentist: "Dentistry",
  veterinary_care: "Veterinary",
  lawyer: "Legal services",
  accounting: "Accounting",
  car_repair: "Vehicle repair",
  storage: "Storage",
  landscaping: "Landscaping",
};

const WATERMARK_MARKERS = [
  "shutterstock",
  "getty images",
  "alamy",
  "dreamstime",
  "istock",
  "depositphotos",
  "123rf",
  "adobe stock",
];

const STOCK_URL_MARKERS = [
  "unsplash.com",
  "pexels.com",
  "pixabay.com",
  "freepik.com",
  "shutterstock.com",
  "istockphoto.com",
  "gettyimages.com",
  "stock.adobe.com",
  "stock-photo",
  "stockphoto",
];

const MEME_URL_MARKERS = [
  "meme",
  "screenshot",
  "snapchat",
  "imgflip",
  "9gag",
  "reddit.com/r/",
  "i.redd.it",
];

const PHOTO_PRIORITY: Record<PhotoClassification, number> = {
  completed_project: 0,
  before_after_pair: 1,
  team_or_van: 2,
  logo_or_brand: 3,
  skip: 99,
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

function parseArgs(): { id?: number; slug?: string; facebookUrl?: string } {
  const args = process.argv.slice(2);
  let id: number | undefined;
  let slug: string | undefined;
  let facebookUrl: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id" && args[i + 1]) id = Number(args[++i]);
    else if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--facebook-url" && args[i + 1]) facebookUrl = args[++i];
  }
  return { id, slug, facebookUrl };
}

function resolveLead(id?: number, slug?: string): Lead | undefined {
  if (id) return getLeadById(id);
  if (slug) return getLeadBySlug(slug);
  return getNextNewLead();
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function townFromLead(lead: Lead): string {
  return lead.region?.trim() || "";
}

function parseDdgLinks(html: string): string[] {
  const links: string[] = [];
  const re = /uddg=([^&"]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      links.push(decodeURIComponent(m[1]));
    } catch {
      links.push(m[1]);
    }
  }
  return links;
}

async function ddgSearchLinks(query: string, limit = 10): Promise<string[]> {
  const body = new URLSearchParams({ q: query });
  const res = await fetch("https://html.duckduckgo.com/html/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return [];
  return [...new Set(parseDdgLinks(await res.text()))].slice(0, limit);
}

function normalizeSocialUrl(url: string): string {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.split("?")[0];
  }
}

function hostMatches(url: string, needles: string[]): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return needles.some((n) => host === n || host.endsWith(`.${n}`) || host.includes(n));
  } catch {
    return false;
  }
}

async function findSocialLink(
  platform: "facebook" | "instagram" | "youtube" | "tiktok",
  businessName: string,
  town: string
): Promise<string | null> {
  const label =
    platform === "youtube"
      ? "YouTube"
      : platform.charAt(0).toUpperCase() + platform.slice(1);
  const query = `${businessName} ${town} ${label}`.trim();
  const links = await ddgSearchLinks(query, 12);

  const hostNeedles: Record<typeof platform, string[]> = {
    facebook: ["facebook.com", "fb.com"],
    instagram: ["instagram.com"],
    youtube: ["youtube.com", "youtu.be"],
    tiktok: ["tiktok.com"],
  };

  for (const link of links) {
    if (hostMatches(link, hostNeedles[platform])) {
      return normalizeSocialUrl(link);
    }
  }
  return null;
}

async function findAllSocial(
  businessName: string,
  town: string
): Promise<{ social: BriefSocial; notes: string[]; snippets: string[] }> {
  const notes: string[] = [];
  const snippets: string[] = [];
  const social: BriefSocial = {
    facebook: null,
    instagram: null,
    youtube: null,
    tiktok: null,
  };

  const lookups: (keyof BriefSocial)[] = [
    "facebook",
    "instagram",
    "youtube",
    "tiktok",
  ];

  for (const platform of lookups) {
    try {
      social[platform] = await findSocialLink(platform, businessName, town);
      if (social[platform]) {
        const html = await fetchPageHtml(social[platform]!);
        if (html) {
          const og = extractOgImages(html);
          const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "";
          const desc =
            html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
            "";
          snippets.push(title, desc, ...og);
        }
      }
    } catch {
      notes.push(`${platform} search failed, continuing without it`);
    }
    await sleep(350);
  }

  return { social, notes, snippets };
}

function isDirectImageUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(path) || path.includes("/photo");
  } catch {
    return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);
  }
}

async function fetchPageHtml(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WebForTradesGather/1.0)" },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractOgImages(html: string): string[] {
  const urls: string[] = [];
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) urls.push(m[1]);
  }
  return urls;
}

function extractImageUrlsFromHtml(html: string, baseUrl: string): string[] {
  const urls = new Set<string>();
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      urls.add(new URL(m[1], baseUrl).toString());
    } catch {
      /* ignore */
    }
  }
  return [...urls];
}

function extractEmailsFromHtml(html: string): string[] {
  const mailtos = [...html.matchAll(/mailto:([^"'?>\s]+)/gi)].map((m) =>
    decodeURIComponent(m[1]).trim()
  );
  const inline = [...html.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)].map(
    (m) => m[0]
  );
  const junk = /\.(png|jpg|jpeg|gif|webp|svg)$/i;
  return [...new Set([...mailtos, ...inline])].filter(
    (e) =>
      !junk.test(e) &&
      !e.includes("example.com") &&
      !e.includes("sentry.io") &&
      !e.startsWith("noreply@")
  );
}

function extractOwnerFromBusinessName(name: string): string | null {
  const m = name.match(/^([A-Z][a-z]{2,})['']s\b/);
  return m ? m[1] : null;
}

function extractOwnerFromReviews(reviews: PlaceDetails["reviews"]): string | null {
  if (!reviews) return null;
  const patterns = [
    /\bowner\s+([A-Z][a-z]{2,})\b/,
    /\bcalled\s+([A-Z][a-z]{2,})\b/,
    /\b([A-Z][a-z]{2,})\s+(the owner|owner)\b/,
    /\bspoke (?:to|with)\s+([A-Z][a-z]{2,})\b/,
  ];
  for (const review of reviews) {
    const text = review.text ?? "";
    for (const re of patterns) {
      const m = text.match(re);
      if (m) return m[1];
    }
  }
  return null;
}

function extractOwnerFromHtml(html: string): string | null {
  const patterns = [
    /(?:owner|director|founder)\s*[:\-–]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /meet\s+(?:the\s+)?owner\s*,?\s*([A-Z][a-z]+)/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1].split(/\s+/)[0];
  }
  return null;
}

async function findPlaceId(lead: Lead, apiKey: string): Promise<string | null> {
  const query = `${lead.business_name} ${lead.region ?? ""}`.trim();
  const params = new URLSearchParams({ query, key: apiKey });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
  );
  const data = (await res.json()) as {
    status: string;
    results?: { place_id: string; name: string }[];
  };
  if (data.status !== "OK" || !data.results?.length) return null;

  const exact = data.results.find(
    (r) => r.name.toLowerCase() === lead.business_name.toLowerCase()
  );
  return (exact ?? data.results[0]).place_id;
}

async function fetchPlaceDetails(
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
    "types",
    "opening_hours",
    "photos",
    "reviews",
    "editorial_summary",
    "vicinity",
    "rating",
    "user_ratings_total",
  ].join(",");

  const params = new URLSearchParams({ place_id: placeId, fields, key: apiKey });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );
  const data = (await res.json()) as {
    status: string;
    result?: PlaceDetails;
    error_message?: string;
  };
  if (data.status !== "OK" || !data.result) {
    throw new Error(
      `Place Details failed: ${data.status}${data.error_message ? ` - ${data.error_message}` : ""}`
    );
  }
  return data.result;
}

function placePhotoUrl(reference: string, apiKey: string, maxWidth = 1600): string {
  const params = new URLSearchParams({
    maxwidth: String(maxWidth),
    photo_reference: reference,
    key: apiKey,
  });
  return `https://maps.googleapis.com/maps/api/place/photo?${params}`;
}

function typesToServiceEntries(types: string[] | undefined): ServiceEntry[] {
  if (!types) return [];
  const skip = new Set([
    "point_of_interest",
    "establishment",
    "store",
    "finance",
  ]);
  const entries: ServiceEntry[] = [];
  for (const t of types) {
    if (skip.has(t)) continue;
    entries.push({
      name: TYPE_LABELS[t] ?? t.replace(/_/g, " "),
      source: "google",
      direct: true,
    });
  }
  return entries;
}

const SERVICE_SIGNALS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bboiler\b/i, label: "Boiler repairs and servicing" },
  { pattern: /\bbathroom\b/i, label: "Bathroom installations" },
  { pattern: /\bleak|burst pipe|leaking\b/i, label: "Leak and burst pipe repairs" },
  { pattern: /\bdrain|unblock/i, label: "Drain unblocking" },
  { pattern: /\bemergency\b/i, label: "Emergency callouts" },
  { pattern: /\bheating|radiator|central heating\b/i, label: "Heating and radiators" },
  { pattern: /\btap|toilet|shower|sink\b/i, label: "Tap, toilet and shower repairs" },
  { pattern: /\bgas\b/i, label: "Gas work" },
  { pattern: /\bcylinder\b/i, label: "Cylinder repairs" },
  { pattern: /\bplumb/i, label: "General plumbing" },
  { pattern: /\belectric|rewire|fuse\b/i, label: "Electrical services" },
  { pattern: /\broof|gutter|fascia\b/i, label: "Roofing services" },
  { pattern: /\bpaint|decorat|wallpaper\b/i, label: "Painting and decorating" },
];

function inferServicesFromText(
  text: string,
  source: ServiceEntry["source"],
  direct: boolean
): ServiceEntry[] {
  const found: ServiceEntry[] = [];
  for (const sig of SERVICE_SIGNALS) {
    if (sig.pattern.test(text)) {
      found.push({ name: sig.label, source, direct });
    }
  }
  return found;
}

function buildServices(
  details: PlaceDetails,
  lead: Lead,
  snippets: string[]
): {
  services: string[];
  meta: ServiceEntry[];
  confidence: ServiceConfidence;
  sources: string[];
} {
  const meta: ServiceEntry[] = [
    ...typesToServiceEntries(details.types),
    ...inferServicesFromText(details.name, "name", false),
    ...inferServicesFromText(details.editorial_summary?.overview ?? "", "google", true),
  ];

  for (const review of details.reviews ?? []) {
    meta.push(...inferServicesFromText(review.text ?? "", "review", false));
  }

  for (const snippet of snippets) {
    meta.push(...inferServicesFromText(snippet, "social", false));
  }

  if (lead.niche) {
    meta.push({
      name: lead.niche.replace(/_/g, " "),
      source: "niche",
      direct: false,
    });
  }

  const deduped = new Map<string, ServiceEntry>();
  for (const entry of meta) {
    const key = entry.name.toLowerCase();
    const existing = deduped.get(key);
    if (!existing || (entry.direct && !existing.direct)) {
      deduped.set(key, entry);
    }
  }

  let entries = [...deduped.values()].slice(0, 12);
  const directCount = entries.filter((e) => e.direct).length;
  const inferredCount = entries.length - directCount;
  const sourceSet = new Set(entries.map((e) => e.source));

  let confidence: ServiceConfidence = "broad";
  if (entries.length === 0) {
    const broad = lead.niche?.replace(/_/g, " ") ?? "General trade services";
    entries = [{ name: broad, source: "niche", direct: false }];
    sourceSet.clear();
    sourceSet.add("niche");
    confidence = "broad";
  } else if (directCount > 0 && inferredCount > 0) {
    confidence = "mixed";
  } else if (directCount > 0) {
    confidence = "direct";
  } else if (inferredCount >= 2) {
    confidence = "inferred";
  } else {
    const broad = lead.niche?.replace(/_/g, " ") ?? "General trade services";
    entries = [{ name: broad, source: "niche", direct: false }];
    sourceSet.clear();
    sourceSet.add("niche");
    confidence = "broad";
  }

  const reviewsBlob = (details.reviews ?? []).map((r) => r.text ?? "").join(" ");
  const normalized = normalizeServices(
    entries.map((e) => e.name),
    lead.niche,
    reviewsBlob
  );

  return {
    services: normalized.services,
    meta: entries.filter((e) =>
      normalized.services.some((s) => s.toLowerCase() === e.name.toLowerCase())
    ),
    confidence: normalized.confidence as ServiceConfidence,
    sources: [...sourceSet],
  };
}

function photoClassificationSummary(
  photos: BriefPhoto[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of photos) {
    counts[p.classification] = (counts[p.classification] ?? 0) + 1;
  }
  return counts;
}

function inferServiceArea(details: PlaceDetails, region: string | null): string[] {
  const raw: string[] = [];
  if (region) raw.push(region);
  if (details.vicinity) raw.push(details.vicinity);
  if (details.formatted_address) {
    const parts = details.formatted_address.split(",").map((p) => p.trim());
    raw.push(...parts);
  }
  return normalizeServiceArea(raw, details.formatted_address ?? null, region);
}

function redactApiKey(url: string): string {
  return url.replace(/([?&]key=)[^&]+/gi, "$1REDACTED");
}

function resolveWebsiteUrl(lead: Lead, details: PlaceDetails): string | null {
  if (details.website?.trim()) return details.website.trim();
  if (!lead.source_urls) return null;
  for (const raw of lead.source_urls.split(",")) {
    const url = raw.trim();
    if (!url) continue;
    try {
      const host = new URL(url).hostname.toLowerCase();
      if (host.includes("google.") && url.includes("/maps")) continue;
    } catch {
      continue;
    }
    return url;
  }
  return null;
}

function hasWatermark(buffer: Buffer): boolean {
  const text = buffer.toString("latin1").toLowerCase();
  return WATERMARK_MARKERS.some((w) => text.includes(w));
}

function isStockUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return STOCK_URL_MARKERS.some((m) => lower.includes(m));
}

function isMemeOrScreenshotUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return MEME_URL_MARKERS.some((m) => lower.includes(m));
}

function isTooBlurry(meta: sharp.Metadata, byteLength: number): boolean {
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w === 0 || h === 0) return true;
  const bpp = byteLength / (w * h);
  return bpp < 0.08;
}

function isExtremeAspect(meta: sharp.Metadata): boolean {
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) return true;
  const ratio = w / h;
  return ratio > 2.6 || ratio < 0.38;
}

async function imageFingerprint(buffer: Buffer): Promise<string> {
  const thumb = await sharp(buffer)
    .resize(32, 32, { fit: "cover" })
    .greyscale()
    .raw()
    .toBuffer();
  return crypto.createHash("sha256").update(thumb).digest("hex");
}

function classifyImageUrl(url: string, meta: sharp.Metadata): PhotoClassification {
  const lower = url.toLowerCase();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const ratio = w / Math.max(h, 1);

  if (/\bbefore\b|\bafter\b|before-after|before_after/.test(lower)) {
    return "before_after_pair";
  }
  if (/logo|brand|favicon|icon|avatar|profile-pic|badge/.test(lower)) {
    return "logo_or_brand";
  }
  if (/team|staff|crew|van|vehicle|engineer|technician|truck|fleet/.test(lower)) {
    return "team_or_van";
  }
  if (ratio > 0.85 && ratio < 1.15 && w <= 900) {
    return "logo_or_brand";
  }
  return "completed_project";
}

function assignBeforeAfterPairs(photos: BriefPhoto[]): void {
  const before: BriefPhoto[] = [];
  const after: BriefPhoto[] = [];

  for (const photo of photos) {
    const lower = photo.source_url.toLowerCase();
    if (/\bbefore\b|\/before[-_/]|[-_]before\./.test(lower)) before.push(photo);
    else if (/\bafter\b|\/after[-_/]|[-_]after\./.test(lower)) after.push(photo);
  }

  const pairCount = Math.min(before.length, after.length);
  for (let i = 0; i < pairCount; i++) {
    const pairId = `pair-${i + 1}`;
    before[i].pair_id = pairId;
    after[i].pair_id = pairId;
    before[i].classification = "before_after_pair";
    after[i].classification = "before_after_pair";
  }
}

function countCompletePairs(photos: BriefPhoto[]): number {
  const counts = new Map<string, number>();
  for (const p of photos) {
    if (!p.pair_id) continue;
    counts.set(p.pair_id, (counts.get(p.pair_id) ?? 0) + 1);
  }
  return [...counts.values()].filter((n) => n >= 2).length;
}

function pickGalleryLayout(photos: BriefPhoto[]): Brief["gallery_layout"] {
  return countCompletePairs(photos) >= 1
    ? "before_after_pairs"
    : "completed_project_gallery";
}

export async function downloadAndOptimizeImage(
  sourceUrl: string,
  outPath: string,
  seenFingerprints: Set<string>
): Promise<{
  width: number;
  height: number;
  classification: PhotoClassification;
} | null> {
  if (isStockUrl(sourceUrl) || isMemeOrScreenshotUrl(sourceUrl)) return null;

  const res = await fetch(sourceUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; WebForTradesGather/1.0)" },
    signal: AbortSignal.timeout(20000),
    redirect: "follow",
  });
  if (!res.ok) return null;

  const raw = Buffer.from(await res.arrayBuffer());
  if (hasWatermark(raw)) return null;

  let img = sharp(raw);
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  if (w < MIN_PX) return null;
  if (isTooBlurry(meta, raw.length)) return null;
  if (isExtremeAspect(meta)) return null;

  const fingerprint = await imageFingerprint(raw);
  if (seenFingerprints.has(fingerprint)) return null;
  seenFingerprints.add(fingerprint);

  let classification = classifyImageUrl(sourceUrl, meta);
  if (classification === "logo_or_brand" && w >= 1200) {
    classification = "completed_project";
  }

  if (w > TARGET_WIDTH) {
    img = img.resize({ width: TARGET_WIDTH, withoutEnlargement: true });
  }

  const outMeta = await img.metadata();
  await img.webp({ quality: 85 }).toFile(outPath);

  return {
    width: outMeta.width ?? w,
    height: outMeta.height ?? h,
    classification,
  };
}

export async function downloadAndOptimizeImages(
  items: { source_url: string; filename: string }[],
  imagesDir: string
): Promise<BriefPhoto[]> {
  fs.mkdirSync(imagesDir, { recursive: true });
  const seenFingerprints = new Set<string>();
  const kept: BriefPhoto[] = [];

  for (const item of items) {
    if (kept.length >= MAX_PHOTOS) break;
    const outPath = path.join(imagesDir, item.filename);
    try {
      const result = await downloadAndOptimizeImage(
        item.source_url,
        outPath,
        seenFingerprints
      );
      if (!result || result.classification === "skip") {
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
        continue;
      }
      kept.push({
        local: `images/${item.filename}`,
        source_url: item.source_url,
        width: result.width,
        height: result.height,
        classification: result.classification,
        pair_id: null,
      });
    } catch {
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    }
    await sleep(200);
  }

  kept.sort(
    (a, b) => PHOTO_PRIORITY[a.classification] - PHOTO_PRIORITY[b.classification]
  );

  assignBeforeAfterPairs(kept);
  return kept.slice(0, MAX_PHOTOS);
}

function pickReviews(details: PlaceDetails): BriefReview[] {
  const reviews = details.reviews ?? [];
  return reviews
    .filter((r) => r.text && r.text.trim().length > 20 && (r.rating ?? 0) >= 4)
    .sort(
      (a, b) =>
        (b.rating ?? 0) - (a.rating ?? 0) ||
        (b.text?.length ?? 0) - (a.text?.length ?? 0)
    )
    .slice(0, 6)
    .map((r) => ({
      text: r.text!.trim(),
      reviewer: (r.author_name ?? "Customer").split(" ")[0],
      rating: r.rating ?? 5,
    }));
}

async function collectPhotoCandidates(
  details: PlaceDetails,
  lead: Lead,
  apiKey: string,
  social: BriefSocial,
  websiteUrl: string | null,
  sourceUrls: Set<string>
): Promise<{ source_url: string; filename: string }[]> {
  const candidates: { source_url: string; filename: string }[] = [];
  const town = townFromLead(lead);
  let seq = 1;

  const push = (sourceUrl: string, prefix: string) => {
    if (!sourceUrl || candidates.some((c) => c.source_url === sourceUrl)) return;
    candidates.push({
      source_url: sourceUrl,
      filename: `${String(seq++).padStart(2, "0")}-${prefix}.webp`,
    });
    sourceUrls.add(sourceUrl);
  };

  for (const photo of details.photos ?? []) {
    if (candidates.length >= 24) break;
    push(placePhotoUrl(photo.photo_reference, apiKey), "places");
  }

  const pageTargets = [
    social.facebook,
    social.instagram,
    social.youtube,
    social.tiktok,
    websiteUrl,
  ].filter(Boolean) as string[];

  for (const pageUrl of pageTargets) {
    const html = await fetchPageHtml(pageUrl);
    if (!html) continue;
    sourceUrls.add(pageUrl);
    for (const img of extractOgImages(html).slice(0, 4)) push(img, "page");
    for (const img of extractImageUrlsFromHtml(html, pageUrl).slice(0, 8)) {
      if (isDirectImageUrl(img)) push(img, "page");
    }
    await sleep(250);
  }

  let photoSearchLinks: string[] = [];
  try {
    photoSearchLinks = await ddgSearchLinks(
      `${lead.business_name} ${town} photos`.trim(),
      15
    );
  } catch {
    /* photo search optional */
  }
  for (const link of photoSearchLinks) {
    sourceUrls.add(link);
    if (isDirectImageUrl(link)) {
      push(link, "search");
      continue;
    }
    const html = await fetchPageHtml(link);
    if (!html) continue;
    for (const img of extractOgImages(html).slice(0, 2)) push(img, "search");
    for (const img of extractImageUrlsFromHtml(html, link).slice(0, 4)) {
      if (isDirectImageUrl(img)) push(img, "search");
    }
    await sleep(200);
  }

  return candidates;
}

async function collectPublicEmail(
  websiteUrl: string | null,
  social: BriefSocial,
  sourceUrls: Set<string>
): Promise<string | null> {
  const pages = [websiteUrl, social.facebook, social.instagram].filter(
    Boolean
  ) as string[];

  for (const pageUrl of pages) {
    const html = await fetchPageHtml(pageUrl);
    if (!html) continue;
    sourceUrls.add(pageUrl);
    const emails = extractEmailsFromHtml(html);
    if (emails.length > 0) return emails[0];
    await sleep(200);
  }
  return null;
}

async function gatherBrief(
  lead: Lead,
  apiKey: string,
  options: { facebookUrl?: string } = {}
): Promise<{ brief: Brief; contactability: ContactabilityResult }> {
  const placeId = await findPlaceId(lead, apiKey);
  if (!placeId) throw new Error(`Could not resolve Google Place for ${lead.business_name}`);

  const details = await fetchPlaceDetails(placeId, apiKey);
  const town = townFromLead(lead);
  const socialResult = await findAllSocial(details.name, town);
  const social = socialResult.social;

  const sourceUrls = new Set<string>();
  if (details.url) sourceUrls.add(details.url);
  if (details.website) sourceUrls.add(details.website);
  if (lead.source_urls) {
    lead.source_urls.split(",").forEach((u) => {
      const trimmed = u.trim();
      if (trimmed) sourceUrls.add(trimmed);
    });
  }
  for (const url of Object.values(social)) {
    if (url) sourceUrls.add(url);
  }

  const websiteUrl = resolveWebsiteUrl(lead, details);
  const websiteStatus = (lead.website_status as WebsiteStatus | null) ?? null;

  const phone =
    details.formatted_phone_number ??
    details.international_phone_number ??
    lead.phone ??
    null;

  const slug =
    lead.slug ??
    lead.business_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
  const briefDir = path.join(ROOT, "briefs", slug);
  const imagesDir = path.join(briefDir, "images");

  const facebookDiscovery = await discoverFacebookForLead({
    businessName: details.name,
    googlePhone: phone,
    googleAddress: details.formatted_address ?? lead.address ?? null,
    googleMapsUrl: details.url ?? null,
    town,
    websiteUrl,
    manualUrl: options.facebookUrl ?? null,
    ddgSearch: ddgSearchLinks,
  });

  if (facebookDiscovery.page?.page_url) {
    social.facebook = normalizeFacebookPageUrl(facebookDiscovery.page.page_url);
    sourceUrls.add(social.facebook);
  } else if (websiteUrl && isFacebookPageUrl(websiteUrl)) {
    social.facebook = normalizeFacebookPageUrl(websiteUrl);
  }

  const photoCandidates = await collectPhotoCandidates(
    details,
    lead,
    apiKey,
    social,
    websiteUrl,
    sourceUrls
  );

  let photos = await downloadAndOptimizeImages(photoCandidates, imagesDir);

  const existingHashes = new Set<string>();
  for (const p of photos) {
    const imgPath = p.local.includes("/")
      ? path.join(briefDir, p.local)
      : path.join(imagesDir, path.basename(p.local));
    if (fs.existsSync(imgPath)) {
      try {
        const buf = await fs.promises.readFile(imgPath);
        existingHashes.add(await imageFingerprint(buf));
      } catch {
        /* skip */
      }
    }
  }

  let facebookRecord: FacebookBriefRecord | undefined;
  const facebookNotes: string[] = [];
  if (facebookDiscovery.page && facebookDiscovery.verification) {
    facebookRecord = await downloadVerifiedFacebookAssets({
      slug,
      briefDir,
      page: facebookDiscovery.page,
      verification: facebookDiscovery.verification,
      existingHashes,
      googlePhotoCount: photos.length,
    });
    sourceUrls.add(facebookDiscovery.page.page_url);
    for (const asset of facebookRecord.assets) {
      sourceUrls.add(asset.source_url);
      if (asset.classification === "logo_or_brand") continue;
      photos.push({
        local: asset.local,
        source_url: asset.source_url,
        width: asset.width,
        height: asset.height,
        classification: asset.classification,
        pair_id: null,
        source_type: asset.source_type,
        selected: asset.selected,
        selection_reason: asset.selection_reason,
      });
    }
    if (facebookRecord.photos_selected > 0) {
      facebookNotes.push(
        `Facebook verified (${facebookRecord.confidence}): ${facebookRecord.photos_selected} photo(s) from public page`
      );
    }
    if (facebookRecord.logo_path) {
      facebookNotes.push("Facebook profile image saved as verified logo");
    }
    if (facebookRecord.needs_manual_review) {
      facebookNotes.push("Facebook page needs manual review before using more assets");
    }
  } else if (options.facebookUrl || (websiteUrl && isFacebookPageUrl(websiteUrl))) {
    facebookNotes.push("Facebook page candidate found but could not be verified automatically");
  }

  const galleryLayout = pickGalleryLayout(photos);
  photos = photos.map((p) => ({
    ...p,
    source_type:
      p.source_type ??
      (p.local.includes("facebook/") ? "facebook_photo" : /places/.test(p.local) ? "google_places" : "page"),
  }));

  const ownerFromName = extractOwnerFromBusinessName(details.name);
  const ownerFromReviews = extractOwnerFromReviews(details.reviews);

  let ownerFromPages: string | null = null;
  let email: string | null = lead.email;

  const pagesForOwner = [websiteUrl, social.facebook].filter(Boolean) as string[];
  for (const pageUrl of pagesForOwner) {
    const html = await fetchPageHtml(pageUrl);
    if (!html) continue;
    sourceUrls.add(pageUrl);
    ownerFromPages = extractOwnerFromHtml(html);
    if (ownerFromPages) break;
  }

  const owner_name = ownerFromName ?? ownerFromReviews ?? ownerFromPages ?? null;

  if (!email) {
    email = await collectPublicEmail(websiteUrl, social, sourceUrls);
  }
  if (!email && facebookDiscovery.page?.email) {
    email = facebookDiscovery.page.email;
    sourceUrls.add(facebookDiscovery.page.page_url);
  }

  const servicePack = buildServices(details, lead, socialResult.snippets);
  const reviews = pickReviews(details);
  const contactFields = extractLikelyContactNameFromReviews(
    reviews,
    details.name
  );
  const phoneType = classifyUkPhone(phone);
  const whatsappCandidate = isWhatsAppCandidate(phone);

  const notes: string[] = [...socialResult.notes, ...facebookNotes];
  const missing_fields: string[] = [];
  if (!owner_name) {
    notes.push("owner_name not found in public sources");
    missing_fields.push("owner_name");
  }
  if (!email) {
    notes.push("email not found in public sources");
    missing_fields.push("email");
  }
  if (contactFields.contact_name) {
    notes.push(
      `contact_name "${contactFields.contact_name}" from ${contactFields.contact_name_evidence_count} Google review mention(s) (${contactFields.contact_name_confidence} confidence); owner_name not set`
    );
  } else if (contactFields.possible_contact_name) {
    notes.push(
      `possible_contact_name "${contactFields.possible_contact_name}" from 1 review mention; not used in copy`
    );
  }
  if (photos.length < MIN_PHOTOS) {
    notes.push(
      `only ${photos.length} usable photos kept (target ${MIN_PHOTOS}-${MAX_PHOTOS})`
    );
    missing_fields.push("photos");
  }
  if (reviews.length < 3) {
    notes.push(`only ${reviews.length} public reviews available (target 3-6)`);
    missing_fields.push("reviews");
  }
  if (!social.facebook) missing_fields.push("facebook");
  else if (facebookRecord?.verified) {
    const idx = missing_fields.indexOf("facebook");
    if (idx >= 0) missing_fields.splice(idx, 1);
  }
  if (!social.instagram) missing_fields.push("instagram");

  const logoFromFacebook = facebookRecord?.logo_path
    ? facebookRecord.assets.find((a) => a.source_type === "facebook_logo")
    : null;
  const logoCandidate = logoFromFacebook
    ? null
    : photos.find((p) => p.classification === "logo_or_brand");
  let brandColours: string[] = [];
  if (facebookRecord?.logo_palette?.length) {
    brandColours = facebookRecord.logo_palette;
  } else if (logoCandidate) {
    const logoPath = logoCandidate.local.includes("/")
      ? path.join(briefDir, logoCandidate.local)
      : path.join(imagesDir, path.basename(logoCandidate.local));
    if (fs.existsSync(logoPath)) {
      const palette = await extractPalette([logoPath]);
      brandColours = [palette.accent, palette.foreground, palette.background];
    }
  }

  const brief: Brief = {
    business_name: details.name,
    owner_name,
    ...contactFields,
    phone,
    email,
    phone_type: phoneType,
    whatsapp_candidate: whatsappCandidate,
    email_available: Boolean(email?.trim()),
    whatsapp_available: "not_checked",
    contactability_status: "NEEDS_MANUAL_REVIEW",
    contactability_reason: "contactability not evaluated yet",
    preferred_channel: null,
    address: details.formatted_address ?? "",
    opening_hours: details.opening_hours?.weekday_text ?? [],
    services: servicePack.services,
    services_meta: servicePack.meta,
    service_confidence: servicePack.confidence,
    service_sources: servicePack.sources,
    service_area: inferServiceArea(details, lead.region),
    based_location: basedLocationLabel(details.formatted_address ?? "", lead.region),
    google_rating: typeof details.rating === "number" ? details.rating : null,
    google_review_count:
      typeof details.user_ratings_total === "number" ? details.user_ratings_total : null,
    google_review_count_sourced: typeof details.user_ratings_total === "number",
    service_areas_inferred: true,
    google_maps_url: details.url ?? null,
    website_status: websiteStatus,
    website_check_notes: lead.website_check_notes ?? null,
    website_url: websiteUrl,
    photos,
    reviews,
    social,
    gallery_layout: galleryLayout,
    photo_classification_summary: photoClassificationSummary(photos),
    brand: {
      colours: brandColours,
      logo_url: logoFromFacebook?.source_url ?? logoCandidate?.source_url ?? null,
      logo_local: facebookRecord?.logo_path ?? null,
    },
    facebook: facebookRecord,
    source_urls: [...sourceUrls].map(redactApiKey),
    notes,
    missing_fields,
  };

  brief.photos = brief.photos.map((p) => ({
    ...p,
    source_url: redactApiKey(p.source_url),
  }));

  const contactability = await qualifyContactabilityAsync({
    email: brief.email,
    phone: brief.phone,
  });
  const qualifiedBrief = applyContactabilityToBrief(brief, contactability);

  fs.mkdirSync(briefDir, { recursive: true });
  fs.writeFileSync(
    path.join(briefDir, "brief.json"),
    JSON.stringify(qualifiedBrief, null, 2) + "\n"
  );

  return { brief: qualifiedBrief, contactability };
}

function applyContactabilityToBrief(
  brief: Brief,
  result: ContactabilityResult
): Brief {
  return {
    ...brief,
    email_available: result.email_available,
    whatsapp_available: result.whatsapp_available,
    contactability_status: result.contactability_status,
    contactability_reason: result.contactability_reason,
    preferred_channel: result.preferred_channel,
    notes: [
      ...brief.notes,
      `contactability=${result.contactability_status}`,
      result.contactability_reason,
    ],
  };
}

function hasContactChannel(brief: Brief): boolean {
  return Boolean(brief.phone?.trim() || brief.email?.trim());
}

function printSummary(lead: Lead, brief: Brief, state: string): void {
  console.log(`1. Business: ${brief.business_name} (${lead.slug}) → state=${state}`);
  console.log(
    `2. Contact: phone=${brief.phone ?? "-"} | email=${brief.email ?? "-"} | owner=${brief.owner_name ?? "-"}`
  );
  console.log(`3. Address: ${brief.address || "-"}`);
  console.log(
    `4. Website: status=${brief.website_status ?? "-"} | url=${brief.website_url ?? "-"}`
  );
  console.log(
    `5. Phone: type=${brief.phone_type} | whatsapp_candidate=${brief.whatsapp_candidate}`
  );
  console.log(
    `6. Content: ${brief.services.length} services (${brief.service_confidence}) | ${brief.photos.length} photos (${brief.gallery_layout}) | ${brief.reviews.length} reviews`
  );
  console.log(
    `7. Social: FB=${brief.social.facebook ? "yes" : "no"} | IG=${brief.social.instagram ? "yes" : "no"} | YT=${brief.social.youtube ? "yes" : "no"} | TT=${brief.social.tiktok ? "yes" : "no"}`,
    `7b. Facebook verified=${brief.facebook?.verified ? "yes" : "no"} confidence=${brief.facebook?.confidence ?? "n/a"} photos=${brief.facebook?.photos_selected ?? 0}/${brief.facebook?.photos_found ?? 0} logo=${brief.facebook?.logo_path ? "yes" : "no"}`,
  );
  console.log(`8. Maps: ${brief.google_maps_url ?? "-"}`);
  console.log(`9. Service area: ${brief.service_area.join(", ") || "-"}`);
  console.log(
    `10. Photo classes: ${JSON.stringify(brief.photo_classification_summary)}`
  );
  if (brief.missing_fields.length) {
    console.log(`11. Missing: ${brief.missing_fields.join(", ")}`);
  }
  if (brief.notes.length) console.log(`12. Notes: ${brief.notes.join("; ")}`);
  console.log(`13. Sources: ${brief.source_urls.length} URLs tracked`);
}

function summarizePhotoClasses(photos: BriefPhoto[]): string {
  const counts = new Map<string, number>();
  for (const p of photos) {
    counts.set(p.classification, (counts.get(p.classification) ?? 0) + 1);
  }
  return [...counts.entries()].map(([k, v]) => `${k}=${v}`).join(", ") || "-";
}

async function main(): Promise<void> {
  const { id, slug, facebookUrl } = parseArgs();
  const lead = resolveLead(id, slug);

  if (!lead) {
    console.error("No lead found. Run the prospector first, or pass --id / --slug.");
    process.exit(1);
  }

  if (lead.state !== "NEW") {
    console.warn(`Lead "${lead.business_name}" is state=${lead.state}, not NEW. Proceeding anyway.`);
  }

  const env = { ...process.env, ...loadEnv() };
  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_PLACES_API_KEY in .env");
    process.exit(1);
  }

  console.log(`Gathering: ${lead.business_name} (id=${lead.id}, slug=${lead.slug})`);

  const { brief, contactability } = await gatherBrief(lead, apiKey, { facebookUrl });

  const newState = leadStateForContactability(contactability.contactability_status);
  const contactOk = contactability.contactability_status === "CONTACTABLE";

  const mergedSources = new Set<string>();
  if (lead.source_urls) {
    lead.source_urls.split(",").forEach((u) => {
      const t = u.trim();
      if (t) mergedSources.add(t);
    });
  }
  brief.source_urls.forEach((u) => mergedSources.add(u));

  updateLead(lead.id, {
    state: newState,
    phone: brief.phone,
    email: brief.email,
    owner_name: brief.owner_name,
    phone_type: brief.phone_type,
    source_urls: [...mergedSources].join(","),
    ...contactabilityToLeadFields(contactability),
    notes: [
      lead.notes,
      ...brief.notes,
      !contactOk ? contactability.contactability_reason : null,
    ]
      .filter(Boolean)
      .join("; "),
  });

  printSummary(lead, brief, newState);
  console.log("");
  printContactabilitySummary(brief.business_name, brief.phone, contactability);

  if (contactability.contactability_status === "DISQUALIFIED_NO_CONTACT_METHOD") {
    console.log(
      "\n⚠️  PITCH_BLOCKED: no valid contact method. Lead disqualified for build, deploy, and outreach."
    );
  } else if (contactability.contactability_status === "NEEDS_MANUAL_REVIEW") {
    console.log(
      "\n⚠️  NEEDS_MANUAL_CONTACT: contactability needs manual review before build, deploy, or outreach."
    );
  }

  if (!hasContactChannel(brief)) {
    console.log("\n⚠️  No public phone or email found during gather.");
  }

  if (brief.photos.length < MIN_PHOTOS) {
    console.log(
      `\n⚠️  Only ${brief.photos.length} photos kept (target ${MIN_PHOTOS}-${MAX_PHOTOS}). Manual photos may be needed.`
    );
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
