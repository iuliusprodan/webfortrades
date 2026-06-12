import { extractMainCity, parseOutwardPostcode } from "./site_content.js";

export type LocationConfidence = "high" | "medium" | "low";
export type LocationValidationStatus =
  | "OK"
  | "LOCATION_MISMATCH_NEEDS_REVIEW"
  | "MISSING_ADDRESS";

export interface LocationValidationResult {
  status: LocationValidationStatus;
  basedCity: string | null;
  basedLocation: string | null;
  outwardPostcode: string | null;
  confidence: LocationConfidence;
  prospectRegion: string | null;
  addressCity: string | null;
  mismatchReason: string | null;
  serviceAreaPrimary: string | null;
  nearbyTowns: string[];
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanTownName(part: string): string {
  return part
    .replace(/\s+[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, "")
    .replace(/\s+(UK|England|Wales|Scotland)$/i, "")
    .trim();
}

const NEARBY_BY_CITY: Record<string, string[]> = {
  bristol: ["Redfield", "St George", "Easton", "Bedminster", "Clifton", "Kingswood", "Fishponds"],
  swansea: ["Port Tennant", "Sketty", "Uplands", "Morriston", "Gorseinon", "Neath", "Llanelli"],
  bath: ["Keynsham", "Midsomer Norton", "Radstock", "Twerton"],
  cardiff: ["Penarth", "Caerphilly", "Barry", "Newport"],
};

function normaliseCityKey(city: string): string {
  return city.trim().toLowerCase();
}

function citiesMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return normaliseCityKey(a) === normaliseCityKey(b);
}

/** Extract city from Google formatted address (prefer last real town before postcode). */
export function addressCityFromGoogle(address: string | null | undefined): string | null {
  if (!address?.trim()) return null;
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
  return extractMainCity(address, null);
}

export function validateBusinessLocation(input: {
  address: string | null | undefined;
  prospectRegion: string | null | undefined;
}): LocationValidationResult {
  const prospectRegion = input.prospectRegion?.trim() || null;
  const addressCity = addressCityFromGoogle(input.address);
  const outward = parseOutwardPostcode(input.address ?? null);

  if (!addressCity && !prospectRegion) {
    return {
      status: "MISSING_ADDRESS",
      basedCity: null,
      basedLocation: null,
      outwardPostcode: outward,
      confidence: "low",
      prospectRegion,
      addressCity: null,
      mismatchReason: "No address city or prospect region",
      serviceAreaPrimary: null,
      nearbyTowns: [],
    };
  }

  const basedCity = addressCity ?? (prospectRegion ? titleCase(prospectRegion) : null);
  const basedLocation =
    basedCity && outward ? `${basedCity}, ${outward}` : basedCity;

  let status: LocationValidationStatus = "OK";
  let mismatchReason: string | null = null;
  let confidence: LocationConfidence = addressCity ? "high" : "medium";

  if (
    addressCity &&
    prospectRegion &&
    !citiesMatch(addressCity, prospectRegion)
  ) {
    status = "LOCATION_MISMATCH_NEEDS_REVIEW";
    mismatchReason = `Google address city (${addressCity}) differs from prospect region (${prospectRegion})`;
    confidence = "high";
  }

  const nearbyTowns =
    basedCity ? NEARBY_BY_CITY[normaliseCityKey(basedCity)] ?? [] : [];

  return {
    status,
    basedCity,
    basedLocation,
    outwardPostcode: outward,
    confidence,
    prospectRegion,
    addressCity,
    mismatchReason,
    serviceAreaPrimary: basedCity,
    nearbyTowns,
  };
}

export function buildVerifiedServiceArea(
  location: LocationValidationResult,
  rawAreas: string[] = []
): string[] {
  const result: string[] = [];
  const primary = location.basedCity;
  if (primary) result.push(primary);

  for (const area of rawAreas) {
    const trimmed = area.trim();
    if (!trimmed || trimmed.length < 3) continue;
    if (/^\d/.test(trimmed)) continue;
    if (/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(trimmed)) continue;
    if (/ltd|limited|materials|construction|cemex|yard/i.test(trimmed)) continue;
    if (trimmed.includes(",")) continue;
    const key = normaliseCityKey(trimmed);
    if (primary && key === normaliseCityKey(primary)) continue;
    if (location.prospectRegion && key === normaliseCityKey(location.prospectRegion) && primary && !citiesMatch(primary, location.prospectRegion)) {
      continue;
    }
    if (primary) {
      const wrongCityNearby = Object.entries(NEARBY_BY_CITY).some(
        ([city, towns]) =>
          city !== normaliseCityKey(primary) &&
          towns.some((t) => normaliseCityKey(t) === key)
      );
      if (wrongCityNearby) continue;
    }
    if (!result.some((r) => normaliseCityKey(r) === key)) {
      result.push(titleCase(trimmed));
    }
  }

  for (const town of location.nearbyTowns) {
    if (result.length >= 8) break;
    const key = normaliseCityKey(town);
    if (!result.some((r) => normaliseCityKey(r) === key)) {
      result.push(town);
    }
  }

  return result.slice(0, 9);
}
