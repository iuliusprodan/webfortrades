# New-pipeline design TODOs (tracked findings, not yet actioned)

> Running list of architectural findings surfaced during the migration / bake-off setup. These are
> **tracked for the new-pipeline design + outreach-teardown steps — not acted on now.** Each notes
> where it came from and why it matters. None blocks the bake-off.

## TODO-1 — Gather pings OpenWA for contactability (vestigial ARCH-5 coupling)
- **Found:** 2026-06-13, during gather of the bake-off tiler candidates.
- **Symptom:** `gather` runs a WhatsApp-availability check via OpenWA (`whatsapp_gateway.ts`). With OpenWA up-but-erroring it returned `gateway_http_500` → degraded to `unknown` → lead state `NEEDS_MANUAL_CONTACT`. It made **no send** (read-only check), so not an ARCH-5 *violation*, but it is live OpenWA coupling that ARCH-5 says to remove.
- **Fix (outreach-teardown step):** replace the OpenWA contactability check with a non-network **UK-mobile-format check** (`07…` / `+447…`). Contactability then gates queue inclusion (ARCH-12), never an automated send. Removes the last OpenWA dependency from the gather path.
- **Severity:** low. Does not block builds (ARCH-12: contactability gates the queue, not the build).

## TODO-2 — "Fail-then-waive" gates are structurally the kill-switch anti-pattern
- **Found:** 2026-06-13, during enrich of `kyle-knowles-tiling` (bake-off lead). Enrich returned
  `source_quality = FAIL` → `lead_validity = INSUFFICIENT_EVIDENCE` → `ready_for_build = false` →
  `pitch_type = manual_review`, which production routinely **waives** to build anyway.
- **Why it matters:** a gate that is routinely waived is not a gate, it is a warning wearing a gate's
  costume. `FAIL → manual_review → waive → build` is the same shape as the `sending_enabled:false →
  flip-to-true → send → flip-back` pattern that ARCH-7 outlawed: a hard-sounding control that is
  defeated by a routine override, leaving the record (and the operator's mental model) wrong.
- **Also:** the gate conflates **source diversity** (how many third-party platforms corroborate) with
  **evidence richness** (how specific/usable the evidence is). Kyle Knowles is `INSUFFICIENT_EVIDENCE`
  purely because it is Google-only, yet its Google reviews are highly specific (named owner, rescue
  jobs, room/material detail). The heuristic can't tell thin from single-sourced-but-rich.
- **Fix (new-pipeline design):** make heuristic gates **binary** — either **block-real** (a true
  hard stop, no waive path) or **flag-and-proceed** (a warning that never pretends to block). Never the
  fail-then-waive middle. Where the judgment is "is this evidence actually rich enough?", that is a
  Claude judgment (ARCH-2), not a source-count heuristic.
- **Severity:** design-level. For the bake-off this FAIL is intentionally waived (documented), and is
  itself the sharpest ARCH-2 R2 test: can Path B write specific copy from "insufficient" evidence?

---
*Append new findings here as they surface. Acted on during the new-pipeline design + outreach-teardown
steps, not during the bake-off.*
