/** Batch font diversity (2m). */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./copy_scan_utils.js";

export interface DiversityIssue {
  code: string;
  message: string;
}

export function extractFonts(slug: string, root = ROOT): { heading: string | null; body: string | null } {
  const layoutPath = path.join(root, "sites", slug, "app", "layout.tsx");
  const cssPath = path.join(root, "sites", slug, "app", "globals.css");
  let heading: string | null = null;
  let body: string | null = null;

  if (fs.existsSync(layoutPath)) {
    const layout = fs.readFileSync(layoutPath, "utf8");
    const imports = [...layout.matchAll(/from\s+"next\/font\/google"[\s\S]*?(\w+)\s*=\s*(\w+)/g)];
    const fontImports = [...layout.matchAll(/import\s+\{\s*([^}]+)\s*\}\s+from\s+"next\/font\/google"/g)];
    if (fontImports[0]) {
      const names = fontImports[0][1]!.split(",").map((s) => s.trim());
      heading = names[0] ?? null;
      body = names[1] ?? null;
    }
    const displayVar = layout.match(/variable:\s*"--font-display"/);
    const bodyVar = layout.match(/variable:\s*"--font-body"/);
    if (displayVar && !heading) heading = "display-font";
  }
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, "utf8");
    const bodyMatch = css.match(/--font-body:\s*([^;]+)/);
    if (bodyMatch && !body) body = bodyMatch[1]!.trim().slice(0, 40);
  }
  return { heading, body };
}

export function reviewFontDiversity(slugs: string[], root = ROOT): DiversityIssue[] {
  const issues: DiversityIssue[] = [];
  const headingTally = new Map<string, string[]>();
  for (const slug of slugs) {
    const { heading } = extractFonts(slug, root);
    if (!heading) continue;
    const list = headingTally.get(heading) ?? [];
    list.push(slug);
    headingTally.set(heading, list);
  }
  for (const [font, members] of headingTally) {
    if (members.length > 3) {
      issues.push({
        code: "font_monotony",
        message: `${members.length} sites share heading font ${font}: ${members.join(", ")}`,
      });
    }
  }
  return issues;
}

export function assertFontDiversity(slugs: string[], root = ROOT): void {
  const issues = reviewFontDiversity(slugs, root);
  if (issues.length) {
    throw new Error(`font_diversity failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`);
  }
  console.log("font_diversity passed.");
}
