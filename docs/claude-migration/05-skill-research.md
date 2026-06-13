# 05 — Claude Code skill ecosystem research

> Read-only survey (web research + assessment). No skills created, nothing installed, no git. Informs
> Step 5 (skill authoring); does not start it. Goal: find adoptable/forkable prior art before writing
> our 6 target skills from a blank page.

## The standard and the official sources

- **Open Agent Skills standard.** `SKILL.md` (YAML frontmatter + Markdown body; optional
  `scripts/`/`references/`/`assets/`) is now a cross-vendor open standard, originated by Anthropic and
  adopted by Anthropic, OpenAI, Google, Microsoft, and Cursor. Authoritative spec:
  `github.com/agentskills/agentskills`, `openagentskills.dev/docs/specification`,
  `agentskills.my/specification`. Practical cap repeated everywhere: keep `SKILL.md` under ~500 lines,
  push detail to `references/`. This validates our 02/03 plan (lean files + pointers).
- **`anthropics/skills`** (official; most skills **Apache-2.0**, document skills source-available).
  Contains `skill-creator` (how to author a skill) and `frontend-design` (design taste) among others —
  both directly useful to us (one as a model for authoring, one as a fork target).
- **Vendor skills** exist from Vercel, Stripe, Cloudflare, Netlify (via `vercel-labs/skills`,
  `vercel-labs/agent-skills`, MIT).

## Comparison table (relevant skills only)

| Skill / source | License | Maturity | Overlap with our target | Quality (read of SKILL.md) | Verdict |
|---|---|---|---|---|---|
| **`frontend-design`** — `anthropics/skills` | Apache-2.0 | Official, current | **High** with site-design's *design-direction* layer | Excellent, load-bearing: names exact AI-default looks to avoid, gives concrete structural/copy rules | **FORK_AND_ADAPT** |
| `skill-creator` — `anthropics/skills` | Apache-2.0 | Official | Meta (how to author our skills) | Specific authoring workflow | REFERENCE_ONLY |
| `agent-skills` (24 skills: ui-design, typography-audit 90-rule, ui-audit 35-rule, copywriting, agent-skills-creator, agents-md) — `mblode/agent-skills` | MIT | Active, broad | **Partial** with site-design (UI/typography QA) + authoring | Rule-dense and concrete (audits quantified by rule count) | REFERENCE_ONLY (mine rules; MIT allows fork) |
| `web-design-guidelines` (100+ rules), `react-best-practices` (40+), `writing-guidelines` (80+) — `vercel-labs/skills` | MIT | Vendor (Vercel) | Partial with site-design QA / copy | Substantial rule sets | REFERENCE_ONLY |
| `deploy-to-vercel` / `vercel-deploy-claimable` — `vercel-labs/skills` | MIT | Vendor (Vercel) | **High topic overlap** with deploy-verify… but **opposite stance** | Concrete, but explicitly tells the agent **not** to verify the live URL (see quote below) | **IGNORE for adoption / REFERENCE as anti-example** |
| `design-loop` — `jezweb/claude-skills` | **Not visible** | Community | Partial with review/deploy-verify (visual-verify loop) | Concrete visual-verification loop + pitfalls | REFERENCE_ONLY (license unconfirmed) |
| Anti-hallucination skills — `aedelon` (lobehub), `vishalchincholi1/Anti-Hallucination-Rules`, mcpmarket variants | Unconfirmed / test-case-narrow | Mixed community | **High topic overlap** with verification-discipline | Pattern is good (claim-type → tool → cite, forbidden-actions, confidence) but I could not fetch a verbatim passage from a permissively-licensed file (lobehub returned HTTP 403; the GitHub one is scoped to test-case generation) | **REFERENCE_ONLY** (adapt the *pattern*, not a file) |
| OSINT skills — `smixs/osint-skill`, `sumba101/OSINT-AI-Agent`, OpenOSINT | Mixed | Active community | Partial-pattern with enrich (phased pipeline, confidence grades, entity resolution) | Concrete but **person-targeting** (psychoprofile, breach lookups, Sherlock/Holehe) — wrong scope and ethics for public *business* enrichment | REFERENCE_ONLY (entity-resolution/confidence pattern only) |
| Awesome-lists — `karanb192/awesome-claude-skills` (50+), `VoltAgent/awesome-agent-skills` (1000+), `sickn33/antigravity-awesome-skills` (1500+), `travisvn`, `BehiSecc` | n/a (indexes) | Active | Discovery only | Indexes, not skills | REFERENCE_ONLY (discovery) |

**Verdict counts:** ADOPT_AS_IS 0 · FORK_AND_ADAPT 1 · REFERENCE_ONLY 7 · IGNORE 1 (the Vercel deploy skill, for adoption purposes).

## Quality-bar quotes (required for FORK / cautionary)

**`frontend-design` (FORK_AND_ADAPT) — proof of load-bearing content:**
> "AI-generated design right now clusters around three looks: (1) a warm cream background (near #F4F1EA)
> with high-contrast serif… (2) a near-black background with single bright acid-green… (3) a
> broadsheet-style layout with hairline rules, zero border-radius, and dense columns."

> "Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content
> actually is a sequence—like a real process or a typed timeline where order carries information."

> "A control should say exactly what happens when it's used: 'Save changes,' not 'Submit.' An action
> keeps the same name through the whole flow."

This is *exactly* WebForTrades' anti-clone philosophy expressed generically — it independently arrives at
our numbered-marker rule and CTA-naming discipline. It is the one clear fork target.

**`deploy-to-vercel` (IGNORE for adoption) — proof it is an anti-example for us:**
> "Do not curl or fetch the deployed URL to verify it works. Just return the link."

This is the precise opposite of our verification discipline and ARCH deploy rule (live build-marker +
image-200 check). The official community skill embodies the failure mode our `deploy-verify` skill
exists to prevent — which is itself strong justification for writing our own.

## Per-target sourcing strategy

1. **`webfortrades-site-design` → HYBRID (fork the design layer, scratch the domain layer).**
   Fork `anthropics/frontend-design` (Apache-2.0) for the design-direction/anti-default portion; mine
   `mblode/typography-audit` + `vercel web-design-guidelines` for QA rule ideas (REFERENCE). The
   evidence→strategy→section-plan→swap-test→UK-trade copy core is domain-specific and stays from-scratch
   (we already have `SKILL.md` + 6 examples to port — see 03).

2. **`webfortrades-enrich` → FROM-SCRATCH** (UK-trade, Google Places, directory-probe specifics).
   REFERENCE the OSINT *pattern* of confidence grades + two-source entity resolution (maps to our
   2-of-4 identity verify), but **not** the tooling — those skills profile people (breach/Sherlock),
   which is out of scope and ethically wrong for public business-listing enrichment.

3. **`webfortrades-deploy-verify` → FROM-SCRATCH** (Vercel-alias + live-marker specific). The official
   Vercel skill is an anti-example ("do not verify"); REFERENCE `design-loop`'s screenshot-verify
   pattern for the visual side. This is the clearest "write our own" case in the set.

4. **`webfortrades-outreach` → FROM-SCRATCH** (no community equivalent to manual-WhatsApp-queue +
   single-chokepoint-gated-email; it is our specific post-incident architecture). Optionally REFERENCE
   `mblode/copywriting` for voice-rule phrasing.

5. **`verification-discipline` (user-global) → FROM-SCRATCH using the common anti-hallucination pattern.**
   The pattern (route by claim type → run the right tool → cite/verify → declare confidence; explicit
   forbidden-actions list) is well-attested, but I could not confirm a permissively-licensed file to
   fork, and ours is better grounded — built on the three real failures already in `CLAUDE.md`. Adapt
   the pattern, author the file.

6. **`evidence-before-edits` (user-global) → FROM-SCRATCH.** No strong dedicated community skill found
   ("read before edit" searches returned deploy/QA, not a hygiene skill). Adjacent prior art:
   `mblode/plan-creator` ("explores code and docs first") and `anthropics/skill-creator`. Small enough
   to write cleanly; reference those for shape.

**Authoring aid (not a target skill):** use `anthropics/skill-creator` and `mblode/agent-skills-creator`
+ `agents-md` as references for *how* we structure and audit our own skills and CLAUDE.md.

## Honest assessment

**The ecosystem is richer than "sparse," but not for us.** There is a ratified cross-vendor standard, a
dozen awesome-lists indexing 50-1500+ skills, and first-party skills from Anthropic, Vercel, Stripe,
Cloudflare, and Netlify. The standard itself is mature and exactly the shape we planned for (lean
`SKILL.md` + `references/`). So "sparse" understates the volume.

**But volume is not fit.** Almost everything is one of: generic dev tooling (scaffold/audit/PR/deploy/
release), generic design-QA rule packs, or person-targeting OSINT. None of it matches WebForTrades'
actual domain — building UK on-spec trade sites *from verified business evidence*, with anti-clone and
manual outreach as first-class constraints. The two genuinely useful finds are (a) `frontend-design`,
which is forkable and philosophically aligned, and (b) the Vercel deploy skill as a *cautionary*
anti-example that validates our deploy-verify stance.

**Realistic split for the 6 targets: 0 adopted as-is, 1 forked, 5 from-scratch** (with `site-design`
being a hybrid — forked design layer over a from-scratch domain core, and several others borrowing a
*pattern* without forking a file). This is not the survey being lazy: I read the actual `SKILL.md`
content for the top candidates and downgraded the anti-hallucination skills to REFERENCE_ONLY precisely
because I could not quote a load-bearing, permissively-licensed passage from them. The honest conclusion
is that our domain is specific enough that from-scratch authorship — guided by our own discovery docs and
the one good fork — is the right call, and the blank-page-slop risk is mitigated by porting our existing
`SKILL.md` + 6 worked examples (03) rather than truly starting from nothing.

## Sources

- https://github.com/anthropics/skills · https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md · https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md
- https://github.com/agentskills/agentskills · https://openagentskills.dev/docs/specification · https://agentskills.my/specification/
- https://github.com/mblode/agent-skills
- https://github.com/vercel-labs/skills · https://github.com/vercel-labs/agent-skills/blob/main/skills/deploy-to-vercel/SKILL.md
- https://github.com/jezweb/claude-skills/blob/main/plugins/frontend/skills/design-loop/SKILL.md
- https://lobehub.com/skills/aedelon-claude-code-blueprint-anti-hallucination · https://github.com/vishalchincholi1/Anti-Hallucination-Rules
- https://github.com/smixs/osint-skill · https://github.com/sumba101/OSINT-AI-Agent
- https://github.com/karanb192/awesome-claude-skills · https://github.com/VoltAgent/awesome-agent-skills · https://github.com/sickn33/antigravity-awesome-skills · https://github.com/travisvn/awesome-claude-skills
