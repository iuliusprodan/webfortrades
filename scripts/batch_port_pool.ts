import fs from "node:fs";
import path from "node:path";
import { loadBatchConfig, clampPortConcurrency, type BatchConfig } from "./batch_config.js";
import { isBatchPaused, appendPortLog } from "./batch_port_control.js";
import { canSpawnPortWorker, type PortTokenState } from "./batch_port_policy.js";
import { runPortWorker, type PortWorkerResult } from "./batch_port_worker.js";
import { ROOT } from "./site_config.js";

export interface PortPoolJob {
  slug: string;
  slot?: number;
}

export interface PortPoolSummary {
  wall_clock_ms: number;
  ok: number;
  failed: number;
  bailed: number;
  skipped: number;
  total_tokens: number;
  token_budget_exceeded: boolean;
  results: Record<string, PortWorkerResult>;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

function artifactReady(slug: string): boolean {
  return fs.existsSync(
    path.join(ROOT, "open-design-artifacts", slug, "artifact.html")
  );
}

export async function runPortPool(
  batchId: string,
  slugs: string[],
  options?: {
    concurrency?: number;
    config?: BatchConfig;
    dryRun?: boolean;
    tokenState?: PortTokenState;
  }
): Promise<PortPoolSummary> {
  const config = options?.config ?? loadBatchConfig();
  const concurrency = clampPortConcurrency(options?.concurrency ?? config.port_concurrency_default);
  const tokenState: PortTokenState = options?.tokenState ?? {
    batchTotal: 0,
    batchBudget: config.port_token_budget_default,
    perSlugBudget: config.port_token_per_slug_default,
  };
  const dryRun = options?.dryRun ?? process.env.WFT_PORT_DRY_RUN === "1";

  const queue = slugs.filter(artifactReady);
  const results: Record<string, PortWorkerResult> = {};
  let ok = 0;
  let failed = 0;
  let bailed = 0;
  let skipped = 0;
  const start = Date.now();

  let next = 0;
  let pausedLogged = false;

  async function worker(slot: number): Promise<void> {
    while (true) {
      if (isBatchPaused(batchId, ROOT)) {
        if (!pausedLogged) {
          appendPortLog(batchId, "_pool", ROOT, "PORT_POOL_PAUSED", "waiting for unpause");
          pausedLogged = true;
        }
        await sleep(config.port_poll_interval_ms);
        continue;
      }
      pausedLogged = false;

      const gate = canSpawnPortWorker(tokenState);
      if (!gate.allow) {
        appendPortLog(batchId, "_pool", ROOT, "PORT_SPAWN_BLOCKED", gate.reason ?? "budget");
        await sleep(config.port_poll_interval_ms);
        continue;
      }

      const index = next++;
      if (index >= queue.length) return;
      const slug = queue[index]!;

      const result = await runPortWorker({
        batchId,
        slug,
        slot,
        tokenState,
        config,
        dryRun,
      });
      results[slug] = result;
      if (result.status === "PORTED" || result.status === "SKIPPED") ok++;
      else if (result.status === "BAILED_PORT") bailed++;
      else failed++;
      if (result.status === "SKIPPED") skipped++;
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length || 1) }, (_, slot) => worker(slot)));

  const exceeded =
    config.port_token_budget_default > 0 &&
    tokenState.batchTotal > config.port_token_budget_default;

  return {
    wall_clock_ms: Date.now() - start,
    ok,
    failed,
    bailed,
    skipped,
    total_tokens: tokenState.batchTotal,
    token_budget_exceeded: exceeded,
    results,
  };
}
