#!/usr/bin/env tsx
/**
 * Assemble Open Design brief files from existing WebForTrades evidence.
 * Does NOT start Open Design generation or deploy.
 */
import fs from "node:fs";
import path from "node:path";
import { briefDir, ROOT } from "./site_config.js";
import { loadAssetReadinessForSlug } from "./asset_readiness.js";

const EM_DASH = "\u2014";

function parseArgs(): { slug: string; force: boolean } {
  const args = process.argv.slice(2);
  let slug = "";
  let force = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--force") force = true;
  }
  if (!slug) {
    console.error("Usage: npm run od:prepare -- --slug <slug> [--force]");
    process.exit(1);
  }
  return { slug, force };
}

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

function listImages(dir: string, prefix = ""): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
    if (ent.isDirectory()) out.push(...listImages(path.join(dir, ent.name), rel));
    else if (/\.(webp|jpg|jpeg|png)$/i.test(ent.name)) out.push(rel);
  }
  return out.sort();
}

function gateCheck(slug: string): { ok: boolean; blockers: string[]; warnings: string[] } {
  const dir = briefDir(slug);
  const blockers: string[] = [];
  const warnings: string[] = [];

  const validity = readJson<{ website_status?: string; ready_for_build?: boolean }>(
    path.join(dir, "lead-validity.json")
  );
  const quality = readJson<{ status?: string }>(path.join(dir, "source-quality.json"));
  const evidence = readJson<{
    enrichment_complete?: boolean;
    manual_asset_status?: string;
    asset_readiness?: { pause_before_open_design?: boolean; pause_message?: string | null };
    image_slots?: unknown[];
  }>(path.join(dir, "source-evidence.json"));

  if (validity?.website_status === "HAS_REAL_SITE") {
    blockers.push("HAS_REAL_SITE - do not run Open Design by default");
  }
  if (quality?.status === "FAIL") {
    blockers.push("source-quality.json status FAIL");
  }
  if (evidence?.enrichment_complete !== true) {
    blockers.push("enrichment_complete !== true");
  }

  const readiness = loadAssetReadinessForSlug(slug);
  if (readiness?.pause_before_open_design) {
    blockers.push("MANUAL_ASSET_REVIEW_REQUIRED - add manual images before Open Design");
  }
  if (evidence?.manual_asset_status === "MANUAL_ASSET_REVIEW_REQUIRED" && readiness?.usable_manual_count === 0) {
    blockers.push("Manual assets missing for photo-led design");
  }
  if (validity?.ready_for_build === false) {
    warnings.push("ready_for_build is false (design-only waiver may still apply)");
  }

  for (const file of ["source-evidence.json", "site-strategy.json", "section-plan.json"]) {
    if (!fs.existsSync(path.join(dir, file))) {
      blockers.push(`Missing ${file}`);
    }
  }

  return { ok: blockers.length === 0, blockers, warnings };
}

function buildBriefJson(slug: string): Record<string, unknown> {
  const dir = briefDir(slug);
  const brief = readJson<Record<string, unknown>>(path.join(dir, "brief.json")) ?? {};
  const strategy = readJson<Record<string, unknown>>(path.join(dir, "site-strategy.json")) ?? {};
  const sections = readJson<Record<string, unknown>>(path.join(dir, "section-plan.json")) ?? {};
  const evidence = readJson<Record<string, unknown>>(path.join(dir, "source-evidence.json")) ?? {};
  const pitch = readJson<Record<string, unknown>>(path.join(dir, "pitch-insight.json")) ?? {};
  const creative = readJson<Record<string, unknown>>(path.join(dir, "creative-brief.json")) ?? {};
  const images = listImages(path.join(dir, "images"));
  const readiness = loadAssetReadinessForSlug(slug);

  return {
    slug,
    generated_at: new Date().toISOString(),
    purpose:
      "One-page bespoke website concept for Open Design. Review before port or deploy. Does not start generation automatically.",
    business: {
      name: brief.business_name ?? null,
      trade: brief.trade ?? strategy.trade ?? null,
      based_location: brief.address ?? strategy.based_location ?? null,
      service_area: brief.service_area ?? strategy.service_area ?? [],
      phone: brief.phone ?? null,
      email: brief.email ?? null,
      facebook_url: brief.facebook_url ?? null,
      google_maps_url: brief.google_maps_url ?? null,
      opening_hours: brief.opening_hours ?? brief.hours ?? null,
      contact_name: brief.contact_name ?? null,
      contact_name_basis: brief.contact_name_source ?? null,
    },
    proof: {
      google_rating: brief.google_rating ?? null,
      google_review_count: brief.google_review_count ?? null,
      google_review_count_sourced: brief.google_review_count_sourced ?? false,
    },
    services: brief.services ?? strategy.services ?? [],
    story: {
      angle: strategy.angle ?? strategy.story_angle ?? null,
      personality: strategy.personality ?? strategy.tone ?? null,
      praise_themes: strategy.praise_themes ?? [],
    },
    reviews: (brief.reviews as unknown[]) ?? [],
    section_plan: sections.sections ?? sections.section_order ?? sections,
    pitch_framing: pitch.framing ?? pitch.summary ?? null,
    design_direction: {
      direction_id: creative.chosen_layout_direction ?? creative.direction ?? null,
      fonts: creative.chosen_fonts ?? null,
      palette: creative.chosen_colour_palette ?? creative.palette ?? null,
      rationale: creative.reason_for_design_choices ?? null,
    },
    images: {
      rules:
        "Use only real verified images from briefs/<slug>/images. No stock, no placeholders, no AI fill. Safe captions only. Never render visible placeholder boxes on the public site.",
      available_files: images,
      image_source_dir: `briefs/${slug}/images`,
      manual_folder: `briefs/${slug}/images/manual/`,
      layout_recommendation: readiness?.layout_recommendation ?? "proof_led",
      image_slots: sections.image_slots ?? evidence.image_slots ?? readiness?.image_slots ?? [],
      manual_asset_status: evidence.manual_asset_status ?? readiness?.manual_asset_status ?? "OK",
      if_manual_missing:
        "Use proof-led layout. Do not invent images. Do not create visible placeholders.",
      if_manual_present:
        "Use validated manual assets from briefs/<slug>/images/manual/ after npm run assets:manual.",
    },
    open_design: {
      project_name: `webfortrades-${slug}-pilot`,
      skill: "design-taste-frontend",
      agent: "cursor-agent",
    },
    rules: [
      "Start from evidence, not the WebForTrades template skeleton",
      "No placeholders, no invented facts, no em dashes",
      "Open Design must not invent images or render visible placeholder boxes",
      "If image slots are manual_needed, stop before Open Design or switch to proof-led layout",
      "Facebook thumbnails under 600px are evidence only, not gallery or hero",
      "Validate manual assets with npm run assets:manual before photo-led design",
      "No demo/preview/test/speculative wording in public metadata",
      "Footer credit only: Website by WebForTrades linking to https://webfortradesuk.co.uk",
      "Banned headings: Plumbing sorted properly, Questions before you ring, One van. One trade, A note from X",
    ],
  };
}

function buildBriefMd(slug: string, data: Record<string, unknown>): string {
  const biz = (data.business ?? {}) as Record<string, unknown>;
  const images = (data.images as { available_files?: string[] })?.available_files ?? [];
  const od = (data.open_design ?? {}) as Record<string, string>;
  const lines = [
    `# Open Design brief: ${biz.name ?? slug}`,
    "",
    "Auto-generated from WebForTrades evidence. Edit before commissioning Open Design.",
    "British English. No em dashes. Invent nothing.",
    "",
    "## Business",
    "",
    `- Name: ${biz.name ?? "unknown"}`,
    `- Trade: ${biz.trade ?? "unknown"}`,
    `- Phone: ${biz.phone ?? "unknown"}`,
    `- Email: ${biz.email ?? "none"}`,
    `- Service area: ${Array.isArray(biz.service_area) ? biz.service_area.join(", ") : "see brief.json"}`,
    "",
    "## Open Design settings",
    "",
    `- Project name: ${od.project_name ?? `webfortrades-${slug}-pilot`}`,
    `- Skill: ${od.skill ?? "design-taste-frontend"}`,
    `- Agent: ${od.agent ?? "cursor-agent"}`,
    "",
    "## Images available",
    "",
    ...images.map((f) => `- \`images/${f}\``),
    "",
    "## Section plan",
    "",
    "```json",
    JSON.stringify(data.section_plan, null, 2),
    "```",
    "",
    "## Rules",
    "",
    ...((data.rules as string[]) ?? []).map((r) => `- ${r}`),
    "",
    "Full JSON: `open-design-artifacts/" + slug + "/open-design-brief.json`",
    "",
  ];
  return lines.join("\n").replace(new RegExp(EM_DASH, "g"), "-");
}

function main(): void {
  const { slug, force } = parseArgs();
  const bdir = briefDir(slug);

  if (!fs.existsSync(bdir)) {
    console.error(`Brief directory not found: ${bdir}`);
    process.exit(1);
  }

  const outDir = path.join(ROOT, "open-design-artifacts", slug);
  const jsonPath = path.join(outDir, "open-design-brief.json");
  const mdPath = path.join(outDir, "open-design-brief.md");

  if (!force && fs.existsSync(jsonPath)) {
    console.log(`Already exists: ${jsonPath}`);
    console.log("Use --force to overwrite.");
    process.exit(0);
  }

  const gates = gateCheck(slug);
  if (!gates.ok && !force) {
    console.error("Evidence gates failed. Open Design should not run yet:");
    for (const b of gates.blockers) console.error(`  [BLOCK] ${b}`);
    for (const w of gates.warnings) console.warn(`  [WARN] ${w}`);
    const readiness = loadAssetReadinessForSlug(slug);
    if (readiness?.pause_message) {
      console.error(`\n${readiness.pause_message}`);
    }
    console.error("\nFix evidence or pass --force for design-only draft brief.");
    process.exit(1);
  }

  for (const w of gates.warnings) console.warn(`[WARN] ${w}`);

  const data = buildBriefJson(slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");
  fs.writeFileSync(mdPath, buildBriefMd(slug, data));

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
  console.log("");
  console.log("Next steps (manual):");
  console.log("  1. Edit the brief if needed");
  console.log("  2. npm run od:status");
  console.log("  3. Follow docs/open-design-to-vercel-recipe.md section C");
  console.log("  4. npm run od:check -- --slug " + slug + "  (after artifact saved)");
}

main();
