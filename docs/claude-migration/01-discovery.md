# Phase 1 Discovery — WebForTrades pipeline (Cursor+OpenDesign → Claude Code)

> Read-only system map produced 2026-06-13. No files were modified, no builds/deploys/git actions were run during discovery. This is the permanent reference for the migration.
>
> Method note: assembled from a full read of `memory.md`, `README.md`, `.cursorrules`, `config.yaml`, `package.json`, the site-design skill, every file in `docs/` and `prompts/`, the `scripts/checks/` suite, the batch orchestration scripts, the SQLite schema, and direct inspection of briefs/sites/batches on disk.

---

## 1. What the project does

WebForTrades is a **single-operator, local-first "spec site" agency pipeline**. It finds UK trade businesses (plumbers, electricians, roofers, painters, bathroom fitters, etc.) that have weak or no website, builds each one a bespoke one-page Next.js marketing site **on spec** (the business owes nothing until they say yes), QA-checks and deploys it to Vercel under a business-branded alias, then runs a WhatsApp-first (email-backup) outreach sequence to pitch it. The whole thing runs from one repo on Julius's Mac, orchestrated today by a Cursor agent reading `.cursorrules` + prompt files, with `leads.db` (SQLite) as the single source of truth for lead state. The package name is `autonomous-web-agency`; the operating brand is WebForTrades (`contact@webfortradesuk.co.uk`).

The defining tension in the codebase — visible all through `memory.md` and the audit docs — is **template-led vs business-led design**. The original pipeline copied a fixed Next.js template and swapped tokens, which produced sites that scored 100/100 on "creative uniqueness" yet were obvious clones of each other. The entire recent history (2026-06-08 → 2026-06-12) is the project fighting its way out of that: first by adding evidence/strategy/section-plan artifacts, then by routing design through **Open Design** (a local bespoke-HTML generator) and a growing wall of "hardlock" copy/layout checks.

---

## 2. Pipeline stages (lead → deployed site)

The pipeline is **deliberately split** between deterministic Node/TS stages and two LLM/agent stages. Critical fact for the migration: **all of the "strategy" and "design direction" generation is heuristic/regex Node code — not an LLM.** The only places an LLM does creative work today are (a) the Open Design generation + cursor-agent port (writes the actual Next.js code) and (b) Gemini image generation (optional, dry-run only so far).

| # | Stage | What it does | Implemented by | Runtime / executor | Artifacts | Known failure modes (from memory.md) |
|---|-------|--------------|----------------|--------------------|-----------|--------------------------------------|
| 1 | **Prospect** | Find leads via Google Places, score, dedupe at insert, write to DB | `prospect.ts`, `prospect_auto.ts`, `lead_search_strategy.ts`, `db.ts` (`tryInsertLead`) | Plain Node + Google Places API | `leads.db` (`leads`, `search_history`); state `NEW` | Manual-review pile grew faster than reviewed → hard filters added (reviews<3, rating<3.5, no phone). One historic phone collision (two Bristol locksmiths sharing a mobile). |
| 2 | **Gather** | Enrich brief + photos (Google Places default; verified Facebook via Meta Graph→Apify→public HTML) | `gather.ts`, `facebook_source.ts`, `facebook_graph.ts`, `apify_facebook.ts` | Node + HTTP + `sharp` | `briefs/<slug>/brief.json`, `images/`; state `GATHERED` | Facebook public HTML often ~315px thumbnails; `LOW_RES_FACEBOOK_ONLY` flag. |
| 2b | **Enrich** | Deep source intel: website validation, email-domain discovery, **search-driven directory probes** (Checkatrade, TrustATrader, Yell, MyBuilder, Rated People, Bark, Houzz, Trustpilot, MyJobQuote) with 2-of-4 identity verify | `enrich_lead.ts`, `directory_probe.ts`, `directory_identity.ts`, `lib/web_search.ts`, `website_discovery.ts`, `brief_data_quality.ts` | Node + HTTP + Playwright (Bing fallback); optional SerpAPI | `source-evidence.json/.md`, `lead-validity.json`, `source-quality.json` | Original directory probe was slug-guess only (0/10 useful captures); rebuilt 2026-06-12 with search-driven discovery + homonym guard (`NOT_FOUND_HOMONYM`). |
| 3 | **Prepare** | Business-led artifacts before build | `site_prepare.ts` → `voice_discovery.ts`, `source_evidence.ts`, `site_strategy.ts`, `section_planner.ts`, `pitch_insight.ts`, `design_direction.ts` | **Plain Node, regex/heuristic — NO LLM** | `voice.json`, `site-strategy.json`, `section-plan.json`, `pitch-insight.json`, `design-system.json` (+ `.md`) | "Strategy" is theme-regex over reviews + template synthesis. This is a key weak point (see §7). |
| 3b | **Open Design (generation)** | Generate a bespoke single-file HTML/CSS concept | `open_design_prepare_project.ts`, `open_design_status.ts`, `open_design_artifact_check.ts` + Open Design daemon via **MCP (stdio)** | Open Design app (Node 24 + pnpm), daemon on port 7456 or ephemeral; spawns **cursor-agent** with skill **design-taste-frontend** | `open-design-artifacts/<slug>/artifact.html` + `artifact.css` (~25KB single file) + `assets/` | Daemon needs `pnpm` on PATH (fell back to ephemeral port when missing); agent looping (stay-dry recovered on alt project); 5–30 min/run. |
| 4 | **Port** | Turn the OD artifact into a real Next.js app | `batch_port_invoke.ts` (spawns `cursor-agent --trust -p <prompt>`), `port_site_install.ts`, `batch_port_worker.ts` | **cursor-agent CLI writes `sites/<slug>/app/page.tsx`** from artifact + brief + ~25 hardlock rules in the prompt | `sites/<slug>/` Next app, `.od-port` marker, `data-section-id` on every section | **Highest-failure stage.** Image-copy gap (page referenced `/assets/images/*.webp` never copied → live 404s); cursor-agent couldn't run shell copy; port hangs (>33 min) → hard timeouts added (port 25m, build 10m, deploy 8m). Never run `npm run build:site` after a port (wipes the artifact). |
| 5 | **Build** | `next build` static export; legacy template path also exists | `build.ts` (template path), `port_site_install.ts` (port path) → `npm run build` | Node + npm + Next | `sites/<slug>/out/`; state `BUILT` | TS errors in generated `SiteEnhancements.tsx` killed builds (emmo). npm-install gate + image-copy gate added before build. |
| 6 | **Review** | Playwright screenshots, checklist QA, **clone review** (Jaccard section overlap), live style verify | `review.ts`, `clone_review.ts`, `review_batch.ts`, `style_verify.ts`, `design_review.js`, `site_design_checks.ts` | Playwright + Node | screenshots, `clone-review.json`, `style-verify.json`; state `REVIEWED` | Clone review reads built `out/index.html`; without ≥3 `data-section-id` it assumes default order → automatic FAIL. ~91% section overlap persisted across OD ports (shared jt-plumbing stack). |
| 7 | **Deploy** | Vercel deploy + alias preflight/assign + content verification (build marker + business name + phone) | `deploy.ts`, `vercel_alias.ts`, `lib/stage_timeout.ts` | Vercel CLI (`vercel@41.7.0`) / token | `deploy.json`; DB `verified_site_url`, `alias_status`; state `DEPLOYED` | `already_ours` preflight used to skip alias reassign → hostname left on older deploy without gallery files; fixed to always reassign. Transient EPIPE mid-poll (retry succeeds). Deploy + live style verify dominates wall clock (~5–6 min/site). |
| 8 | **Assets** | OG image (fast Playwright clip), screenshots, optional scroll video, optional AI hero images | `og_generate.ts`, `preview_site.ts`, `preview_assets.ts`, `images_generate.ts` | Playwright pool; **Gemini API** for images | `public/og.png/.jpg`, screenshots, previews | Scroll video off by default now. AI images dry-run only; refuse live run when a real ≥1000px hero exists. |
| 9 | **Outreach** | WhatsApp-first sequence, email backup; draft-only unless enabled | `outreach.ts`, `outreach/send.ts`, `openwa_ensure.ts`, `check_replies.ts` | OpenWA gateway (Docker + HTTP API); Namecheap SMTP/IMAP | `data/outreach-log.jsonl`, `outreach/contacted-leads.md`; state `PITCHED` | `sending_enabled: false` and `test_recipient_only: true` by default. OpenWA can't add contacts (vCard for manual import). |

**Batch orchestration** wraps stages 1–8: `batch_sites.ts` (general), `ten_build_batch.ts` (fixed 10-site), `bathroom_fitters_batch.ts` (campaign-specific). The **port pool** (`batch_port_pool.ts` / `batch_port_worker.ts`) runs cursor-agent ports concurrently (default C=4, max 8) under a **token budget** (6M batch / ~450k per slug) with **file-based pause/bail** controls (`data/batches/<id>/pause`, `<slug>.bail`) and per-slug logs at `data/batches/<id>/jobs/<slug>.port.log`. Deploy runs at lower concurrency (C=3). SQLite is WAL + busy_timeout; Vercel alias assignment is serialised with a cross-process lock in `.locks/`.

---

## 3. Durable knowledge layer

The "rules" are spread across **five** surfaces, with heavy duplication. In priority order as the system itself states it: `skills/webfortrades-site-design/SKILL.md` is the **creative source of truth** (overrides scattered rules); `.cursorrules` holds **operational** rules (deploy, outreach, db); `config.yaml` holds toggles; `docs/` holds canonical procedures + research; `memory.md` is the append-only incident/learning log.

**Files containing rules / conventions / banned phrases / design constraints / process definitions:**

| File | Role | Length | Reads as… |
|------|------|--------|-----------|
| `skills/webfortrades-site-design/SKILL.md` | Creative contract: evidence mining → strategy → section plan → design → copy → review gate → pitch | ~470 lines | **Working agreement** (the intended canonical playbook) |
| `skills/.../examples/*` (6 files: bad-clone-pattern, curletts-principles, site-strategy-example, section-plan-example, pitch-insight-example, source-enrichment-checklist) | Worked good/bad references | ~80–190 ea | Working agreement (teaching by example) |
| `.cursorrules` | House rules: who we work for, approval gates, writing style, publishing, pricing, OD rules, lead intelligence, deploy verification | ~174 lines | Mostly working agreement; **Cursor-shaped** (assumes a Cursor agent reading it at session start) |
| `config.yaml` | Caps, pricing, `site_design` flags, `batch` knobs, `lead_search` rotation, outreach safety | ~148 lines | Working agreement + feature flags |
| `docs/open-design-webfortrades-brief-format.md` | The OD brief schema + the bulk of the **hardlock copy/layout rules** (hero patterns A–D, services rules, reviews-once, gallery columns, map embed, iconography, banned punctuation) | ~530 lines | **Half agreement, half scar tissue** — many rules are dated patches |
| `docs/open-design-to-vercel-recipe.md` | Canonical OD end-to-end (daemon, MCP, port, deploy) | ~370 lines | Working agreement (Greens 2026-06-10 pilot) |
| `docs/open-design-deploy-checklist.md` | Short operational OD checklist | ~70 lines | Working agreement |
| `docs/open-design-next-porting-notes.md` | File-by-file port mappings + pitfalls | ~175 lines | Working agreement (Greens reference) |
| `docs/open-design-integration-plan.md` | MCP setup, architecture split, risks | ~230 lines | Working agreement |
| `docs/claude-code-skills-for-webfortrades.md` | What Agent Skills are + adoption plan | ~180 lines | Working agreement (this migration's seed) |
| `docs/webfortrades-website-pipeline-audit.md` | Root-cause analysis of the clone problem | ~270 lines | Working agreement (diagnosis) |
| `docs/webfortrades-site-design-skill-implementation-plan.md` | 5-phase template→business-led roadmap | ~360 lines | Working agreement (plan) |
| `docs/copy-voice-examples.md` | Good vs bad copy (port-agent required reading) | ~65 lines | Working agreement |
| `docs/apify-*`, `docs/source-extraction-*` | Tools research / benchmarks | ~95–215 ea | Reference research |
| `docs/open-design-test-prompt-corvell.md` | Draft OD test prompt (not run) | ~110 lines | Reference draft |
| `prompts/site-build-checklist.md` | Mandatory pre-build/deploy/outreach checklist (~18 numbered sections) | ~390 lines | **Half agreement, half scar tissue** |
| `prompts/outreach.md` | Outreach sequence, templates, state machine | ~260 lines | Working agreement |
| `prompts/manual-asset-request-template.md` | Manual image-upload prompt | ~30 lines | Working agreement |
| `README.md` | Layout + stages + commands | ~305 lines | Working agreement (entry point) |
| `memory.md` | Append-only incident/learning log | ~400 lines | **Mostly scar tissue** (chronological patches) |

**Working agreements vs patches around past failures.** Two clear classes:

- **Genuine working agreements (would survive a rewrite):** the swap test; evidence-before-design; "templates are references, not skins"; address/area privacy (city + outward postcode only, no street pins); evergreen review proof (plus-style phrasing, exact counts internal); approval gates (`ask_before_build` / `ask_before_send`); deploy URL verification (build marker + name + phone, never assume `<slug>.vercel.app`); outreach safety (draft-only, test-recipient-only); no-em-dashes house style; keyless Google Maps embeds.

- **Patches that over-fit Cursor/OD quirks (smell of regression-driven rules):** the hero-quote ban (born because every OD port produced a review-quote hero); "never run `build:site` after OD port" (an artifact-wiping footgun specific to this template); the `data-section-id` ≥3 requirement (exists only because clone review regexes built HTML); `od_port_require_section_ids`, `od_port_use_next_build_only`; the no-service-SVG-icons rule (cursor-agent kept emitting lucide icons); `text_only_wordmarks`, `ban_owner_name_section_titles`; the whole "hardlock" stack of 13 source checks (each one traces to a specific bad batch). Most of `memory.md` from 2026-06-11 onward is this category — they are real lessons but they are **lessons about how to wrangle cursor-agent into not producing generic output**, which is exactly the layer the migration can rethink.

---

## 4. Check pipeline (`scripts/checks/`)

Orchestrated by `scripts/run_site_source_checks.ts`, wired into `npm run build:site` and the port pre/post-build gate (`port_site_install.ts`). Order and blocking status:

| # | Check (file) | Scans | Blocks | Block/Warn | Wiring |
|---|--------------|-------|--------|------------|--------|
| 1 | `no_em_dashes.ts` | source `.tsx/.ts/.json` + outreach templates/drafts | `—`, `–`, `―`, ASCII ` -- ` | **Block** | build:site, port, `test:outreach-format` |
| 2 | `voice_review.ts` | site copy files + `voice.json`/`brief.json` | banned generic phrases, unsupported badge claims (block); missing distinctive angle / proof points (warn) | **Block** (+warn) | build:site, port |
| 3 | `no_meta_provenance.ts` | site copy string literals | "reviews describe…", "drawn from the verified google listing", etc. | **Block** | build:site, port |
| 4 | `no_negative_services.ts` | site copy string literals | "no X work", "not mentioned in available evidence" | **Block** | build:site, port |
| 5 | `banned_sections.ts` | `<h1-6>` + eyebrow text | "verified customer proof", "independent listings", "trust signals", "third-party verification" | **Block** | build:site, port |
| 6 | `no_service_icons.ts` | Service/Process `.tsx` | inline `<svg>`, `lucide-react`, `@heroicons/*` in service/process UI | **Block** | build:site, port |
| 7 | `sticky_cta.ts` | sticky CTA block | phone/Call in sticky CTA (must be quote-only) | **Block** | build:site, port |
| 8 | `hero_subhead.ts` | hero block | subhead >2 sentences or >220 chars | **Block** | build:site, port |
| 9 | `owner_voice.ts` | owner/team section | third-person owner copy (must be first-person) | **Block** | build:site, port |
| 10 | `map_embed.ts` | coverage section | non-Google-iframe map, missing `output=embed`, full postcode, street tokens | **Block** | build:site, port |
| 11 | `section_integrity.ts` | **built `out/index.html`** or live DOM (Playwright) | single-column desktop gallery; "explained plainly" sections with no descriptions | **Block** (skips if no built HTML) | deploy preflight, live style verify |
| 12 | `identity_review_names.ts` | review snippets vs brief names | review author not in brief team/owner | **Warn only** | build:site, port |
| 13 | `mobile_header.ts` | **live render @375px** (Playwright) | missing hamburger, phone/Call in mobile header, >2 nav links | **Block** | post-build |

Batch-level (not in the per-site orchestrator): `palette_diversity.ts`, `font_diversity.ts` (read each site's `globals.css`, compare across a batch). Separately, `clone_review.ts` does Jaccard section-name overlap against recent sites (target score <35), and `review.ts` runs ~40 rendered-page assertions (hero CTA, header brand = business name, footer credit, stat labels, contact form, em-dash sweep).

**Bugs / fragile heuristics surfaced:**
- Sentence splitting (`/(?<=[.!?])\s+/`) is naive — misses ellipsis/abbreviations/entities (shared `copy_scan_utils.ts`).
- Hero subhead extraction = "longest string literal in the hero block" — breaks if copy is split across vars/props.
- `no_service_icons` keys off component **name** regex (`Service|Process|JobCard|…`) — misses `IconServices.tsx`, `ServicesBlock.tsx`.
- `section_integrity` HTML mode is regex-over-markup; "promise heading" list is hardcoded (misses "Simple explanations" etc.); gallery selectors are 16 hardcoded strings.
- `map_embed`, `mobile_header`, `owner_voice` all key off hardcoded section IDs / class names / 375px / `.site-header` — flexible naming bypasses them.
- `section_integrity` had a Playwright `page.evaluate` multi-arg crash (fixed 2026-06-12).

**Overlap / merge candidates:** `voice_review`, `banned_sections`, `no_meta_provenance`, `no_negative_services` each independently walk the same copy files and re-extract string literals — **four walks, four extractions**. They should be **one copy-voice pass** with multiple rule suites over a single AST/text parse. `hero_subhead` duplicates hero extraction that `voice_review` also does. The brittle, scattered selectors (gallery selectors, coverage IDs, mobile assumptions, promise headings) should move to one shared `site_check_config.ts`. Net: ~13 checks could become ~5 passes (one copy pass, one built-HTML pass, one live-Playwright pass, one batch-diversity pass, one clone pass).

---

## 5. External dependencies

| Dependency | Where called | Input | Output | If removed… |
|------------|-------------|-------|--------|-------------|
| **Vercel** | `deploy.ts`, `vercel_alias.ts` | `sites/<slug>/out/` static export, target alias | deployment URL, assigned alias, verification result | Need another static host + alias/verification layer. Core to the product (live spec URL is the pitch). |
| **Open Design** | `open_design_*.ts`, daemon via MCP stdio; cursor-agent generation | OD brief (`open-design-brief.md`) + section plan + real images | `artifact.html` + `artifact.css` (~25KB single file) | **Stage 3b disappears; stage 4 "port" changes from "port an artifact" to "generate the Next.js app directly".** This is the central migration question — see §7. |
| **cursor-agent (Cursor CLI)** | OD generation **and** `batch_port_invoke.ts` | prompt + artifact + brief | `sites/<slug>/app/page.tsx` etc. | This is the actual code-writing LLM today. In Claude Code, Claude replaces it. |
| **OpenWA** (WhatsApp) | `openwa_ensure.ts`, `outreach/send.ts` | Docker stack in `~/.cursor/openwa`, HTTP API | send status | Outreach WhatsApp channel gone (email remains). **Currently disabled** — confirmed `config.yaml`: `sending_enabled: false`, `test_recipient_only: true`. |
| **Google Places API** | `prospect*.ts`, `gather.ts` | `GOOGLE_PLACES_API_KEY`, search/details/photo refs | business facts, reviews, photos | No lead discovery or primary enrichment. Foundational. |
| **Gemini (Nano Banana)** | `images_generate.ts` | `GEMINI_API_KEY` (in `.env.local`), niche prompt + palette | AI hero image (1600×1200 / 1200×1600) | Optional AI hero images. Dry-run only so far; refuses when a real ≥1000px hero exists. Low risk to drop. |
| **Meta Graph API** (optional) | `facebook_graph.ts` | `META_GRAPH_API_TOKEN` | higher-res FB Page photos | Falls back to Apify → public HTML thumbnails. |
| **Apify** (optional) | `apify_facebook.ts` | `APIFY_TOKEN`, actor names | FB post/photo media | Falls back to public HTML. Benchmarks showed mostly blocked/too-small → Google Places photos preferred anyway. |
| **SerpAPI** (optional) | `lib/web_search.ts` | key | search results for directory probes | Falls back to DuckDuckGo HTML → Bing fetch → Playwright Bing. |
| **Namecheap Private Email** | `outreach/send.ts`, `check_replies.ts`, `test_email.ts` | SMTP `mail.privateemail.com:587` STARTTLS / IMAP `:993` | email send + reply monitoring | Email outreach channel gone. |

**SQLite — `leads.db`** (WAL mode; gitignored). Tables:
- **`leads`** (261 rows): the lead record + all pipeline state. Identity columns (`place_id`, `cid`, `phone_normalized`, `name_normalized`, `postcode_outward/full`), website status, contactability (`email_available`, `phone_type`, `whatsapp_status`, `contactability_status`, `primary_outreach_channel`), deploy (`verified_site_url`, `deployment_url`, `alias_status`, `build_id`, `style_verified`), dedupe (`duplicate_of`, `merged_into`, `phone_postcode_dedupe_exempt`). Unique indexes on `place_id` and on `(phone_normalized, postcode_outward)`.
- **`search_history`** (19 rows): prospect coverage map (niche, region, query, raw/inserted/duplicate counts, quality %) — drives `pickNextSearches()` 14-day cooldown rotation.
- **`whatsapp_sends`** (15 rows) / **`email_sends`** (0 rows): per-touch send ledger.
- **`schema_migrations`**: applied migration versions (`scripts/db/` holds `2026-06-12-lead-identity.sql` + `.down.sql`).

Lead state distribution today: `NEW` 203, `NEEDS_MANUAL_CONTACT` 20, `PITCHED` 14, `DEPLOYED` 13, `GATHERED` 9, `REVIEWED` 1, `PITCH_BLOCKED` 1.

---

## 6. Deployed sites

> You referenced "19 deployed sites." The current on-disk reality is **27 prospect sites with `alias_status: VERIFIED` deploy.json** (13 in DB state `DEPLOYED`, 14 in `PITCHED`), **plus 5 early pilot/template builds** on random Vercel aliases, **plus 1 incomplete** (`emmo-plumbing-ltd`). "19" likely refers to an earlier snapshot or a subset (e.g. the five-site + ten-build cohorts, or production sites minus the Bristol originals). Flagging the discrepancy as Q6 below; here is the full real grouping.

**Pilot / reference builds (5)** — template-based, random aliases, the origin of the "clone DNA":
`test-electrical`, `test-mechanic`, `test-plumbing`, `decorator`, `roofer`. Healthy as references; not real prospects.

**Bristol plumbers — original batch (2026-06-09/10), template→partial OD:**
`bristol-plumbing-co` (PITCHED, first real send), `jt-plumbing` (PITCHED), `greens-precise-plumbing-heating-ltd` (PITCHED — OD pilot reference), `nfs-plumbing-heating` (PITCHED), `bbr-plumbing-heating-bristol-bristol-boiler-repairs` (PITCHED — **alias debt:** canonical is `bristol-boiler-repairs.vercel.app`; `-bristol` alias may serve stale pre-OD HTML), `corvell-ltd` (DEPLOYED). Briefs also exist for `mayerplumbing`, `southwest-plumber-…`, `jkl-clifton-…` (not all deployed). This is the **clone-problem batch**.

**Five-site OD batch (2026-06-11)** — first parallel Open Design run:
`nfs-plumbing-heating`, `bbr-…`, `west-park-electrics` (PITCHED), `stay-dry-roofing` (DEPLOYED — **`HAS_REAL_SITE`; must pitch as redesign, not no-site**), `alexander-s-painters-decorators` (PITCHED — **location mismatch flagged:** Manchester vs Stockport/Bramhall). All initially FAILED clone review (~91% section overlap with jt-plumbing stack); fixed in the polish pass.

**Ten-build OD batch (2026-06-11/12):**
`rm-electrical`, `a-m-t-roofing-penarth`, `ellis-plumbing-heating-services-birmingham`, `heattech-gas-services-ltd`, `the-lock-dr`, `chestnut-trees-fencing`, `edgar-landscapes-driveways-ltd` (all PITCHED), `painters-force-ltd`, `m-ross-building-services`, `tom-baker-plumbing-and-gas-solutions` (DEPLOYED). Known debt: **5 heroes still contain em dashes** (`rm-electrical`, `a-m-t-roofing-penarth`, `heattech-gas-services-ltd`, `the-lock-dr`, `chestnut-trees-fencing`) per the 2026-06-12 em-dash cleanup note — not yet fixed. This batch also hit the gallery-image-404 incident (fixed via `batch_copy_site_images.ts`) and the universal review-quote-hero problem (fixed).

**Bathroom-fitters batch (2026-06-12)** — **most recent, cleanest, most checks applied** (hardlock v2 + v3 passes):
`cutts-plumbing`, `bristol-bathroom-fitters`, `newcastle-bathroom-company-ltd`, `renovate-cardiff-ltd-bathroom-fitters-cardiff`, `renovatik-kitchen-fitter-and-joinery`, `s-m-plumbing-bathrooms`, `lc-tiling-bathrooms` (all DEPLOYED), `dps-plumbing-bathrooms` (DEPLOYED, recovered after a >33-min port hang), `stephen-sharp-handyman-glasgow-west-end` (deployed; **identity contamination fixed** — a "Jordan" review not on the team was swapped). **9/10 complete.** `emmo-plumbing-ltd` — **incomplete (FAILED_PORT:** TS error in generated `SiteEnhancements.tsx`); has a `sites/` dir but no verified deploy.

**Recommended reference batch for the bake-off:** the **bathroom-fitters batch**, specifically **`cutts-plumbing`** or **`newcastle-bathroom-company-ltd`** — cleanest output, all current hardlock rules applied, real OD artifact + ported Next.js app to diff against. (`cutts-plumbing` confirmed VERIFIED, build marker `cutts-plumbing:20260612-od-port`, 7 gallery webps present.)

**Two data-integrity flags worth raising now:**
1. **State drift:** `stephen-sharp-…` has a VERIFIED `deploy.json` but is in neither DB `DEPLOYED` nor `PITCHED`. The project already ships `npm run check:state-sync` for exactly this; worth running.
2. **Outreach-log vs "no sends":** `leads.db` has **14 `PITCHED`** rows with `pitched_at` timestamps and `data/outreach-log.jsonl` has **14 entries with real phone numbers and full message bodies** (earliest `bristol-plumbing-co` 2026-06-09). Yet `config.yaml` has `sending_enabled: false` and `memory.md` repeatedly says "no outreach sent." Either real sends happened (contradicting the safety note) or the log/state was backfilled from drafts. This needs an explicit answer before any further outreach (Q5).

---

## 7. Honest assessment — what I'd restructure building this fresh in Claude Code

I'll be blunt, as asked.

**A. Open Design is not pulling its weight, and the architecture proves it.** The thing that actually writes your sites is **cursor-agent**, an LLM coding agent — in **both** the generation step (OD's daemon spawns cursor-agent under the `design-taste-frontend` skill to emit `artifact.html`) **and** the port step (`batch_port_invoke.ts` spawns cursor-agent again to convert that HTML into `sites/<slug>/app/page.tsx`). So you are running an LLM coding agent **twice**, with a lossy HTML-artifact handoff in the middle, plus a Node-24/pnpm daemon, an MCP server, ephemeral ports, and a 5–30 min generation step — to produce a single-file HTML that a second agent then rewrites anyway. Open Design's real contribution is a **design-system/taste prior** (its 150+ DESIGN.md systems) and the discipline of "generate a concept first." Everything else is overhead and a source of your worst bugs (the artifact→port image-copy gap, the "never run build:site" footgun, the section-id-or-FAIL coupling).

> **My recommendation:** in Claude Code, collapse 3b+4 into **one step** — Claude reads the rich brief (strategy + section-plan + evidence + voice + images) and writes the Next.js app **directly**, no HTML artifact in between. Keep the *idea* Open Design gave you (a named design-system prior, a concept-before-code gate, a clone check) but express it as **inputs to Claude** (a design-direction brief + a "pick a distinct system" instruction + reference screenshots), not as a separate generator. The bake-off (Phase 2d) is exactly the right way to prove this: build one bathroom-fitter site Claude-direct and diff it against the OD-ported version on the same brief. My prior: Claude-direct wins on fidelity-to-brief and removes ~5 of your top recurring failure classes, at the cost of losing OD's design-system variety — which you can replace with an explicit, curated palette/font/layout library you already have in `library/`.

**B. The "strategy/voice/section-plan" generators are heuristic Node, and that's the real altitude problem.** `site_strategy.ts`, `voice_discovery.ts`, `section_planner.ts`, `pitch_insight.ts` are regex theme-extractors and template synthesizers — *no LLM*. That's why the briefs read generic and why cursor-agent then needs 25 hardlock rules to not produce slop: **the brief itself is slop-shaped.** A pipeline where the *understanding* step is dumb and the *rendering* step is smart is upside down. In Claude Code, the highest-leverage change is to make **Claude do the evidence→strategy→section-plan reasoning** (it's genuinely good at "what makes this business different from the reviews") and keep Node for the deterministic plumbing (Places calls, dedupe, image fetch, deploy, verification). Most of your hardlock checks become unnecessary the moment the brief is written by something that understands the business.

**C. The Cursor skill files are *mostly* portable but need restructuring for CLAUDE.md hierarchical loading.** `SKILL.md` is already in the right shape (frontmatter + progressive disclosure + `examples/`) and ports nearly 1:1 to a Claude Code skill. The problem is **`.cursorrules` + `prompts/site-build-checklist.md` + `docs/open-design-webfortrades-brief-format.md` are one giant always-on rule blob** (~1,100 lines combined) with heavy duplication of the same 40 rules. Claude Code wants the opposite: a **lean root `CLAUDE.md`** (always loaded — conventions, banned phrases, verification discipline, pointers) + **directory-scoped `CLAUDE.md`** files + **on-demand skills**. The em-dash rule alone is restated in at least 8 places. Restructure, don't transcribe.

**D. Where verification is weakest (an agent could claim success while reality differs):**
1. **Deployed image existence.** The single worst real incident: pages referenced `/assets/images/*.webp` that were never copied to `public/`, so live URLs 404'd while the build "passed." Verification must fetch the **live** asset URLs (HTTP 200 + content-type image), not just check the build. This is the #1 thing to hard-gate.
2. **Live vs built drift / alias pointing at stale deploys.** `already_ours` once skipped alias reassignment; bbr's `-bristol` alias still serves pre-OD HTML. Verification should assert the **canonical alias resolves to the exact build marker just deployed**, every time.
3. **State-sync drift** between `deploy.json`/disk and `leads.db` (stephen-sharp). The check exists but isn't enforced in the happy path.
4. **Outreach ledger truthfulness** (the PITCHED-vs-"no sends" contradiction). If an agent can write `PITCHED` + a log entry without a real send, the log can't be trusted — and that's the one place where being wrong contacts real people.
5. **"Clone review passes" ≠ "site is distinct."** A site can score <35 and still be a text-swap because the check is Jaccard over section *names*. Genuine distinctiveness is a judgment call Claude can make (the swap test) better than the regex can.
6. **Em-dash debt that survived a "fixed" batch** (5 ten-build heroes). A check that scans source but not the *deployed* hero text let these through.

**E. Smaller structural things I'd change:** merge the 13 copy checks into ~5 passes (§4); kill the one-off scripts (`tmp-s-m-setup.*`, `bathroom_*`, `hardlock_*`, `_tmp_*`) — they're frozen batch helpers; move the brittle selectors to one config; stop committing 14G of `sites/` (already gitignored for build output, but the repo is heavy); and treat `memory.md` as what it is — an incident log — by graduating its durable lessons into the skill and letting the rest age out.

---

## 8. Recommended Claude Code project structure

The principle: **lean always-on root, directory-scoped context, on-demand skills, and move judgment from regex into Claude.**

### Root `CLAUDE.md` (always loaded — keep it short, ~120–180 lines)
- **Identity & safety:** who we are (WebForTrades / Julius), spec-site model, approval gates (`ask_before_build`/`ask_before_send`), and the hard outreach lock (`sending_enabled: false`, `test_recipient_only: true` — never flip without explicit instruction).
- **Single source of truth:** `leads.db` for state; always update `state` + `updated_at`; never process a business already in the db.
- **House writing style (the short version):** plain British English, no em/en dashes, evergreen review proof, no invented facts.
- **The non-negotiable verification discipline:** deploy = build marker + business name + phone at the **canonical alias**, live image URLs return 200, never assume `<slug>.vercel.app`.
- **The swap test**, stated once, as the governing quality bar.
- **Pointers (not contents):** "Before building any site, use the `webfortrades-site-design` skill." "For deploy/OD/outreach procedures, see `docs/…`." "Banned phrases live in `scripts/checks/` and the skill."
- **What NOT to do:** no `build:site` after a direct/OD build if that path is retained; no outreach after deploy without approval; no street addresses on public sites.

### Directory-scoped `CLAUDE.md` files
- **`sites/CLAUDE.md`** — conventions for a generated Next.js app: file layout (`app/page.tsx`, `globals.css` with Tailwind layers + safelist, `components/SiteEnhancements.tsx`, `lib/build-marker.ts`, `data/brief.json`), `next/font/google` only, image paths under `public/assets/images/`, the gallery-masonry rule, the quote-form `#quote` + sticky-CTA rules, footer credit. This is where the old porting-notes go.
- **`scripts/CLAUDE.md`** — runtime conventions: tsx/Node, no LLM in deterministic stages, where DB helpers live, stage-timeout usage, the WAL/lock discipline for batches, "checks are blocking unless marked warn."
- **`briefs/CLAUDE.md`** — the artifact contract: what each JSON file means and which stage owns it; "a brief is business-led or it's wrong."
- **`data/CLAUDE.md`** (optional) — batch layout, log locations, never commit outreach logs.
- **`outreach/CLAUDE.md`** — the safety rules restated at the point of use: draft-only, logging truthfulness, contact-name evidence threshold.

### Skills
- **Project-local (`.claude/skills/` in-repo):**
  - **`webfortrades-site-design`** — port the existing SKILL.md nearly as-is (it's already skill-shaped). Add the copy-voice examples and the banned-phrase list as bundled references. This becomes the creative contract.
  - **`webfortrades-deploy-verify`** (new) — the hard verification routine (alias canonicalization, live build-marker fetch, live image 200 check, state-sync). Encodes §7D as an enforced procedure.
  - **`webfortrades-enrich`** (optional) — the evidence-mining + directory-probe + identity-verify playbook.
- **User-global (`~/.claude/skills/`)** — general-purpose, not project-specific: web research, file ops, screenshot/diff helpers. These don't belong in the repo.

### Skill-file disposition (high level; detailed port plan is Phase 2b)
- **Port directly:** `SKILL.md`, the 6 `examples/*`, `copy-voice-examples.md`, `open-design-next-porting-notes.md` (as `sites/CLAUDE.md` source), the outreach templates.
- **Rewrite for Claude:** `.cursorrules` → split into root `CLAUDE.md` + directory CLAUDE.md + skill; `prompts/site-build-checklist.md` → fold into skill + checks (drop duplication); `docs/open-design-webfortrades-brief-format.md` → split the *durable* copy/layout rules into the skill, retire the OD-brief-schema half.
- **Retire / archive:** `docs/open-design-*` (recipe, deploy-checklist, integration-plan, test-prompt) once the bake-off confirms Claude-direct — keep as historical reference under `docs/claude-migration/archive/`; the `od_*` config flags; the one-off batch scripts.

---

## Questions for Vestra before Phase 2 (migration setup)

1. **Open Design's fate.** Do you want the bake-off to genuinely decide OD's removal, or have you already decided to drop it and the bake-off is just to validate Claude-direct quality? (Changes whether I design 04-bake-off-plan.md as a real A/B or a confidence check.)

2. **Where does creative judgment move?** Are you comfortable with Claude *writing the strategy/section-plan/voice* (replacing the heuristic Node generators), or do you want those kept as-is and only the rendering step changed? This is the single biggest architectural fork.

3. **Keep the legacy template `build.ts` path at all?** Or is the future strictly "Claude writes each site bespoke from the brief," with `scripts/templates/site/` retired as a reference skeleton only?

4. **Batch scale and concurrency in Claude Code.** The current model parallelizes via cursor-agent port pool (C=4–8, token budgets, bail/pause). How do you envision batches under Claude Code — sequential main-thread builds, or a controlled fan-out (which you've asked me not to use this session)? This shapes whether the port-pool machinery survives.

5. **Outreach ledger truth (blocking integrity question).** Were the 14 `PITCHED` leads / 14 `outreach-log.jsonl` entries **actually sent**, or are they drafts/backfill? `sending_enabled` is `false` and memory says "no sends," but the log has real numbers and message bodies. I need the ground truth before treating that log as authoritative.

6. **The "19" vs 27.** What does your "19 deployed sites" count refer to? I find 27 VERIFIED prospect deploys + 5 pilots + 1 incomplete. Knowing your canonical list tells me which sites are "in scope" for the migration vs noise.

7. **Reference site for the bake-off.** I propose `cutts-plumbing` (bathroom-fitters, cleanest, all hardlock rules applied). Agree, or do you want a harder case (e.g. a thin-evidence lead, or the `stay-dry` redesign-pitch case) to stress-test Claude-direct?

8. **Repo location & git.** This lives at `~/.cursor/website` with remote `iuliusprodan/webfortrades`. Do we migrate in place (and accept "cursor" in the path), or is relocating the repo part of the plan? Also: do you want the new `CLAUDE.md` + `docs/claude-migration/` committed, or kept local until you review?

9. **Skill scope.** Are you happy with project-local skills living at `.claude/skills/` inside this repo (versioned with the project), and only truly generic skills at `~/.claude/skills/`? Or do you want everything global?

10. **Image generation & Gemini.** Keep AI hero images (`images_generate.ts`, currently dry-run) in the Claude-Code future, or retire it? Affects whether `GEMINI_API_KEY` and that whole quality-gate stack carries over.
