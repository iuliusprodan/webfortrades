import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getLeadBySlug, getNextDeployableLead, updateLead } from "./db.js";
import { syncLibraryFromSite } from "./library_sync.js";
import { contactabilityBlocksPipeline } from "./contactability.js";
import {
  aliasCandidatesFromBrief,
  disableDeploymentProtection,
  extractDeploymentUrl,
  resolveVerifiedAlias,
  saveDeployManifest,
  verifyDeployedSite,
  type AliasResolutionResult,
} from "./vercel_alias.js";
import {
  verifyLiveStyle,
  saveStyleVerifyManifest,
} from "./style_verify.js";
import { evaluateSectionIntegrityHtml } from "./checks/section_integrity.js";

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

function parseArgs(): {
  slug?: string;
  allowManualReview?: boolean;
  verifyUrlOnly?: boolean;
  skipLiveStyleVerify?: boolean;
} {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let allowManualReview = false;
  let verifyUrlOnly = false;
  let skipLiveStyleVerify = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--allow-manual-review") allowManualReview = true;
    else if (args[i] === "--verify-url-only") verifyUrlOnly = true;
    else if (args[i] === "--skip-live-style-verify") skipLiveStyleVerify = true;
  }
  return { slug, allowManualReview, verifyUrlOnly, skipLiveStyleVerify };
}

function resolveVercelAuth(env: Record<string, string | undefined>): {
  token?: string;
  scope?: string;
  mode: "token" | "cli";
} {
  const token = env.VERCEL_TOKEN?.trim();
  const scope = env.VERCEL_SCOPE?.trim() || env.VERCEL_TEAM?.trim();
  if (token) return { token, scope, mode: "token" };

  try {
    execSync("npx vercel@latest whoami", { stdio: "pipe", encoding: "utf8" });
    return { scope, mode: "cli" };
  } catch {
    throw new Error(
      "Cannot deploy: set VERCEL_TOKEN in .env or run `npx vercel login` first."
    );
  }
}

function loadSiteMeta(siteDir: string): {
  buildId: string;
  webfortradesSlug: string;
  title: string;
  metadataBase: string;
} {
  const metaPath = path.join(siteDir, "data", "site-metadata.json");
  if (!fs.existsSync(metaPath)) {
    throw new Error(`Missing ${metaPath}. Run build:site first.`);
  }
  return JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
    buildId: string;
    webfortradesSlug: string;
    title: string;
    metadataBase: string;
  };
}

function loadSiteBrief(siteDir: string): {
  business_name: string;
  phone: string | null;
  based_location?: string | null;
  address?: string | null;
  service_area?: string[];
} {
  const briefPath = path.join(siteDir, "data", "brief.json");
  return JSON.parse(fs.readFileSync(briefPath, "utf8")) as {
    business_name: string;
    phone: string | null;
    based_location?: string | null;
    address?: string | null;
    service_area?: string[];
  };
}

function appendDeployNotes(
  siteDir: string,
  resolution: AliasResolutionResult,
  manifestPath: string
): void {
  const notesPath = path.join(siteDir, "build-notes.md");
  let notes = fs.existsSync(notesPath) ? fs.readFileSync(notesPath, "utf8") : "";
  const block = `

## Deploy verification (${new Date().toISOString().slice(0, 10)})
- Preferred alias: ${resolution.preferredAlias}.vercel.app
- Deployment URL: ${resolution.deploymentUrl}
- Verified URL: ${resolution.verifiedUrl ?? "none"}
- Alias status: ${resolution.aliasStatus}
- Deploy manifest: \`${manifestPath}\`
- Marker found: ${resolution.verification?.markerFound ? "yes" : "no"}
- Business name verified: ${resolution.verification?.businessNameFound ? "yes" : "no"}
- Phone verified: ${resolution.verification?.phoneFound ? "yes" : "no"}
`;
  if (!notes.includes("## Deploy verification")) {
    notes += block;
  } else {
    notes = notes.replace(/## Deploy verification[\s\S]*?(?=\n## |\n$|$)/, block.trim());
  }
  fs.writeFileSync(notesPath, notes);
}

function printCandidateReport(resolution: AliasResolutionResult): void {
  console.log("\nAlias candidates:");
  for (const c of resolution.candidates) {
    const parts = [
      c.hostname,
      `preflight=${c.preflight}`,
      c.assign ? `assign=${c.assign}` : null,
      c.verify ? `verify=${c.verify}` : null,
    ].filter(Boolean);
    console.log(`  - ${parts.join(", ")}${c.detail ? ` (${c.detail})` : ""}`);
  }
}

async function runDeploy(
  slug: string,
  lead: NonNullable<ReturnType<typeof getLeadBySlug>>,
  options: { skipLiveStyleVerify?: boolean } = {}
): Promise<void> {
  const env = { ...loadEnv(), ...process.env };
  const auth = resolveVercelAuth(env);
  const siteDir = path.join(ROOT, "sites", slug);
  const brief = loadSiteBrief(siteDir);
  const meta = loadSiteMeta(siteDir);

  if (!meta.buildId || !meta.webfortradesSlug) {
    throw new Error("site-metadata.json missing buildId or webfortradesSlug. Rebuild the site.");
  }

  console.log(`Building sites/${slug}...`);
  execSync("npm run build", { cwd: siteDir, stdio: "inherit" });

  const indexHtml = path.join(siteDir, "out", "index.html");
  if (fs.existsSync(indexHtml)) {
    const integrityIssues = evaluateSectionIntegrityHtml(fs.readFileSync(indexHtml, "utf8")).filter(
      (i) => i.severity === "error"
    );
    if (integrityIssues.length) {
      console.error("Section integrity check failed on built HTML:");
      for (const issue of integrityIssues) {
        console.error(`  [error] ${issue.message}`);
      }
      throw new Error("Section integrity check failed. Fix before deploy.");
    }
    console.log("Section integrity check passed (built HTML).");
  }

  const projectName = slug.slice(0, 63);
  console.log(`Deploying to Vercel (project: ${projectName})...`);

  const deployParts = [
    "npx",
    "vercel@latest",
    "deploy",
    "--prod",
    "--yes",
    `--name=${projectName}`,
  ];
  if (auth.scope) deployParts.push(`--scope=${auth.scope}`);
  if (auth.token) deployParts.push(`--token=${auth.token}`);

  const deployEnv = auth.token
    ? { ...process.env, VERCEL_TOKEN: auth.token }
    : { ...process.env };

  let deployOutput = "";
  try {
    deployOutput = execSync(deployParts.join(" "), {
      cwd: siteDir,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      env: deployEnv,
    });
    process.stdout.write(deployOutput);
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    deployOutput = [e.stdout, e.stderr].filter(Boolean).join("\n");
    if (deployOutput) process.stderr.write(deployOutput);
    throw err;
  }

  const deploymentUrl = extractDeploymentUrl(deployOutput);
  if (!deploymentUrl) {
    throw new Error("Could not parse deployment URL from Vercel CLI output");
  }

  console.log(`\nDeployment URL: ${deploymentUrl}`);

  const protection = await disableDeploymentProtection(projectName, {
    token: auth.token,
    scope: auth.scope,
  });
  if (protection.ok) {
    console.log("Deployment protection disabled for public prospect URL.");
  } else if (protection.detail) {
    console.warn(`Could not disable deployment protection: ${protection.detail}`);
  }

  const candidates = aliasCandidatesFromBrief(slug, brief);
  console.log(`Alias candidates: ${candidates.join(", ")}`);

  const resolution = await resolveVerifiedAlias({
    slug,
    deploymentUrl,
    candidates,
    expected: {
      slug,
      businessName: brief.business_name,
      phone: brief.phone,
      buildId: meta.buildId,
    },
    auth: { token: auth.token, scope: auth.scope },
    siteDir,
  });

  printCandidateReport(resolution);

  const manifestPath = saveDeployManifest(ROOT, slug, resolution);
  appendDeployNotes(siteDir, resolution, manifestPath);

  if (resolution.aliasStatus !== "VERIFIED" || !resolution.verifiedUrl) {
    console.error("\nDeploy FAILED: alias verification did not pass.");
    if (resolution.verification?.errors.length) {
      for (const e of resolution.verification.errors) console.error(`  ${e}`);
    }
    updateLead(lead.id, {
      state: "REVIEWED",
      deployment_url: deploymentUrl,
      alias_status: resolution.aliasStatus,
      verified_site_url: null,
      build_id: meta.buildId,
      site_url: null,
    });
    process.exit(1);
  }

  const verifiedUrl = resolution.verifiedUrl.replace(/\/$/, "");

  if (options.skipLiveStyleVerify) {
    console.log("\nSkipping live style verification (--skip-live-style-verify).");
    if (meta.metadataBase !== verifiedUrl) {
      meta.metadataBase = verifiedUrl;
      fs.writeFileSync(
        path.join(siteDir, "data", "site-metadata.json"),
        JSON.stringify(meta, null, 2) + "\n"
      );
    }
    updateLead(lead.id, {
      state: "DEPLOYED",
      site_url: verifiedUrl,
      verified_site_url: verifiedUrl,
      deployment_url: deploymentUrl,
      alias_status: "VERIFIED",
      build_id: meta.buildId,
    });
    console.log(`\n✓ Verified URL: ${verifiedUrl}`);
    console.log("✓ OG metadata deploy complete (style verify skipped)");
    return;
  }

  // Live visual integrity check. The marker/name/phone checks above prove the
  // alias points at our deployment, but not that the page is actually styled.
  // A site that renders as raw HTML (e.g. globals.css not bundled) must NOT
  // be allowed to reach DEPLOYED / READY_TO_PITCH.
  console.log(`\nVerifying live style at ${verifiedUrl} ...`);
  const liveScreenshot = path.join(
    ROOT,
    "screenshots",
    slug,
    "live-verify.png"
  );
  const style = await verifyLiveStyle(verifiedUrl, {
    screenshotPath: liveScreenshot,
  });
  const styleManifest = saveStyleVerifyManifest(ROOT, slug, style);
  for (const issue of style.issues) {
    console.log(`  [${issue.severity}] ${issue.message}`);
  }
  console.log(`  Live screenshot: ${style.screenshotPath ?? "none"}`);
  console.log(`  Style manifest: ${styleManifest}`);

  if (!style.ok) {
    console.error(
      "\nDeploy FAILED: live style verification did not pass (site renders unstyled or assets broken)."
    );
    updateLead(lead.id, {
      state: "REVIEWED",
      deployment_url: deploymentUrl,
      alias_status: resolution.aliasStatus,
      verified_site_url: null,
      site_url: null,
      build_id: meta.buildId,
      style_verified: 0,
      style_verified_at: new Date().toISOString(),
      style_verify_notes: style.issues
        .filter((i) => i.severity === "error")
        .map((i) => i.message)
        .join("; "),
    });
    process.exit(1);
  }

  if (meta.metadataBase !== verifiedUrl) {
    meta.metadataBase = verifiedUrl;
    fs.writeFileSync(
      path.join(siteDir, "data", "site-metadata.json"),
      JSON.stringify(meta, null, 2) + "\n"
    );
  }

  updateLead(lead.id, {
    state: "DEPLOYED",
    site_url: verifiedUrl,
    verified_site_url: verifiedUrl,
    deployment_url: deploymentUrl,
    alias_status: "VERIFIED",
    build_id: meta.buildId,
    style_verified: 1,
    style_verified_at: new Date().toISOString(),
    style_verify_notes: null,
  });

  syncLibraryFromSite(slug, siteDir, lead, verifiedUrl);

  console.log(`\n✓ Verified URL: ${verifiedUrl}`);
  console.log(`✓ Style verified: yes (live render)`);
  console.log(`✓ Alias status: ${resolution.aliasStatus}`);
  console.log(`✓ Marker: ${resolution.verification?.markerFound ? "yes" : "no"}`);
  console.log(`✓ Business name: ${resolution.verification?.businessNameFound ? "yes" : "no"}`);
  console.log(`✓ Phone: ${resolution.verification?.phoneFound ? "yes" : "no"}`);
  console.log(`✓ State → DEPLOYED (lead id=${lead.id}, ${lead.business_name})`);
}

async function runVerifyOnly(slug: string, lead: NonNullable<ReturnType<typeof getLeadBySlug>>): Promise<void> {
  const env = { ...loadEnv(), ...process.env };
  const auth = resolveVercelAuth(env);
  const siteDir = path.join(ROOT, "sites", slug);
  const brief = loadSiteBrief(siteDir);
  const meta = loadSiteMeta(siteDir);
  const url = lead.verified_site_url ?? lead.site_url;
  if (!url) {
    console.error("No site_url or verified_site_url on lead.");
    process.exit(1);
  }

  const verification = await verifyDeployedSite(
    url,
    {
      slug,
      businessName: brief.business_name,
      phone: brief.phone,
      buildId: meta.buildId,
    },
    { siteDir, auth: { token: auth.token, scope: auth.scope } }
  );

  console.log(`\nVerify ${url}`);
  console.log(`  Marker: ${verification.markerFound ? "yes" : "no"}`);
  console.log(`  Business: ${verification.businessNameFound ? "yes" : "no"}`);
  console.log(`  Phone: ${verification.phoneFound ? "yes" : "no"}`);

  if (!verification.ok) {
    console.error("\nVerification FAILED:");
    for (const e of verification.errors) console.error(`  ${e}`);
    process.exit(1);
  }

  console.log("\n✓ URL verified as our deployment");

  console.log(`\nVerifying live style at ${url} ...`);
  const liveScreenshot = path.join(ROOT, "screenshots", slug, "live-verify.png");
  const style = await verifyLiveStyle(url, { screenshotPath: liveScreenshot });
  saveStyleVerifyManifest(ROOT, slug, style);
  for (const issue of style.issues) {
    console.log(`  [${issue.severity}] ${issue.message}`);
  }
  console.log(`  Live screenshot: ${style.screenshotPath ?? "none"}`);
  if (!style.ok) {
    console.error("\nStyle verification FAILED: site renders unstyled or assets broken.");
    updateLead(lead.id, {
      style_verified: 0,
      style_verified_at: new Date().toISOString(),
      style_verify_notes: style.issues
        .filter((i) => i.severity === "error")
        .map((i) => i.message)
        .join("; "),
    });
    process.exit(1);
  }
  updateLead(lead.id, {
    style_verified: 1,
    style_verified_at: new Date().toISOString(),
    style_verify_notes: null,
  });
  console.log("✓ Live style verified");
}

async function main(): Promise<void> {
  const { slug: slugArg, allowManualReview, verifyUrlOnly, skipLiveStyleVerify } =
    parseArgs();
  const lead = slugArg ? getLeadBySlug(slugArg) : getNextDeployableLead();

  if (!lead?.slug) {
    console.error("No deployable lead (REVIEWED or BUILT). Run build:site and review first.");
    process.exit(1);
  }

  if (!verifyUrlOnly) {
    const blockReason = contactabilityBlocksPipeline(lead, { allowManualReview });
    if (blockReason) {
      console.error(
        `Deploy blocked for ${lead.business_name}: ${blockReason}\nUse --allow-manual-review to override NEEDS_MANUAL_REVIEW only.`
      );
      process.exit(1);
    }
  }

  const siteDir = path.join(ROOT, "sites", lead.slug);
  if (!fs.existsSync(path.join(siteDir, "package.json"))) {
    console.error(`Site folder not found: ${siteDir}`);
    process.exit(1);
  }

  if (verifyUrlOnly) {
    await runVerifyOnly(lead.slug, lead);
    return;
  }

  await runDeploy(lead.slug, lead, { skipLiveStyleVerify });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
