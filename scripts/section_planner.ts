import "./config_guard.js"; // ARCH-7: config.yaml read-only at runtime
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { briefDir, ROOT } from "./site_config.js";
import type { SiteStrategy } from "./site_strategy.js";
import type { SourceEvidence } from "./source_evidence.js";
import type { ImageSlot } from "./image_priority.js";
import { loadAssetReadinessForSlug } from "./asset_readiness.js";

export type SectionType =
  | "proof-led-hero"
  | "photo-led-hero"
  | "review-led-hero"
  | "signature-job-story"
  | "what-customers-keep-mentioning"
  | "third-party-proof-strip"
  | "checkatrade-proof"
  | "trustatrader-proof"
  | "facebook-work-gallery"
  | "instagram-gallery"
  | "service-explainers"
  | "process-section"
  | "emergency-callout"
  | "local-coverage"
  | "team-person-section"
  | "quote-form"
  | "faq"
  | "simple-contact"
  | "review-wall"
  | "featured-review-story"
  | "before-after-gallery"
  | "lean-proof-page"
  | "stats-sourced-only"
  | "gallery-lean";

export interface SectionPlanEntry {
  id: SectionType;
  priority: number;
  heading: string | null;
  justification: string;
  background_mood: "dark" | "light" | "accent" | "warm" | "cool" | "surface" | "steel";
}

export interface SectionPlan {
  slug: string;
  created_at: string;
  sections: SectionPlanEntry[];
  omitted_defaults: string[];
  omitted_reasons: Record<string, string>;
  generic_plan: boolean;
  compared_against: string[];
  clone_warnings: string[];
  image_slots?: ImageSlot[];
  layout_recommendation?: "photo_led" | "proof_led";
}

export const DEFAULT_TEMPLATE_SECTIONS = [
  "hero",
  "stats",
  "owner-note",
  "gallery",
  "services",
  "about",
  "reviews",
  "service-area",
  "faq",
  "contact",
];

export const TEMPLATE_HEADING_BLACKLIST = [
  "Questions before you ring.",
  "Pick up the phone, or write.",
  "One van. One trade. A name on a list.",
  "services. Done plainly.",
  "A note from",
  "Recent work in",
];

interface Brief {
  business_name: string;
  based_location?: string | null;
  address: string;
  services: string[];
  photos: unknown[];
  reviews: { text: string }[];
  google_rating?: number | null;
  google_review_count?: number | null;
  opening_hours?: string[];
}

function areaLabel(brief: Brief): string {
  return brief.based_location?.split(",")[0]?.trim() ?? brief.address.split(",").slice(-2)[0]?.trim() ?? "local area";
}

function hasEmergencySignal(strategy: SiteStrategy, brief: Brief): boolean {
  const blob = [strategy.business_angle, ...brief.services, brief.business_name].join(" ").toLowerCase();
  return /emergency|24 hour|boiler repair|breakdown|urgent/.test(blob) ||
    strategy.customer_praise_themes.includes("responsive callouts");
}

function hasBathroomFocus(strategy: SiteStrategy): boolean {
  return strategy.customer_praise_themes.includes("bathroom and refit work");
}

function hasCheckatrade(evidence: SourceEvidence | null): boolean {
  return evidence?.sources_verified.some((s) => s.includes("checkatrade")) ||
    evidence?.sources_found.includes("checkatrade") ||
    false;
}

function hasFacebookGallery(evidence: SourceEvidence | null): boolean {
  return (evidence?.image_source_summary.facebook_photos ?? 0) > 0 ||
    evidence?.sources_verified.includes("facebook") ||
    false;
}

function listRecentSectionPlans(excludeSlug: string, limit = 5): SectionPlan[] {
  const briefsDir = path.join(ROOT, "briefs");
  if (!fs.existsSync(briefsDir)) return [];
  const plans: SectionPlan[] = [];
  for (const entry of fs.readdirSync(briefsDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === excludeSlug || entry.name.startsWith(".")) continue;
    const planPath = path.join(briefsDir, entry.name, "section-plan.json");
    if (fs.existsSync(planPath)) {
      plans.push(JSON.parse(fs.readFileSync(planPath, "utf8")) as SectionPlan);
    }
  }
  return plans.slice(-limit);
}

function sectionOrderKey(plan: SectionPlan): string {
  return plan.sections.map((s) => s.id).join("|");
}

function compareRecentPlans(plan: SectionPlan, recent: SectionPlan[]): string[] {
  const warnings: string[] = [];
  const key = sectionOrderKey(plan);
  for (const r of recent) {
    if (r.slug === plan.slug) continue;
    const otherKey = sectionOrderKey(r);
    if (key === otherKey) {
      warnings.push(`Identical section order as ${r.slug}`);
    }
    const overlap = plan.sections.filter((s) =>
      r.sections.some((rs) => rs.id === s.id)
    ).length / Math.max(plan.sections.length, 1);
    if (overlap >= 0.85 && plan.sections.length >= 5) {
      warnings.push(`High section overlap (${Math.round(overlap * 100)}%) with ${r.slug}`);
    }
  }
  return warnings;
}

export function buildSectionPlan(
  slug: string,
  strategy: SiteStrategy,
  evidence: SourceEvidence | null,
  brief: Brief
): SectionPlan {
  const area = areaLabel(brief);
  const name = brief.business_name;
  const sections: SectionPlanEntry[] = [];
  let priority = 1;

  const add = (
    id: SectionType,
    heading: string | null,
    justification: string,
    mood: SectionPlanEntry["background_mood"]
  ) => {
    sections.push({ id, priority: priority++, heading, justification, background_mood: mood });
  };

  const quote = strategy.strongest_review_quote;
  const people = strategy.named_people;
  const thin = strategy.evidence_strength === "thin";

  // Hero choice
  if (quote && quote.text.length > 120 && strategy.customer_praise_themes.length) {
    const headline = quote.text.split(/[.!?]/)[0]?.trim().slice(0, 90) ?? "What customers say";
    add(
      "review-led-hero",
      headline.endsWith(".") ? headline : `${headline}.`,
      "Strongest review quote defines the business",
      "cool"
    );
  } else if (hasFacebookGallery(evidence) && (brief.photos.length ?? 0) >= 3) {
    add(
      "photo-led-hero",
      `${name} - recent work in ${area}`,
      "Verified photos stronger than text proof",
      "dark"
    );
  } else if (strategy.strongest_proof_source) {
    add(
      "proof-led-hero",
      `${name} in ${area}`,
      `Lead with ${strategy.strongest_proof_source.platform} proof`,
      "warm"
    );
  } else {
    add("proof-led-hero", `${name} in ${area}`, "Default proof-led hero with sourced stats only", "light");
  }

  // Stats only if sourced
  if (brief.google_rating && brief.google_review_count) {
    add("stats-sourced-only", null, "Google rating and review count sourced from Places", "accent");
  }

  // Third-party proof
  if (hasCheckatrade(evidence)) {
    add("checkatrade-proof", "Verified Checkatrade feedback", "Checkatrade profile found in sources", "surface");
  } else if (strategy.strongest_proof_source && strategy.strongest_proof_source.platform !== "google") {
    add(
      "third-party-proof-strip",
      "Verified customer proof",
      `Surface ${strategy.strongest_proof_source.platform} alongside Google`,
      "accent"
    );
  }

  // Signature story
  if (hasBathroomFocus(strategy)) {
    add(
      "signature-job-story",
      `Bathroom refits and installations in ${area}`,
      "Reviews centre on bathroom and tiling work",
      "light"
    );
  } else if (hasEmergencySignal(strategy, brief)) {
    add(
      "emergency-callout",
      "Emergency plumbing and heating callouts",
      "Business name or reviews suggest urgent work",
      "dark"
    );
  } else if (strategy.customer_praise_themes.length >= 2) {
    add(
      "what-customers-keep-mentioning",
      `What ${area} customers mention most`,
      "Clear repeated praise themes in reviews",
      "surface"
    );
  }

  // Gallery
  if ((brief.photos?.length ?? 0) >= 3) {
    if (hasFacebookGallery(evidence)) {
      add(
        "facebook-work-gallery",
        `Recent work from ${name}`,
        "Facebook photos preferred over Google clusters",
        "light"
      );
    } else {
      add(
        "gallery-lean",
        `Recent plumbing work in ${area}`,
        "Lean gallery, max 2 per cluster",
        "light"
      );
    }
  }

  // Services - flexible count
  const serviceCount = thin ? 3 : Math.min(5, Math.max(3, brief.services.filter((s) => !/home goods|construction store/i.test(s)).length));
  add(
    "service-explainers",
    `${serviceCount} services explained plainly`,
    "Evidence-based service list, not fixed 06 grid",
    "surface"
  );

  // Team block if named people
  if (people.length >= 2) {
    add(
      "team-person-section",
      `${people.slice(0, 2).join(" and ")} at ${name}`,
      "Multiple names verified across reviews",
      "warm"
    );
  } else if (people.length === 1) {
    add(
      "featured-review-story",
      `Customers mention ${people[0]} by name`,
      "Single contact name with review evidence",
      "warm"
    );
  }

  // Process for moderate+ evidence
  if (strategy.evidence_strength !== "thin" && !thin) {
    add(
      "process-section",
      "How a job with us works",
      "Process section adds business-specific clarity",
      "cool"
    );
  }

  // Reviews
  if ((brief.reviews?.length ?? 0) >= 2) {
    add(
      "review-wall",
      brief.google_rating ? `${brief.google_rating} on Google reviews` : "What customers wrote",
      "Full review quotes, not synthetic headlines",
      "light"
    );
  }

  // Local coverage
  add("local-coverage", `Based in ${area}`, "Location verified from Google address", "accent");

  // FAQ only if useful
  const faqUseful = strategy.evidence_strength === "strong" && (brief.opening_hours?.length ?? 0) > 0;
  if (faqUseful) {
    add("faq", "Practical questions", "FAQ justified by hours and strong evidence", "surface");
  }

  // Contact always last
  add(
    "simple-contact",
    `Get a quote from ${name}`,
    "Business-specific contact, not generic phone line copy",
    "dark"
  );
  add("quote-form", null, "Quote form at contact anchor", "dark");

  const omitted_defaults = [
    "owner-note",
    "about-van-template",
    "generic-stats-band",
    ...(faqUseful ? [] : ["faq"]),
    ...((brief.photos?.length ?? 0) < 3 ? ["gallery-default"] : []),
  ];

  const omitted_reasons: Record<string, string> = {
    "owner-note": people.length
      ? "Using team-person or featured-review instead of generic owner note"
      : "No verified owner - avoid fake founder note",
    "about-van-template": 'Avoid "One van. One trade." template block',
    "generic-stats-band": "Stats only when sourced",
    faq: faqUseful ? "" : "FAQ omitted - reviews already answer common questions",
    "gallery-default": "Insufficient photos for full gallery",
  };

  const plan: SectionPlan = {
    slug,
    created_at: new Date().toISOString(),
    sections,
    omitted_defaults,
    omitted_reasons,
    generic_plan: false,
    compared_against: [],
    clone_warnings: [],
  };

  const assetReadiness = loadAssetReadinessForSlug(slug);
  if (assetReadiness) {
    plan.image_slots = assetReadiness.image_slots;
    plan.layout_recommendation = assetReadiness.layout_recommendation;
  }

  const recent = listRecentSectionPlans(slug);
  plan.compared_against = recent.map((r) => r.slug);
  plan.clone_warnings = compareRecentPlans(plan, recent);

  return plan;
}

export function isGenericSectionPlan(plan: SectionPlan): boolean {
  if (plan.generic_plan) return true;
  const ids = plan.sections.map((s) => s.id);
  const defaultLike = [
    "proof-led-hero",
    "stats-sourced-only",
    "gallery-lean",
    "service-explainers",
    "review-wall",
    "local-coverage",
    "faq",
    "simple-contact",
  ];
  if (ids.length === defaultLike.length && ids.every((id, i) => id === defaultLike[i])) {
    return plan.omitted_defaults.length < 2;
  }
  return false;
}

export function saveSectionPlan(slug: string, plan: SectionPlan): void {
  const dir = briefDir(slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "section-plan.json"), JSON.stringify(plan, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "section-plan.md"), renderSectionPlanMd(plan));
}

function renderSectionPlanMd(plan: SectionPlan): string {
  const lines = [
    `# Section plan - ${plan.slug}`,
    "",
    `- Created: ${plan.created_at}`,
    `- Generic plan: ${plan.generic_plan ? "yes (REJECT)" : "no"}`,
    "",
    "## Sections",
    ...plan.sections.map(
      (s) =>
        `### ${s.priority}. ${s.id}\n- Heading: ${s.heading ?? "(component default)"}\n- Mood: ${s.background_mood}\n- Why: ${s.justification}`
    ),
    "",
    "## Omitted defaults",
    ...plan.omitted_defaults.map((o) => `- ${o}: ${plan.omitted_reasons[o] ?? ""}`),
    "",
    "## Clone warnings",
    ...(plan.clone_warnings.length ? plan.clone_warnings.map((w) => `- ${w}`) : ["- None"]),
    "",
    "## Compared against",
    ...(plan.compared_against.length ? plan.compared_against.map((s) => `- ${s}`) : ["- No recent plans"]),
  ];
  return lines.join("\n") + "\n";
}

export function loadSectionPlan(slug: string): SectionPlan | null {
  const p = path.join(briefDir(slug), "section-plan.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as SectionPlan;
}

function parseArgs(): { slug?: string } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  return { slug };
}

export function runSectionPlannerCli(slug: string): SectionPlan {
  const briefPath = path.join(briefDir(slug), "brief.json");
  if (!fs.existsSync(briefPath)) throw new Error(`Missing brief.json for ${slug}`);
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as Brief;
  const strategyPath = path.join(briefDir(slug), "site-strategy.json");
  if (!fs.existsSync(strategyPath)) {
    throw new Error(`Missing site-strategy.json. Run npm run site:strategy -- --slug ${slug} first`);
  }
  const strategy = JSON.parse(fs.readFileSync(strategyPath, "utf8")) as SiteStrategy;
  const evidencePath = path.join(briefDir(slug), "source-evidence.json");
  const evidence = fs.existsSync(evidencePath)
    ? (JSON.parse(fs.readFileSync(evidencePath, "utf8")) as SourceEvidence)
    : null;
  const plan = buildSectionPlan(slug, strategy, evidence, brief);
  saveSectionPlan(slug, plan);
  console.log(`Section plan saved: briefs/${slug}/section-plan.json`);
  console.log(`  Sections: ${plan.sections.length}`);
  console.log(`  Generic: ${plan.generic_plan}`);
  if (plan.clone_warnings.length) {
    console.warn(`  Clone warnings: ${plan.clone_warnings.join("; ")}`);
  }
  return plan;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { slug } = parseArgs();
  if (!slug) {
    console.error("Usage: npm run site:sections -- --slug <slug>");
    process.exit(1);
  }
  runSectionPlannerCli(slug);
}
