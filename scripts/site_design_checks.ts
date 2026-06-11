import type { StyleIssue } from "./style_verify.js";

const OWNER_TITLE_RE = /customers mention .+ by name/i;
const LOGO_IMG_RE = /<img[^>]+class="[^"]*(?:logo|wordmark|brand-mark)[^"]*"/i;
const HEADER_LOGO_IMG_RE = /<header[\s\S]*?<img[^>]+(?:logo|wordmark)/i;

export function evaluateTextOnlyWordmarksHtml(html: string): StyleIssue[] {
  const issues: StyleIssue[] = [];
  if (LOGO_IMG_RE.test(html) || HEADER_LOGO_IMG_RE.test(html)) {
    issues.push({
      severity: "error",
      message:
        "site_design.text_only_wordmarks: raster logo or wordmark image found; use display typeface text only",
    });
  }
  return issues;
}

export function evaluateOwnerNameSectionTitleBanHtml(html: string): StyleIssue[] {
  const issues: StyleIssue[] = [];
  const headingMatches = html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);
  for (const match of headingMatches) {
    const text = (match[1] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (OWNER_TITLE_RE.test(text)) {
      issues.push({
        severity: "error",
        message: `site_design.ban_owner_name_section_titles: banned owner-name section title "${text}"`,
      });
    }
  }
  return issues;
}
