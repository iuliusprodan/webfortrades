import planJson from "@/data/section-plan.json";
import strategyJson from "@/data/site-strategy.json";

export interface PlanSection {
  id: string;
  priority: number;
  heading: string | null;
  justification: string;
  background_mood: string;
}

export interface SectionPlan {
  slug: string;
  sections: PlanSection[];
  omitted_defaults: string[];
  generic_plan: boolean;
}

export interface SiteStrategy {
  business_angle: string;
  customer_praise_themes: string[];
  named_people: string[];
  distinctive_phrases: string[];
  strongest_review_quote: {
    text: string;
    author: string;
    source: string;
  } | null;
  strongest_proof_source: {
    platform: string;
    metric: string;
    url: string;
  } | null;
  claims_to_avoid: string[];
  pitch_hook_summary: string;
  personality: string;
  evidence_strength: string;
  suggested_site_mood: string;
}

export const sectionPlan = planJson as SectionPlan;
export const siteStrategy = strategyJson as SiteStrategy;

export function hasSectionPlan(): boolean {
  return Boolean(sectionPlan?.sections?.length);
}

export function moodClass(mood: string): string {
  switch (mood) {
    case "dark":
      return "bg-foreground text-background";
    case "accent":
      return "bg-accent/10 text-foreground";
    case "warm":
      return "bg-[#f6f0ea] text-foreground";
    case "cool":
      return "bg-surface text-foreground";
    case "surface":
      return "bg-surface text-foreground";
    case "steel":
      return "bg-muted text-foreground";
    default:
      return "bg-background text-foreground";
  }
}
