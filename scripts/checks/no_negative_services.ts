/** Negative service framing check (Pattern C). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NEGATIVE_SERVICE_PATTERNS } from "../copy_voice_constants.js";
import { collectSiteCopyFiles, extractStringLiterals } from "./copy_scan_utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "../..");

export interface CopyCheckIssue {
  code: string;
  message: string;
  file?: string;
}

export function reviewNoNegativeServices(slug: string, root = ROOT): CopyCheckIssue[] {
  const issues: CopyCheckIssue[] = [];
  for (const file of collectSiteCopyFiles(slug, root)) {
    const content = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file);
    for (const str of extractStringLiterals(content)) {
      for (const pattern of NEGATIVE_SERVICE_PATTERNS) {
        if (pattern.test(str)) {
          issues.push({
            code: "negative_service_framing",
            message: `Negative service framing: "${str.slice(0, 100)}"`,
            file: rel,
          });
        }
      }
    }
  }
  return issues;
}

export function assertNoNegativeServicesForSiteSlug(slug: string, root = ROOT): void {
  const issues = reviewNoNegativeServices(slug, root);
  if (issues.length) {
    throw new Error(
      `no_negative_services failed:\n${issues.map((i) => `  - ${i.message}`).join("\n")}`
    );
  }
  console.log("no_negative_services passed.");
}
