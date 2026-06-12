#!/usr/bin/env tsx
/** Poll port logs and print 30s heartbeats for ten-build batch. */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./site_config.js";

const BATCH_ID = "2026-06-11-ten-build";
const BATCH_DIR = path.join(ROOT, "data", "batches", BATCH_ID);
const JOBS = path.join(BATCH_DIR, "jobs");
const SLUGS = JSON.parse(
  fs.readFileSync(path.join(BATCH_DIR, "candidate-review.json"), "utf8")
).rows.map((r: { slug: string }) => r.slug);

const startedAt = Date.now();
let lastStep = "port";

function ts(): string {
  return new Date().toTimeString().slice(0, 8);
}

function readFinishStep(): string {
  const log = path.join(BATCH_DIR, "finish.log");
  if (!fs.existsSync(log)) return lastStep;
  const tail = fs.readFileSync(log, "utf8").trim().split("\n").pop() ?? "";
  if (/deploy start|deploy .*:/.test(tail)) return "deploy";
  if (/m-ross port:/.test(tail)) return "m-ross-port-done";
  if (/m-ross full re-port/.test(tail)) return "m-ross-port";
  return lastStep;
}

function portState(slug: string): string {
  const log = path.join(JOBS, `${slug}.port.log`);
  if (!fs.existsSync(log)) return "NOT_STARTED";
  const lines = fs.readFileSync(log, "utf8").trim().split("\n");
  const last = lines[lines.length - 1] ?? "";
  if (/exit=BAILED_PORT/.test(last) || fs.existsSync(path.join(JOBS, `${slug}.bail`))) {
    return "BAILED_PORT";
  }
  if (/exit=FAILED_PORT/.test(last)) return "FAILED_PORT";
  if (/PORT_OK|exit=ok|build retry succeeded/.test(last)) return "DONE";
  if (/PORT_INVOKE|PORT_START|PORT_BUILD_RETRY/.test(last) && !/PORT_SUMMARY slug=/.test(lines.slice(-2).join("\n"))) {
    return "RUNNING";
  }
  if (/PORT_SUMMARY.*exit=FAILED/.test(lines.slice(-5).join("\n"))) return "FAILED_PORT";
  return "NOT_STARTED";
}

function countStates(): { done: number; running: number; failed: number; bailed: number } {
  let done = 0;
  let running = 0;
  let failed = 0;
  let bailed = 0;
  for (const slug of SLUGS) {
    const s = portState(slug);
    if (s === "DONE") done++;
    else if (s === "RUNNING") running++;
    else if (s === "FAILED_PORT") failed++;
    else if (s === "BAILED_PORT") bailed++;
  }
  return { done, running, failed, bailed };
}

function lastEvent(): string {
  let best = "";
  let bestTime = 0;
  for (const slug of SLUGS) {
    const log = path.join(JOBS, `${slug}.port.log`);
    if (!fs.existsSync(log)) continue;
    const lines = fs.readFileSync(log, "utf8").trim().split("\n");
    const last = lines[lines.length - 1] ?? "";
    const m = last.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z)/);
    const t = m ? Date.parse(m[1]) : 0;
    if (t >= bestTime) {
      bestTime = t;
      best = `${slug}: ${last.slice(0, 80)}`;
    }
  }
  return best || "waiting";
}

function tick(): void {
  lastStep = readFinishStep();
  const { done, running, failed, bailed } = countStates();
  const deployed = SLUGS.filter((slug: string) => {
    const p = path.join(ROOT, "briefs", slug, "deploy.json");
    if (!fs.existsSync(p)) return false;
    try {
      const j = JSON.parse(fs.readFileSync(p, "utf8")) as { alias_status?: string };
      return j.alias_status === "VERIFIED";
    } catch {
      return false;
    }
  }).length;
  const elapsed = Math.round((Date.now() - startedAt) / 60000);
  const step = lastStep === "deploy" ? "deploy" : lastStep.includes("m-ross") ? "m-ross-port" : "port";
  const doneCount = step === "deploy" ? deployed : done;
  const total = 10;
  console.log(
    `[${ts()}] step=${step} done=${doneCount}/${total} in_flight=${running} elapsed_total=${elapsed} failed=${failed} bailed=${bailed} last=${lastEvent()}`
  );
}

tick();
setInterval(tick, 30_000);
