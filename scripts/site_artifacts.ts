import fs from "node:fs";
import path from "node:path";
import { briefDir, loadSiteDesignConfig, type SiteDesignConfig } from "./site_config.js";

export interface SiteArtifact {
  key: string;
  jsonPath: string;
  mdPath: string;
  requiredForBuild: boolean;
  requiredForPitch: boolean;
}

export interface ArtifactCheckResult {
  slug: string;
  present: string[];
  missing: string[];
  allPresent: boolean;
  buildReady: boolean;
  pitchReady: boolean;
  enforcementMode: "warn" | "enforce";
  config: SiteDesignConfig;
}

export function getRequiredSiteArtifacts(slug: string): SiteArtifact[] {
  const dir = briefDir(slug);
  const config = loadSiteDesignConfig();
  return [
    {
      key: "source-evidence",
      jsonPath: path.join(dir, "source-evidence.json"),
      mdPath: path.join(dir, "source-evidence.md"),
      requiredForBuild: config.require_source_evidence,
      requiredForPitch: true,
    },
    {
      key: "site-strategy",
      jsonPath: path.join(dir, "site-strategy.json"),
      mdPath: path.join(dir, "site-strategy.md"),
      requiredForBuild: config.require_site_strategy,
      requiredForPitch: true,
    },
    {
      key: "section-plan",
      jsonPath: path.join(dir, "section-plan.json"),
      mdPath: path.join(dir, "section-plan.md"),
      requiredForBuild: config.require_section_plan,
      requiredForPitch: true,
    },
    {
      key: "creative-brief",
      jsonPath: path.join(dir, "creative-brief.json"),
      mdPath: path.join(dir, "creative-brief.md"),
      requiredForBuild: true,
      requiredForPitch: true,
    },
    {
      key: "pitch-insight",
      jsonPath: path.join(dir, "pitch-insight.json"),
      mdPath: path.join(dir, "pitch-insight.md"),
      requiredForBuild: false,
      requiredForPitch: config.require_pitch_insight,
    },
    {
      key: "brief",
      jsonPath: path.join(dir, "brief.json"),
      mdPath: path.join(dir, "brief.md"),
      requiredForBuild: true,
      requiredForPitch: true,
    },
  ];
}

function artifactPresent(artifact: SiteArtifact): boolean {
  if (artifact.key === "brief") {
    return fs.existsSync(artifact.jsonPath);
  }
  return fs.existsSync(artifact.jsonPath) && fs.existsSync(artifact.mdPath);
}

export function checkSiteArtifacts(slug: string): ArtifactCheckResult {
  const config = loadSiteDesignConfig();
  const artifacts = getRequiredSiteArtifacts(slug);
  const present: string[] = [];
  const missing: string[] = [];

  for (const a of artifacts) {
    if (artifactPresent(a)) present.push(a.key);
    else missing.push(a.key);
  }

  const buildRequired = artifacts.filter((a) => a.requiredForBuild);
  const pitchRequired = artifacts.filter((a) => a.requiredForPitch);
  const buildReady = buildRequired.every((a) => present.includes(a.key));
  const pitchReady = pitchRequired.every((a) => present.includes(a.key));

  return {
    slug,
    present,
    missing,
    allPresent: missing.length === 0,
    buildReady,
    pitchReady,
    enforcementMode: config.skill_enforced ? "enforce" : "warn",
    config,
  };
}

export interface RequireSiteArtifactsOptions {
  forPitch?: boolean;
  silent?: boolean;
}

export function requireSiteArtifacts(
  slug: string,
  options?: RequireSiteArtifactsOptions & { enforce?: boolean }
): ArtifactCheckResult {
  const result = checkSiteArtifacts(slug);
  const config = result.config;
  const enforced = options?.enforce === true || config.skill_enforced;
  result.enforcementMode = enforced ? "enforce" : "warn";

  const ready = options?.forPitch ? result.pitchReady : result.buildReady;

  if (!options?.silent) {
    logArtifactStatus(result);
  }

  if (enforced && !ready) {
    const scope = options?.forPitch ? "READY_TO_PITCH" : "build";
    throw new Error(
      `Site design skill enforcement (${scope}): missing artifacts for ${slug}: ${result.missing.join(", ")}. Run npm run site:prepare -- --slug ${slug}`
    );
  }

  if (result.enforcementMode === "warn" && !ready) {
    console.warn(
      `\n⚠ Site design artifacts incomplete for ${slug} (warn mode, build continues).`
    );
    console.warn(`  Missing: ${result.missing.join(", ")}`);
    console.warn(`  Run: npm run site:prepare -- --slug ${slug}\n`);
  }

  return result;
}

export function logArtifactStatus(result: ArtifactCheckResult): void {
  console.log(`Site design artifacts (${result.slug}):`);
  console.log(`  Enforcement: ${result.enforcementMode} (skill_enforced=${result.config.skill_enforced})`);
  console.log(`  Present: ${result.present.join(", ") || "none"}`);
  console.log(`  Missing: ${result.missing.join(", ") || "none"}`);
  console.log(`  Build ready: ${result.buildReady ? "yes" : "no"}`);
  console.log(`  Pitch ready: ${result.pitchReady ? "yes" : "no"}`);
}

export function formatArtifactNotes(result: ArtifactCheckResult): string {
  return [
    `- Site design skill enforcement: ${result.enforcementMode} (skill_enforced=${result.config.skill_enforced})`,
    `- Artifacts present: ${result.present.join(", ") || "none"}`,
    `- Artifacts missing: ${result.missing.join(", ") || "none"}`,
  ].join("\n");
}
