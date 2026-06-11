#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT } from "./site_config.js";
import { batchDir, portLogPath } from "./batch_port_control.js";

function parseArgs(): { batchId: string } {
  const args = process.argv.slice(2);
  let batchId = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--batch-id" && args[i + 1]) batchId = args[++i];
    else if (args[i] === "--batch" && args[i + 1]) batchId = args[++i];
  }
  if (!batchId) {
    console.error("Usage: npm run batch:tail-ports -- --batch <batch-id>");
    process.exit(1);
  }
  return { batchId };
}

function tailFile(slug: string, filePath: string): fs.ReadStream {
  const stream = fs.createReadStream(filePath, { encoding: "utf8", start: Math.max(0, fs.statSync(filePath).size - 4096) });
  let buf = "";
  stream.on("data", (chunk: string) => {
    buf += chunk;
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) process.stdout.write(`[${slug}] ${line}\n`);
    }
  });
  return stream;
}

function main(): void {
  const { batchId } = parseArgs();
  const jobsDir = path.join(batchDir(batchId, ROOT), "jobs");
  if (!fs.existsSync(jobsDir)) {
    console.error(`Jobs dir not found: ${jobsDir}`);
    process.exit(1);
  }

  const logFiles = fs
    .readdirSync(jobsDir)
    .filter((f) => f.endsWith(".port.log"))
    .map((f) => ({ slug: f.replace(/\.port\.log$/, ""), path: path.join(jobsDir, f) }));

  if (logFiles.length === 0) {
    console.log("No port logs yet. Waiting...");
  }

  console.log(`Tailing ${logFiles.length} port log(s) for batch ${batchId}. Ctrl+C to stop.\n`);

  const watchers: fs.FSWatcher[] = [];
  for (const { slug, path: logPath } of logFiles) {
    if (!fs.existsSync(logPath)) continue;
    tailFile(slug, logPath);
    watchers.push(
      fs.watch(logPath, () => {
        try {
          const content = fs.readFileSync(logPath, "utf8");
          const lastLine = content.trim().split("\n").pop();
          if (lastLine) process.stdout.write(`[${slug}] ${lastLine}\n`);
        } catch {
          /* race */
        }
      })
    );
  }

  fs.watch(jobsDir, (_, filename) => {
    if (!filename?.endsWith(".port.log")) return;
    const slug = filename.replace(/\.port.log$/, "");
    const logPath = portLogPath(batchId, slug, ROOT);
    if (fs.existsSync(logPath) && !watchers.length) {
      tailFile(slug, logPath);
    }
  });

  process.stdin.resume();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
