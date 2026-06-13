/** Identity contamination: review names vs brief owner/team (2l, WARN only). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadBriefJson, readPageSource, extractStringLiterals } from "./copy_scan_utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

export interface IdentityIssue {
  code: string;
  message: string;
  severity: "warn";
}

function knownNames(brief: Record<string, unknown>): Set<string> {
  const names = new Set<string>();
  const owner = brief.owner_name as string | null | undefined;
  if (owner) names.add(owner.split(/\s+/)[0]!.toLowerCase());
  const team = (brief.team_member_names as string[] | undefined) ?? [];
  for (const n of team) names.add(n.split(/\s+/)[0]!.toLowerCase());
  const contact = brief.contact_name as string | null | undefined;
  if (contact && contact.length > 2 && contact !== "Definitely") {
    names.add(contact.split(/\s+/)[0]!.toLowerCase());
  }
  const business = (brief.business_name as string | undefined) ?? "";
  for (const part of business.split(/[\s,-]+/)) {
    if (/^[A-Z][a-z]{2,}$/.test(part)) names.add(part.toLowerCase());
  }
  return names;
}

export function reviewIdentityReviewNames(slug: string, root = ROOT): IdentityIssue[] {
  const issues: IdentityIssue[] = [];
  const brief = loadBriefJson(slug, root);
  const allowed = knownNames(brief);
  const page = readPageSource(slug, root);
  if (!page) return issues;

  const reviews = (brief.reviews as { text: string; reviewer: string }[] | undefined) ?? [];
  for (const str of extractStringLiterals(page)) {
    if (str.length < 40 || !/review|Google|Customer/i.test(page)) continue;
    const nameInText = str.match(/\b([A-Z][a-z]{2,})\b/g) ?? [];
    for (const name of nameInText) {
      const lower = name.toLowerCase();
      if (allowed.has(lower)) continue;
      if (/^(Google|Customer|Leeds|Cardiff|Bristol|Manchester|Sheffield|Newcastle|Glasgow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Skip|Request|Send|Website|WebForTrades)$/i.test(name)) continue;
      const inBriefReview = reviews.some((r) => r.text.includes(name) || r.reviewer.includes(name));
      if (inBriefReview && !allowed.has(lower)) {
        issues.push({
          severity: "warn",
          code: "review_name_not_in_team",
          message: `Review copy names "${name}" who is not in brief owner_name/team_member_names — manual review (${slug})`,
        });
      }
    }
  }
  return [...new Map(issues.map((i) => [i.message, i])).values()];
}

export function warnIdentityReviewNamesForSiteSlug(slug: string, root = ROOT): void {
  const issues = reviewIdentityReviewNames(slug, root);
  for (const i of issues) console.warn(`identity_review_names [warn]: ${i.message}`);
  if (issues.length === 0) console.log("identity_review_names: no warnings.");
}
