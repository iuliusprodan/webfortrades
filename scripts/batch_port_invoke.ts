#!/usr/bin/env tsx
/**
 * Invoke OD port for one slug (cursor-agent or dry-run for tests).
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ROOT, OD_PORT_MARKER, briefDir } from "./site_config.js";
import { appendPortLog } from "./batch_port_control.js";

function parseArgs(): { slug: string; batchId?: string } {
  const args = process.argv.slice(2);
  let slug = "";
  let batchId: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
    else if (args[i] === "--batch-id" && args[i + 1]) batchId = args[++i];
  }
  if (!slug) {
    console.error("Usage: tsx scripts/batch_port_invoke.ts --slug <slug> [--batch-id <id>]");
    process.exit(1);
  }
  return { slug, batchId };
}

function log(batchId: string | undefined, slug: string, msg: string): void {
  console.log(msg);
  if (batchId) appendPortLog(batchId, slug, ROOT, "PORT_INVOKE", msg);
}

function hasCursorAgent(): boolean {
  try {
    execSync("command -v cursor-agent", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function main(): void {
  const { slug, batchId } = parseArgs();
  const artifactDir = path.join(ROOT, "open-design-artifacts", slug);
  const siteDir = path.join(ROOT, "sites", slug);

  if (!fs.existsSync(path.join(artifactDir, "artifact.html"))) {
    console.error(`Missing artifact: ${artifactDir}/artifact.html`);
    process.exit(2);
  }

  if (process.env.WFT_PORT_DRY_RUN === "1") {
    fs.mkdirSync(siteDir, { recursive: true });
    fs.writeFileSync(path.join(siteDir, OD_PORT_MARKER), `dry-run ${new Date().toISOString()}\n`);
    fs.mkdirSync(path.join(siteDir, "app"), { recursive: true });
    if (!fs.existsSync(path.join(siteDir, "app", "page.tsx"))) {
      fs.writeFileSync(
        path.join(siteDir, "app", "page.tsx"),
        `export default function Page(){return <main data-section-id="hero"><section data-section-id="services"/><section data-section-id="contact"/></main>}\n`
      );
    }
    log(batchId, slug, "WFT_PORT_DRY_RUN: marker and stub page written");
    process.exit(0);
  }

  if (!hasCursorAgent()) {
    console.error(
      "cursor-agent not on PATH. Install Cursor CLI or set WFT_PORT_DRY_RUN=1 for tests."
    );
    process.exit(3);
  }

  const promptPath = path.join(briefDir(slug), "open-design-brief.md");
  const promptHint = fs.existsSync(promptPath)
    ? `Read ${promptPath} and open-design-artifacts/${slug}/. Port to sites/${slug}/ per docs/open-design-next-porting-notes.md. Write ${OD_PORT_MARKER}. Include data-section-id on every main section.`
    : `Port open-design-artifacts/${slug}/ to sites/${slug}/ per docs/open-design-next-porting-notes.md. Write ${OD_PORT_MARKER}. Include data-section-id on every main section.`;

  log(batchId, slug, "Invoking cursor-agent for port (manual supervision if batch waits too long)");
  execSync(
    `cursor-agent -p ${JSON.stringify(promptHint)}`,
    { cwd: ROOT, stdio: "inherit", env: process.env }
  );

  if (!fs.existsSync(path.join(siteDir, OD_PORT_MARKER))) {
    console.error(`Port finished but ${OD_PORT_MARKER} missing under sites/${slug}/`);
    process.exit(4);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
