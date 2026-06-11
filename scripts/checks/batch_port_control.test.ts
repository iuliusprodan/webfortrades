import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  writePause,
  clearPause,
  isBatchPaused,
  writeBail,
  isSlugBailed,
  validatePortSectionIds,
  appendPortLog,
  portLogPath,
} from "../batch_port_control.js";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wft-port-ctrl-"));
const batchId = "test-batch";
const slug = "test-slug";
const root = tmp;

console.log("batch_port_control");

test("pause file toggles", () => {
  assert.equal(isBatchPaused(batchId, root), false);
  writePause(batchId, root, "testing");
  assert.equal(isBatchPaused(batchId, root), true);
  assert.equal(clearPause(batchId, root), true);
  assert.equal(isBatchPaused(batchId, root), false);
});

test("bail file detected", () => {
  writeBail(batchId, slug, root, "stuck");
  assert.equal(isSlugBailed(batchId, slug, root), true);
});

test("section id validation", () => {
  const html = `<section data-section-id="hero"></section><section data-section-id="svc"></section><section data-section-id="contact"></section>`;
  const v = validatePortSectionIds(html, 3);
  assert.equal(v.ok, true);
  assert.equal(v.count, 3);
  assert.equal(validatePortSectionIds("<section></section>", 3).ok, false);
});

test("port log append", () => {
  appendPortLog(batchId, slug, root, "PORT_START");
  const log = fs.readFileSync(portLogPath(batchId, slug, root), "utf8");
  assert.match(log, /PORT_START/);
});

console.log("\nAll batch_port_control tests passed.");
