# 03 — Skill port plan

> Planning doc. Inventories the Cursor-shaped `docs/`, `skills/`, and `prompts/` files and proposes, for
> each, a disposition (PORT_DIRECT / REWRITE / CONSOLIDATE / RETIRE) and a destination. Treats existing
> docs as first drafts, not gospel. This is a consolidation proposal, not a 1:1 port. Nothing is moved
> or deleted yet.

## Target skill set (what should exist after the port)

**Project-local — `.claude/skills/` (committed in-repo, ARCH-10):**

| Skill | Purpose | When Claude reads it |
|---|---|---|
| `webfortrades-site-design` | The creative contract: evidence → strategy → section plan → design → copy → review gate → pitch; the swap test; banned-phrase rationale. | Before creating/rebuilding/reviewing any site. |
| `webfortrades-enrich` | Evidence mining: Google Places, Facebook media policy, directory probes + identity/homonym verification, source-evidence schema, source-quality gate. | When gathering/enriching a lead. |
| `webfortrades-deploy-verify` | The hard verification routine: alias canonicalization, live build-marker + image-200 checks, state-sync between `deploy.json` and `leads.db`. | Before and after any deploy. |
| `webfortrades-outreach` | Manual WhatsApp queue generation + pitch anchoring + email chokepoint + `mark-sent`/`mark-reply`. | When generating the queue or sending email. |
| `webfortrades-od-port` *(conditional)* | OD generation + artifact port to Next.js. **Only if the bake-off keeps Open Design.** If OD is killed, this skill is never created and its source docs are archived. | Only if OD survives ARCH-1. |

**User-global — `~/.claude/skills/` (cross-project):**

| Skill | Purpose |
|---|---|
| `verification-discipline` | Prove success against live output, never inputs/logs/caches. The generalised form of the root verification section. |
| `evidence-before-edits` | Read the target and its provenance before changing or deleting it. |

## Disposition of existing files

### `skills/webfortrades-site-design/`

| File | Disposition | Destination | Notes |
|---|---|---|---|
| `SKILL.md` | **PORT_DIRECT** | `.claude/skills/webfortrades-site-design/SKILL.md` | Already skill-shaped (frontmatter + progressive disclosure). Light edit: drop Cursor/OD-specific lines into the conditional `od-port` skill; point banned phrases at `copy_voice_constants.ts`. |
| `examples/bad-clone-pattern.md` | PORT_DIRECT | same skill `examples/` | Negative reference; keep. |
| `examples/curletts-principles.md` | PORT_DIRECT | same | The aspirational method reference. |
| `examples/site-strategy-example.md` | PORT_DIRECT | same | Becomes the template Claude follows when it writes strategy (ARCH-2). |
| `examples/section-plan-example.md` | PORT_DIRECT | same | Same — ARCH-2 section plan. |
| `examples/pitch-insight-example.md` | CONSOLIDATE | `webfortrades-outreach` `examples/` | Belongs with the outreach skill now that pitch anchoring lives there. |
| `examples/source-enrichment-checklist.md` | CONSOLIDATE | `webfortrades-enrich` `examples/` | Anchors the enrich skill. |

### `docs/` (14 files)

| File | Disposition | Destination | Notes |
|---|---|---|---|
| `copy-voice-examples.md` | CONSOLIDATE | `webfortrades-site-design` (reference) | Good/bad copy; pairs with banned-phrase rationale. |
| `open-design-webfortrades-brief-format.md` | **SPLIT** | site-design + (conditional) od-port | The durable copy/layout/hero/reviews/services/map/iconography rules → site-design skill. The OD brief JSON schema half → `od-port` skill (conditional) or RETIRE if OD dies. This is the biggest consolidation win — ~530 lines, half durable, half OD-coupled. |
| `open-design-next-porting-notes.md` | SPLIT | deploy-verify + (conditional) od-port | Deploy pitfalls (alias, fonts, build marker, em-dash sweep) → `webfortrades-deploy-verify`. Artifact→Next porting mechanics → `od-port` (conditional). |
| `open-design-to-vercel-recipe.md` | CONSOLIDATE *(conditional)* | `od-port` skill | Only if OD survives. Else RETIRE to archive. |
| `open-design-deploy-checklist.md` | CONSOLIDATE *(conditional)* | `od-port` skill | Merge with the recipe into one OD skill. Else RETIRE. |
| `open-design-integration-plan.md` | RETIRE → archive | `docs/claude-migration/archive/` | MCP/daemon setup; historical. Resurrect into od-port only if OD survives. |
| `open-design-test-prompt-corvell.md` | RETIRE → archive | archive | Draft, never run. |
| `apify-facebook-tools-research.md` | RETIRE → archive | archive | Research; Apify mostly blocked in benchmarks. Reference only. |
| `apify-mcp-setup.md` | RETIRE → archive | archive | Cursor-MCP specific; not Claude Code. |
| `source-extraction-tools-research.md` | CONSOLIDATE | `webfortrades-enrich` (reference) | Distil the *policy* (public-only, no login, source priority) into the skill; archive the tool survey. |
| `source-extraction-benchmark-plan.md` | CONSOLIDATE | `webfortrades-enrich` (reference) | Benchmark method; fold the keep-rules, archive the rest. |
| `claude-code-skills-for-webfortrades.md` | RETIRE → archive | archive | The migration seed; superseded by this migration's actual docs. |
| `webfortrades-site-design-skill-implementation-plan.md` | RETIRE → archive | archive | The plan; now executed/superseded by ARCH-2 and these docs. |
| `webfortrades-website-pipeline-audit.md` | RETIRE → archive | archive | Diagnosis; superseded by `01-discovery.md`. Keep for history. |

### `prompts/` (3 files)

| File | Disposition | Destination | Notes |
|---|---|---|---|
| `site-build-checklist.md` | **REWRITE → CONSOLIDATE** | `webfortrades-site-design` + checks | ~390 lines, heavily duplicated with `.cursorrules` and the brief-format doc. Operational checks fold into the site-design skill's output checklist; drop the duplicated design prose. The mechanical gates are already code in `scripts/checks/`. |
| `outreach.md` | **REWRITE** | `webfortrades-outreach` | Rewrite for the manual-WhatsApp + gated-email model (ARCH-5/6). Keep the email sequence/templates; delete the automated-WhatsApp sequence machinery. |
| `manual-asset-request-template.md` | PORT_DIRECT | `webfortrades-enrich` (reference) | Small template; keep as a skill reference. |

### Root rule files

| File | Disposition | Destination | Notes |
|---|---|---|---|
| `.cursorrules` | **SPLIT → RETIRE** | root `CLAUDE.md` (done) + nested CLAUDE.md + skills | Operational rules already migrated to `CLAUDE.md`; remaining detail goes to skills/nested files. Archive the file once split; it is Cursor-specific and vestigial under Claude Code. |
| `README.md` | REWRITE (later) | stays at root | Needs a refresh pass to match the new pipeline; out of scope for the skill port, flagged for a later step. |
| `config.yaml` | keep | root | Pruned per `outreach-gating-rootcause.md` §6a in a later (code) step, not here. |

## Consolidation summary

- **9 Open-Design docs → 1 conditional skill (`webfortrades-od-port`) or 0.** The bake-off (ARCH-1)
  decides. The durable, non-OD rules inside those docs (hero patterns, copy/layout/map/iconography,
  deploy pitfalls) are extracted to `site-design` and `deploy-verify` regardless, so killing OD loses
  no durable knowledge.
- **3 source/Apify research docs → policy lines inside `webfortrades-enrich`** + an archive folder.
- **3 migration/audit/plan docs → archive** (history; superseded by `01-discovery.md` and these docs).
- **`.cursorrules` + `site-build-checklist.md` + brief-format copy rules → split across root CLAUDE.md,
  nested CLAUDE.md, and the site-design skill**, removing the ~40-rule triplication noted in discovery.

Net: ~23 Cursor-shaped files collapse to **4 project skills + 2 user skills + an `archive/` folder**,
with one conditional 5th skill pending the bake-off.

## Migration order (unblock the bake-off first)

1. **`webfortrades-site-design`** — required for Path B to build a bespoke site. Port `SKILL.md` +
   examples; fold in copy-voice rules + durable brief-format rules. *(First.)*
2. **`webfortrades-deploy-verify`** — required to verify both bake-off deploys honestly. Build from
   rootcause §7D + the deploy pitfalls in porting-notes + `.cursorrules` deploy rules. *(Second.)*
3. **`webfortrades-enrich`** — refine; the scripts already run, the skill guides Claude when evidence
   feeds ARCH-2 strategy. Needed for clean Path B input. *(Third.)*
4. **`webfortrades-outreach`** — not needed for the bake-off (outreach is post-decision). *(Later.)*
5. **User-global skills** — anytime; low effort.
6. **`webfortrades-od-port`** — only after ARCH-1 resolves to "keep OD." *(Conditional.)*

So the bake-off needs only items 1-2 (plus the existing deterministic gather/enrich scripts) in place.
