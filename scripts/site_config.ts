import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "..");

export interface SiteDesignConfig {
  skill_enforced: boolean;
  require_source_evidence: boolean;
  require_site_strategy: boolean;
  require_section_plan: boolean;
  require_pitch_insight: boolean;
  clone_review_enabled: boolean;
  text_only_wordmarks: boolean;
  ban_owner_name_section_titles: boolean;
  require_section_variation_matrix: boolean;
  od_port_use_next_build_only: boolean;
}

const DEFAULT_SITE_DESIGN: SiteDesignConfig = {
  skill_enforced: false,
  require_source_evidence: true,
  require_site_strategy: true,
  require_section_plan: true,
  require_pitch_insight: true,
  clone_review_enabled: true,
  text_only_wordmarks: false,
  ban_owner_name_section_titles: false,
  require_section_variation_matrix: false,
  od_port_use_next_build_only: false,
};

export function loadSiteDesignConfig(): SiteDesignConfig {
  const configPath = path.join(ROOT, "config.yaml");
  if (!fs.existsSync(configPath)) return { ...DEFAULT_SITE_DESIGN };
  const raw = parseYaml(fs.readFileSync(configPath, "utf8")) as {
    site_design?: Partial<SiteDesignConfig>;
  };
  return { ...DEFAULT_SITE_DESIGN, ...raw.site_design };
}

export function briefDir(slug: string): string {
  return path.join(ROOT, "briefs", slug);
}

export const OD_PORT_MARKER = ".od-port";

export function hasOpenDesignPort(siteDir: string): boolean {
  return fs.existsSync(path.join(siteDir, OD_PORT_MARKER));
}
