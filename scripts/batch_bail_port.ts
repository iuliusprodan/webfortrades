#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT } from "./site_config.js";
import { batchDir, writeBail } from "./batch_port_control.js";

function parseArgs(): { batchId: string; slug: string; reason?: string } {
  const args = process.argv.slice(2);
  let batchId = "";
  let slug = "";
  let reason: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--batch-id" && args[i + 1]) batchId = args[++i];
    else if (args[i] === "--batch" && args[i + 1]) batchId = args[++i];
    else if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--reason" && args[i + 1]) reason = args[++i];
  }
  if (!batchId || !slug) {
    console.error("Usage: npm run batch:bail-port -- --batch-id <id> --slug <slug> [--reason text]");
    process.exit(1);
  }
  return { batchId, slug, reason };
}

function main(): void {
  const { batchId, slug, reason } = parseArgs();
  const dir = path.join(batchDir(batchId, ROOT), "jobs");
  if (!fs.existsSync(dir)) {
    console.error(`Batch jobs dir not found: ${dir}`);
    process.exit(1);
  }
  writeBail(batchId, slug, ROOT, reason);
  console.log(`Bail written: ${path.join(dir, `${slug}.bail`)}`);
  console.log("In-flight port will receive SIGTERM after next poll. Batch continues for other slugs.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
