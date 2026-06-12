#!/usr/bin/env tsx
/**
 * Read-only Open Design readiness check.
 * Does not start daemons, generate designs, or deploy.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { ROOT } from "./site_config.js";

const OD_REPO = "/Users/iuliusprodan/.cursor/open-design";
const MCP_CONFIG = path.join(os.homedir(), ".cursor", "mcp.json");
const DAEMON_PORTS = [7456, 64616, 50567];

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

const results: CheckResult[] = [];

function add(name: string, ok: boolean, detail: string): void {
  results.push({ name, ok, detail });
}

function runOk(cmd: string): { ok: boolean; out: string } {
  try {
    return { ok: true, out: execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim() };
  } catch {
    return { ok: false, out: "" };
  }
}

function run(cmd: string): string {
  return runOk(cmd).out;
}

function nodeVersion(label: string): void {
  const v = run("node -v");
  add(`Node (${label})`, Boolean(v), v || "node not on PATH");
}

async function checkDaemonPort(port: number): Promise<{ ok: boolean; detail: string }> {
  const url = `http://127.0.0.1:${port}/api/health`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const body = (await res.text()).slice(0, 200);
    if (res.ok) return { ok: true, detail: `${url} → HTTP ${res.status} ${body}` };
    return { ok: false, detail: `${url} → HTTP ${res.status}` };
  } catch (err) {
    return {
      ok: false,
      detail: `${url} unreachable (${err instanceof Error ? err.message : String(err)})`,
    };
  }
}

function checkMcpConfig(): void {
  if (!fs.existsSync(MCP_CONFIG)) {
    add("Cursor MCP config", false, `Missing ${MCP_CONFIG}`);
    return;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(MCP_CONFIG, "utf8")) as {
      mcpServers?: Record<string, unknown>;
    };
    const hasOd = Boolean(raw.mcpServers?.["open-design"] || raw.mcpServers?.["user-open-design"]);
    add(
      "Cursor MCP open-design entry",
      hasOd,
      hasOd ? `Found in ${MCP_CONFIG}` : "No open-design server in mcp.json"
    );
  } catch (err) {
    add("Cursor MCP config", false, `Could not parse ${MCP_CONFIG}: ${err}`);
  }
}

function checkCursorAgent(): void {
  const which = runOk("which cursor-agent");
  const version = which.ok ? runOk("cursor-agent --version 2>&1 | head -1").out : "";
  const status = which.ok ? runOk("cursor-agent status 2>&1 | head -5").out : "";
  const loggedIn = /logged in|Logged in/i.test(status);
  add("cursor-agent on PATH", which.ok, which.out || "not found (install Cursor CLI)");
  if (which.ok) add("cursor-agent version", Boolean(version), version || "unknown");
  if (which.ok) add("cursor-agent logged in", loggedIn, status.slice(0, 300) || "run cursor-agent login");
}

function checkOdRepo(): void {
  const pkg = path.join(OD_REPO, "package.json");
  add("Open Design repo", fs.existsSync(pkg), OD_REPO);
}

async function main(): Promise<void> {
  console.log("Open Design readiness check (read-only)\n");

  checkOdRepo();
  nodeVersion("current shell");

  const nvm20 = run("bash -lc 'source ~/.nvm/nvm.sh 2>/dev/null && nvm use 20 >/dev/null 2>&1 && node -v'");
  add("Node 20 (WebForTrades)", Boolean(nvm20), nvm20 || "nvm use 20 not available in shell");

  const nvm24 = run("bash -lc 'source ~/.nvm/nvm.sh 2>/dev/null && nvm use 24 >/dev/null 2>&1 && node -v'");
  add("Node 24 (Open Design)", Boolean(nvm24), nvm24 || "nvm use 24 not available in shell");

  checkCursorAgent();
  checkMcpConfig();

  let daemonOk = false;
  let daemonPort = 0;
  let daemonDetail = "No daemon responded on checked ports";
  for (const port of DAEMON_PORTS) {
    const r = await checkDaemonPort(port);
    if (r.ok) {
      daemonOk = true;
      daemonPort = port;
      daemonDetail = r.detail;
      break;
    }
    daemonDetail = r.detail;
  }
  add("Open Design daemon HTTP", daemonOk, daemonDetail);

  const listen7456 = runOk("lsof -nP -iTCP:7456 -sTCP:LISTEN 2>/dev/null | tail -n +2").out;
  const portListenOk = Boolean(listen7456) || daemonPort === 7456;
  add(
    "Port 7456 listening",
    portListenOk,
    listen7456
      ? listen7456.split("\n")[0] ?? listen7456
      : daemonPort === 7456
        ? "health OK on 7456 (lsof empty but daemon responds)"
        : "nothing on 7456 (dev mode may use ephemeral port)"
  );

  console.log("Checks:");
  for (const r of results) {
    console.log(`  [${r.ok ? "OK" : "FAIL"}] ${r.name}`);
    console.log(`        ${r.detail}`);
  }

  const critical = results.filter(
    (r) =>
      !r.ok &&
      (r.name.includes("daemon HTTP") ||
        r.name.includes("cursor-agent on PATH") ||
        r.name.includes("logged in") ||
        r.name.includes("Open Design repo"))
  );

  console.log("");
  if (critical.length) {
    console.log("Not ready for Open Design generation. Fix FAIL items above.");
    console.log("See docs/open-design-to-vercel-recipe.md section B.");
    process.exit(1);
  }

  console.log("Ready enough to attempt Open Design (daemon + cursor-agent OK).");
  console.log("Next: npm run od:prepare -- --slug <slug> then follow the recipe.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
