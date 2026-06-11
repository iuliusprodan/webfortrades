#!/usr/bin/env tsx
/** Merge partial status into briefs/<slug>/batch-status.json */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { briefDir, ROOT } from "./site_config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(): { slug: string; patchJson?: string; syncOnly: boolean } {
  const args = process.argv.slice(2);
  let slug = "";
  let patchJson = "";
  let syncOnly = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--patch" && args[i + 1]) patchJson = args[++i];
    else if (args[i] === "--sync") syncOnly = true;
  }
  if (!slug) {
    console.error("Usage: tsx scripts/batch_write_status.ts --slug <slug> --patch '<json>' | --sync");
    process.exit(1);
  }
  if (!syncOnly && !patchJson) {
    console.error("Provide --patch '<json>' or --sync");
    process.exit(1);
  }
  return { slug, patchJson, syncOnly };
}

function isPendingBuildId(buildId: string | null | undefined): boolean {
  if (!buildId) return true;
  return buildId === ":pending" || buildId.endsWith(":pending");
}

/** Sync build_id and clone_review from site-metadata.json and clone-review.json. */
export function syncBatchStatusFromArtifacts(slug: string): Record<string, unknown> | null {
  const statusPath = path.join(briefDir(slug), "batch-status.json");
  if (!fs.existsSync(statusPath)) return null;

  const existing = JSON.parse(fs.readFileSync(statusPath, "utf8")) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  const metaPath = path.join(ROOT, "sites", slug, "data", "site-metadata.json");
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as { buildId?: string };
    if (meta.buildId && !isPendingBuildId(meta.buildId)) {
      patch.build_id = meta.buildId;
    }
  }

  const clonePath = path.join(briefDir(slug), "clone-review.json");
  if (fs.existsSync(clonePath)) {
    const clone = JSON.parse(fs.readFileSync(clonePath, "utf8")) as {
      passed?: boolean;
      clone_score?: number;
    };
    patch.clone_review = clone.passed ? "PASS" : "FAIL";
    if (typeof clone.clone_score === "number") patch.clone_score = clone.clone_score;
  }

  if (Object.keys(patch).length === 0) return existing;

  const merged = {
    ...existing,
    ...patch,
    slug,
    updated_at: new Date().toISOString(),
  };
  fs.writeFileSync(statusPath, `${JSON.stringify(merged, null, 2)}\n`);
  return merged;
}

function main(): void {
  const { slug, patchJson, syncOnly } = parseArgs();
  if (syncOnly) {
    const merged = syncBatchStatusFromArtifacts(slug);
    if (!merged) {
      console.error(`No batch-status.json for ${slug}`);
      process.exit(1);
    }
    console.log(`Synced ${path.join(briefDir(slug), "batch-status.json")}`);
    return;
  }

  const patch = JSON.parse(patchJson!) as Record<string, unknown>;
  const statusPath = path.join(briefDir(slug), "batch-status.json");
  const existing = fs.existsSync(statusPath)
    ? (JSON.parse(fs.readFileSync(statusPath, "utf8")) as Record<string, unknown>)
    : { slug, batch_id: "2026-06-11-five-site", READY_TO_PITCH: false, og_status: "NOT GENERATED", scroll_status: "NOT GENERATED" };

  const merged = {
    ...existing,
    ...patch,
    slug,
    updated_at: new Date().toISOString(),
    timings: { ...(existing.timings as object | undefined), ...(patch.timings as object | undefined) },
  };
  fs.writeFileSync(statusPath, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`Updated ${statusPath}`);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main();
}
