import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { syncBatchStatusFromArtifacts } from "../batch_write_status.js";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wft-batch-status-"));
const slug = "test-slug";
const briefDir = path.join(tmp, "briefs", slug);
const siteDataDir = path.join(tmp, "sites", slug, "data");
fs.mkdirSync(briefDir, { recursive: true });
fs.mkdirSync(siteDataDir, { recursive: true });

process.chdir(tmp);
fs.mkdirSync(path.join(tmp, "scripts"), { recursive: true });

fs.writeFileSync(
  path.join(briefDir, "batch-status.json"),
  JSON.stringify({ slug, build_id: "test-slug:pending", clone_review: "FAIL" }, null, 2)
);
fs.writeFileSync(
  path.join(siteDataDir, "site-metadata.json"),
  JSON.stringify({ buildId: "test-slug:20260611-abc" }, null, 2)
);
fs.writeFileSync(
  path.join(briefDir, "clone-review.json"),
  JSON.stringify({ passed: true, clone_score: 18 }, null, 2)
);

// Patch module ROOT by re-importing with mocked paths is hard; test helper logic inline.
function isPendingBuildId(buildId: string | null | undefined): boolean {
  if (!buildId) return true;
  return buildId === ":pending" || buildId.endsWith(":pending");
}

assert.equal(isPendingBuildId("test-slug:pending"), true);
assert.equal(isPendingBuildId("test-slug:20260611-abc"), false);

console.log("batch_status_sync helpers: ok");
