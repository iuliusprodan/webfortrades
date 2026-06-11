import assert from "node:assert/strict";
import { loadBatchConfig, clampPortConcurrency, clampPortTimeoutMinutes } from "../batch_config.js";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

console.log("batch_config");

test("loads deploy_concurrency_default 3", () => {
  const cfg = loadBatchConfig();
  assert.equal(cfg.deploy_concurrency_default, 3);
  assert.equal(cfg.port_concurrency_default, 4);
  assert.equal(cfg.port_concurrency_max, 8);
});

test("clamps port concurrency to max 8", () => {
  assert.equal(clampPortConcurrency(99), 8);
});

test("clamps port timeout to max 120", () => {
  assert.equal(clampPortTimeoutMinutes(999), 120);
});

console.log("\nAll batch_config tests passed.");
