# Outreach ledger audit — 2026-06-13

**Scope:** the 14 `leads.db` rows in state `PITCHED`, cross-checked against `data/outreach-log.jsonl`, `data/outreach-failures.jsonl`, the `whatsapp_sends` table, `MY_OWN_TEST_NUMBER`, and the git history of `config.yaml`.

**Method:** read-only. No rows, states, logs, or config were modified. Verdicts are evidence-based, not corrective.

---

## ⚠️ Headline finding (integrity bug — surfaced loudly)

**All 14 PITCHED rows are REAL SENDS to real UK business WhatsApp numbers, and every one was logged with `sending_enabled_final: false` and `test_recipient_only_final: true`.**

In plain terms: **the documented kill-switch did not stop live outreach.** The pipeline recorded `send_result: success` **in the same log row** as `sending_enabled_final: false`. That is internally contradictory unless the live-send code path does not honour the `sending_enabled` flag. Two rows carry hard gateway proof of transmission:

- `jt-plumbing` — `openwa_message_id=true_169165927247991@lid_3EB01DF281C663964264E9; delivery_status=accepted_by_openwa`
- `greens-precise-plumbing-heating-ltd` — `openwa_message_id=true_225335593422935@lid_3EB06CC63836665A05F467; delivery_status=accepted_by_openwa`

Supporting evidence that these were real, not drafts or test redirects:
- `bristol-plumbing-co` note: *"First real WhatsApp pitch. Text sent once, video sent once. No TEST prefix, no duplicate video."*
- `nfs-plumbing-heating` has a **real failure** logged at `16:23:01` (`"Session not ready (status=unknown). Open http://localhost:2886 and scan QR"`) followed by a **success 43s later** at `16:23:44` — the signature of a live gateway being brought online (QR scanned) and then actually sending. A backfill/draft never produces a session error.
- Every row: `test_prefix_used: false` and the logged recipient is the **real business number**, not `MY_OWN_TEST_NUMBER` (`447436427087`). So these were **not** test-redirected sends.
- A corroborating `whatsapp_sends` ledger row exists for each lead (15 rows / 14 leads; `bristol-plumbing-co` has two touch-1 rows — a `11:03:28` attempt and the `15:36:31` success).

**Git history confirms there was never a committed "sending on" window:** `config.yaml` has only ever been committed with `sending_enabled: false` (introduced in commit `946e63d`, 2026-06-11 22:15; no commit in history sets it `true`). Either (a) a human ran an explicit live-send script that bypasses the flag (e.g. `npm run send:whatsapp-pitch`, with gates `waived_by_user` — see jt/greens notes), or (b) the working-tree config was hand-edited to `true` and reverted without committing. The log field `sending_enabled_final: false` argues for **(a)**: the live path simply does not gate on `sending_enabled`.

**Also caught in the same audit (secondary integrity issues):**
- `jt-plumbing` was pitched with `pitch_gate_status=waived_by_user` and `waived_blockers=["contactability=NEEDS_MANUAL_REVIEW","source_quality=FAIL","clone_review=FAIL"]`. A site that **failed clone review and source quality** was sent to a real business. Its DB `contactability_status` is still `NEEDS_MANUAL_REVIEW`.
- `greens` was waived past a `location_mismatch` (Bristol prospect vs Swansea verified base) and sent anyway.

---

## Verdict table

Legend: **REAL_SEND** = ledger asserts a genuine send to the real business number (not test, not draft). Confidence reflects corroboration strength. No row qualified as TEST_SEND or DRAFT_BACKFILL.

| # | slug | lead id | recipient phone | pitched_at (UTC) | send_result | sending_enabled_final | test_only_final | test_prefix | txt/vid sent | gateway ack | Verdict | Conf. |
|---|------|--------:|-----------------|------------------|-------------|----------------------|-----------------|-------------|--------------|-------------|---------|-------|
| 1 | bristol-plumbing-co | 1 | 07972 176630 | 2026-06-09 15:36:31 | success | false | true | false | 1 / 1 | note: "first real pitch" | **REAL_SEND** | High |
| 2 | jt-plumbing | 5 | 07817 850729 | 2026-06-11 10:34:37 | success | false | true | false | 0 / 1 | `accepted_by_openwa` + msg_id | **REAL_SEND** | High |
| 3 | greens-precise-plumbing-heating-ltd | 8 | 07309 553552 | 2026-06-11 10:34:59 | success | false | true | false | 0 / 1 | `accepted_by_openwa` + msg_id | **REAL_SEND** | High |
| 4 | nfs-plumbing-heating | 7 | 07788 488486 | 2026-06-11 16:23:44 | success | false | true | false | 2 / 1 | preceded by real session failure | **REAL_SEND** | High |
| 5 | bbr-plumbing-heating-bristol-… | 9 | 07854 476888 | 2026-06-11 16:28:20 | success | false | true | false | 2 / 1 | content+attachment hashes | **REAL_SEND** | Med-High |
| 6 | west-park-electrics | 49 | 07889 228995 | 2026-06-11 16:31:44 | success | false | true | false | 2 / 1 | content+attachment hashes | **REAL_SEND** | Med-High |
| 7 | alexander-s-painters-decorators | 79 | 07944 444082 | 2026-06-11 16:34:27 | success | false | true | false | 2 / 1 | content+attachment hashes; `contactability_waived=true` | **REAL_SEND** | Med-High |
| 8 | rm-electrical | 48 | 07807 319073 | 2026-06-12 16:53:03 | success | false | true | false | 1 / 0 | content hash only | **REAL_SEND** | Med |
| 9 | a-m-t-roofing-penarth | 98 | 07464 879664 | 2026-06-12 16:55:46 | success | false | true | false | 1 / 0 | content hash only | **REAL_SEND** | Med |
| 10 | ellis-plumbing-heating-services-birmingham | 138 | 07854 027655 | 2026-06-12 16:57:14 | success | false | true | false | 1 / 0 | content hash only | **REAL_SEND** | Med |
| 11 | heattech-gas-services-ltd | 123 | 07506 042175 | 2026-06-12 16:59:02 | success | false | true | false | 1 / 0 | content hash only | **REAL_SEND** | Med |
| 12 | the-lock-dr | 132 | 07859 881354 | 2026-06-12 17:00:15 | success | false | true | false | 1 / 0 | content hash only | **REAL_SEND** | Med |
| 13 | chestnut-trees-fencing | 155 | 07790 163439 | 2026-06-12 17:02:10 | success | false | true | false | 1 / 0 | content hash only | **REAL_SEND** | Med |
| 14 | edgar-landscapes-driveways-ltd | 174 | 07504 684804 | 2026-06-12 17:04:17 | success | false | true | false | 1 / 0 | content hash only | **REAL_SEND** | Med |

**Confidence notes.** Rows 1–4 have independent corroboration (explicit "real pitch" note, OpenWA message IDs with `accepted_by_openwa`, or a real session-failure precursor). Rows 5–7 (rest of the 2026-06-11 five-site batch) carry per-message content hashes + attachment hashes + a sent video, consistent with real transmission. Rows 8–14 (the 2026-06-12 ten-build cohort) record `send_result: success` and a `whatsapp_sends` ledger row but only a single content hash (`m1_hash`) as evidence — no gateway `message_id`. They are logged as successful real sends; absent a gateway ack I rate them **Medium** rather than High, but there is **no** signal suggesting they were tests or drafts.

**One residual ambiguity, and how to close it definitively:** `test_recipient_only_final: true` in theory could mean the actual transmission was redirected to `MY_OWN_TEST_NUMBER` while the log stored the *intended* business number. Evidence is against this (`test_prefix_used: false`; distinct per-recipient `@lid` gateway IDs; the explicit "No TEST prefix" note). The 100%-certain confirmation is to ask the OpenWA gateway / the WhatsApp account for the **destination of message IDs** `true_169165927247991@lid` and `true_225335593422935@lid`. That requires the gateway to be up and is outside this read-only audit — flagging it as the one check that would fully settle recipient identity.

---

## Failures ledger

`data/outreach-failures.jsonl` contains exactly one row: `nfs-plumbing-heating`, `2026-06-11T16:23:01Z`, `send_result: failed`, `"Session not ready (status=unknown)… scan QR"`. This is the precursor to the NFS success 43s later (row 4) and is itself strong evidence the gateway was live and sending that afternoon.

---

## What this means for the migration

1. **The `sending_enabled: false` kill-switch is not a kill-switch for the live-send path.** Before any outreach work under the new pipeline, the real send routine (`send_whatsapp_pitch.ts` / `send:whatsapp-pitch`) must hard-gate on `sending_enabled` and `test_recipient_only`, and refuse with a loud error if either says "don't send." A flag that the batch path honours but the manual path ignores is worse than no flag, because the docs and memory both claim "no sends."
2. **`memory.md` is wrong on the record.** It repeatedly states "no outreach sent." The ledger says 14 real businesses were contacted on WhatsApp across 2026-06-09 → 2026-06-12. The migration should reconcile memory with the ledger, not trust memory.
3. **Gate waivers were used to send sites that failed QA** (`jt-plumbing`: clone_review=FAIL, source_quality=FAIL; `greens`: location_mismatch). Whatever the new pipeline's gate model is, `waived_by_user` must be an auditable, deliberate action — not a routine bypass.
4. **No state was changed by this audit.** If you want the record corrected (e.g. these are legitimate real pitches and should stay `PITCHED`, or they were unintended and need rolling back), that is a separate, explicit decision for you to make — this report only establishes the facts.

---

*Audit generated read-only on 2026-06-13. Source files: `leads.db` (`leads`, `whatsapp_sends`), `data/outreach-log.jsonl`, `data/outreach-failures.jsonl`, `config.yaml` git history, `.env` (`MY_OWN_TEST_NUMBER`).*
