import fs from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";
import { fileURLToPath } from "node:url";
import { briefDir, ROOT } from "./site_config.js";
import { requireGeminiEnv } from "./load_env_local.js";
import {
  adjustPromptForFailure,
  buildPrompt,
  loadDesignDirection,
  type BuiltPrompt,
} from "./image_generate_prompt.js";
import {
  generateGeminiImage,
  logEstimatedCost,
  MODEL_COST_USD,
} from "./gemini_image_client.js";
import {
  normalizeToJpeg,
  runQualityChecks,
  type QualityCheckResult,
  type QualityTarget,
} from "./image_quality_checks.js";

export type ImageSlot = "landscape" | "portrait";
export type QualityMode = "pro" | "fast";

export interface ImageManifestEntry {
  path: string;
  source: "ai_generated" | "google_places" | "manual_verified" | string;
  model?: string;
  prompt?: string;
  seed?: number | null;
  aspect_ratio?: string;
  dimensions?: [number, number];
  attempts?: number;
  quality_checks?: QualityCheckResult["checks"] | Record<string, unknown>;
  alt_text?: string;
  generated_at?: string;
  status?: "ok" | "failed";
  failure_reasons?: string[];
}

export interface ImageManifestFile {
  slug: string;
  updated_at: string;
  images: ImageManifestEntry[];
}

export interface PromptAttemptRecord {
  slot: ImageSlot;
  attempt: number;
  model: string;
  aspect_ratio: string;
  seed: number;
  prompt: string;
  dry_run?: boolean;
  quality_checks?: QualityCheckResult;
  status: "dry_run" | "ok" | "failed" | "retry";
  failure_reasons?: string[];
  estimated_cost_usd?: number;
  at: string;
}

const PROTECTED_SOURCES = new Set(["google_places", "manual_verified"]);

const SLOT_CONFIG: Record<
  ImageSlot,
  {
    publicPath: string;
    aspectRatio: "4:3" | "3:4";
    width: number;
    height: number;
  }
> = {
  landscape: {
    publicPath: "public/hero-ai-landscape.jpg",
    aspectRatio: "4:3",
    width: 1600,
    height: 1200,
  },
  portrait: {
    publicPath: "public/hero-ai-portrait.jpg",
    aspectRatio: "3:4",
    width: 1200,
    height: 1600,
  },
};

export interface GenerateOptions {
  slug: string;
  quality: QualityMode;
  only: "landscape" | "portrait" | "both";
  dryRun: boolean;
  force: boolean;
  maxAttempts: number;
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);
  let slug = "";
  let quality: QualityMode = "pro";
  let only: "landscape" | "portrait" | "both" = "both";
  let dryRun = false;
  let force = false;
  let maxAttempts = 3;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--slug" && args[i + 1]) slug = args[++i];
    else if (a === "--quality" && args[i + 1]) {
      const q = args[++i];
      if (q !== "pro" && q !== "fast") {
        console.error("--quality must be pro or fast");
        process.exit(1);
      }
      quality = q;
    } else if (a === "--only" && args[i + 1]) {
      const o = args[++i];
      if (o !== "landscape" && o !== "portrait" && o !== "both") {
        console.error("--only must be landscape, portrait, or both");
        process.exit(1);
      }
      only = o;
    } else if (a === "--dry-run") dryRun = true;
    else if (a === "--force") force = true;
    else if (a === "--max-attempts" && args[i + 1]) {
      maxAttempts = Math.min(5, Math.max(1, parseInt(args[++i]!, 10)));
    }
  }

  if (!slug) {
    console.error("Usage: npm run images:generate -- --slug <slug> [--quality pro|fast] [--only landscape|portrait|both] [--dry-run] [--force] [--max-attempts n]");
    process.exit(1);
  }

  return { slug, quality, only, dryRun, force, maxAttempts };
}

function manifestPath(slug: string): string {
  return path.join(briefDir(slug), "images", "manifest.json");
}

function promptsPath(slug: string): string {
  return path.join(briefDir(slug), "images", "prompts.json");
}

export function loadManifest(slug: string): ImageManifestFile {
  const p = manifestPath(slug);
  if (!fs.existsSync(p)) {
    return { slug, updated_at: new Date().toISOString(), images: [] };
  }
  const raw = JSON.parse(fs.readFileSync(p, "utf8")) as ImageManifestFile | ImageManifestEntry[];
  if (Array.isArray(raw)) {
    return { slug, updated_at: new Date().toISOString(), images: raw };
  }
  return raw;
}

export function saveManifest(slug: string, manifest: ImageManifestFile): void {
  const dir = path.join(briefDir(slug), "images");
  fs.mkdirSync(dir, { recursive: true });
  manifest.updated_at = new Date().toISOString();
  fs.writeFileSync(manifestPath(slug), `${JSON.stringify(manifest, null, 2)}\n`);
}

function appendPromptRecord(
  slug: string,
  seed: number,
  record: PromptAttemptRecord
): void {
  const dir = path.join(briefDir(slug), "images");
  fs.mkdirSync(dir, { recursive: true });
  const p = promptsPath(slug);
  const existing = fs.existsSync(p)
    ? (JSON.parse(fs.readFileSync(p, "utf8")) as {
        slug: string;
        seed: number;
        attempts: PromptAttemptRecord[];
      })
    : { slug, seed, attempts: [] };
  existing.seed = seed;
  existing.attempts.push(record);
  fs.writeFileSync(p, `${JSON.stringify(existing, null, 2)}\n`);
}

function slotsForOnly(only: GenerateOptions["only"]): ImageSlot[] {
  if (only === "landscape") return ["landscape"];
  if (only === "portrait") return ["portrait"];
  return ["landscape", "portrait"];
}

export function findManifestEntry(
  manifest: ImageManifestFile,
  publicPath: string
): ImageManifestEntry | undefined {
  return manifest.images.find((e) => e.path === publicPath);
}

export function assertSafeToWrite(
  manifest: ImageManifestFile,
  publicPath: string,
  force: boolean
): void {
  const entry = findManifestEntry(manifest, publicPath);
  if (entry && PROTECTED_SOURCES.has(entry.source)) {
    console.error(
      `Refusing to overwrite ${publicPath}: manifest source is "${entry.source}" (protected).`
    );
    process.exit(1);
  }
  if (entry?.source === "ai_generated" && !force) {
    console.error(
      `AI image already exists at ${publicPath}. Use --force to regenerate, or delete the manifest entry first.`
    );
    process.exit(1);
  }
}

export interface UsableHeroPhoto {
  width: number;
  height: number;
  local?: string;
  source_type?: string;
}

export function findUsableGooglePlacesHero(slug: string): UsableHeroPhoto | null {
  const briefPath = path.join(briefDir(slug), "brief.json");
  if (!fs.existsSync(briefPath)) return null;
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as {
    photos?: Array<{
      width?: number;
      height?: number;
      local?: string;
      source_type?: string;
    }>;
  };
  let best: UsableHeroPhoto | null = null;
  for (const photo of brief.photos ?? []) {
    if (photo.source_type !== "google_places") continue;
    const w = photo.width ?? 0;
    const h = photo.height ?? 0;
    const longEdge = Math.max(w, h);
    if (longEdge < 1000) continue;
    if (!best || longEdge > Math.max(best.width, best.height)) {
      best = {
        width: w,
        height: h,
        local: photo.local,
        source_type: photo.source_type,
      };
    }
  }
  return best;
}

async function generateSlot(
  opts: GenerateOptions,
  slot: ImageSlot,
  basePrompt: BuiltPrompt,
  seed: number,
  model: string,
  apiKey: string
): Promise<{
  entry: ImageManifestEntry;
  totalCost: number;
  promptRecords: PromptAttemptRecord[];
}> {
  const cfg = SLOT_CONFIG[slot];
  const siteDir = path.join(ROOT, "sites", opts.slug);
  const outPath = path.join(siteDir, cfg.publicPath);
  const target: QualityTarget = {
    width: cfg.width,
    height: cfg.height,
    aspectRatio: cfg.aspectRatio,
    minBytes: 80 * 1024,
    maxBytes: 4 * 1024 * 1024,
  };

  let prompt = basePrompt;
  let totalCost = 0;
  const promptRecords: PromptAttemptRecord[] = [];
  let lastFailures: string[] = [];
  let lastChecks: QualityCheckResult | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    if (attempt > 1) {
      prompt = adjustPromptForFailure(basePrompt, lastFailures);
    }

    const attemptPrompt = `${prompt.fullPrompt} (seed reference ${seed}).`;
    console.log(`\n[${slot}] Attempt ${attempt}/${opts.maxAttempts}`);
    console.log(`  Prompt: ${attemptPrompt}`);

    if (opts.dryRun) {
      const est = MODEL_COST_USD[model] ?? 0.134;
      promptRecords.push({
        slot,
        attempt,
        model,
        aspect_ratio: cfg.aspectRatio,
        seed,
        prompt: attemptPrompt,
        dry_run: true,
        status: "dry_run",
        estimated_cost_usd: est,
        at: new Date().toISOString(),
      });
      return {
        entry: {
          path: cfg.publicPath,
          source: "ai_generated",
          model,
          prompt: attemptPrompt,
          seed,
          aspect_ratio: cfg.aspectRatio,
          dimensions: [cfg.width, cfg.height],
          attempts: 0,
          alt_text: basePrompt.altText,
          status: "ok",
          generated_at: new Date().toISOString(),
        },
        totalCost: est,
        promptRecords,
      };
    }

    const generated = await generateGeminiImage({
      apiKey,
      model,
      prompt: attemptPrompt,
      aspectRatio: cfg.aspectRatio,
      imageSize: "2K",
    });
    totalCost += generated.estimatedCostUsd;

    const jpeg = await normalizeToJpeg(generated.imageBuffer, cfg.width, cfg.height);
    const checks = await runQualityChecks(jpeg, target);
    lastChecks = checks;
    lastFailures = checks.failures;

    promptRecords.push({
      slot,
      attempt,
      model,
      aspect_ratio: cfg.aspectRatio,
      seed,
      prompt: attemptPrompt,
      quality_checks: checks,
      status: checks.passed ? "ok" : attempt < opts.maxAttempts ? "retry" : "failed",
      failure_reasons: checks.failures,
      estimated_cost_usd: generated.estimatedCostUsd,
      at: new Date().toISOString(),
    });

    if (checks.passed) {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, jpeg);
      console.log(`  Saved ${cfg.publicPath} (${Math.round(jpeg.length / 1024)}KB)`);
      return {
        entry: {
          path: cfg.publicPath,
          source: "ai_generated",
          model,
          prompt: attemptPrompt,
          seed,
          aspect_ratio: cfg.aspectRatio,
          dimensions: [cfg.width, cfg.height],
          attempts: attempt,
          quality_checks: checks.checks,
          alt_text: basePrompt.altText,
          generated_at: new Date().toISOString(),
          status: "ok",
        },
        totalCost,
        promptRecords,
      };
    }

    console.log(`  Quality checks failed: ${checks.failures.join(", ")}`);
  }

  return {
    entry: {
      path: cfg.publicPath,
      source: "ai_generated",
      model,
      prompt: prompt.fullPrompt,
      seed,
      aspect_ratio: cfg.aspectRatio,
      dimensions: [cfg.width, cfg.height],
      attempts: opts.maxAttempts,
      quality_checks: lastChecks?.checks ?? {},
      alt_text: basePrompt.altText,
      status: "failed",
      failure_reasons: lastFailures,
      generated_at: new Date().toISOString(),
    },
    totalCost,
    promptRecords,
  };
}

export async function runImagesGenerate(opts: GenerateOptions): Promise<void> {
  const design = loadDesignDirection(opts.slug);
  const basePrompt = buildPrompt(design);
  const seed = randomInt(1, 2_147_483_647);
  const slots = slotsForOnly(opts.only);

  const gemini = requireGeminiEnv();
  const model = opts.quality === "fast" ? gemini.modelFast : gemini.modelPro;

  console.log(`\n=== images:generate ===`);
  console.log(`Slug: ${opts.slug}`);
  console.log(`Niche: ${design.niche}`);
  console.log(`Model: ${model} (${opts.quality})`);
  console.log(`Seed: ${seed}`);
  console.log(`Dry run: ${opts.dryRun ? "yes" : "no"}`);
  console.log(`Slots: ${slots.join(", ")}`);

  const manifest = loadManifest(opts.slug);
  for (const slot of slots) {
    assertSafeToWrite(manifest, SLOT_CONFIG[slot].publicPath, opts.force);
  }

  const usableHero = findUsableGooglePlacesHero(opts.slug);
  if (usableHero && !opts.dryRun) {
    console.error(
      `\nRefusing to generate: verified Google Places photo meets hero threshold (${usableHero.width}x${usableHero.height}, ${usableHero.local ?? "brief.json"}).`
    );
    console.error("Use a real Places photo for the hero, or typography-only layout.");
    process.exit(1);
  }
  if (usableHero && opts.dryRun) {
    console.log(
      `\nNote: LIVE RUN WOULD SKIP — Google Places hero available at ${usableHero.width}x${usableHero.height} (${usableHero.local}).`
    );
    console.log("Dry-run continues to show prompt and cost only.\n");
  }

  console.log(`\nBase prompt:\n  ${basePrompt.fullPrompt}`);
  console.log(`Alt text: ${basePrompt.altText}`);

  const imageCount = slots.length;
  const estimatedTotal = logEstimatedCost(model, imageCount);

  if (opts.dryRun) {
    for (const slot of slots) {
      const cfg = SLOT_CONFIG[slot];
      console.log(`\nTarget: sites/${opts.slug}/${cfg.publicPath}`);
      console.log(`  Aspect: ${cfg.aspectRatio}, ${cfg.width}x${cfg.height}`);
    }
  }

  let totalCost = 0;
  const results: ImageManifestEntry[] = [];

  for (const slot of slots) {
    const { entry, totalCost: slotCost, promptRecords } = await generateSlot(
      opts,
      slot,
      basePrompt,
      seed,
      model,
      gemini.apiKey
    );
    totalCost += slotCost;
    if (!opts.dryRun) {
      for (const rec of promptRecords) {
        appendPromptRecord(opts.slug, seed, rec);
      }
    }
    if (!opts.dryRun) {
      const idx = manifest.images.findIndex((e) => e.path === entry.path);
      if (idx >= 0) manifest.images[idx] = entry;
      else manifest.images.push(entry);
      if (entry.status === "ok") {
        results.push(entry);
      } else {
        console.error(`\n[${slot}] FAILED after ${opts.maxAttempts} attempts: ${entry.failure_reasons?.join(", ")}`);
      }
    } else {
      results.push(entry);
    }
  }

  if (!opts.dryRun) {
    saveManifest(opts.slug, manifest);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Slug: ${opts.slug}`);
  console.log(`Model: ${model}`);
  for (const slot of slots) {
    const cfg = SLOT_CONFIG[slot];
    const entry = results.find((e) => e.path === cfg.publicPath);
    console.log(`  ${slot}: attempts=${entry?.attempts ?? "-"} status=${entry?.status ?? "dry_run"} path=${cfg.publicPath}`);
  }
  console.log(`Prompts log: briefs/${opts.slug}/images/prompts.json${opts.dryRun ? " (live run only)" : ""}`);
  if (!opts.dryRun) {
    console.log(`Manifest: briefs/${opts.slug}/images/manifest.json`);
  }
  console.log(`Estimated cost (this run): $${(opts.dryRun ? estimatedTotal : totalCost).toFixed(3)} USD`);
  console.log(`Total cost: $${(opts.dryRun ? estimatedTotal : totalCost).toFixed(3)} USD`);

  if (!opts.dryRun && results.some((e) => e.status === "failed")) {
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runImagesGenerate(parseArgs()).catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
