/**
 * Block generated SVG icons in service / process UI (lucide-style line art).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

const COMPONENT_NAME_RE = /Service|Process|JobCard|WhatWeDo|HowItWorks/i;
const SERVICE_SECTION_RE =
  /data-section-id=["'](?:services|service-explainers|process(?:-section)?)["'][\s\S]*?(?=data-section-id=["']|<\/main)/gi;

export interface NoServiceIconIssue {
  file: string;
  message: string;
}

function walkTsx(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkTsx(full, acc);
    else if (/\.tsx$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function hasLucideImport(content: string): boolean {
  return (
    /from\s+["']lucide-react["']/i.test(content) ||
    /from\s+["']@heroicons\//i.test(content)
  );
}

function scanServiceProcessSections(content: string, rel: string): NoServiceIconIssue[] {
  const issues: NoServiceIconIssue[] = [];
  if (/icon:\s*\(\s*<svg/i.test(content)) {
    issues.push({ file: rel, message: "services array uses inline <svg> icon property" });
  }
  const sections = content.match(SERVICE_SECTION_RE) ?? [];
  for (const section of sections) {
    if (!/<svg/i.test(section)) continue;
    const cleaned = section
      .replace(/className="faq-icon"[\s\S]*?<\/svg>/gi, "")
      .replace(/className="step-num"[\s\S]*?<\/span>/gi, "");
    if (/<svg/i.test(cleaned)) {
      issues.push({
        file: rel,
        message: "service/process section contains inline <svg> (use numbers, marks, dots, or nothing)",
      });
      break;
    }
  }
  return issues;
}

export function reviewNoServiceIcons(slug: string, root = ROOT): NoServiceIconIssue[] {
  const issues: NoServiceIconIssue[] = [];
  const siteDir = path.join(root, "sites", slug);

  for (const sub of ["components", "app"]) {
    const dir = path.join(siteDir, sub);
    for (const file of walkTsx(dir)) {
      const rel = path.relative(root, file);
      const base = path.basename(file);
      const content = fs.readFileSync(file, "utf8");

      if (COMPONENT_NAME_RE.test(base)) {
        if (/<svg/i.test(content)) {
          issues.push({ file: rel, message: `component file ${base} contains <svg>` });
        }
        if (hasLucideImport(content)) {
          issues.push({ file: rel, message: `component file ${base} imports lucide-react or heroicons` });
        }
      }

      if (base === "page.tsx") {
        issues.push(...scanServiceProcessSections(content, rel));
      }
    }
  }

  return issues;
}

export function assertNoServiceIconsForSiteSlug(slug: string, root = ROOT): void {
  const issues = reviewNoServiceIcons(slug, root);
  if (issues.length) {
    const lines = issues.map((i) => `  - ${i.file}: ${i.message}`).join("\n");
    throw new Error(`no_service_icons failed:\n${lines}`);
  }
  console.log("no_service_icons passed.");
}
