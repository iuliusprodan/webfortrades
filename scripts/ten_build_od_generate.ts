#!/usr/bin/env tsx
/**
 * Open Design generation for ten-build batch via daemon HTTP API.
 * Use when MCP points at 7456 but dev daemon runs on ephemeral port.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ROOT, briefDir } from "./site_config.js";
import { runPool } from "./concurrency.js";

const BATCH_ID = "2026-06-11-ten-build";
const BATCH_DIR = path.join(ROOT, "data", "batches", BATCH_ID);
const OD_REPO = "/Users/iuliusprodan/.cursor/open-design";
const OD_PROJECTS = path.join(OD_REPO, ".od", "projects");
const SKILL = "design-taste-frontend";
const AGENT = "cursor-agent";
const TIMEOUT_MS = 20 * 60 * 1000;
const POLL_MS = 30_000;

interface RunResult {
  slug: string;
  projectId: string;
  runId: string | null;
  status: string;
  error?: string;
  duration_s?: number;
}

async function api<T>(daemonUrl: string, method: string, pathPart: string, body?: unknown): Promise<T> {
  const url = `${daemonUrl.replace(/\/$/, "")}${pathPart}`;
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "content-type": "application/json" };
    init.body = JSON.stringify(body);
  }
  const resp = await fetch(url, init);
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`${method} ${pathPart} → ${resp.status}: ${text.slice(0, 400)}`);
  }
  if (resp.status === 204) return undefined as T;
  return (await resp.json()) as T;
}

async function discoverDaemonUrl(): Promise<string> {
  if (process.env.OD_DAEMON_URL) return process.env.OD_DAEMON_URL;
  const logPath = path.join(BATCH_DIR, "od-daemon.log");
  if (fs.existsSync(logPath)) {
    const m = fs.readFileSync(logPath, "utf8").match(/Daemon:\s+(http:\/\/[^\s]+)/);
    if (m?.[1]) return m[1].replace(/\/$/, "");
  }
  for (const port of [7456, 53867, 64616]) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(2000) });
      if (r.ok) return `http://127.0.0.1:${port}`;
    } catch {
      /* try next */
    }
  }
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["--silent", "exec", "tools-dev", "status", "--json"], {
      cwd: OD_REPO,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    child.stdout?.on("data", (c) => {
      stdout += String(c);
    });
    child.on("error", reject);
    child.on("exit", () => {
      for (let i = stdout.indexOf("{"); i !== -1; i = stdout.indexOf("{", i + 1)) {
        try {
          const parsed = JSON.parse(stdout.slice(i)) as { apps?: { daemon?: { url?: string } } };
          const url = parsed.apps?.daemon?.url;
          if (url) {
            resolve(url);
            return;
          }
        } catch {
          /* continue */
        }
      }
      reject(new Error("Cannot discover Open Design daemon URL"));
    });
  });
}

function loadSlugs(): string[] {
  const p = path.join(BATCH_DIR, "candidate-review.json");
  const data = JSON.parse(fs.readFileSync(p, "utf8")) as { rows: { slug: string }[] };
  return data.rows.map((r) => r.slug);
}

function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDirSync(s, d);
    else fs.copyFileSync(s, d);
  }
}

function buildRunPrompt(slug: string): string {
  return [
    "skip questions, just build. no questions, go.",
    "",
    `Build a bespoke one-page trade website for ${slug}.`,
    "Read BRIEF.md for business evidence, section plan, and rules.",
    "Use only real images from assets/images/. No placeholders, no stock, no invented facts.",
    "British English. No em dashes.",
    "Banned headings: Plumbing sorted properly, Questions before you ring, One van. One trade, A note from X.",
    "Footer credit: Website by WebForTrades linking to https://webfortradesuk.co.uk",
    "Start from evidence in BRIEF.md, not a generic template.",
    "Produce a complete index.html plus stylesheet(s) and reference local assets only.",
  ].join("\n");
}

async function waitForRun(daemonUrl: string, runId: string): Promise<{ status: string; exitCode?: number | null }> {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const st = await api<{ status: string; exitCode?: number | null }>(
      daemonUrl,
      "GET",
      `/api/runs/${encodeURIComponent(runId)}`
    );
    if (st.status === "succeeded" || st.status === "failed" || st.status === "canceled") {
      return st;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`Run ${runId} timed out after ${TIMEOUT_MS}ms`);
}

function saveArtifactsFromProject(slug: string, projectId: string): void {
  const projectDir = path.join(OD_PROJECTS, projectId);
  const outDir = path.join(ROOT, "open-design-artifacts", slug);
  fs.mkdirSync(outDir, { recursive: true });

  const htmlCandidates = ["index.html", "artifact.html", "App.html"];
  let htmlSrc: string | null = null;
  for (const name of htmlCandidates) {
    const p = path.join(projectDir, name);
    if (fs.existsSync(p)) {
      htmlSrc = p;
      break;
    }
  }
  if (!htmlSrc) {
    throw new Error(`No HTML artifact in ${projectDir}`);
  }

  let html = fs.readFileSync(htmlSrc, "utf8");
  const cssCandidates = [
    path.join(projectDir, "css", "styles.css"),
    path.join(projectDir, "styles.css"),
    path.join(projectDir, "artifact.css"),
    path.join(projectDir, "style.css"),
    path.join(projectDir, "index.css"),
  ];
  let cssSrc: string | null = null;
  for (const p of cssCandidates) {
    if (fs.existsSync(p)) {
      cssSrc = p;
      break;
    }
  }
  if (!cssSrc) {
    throw new Error(`No CSS artifact in ${projectDir}`);
  }
  fs.copyFileSync(cssSrc, path.join(outDir, "artifact.css"));
  html = html.replace(
    /href=["'](?:\.\/)?(?:css\/)?(?:styles|style|artifact|index)\.css["']/gi,
    'href="artifact.css"'
  );
  fs.writeFileSync(path.join(outDir, "artifact.html"), html);

  const assetsSrc = path.join(projectDir, "assets");
  if (fs.existsSync(assetsSrc)) {
    copyDirSync(assetsSrc, path.join(outDir, "assets"));
  }
}

async function runOneSlug(daemonUrl: string, slug: string): Promise<RunResult> {
  const started = Date.now();
  const briefMdPath = path.join(ROOT, "open-design-artifacts", slug, "open-design-brief.md");
  if (!fs.existsSync(briefMdPath)) {
    return { slug, projectId: "", runId: null, status: "skipped", error: "missing open-design-brief.md" };
  }

  const projectId = `webfortrades-${slug}-pilot-${Date.now().toString(36)}`.slice(0, 120);
  const projectName = `webfortrades-${slug}-pilot`;
  const briefMd = fs.readFileSync(briefMdPath, "utf8");
  const prompt = buildRunPrompt(slug);

  const created = await api<{ conversationId?: string }>(daemonUrl, "POST", "/api/projects", {
    id: projectId,
    name: projectName,
    skillId: SKILL,
    pendingPrompt: prompt,
    metadata: { kind: "prototype", platform: "responsive", source: "ten-build-batch", slug },
    skipDiscoveryBrief: true,
  });
  const conversationId = created.conversationId;
  if (!conversationId) throw new Error("No conversationId from create project");

  const projectDir = path.join(OD_PROJECTS, projectId);
  fs.mkdirSync(path.join(projectDir, "assets", "images"), { recursive: true });
  const imagesDir = path.join(briefDir(slug), "images");
  if (fs.existsSync(imagesDir)) {
    for (const f of fs.readdirSync(imagesDir)) {
      if (/\.(webp|jpg|jpeg|png)$/i.test(f)) {
        fs.copyFileSync(path.join(imagesDir, f), path.join(projectDir, "assets", "images", f));
      }
    }
  }

  await api(daemonUrl, "POST", `/api/projects/${projectId}/files`, {
    name: "BRIEF.md",
    content: briefMd,
    encoding: "utf8",
  });

  const now = Date.now();
  const userMessageId = `ten-user-${now}`;
  const assistantMessageId = `ten-asst-${now}`;
  await api(
    daemonUrl,
    "PUT",
    `/api/projects/${projectId}/conversations/${conversationId}/messages/${userMessageId}`,
    { role: "user", content: prompt, createdAt: now }
  );
  await api(
    daemonUrl,
    "PUT",
    `/api/projects/${projectId}/conversations/${conversationId}/messages/${assistantMessageId}`,
    {
      role: "assistant",
      content: "",
      agentId: AGENT,
      agentName: AGENT,
      runStatus: "queued",
      startedAt: now,
      createdAt: now,
    }
  );

  const run = await api<{ runId: string }>(daemonUrl, "POST", "/api/runs", {
    agentId: AGENT,
    message: prompt,
    currentPrompt: prompt,
    projectId,
    conversationId,
    assistantMessageId,
    clientRequestId: `ten-build-${slug}-${now}`,
    skillId: SKILL,
  });

  const final = await waitForRun(daemonUrl, run.runId);
  if (final.status !== "succeeded") {
    return {
      slug,
      projectId,
      runId: run.runId,
      status: final.status,
      error: `exit ${final.exitCode ?? "?"}`,
      duration_s: Math.round((Date.now() - started) / 1000),
    };
  }

  saveArtifactsFromProject(slug, projectId);
  const report = {
    slug,
    project_id: projectId,
    run_id: run.runId,
    agent: AGENT,
    skill: SKILL,
    status: "succeeded",
    duration_seconds: Math.round((Date.now() - started) / 1000),
    daemon_url: daemonUrl,
  };
  fs.writeFileSync(
    path.join(ROOT, "open-design-artifacts", slug, "open-design-run-report.json"),
    JSON.stringify(report, null, 2) + "\n"
  );

  return {
    slug,
    projectId,
    runId: run.runId,
    status: "succeeded",
    duration_s: report.duration_seconds,
  };
}

async function main(): Promise<void> {
  const slugs = loadSlugs();
  const daemonUrl = await discoverDaemonUrl();
  console.log(`OD daemon: ${daemonUrl}`);
  console.log(`Generating ${slugs.length} designs (concurrency 2)...`);

  const results: RunResult[] = [];
  let done = 0;
  const heartbeat = setInterval(() => {
    console.log(
      `[${new Date().toTimeString().slice(0, 8)}] od-generate done=${done}/${slugs.length} last=${results.at(-1)?.slug ?? "-"}`
    );
  }, POLL_MS);

  await runPool(slugs, 2, async (slug) => {
    console.log(`Starting OD: ${slug}`);
    try {
      const r = await runOneSlug(daemonUrl, slug);
      results.push(r);
      console.log(`Finished ${slug}: ${r.status}${r.error ? ` (${r.error})` : ""}`);
      if (r.status === "succeeded") {
        const { spawnSync } = await import("node:child_process");
        const check = spawnSync("npm", ["run", "od:check", "--", "--slug", slug], {
          cwd: ROOT,
          encoding: "utf8",
        });
        if (check.status !== 0) {
          console.warn(`od:check warnings for ${slug}`);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ slug, projectId: "", runId: null, status: "failed", error: msg });
      console.error(`Failed ${slug}: ${msg}`);
    }
    done++;
    return true;
  });

  clearInterval(heartbeat);
  fs.writeFileSync(
    path.join(BATCH_DIR, "od-generate-summary.json"),
    JSON.stringify({ daemon_url: daemonUrl, results }, null, 2) + "\n"
  );

  const failed = results.filter((r) => r.status !== "succeeded");
  console.log(`\nOD complete: ${results.length - failed.length}/${results.length} succeeded`);
  if (failed.length) {
    console.log("Failures:", failed.map((f) => `${f.slug}: ${f.error ?? f.status}`).join("; "));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
