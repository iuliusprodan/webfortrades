/** Hero subhead must be a single sentence (2i). */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractHeroSubhead, readPageSource, splitSentences } from "./copy_scan_utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

export interface CopyCheckIssue {
  code: string;
  message: string;
}

export function reviewHeroSubhead(slug: string, root = ROOT): CopyCheckIssue[] {
  const issues: CopyCheckIssue[] = [];
  const subhead = extractHeroSubhead(readPageSource(slug, root));
  if (!subhead) return issues;

  const sentences = splitSentences(subhead.replace(/\n/g, " "));
  if (sentences.length > 2) {
    issues.push({
      code: "hero_subhead_multi_sentence",
      message: `Hero subhead has ${sentences.length} sentences (max 2 short clauses): "${subhead.slice(0, 120)}..."`,
    });
  }
  if (subhead.length > 220) {
    issues.push({
      code: "hero_subhead_too_long",
      message: `Hero subhead exceeds 220 chars (${subhead.length})`,
    });
  }
  return issues;
}

export function assertHeroSubheadForSiteSlug(slug: string, root = ROOT): void {
  const issues = reviewHeroSubhead(slug, root);
  if (issues.length) {
    throw new Error(`hero_subhead failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`);
  }
  console.log("hero_subhead passed.");
}
