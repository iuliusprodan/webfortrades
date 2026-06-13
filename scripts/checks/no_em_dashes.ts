/**
 * Scan customer-facing paths for banned dash punctuation.
 * Use hyphens with spaces (" - "), commas, or full stops instead.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

const EM_DASH = "\u2014";
const EN_DASH = "\u2013";
const HORIZONTAL_BAR = "\u2015";
const ASCII_DOUBLE = " -- ";

export type BannedDashKind =
  | "em dash (—)"
  | "en dash (–)"
  | "horizontal bar (―)"
  | "ASCII double hyphen ( -- )";

export interface EmDashViolation {
  file: string;
  line: number;
  column: number;
  char: BannedDashKind;
  excerpt: string;
}

export type EmDashScanScope = "outreach" | "sites" | "briefs";

export interface CollectEmDashOptions {
  root?: string;
  scopes?: EmDashScanScope[];
  /** When set, only scan briefs for these slugs (still scans all outreach). */
  briefSlugs?: string[];
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

function scanLine(
  file: string,
  lineNo: number,
  line: string
): EmDashViolation[] {
  const violations: EmDashViolation[] = [];
  const rel = path.relative(ROOT, file);

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === EM_DASH) {
      violations.push({
        file: rel,
        line: lineNo,
        column: i + 1,
        char: "em dash (—)",
        excerpt: line.trim().slice(0, 120),
      });
    } else if (ch === EN_DASH) {
      violations.push({
        file: rel,
        line: lineNo,
        column: i + 1,
        char: "en dash (–)",
        excerpt: line.trim().slice(0, 120),
      });
    } else if (ch === HORIZONTAL_BAR) {
      violations.push({
        file: rel,
        line: lineNo,
        column: i + 1,
        char: "horizontal bar (―)",
        excerpt: line.trim().slice(0, 120),
      });
    }
  }

  let idx = line.indexOf(ASCII_DOUBLE);
  while (idx !== -1) {
    violations.push({
      file: rel,
      line: lineNo,
      column: idx + 1,
      char: "ASCII double hyphen ( -- )",
      excerpt: line.trim().slice(0, 120),
    });
    idx = line.indexOf(ASCII_DOUBLE, idx + ASCII_DOUBLE.length);
  }

  return violations;
}

function scanTextFile(filePath: string): EmDashViolation[] {
  const content = fs.readFileSync(filePath, "utf8");
  const violations: EmDashViolation[] = [];
  content.split("\n").forEach((line, i) => {
    violations.push(...scanLine(filePath, i + 1, line));
  });
  return violations;
}

function scanJsonStringValues(
  filePath: string,
  value: unknown,
  pathParts: string[] = []
): EmDashViolation[] {
  const violations: EmDashViolation[] = [];
  if (typeof value === "string") {
    value.split("\n").forEach((line, i) => {
      const synthetic = `[${pathParts.join(".")}] ${line}`;
      for (const v of scanLine(filePath, i + 1, line)) {
        violations.push({
          ...v,
          excerpt: synthetic.trim().slice(0, 120),
        });
      }
    });
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => {
      violations.push(...scanJsonStringValues(filePath, item, [...pathParts, String(i)]));
    });
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      violations.push(...scanJsonStringValues(filePath, child, [...pathParts, key]));
    }
  }
  return violations;
}

function scanBriefJson(filePath: string): EmDashViolation[] {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
    return scanJsonStringValues(filePath, data);
  } catch {
    return scanTextFile(filePath);
  }
}

function collectSiteTargets(root: string): string[] {
  const targets: string[] = [];
  const sitesDir = path.join(root, "sites");
  if (!fs.existsSync(sitesDir)) return targets;

  for (const slug of fs.readdirSync(sitesDir)) {
    const appDir = path.join(sitesDir, slug, "app");
    if (fs.existsSync(appDir)) {
      for (const file of walkFiles(appDir)) {
        if (/\.(tsx?|jsx?)$/.test(file)) targets.push(file);
      }
    }
    const contentDir = path.join(sitesDir, slug, "content");
    if (fs.existsSync(contentDir)) {
      targets.push(...walkFiles(contentDir));
    }
  }
  return targets;
}

function collectBriefTargets(root: string, slugs?: string[]): string[] {
  const briefsDir = path.join(root, "briefs");
  if (!fs.existsSync(briefsDir)) return [];
  const targets: string[] = [];
  const dirs = slugs?.length
    ? slugs.map((s) => path.join(briefsDir, s))
    : fs
        .readdirSync(briefsDir)
        .map((name) => path.join(briefsDir, name))
        .filter((d) => fs.existsSync(d) && fs.statSync(d).isDirectory());

  for (const dir of dirs) {
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".json")) {
        targets.push(path.join(dir, file));
      }
    }
  }
  return targets;
}

export function collectEmDashViolations(
  options: CollectEmDashOptions = {}
): EmDashViolation[] {
  const root = options.root ?? ROOT;
  const scopes = options.scopes ?? ["outreach", "sites", "briefs"];
  const targets: string[] = [];

  if (scopes.includes("outreach")) {
    for (const sub of ["outreach/templates", "outreach/drafts"]) {
      targets.push(...walkFiles(path.join(root, sub)));
    }
  }
  if (scopes.includes("sites")) {
    targets.push(...collectSiteTargets(root));
  }
  if (scopes.includes("briefs")) {
    targets.push(...collectBriefTargets(root, options.briefSlugs));
  }

  const violations: EmDashViolation[] = [];
  for (const file of targets) {
    if (file.endsWith(".json")) {
      violations.push(...scanBriefJson(file));
    } else {
      violations.push(...scanTextFile(file));
    }
  }
  return violations;
}

export function formatEmDashReport(violations: EmDashViolation[]): string {
  if (violations.length === 0) return "No banned dash punctuation found.";
  return violations
    .map((v) => `${v.file}:${v.line}:${v.column} ${v.char}: ${v.excerpt}`)
    .join("\n");
}

export function assertNoEmDashes(options: CollectEmDashOptions = {}): void {
  const violations = collectEmDashViolations(options);
  if (violations.length > 0) {
    throw new Error(
      `Banned dash check failed (${violations.length} hit(s)):\n${formatEmDashReport(violations)}`
    );
  }
}

export function assertNoEmDashesInOutreach(root = ROOT): void {
  assertNoEmDashes({ root, scopes: ["outreach"] });
}

export function assertNoEmDashesForSiteSlug(slug: string, root = ROOT): void {
  assertNoEmDashes({ root, scopes: ["sites"], briefSlugs: [slug] });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const slugArg = process.argv.find((a, i) => process.argv[i - 1] === "--slug");
  const violations = collectEmDashViolations(
    slugArg ? { scopes: ["sites"], briefSlugs: [slugArg] } : { scopes: ["outreach", "sites", "briefs"] }
  );
  if (violations.length === 0) {
    console.log("OK: no banned dash punctuation in scanned paths.");
    process.exit(0);
  }
  console.error(formatEmDashReport(violations));
  process.exit(1);
}
