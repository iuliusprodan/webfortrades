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
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const MIN_PX = 800;
const MAX_PHOTOS = 15;
const MIN_PHOTOS = 6;
const TARGET_WIDTH = 1600;

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
}

interface Brief {
  business_name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  opening_hours: string[];
  services: string[];
  service_area: string[];
  photos: BriefPhoto[];
  reviews: BriefReview[];
  social: { facebook: string | null; instagram: string | null };
  brand: { colours: string[]; logo_url: string | null };
  sources: string[];
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
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

function parseArgs(): { id?: number; slug?: string } {
  const args = process.argv.slice(2);
  let id: number | undefined;
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id" && args[i + 1]) id = Number(args[++i]);
    else if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  return { id, slug };
}

function resolveLead(id?: number, slug?: string): Lead | undefined {
  if (id) return getLeadById(id);
  if (slug) return getLeadBySlug(slug);
  return getNextNewLead();
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function findPlaceId(
  lead: Lead,
  apiKey: string
): Promise<string | null> {
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
    "url",
    "types",
    "opening_hours",
    "photos",
    "reviews",
    "editorial_summary",
    "vicinity",
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
      `Place Details failed: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}`
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

function typesToServices(types: string[] | undefined): string[] {
  if (!types) return [];
  const skip = new Set([
    "point_of_interest",
    "establishment",
    "store",
    "finance",
  ]);
  const services: string[] = [];
  for (const t of types) {
    if (skip.has(t)) continue;
    services.push(TYPE_LABELS[t] ?? t.replace(/_/g, " "));
  }
  return [...new Set(services)].slice(0, 12);
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

async function findSocialLinks(
  businessName: string,
  region: string
): Promise<{ facebook: string | null; instagram: string | null }> {
  const query = `${businessName} ${region} facebook instagram`;
  const body = new URLSearchParams({ q: query });
  const res = await fetch("https://html.duckduckgo.com/html/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) return { facebook: null, instagram: null };

  const links = parseDdgLinks(await res.text());
  let facebook: string | null = null;
  let instagram: string | null = null;

  for (const link of links) {
    try {
      const host = new URL(link).hostname.replace(/^www\./, "");
      if (!facebook && host.includes("facebook.com")) facebook = link.split("?")[0];
      if (!instagram && host.includes("instagram.com")) instagram = link.split("?")[0];
    } catch {
      /* ignore */
    }
  }
  return { facebook, instagram };
}

async function fetchOgImages(pageUrl: string): Promise<string[]> {
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WebForTradesGather/1.0)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const urls: string[] = [];
    const ogRe = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = ogRe.exec(html)) !== null) urls.push(m[1]);
    return urls;
  } catch {
    return [];
  }
}

function hasWatermark(buffer: Buffer): boolean {
  const text = buffer.toString("latin1").toLowerCase();
  const markers = ["shutterstock", "getty images", "alamy", "dreamstime", "istock"];
  return markers.some((w) => text.includes(w));
}

function isTooBlurry(meta: sharp.Metadata, byteLength: number): boolean {
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w === 0 || h === 0) return true;
  const bpp = byteLength / (w * h);
  return bpp < 0.08;
}

export async function downloadAndOptimizeImage(
  sourceUrl: string,
  outPath: string
): Promise<{ width: number; height: number } | null> {
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

  if (w < MIN_PX && h < MIN_PX) return null;
  if (isTooBlurry(meta, raw.length)) return null;

  if (w > TARGET_WIDTH) {
    img = img.resize({ width: TARGET_WIDTH, withoutEnlargement: true });
  }

  const outMeta = await img.metadata();
  await img.webp({ quality: 85 }).toFile(outPath);

  return {
    width: outMeta.width ?? w,
    height: outMeta.height ?? h,
  };
}

export async function downloadAndOptimizeImages(
  items: { source_url: string; filename: string }[],
  imagesDir: string
): Promise<BriefPhoto[]> {
  fs.mkdirSync(imagesDir, { recursive: true });
  const kept: BriefPhoto[] = [];

  for (const item of items) {
    if (kept.length >= MAX_PHOTOS) break;
    const outPath = path.join(imagesDir, item.filename);
    try {
      const dims = await downloadAndOptimizeImage(item.source_url, outPath);
      if (!dims) {
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
        continue;
      }
      kept.push({
        local: `images/${item.filename}`,
        source_url: item.source_url,
        width: dims.width,
        height: dims.height,
      });
    } catch {
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    }
    await sleep(200);
  }

  return kept;
}

function pickReviews(details: PlaceDetails): BriefReview[] {
  const reviews = details.reviews ?? [];
  return reviews
    .filter((r) => r.text && r.text.length > 20)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 6)
    .map((r) => ({
      text: r.text!.trim(),
      reviewer: (r.author_name ?? "Customer").split(" ")[0],
      rating: r.rating ?? 5,
    }));
}

function inferServiceArea(details: PlaceDetails, region: string | null): string[] {
  const areas = new Set<string>();
  if (region) areas.add(region);
  if (details.vicinity) areas.add(details.vicinity);
  if (details.formatted_address) {
    const parts = details.formatted_address.split(",").map((p) => p.trim());
    for (const p of parts.slice(-3)) areas.add(p);
  }
  return [...areas].filter(Boolean).slice(0, 6);
}

async function gatherBrief(lead: Lead, apiKey: string): Promise<Brief> {
  const placeId = await findPlaceId(lead, apiKey);
  if (!placeId) throw new Error(`Could not resolve Google Place for ${lead.business_name}`);

  const details = await fetchPlaceDetails(placeId, apiKey);
  const social = await findSocialLinks(lead.business_name, lead.region ?? "");

  const sources = new Set<string>();
  if (details.url) sources.add(details.url);
  if (lead.source_urls) lead.source_urls.split(",").forEach((u) => sources.add(u.trim()));
  if (social.facebook) sources.add(social.facebook);
  if (social.instagram) sources.add(social.instagram);

  const photoCandidates: { source_url: string; filename: string }[] = [];
  const placesPhotos = details.photos ?? [];
  for (let i = 0; i < Math.min(placesPhotos.length, 20); i++) {
    const ref = placesPhotos[i].photo_reference;
    photoCandidates.push({
      source_url: placePhotoUrl(ref, apiKey),
      filename: `${String(i + 1).padStart(2, "0")}-places.webp`,
    });
  }

  if (social.facebook) {
    const fbImages = await fetchOgImages(social.facebook);
    fbImages.slice(0, 4).forEach((url, i) => {
      photoCandidates.push({
        source_url: url,
        filename: `fb-${i + 1}.webp`,
      });
      sources.add(url);
    });
  }
  if (social.instagram) {
    const igImages = await fetchOgImages(social.instagram);
    igImages.slice(0, 4).forEach((url, i) => {
      photoCandidates.push({
        source_url: url,
        filename: `ig-${i + 1}.webp`,
      });
      sources.add(url);
    });
  }

  const slug = lead.slug ?? lead.business_name.toLowerCase().replace(/\s+/g, "-");
  const briefDir = path.join(ROOT, "briefs", slug);
  const imagesDir = path.join(briefDir, "images");

  const photos = await downloadAndOptimizeImages(photoCandidates, imagesDir);

  const phone =
    details.formatted_phone_number ??
    details.international_phone_number ??
    lead.phone ??
    null;

  const brief: Brief = {
    business_name: details.name,
    owner_name: null,
    phone,
    email: lead.email,
    address: details.formatted_address ?? "",
    opening_hours: details.opening_hours?.weekday_text ?? [],
    services: typesToServices(details.types),
    service_area: inferServiceArea(details, lead.region),
    photos,
    reviews: pickReviews(details),
    social,
    brand: { colours: [], logo_url: null },
    sources: [...sources],
  };

  fs.mkdirSync(briefDir, { recursive: true });
  fs.writeFileSync(
    path.join(briefDir, "brief.json"),
    JSON.stringify(brief, null, 2) + "\n"
  );

  return brief;
}

function hasContactChannel(brief: Brief): boolean {
  return Boolean(brief.phone?.trim() || brief.email?.trim());
}

function printSummary(lead: Lead, brief: Brief, state: string): void {
  console.log(`1. Business: ${brief.business_name} (${lead.slug}) → state=${state}`);
  console.log(
    `2. Contact: phone=${brief.phone ?? "—"} | email=${brief.email ?? "—"} | address=${brief.address || "—"}`
  );
  console.log(
    `3. Content: ${brief.services.length} services | ${brief.photos.length} photos | ${brief.reviews.length} reviews | hours=${brief.opening_hours.length > 0 ? "yes" : "no"}`
  );
  console.log(
    `4. Social: Facebook=${brief.social.facebook ? "yes" : "no"} | Instagram=${brief.social.instagram ? "yes" : "no"}`
  );
  console.log(
    `5. Service area: ${brief.service_area.join(", ") || "—"}`
  );
  console.log(
    `6. Sources: ${brief.sources.slice(0, 3).join(" | ") || "—"}${brief.sources.length > 3 ? ` (+${brief.sources.length - 3} more)` : ""}`
  );
}

async function main(): Promise<void> {
  const { id, slug } = parseArgs();
  const lead = resolveLead(id, slug);

  if (!lead) {
    console.error("No lead found. Run the prospector first, or pass --id / --slug.");
    process.exit(1);
  }

  if (lead.state !== "NEW") {
    console.warn(`Lead "${lead.business_name}" is state=${lead.state}, not NEW. Proceeding anyway.`);
  }

  const env = { ...loadEnv(), ...process.env };
  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_PLACES_API_KEY in .env");
    process.exit(1);
  }

  console.log(`Gathering: ${lead.business_name} (id=${lead.id}, slug=${lead.slug})`);

  const brief = await gatherBrief(lead, apiKey);
  const contactOk = hasContactChannel(brief);
  const newState = contactOk ? "GATHERED" : "PITCH_BLOCKED";

  updateLead(lead.id, {
    state: newState,
    phone: brief.phone,
    email: brief.email,
    owner_name: brief.owner_name,
    notes: contactOk
      ? `${lead.notes ?? ""}`.trim() || null
      : [lead.notes, "No public phone or email found during gather."]
          .filter(Boolean)
          .join("; "),
  });

  printSummary(lead, brief, newState);

  if (!contactOk) {
    console.log(
      "\n⚠️  PITCH_BLOCKED — no public contact channel (phone/email). Cannot pitch until you find one manually."
    );
  }

  if (brief.photos.length < MIN_PHOTOS) {
    console.log(
      `\n⚠️  Only ${brief.photos.length} photos kept (target ${MIN_PHOTOS}–${MAX_PHOTOS}). Manual photos may be needed.`
    );
  }
}

const isMain = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
