export type TradeRelevance =
  | "primary_trade_match"
  | "mixed_trade_match"
  | "weak_trade_match"
  | "irrelevant_trade";

export interface TradeRelevanceInput {
  businessName: string;
  niche: string;
  types?: string[];
  reviewTexts?: string[];
  extraText?: string;
}

export interface TradeRelevanceResult {
  relevance: TradeRelevance;
  notes: string;
  signals: string[];
}

interface NicheProfile {
  strong: RegExp[];
  mixed: RegExp[];
  irrelevantOnly: RegExp[];
  weak: RegExp[];
  typeHints: string[];
}

const NICHE_PROFILES: Record<string, NicheProfile> = {
  plumber: {
    strong: [
      /\bplumber\b/i,
      /\bplumbing\b/i,
      /\bemergency plumber\b/i,
      /\bheating and plumbing\b/i,
      /\bbathroom plumbing\b/i,
      /\bleak repair\b/i,
      /\bdrain plumbing\b/i,
      /\bpipe repair\b/i,
      /\bboiler\b/i,
      /\bcylinder\b/i,
      /\bcentral heating\b/i,
    ],
    mixed: [
      /\blocksmith\b.*\bplumb/i,
      /\bplumb.*\blocksmith\b/i,
      /\belectric(?:al)?\b.*\bplumb/i,
      /\bplumb.*\belectric/i,
      /\bhandyman\b/i,
      /\bproperty maintenance\b/i,
      /\bmaintenance\b.*\bplumb/i,
    ],
    weak: [
      /\bheating\b/i,
      /\bdrainage\b/i,
      /\bdrain\b/i,
      /\bgas safe\b/i,
      /\bproperty services\b/i,
    ],
    irrelevantOnly: [
      /\bplumbing trade partners\b/i,
      /\bplumbing supplies\b/i,
      /\bwholesale\b/i,
    ],
    typeHints: ["plumber", "plumbing"],
  },
  electrician: {
    strong: [/\belectric/i, /\bew\b/i, /\brewire/i, /\bfuse\b/i, /\blighting\b/i],
    mixed: [/\bplumb/i, /\blocksmith/i, /\bhandyman\b/i],
    weak: [/\bproperty maintenance\b/i, /\balarms?\b/i],
    irrelevantOnly: [/\blocksmith\b/i, /\bplumb(?:er|ing)\b/i, /\bbuilder only\b/i],
    typeHints: ["electrician", "electrical"],
  },
};

function resolveProfile(niche: string): NicheProfile {
  const n = niche.toLowerCase();
  if (n.includes("plumb")) return NICHE_PROFILES.plumber;
  if (n.includes("electric")) return NICHE_PROFILES.electrician;

  const singular = n.replace(/s$/, "");
  return {
    strong: [new RegExp(`\\b${singular}\\b`, "i"), new RegExp(`\\b${n}\\b`, "i")],
    mixed: [/\bhandyman\b/i, /\bproperty maintenance\b/i, /\bmaintenance\b/i],
    weak: [/\bservices\b/i, /\brepairs\b/i],
    irrelevantOnly: [/\bsupplies\b/i, /\bwholesale\b/i],
    typeHints: [singular, n],
  };
}

function matchAny(text: string, patterns: RegExp[]): string[] {
  const hits: string[] = [];
  for (const re of patterns) {
    if (re.test(text)) hits.push(re.source.slice(0, 40));
  }
  return hits;
}

export function classifyTradeRelevance(
  input: TradeRelevanceInput
): TradeRelevanceResult {
  const profile = resolveProfile(input.niche);
  const reviewBlob = (input.reviewTexts ?? []).join(" ");
  const typesBlob = (input.types ?? []).join(" ");
  const blob = [
    input.businessName,
    typesBlob,
    reviewBlob,
    input.extraText ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const signals: string[] = [];

  const strongHits = matchAny(blob, profile.strong);
  const mixedHits = matchAny(blob, profile.mixed);
  const weakHits = matchAny(blob, profile.weak);
  const irrelevantHits = matchAny(blob, profile.irrelevantOnly);

  const typeMatch = (input.types ?? []).some((t) =>
    profile.typeHints.some((h) => t.toLowerCase().includes(h))
  );

  if (strongHits.length) signals.push(`strong:${strongHits.slice(0, 3).join(",")}`);
  if (mixedHits.length) signals.push(`mixed:${mixedHits.slice(0, 3).join(",")}`);
  if (weakHits.length) signals.push(`weak:${weakHits.slice(0, 3).join(",")}`);
  if (irrelevantHits.length) signals.push(`irrelevant:${irrelevantHits.slice(0, 3).join(",")}`);
  if (typeMatch) signals.push("google_type_match");

  const hasStrong =
    strongHits.length > 0 ||
    typeMatch ||
    /\bplumb/i.test(input.businessName) && input.niche.toLowerCase().includes("plumb");

  const hasMixed = mixedHits.length > 0;
  const hasWeakOnly = weakHits.length > 0 && !hasStrong;
  const hasIrrelevantOnly =
    irrelevantHits.length > 0 && !hasStrong && !hasMixed;

  if (input.niche.toLowerCase().includes("plumb")) {
    const name = input.businessName.toLowerCase();
    const locksmithOnly =
      /\blocksmith\b/.test(name) &&
      !/\bplumb/.test(blob) &&
      !typeMatch;
    const electricalOnly =
      /\belectric/.test(name) &&
      !/\bplumb/.test(blob) &&
      !typeMatch;
    const drainOnly =
      /\bdrain(?:age)?\b/.test(name) &&
      !/\bplumb/.test(name) &&
      !/\bplumb/.test(blob) &&
      reviewBlob.length < 30;

    if (locksmithOnly || electricalOnly) {
      return {
        relevance: "irrelevant_trade",
        notes: locksmithOnly
          ? "locksmith_only_no_plumbing_signals"
          : "electrical_only_no_plumbing_signals",
        signals,
      };
    }
    if (drainOnly) {
      return {
        relevance: "weak_trade_match",
        notes: "drain_focus_unclear_plumbing_services",
        signals,
      };
    }
  }

  if (hasIrrelevantOnly) {
    return {
      relevance: "irrelevant_trade",
      notes: `irrelevant_only_signals:${irrelevantHits.slice(0, 2).join(",")}`,
      signals,
    };
  }

  if (hasMixed) {
    return {
      relevance: "mixed_trade_match",
      notes: `mixed_trade_signals:${mixedHits.slice(0, 2).join(",")}`,
      signals,
    };
  }

  if (hasStrong) {
    return {
      relevance: "primary_trade_match",
      notes: typeMatch ? "primary_google_type_and_name" : "primary_name_or_reviews",
      signals,
    };
  }

  if (hasWeakOnly) {
    return {
      relevance: "weak_trade_match",
      notes: `weak_trade_signals:${weakHits.slice(0, 2).join(",")}`,
      signals,
    };
  }

  return {
    relevance: "weak_trade_match",
    notes: "no_clear_trade_signals",
    signals,
  };
}

export function tradeRelevanceScoreDelta(relevance: TradeRelevance): number {
  switch (relevance) {
    case "primary_trade_match":
      return 0;
    case "mixed_trade_match":
      return -15;
    case "weak_trade_match":
      return -25;
    case "irrelevant_trade":
      return -100;
  }
}
