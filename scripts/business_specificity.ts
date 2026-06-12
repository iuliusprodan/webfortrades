import fs from "node:fs";
import path from "node:path";
import { briefDir } from "./site_config.js";
import { loadSectionPlan, isGenericSectionPlan } from "./section_planner.js";
import type { SourceEvidence } from "./source_evidence.js";
import type { SiteStrategy } from "./site_strategy.js";
import type { PitchInsight } from "./pitch_insight.js";
import { loadDesignFingerprint } from "./design_review.js";
import { ROOT } from "./site_config.js";

export interface BusinessSpecificityBreakdown {
  source_diversity: number;
  third_party_proof: number;
  review_detail_usage: number;
  named_people_safe: number;
  image_story_fit: number;
  section_plan_specificity: number;
  copy_specificity: number;
  location_accuracy: number;
  unique_visual_direction: number;
  pitch_insight_quality: number;
}

export interface BusinessSpecificityResult {
  slug: string;
  score: number;
  passed: boolean;
  breakdown: BusinessSpecificityBreakdown;
  notes: string[];
}

function loadJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

export function scoreBusinessSpecificity(slug: string): BusinessSpecificityResult {
  const notes: string[] = [];
  const dir = briefDir(slug);
  const evidence = loadJson<SourceEvidence>(path.join(dir, "source-evidence.json"));
  const strategy = loadJson<SiteStrategy>(path.join(dir, "site-strategy.json"));
  const plan = loadSectionPlan(slug);
  const pitch = loadJson<PitchInsight>(path.join(dir, "pitch-insight.json"));
  const brief = loadJson<{ location_validation_status?: string; reviews?: unknown[] }>(
    path.join(dir, "brief.json")
  );

  const breakdown: BusinessSpecificityBreakdown = {
    source_diversity: 0,
    third_party_proof: 0,
    review_detail_usage: 0,
    named_people_safe: 0,
    image_story_fit: 0,
    section_plan_specificity: 0,
    copy_specificity: 0,
    location_accuracy: 0,
    unique_visual_direction: 0,
    pitch_insight_quality: 0,
  };

  if (evidence) {
    breakdown.source_diversity = Math.min(
      100,
      evidence.sources_found.length * 12 + evidence.sources_verified.length * 8
    );
    breakdown.third_party_proof = evidence.sources_verified.some((s) =>
      /facebook|checkatrade|trustatrader/i.test(s)
    )
      ? 85
      : evidence.sources_verified.includes("google_places")
        ? 50
        : 20;
  } else {
    notes.push("Missing source-evidence.json");
  }

  if (strategy) {
    breakdown.review_detail_usage = strategy.strongest_review_quote?.text
      ? Math.min(100, 40 + strategy.customer_praise_themes.length * 10)
      : 20;
    breakdown.named_people_safe = strategy.named_people.length
      ? Math.min(100, strategy.named_people.length * 35)
      : 30;
    breakdown.image_story_fit = strategy.best_photos_rationale ? 70 : 40;
  } else {
    notes.push("Missing site-strategy.json");
  }

  if (plan) {
    breakdown.section_plan_specificity = plan.generic_plan
      ? 0
      : isGenericSectionPlan(plan)
        ? 30
        : Math.min(100, 50 + plan.sections.length * 4 - plan.clone_warnings.length * 10);
    if (plan.omitted_defaults.includes("owner-note")) breakdown.section_plan_specificity += 10;
  } else {
    notes.push("Missing section-plan.json");
  }

  breakdown.location_accuracy =
    brief?.location_validation_status === "OK"
      ? 100
      : brief?.location_validation_status
        ? 30
        : 50;

  const fp = loadDesignFingerprint(ROOT, slug);
  breakdown.unique_visual_direction = fp ? 60 : 30;

  if (pitch?.opening_line && pitch.source_quote) {
    breakdown.pitch_insight_quality = pitch.opening_line.length > 40 ? 85 : 50;
  } else if (pitch) {
    breakdown.pitch_insight_quality = 40;
  } else {
    notes.push("Missing pitch-insight.json");
  }

  breakdown.copy_specificity = strategy?.distinctive_phrases.length
    ? Math.min(100, strategy.distinctive_phrases.length * 20)
    : 25;

  const weights: (keyof BusinessSpecificityBreakdown)[] = [
    "source_diversity",
    "third_party_proof",
    "review_detail_usage",
    "named_people_safe",
    "image_story_fit",
    "section_plan_specificity",
    "copy_specificity",
    "location_accuracy",
    "unique_visual_direction",
    "pitch_insight_quality",
  ];
  const score = Math.round(
    weights.reduce((sum, k) => sum + breakdown[k], 0) / weights.length
  );

  return {
    slug,
    score,
    passed: score >= 70,
    breakdown,
    notes,
  };
}

export function saveBusinessSpecificityReport(slug: string, result: BusinessSpecificityResult): void {
  const dir = briefDir(slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "business-specificity.json"),
    JSON.stringify(result, null, 2) + "\n"
  );
}
