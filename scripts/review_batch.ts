import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLeadBySlug } from "./db.js";
import {
  loadDesignFingerprint,
  compareFingerprints,
  creativeUniquenessScore,
} from "./design_review.js";
import { loadCreativeBrief } from "./creative_brief.js";
import { evaluatePitchReadiness } from "./pitch_gate.js";
import {
  loadDeployManifest,
  verifyDeployedSite,
  type VercelAuth,
} from "./vercel_alias.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function loadEnv(): Record<string, string> {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return {};
  const vars: Record<string, string> = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

function vercelAuthFromEnv(): VercelAuth {
  const env = { ...loadEnv(), ...process.env };
  return {
    token: env.VERCEL_TOKEN?.trim(),
    scope: env.VERCEL_SCOPE?.trim() || env.VERCEL_TEAM?.trim(),
  };
}

function parseArgs(): { batch?: string } {
  const args = process.argv.slice(2);
  let batch: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--batch" && args[i + 1]) batch = args[++i];
  }
  return { batch };
}

interface BatchFile {
  slugs?: string[];
  sites?: { slug: string }[];
}

function loadBatchSlugs(batchPath: string): string[] {
  const abs = path.isAbsolute(batchPath) ? batchPath : path.join(ROOT, batchPath);
  if (!fs.existsSync(abs)) {
    console.error(`Batch file not found: ${abs}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(abs, "utf8")) as BatchFile;
  if (data.slugs?.length) return data.slugs;
  if (data.sites?.length) return data.sites.map((s) => s.slug);
  console.error("Batch file has no slugs");
  process.exit(1);
}

async function main(): Promise<void> {
  const { batch } = parseArgs();
  if (!batch) {
    console.error("Usage: npm run review:batch -- --batch data/batch-site-run-2026-06-09.json");
    process.exit(1);
  }

  const slugs = loadBatchSlugs(batch);
  const auth = vercelAuthFromEnv();
  const fingerprints = slugs
    .map((slug) => loadDesignFingerprint(ROOT, slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof loadDesignFingerprint>>[];

  const errors: string[] = [];
  const warns: string[] = [];

  if (fingerprints.length >= 2) {
    for (let i = 0; i < fingerprints.length; i++) {
      for (let j = i + 1; j < fingerprints.length; j++) {
        for (const issue of compareFingerprints(fingerprints[i]!, fingerprints[j]!)) {
          if (issue.severity === "error") errors.push(issue.message);
          else warns.push(issue.message);
        }
      }
    }
  }

  const score = fingerprints.length >= 2 ? creativeUniquenessScore(fingerprints) : 100;

  console.log(`\nBatch QA: ${slugs.join(", ")}`);
  console.log(`Creative uniqueness score: ${score}/100\n`);

  for (const slug of slugs) {
    const fp = fingerprints.find((f) => f.slug === slug);
    const cb = loadCreativeBrief(ROOT, slug);
    const lead = getLeadBySlug(slug);
    const deploy = loadDeployManifest(ROOT, slug);
    const metaPath = path.join(ROOT, "sites", slug, "data", "site-metadata.json");
    const briefPath = path.join(ROOT, "sites", slug, "data", "brief.json");

    console.log(`--- ${slug} ---`);
    if (fp) {
      console.log(`  Palette accent: ${fp.paletteAccent}`);
      console.log(`  Fonts: ${fp.fontPairKey}`);
      console.log(`  Layout: ${fp.layoutFamily}`);
      console.log(`  Hero: ${fp.heroHeadline}`);
    }
    if (cb) {
      console.log(`  Location: ${cb.actual_city_town} (${cb.location_validation_status})`);
    }

    const url = lead?.verified_site_url ?? deploy?.verified_url ?? lead?.site_url;
    console.log(`  Reported URL: ${lead?.site_url ?? "none"}`);
    console.log(`  Verified URL: ${lead?.verified_site_url ?? deploy?.verified_url ?? "none"}`);
    console.log(`  Alias status: ${lead?.alias_status ?? deploy?.alias_status ?? "unknown"}`);

    if (!url) {
      errors.push(`${slug}: no deploy URL`);
      console.log("");
      continue;
    }

    if (!fs.existsSync(metaPath) || !fs.existsSync(briefPath)) {
      errors.push(`${slug}: missing site metadata or brief`);
      console.log("");
      continue;
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as { buildId: string };
    const brief = JSON.parse(fs.readFileSync(briefPath, "utf8")) as {
      business_name: string;
      phone: string | null;
    };

    const verification = await verifyDeployedSite(
      url,
      {
        slug,
        businessName: brief.business_name,
        phone: brief.phone,
        buildId: meta.buildId,
      },
      { siteDir: path.join(ROOT, "sites", slug), auth }
    );

    console.log(`  URL verification: ${verification.ok ? "PASS" : "FAIL"}`);
    console.log(`  Marker: ${verification.markerFound ? "yes" : "no"}`);
    console.log(`  Business: ${verification.businessNameFound ? "yes" : "no"}`);
    console.log(`  Phone: ${verification.phoneFound ? "yes" : "no"}`);

    if (!verification.ok) {
      for (const e of verification.errors) errors.push(`${slug}: ${e}`);
    }

    if (lead) {
      const pitch = evaluatePitchReadiness(ROOT, lead);
      console.log(`  READY_TO_PITCH: ${pitch.ready ? "yes" : "no"}`);
      if (!pitch.ready) {
        for (const b of pitch.blockers) warns.push(`${slug} pitch blocked: ${b}`);
      }
    }

    console.log("");
  }

  if (warns.length) {
    console.log("Warnings:");
    for (const w of warns) console.log(`  [warn] ${w}`);
  }

  if (errors.length) {
    console.error("\nBatch review FAILED:");
    for (const e of errors) console.error(`  [error] ${e}`);
    process.exit(1);
  }

  if (score < 60) {
    console.error(`\nBatch review FAILED: uniqueness score ${score} below threshold (60)`);
    process.exit(1);
  }

  console.log(`\n✓ Batch review passed (uniqueness ${score}/100, all URLs verified)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
