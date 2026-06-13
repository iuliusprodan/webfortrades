/** Batch palette diversity (2m). */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./copy_scan_utils.js";

export interface DiversityIssue {
  code: string;
  message: string;
}

export function extractPrimaryColor(slug: string, root = ROOT): string | null {
  const cssPath = path.join(root, "sites", slug, "app", "globals.css");
  if (!fs.existsSync(cssPath)) return null;
  const css = fs.readFileSync(cssPath, "utf8");
  const m =
    css.match(/--color-primary:\s*([^;]+)/i) ??
    css.match(/--primary:\s*([^;]+)/i) ??
    css.match(/--accent:\s*([^;]+)/i);
  return m?.[1]?.trim() ?? null;
}

export function reviewPaletteDiversity(slugs: string[], root = ROOT): DiversityIssue[] {
  const issues: DiversityIssue[] = [];
  const tally = new Map<string, string[]>();
  for (const slug of slugs) {
    const color = extractPrimaryColor(slug, root);
    if (!color) continue;
    const key = color.replace(/\s+/g, " ").toLowerCase();
    const list = tally.get(key) ?? [];
    list.push(slug);
    tally.set(key, list);
  }
  for (const [color, members] of tally) {
    if (members.length > 2) {
      issues.push({
        code: "palette_monotony",
        message: `${members.length} sites share primary colour ${color}: ${members.join(", ")}`,
      });
    }
  }
  return issues;
}

export function assertPaletteDiversity(slugs: string[], root = ROOT): void {
  const issues = reviewPaletteDiversity(slugs, root);
  if (issues.length) {
    throw new Error(`palette_diversity failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`);
  }
  console.log("palette_diversity passed.");
}
