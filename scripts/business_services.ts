/**
 * Derive business-specific services from name, reviews, categories and photos.
 */

export interface ServiceEvidence {
  name: string;
  source: "name" | "review" | "category" | "photo" | "inferred";
  score: number;
}

const REVIEW_SIGNALS: { pattern: RegExp; name: string; score: number }[] = [
  { pattern: /\bboiler\b|\bcombi\b|\bgas safe\b/i, name: "Boiler repairs and servicing", score: 4 },
  { pattern: /\bradiator|\bheating\b|\bcentral heating\b/i, name: "Heating and radiators", score: 4 },
  { pattern: /\bbathroom|\bshower|\bbasin|\btile/i, name: "Bathroom installations", score: 4 },
  { pattern: /\btap|\btoilet|\bcistern/i, name: "Tap, toilet and shower repairs", score: 3 },
  { pattern: /\bleak|\bburst|\bpipe/i, name: "Leak and burst pipe repairs", score: 3 },
  { pattern: /\bemergency|\b24.?hour|\burgent/i, name: "Emergency callouts", score: 3 },
  { pattern: /\bgas\b|\bcookers?\b/i, name: "Gas work", score: 3 },
  { pattern: /\bpower flush|\bcylinder/i, name: "Power flushing and cylinders", score: 2 },
  { pattern: /\blandlord|\brental|\bcommercial/i, name: "Landlord and commercial plumbing", score: 2 },
];

const NAME_SIGNALS: { pattern: RegExp; name: string }[] = [
  { pattern: /heating|heat/i, name: "Heating and radiators" },
  { pattern: /plumb/i, name: "General plumbing repairs" },
  { pattern: /precise|precision/i, name: "Precision bathroom and pipework" },
  { pattern: /bathroom/i, name: "Bathroom installations" },
];

function addService(map: Map<string, ServiceEvidence>, name: string, source: ServiceEvidence["source"], score: number): void {
  const key = name.toLowerCase();
  const existing = map.get(key);
  if (!existing || score > existing.score) {
    map.set(key, { name, source, score });
  } else if (existing && score === existing.score && source === "review") {
    map.set(key, { ...existing, score: existing.score + 0.5 });
  }
}

export function deriveBusinessServices(input: {
  businessName: string;
  rawServices: string[];
  reviewsBlob: string;
  categories?: string[];
  photoCount: number;
  niche: string | null;
}): { services: string[]; strategy: string } {
  const map = new Map<string, ServiceEvidence>();
  const blob = input.reviewsBlob.toLowerCase();
  const nameBlob = input.businessName.toLowerCase();

  for (const raw of input.rawServices) {
    const trimmed = raw.trim();
    if (!trimmed || /^plumbers?$/i.test(trimmed)) continue;
    addService(map, trimmed, "category", 2);
  }

  for (const sig of NAME_SIGNALS) {
    if (sig.pattern.test(nameBlob)) {
      addService(map, sig.name, "name", 3);
    }
  }

  for (const sig of REVIEW_SIGNALS) {
    if (sig.pattern.test(blob)) {
      addService(map, sig.name, "review", sig.score);
    }
  }

  if (input.photoCount >= 4 && /bathroom|shower|basin/i.test(blob + nameBlob)) {
    addService(map, "Bathroom refits and shower installs", "photo", 2.5);
  }

  if (map.size === 0) {
    return {
      services: ["General plumbing repairs", "Heating and radiator work", "Emergency callouts"].slice(0, 4),
      strategy: "Broad fallback labels only (weak evidence)",
    };
  }

  const ranked = [...map.values()].sort((a, b) => b.score - a.score);
  const services = ranked.slice(0, 6).map((s) => s.name);

  const sources = new Set(ranked.map((s) => s.source));
  const strategy =
    sources.has("review") && sources.has("name")
      ? "Mixed name and review evidence"
      : sources.has("review")
        ? "Review-led service list"
        : sources.has("name")
          ? "Business name-led service list"
          : "Inferred from categories";

  return { services, strategy };
}

export function servicesOverlapScore(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b.map((s) => s.toLowerCase()));
  const overlap = a.filter((s) => setB.has(s.toLowerCase())).length;
  return overlap / Math.max(a.length, b.length);
}
