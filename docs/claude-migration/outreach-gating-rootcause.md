# Outreach gating root-cause + new manual-WhatsApp architecture

> Read-only diagnosis, 2026-06-13. No code, config, git, or `memory.md` changes were made. Every claim is traced to a file + line. Where the code path was ambiguous, it is flagged rather than guessed.
>
> **One-line root cause:** `outreach.sending_enabled: false` is not a kill-switch. Every live WhatsApp send script *programmatically rewrites `config.yaml` to set `sending_enabled: true` and `test_recipient_only: false`* (`enableLiveOutreach()`), sends to the real business number, then rewrites the flags back to `false`/`true` in a `finally` block, and logs the **post-reset** values. The flag the operator trusts is flipped on by the code itself, used, and flipped off before anyone (or any log) reads it.

---

## Section 1 — Control-flow map

Every npm script / entrypoint that can transmit a real message, and how it treats each gate.
Cell values: **ENFORCED** (blocks the send), **BYPASSED-SELF** (the script disables the gate itself before sending), **WAIVABLE** (a flag/manifest field turns it off), **NOT_CHECKED** (never consulted on this path).

| Entrypoint (npm script) | file | `sending_enabled` | `test_recipient_only` | `approval_mode` | pitch gate / contactability | clone_review | source_quality | human gate present |
|---|---|---|---|---|---|---|---|---|
| `send:whatsapp-pitch` | `scripts/send_whatsapp_pitch.ts` | BYPASSED-SELF (L199 `enableLiveOutreach`; gateway check L491-496 passes because already flipped) | BYPASSED-SELF (L199 sets false; gateway guard L96-106 never fires) | NOT_CHECKED | NOT_CHECKED (only `state!=PITCHED` L113, phone L108, video L118, session L151) | NOT_CHECKED | NOT_CHECKED | `--live` flag (L90) |
| `send:outreach-batch` | `scripts/outreach/send.ts` | BYPASSED-SELF (L193) | BYPASSED-SELF (L193) | ENFORCED-ish (L223 `askPerSendApproval`) but WAIVABLE via `--approve yes` / `--approve-lead` (L224) | WAIVABLE: `send_one.ts` L132 `evaluatePitchReadiness(allowManualReview: spec.waiveContactability)`, L135 skips throw when `waive` | NOT_CHECKED (pitch gate doesn't read it) | NOT_CHECKED | `--live` flag (L339) |
| (no npm script) | `scripts/send_outreach_draft_pitch.ts` | BYPASSED-SELF (L88) | BYPASSED-SELF (L88) | NOT_CHECKED | WAIVABLE via `--waive-contactability` (L32 → `send_one.ts` L131) | NOT_CHECKED | NOT_CHECKED | `--live` flag (L52) |
| (no npm script) | `scripts/send_whatsapp_caption_pitches.ts` | BYPASSED-SELF (L378) | BYPASSED-SELF (L378) | NOT_CHECKED | NOT_CHECKED — manifest `waivedBlockers[]` is **logged only** (L211-212, L277-278), never enforced | NOT_CHECKED (listed in `waivedBlockers` cosmetically) | NOT_CHECKED (same) | `--live --confirm` + `--manifest` (L338) + UK-hours window (L359) |
| `outreach` (`--send`) | `scripts/outreach.ts` | BYPASSED-SELF (imports `disableSendingEnabled`; sends via `sendWhatsAppMessage` L27) | partial (imports `requireTestRecipientNumber`/`formatTestWhatsAppMessage` — see §3) | reads `approval_mode` (L41-52) | calls `evaluatePitchReadiness` (L35) | NOT_CHECKED | NOT_CHECKED | `--send` flag (L70) |
| `test:whatsapp-pitch` | `scripts/send_whatsapp_test_pitch.ts` | BYPASSED-SELF but **safe**: only `enableSendingEnabled()` (L244), keeps `test_recipient_only=true` | ENFORCED (L144 refuses unless true; recipient forced to `MY_OWN_TEST_NUMBER` L150/L254; refuses if lead phone == test number L158) | NOT_CHECKED | NOT_CHECKED | NOT_CHECKED | requires `test_recipient_only=true` |
| (email) `sendLeadEmail` | `scripts/send_email.ts` | **ENFORCED** (L97-101 throws if false; **no** self-enable, does not import `test_recipient`) | NOT_CHECKED (email has no test-redirect concept) | NOT_CHECKED (caller's job) | NOT_CHECKED (caller's job) | NOT_CHECKED | daily cap ENFORCED (L105-110) |

**Read this table as:** the WhatsApp paths each carry exactly one real gate — the `--live` CLI flag — and disable every config-level safety themselves. The email path is the opposite: `sending_enabled` is genuinely enforced and there is no self-enable.

Supporting cast (not entrypoints, but in the send path):
- `scripts/whatsapp_gateway.ts` — the only code that actually checks the flags at transmit time (`sendWhatsAppMessage` L491-496, `sendWhatsAppVideo` L597-602, `assertOutboundRecipientAllowed` L96-106). All three are made moot by the upstream `enableLiveOutreach()`.
- `scripts/whatsapp_send_guard.ts` — `PitchSendGuard.sendPitchSequence` orchestrates text+video; calls the gateway.
- `scripts/outreach/send_one.ts` — `sendDraftWhatsAppLead` (batch worker); the only WhatsApp path that calls the pitch gate at all.
- `scripts/test_recipient.ts` — defines the config-mutating helpers (the actual mechanism, §2).

---

## Section 2 — The actual bypass mechanism

The override is **not** a `--force`/`--skip-gates` flag. It is a pair of functions that **edit `config.yaml` on disk at runtime**, in `scripts/test_recipient.ts`:

```ts
// scripts/test_recipient.ts:28-41
export function enableSendingEnabled(): boolean {
  const content = fs.readFileSync(configPath, "utf8");
  if (/^(\s*sending_enabled:\s*)true\b/m.test(content)) return false;
  const updated = content.replace(/^(\s*sending_enabled:\s*)false\b/m, "$1true");
  if (updated === content) return false;
  fs.writeFileSync(configPath, updated);   // <-- flips the kill-switch ON
  return true;
}

// scripts/test_recipient.ts:100-108
export function enableLiveOutreach() {
  return {
    sendingEnabled: enableSendingEnabled(),       // sending ON
    testRecipientDisabled: setTestRecipientOnly(false),  // test-redirect OFF
  };
}

// scripts/test_recipient.ts:87-97 — runs in every sender's finally{}
export function resetOutreachSafety() {
  return {
    sendingReset: disableSendingEnabled(),        // sending back OFF
    testOnlyReset: setTestRecipientOnly(true),    // test-redirect back ON
    approvalModeReset: setApprovalMode("per_send"),
  };
}
```

How a send actually went out (e.g. `send_whatsapp_pitch.ts`):

```ts
// scripts/send_whatsapp_pitch.ts
90   if (!process.argv.includes("--live")) { ...exit(1); }   // the ONLY real gate
...
198  try {
199    const flags = enableLiveOutreach();                   // config.yaml: sending_enabled=true, test_recipient_only=false
203    const configAfterEnable = loadConfig();
204    if (!configAfterEnable.outreach.sending_enabled) throw ...   // confirms the flip worked
211    await guard.sendPitchSequence(recipient, pitchMessages, {...});  // real send to real number
216  } catch (err) { ... }
219  } finally {
220    const safety = resetOutreachSafety();                 // config.yaml: sending_enabled=false, test_recipient_only=true
225  }
...
230  const finalConfig = loadConfig();                       // reads the POST-RESET file
262    sending_enabled_final: finalConfig.outreach.sending_enabled,        // => false
263    test_recipient_only_final: finalConfig.outreach.test_recipient_only === true,  // => true
```

The gateway's own guard *would* have stopped this — but only if the flag were still false:

```ts
// scripts/whatsapp_gateway.ts:491-496  (the guard that SHOULD have stopped it)
const config = loadConfig();
if (!config.outreach.sending_enabled) {
  throw new Error("WhatsApp sending is disabled. Set outreach.sending_enabled: true in config.yaml.");
}
```

By the time `sendWhatsAppMessage` runs this check, `enableLiveOutreach()` has already written `true`, so the guard passes. **The code that should stop the send and the code that enables it are both inside the same process, and the enabler runs first.**

**The three batches map to three entrypoints (all using the same mechanism):**
- `bristol-plumbing-co` (1) → `send_whatsapp_pitch.ts` (log note: *"First real WhatsApp pitch"*; single message; txt 1/vid 1).
- `jt-plumbing`, `greens` (2) → `send_whatsapp_caption_pitches.ts` (log notes: `send_mode=caption`, `pitch_gate_status=waived_by_user`, real `openwa_message_id=true_…@lid_…`). *Caveat:* the current file hardcodes `messageId = null` (L258), yet these two rows hold real gateway IDs — so they were sent by an **earlier version** of this script (or a now-removed sibling) that captured the live `messageId`. The mechanism (`enableLiveOutreach`) is identical; only the messageId-capture differs.
- five-site `nfs`, `bbr`, `west-park`, `alexander` and ten-build `rm-electrical … edgar` (11) → `send:outreach-batch` → `send_one.ts::sendDraftWhatsAppLead` (log notes match exactly: `m1_hash`/`m2_hash`/`attachment_hash` with video on the five-site cohort; `m1_hash` + `scroll_video=disabled` + `batch_timing=true` on the ten-build cohort, set at `send_one.ts` L207-212; `contactability_waived=true` for alexander at L206).

**The parsed override that allowed each send:** `process.argv.includes("--live")` (+ `--confirm` for caption, + `--approve yes`/`--approve-lead` to skip per-send prompts in batch). That is the entire human gate. There is no environment check, no "are you sure", no record of *who* authorised it beyond the `waived_by_user` string the script writes about itself.

---

## Section 3 — `test_recipient_only` ambiguity (resolved)

**`test_recipient_only` never causes redirection in the live path. It is enforced only as a hard block, and that block is disabled before every live send. In the logs it is pure post-hoc metadata.**

The single enforcement site:

```ts
// scripts/whatsapp_gateway.ts:96-106
function assertOutboundRecipientAllowed(phone: string): void {
  const config = loadConfig();
  if (config.outreach.test_recipient_only !== true) return;   // <-- if false, allow ANY number
  const testNumber = requireTestRecipientNumber(mergedEnv());
  if (formatPhoneForWhatsApp(phone) !== formatPhoneForWhatsApp(testNumber)) {
    throw new Error("outreach.test_recipient_only is true. Only MY_OWN_TEST_NUMBER may receive WhatsApp sends.");
  }
}
```

It **throws** (blocks); it does **not** rewrite the recipient. And the live senders call `setTestRecipientOnly(false)` first (via `enableLiveOutreach`), so the early-return on line 98 fires and the function is a no-op. The actual transmit target is the unaltered business number:

```ts
// scripts/whatsapp_gateway.ts:522-533 (send-text) and 644-652 (send-video)
body: JSON.stringify({ chatId: chatIdForPhone(phone), text }),   // phone = the real lead.phone
```

Where the log field is written:
- `send_whatsapp_pitch.ts:263` reads it from the **post-reset** config (so logs `true`).
- `send_one.ts:245` and `send_whatsapp_caption_pitches.ts:319` **hardcode** `test_recipient_only_final: true` (and `sending_enabled_final: false`) as literals in the log object, regardless of what happened.

So `test_recipient_only_final: true` in the ledger is meaningless as evidence of where a message went. The only path that genuinely respects it is `send_whatsapp_test_pitch.ts`, which keeps it `true` and sends solely to `MY_OWN_TEST_NUMBER` (§1).

---

## Section 4 — Documentation drift inventory

Every place the repo claims sending is off / no sends happened, all contradicted by the 14 real sends (2026-06-09 → 06-12). Quoted text:

| File:line | Quoted claim |
|---|---|
| `config.yaml:24` | `sending_enabled: false   # set true only when Julius explicitly enables live sends` (implies false == no sends; the scripts flip it) |
| `config.yaml:25` | `test_recipient_only: true   # redirect all outbound test sends to MY_OWN_TEST_NUMBER` ("redirect" is false — code throws, never redirects, §3) |
| `memory.md` (2026-06-11 five-site) | *"All 5 deployed verified; READY_TO_PITCH false; no OG, no scroll video, no outreach"* — `nfs/bbr/west-park/alexander` were in fact sent 2026-06-11 16:23-16:34 |
| `memory.md` (2026-06-11 polish pass) | *"No outreach, no OG, no scroll video."* |
| `memory.md` (2026-06-11 og-and-scroll batch) | *"No outreach. All five `DEPLOYED`, none `READY_TO_PITCH`."* |
| `memory.md` (2026-06-11 outreach prep) | header *"2026-06-11 outreach prep (no sends)"* and *"No outreach sent as part of this implementation task."* |
| `memory.md` (2026-06-11 batch-approval mode) | *"No outreach sent as part of this implementation task."* and *"Always reset `sending_enabled: false` at batch end."* (the reset is exactly what hides the sends) |
| `memory.md` (2026-06-11 scroll-disabled) | *"WhatsApp touch 1 is a single message with the site link"* (describes live behaviour as hypothetical) |
| `README.md:30` | *"Draft-only until `outreach.sending_enabled` is true."* |
| `README.md:177` (config block) | `sending_enabled: false         # blocks outbound sends only` (it does not block the manual path) |
| `README.md:259` | *"Prepare drafts before any send. `sending_enabled=false` and `test_recipient_only=true` by default."* |
| `README.md:275` | *"Test sends to `MY_OWN_TEST_NUMBER` are never logged as contacted leads."* (true, but implies all real-number logging is gated) |
| `.cursorrules:144` | *"For outreach, always prepare drafts for approval first. Never send while `sending_enabled=false`."* (directly false for the WhatsApp path) |
| `.cursorrules:162` | *"keep `outreach.sending_enabled: false` and `outreach.test_recipient_only: true` unless Julius explicitly enables live sends"* |
| `prompts/outreach.md` | *"Sending NEVER enabled by default… set `test_recipient_only: true` until Julius approves"* and *"Never send while `sending_enabled=false` or `test_recipient_only=true` routes to test number"* (the routing claim is false, §3) |
| `prompts/site-build-checklist.md` (§14, §0) | *"Never auto-send while `test_recipient_only=true`."* / *"keep `outreach.sending_enabled: false`…"* |
| `skills/webfortrades-site-design/SKILL.md` | OG/preview section: *"Always prepare drafts for approval first. Never send while `sending_enabled=false`."* (mirrors `.cursorrules`) |

No `AGENTS.md` files exist in the repo (checked). The drift is concentrated in `memory.md`, `README.md`, `.cursorrules`, `prompts/`, and `SKILL.md`.

---

## Section 5 — Secondary gate bypasses (clone_review, source_quality, location)

**These were bypassed by the same family of mechanisms, in two variants — and crucially, two of the three named blockers were never enforced by any gate in the first place.**

1. **`jt-plumbing` (clone_review=FAIL, source_quality=FAIL, contactability=NEEDS_MANUAL_REVIEW) and `greens` (location mismatch)** were sent via `send_whatsapp_caption_pitches.ts`. That script **never calls the pitch gate**. The blockers live only in the manifest as a display array:
   ```ts
   // scripts/send_whatsapp_caption_pitches.ts:40, 211-212, 277-278
   waivedBlockers: string[];                         // from the --manifest JSON
   console.log(`Pitch gate: waived_by_user`);        // L211
   console.log(`Waived blockers: ${target.waivedBlockers.join("; ")}`);  // L212
   `waived_blockers=${target.waivedBlockers.join("|")}`,   // L278 — written to lead.notes
   ```
   So `clone_review=FAIL` and `source_quality=FAIL` were *acknowledged in writing and ignored in code* — there is no line that would have stopped the send.

2. **The batch path (`send_one.ts`)** does call the gate, but it is fully waivable:
   ```ts
   // scripts/outreach/send_one.ts:131-137
   const waive = spec.waiveContactability ?? false;
   const pitch = evaluatePitchReadiness(root, lead, { allowManualReview: waive });
   if (!pitch.ready && !waive) {
     throw new Error(`Pitch gate blocked: ${pitch.blockers.join("; ")}`);
   }
   ```
   When the manifest sets `waiveContactability: true`, the throw on L135 is skipped for **every** blocker, not just contactability. `alexander` shows this (`contactability_waived=true`, L206).

3. **clone_review and source_quality are not in the pitch gate at all.** `evaluatePitchReadiness` (`scripts/pitch_gate.ts:15-136`) checks: lead state, `verified_site_url`, `alias_status`, live `style_verified`, `build-notes.md`, creative-brief `location_validation_status` (L79, waivable via `allowManualReview` L80), `contactability_status` (L89), OG + hero assets (L94-99), batch `build_id` (L108), and `lead-validity has_real_website` (L120, waivable via `allowRedesignPitch`). It never reads `clone-review.json` or `source-quality.json`. So those two "blockers" were always advisory labels, never enforced gates.

**Same override family, two forms:** (a) a hand-authored `--manifest` with `waivedBlockers`/`waiveContactability` (caption + batch paths), and (b) a `--waive-contactability` CLI flag (`send_outreach_draft_pitch.ts:32`). Both ride on top of the universal `enableLiveOutreach()` config-flip from §2.

---

## Section 6 — New architecture (proposed)

### 6a. Delete the live WhatsApp send path

**Files to delete** (all transmit over OpenWA or exist only to enable it):

| File | Why |
|---|---|
| `scripts/send_whatsapp_pitch.ts` | live single-lead sender |
| `scripts/send_outreach_draft_pitch.ts` | live single-lead sender |
| `scripts/send_whatsapp_caption_pitches.ts` | live manifest sender (the `waived_by_user` path) |
| `scripts/send_whatsapp_test_pitch.ts` | OpenWA test sender (no automated WhatsApp at all going forward) |
| `scripts/whatsapp_gateway.ts` | OpenWA HTTP client (send-text/send-video/session/QR) |
| `scripts/whatsapp_send_guard.ts` | `PitchSendGuard` send orchestrator (WhatsApp-only) |
| `scripts/openwa_ensure.ts` | starts the OpenWA Docker stack |
| `scripts/test_openwa.ts` | OpenWA connectivity test |
| `scripts/outreach/send.ts` | batch WhatsApp orchestrator (email half is a stub, `send_one.ts:343-349`) |
| `scripts/outreach/send_one.ts` | batch WhatsApp worker (email half unimplemented) |
| `scripts/outreach/preflight.ts`, `batch_approval.ts`, `hard_stops.ts` | support only the batch WhatsApp orchestrator |
| `scripts/checks/whatsapp_gateway_guard.test.ts`, `openwa_session_resolve.test.ts` | tests for deleted gateway |

**Must change, not delete:**
- `scripts/test_recipient.ts` — **remove the config-mutating functions** (`enableSendingEnabled`, `disableSendingEnabled`, `setTestRecipientOnly`, `enableLiveOutreach`, `resetOutreachSafety`, `setApprovalMode`). These are the root enabler. Nothing should ever write `config.yaml` programmatically. Keep only `requireTestRecipientNumber`/`formatTestWhatsAppMessage` if still referenced, else delete the file.
- `scripts/outreach.ts` — currently drafts **and** can `--send` WhatsApp via `sendWhatsAppMessage` (L27, L70). Strip the send path; keep it as a draft-only tool, or fold into the new queue generator (6b).
- `scripts/pitch_gate.ts` — keep, but it should feed the queue inclusion rules (6b), and add `clone_review`/`source_quality` as real blockers (they are currently absent, §5).

**npm scripts to remove from `package.json`:** `send:outreach-batch`, `send:whatsapp-pitch`, `test:whatsapp-pitch`, `test:openwa`, `openwa:ensure`, `test:whatsapp-gateway`, `test:openwa-session`. (Repurpose `outreach` → draft/queue only.)

**Dependencies to remove from `package.json`:** **none.** OpenWA is an external Docker service reached over plain `fetch` (`localhost:2785`); there is no OpenWA npm package. Keep `imapflow` + `nodemailer` (email). This corrects the task's assumption that there were OpenWA deps.

**`config.yaml` keys to remove** (WhatsApp-specific): `outreach.test_recipient_only`, `outreach.whatsapp_mode`, `outreach.whatsapp_check_enabled`, `outreach.whatsapp_daily_cap`, `outreach.min_minutes_between_whatsapp`. Review `qualification.no_email_requires_whatsapp` / `disqualify_no_email_no_whatsapp` / `whatsapp_errors_manual_review` — these gate lead qualification on a now-manual channel; likely soften to "has a UK mobile" for queue inclusion. **Keep `sending_enabled`** — it now gates **email only**. Keep `daily_send_cap` (email). Reframe `channels`/`primary_channel`.
**`.env` keys now unused** (keep for history, mark dead): `OPENWA_API_URL`, `OPENWA_API_KEY`, `OPENWA_SESSION_ID`, `OPENWA_ROOT`, `OPENWA_MEDIA_HOST`, `MY_OWN_TEST_NUMBER`.

**Keep untouched (history):** `data/outreach-log.jsonl` (existing 14 rows), `data/outreach-failures.jsonl`, `outreach/contacted-leads.md`.

### 6b. New WhatsApp output: a manual-send queue

Generator: `npm run outreach:queue-whatsapp [--limit N] [--touch N] [--regenerate-pitches]`. Default `--limit 10`. Writes two files, overwriting cleanly each run (no stale entries):
- `data/outreach-queue-whatsapp.md` — human paste source.
- `data/outreach-queue-whatsapp.jsonl` — structured mirror (one object per lead; carries `specificity_score`, `anchor_type`, `anchor_quote`, `blocked` per §8).

Inclusion rules (all must hold):
- `contactability_status = CONTACTABLE`
- phone matches UK mobile (`07…`)
- lead state ∉ {`PITCHED`, `REPLIED`, `NEGATIVE`, `LOST`, `WON`}
- last touch outside the cooldown window for the next touch
- `clone_review != FAIL` **and** `source_quality != FAIL` (no waive path exists in the new design — if it failed QA, it does not enter the queue)
- `pitch-insight.json` exists (else emit the BLOCKED placeholder, §8.7)

Sort by evidence priority (highest specificity first). Per-lead `.md` block:

```
07XXX XXX XXX
Business Name Here

{personalised 2-3 sentence body — §8}

{site_url}

Attach: {path_to_preview_video_or_screenshot}
```

Blank line between leads. Phone first (paste into WhatsApp new-chat search), business name second (sanity check), body ready to paste verbatim, attachment path on its own line.

### 6c. Mark-sent (after I send manually)

`npm run outreach:mark-sent -- --slug <slug> --channel whatsapp --touch N [--undo]`. It:
- advances lead state (`NEW`/`DEPLOYED` → `PITCHED`, or bumps `last_touch` if already pitched),
- appends a row to `data/outreach-log.jsonl` with `channel: "whatsapp_manual"`, `openwa_message_id: null`, `sent_by: "manual"`, `sent_at: <now>`, `send_result: "manual_marked"`,
- appends to `outreach/contacted-leads.md`,
- makes **zero network calls**,
- `--undo` reverses the last mark for that slug+touch (state + log row).

### 6d. Email stays automated, one chokepoint

`sendLeadEmail` in `scripts/send_email.ts` is already the single SMTP caller (only `send_email.ts` and the self-only `test_email.ts` touch nodemailer) and already reads `sending_enabled` fresh and throws if false (L97-101) with **no** override flag and **no** config-flip. Harden it:
- It must remain the **only** function that calls the SMTP transport; every email path (`check_replies.ts` follow-ups, the queue/draft tool) imports it.
- Remove any ability to flip `sending_enabled` programmatically (already true for email — it never imported `test_recipient`; keep it that way).
- To enable email sending, the operator edits `config.yaml` by hand and commits. No CLI override, no waive.
- Note the cross-contamination risk that disappears once 6a lands: today a crashed WhatsApp send could leave `sending_enabled: true` on disk, which would silently un-gate email. Deleting the config-mutators removes this entirely.

### 6e. Reply handling

- **WhatsApp replies: manual.** `npm run outreach:mark-reply -- --slug <slug> --status replied|negative|lost|won [--note "…"]` updates `reply_status`/state in `leads.db`, zero network calls.
- **Email replies: keep auto-check.** `scripts/check_replies.ts` (`npm run followup`) is **alive**: it connects via `ImapFlow`, classifies inbox messages (`INTERESTED | QUESTION | NOT_NOW | NO | OUT_OF_OFFICE`), and can send follow-ups through the gated `sendLeadEmail`. It is email-only and touches no WhatsApp code, so it survives 6a untouched. Confirm it honors the negative-reply stop (`isNegativeReply`/`isDoNotContactReply` are imported) before relying on it for live email.

---

## Section 7 — `memory.md` reconciliation (drafts, not applied)

**Draft note A — outreach reality correction:**

```markdown
## 2026-06-13 outreach ledger correction (supersedes earlier "no sends" claims)

Earlier memory entries (2026-06-11 five-site, polish, og-and-scroll, outreach prep,
batch-approval) stated "no outreach sent." That was false. The 2026-06-13 audit
(data/outreach-audit-2026-06-13.md) found 14 real WhatsApp sends to real UK business
numbers, 2026-06-09 -> 2026-06-12:

- 2026-06-09: bristol-plumbing-co (send_whatsapp_pitch.ts)
- 2026-06-11: jt-plumbing, greens-precise-plumbing-heating-ltd (caption path; gateway IDs
  true_169165927247991@lid / true_225335593422935@lid, delivery_status=accepted_by_openwa),
  nfs-plumbing-heating, bbr-..., west-park-electrics, alexander-s-painters-decorators
  (send:outreach-batch)
- 2026-06-12: rm-electrical, a-m-t-roofing-penarth, ellis-..., heattech-gas-services-ltd,
  the-lock-dr, chestnut-trees-fencing, edgar-landscapes-driveways-ltd (send:outreach-batch)

Why the logs read "sending_enabled=false": every live sender flipped the flag on via
enableLiveOutreach() (scripts/test_recipient.ts), sent, then reset it in finally{} and
logged the post-reset value. The kill-switch never gated the manual WhatsApp path; the
only real gate was the --live flag. clone_review=FAIL / source_quality=FAIL (jt) and a
Bristol/Swansea location mismatch (greens) were "waived_by_user" via manifest fields the
send code never enforced.

Going forward: WhatsApp is manual handoff only (queue file + paste + mark-sent). Email is
automated through the single gated chokepoint (sendLeadEmail). No code may write config.yaml.
```

**Draft note B — WhatsApp account restriction + policy:**

```markdown
## 2026-06-13 WhatsApp account restriction (no automated WhatsApp, ever)

My WhatsApp account was restricted, almost certainly from OpenWA automation
fingerprinting. Attempted setup: OpenWA via OpenWA-API on localhost:2785 (Docker at
~/.cursor/openwa), session webfortrades-outreach, send-text + send-video over HTTP. 14
automated sends across 2026-06-09 -> 06-12 are the likely trigger.

Policy from now: no automated WhatsApp sends under any circumstances, for any reason. The
entire OpenWA path is deleted (see docs/claude-migration/outreach-gating-rootcause.md 6a).
WhatsApp outreach is manual only: pipeline generates a paste-ready queue, I send each
message myself in WhatsApp Web at my own pace, then run outreach:mark-sent. Email remains
the only automated channel, gated by sending_enabled with no programmatic override.
```

---

## Section 8 — Personalised WhatsApp pitch generation spec

The queue body is **generated per lead from that lead's evidence**, never a token-swapped template. (Token templates are what produced the 14 slop sends: `formatWhatsAppTouch1` in `scripts/outreach_message_format.ts` emits the same skeleton with name/url swapped.)

### 8.1 Source of truth (priority order)
1. `briefs/<slug>/pitch-insight.json` — `opening_line`, `why_this_angle`, `source_quote`
2. `briefs/<slug>/site-strategy.json` — `business_angle`, `customer_praise_themes`, `distinctive_phrases`, `strongest_proof_source`, `named_people`
3. `briefs/<slug>/source-evidence.json` — verified sources, `best_review_details`, location
4. `briefs/<slug>/brief.json` — `business_name`, `based_location`/`service_area`, `services`, `google_rating`/`google_review_count`

### 8.2 Required anchor — exactly one verifiable detail, drawn from evidence:
specific location (city + district/postcode), a real review theme traceable to review text, a third-party/Google proof point with a real number, a named person (only if `contact_name_confidence >= medium` and `contact_name_usage_allowed = true`), or an evidence-grounded service speciality. **If no anchor exists, do not invent one** — fall back to location-only and flag the block `<!-- low-specificity -->`.

### 8.3 Length — 2-3 sentence body + URL + close, total body < 400 chars. One-thumb message.

### 8.4 Voice (Julius) — first person, low-key; no exclamation marks; no em dashes; no salesy words (amazing, premier, professional, trusted, leading, top-rated, expert); no questions except an optional first line `Hi, is this {business_name}?` for no-contact-name leads; contractions fine; no emoji; British English (only where natural).

### 8.5 Shape (loose, not fill-in) — L1 identifier + the noticed detail; L2 what I made + why it ties to the anchor; L3 link + low-pressure close. Vary verbs, order, rhythm across the batch.

### 8.6 Batch anti-clone — before writing the file, swap-test every pair: if swapping `{business_name}` alone makes a message fit another lead, it is too generic — regenerate the weaker one on a different anchor. Record per message in the `.jsonl`: `anchor_type` (location_only | review_theme | third_party_proof | named_person | service_spec), `anchor_quote` (verbatim if quoted), `specificity_score` (low | medium | high).

### 8.7 Block on missing pitch-insight — if `pitch-insight.json` is absent, do not generate; emit:
```
07XXX XXX XXX
Business Name
<!-- BLOCKED: no pitch-insight.json for this slug.
     Run npm run pitch:generate -- --slug <slug> first. -->
```

### 8.8 Worked examples (real evidence from this repo)

**Example 1 — named person + review theme (specificity: HIGH).** Slug `cutts-plumbing`.
Anchor (named person + theme), from `briefs/cutts-plumbing/site-strategy.json`: `named_people: ["Daniel","Dan"]`; `customer_praise_themes[0] = "quality workmanship"`; `strongest_review_quote.author = "Candice"`, text *"Daniel did an amazing job of my bathroom… The workmanship was outstanding…"* (Google, cid 14442305237700391481); `strongest_proof_source = google 5 rating, 54 reviews`. Location `briefs/cutts-plumbing/brief.json` `based_location: "Leeds, LS17"`.

Generated body:
```
Hi, Julius here. Saw Candice's Google review of Cutts Plumbing in Leeds, the one about Daniel's workmanship on her bathroom.
I built a quick one-page site that leads with that and your 5.0 from 54 reviews.
{site_url} - happy to change anything, or take it down if it's not useful.
```
Passes swap test: "Candice", "Daniel", "Leeds", "5.0 from 54" are all lead-specific; swapping only the business name breaks it. `anchor_type: named_person`, `anchor_quote: "Daniel did an amazing job of my bathroom"`, `specificity_score: high`.

**Example 2 — third-party/Google proof + location (specificity: HIGH).** Slug `stephen-sharp-handyman-glasgow-west-end`.
Anchor (proof point + location), from `briefs/.../brief.json`: `google_rating: 4.9`, `google_review_count: 75`, `based_location: "Glasgow, G13"`; review theme "tidy finishes" from `pitch-insight.json` (`source_quote` = Mena's review). Use the number as the anchor, location as support.

Generated body:
```
Hi, Julius here. I came across your 4.9 on Google from 75 reviews around Glasgow G13, the tidy-finish jobs keep coming up.
I put together a one-page site built around that proof so it's the first thing people see.
{site_url} - tweak anything you like, or I'll take it down.
```
Passes swap test: "4.9 from 75", "Glasgow G13" are specific and evidence-backed. `anchor_type: third_party_proof`, `anchor_quote: "4.9 on Google from 75 reviews"`, `specificity_score: high`.

**Example 3 — location-only fallback / BLOCKED (specificity: LOW).** Real `NEW` lead from `leads.db`: `SO Locksmiths Ltd`, niche locksmiths, region Southampton, phone `07838 344090`, `website_status: NEEDS_MANUAL_REVIEW`. It has **no `briefs/` dir and no `pitch-insight.json`**, so the correct current output is the BLOCKED placeholder (§8.7):
```
07838 344090
SO Locksmiths Ltd
<!-- BLOCKED: no pitch-insight.json for this slug.
     Run npm run pitch:generate -- --slug so-locksmiths-ltd first. -->
```
Once evidence exists but yields no anchor (no named person, no review theme, no proof number), the location-only fallback would be — built only from its verified region, inventing nothing, and flagged for me to skim:
```
<!-- low-specificity -->
07838 344090
SO Locksmiths Ltd

Hi, is this SO Locksmiths? Julius here, I build sites for local trades.
I made a simple one-page site for a Southampton locksmith and thought I'd show you in case it's useful.
{site_url} - no obligation, I'll take it down if you'd rather.
```
This **fails** the swap test (any Southampton locksmith fits) — which is exactly why it carries `<!-- low-specificity -->` and `specificity_score: low`. It is acceptable only as a flagged fallback, not a default.

### 8.9 Generation command
`npm run outreach:queue-whatsapp [--limit N] [--touch N] [--regenerate-pitches]`. `--regenerate-pitches` forces fresh wording on the same evidence (when a prior batch sounded samey); default uses cached pitches if present.

---

## Contradictions / uncertainties I could not resolve read-only

1. **jt/greens real gateway message IDs vs the current caption script hardcoding `messageId = null` (L258).** The two rows hold real `true_…@lid_…` IDs, so they were sent by an earlier/sibling version of the caption sender. I could not find that exact version on disk (memory notes mention removing one-off batch helpers). The *mechanism* is unchanged; only messageId capture differs.
2. **Whether `config.yaml` was ever hand-edited to `true` and reverted without committing.** Git shows `sending_enabled` only ever committed `false` (commit `946e63d`), and the scripts flip it at runtime, so a manual edit is unnecessary to explain the sends — but I cannot rule it out from history alone.
3. **Recipient confirmation.** §3 shows the live path sends to the real `lead.phone` and never redirects. 100% confirmation that the two `@lid` IDs landed on the business numbers (not the test number) would require querying the OpenWA gateway/WhatsApp account, which is offline and out of read-only scope.
4. **`outreach.ts` (`npm run outreach --send`) exact behaviour.** I read its imports and arg parsing (it can send WhatsApp via `sendWhatsAppMessage` and imports `disableSendingEnabled`), but did not trace its full `--send` body. It is a live WhatsApp path and is on the delete/repurpose list regardless; flagging that its precise send logic was not line-traced end to end.
5. **`qualification.*` WhatsApp keys.** Removing automated WhatsApp changes what "contactable" should mean for queue inclusion. Whether to keep disqualifying no-email + no-WhatsApp leads is a policy call for you, not derivable from code.

*End of read-only diagnosis. No files outside `docs/claude-migration/` were created; nothing was modified.*
