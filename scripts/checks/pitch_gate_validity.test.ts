import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { evaluatePitchReadiness } from "../pitch_gate.js";
import type { Lead } from "../db.js";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wft-pitch-gate-"));
const slug = "has-real-site-lead";
const briefDir = path.join(tmp, "briefs", slug);
fs.mkdirSync(briefDir, { recursive: true });
fs.writeFileSync(
  path.join(briefDir, "lead-validity.json"),
  JSON.stringify({
    has_real_website: true,
    pitch_type: "skip",
    lead_validity_status: "HAS_REAL_SITE_SKIP",
  })
);

const lead = {
  id: 1,
  slug,
  state: "DEPLOYED",
  business_name: "Example Co",
} as Lead;

const blocked = evaluatePitchReadiness(tmp, lead);
assert.ok(blocked.blockers.some((b) => /real website/i.test(b)));

const allowed = evaluatePitchReadiness(tmp, lead, { allowRedesignPitch: true });
assert.equal(allowed.blockers.some((b) => /real website/i.test(b)), false);

console.log("pitch_gate_validity: ok");
