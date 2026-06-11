# Autonomous Web Agency

A local, single-operator pipeline for finding small businesses, building Next.js sites from briefs, QA-reviewing them, deploying, and running outreach with WhatsApp as the primary channel and email as backup. Human approval gates apply where configured.

## Layout

| Path | Purpose |
|------|---------|
| `config.yaml` | Caps, pricing, outreach defaults, approval mode |
| `briefs/<slug>/` | Per-business `brief.json`, `creative-brief.json`, `site-strategy.json`, `section-plan.json`, `source-evidence.json`, `pitch-insight.json`, `images/` |
| `sites/<slug>/` | One Next.js app per business (created at build stage) |
| `prompts/` | Stage instruction files for the agent (including mandatory `site-build-checklist.md`) |
| `scripts/` | Node/TS utilities (DB helpers, outreach, etc.) |
| `screenshots/` | QA captures |
| `open-design-artifacts/<slug>/` | Open Design HTML/CSS concepts for review before site integration |
| `leads.db` | SQLite lead pipeline |
| `memory.md` | Agent learnings (append-only over time) |

## Stages

1. **Discover** - Find leads (e.g. Google Places), score them, `insertLead` into `leads.db`.
2. **Gather** - Enrich brief + images under `briefs/<slug>/`, set state `GATHERED`. Uses Google Places by default. Verified public Facebook pages can supply logos, photos and brand colours when phone/name/location match (`scripts/facebook_source.ts`). **Facebook photo order:** Meta Graph API (if configured) → Apify (`APIFY_TOKEN`, `scripts/apify_facebook.ts`) → public HTML fallback (often ~315px thumbnails). See `docs/apify-mcp-setup.md`. Override: `npm run gather -- --slug <slug> --facebook-url "<url>"`.
2b. **Enrich** - Deep source intelligence: `npm run enrich:lead -- --slug <slug> --no-build`. Includes website URL validation (`npm run brief:quality -- --all-known`), email-domain discovery, logo/photo discovery, directory probes (with image extraction to `briefs/<slug>/images/directory/`), and source quality gate. Manual assets: `briefs/<slug>/images/manual/` + `npm run assets:manual -- --slug <slug>`. Tests: `npm run test:source-extraction`, `npm run test:sources`.
2c. **Benchmark extraction** - Read-only quality check: `npm run benchmark:sources -- --slug <slug>`. Reports in `data/source-benchmarks/`.
3. **Prepare** - Business-led artifacts before build: `npm run site:prepare -- --slug <slug>` writes `source-evidence`, `site-strategy`, `section-plan`, and `pitch-insight`. Read `skills/webfortrades-site-design/SKILL.md` first.
3b. **Open Design (optional visual pass)** - Generate a bespoke HTML concept via local Open Design. **Start here:** `docs/open-design-to-vercel-recipe.md` and `docs/open-design-deploy-checklist.md`. Readiness: `npm run od:status`. Brief: `npm run od:prepare -- --slug <slug>`. Artifact QA: `npm run od:check -- --slug <slug>`. Preferred agent: **cursor-agent**. Default skill: **design-taste-frontend**. Save to `open-design-artifacts/<slug>/`, port using `docs/open-design-next-porting-notes.md`, review before integrating into `sites/<slug>/`. Use `next/font/google` when porting. If auth/CLI fails, stop and ask; do not bounce between agents without approval.
4. **Build** - Generate `briefs/<slug>/creative-brief.json` (mandatory), choose distinct palette/fonts/layout via `scripts/design_direction.ts`, scaffold `sites/<slug>/`. **Must read** `skills/webfortrades-site-design/SKILL.md` and `prompts/site-build-checklist.md` first. Artifact gates warn by default (`site_design.skill_enforced: false`).
5. **Review** - Playwright screenshots, checklist QA, location/creativity checks, clone review (`npm run review:clone -- --slug <slug>`), state `REVIEWED`. For batches: `npm run review:batch -- --batch data/<batch>.json`.
6. **Deploy** - Vercel deploy with alias preflight, assignment, and content verification (build marker + business name + phone). Stores `verified_site_url` and `alias_status`. State `DEPLOYED` only after verification passes.
7. **Outreach** - WhatsApp-first sequence with email fallback. Draft-only until `outreach.sending_enabled` is true. WhatsApp checks run separately when `whatsapp_check_enabled` is true.

**Copy rule:** Public review proof should be evergreen. Exact counts live in source evidence and briefs. Live sites may use plus-style phrasing when sourced (e.g. 45+ reviews). Omit small secondary-platform review counts on public copy when they date quickly. Open Design uses exact evidence internally; public site copy should age well.

**Local area map:** When location or service area evidence exists, every prospect site should include a Google Maps embed (no paid API key) or a polished static map-style area card with verified areas and a safe public Maps link. Prefer area/postcode map queries, not residential street pins. Do not invent service areas.

**Address privacy:** Full address stays in internal evidence only. Public site shows city, area, postcode or service areas unless the business clearly wants the full address public (showroom, office, yard). Do not overexpose sole-trader home addresses.

**Review copy:** Use reviews as evidence. One strong quote section and review cards are fine. Do not over-name reviewers throughout the page. Write natural business copy from the evidence without inventing specific facts.

**Business footer:** Every prospect site needs a real business footer (brand, contact, areas, quick links, sourced hours when available), not only the WebForTrades credit. Keep the WebForTrades link smaller at the bottom.

**Gallery layout:** tiles top-align with natural aspect ratios. No stretching shorter tiles, no empty padding under images, no forced uniform aspect ratio. Prefer CSS columns masonry on desktop or grid with `items-start`. Captions directly under each image.

## Controlled parallel batches

Build many sites at once with controlled concurrency and strong QA, without making clone sites or corrupting shared state:

```bash
npm run batch:sites -- --location Bristol --niche plumbers --count 8 --concurrency 3 --no-outreach
```

Options: `--location`, `--niche`, `--count`, `--concurrency` (site work, default 3), `--deploy-concurrency` (default 2), `--deploy true|false` (default true), `--preview-video true|false` (default true), `--dry-run-leads`, `--allow-manual-review`. `--no-outreach` is the default and required; the command never sends.

- **Centralised:** prospecting/lead selection, dedupe, contactability gate, SQLite writes, Vercel alias assignment, deploy verification, batch QA, outreach gates.
- **Parallelised per lead (up to `--concurrency`):** gather, creative brief, build, preview screenshots, preview video, per-site review. Deploy runs at lower concurrency.
- **Isolation:** each lead has its own job in `data/batches/<batch-id>/jobs/<slug>.json` and a distinct pre-assigned creative direction in `briefs/<slug>/creative-constraint.json`. Workers use unique ports (review `4400+slot`, preview `4500+slot`).
- **Safety:** SQLite is concurrency-safe (WAL + `busy_timeout`); Vercel alias assignment is serialised by a cross-process lock; the orchestrator never writes `outreach/contacted-leads.md` or `data/outreach-log.jsonl`.
- **Outputs** under `data/batches/<batch-id>/`: `selected-leads.json`, `jobs.json`, `jobs/<slug>.json`, `batch-state.json`, `batch-report.json`, `batch-report.md`.
- **READY_TO_PITCH** requires: contactable, gather, creative brief, build, review passed, batch uniqueness passed, deploy verified, final URL verified, screenshots, preview video, no location/manual-review blocker, no outreach sent.

Test with `--count 2 --concurrency 2` before running 8.

## Lead contact states

| State | When to use |
|-------|-------------|
| `NEEDS_MANUAL_CONTACT` | A human decision or manual contact route is needed (e.g. WhatsApp unknown, channel blocked but some contact exists, geo uncertain, contactability `NEEDS_MANUAL_REVIEW`). |
| `PITCH_BLOCKED` | No usable public contact channel (no phone and no email found, or contactability `DISQUALIFIED_NO_CONTACT_METHOD`). |
| `DO_NOT_CONTACT` | Only after opt-out, wrong number, negative reply, or manual suppression. Never use at prospecting time. |

## Contactability qualification (check-only)

Leads without a public email must pass a WhatsApp availability check before build, deploy, or outreach.

| Rule | Result |
|------|--------|
| Email found | `CONTACTABLE`. Prefer WhatsApp if UK mobile is on WhatsApp, otherwise email-only. |
| No email, UK mobile, WhatsApp available | `CONTACTABLE`, WhatsApp-only sequence. |
| No email, UK mobile, WhatsApp unavailable | `DISQUALIFIED_NO_CONTACT_METHOD`. |
| No email, landline | `DISQUALIFIED_NO_CONTACT_METHOD`. OpenWA is not called. |
| No email, foreign or unknown phone | `NEEDS_MANUAL_REVIEW`. |
| No email, WhatsApp API/session/network error | `NEEDS_MANUAL_REVIEW`, not disqualification. |

Qualification runs during **gather**. It checks OpenWA only for UK mobiles. It never sends messages.

Stored fields on `leads.db`: `email_available`, `phone_type`, `whatsapp_status`, `contactability_status`, `contactability_reason`, `primary_outreach_channel`.

Build, deploy, and outreach refuse `DISQUALIFIED_NO_CONTACT_METHOD` leads. `NEEDS_MANUAL_REVIEW` leads need `--allow-manual-review` on build/deploy/outreach unless you re-gather after fixing the issue.

```bash
npm run test:qualification   # unit tests + live Bristol check (no sends)
npm run gather -- --slug x   # runs contactability during gather
```

## Outreach workflow

WhatsApp is primary when a public UK mobile (`07...`) is confirmed on WhatsApp. Email is the backup channel. Landlines (`01`, `02`, `03`) never receive WhatsApp.

```
DEPLOYED lead
    |
    v
Classify phone (mobile / landline / unknown)
    |
    v
If mobile -> check WhatsApp via OpenWA (when whatsapp_check_enabled=true)
    |
    +-- available + email -> mixed sequence (5 touches)
    +-- available, no email -> WhatsApp-only (4 touches)
    +-- unavailable + email -> email-only (3 touches max)
    +-- unknown + email -> email-only with manual review
    +-- unknown, no email -> NEEDS_MANUAL_CONTACT
    +-- neither channel -> NEEDS_MANUAL_CONTACT or PITCH_BLOCKED
    |
    v
Before first WhatsApp: save contact as "First_Name - Business_Name"
    |
    v
Draft touch message -> approval -> send (when enabled)
    |
    v
Stop immediately on negative reply (no thanks, wrong number, opt-out)
```

### Config (`config.yaml`)

```yaml
outreach:
  channels: ["whatsapp", "email"]
  primary_channel: "whatsapp"
  whatsapp_mode: "approval_first"
  whatsapp_check_enabled: true   # checks run even when sending is off
  sending_enabled: false         # blocks outbound sends only
  test_recipient_only: true    # when true, gateway allows only MY_OWN_TEST_NUMBER
  approval_mode: per_send      # per_send | batch (batch asks once at preflight)
  daily_send_cap: 15
  whatsapp_daily_cap: 10
  min_minutes_between_whatsapp: 3
  sequence_touches: 5
```

### Env (`.env.example`)

- `OPENWA_API_URL`, `OPENWA_API_KEY`, `OPENWA_SESSION_ID` for WhatsApp gateway
- `META_GRAPH_API_TOKEN`, `META_GRAPH_API_VERSION` (optional) for higher-quality public Facebook Page photos via Meta Graph API. Without a token, the pipeline falls back to public HTML extraction (often thumbnails only). Never use a personal logged-in Facebook session for scraping.
- `APIFY_TOKEN`, `APIFY_FACEBOOK_POSTS_ACTOR` (optional) for Apify high-res Facebook fallback. See `docs/apify-mcp-setup.md`. Pipeline uses REST API; Apify MCP is optional for Cursor manual tests.
- Namecheap Private Email for `contact@webfortradesuk.co.uk` (SMTP send + IMAP reply monitoring)

| Variable | Value |
|----------|-------|
| `SMTP_USER` | Full mailbox address, e.g. `contact@webfortradesuk.co.uk` |
| `SMTP_PASS` | Mailbox password |
| `SMTP_HOST` | `mail.privateemail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_REQUIRE_TLS` | `true` |
| `IMAP_USER` | Same full email address |
| `IMAP_PASS` | Same mailbox password |
| `IMAP_HOST` | `mail.privateemail.com` |
| `IMAP_PORT` | `993` |
| `IMAP_SECURE` | `true` |
| `META_GRAPH_API_TOKEN` | Optional Meta app or user token with Page Public Content Access for public Page photos |
| `META_GRAPH_API_VERSION` | Graph API version, default `v25.0` |
| `APIFY_TOKEN` | Optional Apify API token for Facebook posts/photos actors |
| `APIFY_FACEBOOK_POSTS_ACTOR` | Default `apify/facebook-posts-scraper` |
| `APIFY_FACEBOOK_PHOTOS_ACTOR` | Optional secondary photo actor |
| `APIFY_FACEBOOK_PAGES_ACTOR` | Default `apify/facebook-pages-scraper` |

Username is always the full email address.

On some networks port `465` (implicit TLS) times out. Port `587` with STARTTLS (`SMTP_SECURE=false`, `SMTP_REQUIRE_TLS=true`) is the working setup here.

Test mailbox connectivity (sends one message to `contact@webfortradesuk.co.uk` only):

```bash
npm run test:email
```

Do not use `npx run test:email`. Use the npm script above.

### Commands

```bash
npm run site:prepare -- --slug <slug>   # source-evidence + strategy + section-plan + pitch-insight
npm run site:evidence -- --slug <slug>
npm run site:strategy -- --slug <slug>
npm run site:sections -- --slug <slug>
npm run site:pitch -- --slug <slug>
npm run review:clone -- --slug <slug>  # read-only clone score (no rebuild)
npm run od:status                       # Open Design readiness (read-only, no generation)
npm run od:prepare -- --slug <slug>     # assemble OD brief from evidence (no generation)
npm run od:check -- --slug <slug>       # validate saved OD artifact before port
npm run outreach              # draft next touch for top DEPLOYED lead
npm run outreach -- --slug x  # draft for one lead
npm run send:outreach-batch -- --manifest data/batches/<id>/outreach-batch.json  # approval-gated batch sends
npm run openwa:ensure         # start/check local OpenWA Docker stack before WhatsApp sends
npm run followup              # read/classify inbox (outbound sends blocked by default)
npm run test:email            # Namecheap SMTP + IMAP smoke test (no outreach)
npm run test:facebook-graph   # Meta Graph photo helper unit tests (no token required)
npm run test:apify-facebook   # Apify Facebook helper unit tests (no token required)
npm run benchmark:facebook-assets -- --slug <slug>  # compare Graph, Apify, public HTML, Google
npm run benchmark:sources -- --slug <slug>  # read-only extraction benchmark incl. Graph + Apify status
npm run preview:site -- --slug <slug>                          # screenshots (mandatory)
npm run preview:site -- --slug <slug> --video                    # + desktop 16:9 video
npm run preview:site -- --slug <slug> --video --ratio 16:9     # explicit 16:9
npm run preview:site -- --slug <slug> --video --ratio 4:3      # optional 4:3
npm run preview:site -- --slug <slug> --video --video-speed 0.9  # slower scroll
npm run preview:site -- --slug <slug> --video --video-speed 1.1  # faster scroll
npm run preview:site -- --slug <slug> --video --hold-hero-ms 1500 --hold-form-ms 1500
```

Video defaults to desktop 1280 x 720 (16:9). Motion: hero hold, constant-speed scroll to quote form, form hold. Uses production static export (not next dev), integer scroll positions, white capture-only header, and layout settle waits. Never sent automatically.

### Outreach pitch (approval first)

- Prepare drafts before any send. `sending_enabled=false` and `test_recipient_only=true` by default.
- WhatsApp touch 1: short, use contact name when verified (not owner claims), include site link, attach preview video if available.
- No price in first WhatsApp by default. Suggested range £200 to £300. See `prompts/outreach.md`.

### Contacted lead logging

Every real successful outreach send is logged in:

| File | Purpose |
|------|---------|
| `data/outreach-log.jsonl` | Machine-readable send history |
| `outreach/contacted-leads.md` | Human-readable contacted leads |
| `data/outreach-failures.jsonl` | Failed or partial sends |

Rules:

- Test sends to `MY_OWN_TEST_NUMBER` are never logged as contacted leads.
- Lead state becomes `PITCHED` only after a real successful send.
- Contact name format: `First_Name - Business_Name` when known.
- OpenWA cannot add WhatsApp contacts. The pipeline records the intended name and creates a vCard for manual import.

See `prompts/outreach.md` for full sequence tables, templates, and drafting rules.

## Site design (animations)

Future generated websites should include subtle, clean, professional animations by default:

- Restrained fade/slide-in sections, smooth CTA hovers, soft image hover polish, smooth anchor scrolling
- Premium and minimal. No distracting movement
- Respect `prefers-reduced-motion`
- Must not hurt performance, readability, mobile usability, or preview asset capture (screenshots, OG images, preview videos)

See `prompts/site-build-checklist.md` section 9a for the full rule.

## Quick start

```bash
npm install
npm run db:init          # create leads.db schema (if missing)
cp .env.example .env     # fill in API keys and mail/WhatsApp credentials
```

Edit `config.yaml` (your name, email, caps). Run each stage with the matching prompt in `prompts/` and scripts in `scripts/`.

## Writing rule

Never use em dashes in AI-generated messages, website copy, email drafts, WhatsApp drafts, README notes, or logs. Use a normal hyphen, comma, or full stop instead.
