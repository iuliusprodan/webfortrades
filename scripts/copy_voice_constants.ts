/** Shared copy-voice rules for port prompt and voice_review check. */

export const BANNED_GENERIC_PHRASES = [
  "your trusted partner",
  "one-stop shop",
  "go the extra mile",
  "second to none",
  "no job too big or small",
  "competitive prices",
  "professional service",
  "satisfaction guaranteed",
  "quality you can rely on",
  "explained plainly",
  "we pride ourselves",
  "tailored solutions",
] as const;

/** Defensive provenance / meta-paranoid filler (Pattern A). */
export const BANNED_PROVENANCE_PHRASES = [
  "not stock shots",
  "not stock images",
  "not generic stock",
  "not stock photo",
  "not stock imagery",
  "not a stock",
  "not stock",
  "headlines are not invented",
  "evidence only",
  "supplementary evidence",
  "verified customer proof",
  "independent listings",
  "this preview form does not submit live",
  "verified evidence",
  "trust signals",
  "third-party verification",
  "third party verification",
] as const;

/** Source-citing meta-provenance (Pattern B) — substring banned (not sentence-start-only phrases). */
export const BANNED_META_PROVENANCE_SUBSTRINGS = [
  "described in google reviews",
  "described in customer feedback",
  "mentioned in customer feedback",
  "drawn from the verified google listing",
  "drawn from verified listings",
  "as described in",
  "praised in",
  "noted by reviewers",
  "verified feedback published on",
  "the verified facebook page",
  "verified google listing",
  "photos from the google listing",
  "google reviews name",
  "appears on the verified facebook",
  "appears on the verified google",
  "feedback published on google",
  "published on google for",
  "from google places",
  "from the google listing",
  "from verified listings",
] as const;

/** Sentence-start only — enforced by no_meta_provenance, not substring scan. */
export const BANNED_META_PROVENANCE_SENTENCE_ONLY = [
  "reviews describe",
  "reviews mention",
  "reviews note",
  "customers mention",
  "google reviews describe",
  "customer feedback describes",
  "noted in",
  "sourced from google",
] as const;

/** Banned stat block sub-labels (Pattern E / 2j). */
export const BANNED_STAT_SUBLABELS = [
  "sourced from google",
  "direct line",
  "direct contact line",
] as const;

/** Case-insensitive patterns for banned phrases that need regex matching. */
export const BANNED_GENERIC_PATTERNS: RegExp[] = [
  /your local\s+[\w\s-]*experts/i,
  /\bfully insured\b/i,
  /direct line to\s+\w+/i,
];

/** Sentence-start meta-provenance patterns (Pattern B, sentence level). */
export const META_PROVENANCE_SENTENCE_START =
  /^(reviews|customers|google reviews|the listing|feedback|customer feedback)\s+(describe|mention|note|highlight|praise|say|show|indicate|suggest|confirm)/i;

export const META_PROVENANCE_INLINE =
  /\b(drawn from|based on|sourced from)\s+(the\s+)?(verified\s+)?(google\s+listing|listings|reviews|feedback|facebook)/i;

/** Negative service framing (Pattern C). */
export const NEGATIVE_SERVICE_PATTERNS: RegExp[] = [
  /\bno\s+[\w\s-]+\s+work is\b/i,
  /\bis not mentioned\b/i,
  /\bno\s+[\w\s-]+\s+mentioned\b/i,
  /\bnot mentioned in available evidence\b/i,
];

/** Banned section heading patterns (Pattern E / 2e). */
export const BANNED_SECTION_HEADING_PATTERNS: RegExp[] = [
  /verified customer proof/i,
  /independent listings/i,
  /verified evidence/i,
  /trust signals/i,
  /third[- ]party verification/i,
];

/** Meta-template distinctive angle skeleton. */
export const META_TEMPLATE_ANGLE_RE =
  /trade\s*-\s*the photos are finished jobs,\s*not generic stock,\s*and reviews match that standard/i;

/** Sticky CTA allowed labels. */
export const STICKY_CTA_ALLOWED = [
  "get a quote",
  "get quote",
  "request a quote",
  "get a free quote",
] as const;

/** All build-blocking substring phrases for voice_review extension. */
export const BANNED_ALL_COPY_PHRASES = [
  ...BANNED_GENERIC_PHRASES,
  ...BANNED_PROVENANCE_PHRASES,
  ...BANNED_META_PROVENANCE_SUBSTRINGS,
  ...BANNED_STAT_SUBLABELS,
] as const;

/** Badge/certification strings that must be backed by evidence. */
export const CLAIMED_BADGE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bgas safe\b/i, label: "Gas Safe" },
  { pattern: /\bniceic\b/i, label: "NICEIC" },
  { pattern: /\bnapit\b/i, label: "NAPIT" },
  { pattern: /\bcheckatrade vetted\b/i, label: "Checkatrade Vetted" },
  { pattern: /\bcheckatrade member\b/i, label: "Checkatrade member" },
  { pattern: /\btrustatrader approved\b/i, label: "TrustATrader Approved" },
  { pattern: /\btrustatrader\b/i, label: "TrustATrader" },
  { pattern: /\bpart p\b/i, label: "Part P" },
  { pattern: /\bfully insured\b/i, label: "fully insured" },
  { pattern: /\bwhich[\s-]?trusted trader\b/i, label: "Which? Trusted Trader" },
];

export const VOICE_EXAMPLES_DOC = "docs/copy-voice-examples.md";
