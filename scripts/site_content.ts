/**
 * Normalise brief content for site copy: service areas, services, based location.
 */

export interface ServiceEntryLike {
  name: string;
  source?: string;
  direct?: boolean;
}

const INVALID_SERVICE_PATTERNS = [
  /^plumbers?$/i,
  /^electricians?$/i,
  /^roofers?$/i,
  /^mechanics?$/i,
  /^decorators?$/i,
  /^builders?$/i,
  /^handymen?$/i,
  /^tradesmen?$/i,
  /^contractors?$/i,
];

const BROAD_TRADE_PATTERNS = [
  /^plumbing$/i,
  /^electrical services?$/i,
  /^roofing services?$/i,
  /^general trade services?$/i,
];

const NEARBY_BY_CITY: Record<string, string[]> = {
  bristol: [
    "Redfield",
    "St George",
    "Easton",
    "Bedminster",
    "Clifton",
    "Kingswood",
    "Fishponds",
    "Bishopston",
  ],
  bath: ["Keynsham", "Midsomer Norton", "Radstock", "Twerton", "Oldfield Park"],
  london: ["Hackney", "Islington", "Camden", "Greenwich", "Wandsworth", "Lambeth"],
};

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanTownName(part: string): string {
  return part
    .replace(/\s+[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, "")
    .replace(/\s+(UK|England|Wales|Scotland)$/i, "")
    .trim();
}

function normaliseCityKey(city: string): string {
  return city.trim().toLowerCase();
}

export function extractMainCity(
  address: string | null | undefined,
  region: string | null | undefined
): string | null {
  if (address?.trim()) {
    const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (/^uk$/i.test(p)) continue;
      if (/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(p)) {
        const town = parts[i - 1];
        if (town && !/^\d/.test(town) && town.length >= 3) {
          return titleCase(cleanTownName(town));
        }
        continue;
      }
      if (/^\d/.test(p)) continue;
      if (p.length >= 3 && !/^(ltd|limited|inc|plc)$/i.test(p)) {
        return titleCase(cleanTownName(p));
      }
    }
  }
  if (region?.trim()) {
    const r = region.trim();
    if (!/^\d/.test(r) && r.length >= 3) return titleCase(r);
  }
  return null;
}

export function parseOutwardPostcode(address: string | null | undefined): string | null {
  if (!address?.trim()) return null;
  const match = address.match(/\b([A-Z]{1,2}\d[A-Z\d]?)\s*\d[A-Z]{2}\b/i);
  return match ? match[1].toUpperCase() : null;
}

export function basedLocationLabel(
  address: string | null | undefined,
  region: string | null | undefined
): string | null {
  const city = extractMainCity(address, region);
  const outward = parseOutwardPostcode(address);
  if (city && outward) return `${city}, ${outward}`;
  if (city) return city;
  return null;
}

function looksLikeStreetOrAddress(part: string): boolean {
  const p = part.trim();
  if (!p) return true;
  if (/^\d/.test(p)) return true;
  if (/^st\s+[a-z]/i.test(p)) return false;
  if (
    /\b(street|road|rd|lane|ln|drive|dr|avenue|ave|close|way|court|ct|place|pl|terrace|gardens|grove|crescent|hill|parade)\b/i.test(
      p
    )
  ) {
    return true;
  }
  if (/^\d+[a-z]?\s+.+\bst\b/i.test(p)) return true;
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(p)) return true;
  if (/^[A-Z]{1,2}\d[A-Z\d]?$/i.test(p)) return true;
  return false;
}

export function normalizeServiceArea(
  rawAreas: string[],
  address: string | null | undefined,
  region: string | null | undefined
): string[] {
  const city = extractMainCity(address, region);
  const result: string[] = [];

  if (city) result.push(city);

  for (const area of rawAreas) {
    const trimmed = area.trim();
    if (!trimmed || looksLikeStreetOrAddress(trimmed)) continue;
    const key = normaliseCityKey(trimmed);
    if (city && key === normaliseCityKey(city)) continue;
    if (/^uk$/i.test(trimmed)) continue;
    if (!result.some((r) => normaliseCityKey(r) === key)) {
      result.push(titleCase(trimmed));
    }
  }

  if (city) {
    const nearby = NEARBY_BY_CITY[normaliseCityKey(city)] ?? [];
    for (const town of nearby) {
      if (result.length >= 9) break;
      const key = normaliseCityKey(town);
      if (!result.some((r) => normaliseCityKey(r) === key)) {
        result.push(town);
      }
    }
  }

  return result.slice(0, 9);
}

function isInvalidServiceName(name: string): boolean {
  const t = name.trim();
  if (!t) return true;
  return INVALID_SERVICE_PATTERNS.some((re) => re.test(t));
}

function serviceKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function mergeBroadDuplicates(names: string[]): string[] {
  const lower = names.map((n) => n.toLowerCase());
  const hasGeneralPlumbing = lower.some((n) => /general plumbing/.test(n));
  const hasPlumbing = lower.some((n) => n === "plumbing");
  if (hasGeneralPlumbing && hasPlumbing) {
    return names.filter((n) => n.toLowerCase() !== "plumbing");
  }
  return names;
}

export function normalizeServices(
  rawServices: string[],
  niche: string | null | undefined,
  reviewsBlob = ""
): { services: string[]; confidence: "direct" | "inferred" | "mixed" | "broad" } {
  let services = rawServices
    .map((s) => s.trim())
    .filter((s) => s && !isInvalidServiceName(s))
    .filter((s) => !BROAD_TRADE_PATTERNS.some((re) => re.test(s)));

  if (niche) {
    const nicheNorm = niche.replace(/_/g, " ").trim();
    if (isInvalidServiceName(nicheNorm) || BROAD_TRADE_PATTERNS.some((re) => re.test(nicheNorm))) {
      /* drop niche as service */
    } else {
      const key = serviceKey(nicheNorm);
      if (!services.some((s) => serviceKey(s) === key)) {
        services.push(titleCase(nicheNorm));
      }
    }
  }

  services = mergeBroadDuplicates(services);

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const s of services) {
    const key = serviceKey(s);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(s);
  }

  if (deduped.length === 0) {
    const inferred = inferFallbackServices(reviewsBlob, niche);
    return { services: inferred.slice(0, 6), confidence: "broad" };
  }

  return {
    services: deduped.slice(0, 6),
    confidence: deduped.length >= 4 ? "mixed" : "inferred",
  };
}

function inferFallbackServices(reviewsBlob: string, niche: string | null): string[] {
  const blob = reviewsBlob.toLowerCase();
  const trade = (niche ?? "").toLowerCase();
  if (/plumb|bathroom|leak|tap|toilet|heating|radiator/.test(blob + trade)) {
    return [
      "General plumbing repairs",
      "Bathroom plumbing",
      "Heating and radiator work",
      "Leak finding and pipe repairs",
      "Tap, toilet and shower fixes",
      "Small commercial plumbing",
    ];
  }
  return ["Repairs and maintenance", "Installations", "Emergency callouts"];
}

export function isStreetLikeServiceAreaTown(town: string): boolean {
  return looksLikeStreetOrAddress(town);
}

export function serviceAreaHasAddressErrors(areas: string[]): string[] {
  const errors: string[] = [];
  for (const town of areas) {
    if (looksLikeStreetOrAddress(town)) {
      errors.push(`Service area town looks like an address: "${town}"`);
    }
  }
  return errors;
}

export function servicesIncludeBroadTrade(
  services: string[],
  niche: string | null | undefined
): string[] {
  const errors: string[] = [];
  for (const s of services) {
    if (isInvalidServiceName(s)) errors.push(`Invalid service (trade plural): "${s}"`);
    if (BROAD_TRADE_PATTERNS.some((re) => re.test(s))) {
      errors.push(`Service too broad: "${s}"`);
    }
  }
  if (niche) {
    const nicheNorm = niche.replace(/_/g, " ");
    if (
      services.some((s) => s.toLowerCase() === nicheNorm.toLowerCase()) &&
      (isInvalidServiceName(nicheNorm) || BROAD_TRADE_PATTERNS.some((re) => re.test(nicheNorm)))
    ) {
      errors.push(`Niche used as service: "${niche}"`);
    }
  }
  return errors;
}

export interface BusinessNameSource {
  business_name?: string | null;
  name?: string | null;
}

/** Resolve display business name. Never fall back to services or trade. */
export function resolveBusinessName(
  brief: BusinessNameSource,
  lead?: { business_name?: string | null } | null
): string {
  const candidates = [
    brief.business_name?.trim(),
    brief.name?.trim(),
    lead?.business_name?.trim(),
  ].filter(Boolean) as string[];

  if (candidates.length === 0) {
    throw new Error(
      "Missing business name: set brief.business_name, brief.name, or lead.business_name"
    );
  }
  return candidates[0]!;
}

const SERVICE_LABEL_IN_BRAND =
  /\b(repairs?|installations?|maintenance|services?|servicing|callouts?)\b/i;

export function headerBrandLooksLikeService(
  brand: string,
  businessName: string,
  services: string[]
): string | null {
  const brandNorm = brand.trim().toLowerCase();
  const nameNorm = businessName.trim().toLowerCase();

  if (brandNorm === nameNorm) return null;

  for (const service of services) {
    if (brandNorm === service.trim().toLowerCase()) {
      return `Header brand matches service title "${service}"`;
    }
  }

  if (SERVICE_LABEL_IN_BRAND.test(brand) && !brandNorm.includes(nameNorm)) {
    return `Header brand "${brand}" looks like a service label, not "${businessName}"`;
  }

  return null;
}
