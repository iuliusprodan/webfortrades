/** Service section representational icons banned (2f). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPageSource } from "./copy_scan_utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}]/u;
const ALLOWED_MARKERS = /^(?:0[1-9]|[1-9][0-9]|•|◇|○|▢|\d+\.?)$/;

export interface CopyCheckIssue {
  code: string;
  message: string;
}

export function reviewServiceIcons(slug: string, root = ROOT): CopyCheckIssue[] {
  const issues: CopyCheckIssue[] = [];
  const page = readPageSource(slug, root);
  if (!page) return issues;

  const serviceBlocks = [...page.matchAll(
    /data-section-id=["'](?:services|service-explainers)["'][\s\S]*?(?=<section[\s>]|$)/gi
  )].map((m) => m[0]);
  if (!serviceBlocks.length) return issues;

  for (const block of serviceBlocks) {
    if (/<svg[\s\S]*?<\/svg>/i.test(block)) {
      const svgs = block.match(/<svg[\s\S]*?<\/svg>/gi) ?? [];
      for (const svg of svgs) {
        if (/viewBox="0 0 24 24"/i.test(svg) && /(path|circle|rect)/i.test(svg)) {
          issues.push({
            code: "service_representational_icon",
            message: "Service section contains representational SVG icon (use numbers, bullets, or geometric markers only)",
          });
          break;
        }
      }
    }
    const emojiHits = block.match(EMOJI_RE);
    if (emojiHits?.length) {
      issues.push({
        code: "service_emoji_icon",
        message: "Service section contains emoji icons",
      });
    }
  }
  return issues;
}

export function assertServiceIconsForSiteSlug(slug: string, root = ROOT): void {
  const issues = reviewServiceIcons(slug, root);
  if (issues.length) {
    throw new Error(`service_icons failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`);
  }
  console.log("service_icons passed.");
}
