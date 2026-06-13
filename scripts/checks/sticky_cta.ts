/** Sticky CTA must be quote-led only (2g). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectSiteCopyFiles } from "./copy_scan_utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

const PHONE_IN_STICKY = /sticky-call[\s\S]{0,800}(tel:|Call\s+\d|href=\{?[`"']tel:)/i;

export interface CopyCheckIssue {
  code: string;
  message: string;
}

export function reviewStickyCta(slug: string, root = ROOT): CopyCheckIssue[] {
  const issues: CopyCheckIssue[] = [];
  for (const file of collectSiteCopyFiles(slug, root)) {
    const content = fs.readFileSync(file, "utf8");
    if (!/sticky-call|stickyBar|mobile-bar|sticky-cta/i.test(content)) continue;
    if (PHONE_IN_STICKY.test(content)) {
      issues.push({
        code: "sticky_cta_phone",
        message: `Sticky/floating CTA contains phone or Call link (${path.relative(root, file)})`,
      });
    }
    const stickyBlock = content.match(/sticky-call[\s\S]{0,600}/i)?.[0] ?? "";
    if (/>\s*Call\s*</i.test(stickyBlock) && !/quote/i.test(stickyBlock)) {
      issues.push({
        code: "sticky_cta_call_text",
        message: "Sticky CTA is phone-led instead of quote-led",
      });
    }
  }
  return issues;
}

export function assertStickyCtaForSiteSlug(slug: string, root = ROOT): void {
  const issues = reviewStickyCta(slug, root);
  if (issues.length) {
    throw new Error(`sticky_cta failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`);
  }
  console.log("sticky_cta passed.");
}
