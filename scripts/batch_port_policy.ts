export type PortFailureKind =
  | "transient"
  | "auth"
  | "artifact"
  | "validation"
  | "timeout"
  | "bail"
  | "token_budget";

export interface PortTokenState {
  batchTotal: number;
  batchBudget: number;
  perSlugBudget: number;
}

export interface SpawnGateResult {
  allow: boolean;
  reason: string | null;
}

/** Block new spawns when budget exceeded; never signals kill in-flight. */
export function canSpawnPortWorker(
  state: PortTokenState,
  slugEstimatedTokens = 0
): SpawnGateResult {
  if (state.batchBudget > 0 && state.batchTotal >= state.batchBudget) {
    return {
      allow: false,
      reason: `batch token budget exhausted (${state.batchTotal}/${state.batchBudget})`,
    };
  }
  if (
    state.perSlugBudget > 0 &&
    slugEstimatedTokens > 0 &&
    slugEstimatedTokens >= state.perSlugBudget
  ) {
    return {
      allow: false,
      reason: `slug token estimate ${slugEstimatedTokens} >= per-slug budget ${state.perSlugBudget}`,
    };
  }
  return { allow: true, reason: null };
}

export function shouldWarnTokenBudget(state: PortTokenState): boolean {
  if (state.batchBudget <= 0) return false;
  return state.batchTotal >= state.batchBudget * 0.8;
}

export function isTokenBudgetExceeded(state: PortTokenState): boolean {
  if (state.batchBudget <= 0) return false;
  return state.batchTotal > state.batchBudget;
}

/** In-flight completion: log only, no retry, no kill. */
export function onPortCompleteTokens(
  state: PortTokenState,
  slugTokens: number
): { warnBatch: boolean; warnSlug: boolean; exceeded: boolean } {
  const nextTotal = state.batchTotal + slugTokens;
  const warnBatch =
    state.batchBudget > 0 && nextTotal >= state.batchBudget * 0.8;
  const exceeded = state.batchBudget > 0 && nextTotal > state.batchBudget;
  const warnSlug =
    state.perSlugBudget > 0 && slugTokens > state.perSlugBudget;
  return { warnBatch, warnSlug, exceeded };
}

export function classifyPortError(message: string, exitCode: number | null): PortFailureKind {
  const m = message.toLowerCase();
  if (/bail|bailed/.test(m)) return "bail";
  if (/timeout|timed out/.test(m)) return "timeout";
  if (/cursor-agent|auth|not on path|login required/.test(m)) return "auth";
  if (/od:check|artifact|missing asset|placeholder/.test(m)) return "artifact";
  if (/section.?id|validation|integrity/.test(m)) return "validation";
  if (/econnreset|epipe|oom|enotfound|socket hang up/.test(m)) return "transient";
  if (exitCode === 124) return "timeout";
  if (exitCode !== null && exitCode !== 0) return "validation";
  return "transient";
}

export function shouldRetryPortFailure(kind: PortFailureKind, attempts: number, retryMax: number): boolean {
  if (attempts >= retryMax) return false;
  return kind === "transient";
}

export function shouldWarnPortDuration(elapsedMs: number, warnMinutes: number): boolean {
  if (warnMinutes <= 0) return false;
  return elapsedMs >= warnMinutes * 60_000;
}
