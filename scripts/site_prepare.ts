import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runSourceEvidenceCli } from "./source_evidence.js";
import { runSiteStrategyCli } from "./site_strategy.js";
import { runSectionPlannerCli } from "./section_planner.js";
import { runPitchInsightCli } from "./pitch_insight.js";
import { checkSiteArtifacts, logArtifactStatus } from "./site_artifacts.js";
import { requireSiteDesignSkillRead } from "./site_design_skill.js";
import { briefDir } from "./site_config.js";

function parseArgs(): { slug?: string } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }
  return { slug };
}

export function runSitePrepare(slug: string): void {
  const skill = requireSiteDesignSkillRead();
  console.log(`Read site design skill: ${skill.path}`);

  ensureBriefMd(slug);

  console.log("\n1/4 Source evidence...");
  runSourceEvidenceCli(slug);

  console.log("\n2/4 Site strategy...");
  runSiteStrategyCli(slug);

  console.log("\n3/4 Section plan...");
  runSectionPlannerCli(slug);

  console.log("\n4/4 Pitch insight...");
  runPitchInsightCli(slug);

  console.log("\nArtifact check:");
  const status = checkSiteArtifacts(slug);
  logArtifactStatus(status);

  if (!status.pitchReady) {
    console.warn("Pitch artifacts still incomplete after prepare.");
  } else {
    console.log("All prepare artifacts present.");
  }
}

function ensureBriefMd(slug: string): void {
  const jsonPath = path.join(briefDir(slug), "brief.json");
  const mdPath = path.join(briefDir(slug), "brief.md");
  if (!fs.existsSync(jsonPath) || fs.existsSync(mdPath)) return;
  const brief = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as {
    business_name: string;
    phone?: string | null;
    address?: string;
  };
  fs.writeFileSync(
    mdPath,
    `# Brief - ${brief.business_name}\n\n- Phone: ${brief.phone ?? "none"}\n- Address: ${brief.address ?? "none"}\n\nSee brief.json for full gather data.\n`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { slug } = parseArgs();
  if (!slug) {
    console.error("Usage: npm run site:prepare -- --slug <slug>");
    process.exit(1);
  }
  runSitePrepare(slug);
}
