import fs from "node:fs";
import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { runCommand } from "./concurrency.js";
import { loadBatchConfig, type BatchConfig } from "./batch_config.js";
import {
  appendPortLog,
  isSlugBailed,
  portLogPath,
  validatePortSectionIds,
  writeBail,
} from "./batch_port_control.js";
import {
  classifyPortError,
  onPortCompleteTokens,
  shouldRetryPortFailure,
  shouldWarnPortDuration,
  type PortTokenState,
} from "./batch_port_policy.js";
import { ROOT, OD_PORT_MARKER, hasOpenDesignPort, loadSiteDesignConfig } from "./site_config.js";

export interface PortWorkerResult {
  ok: boolean;
  status: "PORTED" | "FAILED_PORT" | "BAILED_PORT" | "SKIPPED";
  ms: number;
  attempts: number;
  tokens: number;
  error?: string;
}

export interface PortWorkerContext {
  batchId: string;
  slug: string;
  slot: number;
  tokenState: PortTokenState;
  config: BatchConfig;
  dryRun?: boolean;
}

function updateBatchStatus(slug: string, patch: Record<string, unknown>): void {
  const p = path.join(ROOT, "briefs", slug, "batch-status.json");
  const base = fs.existsSync(p)
    ? (JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, unknown>)
    : { slug };
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify({ ...base, ...patch, updated_at: new Date().toISOString() }, null, 2) + "\n");
}

function readPortTokens(slug: string): number {
  const p = path.join(ROOT, "briefs", slug, "batch-status.json");
  if (!fs.existsSync(p)) return 0;
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8")) as { port_tokens?: number };
    return j.port_tokens ?? 0;
  } catch {
    return 0;
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function runWithBailWatch(
  ctx: PortWorkerContext,
  spawnFn: () => ChildProcess
): Promise<{ code: number | null; signal: string | null; bailed: boolean }> {
  const child = spawnFn();
  const pollMs = ctx.config.port_poll_interval_ms;
  while (true) {
    if (isSlugBailed(ctx.batchId, ctx.slug, ROOT)) {
      appendPortLog(ctx.batchId, ctx.slug, ROOT, "PORT_BAIL", "signal SIGTERM");
      child.kill("SIGTERM");
      await sleep(ctx.config.port_bail_grace_ms);
      if (!child.killed) child.kill("SIGKILL");
      return { code: null, signal: "SIGTERM", bailed: true };
    }
    const done = await Promise.race([
      new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
        child.on("close", (code, signal) => resolve({ code, signal }));
        child.on("error", () => resolve({ code: 1, signal: null }));
      }),
      sleep(pollMs).then(() => null),
    ]);
    if (done !== null) {
      return { code: done.code, signal: done.signal, bailed: false };
    }
  }
}

async function runPortAttempt(ctx: PortWorkerContext, attempt: number): Promise<PortWorkerResult> {
  const start = Date.now();
  const logFile = portLogPath(ctx.batchId, ctx.slug, ROOT);
  appendPortLog(ctx.batchId, ctx.slug, ROOT, "PORT_START", `attempt=${attempt}`);

  updateBatchStatus(ctx.slug, {
    batch_id: ctx.batchId,
    port_started_at: new Date(start).toISOString(),
    port_attempts: attempt,
  });

  const odCheck = ctx.dryRun
    ? { ok: true, code: 0, stdout: "", stderr: "" }
    : await runCommand("npm", ["run", "od:check", "--", "--slug", ctx.slug], {
        cwd: ROOT,
        logFile,
        env: {
          ...process.env,
          ...(ctx.dryRun ? { WFT_PORT_DRY_RUN: "1" } : {}),
        },
      });

  if (!odCheck.ok) {
    const kind = classifyPortError(odCheck.stderr || odCheck.stdout, odCheck.code);
    return {
      ok: false,
      status: "FAILED_PORT",
      ms: Date.now() - start,
      attempts: attempt,
      tokens: 0,
      error: `od:check failed (${kind})`,
    };
  }

  const invokeEnv = {
    ...process.env,
    ...(ctx.dryRun ? { WFT_PORT_DRY_RUN: "1" } : {}),
  };

  const invoke = await new Promise<{ ok: boolean; code: number | null; bailed: boolean; err: string }>(
    (resolve) => {
      const child = spawn(
        "npx",
        ["tsx", "scripts/batch_port_invoke.ts", "--slug", ctx.slug, "--batch-id", ctx.batchId],
        { cwd: ROOT, env: invokeEnv, stdio: ["ignore", "pipe", "pipe"] }
      );
      const stream = fs.createWriteStream(logFile, { flags: "a" });
      child.stdout.pipe(stream);
      child.stderr.pipe(stream);
      runWithBailWatch(ctx, () => child).then(({ code, bailed }) => {
        stream.end();
        resolve({
          ok: code === 0 && !bailed,
          code,
          bailed,
          err: bailed ? "bailed" : `exit ${code}`,
        });
      });
    }
  );

  if (invoke.bailed) {
    return {
      ok: false,
      status: "BAILED_PORT",
      ms: Date.now() - start,
      attempts: attempt,
      tokens: readPortTokens(ctx.slug),
      error: "operator bail",
    };
  }

  if (!invoke.ok) {
    const kind = classifyPortError(invoke.err, invoke.code);
    return {
      ok: false,
      status: "FAILED_PORT",
      ms: Date.now() - start,
      attempts: attempt,
      tokens: readPortTokens(ctx.slug),
      error: `port invoke failed (${kind})`,
    };
  }

  const siteDir = path.join(ROOT, "sites", ctx.slug);
  if (!hasOpenDesignPort(siteDir)) {
    return {
      ok: false,
      status: "FAILED_PORT",
      ms: Date.now() - start,
      attempts: attempt,
      tokens: readPortTokens(ctx.slug),
      error: "missing .od-port marker after invoke",
    };
  }

  if (ctx.dryRun) {
    const outDir = path.join(siteDir, "out");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, "index.html"),
      `<html><body><section data-section-id="hero"></section><section data-section-id="services"></section><section data-section-id="contact"></section></body></html>\n`
    );
  } else {
    const build = await runCommand("npm", ["run", "build"], {
      cwd: siteDir,
      logFile,
    });
    if (!build.ok) {
      return {
        ok: false,
        status: "FAILED_PORT",
        ms: Date.now() - start,
        attempts: attempt,
        tokens: readPortTokens(ctx.slug),
        error: "next build failed after port",
      };
    }
  }

  const siteDesign = loadSiteDesignConfig();
  if (siteDesign.od_port_require_section_ids) {
    const indexHtml = path.join(siteDir, "out", "index.html");
    if (fs.existsSync(indexHtml)) {
      const html = fs.readFileSync(indexHtml, "utf8");
      const v = validatePortSectionIds(html, 3);
      if (!v.ok) {
        return {
          ok: false,
          status: "FAILED_PORT",
          ms: Date.now() - start,
          attempts: attempt,
          tokens: readPortTokens(ctx.slug),
          error: `section id guard: found ${v.count}, need >= 3 data-section-id`,
        };
      }
    }
  }

  const elapsed = Date.now() - start;
  const tokens = readPortTokens(ctx.slug);
  updateBatchStatus(ctx.slug, {
    port_completed_at: new Date().toISOString(),
    port_ms: elapsed,
    port_tokens: tokens,
  });

  if (shouldWarnPortDuration(elapsed, ctx.config.port_duration_warn_minutes_default)) {
    appendPortLog(
      ctx.batchId,
      ctx.slug,
      ROOT,
      "PORT_DURATION_WARN",
      `${Math.round(elapsed / 60000)} min (threshold ${ctx.config.port_duration_warn_minutes_default})`
    );
  }

  appendPortLog(
    ctx.batchId,
    ctx.slug,
    ROOT,
    "PORT_OK",
    `duration_ms=${elapsed} attempts=${attempt}`
  );

  return {
    ok: true,
    status: "PORTED",
    ms: elapsed,
    attempts: attempt,
    tokens,
  };
}

export async function runPortWorker(ctx: PortWorkerContext): Promise<PortWorkerResult> {
  const siteDir = path.join(ROOT, "sites", ctx.slug);
  if (hasOpenDesignPort(siteDir) && fs.existsSync(path.join(siteDir, "app", "page.tsx"))) {
    appendPortLog(ctx.batchId, ctx.slug, ROOT, "PORT_SKIP", "already ported");
    return { ok: true, status: "SKIPPED", ms: 0, attempts: 0, tokens: 0 };
  }

  const timeoutMs = ctx.config.port_timeout_minutes_default * 60_000;
  let attempts = 0;
  let last: PortWorkerResult | null = null;

  while (attempts <= ctx.config.port_retry_max) {
    attempts++;
    const attemptPromise = runPortAttempt(ctx, attempts);
    const timed = await Promise.race([
      attemptPromise,
      sleep(timeoutMs).then(
        (): PortWorkerResult => ({
          ok: false,
          status: "FAILED_PORT",
          ms: timeoutMs,
          attempts,
          tokens: readPortTokens(ctx.slug),
          error: "timeout",
        })
      ),
    ]);

    last = timed;
    if (timed.ok) break;

    const kind = classifyPortError(timed.error ?? "", null);
    if (kind === "bail") break;
    if (!shouldRetryPortFailure(kind, attempts, ctx.config.port_retry_max)) break;

    appendPortLog(ctx.batchId, ctx.slug, ROOT, "PORT_RETRY", `after ${kind}`);
    await sleep(ctx.config.port_retry_backoff_ms);
  }

  const result = last!;
  const tokenFx = onPortCompleteTokens(ctx.tokenState, result.tokens);
  ctx.tokenState.batchTotal += result.tokens;

  if (tokenFx.warnBatch || tokenFx.exceeded) {
    appendPortLog(
      ctx.batchId,
      ctx.slug,
      ROOT,
      "PORT_TOKEN_BUDGET_WARN",
      `batch_total=${ctx.tokenState.batchTotal} budget=${ctx.tokenState.batchBudget}`
    );
  }
  if (tokenFx.warnSlug) {
    appendPortLog(
      ctx.batchId,
      ctx.slug,
      ROOT,
      "PORT_TOKEN_SLUG_WARN",
      `slug_tokens=${result.tokens}`
    );
  }

  appendPortLog(
    ctx.batchId,
    ctx.slug,
    ROOT,
    "PORT_SUMMARY",
    `slug=${ctx.slug} duration_ms=${result.ms} attempts=${result.attempts} exit=${result.ok ? "ok" : result.status}`
  );

  return result;
}

export function writeBailForSlug(batchId: string, slug: string, reason?: string): void {
  writeBail(batchId, slug, ROOT, reason);
}
