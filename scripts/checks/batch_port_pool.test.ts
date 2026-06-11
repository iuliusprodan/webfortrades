import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runPortPool } from "../batch_port_pool.js";
import { ROOT } from "../site_config.js";
import { loadBatchConfig } from "../batch_config.js";

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

console.log("batch_port_pool");

await test("empty queue when no artifacts", async () => {
  const summary = await runPortPool("test-empty-queue", ["no-artifact-slug-xyz"], {
    concurrency: 2,
    config: loadBatchConfig(),
  });
  assert.equal(Object.keys(summary.results).length, 0);
  assert.equal(summary.failed, 0);
});

await test("dry-run port completes one slug", async () => {
  const slug = `batch-pool-dry-${Date.now()}`;
  const batchId = `test-${slug}`;
  const artifactDir = path.join(ROOT, "open-design-artifacts", slug);
  const siteDir = path.join(ROOT, "sites", slug);
  const batchDir = path.join(ROOT, "data", "batches", batchId);
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.mkdirSync(path.join(batchDir, "jobs"), { recursive: true });
  fs.writeFileSync(path.join(artifactDir, "artifact.html"), "<html></html>");

  const prev = process.env.WFT_PORT_DRY_RUN;
  process.env.WFT_PORT_DRY_RUN = "1";
  try {
    const summary = await runPortPool(batchId, [slug], {
      concurrency: 1,
      config: loadBatchConfig(),
      dryRun: true,
    });
    assert.equal(summary.ok, 1);
    assert.equal(summary.results[slug]?.status, "PORTED");
    assert.ok(fs.existsSync(path.join(siteDir, ".od-port")));
  } finally {
    if (prev === undefined) delete process.env.WFT_PORT_DRY_RUN;
    else process.env.WFT_PORT_DRY_RUN = prev;
    fs.rmSync(artifactDir, { recursive: true, force: true });
    fs.rmSync(siteDir, { recursive: true, force: true });
    fs.rmSync(batchDir, { recursive: true, force: true });
  }
});

console.log("\nAll batch_port_pool tests passed.");
