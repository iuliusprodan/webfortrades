import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const QUERY = "plumbers in Bristol";
const LIMIT = 5;

interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
}

interface PlaceDetails {
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
}

interface GoogleApiResponse {
  status: string;
  error_message?: string;
}

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

function apiEnableHint(status: string, endpoint: string): string {
  const hints: Record<string, string> = {
    REQUEST_DENIED: [
      "Enable these APIs in Google Cloud Console (APIs & Services > Library):",
      "  - Places API (legacy endpoints: Text Search + Place Details)",
      "  - Maps JavaScript API is NOT required for this script",
      "Also check: billing enabled on the project, API key restrictions allow server-side Places requests.",
    ].join("\n"),
    OVER_QUERY_LIMIT:
      "Quota exceeded. Check Places API usage and billing in Google Cloud Console.",
    INVALID_REQUEST:
      "Invalid request parameters. Verify the API key and query format.",
    UNKNOWN_ERROR: "Transient Google error. Retry in a moment.",
  };

  const base = hints[status] ?? "See Google Places API documentation for this status code.";
  return `Endpoint: ${endpoint}\nStatus: ${status}\n${base}`;
}

async function placesTextSearch(
  query: string,
  apiKey: string
): Promise<PlaceSearchResult[]> {
  const endpoint = "Place Text Search";
  const params = new URLSearchParams({ query, key: apiKey });
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
  const res = await fetch(url);
  const data = (await res.json()) as GoogleApiResponse & {
    results?: PlaceSearchResult[];
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    const msg = data.error_message ? ` - ${data.error_message}` : "";
    throw new Error(
      `${endpoint} failed: ${data.status}${msg}\n\n${apiEnableHint(data.status, endpoint)}`
    );
  }

  return data.results ?? [];
}

async function placeDetails(placeId: string, apiKey: string): Promise<PlaceDetails> {
  const endpoint = "Place Details";
  const fields = [
    "name",
    "formatted_address",
    "formatted_phone_number",
    "international_phone_number",
    "website",
    "rating",
    "user_ratings_total",
  ].join(",");

  const params = new URLSearchParams({ place_id: placeId, fields, key: apiKey });
  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;
  const res = await fetch(url);
  const data = (await res.json()) as GoogleApiResponse & { result?: PlaceDetails };

  if (data.status !== "OK" || !data.result) {
    const msg = data.error_message ? ` - ${data.error_message}` : "";
    throw new Error(
      `${endpoint} failed for ${placeId}: ${data.status}${msg}\n\n${apiEnableHint(data.status, endpoint)}`
    );
  }

  return data.result;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) {
    console.error(".env file not found at project root.");
    process.exit(1);
  }

  const env = { ...loadEnv(), ...process.env };
  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY is missing from .env");
    process.exit(1);
  }

  console.log(`GOOGLE_PLACES_API_KEY: present`);
  console.log(`Search: "${QUERY}"\n`);

  let results: PlaceSearchResult[];
  try {
    results = await placesTextSearch(QUERY, apiKey);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  if (results.length === 0) {
    console.log("No results returned (ZERO_RESULTS).");
    return;
  }

  const top = results.slice(0, LIMIT);

  for (let i = 0; i < top.length; i++) {
    const hit = top[i];
    if (i > 0) await sleep(200);

    let details: PlaceDetails;
    try {
      details = await placeDetails(hit.place_id, apiKey);
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    }

    const phone =
      details.formatted_phone_number ??
      details.international_phone_number ??
      null;
    const rating =
      details.rating ?? hit.rating ?? null;
    const ratingSuffix =
      details.user_ratings_total != null
        ? ` (${details.user_ratings_total} reviews)`
        : hit.user_ratings_total != null
          ? ` (${hit.user_ratings_total} reviews)`
          : "";

    console.log(`${i + 1}. ${details.name}`);
    console.log(`   Address: ${details.formatted_address ?? hit.formatted_address ?? "-"}`);
    console.log(
      `   Rating: ${rating != null ? `${rating}★${ratingSuffix}` : "-"}`
    );
    console.log(`   Phone: ${phone ?? "-"}`);
    console.log(`   Website: ${details.website ?? "-"}`);
    console.log();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
