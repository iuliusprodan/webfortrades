import "./config_guard.js"; // ARCH-7: config.yaml read-only at runtime
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractLikelyContactNameFromReviews } from "./contact_name.js";
import { briefDir } from "./site_config.js";
import type { SourceEvidence } from "./source_evidence.js";

export interface SiteStrategy {
  slug: string;
  business_angle: string;
  customer_praise_themes: string[];
  named_people: string[];
  distinctive_phrases: string[];
  strongest_review_quote: {
    text: string;
    author: string;
    source: string;
    url: string;
  } | null;
  strongest_proof_source: {
    platform: string;
    metric: string;
    url: string;
  } | null;
  best_photos_rationale: string;
  claims_to_avoid: string[];
  pitch_hook_summary: string;
  personality: string;
  evidence_strength: "strong" | "moderate" | "thin";
  suggested_site_mood: string;
  suggested_proof_hierarchy: string[];
  pitch_insight_seed: string;
  trade?: string;
  location?: string;
}

interface Brief {
  business_name: string;
  owner_name: string | null;
  phone: string | null;
  address: string;
  based_location?: string | null;
  services: string[];
  photos: { local: string; caption?: string; cluster_id?: string }[];
  reviews: { text: string; reviewer: string; rating: number }[];
  google_rating?: number | null;
  google_review_count?: number | null;
  google_maps_url?: string | null;
  notes?: string[];
  location_validation_status?: string;
}

const PRAISE_PATTERNS: { re: RegExp; theme: string }[] = [
  { re: /tidy|clean|spotless| immaculate/i, theme: "tidy finishes" },
  { re: /professional|quality|standard|finish|high standard/i, theme: "quality workmanship" },
  { re: /punctual|on time|when (they|he|she) said|reliable/i, theme: "reliable attendance" },
  { re: /fair|reasonable|competitive|price|quote|budget/i, theme: "fair pricing" },
  { re: /communicat|friendly|pleasant|respectful/i, theme: "clear communication" },
  { re: /recommend|again|would use|brilliant|excellent|exceptional/i, theme: "strong recommendations" },
  { re: /bathroom|tiling|refit|renovation/i, theme: "bathroom and refit work" },
  { re: /boiler|heating|radiator/i, theme: "heating work" },
  { re: /emergency|urgent|24 hour|same day/i, theme: "responsive callouts" },
];

function extractThemes(reviews: Brief["reviews"]): string[] {
  const blob = reviews.map((r) => r.text).join(" ").toLowerCase();
  const themes: string[] = [];
  for (const { re, theme } of PRAISE_PATTERNS) {
    if (re.test(blob) && !themes.includes(theme)) themes.push(theme);
  }
  return themes.slice(0, 6);
}

function extractNamedPeople(brief: Brief): string[] {
  const names = new Set<string>();
  const contact = extractLikelyContactNameFromReviews(
    brief.reviews.map((r) => ({ text: r.text, reviewer: r.reviewer })),
    brief.business_name
  );
  if (contact.contact_name_usage_allowed && contact.contact_name) {
    names.add(contact.contact_name);
  }
  const nameRe = /\b(Jack|Nick|Ryan|Isaac|Dave|Mark|Tom|James|John|Steve|Matt|Luke|Dan|Chris|Joe|Robert|Stephen|Harriet|Margi|Sue|Roy|Amy|Liam)\b/gi;
  for (const r of brief.reviews) {
    const matches = r.text.match(nameRe);
    if (matches) {
      for (const m of matches) {
        const n = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
        if (n.length >= 3) names.add(n);
      }
    }
  }
  if (brief.owner_name) names.add(brief.owner_name);
  return [...names].slice(0, 5);
}

function extractPhrases(reviews: Brief["reviews"]): string[] {
  const phrases: string[] = [];
  for (const r of reviews) {
    const sentences = r.text.split(/[.!?]/).map((s) => s.trim()).filter((s) => s.length > 20 && s.length < 120);
    for (const s of sentences.slice(0, 2)) {
      if (!phrases.includes(s)) phrases.push(s);
    }
  }
  return phrases.slice(0, 5);
}

function strongestQuote(brief: Brief): SiteStrategy["strongest_review_quote"] {
  if (!brief.reviews.length) return null;
  const best = brief.reviews.slice().sort((a, b) => b.text.length - a.text.length)[0]!;
  return {
    text: best.text.slice(0, 500),
    author: best.reviewer,
    source: "google",
    url: brief.google_maps_url ?? "",
  };
}

function inferPersonality(themes: string[], brief: Brief): string {
  const blob = [brief.business_name, ...brief.services, ...themes].join(" ").toLowerCase();
  if (/emergency|24 hour|breakdown/i.test(blob)) return "emergency";
  if (/heritage|restor|period|century/i.test(blob)) return "heritage";
  if (/decor|paint|craft|tiling|feature/i.test(blob)) return "craft";
  if (/heat|boiler|radiator/i.test(blob)) return "practical";
  if (/commercial|office|shop/i.test(blob)) return "industrial";
  if (extractNamedPeople(brief).length >= 2) return "family";
  return "local";
}

function inferBusinessAngle(brief: Brief, themes: string[], people: string[]): string {
  const name = brief.business_name;
  const area = brief.based_location ?? brief.address.split(",").slice(-2)[0]?.trim() ?? "";
  if (people.length >= 2) {
    return `${name}: ${people.slice(0, 2).join(" and ")} team, ${themes[0] ?? "local trade work"} across ${area}`;
  }
  if (themes.includes("bathroom and refit work")) {
    return `${name} centred on bathroom refits and installations in ${area}`;
  }
  if (themes.includes("heating work") || /heat|boiler/i.test(name)) {
    return `${name}: heating and plumbing with ${themes[0] ?? "straightforward local service"}`;
  }
  if (themes.length) {
    return `${name} - customers praise ${themes.slice(0, 2).join(" and ")} in ${area}`;
  }
  return `${name} local trade business in ${area}`;
}

function evidenceStrength(
  brief: Brief,
  evidence: SourceEvidence | null
): SiteStrategy["evidence_strength"] {
  let score = 0;
  if ((brief.reviews?.length ?? 0) >= 3) score += 2;
  if (brief.google_rating && brief.google_rating >= 4.5) score += 1;
  if (evidence?.sources_verified.includes("facebook")) score += 2;
  if (evidence?.sources_verified.includes("google_places")) score += 1;
  if (evidence?.sources_verified.some((s) => /checkatrade|trustatrader/i.test(s))) score += 2;
  if (score >= 5) return "strong";
  if (score >= 3) return "moderate";
  return "thin";
}

function proofHierarchy(evidence: SourceEvidence | null, brief: Brief): string[] {
  const hierarchy: string[] = [];
  if (evidence?.sources_verified.includes("facebook")) hierarchy.push("facebook_verified");
  if (brief.google_rating) hierarchy.push("google_rating_reviews");
  for (const s of evidence?.sources_verified ?? []) {
    if (!hierarchy.includes(s) && s !== "google_places") hierarchy.push(s);
  }
  if ((brief.photos?.length ?? 0) > 0) hierarchy.push("photo_gallery");
  return hierarchy;
}

function pitchSeed(brief: Brief, themes: string[], quote: SiteStrategy["strongest_review_quote"]): string {
  if (quote && themes.length) {
    return `Lead with review detail about ${themes[0]} (${quote.author})`;
  }
  if (themes.length) return `Lead with repeated praise for ${themes[0]}`;
  return `Lead with local ${brief.business_name} and Google rating if sourced`;
}

export function buildSiteStrategy(
  slug: string,
  brief: Brief,
  evidence: SourceEvidence | null
): SiteStrategy {
  const themes = extractThemes(brief.reviews);
  const people = extractNamedPeople(brief);
  const phrases = extractPhrases(brief.reviews);
  const quote = strongestQuote(brief);
  const personality = inferPersonality(themes, brief);
  const claims_to_avoid: string[] = [];
  if (brief.location_validation_status === "LOCATION_MISMATCH_NEEDS_REVIEW") {
    claims_to_avoid.push("Wrong prospect region in copy");
  }
  if (!brief.owner_name) claims_to_avoid.push("Fake owner or founder claims");
  claims_to_avoid.push("Supplier names as job locations in captions");
  claims_to_avoid.push("Invented service areas");

  const moodMap: Record<string, string> = {
    emergency: "urgent, high-contrast, clear callout",
    craft: "warm, photo-led, craft detail",
    heritage: "muted, respectful, story-led",
    family: "approachable, named people, trust-first",
    practical: "clean, straightforward, proof-led",
    local: "local, calm, review-led",
    industrial: "utilitarian, compact, operations feel",
  };

  return {
    slug,
    business_angle: inferBusinessAngle(brief, themes, people),
    customer_praise_themes: themes,
    named_people: people,
    distinctive_phrases: phrases,
    strongest_review_quote: quote,
    strongest_proof_source: evidence?.strongest_proof_source ?? null,
    best_photos_rationale:
      evidence?.image_source_summary.notes ??
      `${brief.photos.length} photos from brief; prefer diverse clusters`,
    claims_to_avoid,
    pitch_hook_summary: pitchSeed(brief, themes, quote),
    personality,
    evidence_strength: evidenceStrength(brief, evidence),
    suggested_site_mood: moodMap[personality] ?? moodMap.local!,
    suggested_proof_hierarchy: proofHierarchy(evidence, brief),
    pitch_insight_seed: pitchSeed(brief, themes, quote),
    trade: brief.services[0] ?? undefined,
    location: brief.based_location ?? undefined,
  };
}

export function saveSiteStrategy(slug: string, strategy: SiteStrategy): void {
  const dir = briefDir(slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "site-strategy.json"), JSON.stringify(strategy, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "site-strategy.md"), renderStrategyMd(strategy));
}

function renderStrategyMd(s: SiteStrategy): string {
  return `# Site strategy - ${s.slug}

## Business angle
${s.business_angle}

## Customer praise themes
${s.customer_praise_themes.map((t) => `- ${t}`).join("\n") || "- None extracted"}

## Named people (verified from reviews only)
${s.named_people.map((p) => `- ${p}`).join("\n") || "- None"}

## Strongest review quote
${s.strongest_review_quote ? `> "${s.strongest_review_quote.text.slice(0, 200)}..." - ${s.strongest_review_quote.author}` : "- None"}

## Strongest proof
${s.strongest_proof_source ? `- ${s.strongest_proof_source.platform}: ${s.strongest_proof_source.metric}` : "- Google only"}

## Personality / mood
- Personality: ${s.personality}
- Site mood: ${s.suggested_site_mood}
- Evidence strength: ${s.evidence_strength}

## Proof hierarchy
${s.suggested_proof_hierarchy.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## Claims to avoid
${s.claims_to_avoid.map((c) => `- ${c}`).join("\n")}

## Pitch insight seed
${s.pitch_insight_seed}
`;
}

export function loadSiteStrategy(slug: string): SiteStrategy | null {
  const p = path.join(briefDir(slug), "site-strategy.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as SiteStrategy;
}

function parseArgs(): { slug?: string } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  return { slug };
}

export function runSiteStrategyCli(slug: string): SiteStrategy {
  const briefPath = path.join(briefDir(slug), "brief.json");
  if (!fs.existsSync(briefPath)) throw new Error(`Missing brief.json for ${slug}`);
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as Brief;
  const evidencePath = path.join(briefDir(slug), "source-evidence.json");
  const evidence = fs.existsSync(evidencePath)
    ? (JSON.parse(fs.readFileSync(evidencePath, "utf8")) as SourceEvidence)
    : null;
  const strategy = buildSiteStrategy(slug, brief, evidence);
  saveSiteStrategy(slug, strategy);
  console.log(`Site strategy saved: briefs/${slug}/site-strategy.json`);
  console.log(`  Angle: ${strategy.business_angle.slice(0, 80)}...`);
  console.log(`  Evidence: ${strategy.evidence_strength}`);
  return strategy;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { slug } = parseArgs();
  if (!slug) {
    console.error("Usage: npm run site:strategy -- --slug <slug>");
    process.exit(1);
  }
  runSiteStrategyCli(slug);
}
