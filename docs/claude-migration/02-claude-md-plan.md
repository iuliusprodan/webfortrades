# 02 — CLAUDE.md plan (root + nested hierarchy)

> Planning doc. Describes what the root `CLAUDE.md` contains and why, where nested `CLAUDE.md` files
> should live, and the hierarchy strategy. The root file is already written; nested files are proposed,
> not yet created.

## Design principle

Claude Code auto-loads the root `CLAUDE.md` every session and any directory `CLAUDE.md` when work
touches that directory. So the split is by **load frequency and blast radius**:

- **Root `CLAUDE.md`** — always loaded, so it holds only what must be true for *every* task: identity,
  the 12 invariants, the banned-phrase quick reference, verification discipline, skill pointers. Cap
  ~300 lines; detail is pushed to skills. This is principles + pointers, not procedures.
- **Nested `CLAUDE.md`** — loaded only when working in that subtree, so it holds local conventions that
  would be noise elsewhere (how a Next.js site is laid out, how scripts are structured).
- **Skills** — loaded on demand by name, so they hold the deep procedures (the full site-design
  playbook, the deploy-verify routine). A skill can be long; a `CLAUDE.md` cannot.

## Root CLAUDE.md — what's in it and why

| Section | Why it's at root (always-on) |
|---|---|
| Identity (3 lines) | Every task needs to know what WebForTrades is and that `leads.db` is the source of truth. |
| 12 architectural invariants | These are cross-cutting constraints; a violation anywhere is a bug. They must be in front of the model for every task, not buried in a skill it might not load. ARCH-7 especially — the config-write ban — has to be unmissable because it is the lesson of the worst incident. |
| Banned phrases (scannable) | The writing agent touches copy in many contexts (site, outreach, metadata); a quick inline reference prevents the most common slop without forcing a skill load. Authoritative list stays in `scripts/copy_voice_constants.ts` (drift rule states the constants win). |
| Verification discipline | Applies to *every* "is it done?" moment, not just builds. Three concrete failures from this project make it stick. |
| Skill pointers | The index that tells the model which skill to load for depth. |
| Hierarchy note | States precedence (invariant wins; skills may tighten, never loosen) so nested files and skills compose safely. |

What was deliberately **kept out** of root (pushed to skills): the full evidence-mining checklist, the
section-menu, the OD/port procedure, the deploy command sequence, the outreach queue format. These are
task-specific and long; loading them every session would blow the budget and bury the invariants.

## Nested CLAUDE.md files — proposal

**Definite (create during migration):**

- **`scripts/CLAUDE.md`** — runtime conventions for the deterministic pipeline:
  - tsx/Node, ES modules, `tsx scripts/x.ts` entry pattern; `better-sqlite3` via `scripts/db.ts` only.
  - **ARCH-7 restated at point of use:** never `fs.writeFile*` against `config.yaml`; config is read
    through the loader, never mutated. (This is where an engineer would otherwise reintroduce the bug.)
  - Deterministic stages contain no LLM calls (ARCH-2 boundary): prospect, gather, enrich, build,
    deploy, checks are pure Node. Claude-authored content enters as data (JSON/TSX), not as runtime
    model calls inside these scripts.
  - Checks are blocking unless explicitly marked warn; how to register a new check in
    `run_site_source_checks.ts`; stage-timeout usage (`lib/stage_timeout.ts`).
  - SQLite WAL + busy_timeout; Vercel alias work is serialised by the `.locks/` cross-process lock.
- **`sites/CLAUDE.md`** — conventions for a generated Next.js app (one file, not per-slug — see below):
  - Layout: `app/page.tsx`, `app/layout.tsx`, `app/globals.css` (Tailwind layers + safelist),
    `components/SiteEnhancements.tsx`, `components/QuoteForm.tsx`, `lib/build-marker.ts`,
    `data/brief.json`, `public/assets/images/`.
  - `next/font/google` only (no external font `<link>`); image paths root-relative under
    `public/assets/images/`; gallery masonry (3 cols ≥1024px, 2 cols 640-1023px, 1 mobile).
  - Quote form `#quote`; sticky CTA quote-only (ARCH/banned rules); footer business identity + small
    WebForTrades credit; build marker + JSON-LD with exact business name.
  - Static export (`next build` → `out/`); never run `build:site` after a bespoke/OD build if that
    path is retained (it restores the template skeleton).

**Recommended (create if they earn their keep):**

- **`briefs/CLAUDE.md`** — the artifact contract: what each JSON file means and which stage owns it
  (`brief.json`, `source-evidence.json`, `site-strategy.json`, `section-plan.json`, `voice.json`,
  `pitch-insight.json`, `lead-validity.json`, `deploy.json`), and the rule "a brief is business-led
  or it is wrong." High value because the new pipeline (ARCH-2) makes these Claude-authored.
- **`outreach/CLAUDE.md`** — the safety rules at point of use: WhatsApp is manual-only (ARCH-5),
  email through the single gated chokepoint (ARCH-6), logging must be truthful, contact-name evidence
  threshold. Short; restates invariants where the temptation to break them lives.

**Explicitly not recommended:**

- **Per-slug `sites/<slug>/CLAUDE.md`** — there are 27+ sites; per-slug context files would be 27+
  near-duplicates that drift. Per-site notes already live in `sites/<slug>/build-notes.md`. One shared
  `sites/CLAUDE.md` covers the conventions; site-specific facts belong in that site's `build-notes.md`
  and `data/brief.json`, not a CLAUDE.md.

## Hierarchy strategy

1. **Root = invariants + principles** (always loaded). Wins all conflicts.
2. **Directory = local conventions** (loaded in-subtree). Extends root; may add detail, never contradict.
3. **Skills = on-demand procedures** (loaded by name). May assert *tighter* rules than invariants
   (extra verification steps), may never *loosen* one.
4. **Precedence when they disagree:** invariant > directory convention > skill default. A skill or
   nested file that appears to relax an invariant is a bug to surface, not a valid local override.

This keeps the always-on context small (fast, cheap, invariants front-and-centre) while letting depth
live where it is only paid for when needed.
