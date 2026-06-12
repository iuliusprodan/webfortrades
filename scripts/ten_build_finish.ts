#!/usr/bin/env tsx
/** Finish ten-build: m-ross full re-port + deploy remaining slugs. */
import fs from "node:fs";
import path from "node:path";
import { runPortPool } from "./batch_port_pool.js";
import { runPool, runCommand } from "./concurrency.js";
import { loadBatchConfig } from "./batch_config.js";
import { ROOT } from "./site_config.js";

const BATCH_ID = "2026-06-11-ten-build";
const BATCH_DIR = path.join(ROOT, "data", "batches", BATCH_ID);
const MROSS = "m-ross-building-services";
const DEPLOY_PENDING = [
  "ellis-plumbing-heating-services-birmingham",
  "edgar-landscapes-driveways-ltd",
  "painters-force-ltd",
  "tom-baker-plumbing-and-gas-solutions",
];

async function main(): Promise<void> {
  fs.mkdirSync(path.join(BATCH_DIR, "jobs"), { recursive: true });
  const log = path.join(BATCH_DIR, "finish.log");
  const append = (line: string) => {
    fs.appendFileSync(log, `${new Date().toISOString()} ${line}\n`);
    console.log(line);
  };

  append("=== m-ross full re-port start ===");
  const portResult = await runPortPool(BATCH_ID, [MROSS], { concurrency: 1 });
  fs.writeFileSync(
    path.join(BATCH_DIR, "m-ross-port-summary.json"),
    JSON.stringify(portResult, null, 2) + "\n"
  );
  append(
    `m-ross port: ${portResult.results[MROSS]?.status ?? "unknown"} ok=${portResult.results[MROSS]?.ok ?? false}`
  );

  const toDeploy = [...DEPLOY_PENDING];
  if (portResult.results[MROSS]?.ok) toDeploy.push(MROSS);

  append(`=== deploy ${toDeploy.length} slugs (C=3) ===`);
  const batchCfg = loadBatchConfig();
  await runPool(toDeploy, batchCfg.deploy_concurrency_default, async (slug, slot) => {
    append(`deploy start ${slug}`);
    const ok = await runCommand("npm", ["run", "deploy", "--", "--slug", slug], {
      cwd: ROOT,
      logFile: path.join(BATCH_DIR, "jobs", `${slug}.log`),
      env: { ...process.env, WFT_DEPLOY_PORT: String(4600 + slot) },
    });
    append(`deploy ${slug}: ${ok.ok ? "ok" : "FAIL"}`);
    return ok.ok;
  });

  append("=== finish complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
