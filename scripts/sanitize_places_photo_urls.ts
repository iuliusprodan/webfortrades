/**
 * Strip Google Places API keys from stored photo URLs in brief JSON files.
 * Usage: tsx scripts/sanitize_places_photo_urls.ts [--check]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const KEY_PATTERN = /&key=AIzaSy[A-Za-z0-9_-]+/g;
const KEY_PATTERN_Q = /\?key=AIzaSy[A-Za-z0-9_-]+/g;

function sanitizeText(text: string): string {
  return text.replace(KEY_PATTERN, "&key=REDACTED").replace(KEY_PATTERN_Q, "?key=REDACTED");
}

function walkJsonFiles(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkJsonFiles(full, out);
    else if (entry.name.endsWith(".json")) out.push(full);
  }
}

export function sanitizeRepoBriefJson(options?: { dryRun?: boolean }): {
  changed: string[];
  remaining: string[];
} {
  const targets = [
    ...walkCollect(path.join(ROOT, "briefs")),
    ...walkCollect(path.join(ROOT, "sites")),
  ];
  const changed: string[] = [];
  for (const file of targets) {
    const raw = fs.readFileSync(file, "utf8");
    if (!raw.includes("AIzaSy")) continue;
    const next = sanitizeText(raw);
    if (next !== raw) {
      if (!options?.dryRun) fs.writeFileSync(file, next);
      changed.push(path.relative(ROOT, file));
    }
  }
  const remaining: string[] = [];
  for (const file of targets) {
    if (fs.readFileSync(file, "utf8").includes("AIzaSy")) {
      remaining.push(path.relative(ROOT, file));
    }
  }
  return { changed, remaining };
}

function walkCollect(dir: string): string[] {
  const out: string[] = [];
  walkJsonFiles(dir, out);
  return out;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const checkOnly = process.argv.includes("--check");
  const result = sanitizeRepoBriefJson({ dryRun: checkOnly });
  console.log(JSON.stringify(result, null, 2));
  if (result.remaining.length > 0) process.exit(1);
}
