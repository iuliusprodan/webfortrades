# Open Design port parallelisation — design proposal

**Date:** 2026-06-12  
**Type:** Approved design (implementation in progress)  
**Status:** Approved 2026-06-12 with five tweaks (see §5.4, §6, §12)  
**Context:** The 2026-06-11 five-site batch ran five parallel Cursor subagents for OD → port → deploy manually. `batch:sites` parallelises gather, build, preview, review, and deploy, but **does not orchestrate Open Design generation or the port step**. Port timing is only captured ad hoc in `briefs/<slug>/batch-status.json`.

---

## 1. Problem

Today the OD path is:

1. `od:prepare` (local, fast)
2. MCP `start_run` (OD generation, ~5–15 min per site, already parallelised manually)
3. `od:check` (local, read-only)
4. **Port** — subagent reads `open-design-artifacts/<slug>/`, writes `sites/<slug>/`, drops `.od-port` marker (~2–22 min measured on 2026-06-11)
5. `next build` + `deploy` (or `build:site` with DS-02 guard)

Step 4 is the gap: it is agent-bound, unlogged by the orchestrator, and easy to run wrong (e.g. `build:site` wiping a port before DS-02 existed).

---

## 2. Goal

Extend `npm run batch:sites` so that, when Open Design is enabled for a batch:

- The **port step** runs inside the orchestrator as a **parallel subagent pool** (same pattern as today's manual five-site run, but first-class).
- Concurrency is configurable: **`--port-concurrency`** default **4**, hard cap **8**.
- Each port has a **per-slug timeout** default **60 minutes** (wall clock from subagent spawn to success or fail).
- **Retry once** on transient failure only; hard fail on auth, missing artifact, or gate failure.
- **One log file per slug**, tail-friendly, under the batch job folder.
- **Single-slug bail** without aborting siblings (failed job → `FAILED_PORT`, batch continues).

OD generation (`start_run`) remains a separate concern (MCP, already parallel). This proposal covers **port only**, triggered after `od:check` passes for that slug.

---

## 3. Proposed pipeline shape

Insert a new stage **between OD artifact QA and build/deploy**:

```
… → enrich → site:prepare → od:prepare → [OD generate, external/MCP]
  → od:check → PORT (new, parallel pool) → next build → clone review → preview → review → deploy
```

For **non-OD** batches, behaviour unchanged (`build:site` from template).

For **OD batches**, `build:site` must **not** run until port completes; post-port build is **`next build` in `sites/<slug>/`** (or a thin `scripts/port_build.ts` wrapper), never a template wipe.

### 3.1 Batch job state machine (per slug)

| Status | Meaning |
|--------|---------|
| `OD_ARTIFACT_READY` | `od:check` passed; waiting for port slot |
| `PORTING` | Subagent running |
| `PORTED` | `sites/<slug>/.od-port` + `app/page.tsx` + `out/` or successful `next build` |
| `FAILED_PORT` | Port failed after retry or timeout |
| `BAILED_PORT` | Operator or orchestrator cancelled this slug only |

Downstream build/review/deploy stages only run when status is `PORTED` (or `REVIEWED` etc. as today).

### 3.2 CLI flags (new)

```bash
npm run batch:sites -- \
  --location Bristol --niche plumbers --count 20 \
  --open-design true \
  --port-concurrency 4 \
  --port-timeout-minutes 60 \
  --no-outreach
```

| Flag | Default | Max | Notes |
|------|---------|-----|-------|
| `--open-design` | `false` | — | Enables OD path + port stage |
| `--port-concurrency` | `4` | `8` | Parallel port subagents |
| `--port-timeout-minutes` | `60` | `120` | Per-slug wall clock |
| `--port-retry` | `1` | `1` | Retries on transient errors only |

Existing `--concurrency` continues to govern gather/build/preview/review. **`--deploy-concurrency`** stays separate (Vercel lock). Port pool is independent so a slow port does not block gather on other leads.

### 3.3 Subagent contract

Each port worker receives a fixed prompt bundle:

- Inputs: `briefs/<slug>/`, `open-design-artifacts/<slug>/`, `docs/open-design-next-porting-notes.md`, section-variation matrix row if present.
- Outputs: `sites/<slug>/` with `.od-port`, `data-section-id` on every main block, `next/font/google`, no external font links, footer domain correct.
- Gates before exit: `npm run od:check -- --slug <slug>` (already passed), local `next build` succeeds, optional `evaluateSectionIntegrityHtml` on `out/index.html`.
- Must write: `briefs/<slug>/batch-status.json` fields `port_started_at`, `port_completed_at`, `port_ms`, `port_attempts`.

Invocation: reuse the same **Task / generalPurpose subagent** mechanism used on 2026-06-11, spawned by a new `scripts/batch_port_worker.ts` so the orchestrator can track PID/run id and enforce timeout.

### 3.4 Per-slug logging

Path (consistent with existing batch jobs):

```
data/batches/<batch-id>/jobs/<slug>.port.log
```

Format:

- ISO timestamp prefix on every line
- Stream subagent stdout/stderr verbatim
- Orchestrator events: `PORT_START`, `PORT_RETRY`, `PORT_TIMEOUT`, `PORT_OK`, `PORT_FAIL`, `PORT_BAIL`
- Final line: `PORT_SUMMARY slug=… duration_ms=… attempts=… exit=…`

Tail example:

```bash
tail -f data/batches/2026-06-12_09-00-00/jobs/nfs-plumbing-heating.port.log
```

The existing `jobs/<slug>.json` job file gains a `stages.port` block `{ ok, ms, attempts, log_path }` matching gather/build/deploy.

### 3.5 Timeout and retry policy

**Transient (retry once after 30 s backoff):**

- Subagent spawn failure, MCP/daemon blip
- `next build` OOM or EPIPE
- Playwright not needed for port; network flake copying assets

**Non-retry (fail immediately):**

- `od:check` fails or artifact missing
- Auth / `cursor-agent` not on PATH (house rule: stop and ask Julius)
- Agent loop / runaway generation inside port subagent (no second OD run inside port)
- Section integrity or banned-heading failures after port
- Timeout exceeded (default 60 min)

**Retry cap:** 1 (configurable only if we add `--port-retry 0` for strict mode later).

### 3.6 Bail one slug without killing the batch

Mechanisms (pick one primary, one escape hatch):

1. **Flag file:** `data/batches/<batch-id>/jobs/<slug>.bail` — orchestrator polls before/during port; creates `BAILED_PORT`, sends SIGTERM to subagent handle, releases pool slot.
2. **CLI while batch runs:** `npm run batch:bail-port -- --batch-id <id> --slug <slug>` (thin wrapper writing the bail file).
3. **Timeout as implicit bail** — slug moves to `FAILED_PORT`; batch report lists it; other slugs continue.

The orchestrator must **never** use `Promise.all` without per-task catch; use the existing `runPool` pattern where one failure does not reject the pool.

---

## 4. Trade-offs

### 4.1 Token cost: concurrency 4 vs 8

Port subagents are **long-context, multi-file edits** (artifact HTML/CSS, layout, globals, images, metadata). Rough order of magnitude from the five-site run:

| Concurrency | Active port subagents | Relative token burn | Notes |
|-------------|----------------------|---------------------|-------|
| **4** | Up to 4 | **1×** (baseline) | Matches typical machine: OD daemon 7456, one parent orchestrator, headroom for `next build` on completed ports |
| **8** | Up to 8 | **~1.8–2×** | Not fully linear (shared repo I/O, Cursor rate limits), but up to 8 concurrent large prompts |

At concurrency 8 you pay nearly double agent tokens for port-heavy batches, with diminishing returns once deploy (serialised at 2) becomes the bottleneck again.

**Recommendation:** default **4**; allow **8** only for overnight batches or when deploy is disabled (`--deploy false`).

### 4.2 Blast radius if one port goes off the rails

| Risk | At C=4 | At C=8 |
|------|--------|--------|
| Wrong shared file edited | 1 slug; others isolated by slug paths | Same per slug, but more simultaneous git working-tree churn |
| `build:site` invoked by rogue subagent | Wipes one `sites/<slug>/` if DS-02 marker missing | Up to 8 concurrent wipe risks |
| Runaway agent loop | 1 slot blocked until timeout (60 min) | Up to 8 slots; **pool starvation** if all loop |
| Disk / node_modules | 4× `npm install` in sites | 8×; SSD pressure |

Mitigations in design:

- Port subagent prompt **denylist**: never run `npm run build:site`, never MCP `start_run`.
- Pre-flight: `.od-port` must exist before stage marks `PORTED`.
- Timeout + bail file.
- Optional: `--port-concurrency` capped at 8, not unbounded.

### 4.3 Bailing a single subagent

See §3.6. Key principle: **orchestrator owns the process handle** (or run id), not fire-and-forget Task. On bail:

1. Write bail file → set job `BAILED_PORT`
2. SIGTERM subagent (grace 10 s) → SIGKILL
3. Release slot to pool
4. Append `PORT_BAIL` to `<slug>.port.log`
5. Batch report row: `status=BAILED`, others unchanged

Do **not** abort `batch:sites` global exit code unless `--fail-fast` is explicitly added later.

---

## 5. Success criteria ("I'll know it worked")

These are acceptance targets for the **first production 20-site OD batch** after implementation. Measure from `batch-start.json` to `batch-report.json` `completed_at`.

### 5.1 Wall-clock targets

| Scope | Target (port `--port-concurrency 4`) | Stretch (port C=8) | Measured baseline |
|-------|--------------------------------------|--------------------|-------------------|
| **Port phase only** (20 sites) | **≤65 min** | **≤40 min** | ~60 min modelled (§8) |
| **Full batch** (prospect → deploy, OD on, no outreach, no scroll video, OG optional/off) | **≤3 h** | **≤2 h 15 min** | 5-site pilot ~33 min; `og_generate` model ~90–100 min with old port assumptions |
| **Full batch + OG** (`og:batch --concurrency 4` after deploy) | **≤3 h 5 min** | **≤2 h 20 min** | OG adds **≤40 s** warm for 20 sites (June 2026 benchmark) |

**Pass:** `batch-report.json` `wall_clock_minutes` ≤ target and ≥18/20 slugs reach `DEPLOYED` with verified URL.

**Fail:** any slug stuck `PORTING` > timeout without moving to `FAILED_PORT`/`BAILED_PORT`; or batch wall > target + 20% without documented straggler (named in report).

### 5.2 Token spend ceiling

Port is the main unbounded agent cost. OD generation stays outside this gate (MCP, separate budget).

| Metric | Ceiling (20-site batch) | Warn at | Hard stop |
|--------|-------------------------|---------|-----------|
| **Port subagent tokens (sum all slugs, all attempts)** | **6M tokens** | **4.8M (80%)** | **Block new spawns only**; in-flight ports **finish normally** (see §5.4) |
| **Port tokens per slug (single slug, incl. 1 retry)** | **450k tokens** | **360k** | Block **new spawn** for that slug; do **not** kill an in-flight port |
| **OD generation (informational, not enforced by port worker)** | — | log in batch report | — |

**Pass:** 20-site batch completes with total port tokens ≤6M, or report explains overage with `port_summary.token_budget_exceeded: true` and no mid-port kills.

**Note:** Ceilings are initial guesses from five-site port sizes (multi-file reads, ~2–22 min wall). Recalibrate after first 20-site run; store actuals in `batch-report.json` → `port_summary.total_tokens`.

### 5.4 Approved tweaks (2026-06-12)

1. **Token overflow on in-flight port:** let it finish; log `PORT_TOKEN_BUDGET_WARN`; **no retry**; **never SIGTERM mid-port** for token reasons alone.
2. **`deploy_concurrency_default: 3`** shipped in this build (not a follow-up). Without it, port parallelisation is absorbed by the deploy queue.
3. **Global pause:** touch `data/batches/<batch-id>/pause` to stop **new** port spawns. In-flight ports complete or hit timeout normally. **Unpause:** `rm data/batches/<batch-id>/pause` (or `npm run batch:unpause-ports -- --batch-id <id>` if implemented).
4. **Tail helper:** `npm run batch:tail-ports -- --batch <batch-id>` multiplexes active `jobs/<slug>.port.log` files with `[slug]` prefixes.
5. **Slow-port guard:** see §12 (BBR ~22 min root cause + `od_port_require_section_ids` + `port_duration_warn_minutes_default`).

### 5.5 Pilot slow port (2026-06-11)

**Slowest:** `bbr-plumbing-heating-bristol-bristol-boiler-repairs` at **~22 min** (od_completed 11:17:58 UTC → deploy 11:42:02 UTC, minus ~2 min build/deploy).

**Why:** the port subagent did a full first-pass JSX/CSS integration of a large boiler-repair artifact **without** `data-section-id` markers on every section, then burned time on `next build` fix cycles before deploy; clone review later scored 39 (FAIL) for the shared section stack.

**Guard added:** `site_design.od_port_require_section_ids: true` (port stage fails validation if built HTML has fewer than 3 `data-section-id` values) plus `batch.port_duration_warn_minutes_default: 15` (log only, no kill).

### 5.3 Failure recovery when one subagent hangs

| Event | Target recovery time | How verified |
|-------|---------------------|--------------|
| **Operator bail** (`batch:bail-port`) | **≤30 s** from bail file write to slot free and next queued slug starting | Tail log shows `PORT_BAIL` then another slug `PORT_START` within 30 s |
| **Auto timeout** (default 60 min) | **≤60 s** after timeout fires to slot free | Job → `FAILED_PORT`; no pool stall >60 s |
| **Transient retry** | **≤90 s** backoff + retry start | Log shows `PORT_RETRY` then second attempt |
| **Hung batch (worst case)** | At most **one slot** lost for ≤60 min; other **C−1** ports continue | 19/20 sites still progress with C=4 |

**Pass:** Deliberately hang one test slug (infinite loop prompt in staging); bail it; confirm other three slots in a C=4 pool keep working and batch report shows one `BAILED_PORT` / `FAILED_PORT`, not batch abort.

---

## 6. Exact flags and config keys (names only)

Use these names in implementation so "build it" needs no renaming pass.

### 6.1 New npm scripts

| Script | Purpose |
|--------|---------|
| `batch:bail-port` | Write bail file for one slug in a running batch |
| `batch:tail-ports` | Multiplex `jobs/<slug>.port.log` with `[slug]` prefixes |

### 6.1b Pause / unpause

| Path | Action |
|------|--------|
| `data/batches/<batch-id>/pause` | **Create** (empty file) to pause new port spawns |
| Remove `pause` file | **Unpause** (or `rm data/batches/<batch-id>/pause`) |

While paused, the port pool sleeps on `batch.port_poll_interval_ms` and logs `PORT_POOL_PAUSED` once per slug queue check.

### 6.2 New flags on `batch:sites`

| Flag | Type | Default | Max / notes |
|------|------|---------|-------------|
| `--open-design` | boolean | `false` | Enables OD path + port stage |
| `--port-concurrency` | integer | `4` | Hard cap `8` |
| `--port-timeout-minutes` | integer | `60` | Hard cap `120` |
| `--port-retry` | integer | `1` | `0` or `1` only |
| `--port-token-budget` | integer | `6000000` | Total port tokens for batch; `0` = no limit |
| `--port-token-per-slug` | integer | `450000` | Per-slug port token cap |
| `--fail-fast-port` | boolean | `false` | Abort batch on first `FAILED_PORT` (opt-in) |

Existing flags unchanged: `--concurrency`, `--deploy-concurrency`, `--deploy`, `--preview-video`, `--dry-run-leads`, `--allow-manual-review`, `--no-outreach`.

### 6.3 New flags on `batch:bail-port`

| Flag | Required |
|------|----------|
| `--batch-id` | yes |
| `--slug` | yes |
| `--reason` | no (free text, appended to log) |

### 6.4 New keys in `config.yaml`

Under a new top-level block **`batch:`** (keeps `site_design` for build gates only):

```yaml
batch:
  open_design_default: false
  port_concurrency_default: 4
  port_concurrency_max: 8
  port_timeout_minutes_default: 60
  port_timeout_minutes_max: 120
  port_retry_max: 1
  port_token_budget_default: 6000000
  port_token_per_slug_default: 450000
  port_poll_interval_ms: 5000          # bail file + heartbeat check
  port_bail_grace_ms: 10000          # SIGTERM before SIGKILL
  port_retry_backoff_ms: 30000
  deploy_concurrency_default: 3      # shipped in port-parallel build (was 2)
  port_duration_warn_minutes_default: 15
  od_concurrency_default: 5          # informational default for manual/MCP OD wave; not port
```

Under **`site_design:`** (one key already exists; add port telemetry only):

```yaml
site_design:
  od_port_use_next_build_only: true   # existing (DS-02)
  od_port_require_section_ids: true   # fail port if <3 data-section-id in built HTML
```

### 6.5 New fields in batch artefacts (not config, but fixed names)

| File | New fields |
|------|------------|
| `data/batches/<id>/jobs/<slug>.json` | `stages.port`, `status` values `PORTING` / `PORTED` / `FAILED_PORT` / `BAILED_PORT` |
| `data/batches/<id>/jobs/<slug>.port.log` | per-slug port log |
| `data/batches/<id>/jobs/<slug>.bail` | bail signal file |
| `data/batches/<id>/batch-report.json` | `port_summary.wall_clock_minutes`, `port_summary.ok`, `port_summary.failed`, `port_summary.bailed`, `port_summary.total_tokens`, `port_summary.token_budget_exceeded` |
| `briefs/<slug>/batch-status.json` | `port_started_at`, `port_completed_at`, `port_ms`, `port_attempts`, `port_tokens` |

### 6.6 New script file names (for implementer)

| Path | Role |
|------|------|
| `scripts/batch_port_worker.ts` | One slug port subagent lifecycle |
| `scripts/batch_bail_port.ts` | CLI for `batch:bail-port` |
| `scripts/batch_tail_ports.ts` | CLI for `batch:tail-ports` |
| `scripts/batch_port_policy.ts` | Timeout/retry/token classification (unit-testable) |
| `scripts/batch_port_pool.ts` | Parallel port pool (pause, token gate, bail) |
| `scripts/batch_config.ts` | Load `config.yaml` `batch:` block |

---

## 7. Downstream steps: OpenWA, deploy, OG (20 sites, tighter window)

Assessment for **build/deploy batches only** (no outreach in `batch:sites`). "Tighter window" = ~20 verified URLs within ~3 h.

### 7.1 OpenWA — **no change required** for port parallelisation

| Aspect | Current behaviour | Coping at 20 sites? |
|--------|-------------------|---------------------|
| `batch:sites` | Never sends WhatsApp; `--no-outreach` enforced | N/A |
| WhatsApp availability check | `outreach.whatsapp_check_enabled: true`; runs at qualification/gather, not per deploy | Unaffected by port concurrency |
| Outreach send | `send:outreach-batch` serialises; `min_minutes_between_whatsapp: 3` | Separate day; 20 sites do not hit OpenWA during build |
| Session | `openwa:ensure` on demand | No burst of 20 WA checks when batch lands |

**Optional later (out of scope for port work):** batch preflight could cache WA status in `batch-report.json` before pitch day. Not needed for build window.

### 7.2 Deploy — **included in this build (`deploy_concurrency_default: 3`)**

| Aspect | Current behaviour | 20-site tight window |
|--------|-------------------|----------------------|
| Orchestration | `runDeployWorker` after review; `--deploy-concurrency` default **3** from config | **~35–40 min** wall for 20 deploys (down from ~50–60 at C=2) |
| Vercel alias | Cross-process lock `.locks/vercel-deploy` | Safe at C=3; monitor EPIPE |
| Live style verify | Playwright per deploy; ~5–6 min/site in polish runs | Still significant; not removed |
| OD ports | Must use `next build` + deploy, not template `build:site` | DS-02 `od_port_use_next_build_only` guards wipe |

**Verdict:** Deploy concurrency **3 is part of this build** so port speedup is not swallowed by the deploy queue.

### 7.3 OG — **already copes; no change required**

| Aspect | Current behaviour | 20-site tight window |
|--------|-------------------|----------------------|
| Fast path | `og:generate` / `og:batch`; shared browser, concurrency **4** (max 8) | **~30–40 s** warm for 20 sites (7 s for 5-site benchmark) |
| Scroll video | `scroll_video_enabled: false` | Off; no ffmpeg wave |
| Batch integration | OG **not** wired into `batch:sites` today; run after deploy | Acceptable: `og:batch -- --batch <batch-id> --concurrency 4` adds <1 min |

**Verdict:** OG is **not on the critical path** for a 3 h build window. No changes needed for port work. Optional future: `batch:sites --og true` calling `og:batch` post-deploy with same concurrency pool.

### 7.4 Summary table

| Step | Change needed for 20-site / port parallel? | Notes |
|------|---------------------------------------------|-------|
| **OpenWA** | **No** | Outreach is decoupled from build batch |
| **Deploy** | **Yes (C=3 default)** | Shipped with port parallel build |
| **OG** | **No** | Sub-minute at batch scale with existing `og:batch` |

---

## 8. Wall-clock estimates (20-site batch, port phase only)

**Measured port durations (2026-06-11 five-site batch, parallel subagents):**

| Slug | Port duration | Source |
|------|---------------|--------|
| nfs-plumbing-heating | **2.0 min** | `port_ms` in batch-status |
| stay-dry-roofing | **3.0 min** | `port_ms` |
| west-park-electrics | **~13 min** | `port_completed` − estimated OD end |
| alexander-s-painters-decorators | **~13 min** | same |
| bbr-plumbing-heating-bristol-bristol-boiler-repairs | **~22 min** | slowest; od_completed → pre-deploy |

Distribution for modelling: 4× each duration → 20 sites (same mix as pilot).

**Greedy wave scheduling (longest-first bin packing into C slots):**

| Concurrency | Port-phase wall clock | Calculation |
|-------------|----------------------|-------------|
| **4** | **~60 min** | 4 waves: 22 + 22 + 13 + 3 min |
| **8** | **~35 min** | 2 waves: 22 + 13 min |

**Sequential (no parallelism):** 2+3+13+13+22 × 4 = **260 min (~4.3 h)**.

These are **port only**. Full 20-site batch also includes (from June 2026 measurements):

- OD generation: ~8–15 min per site, parallelisable separately (~33 min wall for 5 in pilot)
- Deploy + live style verify: ~5–6 min per site, `--deploy-concurrency 3` (this build)

**Rough full-batch wall clock (OD + port + deploy, optimistic):**

| `--port-concurrency` | Port | + Deploy (20 sites, deploy C=3) | Order of magnitude |
|----------------------|------|----------------------------------|--------------------|
| **4** | ~60 min | ~35–40 min | **~2–2.5 h** port+deploy, excluding OD gen |
| **8** | ~35 min | ~25–30 min | **~1.5–2 h** port+deploy, excluding OD gen |

Doubling port concurrency saves **~25 min** on port; deploy C=3 saves **~15–20 min** vs C=2 on a 20-site run.

---

## 9. Do not do this

Common failure modes when parallelising batch port work:

1. **Run `build:site` after port** — wipes OD work; use `next build` only with `.od-port` / DS-02 guard.
2. **Share one `sites/` scratch directory across workers** — always one slug per subagent, fixed paths.
3. **Fire-and-forget subagents with no timeout** — one loop blocks a slot for hours; pool stalls.
4. **Retry on auth or `od:check` failure** — burns tokens; house rule is stop and ask Julius.
5. **Unbounded concurrency** — 20 parallel ports thrash disk, Cursor limits, and git; cap at 8.
6. **Single shared log file** — impossible to tail one slug; use `jobs/<slug>.port.log`.
7. **Fail the whole batch on one port error** — mark `FAILED_PORT`, continue, report at end.
8. **Port before `od:check`** — integrates broken artifacts at scale.
9. **Skip `data-section-id` in port prompt** — clone review assumes template order; batch fails later at scale.
10. **Parallel port + parallel `build:site` on the same slug** — race on `sites/<slug>/`; port must finish before any build step.
11. **Spawn OD `start_run` inside port subagent** — doubles agent cost and conflates two stages; port reads existing artifact only.
12. **Ignore deploy lock interaction** — port finishing does not mean deploy can run; keep deploy serialisation separate.

13. **Kill in-flight port on token budget** — block new spawns only; let running ports finish (§5.4).

---

## 10. Implementation status

Built as separate commits (2026-06-12):

1. `batch_config.ts` + `config.yaml` `batch:` block + `deploy_concurrency_default: 3`
2. `batch_port_policy.ts` + tests (token overflow no-kill)
3. `batch_port_control.ts` (pause/bail paths) + tests
4. `batch:bail-port` CLI
5. `batch:tail-ports` CLI
6. `batch_port_worker.ts` + `batch_port_pool.ts` + `batch_sites.ts` integration
7. `site_design.od_port_require_section_ids` validation helper

---

## 11. References

- `data/batches/2026-06-11-five-site/batch-report.json` — 32.8 min batch wall, clone FAIL all
- `briefs/*/batch-status.json` — per-slug `port_ms`, `port_completed`
- `memory.md` — `## Batch: 2026-06-11-five-site`
- `data/audits/2026-06-11-pipeline-audit.md` — PORT marked manual, outside orchestrator
- `scripts/batch_sites.ts` — existing `runPool`, per-job logs, deploy lock
