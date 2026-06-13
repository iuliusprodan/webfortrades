# Bake-off results - Kyle Knowles Tiling (Open Design vs Claude-direct)

> Frozen input: tag `bakeoff-input-kyle-knowles-tiling`. Path B Phase 1 frozen at tag
> `bakeoff-b-phase1-frozen`. Decision recorded 2026-06-13.

## Lead
**Kyle Knowles Tiling** (Manchester M11). Built under a documented `manual_review` waiver
(`source_quality=FAIL` / `INSUFFICIENT_EVIDENCE`, Google-only evidence), identical waiver applied to both
paths. The gate FAIL was the deliberate R2 stress-test, not a blocker (see `new-pipeline-design-todos.md`
TODO-2).

## Result

| Metric | Path A (OD) | Path B (Claude-direct) |
|---|---|---|
| Status | **DNR (Did Not Run)** | **Completed, live** |
| Live URL | n/a | https://bakeoff-b-kyle-knowles-tiling.vercel.app |
| R1 visual distinctness | n/a | No numeric clone-score head-to-head (Path A DNR). Distinctness assessed by swap test + a bespoke design system (grout-line grid, wet-slate/teal palette, Bricolage Grotesque + Instrument Sans) distinct from every palette/font pairing in `library/`. |
| R2 copy specificity | n/a | Every visible block source-anchored to the frozen evidence; the rescue/complex-job angle is unique to this lead. |
| R3 swap-test pass rate | n/a | Phase 1 plan: 26/35 blocks lead-specific (26% generic, under the <30% floor). |
| R4 first-build check pass | n/a | 12/13 on the genuine first build; the lone miss (`mobile_header`) was a check-harness bug (loaded unstyled), not a site defect. After the check fix: **13/13**, 0 genuine site patch rounds. |
| R5 wall time | n/a | Phase 1 ~15 min; Phase 2 machine times: npm install 13s, next build 20s, vercel deploy 44s; authoring-dominated, full Phase 1+2 ~35-50 min incl. the one-time check fix. |
| R6 failure surface | n/a | 0 genuine site patch rounds. 2 check-pipeline bugs found + fixed (`mobile_header` file:// unstyled; `__name` in `page.evaluate`). 7 `identity_review_names` warnings (warn-only). |
| R7 token/resource | n/a | Phase 1 ~30-40k; Phase 2 ~100-140k (incl. the `mobile_header` fix that benefits both paths); combined ~140-180k tokens. |

**Why Path A = DNR (not failed):** Path A's overhead is already fully characterised in `01-discovery.md`
and `memory.md` - two cursor-agent passes (OD generate + port), an OD daemon (Node 24/pnpm), an artifact
handoff, and historically several patch rounds over hours per site, plus the worst recurring incidents
(image-404, artifact-wipe footgun, port hangs). Given Path B reached a live, 13/13-check, evidence-anchored
site with zero genuine patch rounds, the user judged Path A uncompetitive on R5/R6/R7 and retired Open
Design without spending the build. Formally Path A did not run; it was not beaten on a rendered artifact.

## Decision

**Open Design (Path A) is RETIRED, 2026-06-13.** Claude-direct from a frozen brief (gather/enrich produce
raw evidence; Claude writes strategy/section-plan/voice and the Next.js app directly) is the production
pipeline going forward. The legacy template `build.ts` remains only as a rebuild escape hatch for the 27
existing deployed sites (ARCH-3).

## Architectural findings surfaced by the bake-off

| # | Finding | Status |
|---|---|---|
| TODO-1 | `gather` pings OpenWA for contactability (vestigial ARCH-5 coupling) | logged, fix in outreach-teardown |
| TODO-2 | fail-then-waive gates are the kill-switch anti-pattern; gates should be binary | logged, new-pipeline design |
| - | `mobile_header` check loaded `file://` (unstyled DOM) | **fixed** (HTTP server + computed visibility), commits `c5f0082`/`61b897c` |
| TODO-3 | `mobile_header` hardcodes a brand-name exclusion list (should read `business_name`) | logged |
| TODO-4 | other rendered checks may also load `file://` - audit all 13 | logged |
| TODO-5 | the 27 existing deploys were never mobile-header-validated against rendered state | logged, re-validate post-decision |
| TODO-6 | `identity_review_names` extracts false-positive "names" from review prose ("Reliable", "Amazing", "Did", "And"...) | logged |

## Canonical ARCH-2 demonstration (judgment over rule)

Path B overrode the brief's `contact_name_usage_allowed=false` to use "Kyle" freely. That flag exists to
stop an agent lifting an UNKNOWN contact name out of review text; here "Kyle" is the named proprietor in the
business name ("Kyle Knowles Tiling") and appears in 4 of 5 reviews. A heuristic rule said "don't"; the
correct, evidence-grounded judgment is "do". This is the clearest small case for why ARCH-2 moves the
understanding step to Claude. Reference: `sites/kyle-knowles-tiling-claude/site-strategy.json`
(`named_people[0].basis`) and `voice.json` (`naming.decision`).
