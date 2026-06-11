import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { briefDir, ROOT } from "./site_config.js";
import { syncBatchStatusFromArtifacts } from "./batch_write_status.js";
import { loadDesignFingerprint } from "./design_review.js";
import {
  DEFAULT_TEMPLATE_SECTIONS,
  loadSectionPlan,
  TEMPLATE_HEADING_BLACKLIST,
  type SectionPlan,
} from "./section_planner.js";

export interface CloneReviewScore {
  section_order_similarity: number;
  heading_reuse: number;
  hero_pattern_reuse: number;
  cta_strip_reuse: number;
  service_list_shape_reuse: number;
  review_block_reuse: number;
  contact_section_reuse: number;
  copy_phrase_reuse: number;
  palette_font_layout_similarity: number;
  overall_clone_score: number;
  business_specificity_estimate: number;
}

export interface CloneReviewResult {
  slug: string;
  reviewed_at: string;
  read_only: true;
  passed: boolean;
  clone_score: number;
  business_specificity_estimate: number;
  scores: CloneReviewScore;
  issues: { severity: "error" | "warn"; message: string }[];
  missing_artifacts: string[];
  template_headings_found: string[];
  section_plan_generic: boolean | null;
  compared_slugs: string[];
}

const TEMPLATE_COPY_PHRASES = [
  "Need this sorted? Get a free quote.",
  "Want a price before booking? Get a quote.",
  "Prefer to talk it through? Call",
  "Plumbing sorted properly.",
  "Local plumber. Clear quotes.",
  "Leaves the place spotless",
  "Turns up when promised",
  "Get a free quote",
];

const DEFAULT_SECTION_ORDER = DEFAULT_TEMPLATE_SECTIONS.join("|");

function readSiteHtml(slug: string): string {
  const candidates = [
    path.join(ROOT, "sites", slug, "out", "index.html"),
    path.join(ROOT, "sites", slug, ".next", "server", "app", "index.html"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return fs.readFileSync(c, "utf8");
  }
  return "";
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const inter = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

function findTemplateHeadings(text: string): string[] {
  const found: string[] = [];
  for (const h of TEMPLATE_HEADING_BLACKLIST) {
    if (text.toLowerCase().includes(h.toLowerCase())) found.push(h);
  }
  if (/services\. Done plainly\./i.test(text) || /\d{2} services\. Done plainly\./i.test(text)) {
    found.push("NN services. Done plainly.");
  }
  return found;
}

function findTemplatePhrases(text: string): string[] {
  return TEMPLATE_COPY_PHRASES.filter((p) => text.includes(p));
}

function listComparisonSlugs(exclude: string): string[] {
  const slugs: string[] = [];
  const briefsDir = path.join(ROOT, "briefs");
  if (!fs.existsSync(briefsDir)) return slugs;
  for (const e of fs.readdirSync(briefsDir, { withFileTypes: true })) {
    if (e.isDirectory() && e.name !== exclude && !e.name.startsWith("test-")) {
      if (fs.existsSync(path.join(briefsDir, e.name, "brief.json"))) slugs.push(e.name);
    }
  }
  return slugs.slice(-8);
}

function maxFingerprintSimilarity(slug: string, others: string[]): number {
  const fp = loadDesignFingerprint(ROOT, slug);
  if (!fp) return 0;
  let max = 0;
  for (const other of others) {
    const ofp = loadDesignFingerprint(ROOT, other);
    if (!ofp) continue;
    let sim = 0;
    if (fp.paletteAccent && fp.paletteAccent === ofp.paletteAccent) sim += 0.34;
    if (fp.fontPairKey && fp.fontPairKey === ofp.fontPairKey) sim += 0.33;
    if (fp.layoutFamily && fp.layoutFamily === ofp.layoutFamily) sim += 0.33;
    max = Math.max(max, sim);
  }
  return max;
}

function inferDeployedSectionOrder(html: string): string[] {
  const sectionIdMatches = [...html.matchAll(/data-section-id="([^"]+)"/g)].map((m) => m[1]!);
  if (sectionIdMatches.length >= 3) {
    return sectionIdMatches;
  }

  if (!html) return DEFAULT_TEMPLATE_SECTIONS;
  const order: string[] = [];
  const markers: [RegExp, string][] = [
    [/data-review="hero"/, "hero"],
    [/data-review="stats"/, "stats"],
    [/data-review="owner-note"/, "owner-note"],
    [/data-review="gallery"/, "gallery"],
    [/data-review="services"/, "services"],
    [/data-review="about"/, "about"],
    [/data-review="reviews"/, "reviews"],
    [/data-review="service-area"/, "service-area"],
    [/data-review="faq"/, "faq"],
    [/data-review="contact"/, "contact"],
  ];
  const indices: { idx: number; id: string }[] = [];
  for (const [re, id] of markers) {
    const m = html.search(re);
    if (m >= 0) indices.push({ idx: m, id });
  }
  indices.sort((a, b) => a.idx - b.idx);
  for (const i of indices) order.push(i.id);
  return order.length ? order : DEFAULT_TEMPLATE_SECTIONS;
}

export function runCloneReview(slug: string): CloneReviewResult {
  const issues: { severity: "error" | "warn"; message: string }[] = [];
  const missing_artifacts: string[] = [];
  const artifactFiles = [
    "source-evidence.json",
    "site-strategy.json",
    "section-plan.json",
    "pitch-insight.json",
  ];
  for (const f of artifactFiles) {
    if (!fs.existsSync(path.join(briefDir(slug), f))) missing_artifacts.push(f);
  }

  const html = readSiteHtml(slug);
  const text = html;
  const template_headings_found = findTemplateHeadings(text);
  const template_phrases = findTemplatePhrases(text);

  if (template_headings_found.length) {
    issues.push({
      severity: "error",
      message: `Template headings on deployed page: ${template_headings_found.join(", ")}`,
    });
  }
  if (template_phrases.length >= 3) {
    issues.push({
      severity: "warn",
      message: `Multiple template CTA/copy phrases (${template_phrases.length})`,
    });
  }

  const deployedOrder = inferDeployedSectionOrder(html);
  const defaultSim = jaccard(deployedOrder, DEFAULT_TEMPLATE_SECTIONS);
  if (defaultSim >= 0.85) {
    issues.push({
      severity: "error",
      message: `Deployed section order matches default template (${Math.round(defaultSim * 100)}%)`,
    });
  }

  const plan = loadSectionPlan(slug);
  let section_plan_generic: boolean | null = null;
  if (!plan) {
    issues.push({ severity: "error", message: "Missing section-plan.json" });
  } else {
    section_plan_generic = plan.generic_plan;
    if (plan.generic_plan) {
      issues.push({ severity: "error", message: "section-plan.json marked generic_plan" });
    }
    if (plan.clone_warnings.length) {
      for (const w of plan.clone_warnings) {
        issues.push({ severity: "warn", message: w });
      }
    }
  }

  const compared = listComparisonSlugs(slug);
  let sectionOrderSim = defaultSim;
  if (plan) {
    const planOrder = plan.sections.map((s) => s.id);
    for (const other of compared) {
      const otherPlan = loadSectionPlan(other);
      if (otherPlan) {
        sectionOrderSim = Math.max(sectionOrderSim, jaccard(planOrder, otherPlan.sections.map((s) => s.id)));
      }
    }
  }

  const paletteSim = maxFingerprintSimilarity(slug, compared);

  const scores: CloneReviewScore = {
    section_order_similarity: Math.round(defaultSim * 100),
    heading_reuse: Math.min(100, template_headings_found.length * 25),
    hero_pattern_reuse: html.includes("Plumbing sorted properly.") ? 100 : html.includes("Local plumber. Clear quotes.") ? 80 : 20,
    cta_strip_reuse: Math.min(100, template_phrases.length * 20),
    service_list_shape_reuse: /\d{2} services\. Done plainly\./i.test(text) ? 100 : 30,
    review_block_reuse: text.includes("data-review=\"reviews\"") ? 70 : 20,
    contact_section_reuse: text.includes("Pick up the phone, or write.") ? 100 : 40,
    copy_phrase_reuse: Math.min(100, template_phrases.length * 15),
    palette_font_layout_similarity: Math.round(paletteSim * 100),
    overall_clone_score: 0,
    business_specificity_estimate: 0,
  };

  const cloneComponents = [
    scores.section_order_similarity * 0.2,
    scores.heading_reuse * 0.2,
    scores.hero_pattern_reuse * 0.1,
    scores.cta_strip_reuse * 0.1,
    scores.service_list_shape_reuse * 0.1,
    scores.contact_section_reuse * 0.1,
    scores.palette_font_layout_similarity * 0.1,
    scores.copy_phrase_reuse * 0.1,
  ];
  scores.overall_clone_score = Math.round(
    cloneComponents.reduce((a, b) => a + b, 0)
  );
  scores.business_specificity_estimate = Math.max(0, 100 - scores.overall_clone_score);

  if (missing_artifacts.length) {
    issues.push({
      severity: "error",
      message: `Missing skill artifacts: ${missing_artifacts.join(", ")}`,
    });
  }

  const passed =
    issues.filter((i) => i.severity === "error").length === 0 &&
    scores.overall_clone_score < 35;

  return {
    slug,
    reviewed_at: new Date().toISOString(),
    read_only: true,
    passed,
    clone_score: scores.overall_clone_score,
    business_specificity_estimate: scores.business_specificity_estimate,
    scores,
    issues,
    missing_artifacts,
    template_headings_found,
    section_plan_generic,
    compared_slugs: compared,
  };
}

export function saveCloneReview(slug: string, result: CloneReviewResult): void {
  const dir = briefDir(slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "clone-review.json"), JSON.stringify(result, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "clone-review.md"), renderCloneReviewMd(result));
  syncBatchStatusFromArtifacts(slug);
}

function renderCloneReviewMd(r: CloneReviewResult): string {
  return `# Clone review - ${r.slug}

- Reviewed: ${r.reviewed_at}
- Read-only: yes
- Passed: ${r.passed ? "yes" : "no"}
- Clone score: ${r.clone_score}/100 (lower is better)
- Business specificity estimate: ${r.business_specificity_estimate}/100

## Scores
- Section order similarity: ${r.scores.section_order_similarity}%
- Heading reuse: ${r.scores.heading_reuse}%
- Hero pattern reuse: ${r.scores.hero_pattern_reuse}%
- CTA strip reuse: ${r.scores.cta_strip_reuse}%
- Service list shape: ${r.scores.service_list_shape_reuse}%
- Contact section reuse: ${r.scores.contact_section_reuse}%
- Palette/font/layout similarity: ${r.scores.palette_font_layout_similarity}%

## Issues
${r.issues.map((i) => `- [${i.severity}] ${i.message}`).join("\n") || "- None"}

## Template headings found
${r.template_headings_found.map((h) => `- ${h}`).join("\n") || "- None"}

## Missing artifacts
${r.missing_artifacts.map((a) => `- ${a}`).join("\n") || "- None"}

## Compared slugs
${r.compared_slugs.map((s) => `- ${s}`).join("\n") || "- None"}
`;
}

function parseArgs(): { slug?: string } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  return { slug };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { slug } = parseArgs();
  if (!slug) {
    console.error("Usage: npm run review:clone -- --slug <slug>");
    process.exit(1);
  }
  const result = runCloneReview(slug);
  saveCloneReview(slug, result);
  console.log(`Clone review: ${result.passed ? "PASS" : "FAIL"} (score ${result.clone_score})`);
  console.log(`Business specificity estimate: ${result.business_specificity_estimate}/100`);
  for (const issue of result.issues) {
    console.log(`  [${issue.severity}] ${issue.message}`);
  }
  process.exit(result.passed ? 0 : 1);
}
