# Claude Code Skills adapted for WebForTrades (Cursor)

Date: 2026-06-10

This document summarises the Agent Skills open standard and how WebForTrades should use the same pattern inside Cursor.

Sources: [Anthropic engineering post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), [agentskills.io](https://agentskills.io/home), [Open Agent Skills specification](https://openagentskills.dev/docs/specification), [Claude API Agent Skills docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), Cursor create-skill guidance.

---

## What skills are

Agent Skills are **folders of reusable procedural knowledge** for AI agents. Each skill has:

```
skill-name/
├── SKILL.md          # Required: YAML frontmatter + instructions
├── examples/         # Optional: worked examples
├── references/       # Optional: deep docs
└── scripts/          # Optional: validation helpers
```

**Progressive disclosure** (three levels):

1. **Metadata** (`name`, `description` in frontmatter) - small, always discoverable (~100 tokens)
2. **SKILL.md body** - loaded when the task matches the description (<500 lines ideal)
3. **Bundled files** - examples, checklists, scripts loaded on demand

Skills package **workflows**, not facts the model already knows. They turn a general agent into a specialist for a repeatable task.

---

## When to create a skill

Create a skill when:

- The same multi-step procedure is repeated across sessions
- Rules are scattered and agents skip or contradict them
- Quality depends on checklists, examples, and gates
- Failure is costly (client-facing sites, outreach)

Do **not** create a skill for one-off tasks or information already in code comments.

WebForTrades qualifies because every site build repeats: enrich sources → extract story → plan sections → design → build → review → pitch prep. Agents keep defaulting to the template skin despite written rules.

---

## How skills store repeated procedures

| Mechanism | Use |
|-----------|-----|
| Frontmatter description | Triggers activation ("when building WebForTrades prospect sites") |
| Ordered steps in SKILL.md | Mandatory workflow phases |
| Checklists | Output artifacts and review gates |
| `examples/` | Good vs bad patterns |
| `scripts/` | Automated validation (future: `validate-site-strategy.ts`) |

Best practices from Anthropic and Cursor:

- Write description in **third person**, include **what** and **when**
- Keep SKILL.md **concise**; move long examples to linked files
- Use **imperative** instructions ("Write site-strategy.json before build")
- Include **failure conditions** ("If swap test passes, rebuild plan")
- Version with the repo; treat skill changes like pipeline changes

---

## Why this project needs a website design skill

Current state:

- Rules in `.cursorrules`, checklist, README, and scripts **conflict with template defaults**
- Creative briefs vary colours but not structure
- Review passes technical checks while output feels cloned
- No single artifact chain: strategy → sections → pitch

A dedicated **`webfortrades-site-design`** skill becomes the **source of truth** for business-led builds. Scattered rules remain for ops (deploy, outreach caps, db), but design creativity defers to the skill.

---

## How to adapt for Cursor

Cursor supports project skills at `.cursor/skills/<name>/` (auto-discovery) or any path referenced in `.cursorrules`.

WebForTrades uses **`skills/webfortrades-site-design/`** at repo root so it is visible in docs and script imports. Optional: symlink or copy to `.cursor/skills/webfortrades-site-design/` for Cursor native discovery.

| Claude Code | Cursor equivalent |
|-------------|-------------------|
| Skill auto-discovery from metadata | `.cursorrules` mandate + `@skills/...` or explicit read step |
| `SKILL.md` frontmatter | Same format |
| Bundled scripts | `npm run` scripts called from skill |
| Skill invocation | Agent reads file at start of build task |
| disable-model-invocation | Omit or set false if always required for site tasks |

---

## Recommended folder structure

```
skills/webfortrades-site-design/
├── SKILL.md
└── examples/
    ├── bad-clone-pattern.md
    ├── curletts-principles.md
    ├── site-strategy-example.md
    ├── section-plan-example.md
    ├── pitch-insight-example.md
    └── source-enrichment-checklist.md
```

Future additions:

```
skills/webfortrades-site-design/
├── scripts/
│   ├── validate-strategy.ts
│   └── clone-score.ts
└── references/
    └── approved-font-pairs.md
```

---

## How Cursor should use it

1. **`.cursorrules`** - "Before any site build, read `skills/webfortrades-site-design/SKILL.md`. Skill overrides scattered design rules on conflict."
2. **`scripts/site_checklist.ts`** - Add skill path to mandatory reads alongside `prompts/site-build-checklist.md`
3. **`scripts/build.ts`** - Fail fast if `site-strategy.json` missing
4. **Agent workflow** - Gather → strategy → section plan → creative brief → build → review
5. **Batch** - `batch_sites.ts` assigns creative constraints *after* strategy skeleton, not instead of it

---

## How the builder should be forced to read it

Enforcement layers (weakest to strongest):

1. **Documentation** - README pointer
2. **`.cursorrules`** - hard mandate for agents
3. **`requireSiteBuildChecklist()`** - extend to `requireSiteDesignSkill()`
4. **File gates** - build/review refuse without artifacts
5. **Automated clone score** - review.ts numeric threshold

Human builds need the same gates as agent builds.

---

## How to test whether the skill works

### Unit tests (future scripts)

- `site-strategy.json` schema validation
- Section plan must not equal default template order without justification flag
- Heading blacklist ("Questions before you ring.", etc.) absent unless explicitly allowed
- Source enrichment log has minimum attempted sources

### Integration tests

1. **Corvell replay (read-only)** - Run review clone-score against existing site; expect FAIL under new rules
2. **2-site batch** - New leads, full pipeline; batch review must fail if section order identical and headings match
3. **Swap test** - Replace business name in HTML mentally; reviewer marks fail if page still coherent

### Human acceptance

- Julius review: "Could this only be for this business?"
- Pitch-insight line uses real review detail
- Third-party proof visible when source exists
- Site with thin evidence is shorter, not padded

### Iteration loop

1. Build 2 sites with skill
2. Log failures in `memory.md`
3. Add example to `examples/` if pattern repeats
4. Tighten review gate
5. Repeat before 8-site batch

---

## Summary

Agent Skills are portable, folder-based playbooks with metadata + instructions + optional resources. WebForTrades should treat `skills/webfortrades-site-design/SKILL.md` as the creative contract for all future sites, enforced by `.cursorrules`, checklist extensions, artifact gates, and clone-aware review - not by palette rotation alone.
