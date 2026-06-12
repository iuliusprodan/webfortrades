import assert from "node:assert/strict";
import {
  parseBatchApprovalAnswer,
  leadsAfterBatchApproval,
} from "../outreach/batch_approval.js";
import {
  classifySendError,
  shouldHaltBatch,
} from "../outreach/hard_stops.js";
import { normaliseApprovalMode } from "../outreach/config.js";

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

console.log("batch_approval");

test("accepts yes", () => {
  const d = parseBatchApprovalAnswer("yes", 5);
  assert.equal(d.action, "proceed");
  if (d.action === "proceed") assert.equal(d.skipIndices.size, 0);
});

test("accepts yes-except with comma list", () => {
  const d = parseBatchApprovalAnswer("yes-except 3, 5", 5);
  assert.equal(d.action, "proceed");
  if (d.action === "proceed") {
    assert.deepEqual([...d.skipIndices].sort(), [3, 5]);
  }
});

test("rejects invalid except index", () => {
  assert.throws(
    () => parseBatchApprovalAnswer("yes-except 9", 5),
    /Invalid yes-except/
  );
});

test("aborts on no", () => {
  assert.deepEqual(parseBatchApprovalAnswer("no", 3), { action: "abort" });
});

test("marks yes-except rows as skip", () => {
  const leads = [
    { index: 1, slug: "a", channel: "whatsapp" as const },
    { index: 2, slug: "b", channel: "whatsapp" as const },
    { index: 3, slug: "c", channel: "whatsapp" as const },
  ];
  const decision = parseBatchApprovalAnswer("yes-except 2", 3);
  const out = leadsAfterBatchApproval(leads, decision);
  assert.equal(out[0]!.skip, undefined);
  assert.equal(out[1]!.skip, true);
  assert.equal(out[2]!.skip, undefined);
});

test("classifies gateway errors as hard stop", () => {
  const c = classifySendError(new Error("OpenWA session not ready."));
  assert.equal(c.hardStop, true);
  assert.equal(c.reason, "gateway_unreachable");
});

test("classifies WA unavailable as hard stop", () => {
  const c = classifySendError(new Error("Recipient not WhatsApp available."));
  assert.equal(c.hardStop, true);
  assert.equal(c.reason, "recipient_unavailable");
});

test("halts after more than one failure", () => {
  assert.equal(shouldHaltBatch(1), false);
  assert.equal(shouldHaltBatch(2), true);
});

test("defaults unknown approval mode to per_send", () => {
  assert.equal(normaliseApprovalMode(undefined), "per_send");
  assert.equal(normaliseApprovalMode("batch"), "batch");
});

console.log("All batch_approval tests passed.");
