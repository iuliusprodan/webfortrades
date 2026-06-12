#!/usr/bin/env tsx
/**
 * Approved ten-site build batch (2026-06-11-ten-build).
 * Heartbeat every 30s. No outreach. Halts on limits.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import { runPool, runCommand } from "./concurrency.js";
import { ROOT, briefDir } from "./site_config.js";
import { loadBatchConfig } from "./batch_config.js";
import { runPortPool } from "./batch_port_pool.js";
import {
  assignDirectionsForBatch,
  type BatchLeadRow,
} from "./ten_build_directions.js";

const BATCH_ID = "2026-06-11-ten-build";
const BATCH_DIR = path.join(ROOT, "data", "batches", BATCH_ID);
const WALL_MS = 4 * 60 * 60 * 1000;
const TOKEN_BUDGET = 6_000_000;
const MAX_PORT_STYLE_FAILURES = 2;

interface Progress {
  step: string;
  done: number;
  total: number;
  inFlight: number;
  last: string;
}

const progress: Progress = { step: "init", done: 0, total: 10, inFlight: 0, last: "starting" };
const startedAt = Date.now();
let portFailures = 0;
let styleFailures = 0;
let tailProc: ChildProcess | null = null;

function ts(): string {
  return new Date().toTimeString().slice(0, 8);
}

function printProgress(): void {
  const elapsed = Math.round((Date.now() - startedAt) / 1000);
  console.log(
    `[${ts()}] step=${progress.step} done=${progress.done}/${progress.total} in_flight=${progress.inFlight} last=${progress.last} elapsed_s=${elapsed}`
  );
}

function startHeartbeat(): NodeJS.Timeout {
  printProgress();
  return setInterval(printProgress, 30_000);
}

function writeState(phase: string, extra: Record<string, unknown> = {}): void {
  fs.mkdirSync(BATCH_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(BATCH_DIR, "batch-state.json"),
    JSON.stringify(
      {
        batch_id: BATCH_ID,
        phase,
        updated_at: new Date().toISOString(),
        progress,
        port_failures: portFailures,
        style_failures: styleFailures,
        elapsed_ms: Date.now() - startedAt,
        ...extra,
      },
      null,
      2
    ) + "\n"
  );
}

function checkWallClock(): void {
  if (Date.now() - startedAt > WALL_MS) {
    fs.writeFileSync(path.join(BATCH_DIR, "pause"), `# wall-clock cap ${new Date().toISOString()}\n`);
    throw new Error("Wall-clock cap 4h exceeded; pause file written");
  }
}

function loadSlugs(): BatchLeadRow[] {
  const p = path.join(BATCH_DIR, "candidate-review.json");
  const data = JSON.parse(fs.readFileSync(p, "utf8")) as {
    rows: BatchLeadRow[];
  };
  return data.rows;
}

async function npmRun(args: string[], logFile: string, slot = 0): Promise<boolean> {
  checkWallClock();
  const env = {
    ...process.env,
    WFT_REVIEW_PORT: String(4400 + slot),
    WFT_PREVIEW_PORT: String(4500 + slot),
  };
  const res = await runCommand("npm", args, { cwd: ROOT, env, logFile });
  return res.ok;
}

async function checkOdReady(): Promise<boolean> {
  if (process.env.OD_DAEMON_URL) {
    try {
      const r = await fetch(`${process.env.OD_DAEMON_URL.replace(/\/$/, "")}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (r.ok) return true;
    } catch {
      /* fall through */
    }
  }
  const logPath = path.join(BATCH_DIR, "od-daemon.log");
  if (fs.existsSync(logPath)) {
    const m = fs.readFileSync(logPath, "utf8").match(/Daemon:\s+(http:\/\/[^\s]+)/);
    if (m?.[1]) {
      process.env.OD_DAEMON_URL = m[1].replace(/\/$/, "");
      try {
        const r = await fetch(`${process.env.OD_DAEMON_URL}/api/health`, { signal: AbortSignal.timeout(5000) });
        if (r.ok) return true;
      } catch {
        /* fall through */
      }
    }
  }
  const res = await runCommand("npm", ["run", "od:status"], {
    cwd: ROOT,
    logFile: path.join(BATCH_DIR, "od-status.log"),
  });
  return res.ok;
}

function startTailPorts(): void {
  if (tailProc) return;
  tailProc = spawn("npm", ["run", "batch:tail-ports", "--", "--batch", BATCH_ID], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const mux = path.join(BATCH_DIR, "port-tail.log");
  const stream = fs.createWriteStream(mux, { flags: "a" });
  tailProc.stdout?.pipe(stream);
  tailProc.stderr?.pipe(stream);
  progress.last = "tail-ports started";
}

async function main(): Promise<void> {
  fs.mkdirSync(path.join(BATCH_DIR, "jobs"), { recursive: true });
  const heartbeat = startHeartbeat();
  const slugs = loadSlugs();
  progress.total = slugs.length;
  writeState("approved");

  const jobsDir = path.join(BATCH_DIR, "jobs");
  const logFor = (slug: string) => path.join(jobsDir, `${slug}.log`);

  // Creative directions (distinct per batch rules)
  progress.step = "directions";
  const directions = assignDirectionsForBatch(slugs.length);
  slugs.forEach((row, i) => {
    const dir = directions[i]!;
    const d = briefDir(row.slug);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(
      path.join(d, "creative-constraint.json"),
      JSON.stringify({ ...dir, batch_id: BATCH_ID }, null, 2) + "\n"
    );
  });
  progress.done = slugs.length;
  progress.last = "creative directions assigned";
  printProgress();

  // Gather
  progress.step = "gather";
  progress.done = 0;
  await runPool(slugs, 3, async (row, slot) => {
    progress.inFlight++;
    progress.last = `gather ${row.slug}`;
    const ok = await npmRun(["run", "gather", "--", "--slug", row.slug], logFor(row.slug), slot);
    progress.inFlight--;
    if (ok) progress.done++;
    return ok;
  });
  writeState("gathered");

  // Enrich
  progress.step = "enrich";
  progress.done = 0;
  await runPool(slugs, 3, async (row, slot) => {
    progress.inFlight++;
    progress.last = `enrich ${row.slug}`;
    const ok = await npmRun(
      ["run", "enrich:lead", "--", "--slug", row.slug, "--no-build"],
      logFor(row.slug),
      slot
    );
    progress.inFlight--;
    if (ok) progress.done++;
    return ok;
  });
  writeState("enriched");

  // site:prepare
  progress.step = "site-prepare";
  progress.done = 0;
  await runPool(slugs, 3, async (row, slot) => {
    progress.inFlight++;
    progress.last = `site:prepare ${row.slug}`;
    const ok = await npmRun(["run", "site:prepare", "--", "--slug", row.slug], logFor(row.slug), slot);
    progress.inFlight--;
    if (ok) progress.done++;
    return ok;
  });
  writeState("prepared");

  // od:prepare
  progress.step = "od-prepare";
  progress.done = 0;
  for (const row of slugs) {
    progress.inFlight = 1;
    progress.last = `od:prepare ${row.slug}`;
    const ok = await npmRun(["run", "od:prepare", "--", "--slug", row.slug], logFor(row.slug));
    progress.inFlight = 0;
    if (ok) progress.done++;
  }
  writeState("od-prepared");

  // OD generation gate
  progress.step = "od-status";
  progress.last = "checking Open Design daemon";
  printProgress();
  if (!(await checkOdReady())) {
    writeState("PAUSED_OD_DAEMON", {
      blocker: "Open Design daemon not ready. Start desktop app or pnpm tools-dev run web. See docs/open-design-to-vercel-recipe.md section B.",
    });
    console.error("\n=== PAUSED: Open Design daemon not ready ===");
    console.error("Gather/enrich/prepare complete for all 10. Start OD, then re-run OD generation phase.");
    console.error("No outreach sent. Batch state: data/batches/2026-06-11-ten-build/batch-state.json");
    process.exit(2);
  }

  progress.step = "od-generate";
  progress.done = 0;
  progress.last = "starting OD generation";
  printProgress();
  const odGen = await runCommand("npm", ["run", "ten:od-generate"], {
    cwd: ROOT,
    logFile: path.join(BATCH_DIR, "od-generate.log"),
    env: { ...process.env, OD_DAEMON_URL: process.env.OD_DAEMON_URL ?? "" },
  });
  if (!odGen.ok) {
    writeState("PAUSED_OD_GENERATE", { blocker: "OD generation had failures; see od-generate-summary.json" });
    process.exit(1);
  }
  writeState("od-generated");

  progress.step = "port";
  progress.done = 0;
  startTailPorts();
  const batchCfg = loadBatchConfig();
  const slugList = slugs.map((r) => r.slug);
  const portSummary = await runPortPool(BATCH_ID, slugList, {
    concurrency: batchCfg.port_concurrency_default,
  });
  fs.writeFileSync(
    path.join(BATCH_DIR, "port-summary.json"),
    JSON.stringify(portSummary, null, 2) + "\n"
  );
  portFailures = portSummary.failed + portSummary.bailed;
  if (portFailures > MAX_PORT_STYLE_FAILURES) {
    fs.writeFileSync(path.join(BATCH_DIR, "pause"), `# port failures ${portSummary.failed}\n`);
    throw new Error(`>Halt: ${portFailures} port failures`);
  }

  progress.step = "clone-review";
  progress.done = 0;
  await runPool(slugList, 3, async (slug, slot) => {
    progress.inFlight++;
    const ok = await npmRun(
      ["run", "review:clone", "--", "--slug", slug],
      path.join(jobsDir, `${slug}.log`),
      slot
    );
    progress.inFlight--;
    if (!ok) portFailures++;
    else progress.done++;
    return ok;
  });

  progress.step = "preview";
  progress.done = 0;
  await runPool(slugList, 3, async (slug, slot) => {
    progress.inFlight++;
    const ok = await npmRun(
      ["run", "preview:site", "--", "--slug", slug],
      path.join(jobsDir, `${slug}.log`),
      slot
    );
    progress.inFlight--;
    if (ok) progress.done++;
    return ok;
  });

  progress.step = "review";
  progress.done = 0;
  await runPool(slugList, 3, async (slug, slot) => {
    progress.inFlight++;
    const ok = await npmRun(
      ["run", "review", "--", "--slug", slug],
      path.join(jobsDir, `${slug}.log`),
      slot
    );
    progress.inFlight--;
    if (ok) progress.done++;
    return ok;
  });

  progress.step = "deploy";
  progress.done = 0;
  await runPool(slugList, batchCfg.deploy_concurrency_default, async (slug, slot) => {
    progress.inFlight++;
    const ok = await npmRun(
      ["run", "deploy", "--", "--slug", slug],
      path.join(jobsDir, `${slug}.log`),
      slot
    );
    progress.inFlight--;
    if (ok) progress.done++;
    return ok;
  });

  progress.step = "complete";
  writeState("complete", { port_summary: portSummary });
  clearInterval(heartbeat);
  tailProc?.kill();
}

const args = process.argv.slice(2);
const fromPort = args.includes("--from-port");

if (fromPort) {
  (async () => {
    const heartbeat = startHeartbeat();
    const batchCfg = loadBatchConfig();
    const slugs = loadSlugs().map((r) => r.slug);
    fs.mkdirSync(path.join(BATCH_DIR, "jobs"), { recursive: true });

    progress.step = "port";
    progress.done = 0;
    startTailPorts();
    const portSummary = await runPortPool(BATCH_ID, slugs, {
      concurrency: batchCfg.port_concurrency_default,
    });
    fs.writeFileSync(
      path.join(BATCH_DIR, "port-summary.json"),
      JSON.stringify(portSummary, null, 2) + "\n"
    );
    portFailures = portSummary.failed + portSummary.bailed;
    if (portSummary.token_budget_exceeded) {
      progress.last = "token budget exceeded; in-flight finished";
    }
    if (portFailures > MAX_PORT_STYLE_FAILURES) {
      fs.writeFileSync(path.join(BATCH_DIR, "pause"), `# port failures ${portSummary.failed}\n`);
      throw new Error(`>Halt: ${portFailures} port failures`);
    }

    progress.step = "clone-review";
    progress.done = 0;
    await runPool(slugs, 3, async (slug, slot) => {
      progress.inFlight++;
      const ok = await npmRun(
        ["run", "review:clone", "--", "--slug", slug],
        path.join(BATCH_DIR, "jobs", `${slug}.log`),
        slot
      );
      progress.inFlight--;
      if (!ok) portFailures++;
      else progress.done++;
      return ok;
    });

    progress.step = "preview";
    progress.done = 0;
    await runPool(slugs, 3, async (slug, slot) => {
      progress.inFlight++;
      const ok = await npmRun(
        ["run", "preview:site", "--", "--slug", slug],
        path.join(BATCH_DIR, "jobs", `${slug}.log`),
        slot
      );
      progress.inFlight--;
      if (ok) progress.done++;
      return ok;
    });

    progress.step = "review";
    progress.done = 0;
    await runPool(slugs, 3, async (slug, slot) => {
      progress.inFlight++;
      const ok = await npmRun(
        ["run", "review", "--", "--slug", slug],
        path.join(BATCH_DIR, "jobs", `${slug}.log`),
        slot
      );
      progress.inFlight--;
      if (ok) progress.done++;
      return ok;
    });

    progress.step = "deploy";
    progress.done = 0;
    await runPool(slugs, batchCfg.deploy_concurrency_default, async (slug, slot) => {
      progress.inFlight++;
      const ok = await npmRun(
        ["run", "deploy", "--", "--slug", slug],
        path.join(BATCH_DIR, "jobs", `${slug}.log`),
        slot
      );
      progress.inFlight--;
      if (ok) progress.done++;
      return ok;
    });

    progress.step = "complete";
    writeState("complete", { port_summary: portSummary });
    clearInterval(heartbeat);
    tailProc?.kill();
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
