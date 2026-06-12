import { normalizeUkPhoneDigits } from "./phone_utils.js";

export type GeoRelevance =
  | "uk_location_match"
  | "geo_uncertain"
  | "foreign_phone_for_uk_query"
  | "no_uk_contact";

export interface GeoPlaceInput {
  location: string;
  formattedAddress?: string;
  vicinity?: string;
  name?: string;
  phone?: string | null;
}

const UK_LOCATION_HINTS = [
  "bristol",
  "london",
  "manchester",
  "birmingham",
  "leeds",
  "glasgow",
  "liverpool",
  "sheffield",
  "cardiff",
  "edinburgh",
  "newcastle",
  "nottingham",
  "southampton",
  "plymouth",
  "oxford",
  "cambridge",
  "york",
  "bath",
  "exeter",
  "united kingdom",
  "uk",
  "england",
  "scotland",
  "wales",
];

const BRISTOL_AREAS = [
  "bristol",
  "bedminster",
  "clifton",
  "fishponds",
  "kingswood",
  "southville",
  "bishopston",
  "redland",
  "st george",
  "henleaze",
  "horfield",
  "stokes croft",
  "easton",
  "lawrence hill",
  "bradley stoke",
  "filton",
  "patchway",
  "keynsham",
  "nailsea",
  "portishead",
  "weston-super-mare",
  "avon",
  "bs1",
  "bs2",
  "bs3",
  "bs4",
  "bs5",
  "bs6",
  "bs7",
  "bs8",
  "bs9",
  "bs10",
  "bs11",
  "bs13",
  "bs14",
  "bs15",
  "bs16",
];

const UK_POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;

export type UkPhoneClass = "uk_mobile" | "uk_landline" | "foreign" | "none";

export function isUkTargetRun(location: string): boolean {
  const lower = location.toLowerCase();
  return UK_LOCATION_HINTS.some((h) => lower.includes(h));
}

export function classifyUkPhoneForGeo(phone: string | null | undefined): UkPhoneClass {
  if (!phone?.trim()) return "none";

  const raw = phone.trim();
  if (/^\(\d{3}\)\s*\d{3}/.test(raw) || /^\+1\b/.test(raw) || /\b\d{3}-\d{3}-\d{4}\b/.test(raw)) {
    return "foreign";
  }

  const digits = normalizeUkPhoneDigits(raw);
  if (digits.startsWith("07") && digits.length >= 11) return "uk_mobile";
  if (
    (digits.startsWith("01") || digits.startsWith("02") || digits.startsWith("03")) &&
    digits.length >= 10
  ) {
    return "uk_landline";
  }

  if (digits.length === 10 && /^[2-9]/.test(digits)) return "foreign";
  if (digits.length === 11 && digits.startsWith("1")) return "foreign";

  if (raw.includes("+44")) {
    if (digits.startsWith("07")) return "uk_mobile";
    if (digits.startsWith("01") || digits.startsWith("02") || digits.startsWith("03")) {
      return "uk_landline";
    }
  }

  return "foreign";
}

function areaHintsForLocation(location: string): string[] {
  const lower = location.toLowerCase();
  if (lower.includes("bristol")) return BRISTOL_AREAS;
  return [lower];
}

export function hasRegionSignal(input: GeoPlaceInput): boolean {
  const blob = [input.formattedAddress, input.vicinity, input.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hints = areaHintsForLocation(input.location);
  if (hints.some((h) => blob.includes(h))) return true;
  if (UK_POSTCODE.test(input.formattedAddress ?? "")) return true;
  if (/\b(united kingdom|, uk\b| england\b| great britain)\b/i.test(blob)) return true;

  return false;
}

export function classifyGeoRelevance(
  input: GeoPlaceInput,
  options?: { hasEmail?: boolean }
): { relevance: GeoRelevance; notes: string } {
  if (!isUkTargetRun(input.location)) {
    return { relevance: "uk_location_match", notes: "non_uk_target_run_skipped" };
  }

  const phoneClass = classifyUkPhoneForGeo(input.phone);
  const regionOk = hasRegionSignal(input);

  if (phoneClass === "foreign") {
    return {
      relevance: "foreign_phone_for_uk_query",
      notes: `foreign_phone_detected:${input.phone ?? ""}`,
    };
  }

  if (!regionOk) {
    return {
      relevance: "geo_uncertain",
      notes: `no_${input.location.toLowerCase()}_or_uk_address_signal`,
    };
  }

  if (phoneClass === "none") {
    if (options?.hasEmail) {
      return { relevance: "uk_location_match", notes: "no_phone_but_email_and_uk_address" };
    }
    return {
      relevance: "no_uk_contact",
      notes: "no_phone_and_no_email_at_prospect",
    };
  }

  return {
    relevance: "uk_location_match",
    notes: `uk_${phoneClass}_with_region_match`,
  };
}

export function geoBlocksQualifiedReady(relevance: GeoRelevance): boolean {
  return (
    relevance === "foreign_phone_for_uk_query" ||
    relevance === "geo_uncertain" ||
    relevance === "no_uk_contact"
  );
}
