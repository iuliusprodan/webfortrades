import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./site_config.js";

export const SITE_DESIGN_SKILL_PATH = path.join(
  ROOT,
  "skills",
  "webfortrades-site-design",
  "SKILL.md"
);

export function readSiteDesignSkill(): string {
  if (!fs.existsSync(SITE_DESIGN_SKILL_PATH)) {
    throw new Error(
      `Missing site design skill: ${SITE_DESIGN_SKILL_PATH}. Required before any site build.`
    );
  }
  return fs.readFileSync(SITE_DESIGN_SKILL_PATH, "utf8");
}

export function requireSiteDesignSkillRead(): { path: string; read: true } {
  readSiteDesignSkill();
  return { path: SITE_DESIGN_SKILL_PATH, read: true };
}
