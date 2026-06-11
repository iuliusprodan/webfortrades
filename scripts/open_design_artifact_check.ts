#!/usr/bin/env tsx
/**
 * Validate a saved Open Design artifact folder (read-only).
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadSiteDesignConfig } from "./site_config.js";
import {
  evaluateOwnerNameSectionTitleBanHtml,
  evaluateTextOnlyWordmarksHtml,
} from "./site_design_checks.js";

const EM_DASH = "\u2014";
const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /your text here/i,
  /placeholder/i,
  /example\.com/i,
  /unsplash\.com/i,
  /picsum\.photos/i,
  /via\.placeholder/i,
  /stock photo/i,
];
const BANNED_HEADINGS = [
  "questions before you ring",
  "services. done plainly",
  "a note from",
  "one van. one trade",
  "plumbing sorted properly",
];
const FORBIDDEN_METADATA = [
  /\bdemo\b/i,
  /\bpreview\b/i,
  /\bspeculative\b/i,
  /\btest site\b/i,
  /\bconcept site\b/i,
];
const CORRECT_FOOTER = "webfortradesuk.co.uk";
const WRONG_FOOTER = "webfortrades.co.uk";

interface Issue {
  severity: "error" | "warn";
  message: string;
}

function parseArgs(): { slug: string; dir?: string } {
  const args = process.argv.slice(2);
  let slug = "";
  let dir: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--dir" && args[i + 1]) dir = args[++i];
  }
  if (!slug && !dir) {
    console.error("Usage: npm run od:check -- --slug <slug> [--dir <artifact-dir>]");
    process.exit(1);
  }
  return { slug, dir };
}

function readText(p: string): string {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function checkEmDashes(text: string, file: string, issues: Issue[]): void {
  const count = (text.match(new RegExp(EM_DASH, "g")) ?? []).length;
  if (count > 0) issues.push({ severity: "error", message: `${file}: ${count} em dash(es) found` });
}

function checkPatterns(
  text: string,
  file: string,
  patterns: RegExp[],
  severity: "error" | "warn",
  label: string,
  issues: Issue[]
): void {
  for (const re of patterns) {
    if (re.test(text)) {
      issues.push({ severity, message: `${file}: ${label} matched ${re}` });
    }
  }
}

function resolveImageRefs(html: string, artifactDir: string, issues: Issue[]): void {
  const refs = [...html.matchAll(/(?:src|href)=["'](assets\/[^"']+)["']/gi)].map((m) => m[1]);
  const unique = [...new Set(refs)];
  for (const ref of unique) {
    const local = path.join(artifactDir, ref);
    if (!fs.existsSync(local)) {
      issues.push({ severity: "error", message: `Missing asset: ${ref}` });
    }
  }
}

function main(): void {
  const { slug, dir } = parseArgs();
  const artifactDir = dir ?? path.join(ROOT, "open-design-artifacts", slug);
  const issues: Issue[] = [];

  console.log(`Checking artifact: ${artifactDir}\n`);

  if (!fs.existsSync(artifactDir)) {
    console.error(`Directory not found: ${artifactDir}`);
    process.exit(1);
  }

  const htmlPath = path.join(artifactDir, "artifact.html");
  const cssPath = path.join(artifactDir, "artifact.css");
  const html = readText(htmlPath);
  const css = readText(cssPath);
  const combined = `${html}\n${css}`;

  if (!html) issues.push({ severity: "error", message: "artifact.html missing or empty" });
  if (!css) issues.push({ severity: "error", message: "artifact.css missing or empty" });

  const assetsDir = path.join(artifactDir, "assets");
  if (!fs.existsSync(assetsDir)) {
    issues.push({ severity: "error", message: "assets/ directory missing" });
  } else {
    const images = fs.readdirSync(path.join(assetsDir, "images"), { withFileTypes: true }).filter((d) => d.isFile());
    if (images.length === 0) issues.push({ severity: "error", message: "assets/images/ has no files" });
  }

  if (html) {
    resolveImageRefs(html, artifactDir, issues);
    checkEmDashes(html, "artifact.html", issues);
    checkPatterns(html, "artifact.html", PLACEHOLDER_PATTERNS, "error", "placeholder pattern", issues);
    checkPatterns(html.toLowerCase(), "artifact.html", BANNED_HEADINGS.map((h) => new RegExp(h, "i")), "error", "banned heading", issues);

    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "";
    const desc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? "";
    checkPatterns(`${title} ${desc}`, "metadata", FORBIDDEN_METADATA, "error", "forbidden metadata word", issues);

    if (html.includes(WRONG_FOOTER)) {
      issues.push({
        severity: "warn",
        message: `Footer links to ${WRONG_FOOTER}; use ${CORRECT_FOOTER}`,
      });
    }
    if (!html.includes(CORRECT_FOOTER) && /webfortrades/i.test(html)) {
      issues.push({ severity: "warn", message: "WebForTrades mentioned but correct footer domain not found" });
    }
    if (/webfortrades/i.test(`${title} ${desc}`)) {
      issues.push({ severity: "error", message: "WebForTrades appears in title or description metadata" });
    }

    const siteDesign = loadSiteDesignConfig();
    if (siteDesign.text_only_wordmarks) {
      for (const issue of evaluateTextOnlyWordmarksHtml(html)) {
        issues.push(issue);
      }
    }
    if (siteDesign.ban_owner_name_section_titles) {
      for (const issue of evaluateOwnerNameSectionTitleBanHtml(html)) {
        issues.push(issue);
      }
    }
  }

  if (css) checkEmDashes(css, "artifact.css", issues);

  for (const i of issues) {
    console.log(`  [${i.severity.toUpperCase()}] ${i.message}`);
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warns = issues.filter((i) => i.severity === "warn");

  console.log("");
  console.log(`Result: ${errors.length} error(s), ${warns.length} warning(s)`);

  if (errors.length) {
    console.log("FAIL - fix errors before port or deploy.");
    process.exit(1);
  }

  if (warns.length) {
    console.log("PASS WITH WARNINGS - review before port.");
    process.exit(0);
  }

  console.log("PASS - suitable for Next.js port (subject to human review).");
}

main();
