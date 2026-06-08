import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import {
  findLeadByNameAndRegion,
  insertLead,
  type Lead,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

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
  opening_hours?: { open_now?: boolean };
  vicinity?: string;
}

type WebCheckResult = "no_site" | "social_only" | "has_site" | "uncertain";

const SOCIAL_OR_DIRECTORY = [
  "facebook.com",
  "fb.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "yell.com",
  "yell.co.uk",
  "checkatrade.com",
  "trustatrader.com",
  "google.com",
  "maps.google",
  "tripadvisor.",
  "yelp.com",
  "bark.com",
  "freeindex.co.uk",
  "thomsonlocal.com",
  "hotfrog.co.uk",
  "cylex.co.uk",
  "companieshouse.gov.uk",
  "company-information.service.gov.uk",
  "wikipedia.org",
  "youtube.com",
  "tiktok.com",
  "pinterest.com",
  "nextdoor.com",
  "bing.com",
  "duckduckgo.com",
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

function parseArgs(): { location: string; niche: string } {
  const args = process.argv.slice(2);
  let location = "";
  let niche = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--location" && args[i + 1]) location = args[++i];
    else if (args[i] === "--niche" && args[i + 1]) niche = args[++i];
  }

  if (!location && process.env.LOCATION) location = process.env.LOCATION;
  if (!niche && process.env.NICHE) niche = process.env.NICHE;

  return { location, niche };
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

function extractTown(location: string, address?: string): string {
  if (address) {
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length >= 2) return parts[parts.length - 2];
  }
  return location;
}

function isSocialOrDirectory(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return SOCIAL_OR_DIRECTORY.some((d) => host.includes(d));
}

async function googlePlacesTextSearch(
  query: string,
  apiKey: string
): Promise<PlaceSearchResult[]> {
  const results: PlaceSearchResult[] = [];
  let pageToken: string | undefined;

  do {
    if (pageToken) await sleep(2200);

    const params = new URLSearchParams({
      query,
      key: apiKey,
    });
    if (pageToken) params.set("pagetoken", pageToken);

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      status: string;
      results?: PlaceSearchResult[];
      next_page_token?: string;
      error_message?: string;
    };

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(
        `Places Text Search failed: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}`
      );
    }

    if (data.results) results.push(...data.results);
    pageToken = data.next_page_token;
  } while (pageToken);

  return results;
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
      `Place Details failed for ${placeId}: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}`
    );
  }

  return data.result;
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

async function webSearchCheck(
  businessName: string,
  town: string
): Promise<{ result: WebCheckResult; urls: string[] }> {
  const query = `${businessName} ${town}`;
  const body = new URLSearchParams({ q: query });
  const res = await fetch("https://html.duckduckgo.com/html/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    return { result: "uncertain", urls: [] };
  }

  const html = await res.text();
  const links = parseDdgLinks(html);
  const foundUrls: string[] = [];

  let hasRealSite = false;
  let hasSocialOnly = false;

  for (const link of links.slice(0, 12)) {
    let hostname = "";
    try {
      hostname = new URL(link).hostname;
    } catch {
      continue;
    }
    foundUrls.push(link);
    if (isSocialOrDirectory(hostname)) {
      if (
        hostname.includes("facebook") ||
        hostname.includes("instagram")
      ) {
        hasSocialOnly = true;
      }
      continue;
    }
    hasRealSite = true;
    break;
  }

  if (hasRealSite) return { result: "has_site", urls: foundUrls };
  if (hasSocialOnly) return { result: "social_only", urls: foundUrls };
  if (foundUrls.length === 0) return { result: "no_site", urls: [] };
  return { result: "uncertain", urls: foundUrls };
}

function nicheMarginBonus(niche: string): number {
  const lower = niche.toLowerCase();
  return HIGH_MARGIN_NICHES.some((n) => lower.includes(n)) ? 10 : 0;
}

function competitorBonus(
  allResults: PlaceSearchResult[],
  withWebsiteCount: number
): number {
  const total = allResults.length;
  if (total < 3) return 0;
  const ratio = withWebsiteCount / total;
  if (ratio >= 0.5) return 15;
  if (ratio >= 0.3) return 10;
  if (ratio >= 0.15) return 5;
  return 0;
}

function recentActivityBonus(details: PlaceDetails): number {
  if (details.business_status && details.business_status !== "OPERATIONAL") {
    return 0;
  }
  let bonus = 5;
  const reviews = details.reviews ?? [];
  if (reviews.length > 0) {
    const latest = Math.max(...reviews.map((r) => r.time));
    const ageDays = (Date.now() / 1000 - latest) / 86400;
    if (ageDays < 180) bonus += 5;
  }
  if (details.opening_hours?.open_now !== undefined) bonus += 2;
  return Math.min(bonus, 12);
}

function scoreLead(
  details: PlaceDetails,
  niche: string,
  webCheck: WebCheckResult,
  competitorBonusPts: number
): number {
  let score = 25;

  const phone =
    details.formatted_phone_number ?? details.international_phone_number;
  if (phone) score += 15;

  const photoCount = details.photos?.length ?? 0;
  if (photoCount >= 3) score += 10;
  else if (photoCount >= 1) score += 4;

  const reviewCount = details.user_ratings_total ?? 0;
  if (reviewCount >= 10) score += 15;
  else if (reviewCount >= 3) score += 10;
  else if (reviewCount >= 1) score += 5;

  score += recentActivityBonus(details);
  score += nicheMarginBonus(niche);
  score += competitorBonusPts;

  if (webCheck === "social_only") score += 8;
  if (webCheck === "uncertain") score -= 8;

  return Math.max(0, Math.min(100, score));
}

function approvalIncludesBuild(mode: string): boolean {
  return mode.includes("ask_before_build") || mode === "ask_both";
}

function printTable(
  rows: {
    name: string;
    score: number;
    phone: string;
    hasEmail: string;
    source: string;
  }[]
): void {
  const headers = ["name", "score", "phone", "has_email?", "source"];
  const widths = headers.map((h) => h.length);
  for (const row of rows) {
    widths[0] = Math.max(widths[0], row.name.length);
    widths[1] = Math.max(widths[1], String(row.score).length);
    widths[2] = Math.max(widths[2], row.phone.length);
    widths[3] = Math.max(widths[3], row.hasEmail.length);
    widths[4] = Math.max(widths[4], row.source.length);
  }

  const line = (cols: string[]) =>
    cols.map((c, i) => c.padEnd(widths[i])).join(" | ");

  console.log(line(headers));
  console.log(widths.map((w) => "-".repeat(w)).join("-|-"));
  for (const row of rows) {
    console.log(
      line([
        row.name,
        String(row.score),
        row.phone || "—",
        row.hasEmail,
        row.source,
      ])
    );
  }
}

async function main(): Promise<void> {
  const { location, niche } = parseArgs();

  if (
    !location ||
    !niche ||
    location.includes("TYPE HERE") ||
    niche.includes("TYPE HERE")
  ) {
    console.error(
      "Usage: npx tsx scripts/prospect.ts --location \"Leeds, UK\" --niche \"plumbers\""
    );
    process.exit(1);
  }

  const env = { ...loadEnv(), ...process.env };
  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_PLACES_API_KEY in .env");
    process.exit(1);
  }

  const config = loadConfig();
  const query = `${niche} in ${location}`;

  console.log(`Searching: "${query}"`);
  const searchResults = await googlePlacesTextSearch(query, apiKey);
  console.log(`Places returned: ${searchResults.length}`);

  const withWebsiteInSearch = searchResults.filter((p) => p.website).length;
  const competitorBonusPts = competitorBonus(searchResults, withWebsiteInSearch);

  const candidates: {
    details: PlaceDetails;
    webCheck: WebCheckResult;
    webUrls: string[];
    score: number;
  }[] = [];

  for (const place of searchResults) {
    await sleep(120);
    let details: PlaceDetails;
    try {
      details = await googlePlaceDetails(place.place_id, apiKey);
    } catch (err) {
      console.warn(`Skipping ${place.name}: ${(err as Error).message}`);
      continue;
    }

    if (details.website) continue;

    const town = extractTown(location, details.formatted_address);
    const { result: webCheck, urls: webUrls } = await webSearchCheck(
      details.name,
      town
    );

    if (webCheck === "has_site") {
      console.log(`  discard (web search found site): ${details.name}`);
      continue;
    }

    const score = scoreLead(details, niche, webCheck, competitorBonusPts);
    candidates.push({ details, webCheck, webUrls, score });
    await sleep(400);
  }

  console.log(`No-website candidates after verification: ${candidates.length}`);

  const inserted: Lead[] = [];

  for (const c of candidates) {
    const town = extractTown(location, c.details.formatted_address);
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
      ...c.webUrls.slice(0, 5),
    ]
      .filter(Boolean)
      .join(",");

    const slug = toSlug(c.details.name);
    const notes = [
      c.webCheck === "social_only" ? "Facebook/Instagram-only presence (verified)" : null,
      c.webCheck === "uncertain" ? "Web search inconclusive — manual check advised" : null,
    ]
      .filter(Boolean)
      .join("; ");

    const id = insertLead({
      business_name: c.details.name,
      niche,
      region: location,
      owner_name: null,
      email: null,
      phone,
      score: c.score,
      state: "NEW",
      site_url: null,
      slug,
      pitched_at: null,
      reply_status: null,
      quoted_price: null,
      source_urls: sourceUrls || null,
      notes: notes || null,
    });

    inserted.push({
      id,
      business_name: c.details.name,
      niche,
      region: location,
      owner_name: null,
      email: null,
      phone,
      score: c.score,
      state: "NEW",
      site_url: null,
      slug,
      pitched_at: null,
      last_touch: 0,
      reply_status: null,
      quoted_price: null,
      source_urls: sourceUrls || null,
      notes: notes || null,
      created_at: "",
      updated_at: "",
    });
  }

  console.log(`Inserted ${inserted.length} new lead(s).`);

  const top = [...inserted]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, config.daily_build_cap);

  if (top.length === 0) {
    console.log("\nNo new leads to show.");
    return;
  }

  console.log(`\nTop ${top.length} (daily_build_cap = ${config.daily_build_cap}):\n`);
  printTable(
    top.map((l) => ({
      name: l.business_name,
      score: l.score ?? 0,
      phone: l.phone ?? "",
      hasEmail: l.email ? "yes" : "no",
      source: (l.source_urls ?? "").split(",")[0] || "—",
    }))
  );

  if (approvalIncludesBuild(config.approval_mode)) {
    console.log(
      "\n⏸  approval_mode requires your picks before build. Reply with which leads to proceed with."
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
