# 04 — Bake-off plan (Open Design vs Claude-direct)

> Planning doc. Defines the A/B that decides ARCH-1 (Open Design's fate). Rubric is fixed **before**
> either site is built so the winner is called on metrics, not vibes. No build/deploy happens here; this
> is the protocol. Candidate pick is deferred to Julius (a shortlist + a flagged tension are below).

## The question

Does Claude, given a rich evidence brief, produce a bespoke Next.js trade site at least as good as the
Open Design pipeline — without OD's machinery (daemon, MCP, double cursor-agent pass, artifact handoff)
and with fewer recovery rounds? Build the **same business twice**, score both on the rubric, decide.

---

## Comparison rubric (fixed upfront)

Each metric has a defined measurement and is captured for both paths. Scores recorded in
`docs/claude-migration/bake-off-results.md` (created at run time).

| # | Metric | How measured | Win condition |
|---|---|---|---|
| R1 | **Visual distinctness** | `npm run review:clone` Jaccard score vs the existing 27-site library (lower = more distinct); plus a rendered-screenshot swap test. | Score < 35 = PASS. Compare the two numbers; lower wins. |
| R2 | **Copy specificity** | Count of evidence-anchored details on the page (named person, review theme traceable to `source-evidence.json`, third-party/Google proof number, specific location). | ≥ 3 unique anchors, each traceable to evidence = PASS. Higher count + 100% traceable wins. |
| R3 | **Swap-test pass rate** | Per major section: would swapping only the business name leave it generic? | (business-specific sections / total sections). Higher wins; < 0.7 is a fail regardless of who wins. |
| R4 | **First-build check pass** | Of the 13 `run_site_source_checks.ts` checks, how many pass on the **first** build with no patch round; and number of patch rounds to green. | More checks green first-pass + fewer patch rounds wins. (Path A historically needed several.) |
| R5 | **Wall time** | Minutes from "brief ready" to "verified deploy" (build-marker + image-200 confirmed live). | Lower wins. |
| R6 | **Failure surface** | Count of recoveries: timeouts, crashes, manual interventions, missing-asset fixes. | Lower wins. |
| R7 | **Token / resource cost** | Path B: Claude output tokens. Path A: cursor-agent token spend + OD daemon wall cost. | Recorded, not pass/fail; informs the cost side of the decision. |

R1-R3 are **quality**; R4-R6 are **operational**; R7 is **cost**. The decision weighs quality first,
then operational, then cost (see Decision criteria).

---

## Candidate selection

**Criteria (from Julius):** fresh, a niche not yet built, `state=NEW` in `leads.db`, strong evidence.
Avoid `cutts-plumbing`-style already-polished sites (biases toward best-case). Avoid `emmo`-style
failed builds (conflates design failure with port failure).

**Tension found (flagging, not working around):** the current DB cannot satisfy all four criteria at
once.
- Built niches to avoid (would conflate niche-clone with path quality against the 27-site library):
  plumbers, bathroom fitters, roofers, fencing, painters/decorators, electricians, builders,
  landscaping, gas engineers, locksmiths.
- The **only untried niche present in the `NEW` pool is "garage doors" (4 leads)**, and it is weak:
  | id | name | region | phone | website | note |
  |---|---|---|---|---|---|
  | #202 | Garage Door Repairs G D R | Derby | 07828 489763 (mobile) | NO_WEBSITE | only clean one; score 58, thin brand |
  | #201 | Derby Overhead Company | Derby | (316)… US-format | NEEDS_MANUAL_REVIEW | bad phone data |
  | #203 | Your Garage Doors | Derby | 01332… landline | NO_WEBSITE | landline-only |
  | #204 | That Garage Door Company | Derby | 01332… landline | NEEDS_MANUAL_REVIEW | landline, low score |
- Genuinely untried, evidence-rich niches (plasterer, tiler, carpenter, joiner, glazier, scaffolder,
  tree surgeon) are **not in the DB at all** — they need a fresh prospect call.

**Proposed resolution (pick one, Julius decides):**
- **Option A (recommended): prospect one fresh lead in an untried, evidence-rich niche** (e.g.
  plasterer or tiler) at bake-off start. One `npm run prospect` Google Places call is deterministic
  and not a "build"; it yields a `state=NEW` lead with real reviews/photos so both paths have material.
  Strong evidence is what makes the comparison fair (a thin lead starves Path B's main advantage and
  Path A's OD generator equally, but for different reasons, muddying the result).
- **Option B: use garage-door lead #202** (untried niche, already `NEW`, no prospecting). Cleaner on
  "no new pipeline actions," but score 58 / thin brand weakens R2 (copy specificity) for both paths.
- **Do not** use a high-score built-niche lead (e.g. the score-88 Birmingham plumbers) — R1 would
  measure plumber-vs-plumber cloning, not path quality.

I will propose the specific lead for your approval before any build, per your earlier instruction.

**Pre-build equaliser:** both paths consume the **same** `brief.json` + `source-evidence.json` from one
shared gather/enrich run. The fork is *only* at strategy/design/build, so the rubric measures the paths,
not differences in input evidence.

---

## The two paths

### Path A — current Open Design pipeline (unchanged)
`prospect → gather → enrich → site:prepare` (heuristic strategy/section/voice) `→ od:prepare → OD daemon
generate` (cursor-agent + `design-taste-frontend`) `→ artifact.html → batch_port_invoke` (cursor-agent
ports artifact → `sites/<slug>/app/page.tsx`) `→ port_site_install → next build → review → deploy → verify`.
Characteristics: two cursor-agent passes, OD daemon (Node 24/pnpm), artifact handoff, hardlock checks,
historically several patch rounds. Deploys to alias `bakeoff-a-<slug>.vercel.app`.

### Path B — Claude-direct bespoke-from-brief (the new path)
`prospect → gather → enrich` (same deterministic scripts) `→` **Claude reads the evidence and writes the
understanding and the site directly** `→ next build → review → deploy → verify`. No OD, no artifact, no
cursor-agent, no port step. Deploys to alias `bakeoff-b-<slug>.vercel.app`.

**What Claude generates in Path B (explicit, per ARCH-2 + ARCH-8):**
1. `briefs/<slug>/site-strategy.json` — business angle, praise themes, named people, strongest proof,
   personality, evidence strength. (Replaces the heuristic `site_strategy.ts`; heuristic version run
   in parallel as a validator only.)
2. `briefs/<slug>/section-plan.json` — ordered sections with justification, `generic_plan: false`.
3. `briefs/<slug>/voice.json` — distinctive angle, register, `banned_for_this_business`.
4. The Next.js app itself: `app/page.tsx`, `app/globals.css` (design tokens + Tailwind layers/safelist),
   `app/layout.tsx` (fonts via `next/font/google`, metadata, JSON-LD, build marker),
   `components/SiteEnhancements.tsx`, `components/QuoteForm.tsx`, `data/brief.json` — applying the
   banned-phrase rules and swap test inline as it writes.
5. OG image + screenshots via the existing `og_generate` / `preview_site` scripts (not regenerated by
   model; ARCH-11 means no AI imagery).

Both paths run **sequentially on the main thread** (ARCH-4) and are verified by the same
`webfortrades-deploy-verify` routine (live build-marker + image-200 + clone score).

---

## Decision criteria (call it on the rubric)

**Kills Open Design (adopt Path B, retire OD):**
- R1 (visual distinctness) Path B ≤ Path A (equal or more distinct), **and**
- R2 + R3 (copy specificity, swap-test) Path B ≥ Path A, **and**
- R4 + R6 (first-build pass, failure surface) Path B better or equal, **and**
- R5 (wall time) Path B ≤ Path A, at an R7 token cost Julius judges acceptable.
- Plain-language form: Claude-direct is at least as good and less work. Given OD's overhead and that it
  was the source of the worst incidents (image-404, artifact-wipe footgun), "equal" favours killing it.

**Keeps Open Design (retain, build the `webfortrades-od-port` skill):**
- R1 Path A materially better (clone score notably lower / output visibly more bespoke) in a way Path B
  cannot close with a richer brief, **and** the visual gap outweighs Path B's operational/cost wins.

**Ambiguous (run a second round before deciding):**
- Path B wins copy/specificity/operational but Path A wins raw visual variety, **or** results are
  mixed across R1-R6. Resolution: give Path B a richer design brief (reference screenshots, an explicit
  design-system prior drawn from `library/`, a stronger section-plan) and rebuild Path B once. If Path B
  closes the visual gap, kill OD; if not, keep it. One re-round only, then decide.

A hard floor applies to both: any path scoring R3 < 0.7 (fails the swap test) does not "win" — it has
produced a clone and must be fixed before the comparison counts.

---

## Estimates (to be confirmed at run time)

| | Path A (OD) | Path B (Claude-direct) |
|---|---|---|
| Wall time | ~45-90 min single site **with one patch round**; historically multiple rounds over hours (OD generate 5-30 min + cursor-agent port 5-25 min + deploy 5-6 min + patches). | **Unknown — the key thing to measure.** Estimate ~30-50 min: strategy/section/voice (~few min) + component authoring (~10-20 min) + build/deploy (~6-8 min) + verify; target zero patch rounds. |
| Token / resource | cursor-agent ~450k/slug budget (Cursor's tokens, external) + OD daemon wall cost. | Claude output tokens — **unknown**; rough estimate ~150-300k (strategy/section/voice tens of k; component authoring ~100-200k). |
| Failure surface | known-high: image-copy gap, artifact-wipe footgun, port hangs (25-min timeout), section-id-or-FAIL coupling. | unknown; hypothesis lower (no artifact handoff, no port step, evidence-shaped brief → fewer hardlock patch rounds). |

Path B's wall time, token cost, and failure surface are the genuine unknowns; the bake-off exists to
turn those question marks into numbers. Everything Path A does is already characterised in
`01-discovery.md` and `memory.md`.

---

## Run protocol (when approved)

1. Julius approves the candidate lead (Option A prospect or Option B garage-door #202).
2. One shared `gather`/`enrich` run → frozen `brief.json` + `source-evidence.json`.
3. Build Path A and Path B sequentially (order: B then A, so Path B isn't anchored by seeing OD output).
4. Verify both via `webfortrades-deploy-verify`; record R1-R7 in `bake-off-results.md`.
5. Apply decision criteria; if ambiguous, run the one permitted Path B re-round.
6. Record the verdict on ARCH-1 and, if OD is kept, schedule the `webfortrades-od-port` skill (03 item 6).
