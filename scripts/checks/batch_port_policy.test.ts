import assert from "node:assert/strict";
import {
  canSpawnPortWorker,
  onPortCompleteTokens,
  shouldRetryPortFailure,
  classifyPortError,
  shouldWarnPortDuration,
} from "../batch_port_policy.js";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

console.log("batch_port_policy");

test("blocks spawn when batch token budget exhausted", () => {
  const r = canSpawnPortWorker({
    batchTotal: 6_000_000,
    batchBudget: 6_000_000,
    perSlugBudget: 450_000,
  });
  assert.equal(r.allow, false);
});

test("allows spawn when under budget", () => {
  const r = canSpawnPortWorker({
    batchTotal: 1000,
    batchBudget: 6_000_000,
    perSlugBudget: 450_000,
  });
  assert.equal(r.allow, true);
});

test("in-flight token overflow warns only, never retried", () => {
  const w = onPortCompleteTokens(
    { batchTotal: 5_900_000, batchBudget: 6_000_000, perSlugBudget: 450_000 },
    500_000
  );
  assert.equal(w.exceeded, true);
  assert.equal(w.warnSlug, true);
  assert.equal(shouldRetryPortFailure("transient", 0, 1), true);
  assert.equal(shouldRetryPortFailure("auth", 0, 1), false);
});

test("retries transient once", () => {
  assert.equal(shouldRetryPortFailure("transient", 0, 1), true);
  assert.equal(shouldRetryPortFailure("transient", 1, 1), false);
  assert.equal(shouldRetryPortFailure("auth", 0, 1), false);
});

test("classifies auth errors", () => {
  assert.equal(classifyPortError("cursor-agent not on PATH", 1), "auth");
});

test("warns slow port at 15 min", () => {
  assert.equal(shouldWarnPortDuration(16 * 60_000, 15), true);
  assert.equal(shouldWarnPortDuration(10 * 60_000, 15), false);
});

console.log("\nAll batch_port_policy tests passed.");
