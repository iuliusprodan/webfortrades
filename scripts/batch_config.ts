import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { ROOT } from "./site_config.js";

export interface BatchConfig {
  open_design_default: boolean;
  port_concurrency_default: number;
  port_concurrency_max: number;
  port_timeout_minutes_default: number;
  port_timeout_minutes_max: number;
  port_retry_max: number;
  port_token_budget_default: number;
  port_token_per_slug_default: number;
  port_poll_interval_ms: number;
  port_bail_grace_ms: number;
  port_retry_backoff_ms: number;
  deploy_concurrency_default: number;
  port_duration_warn_minutes_default: number;
  od_concurrency_default: number;
}

const DEFAULT_BATCH: BatchConfig = {
  open_design_default: false,
  port_concurrency_default: 4,
  port_concurrency_max: 8,
  port_timeout_minutes_default: 60,
  port_timeout_minutes_max: 120,
  port_retry_max: 1,
  port_token_budget_default: 6_000_000,
  port_token_per_slug_default: 450_000,
  port_poll_interval_ms: 5000,
  port_bail_grace_ms: 10_000,
  port_retry_backoff_ms: 30_000,
  deploy_concurrency_default: 3,
  port_duration_warn_minutes_default: 15,
  od_concurrency_default: 5,
};

export function loadBatchConfig(): BatchConfig {
  const configPath = path.join(ROOT, "config.yaml");
  if (!fs.existsSync(configPath)) return { ...DEFAULT_BATCH };
  const raw = parseYaml(fs.readFileSync(configPath, "utf8")) as {
    batch?: Partial<BatchConfig>;
  };
  return { ...DEFAULT_BATCH, ...raw.batch };
}

export function clampPortConcurrency(n: number, cfg = loadBatchConfig()): number {
  return Math.max(1, Math.min(cfg.port_concurrency_max, n));
}

export function clampPortTimeoutMinutes(n: number, cfg = loadBatchConfig()): number {
  return Math.max(1, Math.min(cfg.port_timeout_minutes_max, n));
}
