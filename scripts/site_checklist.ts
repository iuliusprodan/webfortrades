import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

export const SITE_BUILD_CHECKLIST_PATH = path.join(
  ROOT,
  "prompts",
  "site-build-checklist.md"
);

export const SITE_DESIGN_SKILL_PATH = path.join(
  ROOT,
  "skills",
  "webfortrades-site-design",
  "SKILL.md"
);

export function requireSiteBuildChecklist(): string {
  if (!fs.existsSync(SITE_BUILD_CHECKLIST_PATH)) {
    throw new Error(
      "Missing required file: prompts/site-build-checklist.md. Create it before building."
    );
  }
  return fs.readFileSync(SITE_BUILD_CHECKLIST_PATH, "utf8");
}

export function buildNotesMentionsChecklist(notes: string): boolean {
  return /site-build-checklist\.md/i.test(notes);
}
