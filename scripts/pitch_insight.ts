import "./config_guard.js"; // ARCH-7: config.yaml read-only at runtime
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { briefDir, ROOT } from "./site_config.js";
import type { SiteStrategy } from "./site_strategy.js";

export interface PitchInsight {
  slug: string;
  opening_line: string;
  source_quote: string;
  source_evidence: string;
  why_this_angle: string;
  suggested_whatsapp: string;
  price_recommendation_gbp: number;
  price_tier: "starter" | "standard" | "premium";
  follow_up_replies: { trigger: string; text: string }[];
}

function loadPricing(): { starter: number; standard: number; premium: number } {
  const configPath = path.join(ROOT, "config.yaml");
  const raw = parseYaml(fs.readFileSync(configPath, "utf8")) as {
    pricing?: { starter?: number; standard?: number; premium?: number };
  };
  return {
    starter: raw.pricing?.starter ?? 300,
    standard: raw.pricing?.standard ?? 500,
    premium: raw.pricing?.premium ?? 800,
  };
}

function recommendPrice(strategy: SiteStrategy): { gbp: number; tier: PitchInsight["price_tier"] } {
  const pricing = loadPricing();
  if (strategy.evidence_strength === "strong") {
    return { gbp: Math.round(pricing.starter * 0.9), tier: "starter" };
  }
  if (strategy.evidence_strength === "moderate") {
    return { gbp: 275, tier: "starter" };
  }
  return { gbp: 250, tier: "starter" };
}

export function buildPitchInsight(slug: string, strategy: SiteStrategy, businessName: string): PitchInsight {
  const quote = strategy.strongest_review_quote;
  const theme = strategy.customer_praise_themes[0] ?? "local trade work";
  const price = recommendPrice(strategy);

  const opening_line = quote
    ? `Hi - I read a review where ${quote.author} mentioned ${theme} on a job with ${businessName}. That stood out.`
    : `Hi - I looked at ${businessName} online and customers seem to rate the ${theme} most.`;

  const suggested_whatsapp = quote
    ? `Hi, Julius here. I build websites for local trades. One of your Google reviews from ${quote.author} mentioned ${theme} - I mocked up a one-page site around that. No obligation - want a quick look?`
    : `Hi, Julius here. I build sites for local trades. I had a look at ${businessName} and put together a simple one-page idea from your public reviews and photos. No obligation - happy to send a short video if useful?`;

  return {
    slug,
    opening_line,
    source_quote: quote?.text.slice(0, 300) ?? "",
    source_evidence: strategy.strongest_proof_source
      ? `${strategy.strongest_proof_source.platform}: ${strategy.strongest_proof_source.metric}`
      : "Google reviews and public listing",
    why_this_angle: strategy.pitch_hook_summary,
    suggested_whatsapp,
    price_recommendation_gbp: price.gbp,
    price_tier: price.tier,
    follow_up_replies: [
      {
        trigger: "price",
        text: `One-page site from £${loadPricing().starter}. Includes mobile layout and quote form.`,
      },
      {
        trigger: "not interested",
        text: "No problem - I will remove the preview. Thanks for your time.",
      },
    ],
  };
}

export function savePitchInsight(slug: string, insight: PitchInsight): void {
  const dir = briefDir(slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "pitch-insight.json"), JSON.stringify(insight, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "pitch-insight.md"), renderPitchMd(insight, slug));
}

function renderPitchMd(p: PitchInsight, slug: string): string {
  return `# Pitch insight - ${slug}

## Opening line
${p.opening_line}

## Source quote
${p.source_quote ? `> "${p.source_quote.slice(0, 200)}..."` : "- None"}

## Source evidence
${p.source_evidence}

## Why this angle
${p.why_this_angle}

## Suggested WhatsApp
${p.suggested_whatsapp}

## Price recommendation
£${p.price_recommendation_gbp} (${p.price_tier})

## Follow-up replies
${p.follow_up_replies.map((f) => `- ${f.trigger}: ${f.text}`).join("\n")}

Do not send until outreach gates allow.
`;
}

export function loadPitchInsight(slug: string): PitchInsight | null {
  const p = path.join(briefDir(slug), "pitch-insight.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as PitchInsight;
}

function parseArgs(): { slug?: string } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  return { slug };
}

export function runPitchInsightCli(slug: string): PitchInsight {
  const strategyPath = path.join(briefDir(slug), "site-strategy.json");
  if (!fs.existsSync(strategyPath)) {
    throw new Error(`Missing site-strategy.json. Run npm run site:strategy -- --slug ${slug} first`);
  }
  const strategy = JSON.parse(fs.readFileSync(strategyPath, "utf8")) as SiteStrategy;
  const briefPath = path.join(briefDir(slug), "brief.json");
  const brief = fs.existsSync(briefPath)
    ? (JSON.parse(fs.readFileSync(briefPath, "utf8")) as { business_name: string })
    : { business_name: slug };
  const insight = buildPitchInsight(slug, strategy, brief.business_name);
  savePitchInsight(slug, insight);
  console.log(`Pitch insight saved: briefs/${slug}/pitch-insight.json`);
  return insight;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { slug } = parseArgs();
  if (!slug) {
    console.error("Usage: npm run site:pitch -- --slug <slug>");
    process.exit(1);
  }
  runPitchInsightCli(slug);
}
