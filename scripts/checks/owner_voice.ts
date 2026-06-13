/** Owner / team sections must use first-person voice (Pattern D / 2d). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractStringLiterals, readPageSource, stripTags } from "./copy_scan_utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

const OWNER_SECTION_RE =
  /(?:Who you deal with|About the team|Meet [A-Z][a-z]+|team-person|owner-note|about-team)/i;

const THIRD_PERSON_START =
  /^(reviews|customers|google reviews|he|she|they|[A-Z][a-z]+)\s+(name|names|refer|mention|praise|describe|highlight|also)/i;

export interface CopyCheckIssue {
  code: string;
  message: string;
}

export function reviewOwnerVoice(slug: string, root = ROOT): CopyCheckIssue[] {
  const issues: CopyCheckIssue[] = [];
  const page = readPageSource(slug, root);
  if (!page) return issues;

  const sections = page.split(/<section[\s>]/i).slice(1);
  for (const section of sections) {
    const headingMatch = section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const eyebrowMatch = section.match(/className="[^"]*eyebrow[^"]*"[^>]*>([\s\S]*?)<\//i);
    const heading = stripTags(headingMatch?.[1] ?? eyebrowMatch?.[1] ?? "");
    if (!OWNER_SECTION_RE.test(heading) && !OWNER_SECTION_RE.test(section.slice(0, 400))) continue;

    const bodyStrings = extractStringLiterals(section).filter((s) => s.length > 30);
    const bodyText = bodyStrings.join(" ").trim();
    if (!bodyText) continue;

    const firstSentence = bodyText.split(/(?<=[.!?])\s+/)[0] ?? bodyText;
    const hasFirstPerson = /\b(I'm|I am|I |we |my |our |we're|I'll|we'll)\b/i.test(firstSentence);
    if (!hasFirstPerson) {
      issues.push({
        code: "owner_voice_missing_first_person",
        message: `Owner/team section lacks first-person voice in opening: "${firstSentence.slice(0, 100)}"`,
      });
    }
    if (THIRD_PERSON_START.test(firstSentence.trim())) {
      issues.push({
        code: "owner_voice_third_person",
        message: `Owner/team section opens with third-person observation: "${firstSentence.slice(0, 100)}"`,
      });
    }
  }
  return issues;
}

export function assertOwnerVoiceForSiteSlug(slug: string, root = ROOT): void {
  const issues = reviewOwnerVoice(slug, root);
  if (issues.length) {
    throw new Error(`owner_voice failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`);
  }
  console.log("owner_voice passed.");
}
