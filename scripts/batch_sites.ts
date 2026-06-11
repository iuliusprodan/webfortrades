import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getCandidateLeadsForBatch,
  getLeadBySlug,
  type Lead,
} from "./db.js";
import { runPool, runCommand, withFileLock } from "./concurrency.js";
import { isScrollVideoEnabled, hasOpenDesignPort } from "./site_config.js";
import { loadBatchConfig, clampPortConcurrency, clampPortTimeoutMinutes } from "./batch_config.js";
import { runPortPool } from "./batch_port_pool.js";
import { evaluatePitchReadiness } from "./pitch_gate.js";
import { loadDeployManifest } from "./vercel_alias.js";
import {
  loadDesignFingerprint,
  compareFingerprints,
  creativeUniquenessScore,
} from "./design_review.js";
import {
  loadRecentDesignUsage,
  paletteKeyFromColors,
  PALETTE_PRESETS,
  FONT_PAIRS,
  HERO_HEADLINES,
  type CreativeConstraint,
  type FontPairKey,
  type LayoutFamily,
} from "./design_direction.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEPLOY_LOCK_DIR = path.join(ROOT, ".locks", "vercel-deploy");

// Pre-assigned, deliberately distinct creative directions. The orchestrator
// hands one to each lead so parallel builds never collapse into clones (workers
// cannot see each other's anti-reuse history while building concurrently).
const DIRECTION_POOL: (CreativeConstraint & { label: string })[] = [
  { label: "trust blue technical", paletteKey: "trust-blue", fontPairKey: "archivo-ibm-plex", layoutFamily: "split-hero-editorial", heroHeadlineKey: "heating-you-can-trust" },
  { label: "navy brass heating", paletteKey: "navy-brass-heating", fontPairKey: "space-grotesk-inter", layoutFamily: "full-bleed-hero", heroHeadlineKey: "warm-homes-reliable-heating" },
  { label: "forest green practical", paletteKey: "forest-green", fontPairKey: "work-sans-merriweather", layoutFamily: "stacked-hero-proof", heroHeadlineKey: "precise-plumbing-local" },
  { label: "slate blue clean", paletteKey: "slate-plumbing", fontPairKey: "manrope-source-serif", layoutFamily: "compact-local", heroHeadlineKey: "local-plumber-clear-quotes" },
  { label: "charcoal orange industrial", paletteKey: "charcoal-orange", fontPairKey: "space-mono-ibm-plex", layoutFamily: "split-hero-editorial", heroHeadlineKey: "emergency-to-refit" },
  { label: "warm cream premium bathroom", paletteKey: "warm-cream-bathroom", fontPairKey: "inter-fraunces", layoutFamily: "full-bleed-hero", heroHeadlineKey: "bathroom-pipework-properly" },
  { label: "white green local friendly", paletteKey: "white-green-friendly", fontPairKey: "dm-sans-lora", layoutFamily: "stacked-hero-proof", heroHeadlineKey: "pipes-heating-done-right" },
  { label: "dark steel operations", paletteKey: "steel-blue-ops", fontPairKey: "syne-dm-sans", layoutFamily: "compact-local", heroHeadlineKey: "plumbing-sorted" },
];

const LAYOUT_FAMILIES: LayoutFamily[] = [
  "split-hero-editorial",
  "full-bleed-hero",
  "stacked-hero-proof",
  "compact-local",
];

interface UsedKeys {
  palettes: Set<string>;
  fonts: Set<string>;
  heroes: Set<string>;
  layouts: Set<string>;
}

/**
 * Collect creative keys already in use by EXISTING sites (and the library) so
 * the batch differs from them, not only from itself. Per-site review compares
 * each new build against all existing sites, so reusing an existing palette,
 * font pair, or hero headline would (correctly) fail review.
 */
function collectUsedKeys(): UsedKeys {
  const used: UsedKeys = {
    palettes: new Set(),
    fonts: new Set(),
    heroes: new Set(),
    layouts: new Set(),
  };
  const sitesDir = path.join(ROOT, "sites");
  if (fs.existsSync(sitesDir)) {
    for (const slug of fs.readdirSync(sitesDir)) {
      const dsPath = path.join(sitesDir, slug, "data", "design-system.json");
      if (!fs.existsSync(dsPath)) continue;
      try {
        const ds = JSON.parse(fs.readFileSync(dsPath, "utf8")) as {
          colors?: { accent?: string };
          fontPairKey?: string;
          heroHeadlineKey?: string;
          layoutFamily?: string;
        };
        if (ds.colors?.accent) {
          const pk = paletteKeyFromColors(ds.colors as { accent: string } & Record<string, string>);
          if (pk) used.palettes.add(pk);
        }
        if (ds.fontPairKey) used.fonts.add(ds.fontPairKey);
        if (ds.heroHeadlineKey) used.heroes.add(ds.heroHeadlineKey);
        if (ds.layoutFamily) used.layouts.add(ds.layoutFamily);
      } catch {
        /* skip unreadable design-system */
      }
    }
  }
  for (const r of loadRecentDesignUsage(ROOT)) {
    if (r.paletteKey) used.palettes.add(r.paletteKey);
    if (r.fontPairKey) used.fonts.add(r.fontPairKey);
    if (r.heroHeadlineKey) used.heroes.add(r.heroHeadlineKey);
    if (r.layoutFamily) used.layouts.add(r.layoutFamily);
  }
  return used;
}

/**
 * Assign one distinct creative direction per lead. Prefers curated pool entries
 * whose palette/font/hero are unused (by existing sites and earlier picks), then
 * composes a fresh direction from leftover palette/font/hero keys if the pool is
 * exhausted. Guarantees no palette, font pair, or hero-headline collision.
 */
function assignDirections(count: number): (CreativeConstraint & { label: string })[] {
  const used = collectUsedKeys();
  const result: (CreativeConstraint & { label: string })[] = [];

  const takePalette = () =>
    PALETTE_PRESETS.find((p) => !used.palettes.has(p.key))?.key;
  const takeFont = () =>
    FONT_PAIRS.find((f) => !used.fonts.has(f.key))?.key;
  const takeHero = () =>
    HERO_HEADLINES.find((h) => !used.heroes.has(h.key))?.key;
  const takeLayout = () =>
    LAYOUT_FAMILIES.find((l) => !used.layouts.has(l)) ??
    LAYOUT_FAMILIES[result.length % LAYOUT_FAMILIES.length]!;

  for (let i = 0; i < count; i++) {
    let pick: (CreativeConstraint & { label: string }) | null = null;

    const poolEntry = DIRECTION_POOL.find(
      (d) =>
        !used.palettes.has(d.paletteKey!) &&
        !used.fonts.has(d.fontPairKey!) &&
        !used.heroes.has(d.heroHeadlineKey!)
    );
    if (poolEntry) {
      pick = poolEntry;
    } else {
      const paletteKey = takePalette();
      const fontPairKey = takeFont();
      const heroHeadlineKey = takeHero();
      if (paletteKey && fontPairKey && heroHeadlineKey) {
        pick = {
          label: `${paletteKey} composed`,
          paletteKey,
          fontPairKey: fontPairKey as FontPairKey,
          layoutFamily: takeLayout(),
          heroHeadlineKey,
        };
      }
    }

    if (!pick) {
      // Ran out of distinct directions; let the build self-select and flag it.
      result.push({ label: `auto (no distinct direction left, slot ${i})` });
      continue;
    }

    used.palettes.add(pick.paletteKey!);
    used.fonts.add(pick.fontPairKey!);
    used.heroes.add(pick.heroHeadlineKey!);
    if (pick.layoutFamily) used.layouts.add(pick.layoutFamily);
    result.push(pick);
  }

  return result;
}

type JobStatus =
  | "PENDING"
  | "GATHERING"
  | "SKIPPED_CONTACTABILITY"
  | "PORTING"
  | "PORTED"
  | "FAILED_PORT"
  | "BAILED_PORT"
  | "BUILDING"
  | "BUILT"
  | "PREVIEWING"
  | "REVIEWING"
  | "REVIEWED"
  | "DEPLOYING"
  | "DEPLOYED"
  | "FAILED";

interface Job {
  slug: string;
  business_name: string;
  lead_id: number;
  phone: string | null;
  email_status: "found" | "missing";
  whatsapp_status: string | null;
  contactability_status: string | null;
  location: string | null;
  niche: string | null;
  creative_constraint: CreativeConstraint & { label: string };
  paths: {
    brief: string;
    creative_brief: string;
    creative_constraint: string;
    site: string;
    deploy_manifest: string;
    og_image: string;
    screenshots: string;
    video: string;
    port_log: string;
    log: string;
  };
  status: JobStatus;
  stages: Record<string, { ok: boolean; code: number | null; ms: number; attempts?: number }>;
  verified_url: string | null;
  alias_status: string | null;
  ready_to_pitch: boolean;
  ready_blockers: string[];
  errors: string[];
  warnings: string[];
}

interface BatchOptions {
  location: string;
  niche: string;
  count: number;
  concurrency: number;
  deployConcurrency: number;
  deploy: boolean;
  previewVideo: boolean;
  dryRunLeads: boolean;
  allowManualReview: boolean;
  openDesign: boolean;
  portConcurrency: number;
  portTimeoutMinutes: number;
  portRetry: number;
  portTokenBudget: number;
  portTokenPerSlug: number;
  failFastPort: boolean;
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return !/^(false|0|no|off)$/i.test(value.trim());
}

function parseArgs(): BatchOptions {
  const batchCfg = loadBatchConfig();
  const args = process.argv.slice(2);
  let location = "";
  let niche = "";
  let count = 8;
  let concurrency = 3;
  let deployConcurrency = batchCfg.deploy_concurrency_default;
  let deploy = true;
  let previewVideo = true;
  let dryRunLeads = false;
  let allowManualReview = false;
  let openDesign = batchCfg.open_design_default;
  let portConcurrency = batchCfg.port_concurrency_default;
  let portTimeoutMinutes = batchCfg.port_timeout_minutes_default;
  let portRetry = batchCfg.port_retry_max;
  let portTokenBudget = batchCfg.port_token_budget_default;
  let portTokenPerSlug = batchCfg.port_token_per_slug_default;
  let failFastPort = false;
  let sawNoOutreach = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--location" && args[i + 1]) location = args[++i];
    else if (a === "--niche" && args[i + 1]) niche = args[++i];
    else if (a === "--count" && args[i + 1]) count = Math.max(1, parseInt(args[++i], 10) || 8);
    else if (a === "--concurrency" && args[i + 1]) concurrency = Math.max(1, parseInt(args[++i], 10) || 3);
    else if (a === "--deploy-concurrency" && args[i + 1])
      deployConcurrency = Math.max(1, parseInt(args[++i], 10) || batchCfg.deploy_concurrency_default);
    else if (a === "--deploy") deploy = parseBool(args[++i], true);
    else if (a === "--preview-video") previewVideo = parseBool(args[++i], true);
    else if (a === "--dry-run-leads") dryRunLeads = true;
    else if (a === "--allow-manual-review") allowManualReview = true;
    else if (a === "--open-design") openDesign = parseBool(args[++i], true);
    else if (a === "--port-concurrency" && args[i + 1])
      portConcurrency = clampPortConcurrency(parseInt(args[++i], 10) || batchCfg.port_concurrency_default);
    else if (a === "--port-timeout-minutes" && args[i + 1])
      portTimeoutMinutes = clampPortTimeoutMinutes(parseInt(args[++i], 10) || batchCfg.port_timeout_minutes_default);
    else if (a === "--port-retry" && args[i + 1]) portRetry = Math.max(0, Math.min(1, parseInt(args[++i], 10) || 1));
    else if (a === "--port-token-budget" && args[i + 1]) portTokenBudget = parseInt(args[++i], 10) || 0;
    else if (a === "--port-token-per-slug" && args[i + 1]) portTokenPerSlug = parseInt(args[++i], 10) || 0;
    else if (a === "--fail-fast-port") failFastPort = true;
    else if (a === "--no-outreach") sawNoOutreach = true;
    else if (a === "--send" || a === "--outreach") {
      console.error("batch:sites never sends outreach. Remove --send/--outreach.");
      process.exit(1);
    }
  }

  void sawNoOutreach;
  return {
    location,
    niche,
    count,
    concurrency,
    deployConcurrency,
    deploy,
    previewVideo,
    dryRunLeads,
    allowManualReview,
    openDesign,
    portConcurrency,
    portTimeoutMinutes,
    portRetry,
    portTokenBudget,
    portTokenPerSlug,
    failFastPort,
  };
}

function npm(args: string[], slot: number, logFile: string): Promise<{ ok: boolean; code: number | null; stdout: string; stderr: string }> {
  // Unique ports per concurrent slot so parallel review (next dev) and preview
  // (static serve) servers never collide.
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    WFT_REVIEW_PORT: String(4400 + slot),
    WFT_PREVIEW_PORT: String(4500 + slot),
  };
  return runCommand("npm", args, { cwd: ROOT, env, logFile });
}

async function timed<T>(
  job: Job,
  stage: string,
  fn: () => Promise<{ ok: boolean; code: number | null }>
): Promise<boolean> {
  const start = Date.now();
  const res = await fn();
  job.stages[stage] = { ok: res.ok, code: res.code, ms: Date.now() - start };
  return res.ok;
}

async function runSiteWorker(job: Job, slot: number, opts: BatchOptions): Promise<void> {
  const log = job.paths.log;

  if (job.status === "FAILED_PORT" || job.status === "BAILED_PORT") {
    return;
  }

  fs.writeFileSync(log, `# ${job.slug} batch worker log\n`);

  // 1. Gather (skip if already gathered with a brief, to avoid redundant API calls).
  const lead0 = getLeadBySlug(job.slug);
  const briefExists = fs.existsSync(job.paths.brief);
  const alreadyGathered =
    lead0?.state === "GATHERED" &&
    lead0.contactability_status === "CONTACTABLE" &&
    briefExists;

  if (!alreadyGathered) {
    job.status = "GATHERING";
    saveJob(job);
    const ok = await timed(job, "gather", () =>
      npm(["run", "gather", "--", "--slug", job.slug], slot, log)
    );
    if (!ok) {
      job.status = "FAILED";
      job.errors.push("gather failed");
      saveJob(job);
      return;
    }
  } else {
    job.stages.gather = { ok: true, code: 0, ms: 0 };
  }

  // 1b. Lead intelligence enrichment gate (source evidence + validity required before build).
  const evidencePath = path.join(ROOT, "briefs", job.slug, "source-evidence.json");
  const validityPath = path.join(ROOT, "briefs", job.slug, "lead-validity.json");
  const sourceQualityPath = path.join(ROOT, "briefs", job.slug, "source-quality.json");
  let enrichmentOk = false;
  if (fs.existsSync(evidencePath) && fs.existsSync(validityPath)) {
    try {
      const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8")) as {
        enrichment_complete?: boolean;
        ready_for_build?: boolean | null;
      };
      const validity = JSON.parse(fs.readFileSync(validityPath, "utf8")) as {
        ready_for_build?: boolean;
        lead_validity_status?: string;
        has_real_website?: boolean;
        manual_review_required?: boolean;
      };
      let sourceQualityOk = true;
      if (fs.existsSync(sourceQualityPath)) {
        const sq = JSON.parse(fs.readFileSync(sourceQualityPath, "utf8")) as {
          source_quality_status?: string;
        };
        sourceQualityOk =
          sq.source_quality_status === "PASS" || sq.source_quality_status === "PASS_WITH_WARNINGS";
        if (!sourceQualityOk) {
          job.warnings.push(`Source quality gate: ${sq.source_quality_status ?? "unknown"}`);
        }
      } else {
        sourceQualityOk = false;
        job.warnings.push("Missing source-quality.json - run enrich:lead");
      }
      enrichmentOk = Boolean(
        evidence.enrichment_complete &&
          validity.ready_for_build &&
          !validity.has_real_website &&
          !validity.manual_review_required &&
          sourceQualityOk
      );
      if (validity.lead_validity_status === "HAS_REAL_SITE_SKIP") {
        job.status = "SKIPPED_HAS_REAL_SITE";
        job.warnings.push("Lead has a real website - build skipped by lead validity gate");
        saveJob(job);
        return;
      }
    } catch {
      enrichmentOk = false;
    }
  }
  if (!enrichmentOk) {
    job.status = "NEEDS_ENRICHMENT";
    job.warnings.push(
      "Source enrichment incomplete or lead not ready_for_build - run npm run enrich:lead before batch build"
    );
    if (!opts.allowManualReview) {
      saveJob(job);
      return;
    }
    job.warnings.push("Continuing under --allow-manual-review despite enrichment gate");
  }

  // 2. Contactability gate (central rule: only CONTACTABLE leads build).
  const lead = getLeadBySlug(job.slug);
  job.contactability_status = lead?.contactability_status ?? null;
  job.phone = lead?.phone ?? job.phone;
  job.email_status = lead?.email ? "found" : "missing";
  job.whatsapp_status = lead?.whatsapp_status ?? null;

  const contactable = lead?.contactability_status === "CONTACTABLE";
  if (!contactable && !opts.allowManualReview) {
    job.status = "SKIPPED_CONTACTABILITY";
    job.warnings.push(
      `contactability=${lead?.contactability_status ?? "unknown"} (${lead?.contactability_reason ?? "no reason"}); build skipped`
    );
    saveJob(job);
    return;
  }
  if (!contactable) {
    job.warnings.push(
      `contactability=${lead?.contactability_status ?? "unknown"}; building under --allow-manual-review (not pitchable)`
    );
  }

  const buildArgs = ["run", "build:site", "--", "--slug", job.slug];
  const previewArgs = ["run", "preview:site", "--", "--slug", job.slug];
  if (opts.previewVideo) previewArgs.push("--video", "--ratio", "16:9");
  const reviewArgs = ["run", "review", "--", "--slug", job.slug];
  if (opts.allowManualReview) {
    buildArgs.push("--allow-manual-review");
  }

  // 3. Build (template path) or post-port next build (Open Design path).
  job.status = "BUILDING";
  saveJob(job);

  if (opts.openDesign) {
    const siteDir = path.join(ROOT, "sites", job.slug);
    if (!hasOpenDesignPort(siteDir)) {
      job.status = "FAILED";
      job.errors.push("Open Design enabled but port missing for this slug");
      saveJob(job);
      return;
    }
    const outIndex = path.join(siteDir, "out", "index.html");
    if (!fs.existsSync(outIndex)) {
      if (
        !(await timed(job, "build", () =>
          runCommand("npm", ["run", "build"], { cwd: siteDir, logFile: log })
        ))
      ) {
        job.status = "FAILED";
        job.errors.push("next build failed after port");
        saveJob(job);
        return;
      }
    } else {
      job.stages.build = { ok: true, code: 0, ms: 0 };
    }
  } else if (!(await timed(job, "build", () => npm(buildArgs, slot, log)))) {
    job.status = "FAILED";
    job.errors.push("build failed");
    saveJob(job);
    return;
  }

  // 3b. Clone review (documented gate; blocks template ports before preview/deploy).
  job.status = "CLONE_REVIEW";
  saveJob(job);
  const cloneArgs = ["run", "review:clone", "--", "--slug", job.slug];
  if (!(await timed(job, "clone_review", () => npm(cloneArgs, slot, log)))) {
    job.status = "FAILED";
    job.errors.push("clone review failed");
    saveJob(job);
    return;
  }

  // 4. Preview screenshots + video.
  job.status = "PREVIEWING";
  saveJob(job);
  if (!(await timed(job, "preview", () => npm(previewArgs, slot, log)))) {
    job.status = "FAILED";
    job.errors.push("preview failed");
    saveJob(job);
    return;
  }

  // 5. Per-site review.
  job.status = "REVIEWING";
  saveJob(job);
  if (!(await timed(job, "review", () => npm(reviewArgs, slot, log)))) {
    job.status = "FAILED";
    job.errors.push("review failed");
    saveJob(job);
    return;
  }

  job.status = "REVIEWED";
  saveJob(job);
}

async function runDeployWorker(job: Job, slot: number, opts: BatchOptions): Promise<void> {
  if (job.status !== "REVIEWED") return;
  job.status = "DEPLOYING";
  saveJob(job);

  const deployArgs = ["run", "deploy", "--", "--slug", job.slug];
  if (opts.allowManualReview) deployArgs.push("--allow-manual-review");

  const ok = await timed(job, "deploy", () =>
    withFileLock(DEPLOY_LOCK_DIR, () => npm(deployArgs, slot, job.paths.log))
  );
  const manifest = loadDeployManifest(ROOT, job.slug);
  job.verified_url = manifest?.verified_url ?? null;
  job.alias_status = manifest?.alias_status ?? null;

  if (!ok || !job.verified_url) {
    job.status = "FAILED";
    job.errors.push(
      `deploy did not produce a verified URL (alias_status=${job.alias_status ?? "unknown"})`
    );
    saveJob(job);
    return;
  }

  job.status = "DEPLOYED";
  saveJob(job);
}

let BATCH_DIR = "";

function saveJob(job: Job): void {
  fs.writeFileSync(
    path.join(BATCH_DIR, "jobs", `${job.slug}.json`),
    JSON.stringify(job, null, 2) + "\n"
  );
}

function buildJob(lead: Lead, direction: CreativeConstraint & { label: string }): Job {
  const slug = lead.slug!;
  return {
    slug,
    business_name: lead.business_name,
    lead_id: lead.id,
    phone: lead.phone,
    email_status: lead.email ? "found" : "missing",
    whatsapp_status: lead.whatsapp_status,
    contactability_status: lead.contactability_status,
    location: lead.region,
    niche: lead.niche,
    creative_constraint: direction,
    paths: {
      brief: path.join(ROOT, "briefs", slug, "brief.json"),
      creative_brief: path.join("briefs", slug, "creative-brief.json"),
      creative_constraint: path.join("briefs", slug, "creative-constraint.json"),
      site: path.join("sites", slug),
      deploy_manifest: path.join("briefs", slug, "deploy.json"),
      og_image: path.join("sites", slug, "public", "og-image.png"),
      screenshots: path.join("screenshots", slug),
      video: path.join("briefs", slug, "outreach", "site-scroll.mp4"),
      port_log: path.join(BATCH_DIR, "jobs", `${slug}.port.log`),
      log: path.join(BATCH_DIR, "jobs", `${slug}.log`),
    },
    status: "PENDING",
    stages: {},
    verified_url: null,
    alias_status: null,
    ready_to_pitch: false,
    ready_blockers: [],
    errors: [],
    warnings: [],
  };
}

function writeCreativeConstraint(job: Job): void {
  const dir = path.join(ROOT, "briefs", job.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "creative-constraint.json"),
    JSON.stringify(job.creative_constraint, null, 2) + "\n"
  );
}

function evaluateReadiness(jobs: Job[], opts: BatchOptions): void {
  for (const job of jobs) {
    if (job.status !== "DEPLOYED") {
      job.ready_to_pitch = false;
      job.ready_blockers = [`job status is ${job.status}`];
      continue;
    }
    const lead = getLeadBySlug(job.slug);
    if (!lead) {
      job.ready_to_pitch = false;
      job.ready_blockers = ["lead not found"];
      continue;
    }
    const pitch = evaluatePitchReadiness(ROOT, lead, {
      allowManualReview: opts.allowManualReview,
    });
    // Preview video is part of READY_TO_PITCH for the batch even though the
    // base pitch gate does not require it.
    const videoOk = fs.existsSync(path.join(ROOT, job.paths.video));
    const blockers = [...pitch.blockers];
    if (opts.previewVideo && !videoOk) blockers.push("preview video missing");
    job.ready_to_pitch = blockers.length === 0;
    job.ready_blockers = blockers;
    job.warnings.push(...pitch.warnings);
  }
}

function computeUniqueness(jobs: Job[]): {
  score: number;
  issues: { severity: string; message: string }[];
} {
  const builtSlugs = jobs
    .filter((j) => ["REVIEWED", "DEPLOYED"].includes(j.status))
    .map((j) => j.slug);
  const fingerprints = builtSlugs
    .map((slug) => loadDesignFingerprint(ROOT, slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof loadDesignFingerprint>>[];

  const issues: { severity: string; message: string }[] = [];
  for (let i = 0; i < fingerprints.length; i++) {
    for (let j = i + 1; j < fingerprints.length; j++) {
      issues.push(...compareFingerprints(fingerprints[i]!, fingerprints[j]!));
    }
  }
  const score = fingerprints.length >= 2 ? creativeUniquenessScore(fingerprints) : 100;
  return { score, issues };
}

function writeReports(
  batchId: string,
  opts: BatchOptions,
  jobs: Job[],
  uniqueness: { score: number; issues: { severity: string; message: string }[] },
  batchReviewResult: string,
  portSummary?: {
    wall_clock_ms: number;
    ok: number;
    failed: number;
    bailed: number;
    skipped: number;
    total_tokens: number;
    token_budget_exceeded: boolean;
  }
): { jsonPath: string; mdPath: string } {
  const deployed = jobs.filter((j) => j.status === "DEPLOYED");
  const reportJson = {
    batch_id: batchId,
    created_at: new Date().toISOString(),
    location: opts.location,
    niche: opts.niche,
    requested_count: opts.count,
    site_concurrency: opts.concurrency,
    deploy_concurrency: opts.deployConcurrency,
    open_design: opts.openDesign,
    port_concurrency: opts.openDesign ? opts.portConcurrency : null,
    port_timeout_minutes: opts.openDesign ? opts.portTimeoutMinutes : null,
    deploy_enabled: opts.deploy,
    preview_video: opts.previewVideo,
    allow_manual_review: opts.allowManualReview,
    outreach_sent: false,
    sending_enabled: false,
    test_recipient_only: true,
    batch_review: { result: batchReviewResult, creative_uniqueness_score: uniqueness.score },
    creative_uniqueness_issues: uniqueness.issues,
    port_summary: portSummary ?? null,
    counts: {
      selected: jobs.length,
      deployed: deployed.length,
      skipped_contactability: jobs.filter((j) => j.status === "SKIPPED_CONTACTABILITY").length,
      failed: jobs.filter((j) => j.status === "FAILED" || j.status === "FAILED_PORT").length,
      bailed_port: jobs.filter((j) => j.status === "BAILED_PORT").length,
      ported: jobs.filter((j) => j.status === "PORTED" || j.stages.port?.ok).length,
      ready_to_pitch: jobs.filter((j) => j.ready_to_pitch).length,
    },
    // review:batch reads top-level `slugs` first: verify only deployed sites
    // (skipped/failed jobs have no live URL and would falsely fail batch QA).
    slugs: deployed.map((j) => j.slug),
    // sites[] is the full human/machine record of every selected lead.
    sites: jobs.map((j) => ({
      slug: j.slug,
      business_name: j.business_name,
      status: j.status,
      creative_direction: j.creative_constraint.label,
      palette: j.creative_constraint.paletteKey,
      fonts: j.creative_constraint.fontPairKey,
      layout: j.creative_constraint.layoutFamily,
      hero: j.creative_constraint.heroHeadlineKey,
      contactability_status: j.contactability_status,
      verified_url: j.verified_url,
      alias_status: j.alias_status,
      ready_to_pitch: j.ready_to_pitch,
      ready_blockers: j.ready_blockers,
      warnings: j.warnings,
      errors: j.errors,
      stages: j.stages,
    })),
  };

  const jsonPath = path.join(BATCH_DIR, "batch-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(reportJson, null, 2) + "\n");

  const lines: string[] = [];
  lines.push(`# Batch site run - ${batchId}`);
  lines.push("");
  lines.push(`Location: ${opts.location} | Niche: ${opts.niche} | Requested: ${opts.count}`);
  lines.push(
    `Concurrency: site=${opts.concurrency}, deploy=${opts.deployConcurrency}${opts.openDesign ? `, port=${opts.portConcurrency}` : ""} | Deploy: ${opts.deploy ? "on" : "off"} | Preview video: ${opts.previewVideo ? "on" : "off"} | Open Design: ${opts.openDesign ? "on" : "off"}`
  );
  if (portSummary) {
    lines.push(
      `Port phase: ${Math.round(portSummary.wall_clock_ms / 60000)} min wall | ok=${portSummary.ok} failed=${portSummary.failed} bailed=${portSummary.bailed} skipped=${portSummary.skipped}`
    );
  }
  lines.push("");
  lines.push("**No outreach sent.** sending_enabled=false, test_recipient_only=true.");
  lines.push("");
  lines.push(
    `Batch review: ${batchReviewResult} | Creative uniqueness: ${uniqueness.score}/100`
  );
  lines.push("");
  lines.push(
    `Selected ${jobs.length}, deployed ${deployed.length}, skipped ${reportJson.counts.skipped_contactability}, failed ${reportJson.counts.failed}, ready to pitch ${reportJson.counts.ready_to_pitch}.`
  );
  lines.push("");
  lines.push("| Slug | Status | Direction | Verified URL | Alias | READY_TO_PITCH | Notes |");
  lines.push("|------|--------|-----------|--------------|-------|----------------|-------|");
  for (const j of jobs) {
    const notes = [...j.errors, ...j.ready_blockers].slice(0, 2).join("; ") || "-";
    lines.push(
      `| ${j.slug} | ${j.status} | ${j.creative_constraint.label} | ${j.verified_url ?? "-"} | ${j.alias_status ?? "-"} | ${j.ready_to_pitch ? "yes" : "no"} | ${notes} |`
    );
  }
  lines.push("");
  if (uniqueness.issues.length) {
    lines.push("## Creative uniqueness issues");
    for (const issue of uniqueness.issues) lines.push(`- [${issue.severity}] ${issue.message}`);
    lines.push("");
  }
  lines.push("## Commands");
  lines.push("```bash");
  lines.push(
    `npm run batch:sites -- --location ${opts.location} --niche ${opts.niche} --count ${opts.count} --concurrency ${opts.concurrency} --no-outreach`
  );
  if (opts.openDesign) {
    lines.push(`npm run batch:tail-ports -- --batch ${batchId}`);
  }
  lines.push(`npm run review:batch -- --batch ${path.relative(ROOT, jsonPath)}`);
  lines.push("```");
  if (opts.openDesign) {
    lines.push("");
    lines.push("## Port pause / unpause");
    lines.push(`Pause new port spawns: \`touch data/batches/${batchId}/pause\``);
    lines.push(`Unpause: \`rm data/batches/${batchId}/pause\` (in-flight ports continue until done or timeout)`);
  }
  lines.push("");
  lines.push("Not run: `npm run outreach -- --send`, `npm run send:whatsapp-pitch -- --live`");

  const mdPath = path.join(BATCH_DIR, "batch-report.md");
  fs.writeFileSync(mdPath, lines.join("\n") + "\n");

  return { jsonPath, mdPath };
}

async function main(): Promise<void> {
  const opts = parseArgs();
  if (opts.previewVideo && !isScrollVideoEnabled()) {
    console.log(
      "Preview video disabled by site_design.scroll_video_enabled=false in config.yaml."
    );
    opts.previewVideo = false;
  }
  if (!opts.location || !opts.niche) {
    console.error(
      'Usage: npm run batch:sites -- --location "Bristol" --niche "plumbers" --count 8 --concurrency 3 --no-outreach [--deploy true] [--preview-video true] [--dry-run-leads] [--allow-manual-review]'
    );
    process.exit(1);
  }

  const batchId = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  BATCH_DIR = path.join(ROOT, "data", "batches", batchId);
  fs.mkdirSync(path.join(BATCH_DIR, "jobs"), { recursive: true });

  console.log(`Batch ${batchId}: ${opts.niche} in ${opts.location}`);
  console.log(
    `Selecting up to ${opts.count} candidate lead(s) centrally (dedupe + scoring done in DB)...`
  );

  // CENTRAL: lead selection + dedupe (handled by DB query + prospect-time dedupe).
  const candidates = getCandidateLeadsForBatch({
    niche: opts.niche,
    region: opts.location,
    limit: opts.count,
  });

  if (candidates.length === 0) {
    console.error(
      "No candidate leads. Run: npm run prospect -- --location <loc> --niche <niche> first."
    );
    process.exit(1);
  }

  // CENTRAL: assign distinct creative directions, avoiding directions already
  // used by existing sites so per-site review uniqueness passes.
  const directions = assignDirections(candidates.length);
  const jobs = candidates.map((lead, i) => buildJob(lead, directions[i]!));

  fs.writeFileSync(
    path.join(BATCH_DIR, "selected-leads.json"),
    JSON.stringify(
      candidates.map((l) => ({
        id: l.id,
        slug: l.slug,
        business_name: l.business_name,
        score: l.score,
        state: l.state,
        region: l.region,
        niche: l.niche,
      })),
      null,
      2
    ) + "\n"
  );

  // CENTRAL: assign distinct creative direction per lead before any build.
  for (const job of jobs) {
    writeCreativeConstraint(job);
    saveJob(job);
  }
  fs.writeFileSync(
    path.join(BATCH_DIR, "jobs.json"),
    JSON.stringify(jobs, null, 2) + "\n"
  );

  console.log("\nSelected leads and creative directions:");
  for (const job of jobs) {
    console.log(`  ${job.slug} -> ${job.creative_constraint.label}`);
  }

  const writeState = (phase: string) => {
    fs.writeFileSync(
      path.join(BATCH_DIR, "batch-state.json"),
      JSON.stringify(
        {
          batch_id: batchId,
          phase,
          updated_at: new Date().toISOString(),
          options: opts,
          jobs: jobs.map((j) => ({ slug: j.slug, status: j.status })),
        },
        null,
        2
      ) + "\n"
    );
  };

  writeState("selected");

  let portSummary: Awaited<ReturnType<typeof runPortPool>> | undefined;

  if (opts.dryRunLeads) {
    console.log("\n--dry-run-leads: stopping after selection. No build, deploy, or outreach.");
    writeState("dry-run-complete");
    const { mdPath } = writeReports(batchId, opts, jobs, { score: 100, issues: [] }, "SKIPPED");
    console.log(`Report: ${path.relative(ROOT, mdPath)}`);
    return;
  }

  if (opts.openDesign) {
    const batchCfg = loadBatchConfig();
    const portConfig = {
      ...batchCfg,
      port_timeout_minutes_default: opts.portTimeoutMinutes,
      port_retry_max: opts.portRetry,
      port_token_budget_default: opts.portTokenBudget,
      port_token_per_slug_default: opts.portTokenPerSlug,
    };
    console.log(
      `\nRunning Open Design port pool (concurrency ${opts.portConcurrency}, timeout ${opts.portTimeoutMinutes} min)...`
    );
    writeState("port");
    portSummary = await runPortPool(
      batchId,
      jobs.map((j) => j.slug),
      {
        concurrency: opts.portConcurrency,
        config: portConfig,
        dryRun: process.env.WFT_PORT_DRY_RUN === "1",
      }
    );
    fs.writeFileSync(
      path.join(BATCH_DIR, "port-summary.json"),
      JSON.stringify(portSummary, null, 2) + "\n"
    );

    for (const job of jobs) {
      const result = portSummary.results[job.slug];
      if (result) {
        job.stages.port = {
          ok: result.ok,
          code: result.ok ? 0 : 1,
          ms: result.ms,
          attempts: result.attempts,
        };
        if (result.status === "PORTED" || result.status === "SKIPPED") {
          job.status = "PORTED";
        } else if (result.status === "BAILED_PORT") {
          job.status = "BAILED_PORT";
          job.errors.push(result.error ?? "port bailed");
        } else {
          job.status = "FAILED_PORT";
          job.errors.push(result.error ?? "port failed");
        }
      } else {
        job.warnings.push("No OD artifact - port not queued for this slug");
      }
      saveJob(job);
    }

    console.log(
      `Port pool done: ok=${portSummary.ok} failed=${portSummary.failed} bailed=${portSummary.bailed} skipped=${portSummary.skipped} (${Math.round(portSummary.wall_clock_ms / 1000)}s wall)`
    );
    if (portSummary.token_budget_exceeded) {
      console.warn("Port token budget exceeded - new spawns were blocked; in-flight ports were allowed to finish.");
    }
    if (opts.failFastPort && portSummary.failed > 0) {
      console.error("fail-fast-port: stopping batch after port failures.");
      writeState("port-failed");
      const { mdPath } = writeReports(
        batchId,
        opts,
        jobs,
        { score: 100, issues: [] },
        "SKIPPED",
        portSummary
      );
      console.log(`Report: ${path.relative(ROOT, mdPath)}`);
      process.exit(1);
    }
  }

  // PARALLEL: per-site gather -> build -> preview -> review, up to concurrency.
  console.log(`\nRunning site work with concurrency ${opts.concurrency}...`);
  writeState("site-work");
  await runPool(jobs, opts.concurrency, (job, slot) => runSiteWorker(job, slot, opts));

  // PARALLEL (lower): deploy with verification, alias assignment serialised.
  if (opts.deploy) {
    const deployable = jobs.filter((j) => j.status === "REVIEWED");
    console.log(
      `\nDeploying ${deployable.length} reviewed site(s) with concurrency ${opts.deployConcurrency}...`
    );
    writeState("deploy");
    await runPool(deployable, opts.deployConcurrency, (job, slot) =>
      runDeployWorker(job, slot, opts)
    );
  } else {
    console.log("\nDeploy disabled (--deploy false). Skipping deploy phase.");
  }

  // CENTRAL: readiness gate + uniqueness.
  evaluateReadiness(jobs, opts);
  const uniqueness = computeUniqueness(jobs);

  // CENTRAL: batch review (URL verification etc.) after all sites finish.
  let batchReviewResult = "SKIPPED";
  const { jsonPath } = writeReports(batchId, opts, jobs, uniqueness, batchReviewResult, portSummary);

  const anyDeployed = jobs.some((j) => j.status === "DEPLOYED");
  if (opts.deploy && anyDeployed) {
    console.log("\nRunning batch review (uniqueness + live URL verification)...");
    writeState("batch-review");
    const res = await runCommand(
      "npm",
      ["run", "review:batch", "--", "--batch", path.relative(ROOT, jsonPath)],
      { cwd: ROOT, logFile: path.join(BATCH_DIR, "batch-review.log") }
    );
    batchReviewResult = res.ok ? "PASS" : "FAIL";
    process.stdout.write(res.stdout.slice(-2000));
  }

  // Rewrite reports with final batch-review result.
  const { mdPath, jsonPath: finalJson } = writeReports(
    batchId,
    opts,
    jobs,
    uniqueness,
    batchReviewResult,
    portSummary
  );
  writeState("complete");

  console.log("\n=== Batch complete ===");
  console.log(`Selected: ${jobs.length}`);
  console.log(`Deployed: ${jobs.filter((j) => j.status === "DEPLOYED").length}`);
  console.log(`Skipped (contactability): ${jobs.filter((j) => j.status === "SKIPPED_CONTACTABILITY").length}`);
  console.log(`Failed: ${jobs.filter((j) => j.status === "FAILED").length}`);
  console.log(`Ready to pitch: ${jobs.filter((j) => j.ready_to_pitch).length}`);
  console.log(`Creative uniqueness: ${uniqueness.score}/100`);
  console.log(`Batch review: ${batchReviewResult}`);
  console.log(`\nReport (md):   ${path.relative(ROOT, mdPath)}`);
  console.log(`Report (json): ${path.relative(ROOT, finalJson)}`);
  console.log("\nNo outreach sent. sending_enabled=false, test_recipient_only=true.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
