/**
 * Sentence-level meta-provenance check (Pattern B).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  META_PROVENANCE_INLINE,
  META_PROVENANCE_SENTENCE_START,
} from "../copy_voice_constants.js";
import {
  collectSiteCopyFiles,
  extractStringLiterals,
  splitSentences,
} from "./copy_scan_utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

export interface CopyCheckIssue {
  code: string;
  message: string;
  file?: string;
  excerpt?: string;
}

export function reviewNoMetaProvenance(slug: string, root = ROOT): CopyCheckIssue[] {
  const issues: CopyCheckIssue[] = [];
  for (const file of collectSiteCopyFiles(slug, root)) {
    const content = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file);
    for (const str of extractStringLiterals(content)) {
      for (const sentence of splitSentences(str)) {
        const norm = sentence.trim();
        if (META_PROVENANCE_SENTENCE_START.test(norm)) {
          issues.push({
            code: "meta_provenance_sentence_start",
            message: `Sentence starts with review/listing meta-provenance: "${norm.slice(0, 80)}..."`,
            file: rel,
            excerpt: norm.slice(0, 120),
          });
        }
        if (META_PROVENANCE_INLINE.test(norm)) {
          issues.push({
            code: "meta_provenance_inline",
            message: `Sentence cites listing/reviews as source: "${norm.slice(0, 80)}..."`,
            file: rel,
            excerpt: norm.slice(0, 120),
          });
        }
      }
    }
  }
  return issues;
}

export function assertNoMetaProvenanceForSiteSlug(slug: string, root = ROOT): void {
  const issues = reviewNoMetaProvenance(slug, root);
  if (issues.length) {
    throw new Error(
      `no_meta_provenance failed (${issues.length} issue(s)):\n${issues.map((i) => `  - ${i.message}`).join("\n")}`
    );
  }
  console.log("no_meta_provenance passed.");
}
