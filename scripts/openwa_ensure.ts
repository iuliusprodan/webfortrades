/**
 * Ensure the local OpenWA Docker stack is running before WhatsApp sends.
 * OpenWA lives outside this repo (default: ~/.cursor/openwa).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE_ROOT = path.join(__dirname, "..");

function loadEnv(): Record<string, string> {
  const envPath = path.join(WEBSITE_ROOT, ".env");
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

export interface EnsureOpenWAResult {
  ok: boolean;
  started: boolean;
  reachable: boolean;
  sessionStatus: string | null;
  detail: string | null;
  dashboardUrl: string;
  apiUrl: string;
  sessionStartHttpStatus?: number | null;
}

/** Resolve OpenWA session API id when env stores a session name. */
export function resolveSessionApiId(
  sessionIdOrName: string,
  sessions: { id: string; name: string }[]
): string | null {
  const direct = sessions.find((s) => s.id === sessionIdOrName);
  if (direct) return direct.id;
  const byName = sessions.find((s) => s.name === sessionIdOrName);
  return byName?.id ?? null;
}

function defaultOpenwaRoot(): string {
  const fromEnv = loadEnv().OPENWA_ROOT?.trim();
  if (fromEnv) return fromEnv;
  return path.join(os.homedir(), ".cursor", "openwa");
}

function openwaApiUrl(): string {
  return loadEnv().OPENWA_API_URL?.trim() || "http://localhost:2785";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHealth(apiUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === "ok";
  } catch {
    return false;
  }
}

function dockerDaemonUp(): boolean {
  try {
    execSync("docker info", { stdio: "ignore", timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

function startDockerDesktop(): void {
  if (process.platform !== "darwin") {
    throw new Error(
      "Docker is not running. Start Docker Desktop manually, then retry."
    );
  }
  console.log("OpenWA: starting Docker Desktop...");
  execSync("open -a Docker", { stdio: "ignore" });
}

async function waitForDocker(maxMs = 120_000): Promise<void> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (dockerDaemonUp()) return;
    await sleep(3000);
  }
  throw new Error("Docker did not become ready within 2 minutes.");
}

function composeUp(openwaRoot: string): void {
  const composeFile = path.join(openwaRoot, "docker-compose.dev.yml");
  if (!fs.existsSync(composeFile)) {
    throw new Error(
      `OpenWA docker-compose not found at ${composeFile}. Set OPENWA_ROOT in .env.`
    );
  }
  console.log(`OpenWA: docker compose up -d (${openwaRoot})`);
  execSync("docker compose -f docker-compose.dev.yml up -d", {
    cwd: openwaRoot,
    stdio: "inherit",
    env: { ...process.env, ...loadEnvFromFile(path.join(openwaRoot, ".env")) },
  });
}

function loadEnvFromFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

async function waitForHealth(apiUrl: string, maxMs = 90_000): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (await fetchHealth(apiUrl)) return true;
    await sleep(3000);
  }
  return false;
}

async function fetchSessionStatus(
  apiUrl: string,
  apiKey: string,
  sessionId: string
): Promise<{ found: boolean; status: string | null }> {
  const base = apiUrl.replace(/\/$/, "");
  const headers = { Accept: "application/json", "X-API-Key": apiKey };

  try {
    const direct = await fetch(
      `${base}/api/sessions/${encodeURIComponent(sessionId)}`,
      { headers, signal: AbortSignal.timeout(12000) }
    );

    if (direct.ok) {
      const data = (await direct.json()) as { status?: string };
      return { found: true, status: data.status ?? null };
    }

    if (direct.status !== 404) return { found: false, status: null };

    const listRes = await fetch(`${base}/api/sessions`, {
      headers,
      signal: AbortSignal.timeout(12000),
    });
    if (!listRes.ok) return { found: false, status: null };

    const sessions = (await listRes.json()) as { id: string; name: string; status: string }[];
    if (!Array.isArray(sessions)) return { found: false, status: null };

    const match = sessions.find(
      (session) => session.id === sessionId || session.name === sessionId
    );
    if (!match) return { found: false, status: null };
    return { found: true, status: match.status ?? null };
  } catch {
    return { found: false, status: null };
  }
}

async function tryStartSession(
  apiUrl: string,
  apiKey: string,
  sessionIdOrName: string
): Promise<{ httpStatus: number | null; resolvedId: string | null }> {
  const base = apiUrl.replace(/\/$/, "");
  const headers = { Accept: "application/json", "X-API-Key": apiKey };

  try {
    let apiId = sessionIdOrName;
    const listRes = await fetch(`${base}/api/sessions`, {
      headers,
      signal: AbortSignal.timeout(12000),
    });
    if (listRes.ok) {
      const sessions = (await listRes.json()) as { id: string; name: string }[];
      if (Array.isArray(sessions)) {
        const resolved = resolveSessionApiId(sessionIdOrName, sessions);
        if (resolved) apiId = resolved;
      }
    }

    const startRes = await fetch(`${base}/api/sessions/${encodeURIComponent(apiId)}/start`, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(30000),
    });
    return { httpStatus: startRes.status, resolvedId: apiId };
  } catch {
    return { httpStatus: null, resolvedId: null };
  }
}

/**
 * Start OpenWA if the API is down. Safe to call before every live WhatsApp send.
 * Does not scan QR codes; if session is disconnected you must open the dashboard.
 */
export async function ensureOpenWA(options?: {
  autoStart?: boolean;
}): Promise<EnsureOpenWAResult> {
  const autoStart = options?.autoStart !== false;
  const apiUrl = openwaApiUrl();
  const dashboardUrl = "http://localhost:2886";
  const env = { ...process.env, ...loadEnv() };
  const apiKey = env.OPENWA_API_KEY?.trim() ?? "";
  const sessionId = env.OPENWA_SESSION_ID?.trim() ?? "";
  const openwaRoot = defaultOpenwaRoot();

  let started = false;

  if (await fetchHealth(apiUrl)) {
    const session = apiKey && sessionId
      ? await fetchSessionStatus(apiUrl, apiKey, sessionId)
      : { found: false, status: null };
    return {
      ok: session.status === "ready",
      started: false,
      reachable: true,
      sessionStatus: session.status,
      detail:
        session.status === "ready"
          ? null
          : `Session not ready (status=${session.status ?? "unknown"}). Open ${dashboardUrl} and scan QR if needed.`,
      dashboardUrl,
      apiUrl,
    };
  }

  if (!autoStart) {
    return {
      ok: false,
      started: false,
      reachable: false,
      sessionStatus: null,
      detail: "OpenWA API is not reachable and autoStart is disabled.",
      dashboardUrl,
      apiUrl,
    };
  }

  if (!dockerDaemonUp()) {
    startDockerDesktop();
    await waitForDocker();
  }

  composeUp(openwaRoot);
  started = true;

  const healthy = await waitForHealth(apiUrl);
  if (!healthy) {
    return {
      ok: false,
      started,
      reachable: false,
      sessionStatus: null,
      detail: `OpenWA API did not become healthy at ${apiUrl}. Check docker logs: docker logs openwa-api`,
      dashboardUrl,
      apiUrl,
    };
  }

  if (apiKey && sessionId) {
    let session = await fetchSessionStatus(apiUrl, apiKey, sessionId);
    let sessionStartHttpStatus: number | null = null;
    if (session.found && session.status !== "ready") {
      console.log(`OpenWA: starting session ${sessionId} (was ${session.status})...`);
      const start = await tryStartSession(apiUrl, apiKey, sessionId);
      sessionStartHttpStatus = start.httpStatus;
      if (start.httpStatus && start.httpStatus >= 400) {
        console.warn(`OpenWA: session start returned HTTP ${start.httpStatus}`);
      }
      await sleep(5000);
      session = await fetchSessionStatus(apiUrl, apiKey, sessionId);
    }

    const ready = session.status === "ready";
    return {
      ok: ready,
      started,
      reachable: true,
      sessionStatus: session.status,
      sessionStartHttpStatus,
      detail: ready
        ? null
        : `OpenWA is up but session is not ready (status=${session.status ?? "unknown"}). Open ${dashboardUrl} and scan the QR code.`,
      dashboardUrl,
      apiUrl,
    };
  }

  return {
    ok: true,
    started,
    reachable: true,
    sessionStatus: null,
    detail: null,
    dashboardUrl,
    apiUrl,
  };
}

async function main(): Promise<void> {
  const result = await ensureOpenWA({ autoStart: true });
  console.log(JSON.stringify(result, null, 2));
  if (!result.reachable) process.exit(1);
  if (!result.ok) {
    console.error(result.detail ?? "OpenWA session not ready.");
    process.exit(2);
  }
  console.log("OpenWA is ready for WhatsApp sends.");
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
