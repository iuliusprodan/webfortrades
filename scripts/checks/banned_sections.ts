/** Banned section headings (Pattern E / 2e). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BANNED_SECTION_HEADING_PATTERNS } from "../copy_voice_constants.js";
import { readPageSource } from "./copy_scan_utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

export interface CopyCheckIssue {
  code: string;
  message: string;
}

export function reviewBannedSections(slug: string, root = ROOT): CopyCheckIssue[] {
  const issues: CopyCheckIssue[] = [];
  const page = readPageSource(slug, root);
  if (!page) return issues;

  const headingRe = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>|<p className="[^"]*eyebrow[^"]*"[^>]*>([\s\S]*?)<\//gi;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(page)) !== null) {
    const text = (m[1] ?? m[2] ?? "").replace(/<[^>]+>/g, " ").trim();
    for (const pattern of BANNED_SECTION_HEADING_PATTERNS) {
      if (pattern.test(text)) {
        issues.push({
          code: "banned_section_heading",
          message: `Banned section heading: "${text}"`,
        });
      }
    }
  }
  return issues;
}

export function assertBannedSectionsForSiteSlug(slug: string, root = ROOT): void {
  const issues = reviewBannedSections(slug, root);
  if (issues.length) {
    throw new Error(`banned_sections failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`);
  }
  console.log("banned_sections passed.");
}
