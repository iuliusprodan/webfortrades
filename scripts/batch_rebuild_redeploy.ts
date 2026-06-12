#!/usr/bin/env tsx
/** Rebuild and redeploy batch sites after image copy. C=3 deploy. 30s heartbeats. */
import fs from "node:fs";
import path from "node:path";
import { runPool, runCommand } from "./concurrency.js";
import { loadBatchConfig } from "./batch_config.js";
import { ROOT } from "./site_config.js";

const BATCH_ID = "2026-06-11-ten-build";
const BATCH_DIR = path.join(ROOT, "data", "batches", BATCH_ID);
const DEPLOY_ONLY = process.argv.includes("--deploy-only");
const SLUGS = process.argv
  .slice(2)
  .filter((a) => !a.startsWith("--"));
const DEFAULT_SLUGS = [
      "rm-electrical",
      "a-m-t-roofing-penarth",
      "ellis-plumbing-heating-services-birmingham",
      "heattech-gas-services-ltd",
      "the-lock-dr",
      "chestnut-trees-fencing",
      "edgar-landscapes-driveways-ltd",
      "painters-force-ltd",
      "tom-baker-plumbing-and-gas-solutions",
      "m-ross-building-services",
    ];
const SLUG_LIST = SLUGS.length ? SLUGS : DEFAULT_SLUGS;

const startedAt = Date.now();
let done = 0;
let inFlight = 0;
let last = "starting";

function ts(): string {
  return new Date().toTimeString().slice(0, 8);
}

function heartbeat(): void {
  const elapsed = Math.round((Date.now() - startedAt) / 60000);
  const line = `[${ts()}] step=${DEPLOY_ONLY ? "deploy-only" : "rebuild-redeploy"} done=${done}/${SLUG_LIST.length} in_flight=${inFlight} elapsed_total=${elapsed} last=${last}`;
  console.log(line);
  fs.appendFileSync(path.join(BATCH_DIR, "image-fix-heartbeat.log"), line + "\n");
}

async function rebuildSlug(slug: string, slot: number): Promise<boolean> {
  const siteDir = path.join(ROOT, "sites", slug);
  const logFile = path.join(BATCH_DIR, "jobs", `${slug}.log`);
  if (!fs.existsSync(siteDir)) {
    last = `${slug} skip no site`;
    return false;
  }
  if (!DEPLOY_ONLY) {
    last = `install ${slug}`;
    const install = await runCommand("npm", ["install"], { cwd: siteDir, logFile });
    if (!install.ok) {
      last = `${slug} install FAIL`;
      return false;
    }
    last = `build ${slug}`;
    const build = await runCommand("npm", ["run", "build"], { cwd: siteDir, logFile });
    if (!build.ok) {
      last = `${slug} build FAIL`;
      return false;
    }
  }
  last = `deploy ${slug}`;
  const deploy = await runCommand("npm", ["run", "deploy", "--", "--slug", slug], {
    cwd: ROOT,
    logFile,
    env: { ...process.env, WFT_DEPLOY_PORT: String(4600 + slot) },
  });
  last = `${slug} deploy ${deploy.ok ? "ok" : "FAIL"}`;
  return deploy.ok;
}

async function main(): Promise<void> {
  fs.mkdirSync(BATCH_DIR, { recursive: true });
  heartbeat();
  const timer = setInterval(heartbeat, 30_000);
  const cfg = loadBatchConfig();

  await runPool(SLUG_LIST, cfg.deploy_concurrency_default, async (slug, slot) => {
    inFlight++;
    heartbeat();
    const ok = await rebuildSlug(slug, slot);
    inFlight--;
    if (ok) done++;
    heartbeat();
    return ok;
  });

  clearInterval(timer);
  heartbeat();
  fs.writeFileSync(
    path.join(BATCH_DIR, "image-fix-summary.json"),
    JSON.stringify({ done, total: SLUG_LIST.length, slugs: SLUG_LIST, deployOnly: DEPLOY_ONLY }, null, 2) + "\n"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
