# Open Design to Vercel recipe

Canonical path from the **Greens Precise Plumbing & Heating Ltd** pilot (2026-06-10).  
Live URL: https://greens-precise-plumbing-heating-ltd.vercel.app/

Use this document before every Open Design site. Do not rediscover daemon ports, agents, or porting steps each time.

Related docs:

- `docs/open-design-deploy-checklist.md` - short operational checklist
- `docs/open-design-next-porting-notes.md` - Greens file mappings and pitfalls
- `docs/open-design-integration-plan.md` - MCP install and architecture
- `templates/open-design-next-port/README.md` - port template notes

---

## A. Prerequisites

| Item | Value |
|------|--------|
| Open Design repo | `/Users/iuliusprodan/.cursor/open-design` |
| WebForTrades repo | `/Users/iuliusprodan/.cursor/website` |
| Node for Open Design | **24** (`nvm use 24`) |
| Node for WebForTrades | **20** recommended for native modules (`better-sqlite3`, Playwright) |
| pnpm | **10.33.2** via Corepack in Open Design repo (`corepack enable`) |
| Cursor CLI | Installed, logged in (`cursor-agent login`) |
| Open Design daemon | HTTP on **7456** (desktop app) or ephemeral port from dev mode |
| Cursor MCP | `open-design` entry in `~/.cursor/mcp.json` |
| Preferred OD agent | **`cursor-agent`** only |
| Default OD skill | **`design-taste-frontend`** for trade one-pagers |

**Do not switch** to Claude, Hermes, or Antigravity without explicit approval from Julius.

**Readiness check (safe, read-only):**

```bash
cd /Users/iuliusprodan/.cursor/website
npm run od:status
```

---

## B. Starting Open Design reliably

### Preferred: Open Design desktop app (port 7456)

When the Open Design desktop app is signed in and running, the daemon listens on **7456**. This is the most stable setup for MCP `start_run` with `cursor-agent`.

**Verify:**

```bash
lsof -nP -iTCP:7456 -sTCP:LISTEN
curl -s http://127.0.0.1:7456/api/health
```

Expect health JSON with status ok.

### Alternative: dev mode from source (ephemeral ports)

Use when the desktop app is not available:

```bash
cd /Users/iuliusprodan/.cursor/open-design
source ~/.nvm/nvm.sh && nvm use 24
corepack enable
pnpm install   # first time only
pnpm tools-dev run web
```

Prints ephemeral ports, for example:

- Web UI: `http://127.0.0.1:64617/`
- Daemon: `http://127.0.0.1:64616/`

If MCP was installed against port 7456 but dev mode uses another port, either:

- Add `--daemon-url http://127.0.0.1:<daemon-port>` to the MCP `args` in `~/.cursor/mcp.json`, or
- Re-run `./apps/daemon/bin/od.mjs mcp install cursor --daemon-url http://127.0.0.1:<daemon-port>`

### What not to use

- **`tools-dev desktop-auth gate wrapper`** and similar auth gate wrappers failed in early tests. Prefer the desktop app on 7456 or plain `pnpm tools-dev run web`.
- Do not assume MCP works if the daemon health check fails.

### Stop stale processes

```bash
lsof -nP -iTCP:7456 -sTCP:LISTEN   # note PID
kill <pid>                          # only if you know it is a stale OD process
```

Or quit the Open Design desktop app from the menu bar.

### Retry policy

- Retry **once** for a clear transient error (daemon not up, MCP not reloaded).
- If still failing, **stop and ask Julius**. Do not bounce between agents or retry endlessly.

---

## C. Open Design project creation

### Naming convention

```
webfortrades-<slug>-pilot
```

Greens example: `webfortrades-greens-precise-plumbing-heating-ltd-pilot-2574` (suffix may vary).

### Skill selection

| Skill | When |
|-------|------|
| **`design-taste-frontend`** | Default for bespoke trade one-pagers (Greens pilot) |
| `web-prototype` | Alternative if design-taste-frontend is unavailable |
| SaaS / dashboard skills | Not for trade prospect sites |

### Workflow (Greens path)

1. **Prepare brief locally** (does not start OD):

   ```bash
   npm run od:prepare -- --slug <slug>
   ```

2. **Create OD project** via MCP `create_project` with name `webfortrades-<slug>-pilot`.

3. **Copy curated images** into the OD project on disk:

   - OD project root: `/Users/iuliusprodan/.cursor/open-design/.od/projects/webfortrades-<slug>-pilot-*/`
   - Copy optimised WebP files into `assets/images/` (shell copy is faster than base64 via MCP).
   - Use descriptive filenames (Greens: `hero-bathroom.webp`, `bathroom-shower-vanity.webp`, etc.).

4. **Write `BRIEF.md`** in the project via MCP `write_file`, using project-relative image paths (`assets/images/...`). Base it on `briefs/<slug>/open-design-brief.md`.

5. **Start run** via MCP `start_run`:

   - `agent`: **`cursor-agent`**
   - `skill`: **`design-taste-frontend`**
   - Prompt: point to `BRIEF.md` and `assets/images/`, restate banned headings and no em dashes.

6. **Expected runtime:** about **5 to 15 minutes** (Greens: ~8.5 minutes).

7. **Poll** with MCP `get_run` every 30 to 60 seconds until `succeeded` or `failed`. Do not cancel unless Julius asks.

8. **Retrieve artifact** with MCP `get_artifact`, then save a review copy under:

   ```
   open-design-artifacts/<slug>/
     artifact.html
     artifact.css
     assets/images/
   ```

9. **Validate artifact** (read-only):

   ```bash
   npm run od:check -- --slug <slug>
   ```

---

## D. Evidence requirements before Open Design

Run enrichment and prepare first:

```bash
npm run enrich:lead -- --slug <slug> --no-build
npm run brief:quality -- --slug <slug>
npm run site:prepare -- --slug <slug>
npm run od:prepare -- --slug <slug>
```

### Required inputs

| Artifact | Purpose |
|----------|---------|
| `briefs/<slug>/source-evidence.json` + `.md` | Verified sources, enrichment status |
| `briefs/<slug>/lead-validity.json` | Website status, build/pitch readiness |
| `briefs/<slug>/source-quality.json` | PASS or PASS_WITH_WARNINGS |
| `briefs/<slug>/site-strategy.json` + `.md` | Business angle, proof, tone |
| `briefs/<slug>/section-plan.json` + `.md` | Evidence-led section order |
| `briefs/<slug>/pitch-insight.json` + `.md` | Pitch framing |
| `briefs/<slug>/images/` | Curated real photos (manifest in open-design-brief) |
| Logo or colour reasoning | In `creative-brief.json` / `.md` |
| `open-design-brief.json` + `.md` | OD-specific brief (from `od:prepare` or hand-edited) |

### Do not start Open Design if

- `HAS_REAL_SITE` / `HAS_REAL_SITE_SKIP` (real website exists)
- `source-quality.json` status is **FAIL**
- `enrichment_complete !== true` or evidence is too thin
- Unresolved critical blocker (location mismatch, manual review) unless a **design-only waiver** is approved

Design-only pilots may run with outreach and pitch blocked, but evidence gates still apply.

---

## E. Open Design brief rules

- Start from evidence, not from the WebForTrades template skeleton.
- Use logo colours if a verified logo exists; otherwise photos, name, niche, review tone.
- **No placeholders** (lorem, example.com, stock URLs, visible "photo coming soon" boxes on the public site).
- **Real images only** from `briefs/<slug>/images/`. Image priority: official website, Google Places, directory, manual assets, Facebook evidence only under 600px is not for gallery or hero.
- If automatic images are weak, pause before Open Design and add manual assets to `briefs/<slug>/images/manual/`, then run `npm run assets:manual -- --slug <slug>`. Otherwise use proof-led layout.
- Open Design must not invent images. Internal `image_slots` in section-plan are planning only and must not appear as visible placeholder text on the final site.
- If Facebook images are low-res only (~315px), Apify and Graph often fail. Use manual asset workflow (`prompts/manual-asset-request-template.md`).
- **Local area map:** when location or service area evidence exists, include a Google Maps embed (no API key) or a static map-style area card with verified areas and a safe public Maps link. Do not invent areas. **Use area/postcode map queries, not full residential street addresses.** Keep full addresses in internal evidence only.
- **Address privacy:** public site shows city, area and postcode by default. JSON-LD uses locality + postalCode, not streetAddress, unless a public premises is verified.
- **Review copy:** reviews guide copy; one quote section and review cards are enough. Avoid naming many reviewers across normal sections. Write natural evidence-backed summaries without inventing facts.
- **Business footer:** real footer with brand, contact, areas, quick links, sourced hours if available, and a smaller WebForTrades credit at the bottom.
- **No invented facts** (reviews, areas, credentials, owner claims).
- **No old WebForTrades skeleton** section stack or default headings.
- **Banned headings** (never use): "Plumbing sorted properly", "Questions before you ring", "One van. One trade", "A note from X", "06 services. Done plainly", and similar template phrases.
- **No em dashes** anywhere. Use a hyphen, comma, or full stop.
- **No demo / preview / test / speculative** wording in public metadata (title, description, OG).
- **No official-site claim** unless verified.
- Footer credit only: "Website by WebForTrades" linking to `https://webfortradesuk.co.uk`.
- **Evergreen public review proof:** Open Design briefs and evidence use exact counts. When porting to the live site, public copy should age well: plus-style phrasing for large sourced counts (e.g. 45+ reviews), omit small secondary-platform review counts when the percentage alone is stronger ("100% recommended on Facebook"). Do not invent numbers.

---

## F. Artifact review

Run:

```bash
npm run od:check -- --slug <slug>
```

### Manual checks

- `artifact.html` and `artifact.css` exist and render in browser.
- Real images load from `assets/images/`.
- No placeholders, stock images, or unsupported claims.
- No em dashes, no banned headings, no wrong location (Greens: never Bristol).
- Suitable for Next.js port (semantic sections, stable class names, no external-only dependencies).

### Decision

| Outcome | Action |
|---------|--------|
| **Integrate** | Port to `sites/<slug>/`, then build and deploy |
| **Revise** | Short OD revision run or hand-fix artifact, re-check |
| **Reject** | Do not port or deploy. Fix brief or evidence first |

**Do not deploy if artifact review fails.**

---

## G. Porting artifact into Next.js

See `docs/open-design-next-porting-notes.md` for file-level detail. Summary from Greens:

1. Copy real images to `sites/<slug>/public/assets/images/`.
2. Port `artifact.html` body markup into `app/page.tsx` (JSX, fix `class` → `className`, self-close tags).
3. Port `artifact.css` into `app/globals.css` **below** Tailwind layers:

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   /* artifact CSS here */
   ```

4. Add `components/SiteEnhancements.tsx` for scroll reveal and sticky header if the artifact used JS for those (respect `prefers-reduced-motion`).
5. **`app/layout.tsx`**: metadata from `data/site-metadata.json`, build marker meta tags, LocalBusiness JSON-LD with **exact** `brief.business_name` string for deploy verification.
6. Footer link: **`https://webfortradesuk.co.uk`** (not `webfortrades.co.uk`).
7. Remove old template files: `ContactForm`, `GoogleReviewsButton`, `MidPageCta`, `MobileStickyBar`, `lib/copy.ts`, `lib/data.ts`, `lib/types.ts`, etc.
8. Confirm no old skeleton sections or headings remain.
9. **Add quote form** if the artifact omitted one: section id `#quote`, styled fields, preventDefault submit, no backend. Primary CTA → `#quote`, secondary → `tel:`.
10. **Mobile sticky CTA**: fade in after hero leaves view; hide near footer. Desktop header: Get quote → `#quote`.
11. **Trade fit**: if accents/type feel too luxury/interiors, soften gold/brass toward muted copper or sage and use a sturdier display serif (Greens: Source Serif 4 + Outfit).
12. **Local area map**: when location/service area evidence exists, add a Google Maps iframe embed (lazy-loaded, accessible title, no paid API key) or a static map-style area card with verified areas and a public Maps link. Query by area/postcode, not a residential street pin. Do not invent service areas.
13. **Address privacy**: public site uses city, area and postcode only. Full street address stays in internal evidence and JSON-LD (locality + postalCode only unless public premises verified).
14. **Review copy**: one strong quote section and review cards are fine. Do not name multiple reviewers across every section. Prefer natural evidence-backed summaries.
15. **Business footer**: expand beyond the WebForTrades credit. Include brand, phone, email, social if verified, service areas, quick section links, sourced hours, then a smaller WebForTrades link to `https://webfortradesuk.co.uk`.
16. **Gallery**: remove near-duplicate images. Prefer natural aspect ratios. **Layout:** tiles top-align; uneven bottoms are fine. Do not stretch shorter tiles or pad empty space under images. Prefer CSS columns masonry on desktop, or CSS Grid with `align-items: start`. Mobile single column. Captions directly under each image.

---

## H. Font handling

**Do not** add external Google Fonts `<link>` tags in `layout.tsx`.

**Use `next/font/google`** (or local fonts) so fonts are self-hosted in the Next bundle.

**Reason:** Deploy style verification fetches linked stylesheets. Escaped `&amp;` in Google Fonts URLs caused a ~931 byte font CSS file to be analysed instead of Tailwind, and the style gate failed on first Greens deploy.

Greens fonts (refined 2026-06-10):

- Display: Source Serif 4 → CSS var `--font-display`
- Body: Outfit → CSS var `--font-body`

Apply font variables on `<body className={...}>` in `layout.tsx`.

---

## I. Tailwind / style verification compatibility

The deploy pipeline runs `scripts/style_verify.ts`. It expects:

- Tailwind **preflight** (box-sizing border-box)
- Tailwind **utilities** in the analysed stylesheet
- **≥ 300** applied top-level CSS rules on the live page
- Reasonable body font detection

The Open Design artifact CSS drives the visual design. Tailwind is kept for **gate compatibility only**.

Greens approach:

- Keep `@tailwind base/components/utilities` in `globals.css`.
- Add a broad **safelist** in `tailwind.config.ts` so unused utilities still emit rules (see Greens site for patterns).
- Prefer **non-responsive** safelist utilities (responsive rules nest in `@media` and may not count).

Do not let the style gate force a template look. The artifact CSS should remain dominant.

---

## J. Build and deploy

From WebForTrades repo (Node 20):

```bash
npm run build:site -- --slug <slug>
npm run deploy -- --slug <slug>
```

Deploy verification checks:

| Check | Notes |
|-------|--------|
| Alias assignment | Business-related alias, not random "demo" names |
| `alias_status` | Must be **VERIFIED** |
| Build marker | Meta tags from `lib/build-marker.ts` in live HTML |
| Business name | Exact string match (JSON-LD name from `brief.json` works) |
| Phone / email | Digits / address when available |
| Style verify | Preflight + utilities + rule count; writes `style-verify.json` |
| Screenshot | `screenshots/<slug>/live-verify.png` |

Never assume `https://<slug>.vercel.app` without verification.

Greens verified alias: `greens-precise-plumbing-heating-ltd.vercel.app`  
Build marker: `greens-precise-plumbing-heating-ltd:20260610-be96223e`  
Style verify: 811 applied rules, body font Outfit, 0 issues.

---

## K. Gates after deploy

- Lead state may become **DEPLOYED** for review only.
- **READY_TO_PITCH** stays **false** if manual review, location mismatch, or contactability blockers remain.
- **Do not** update `outreach/contacted-leads.md` or `data/outreach-log.jsonl`.
- **No outreach** without explicit approval and `outreach.sending_enabled: true`.
- Keep `outreach.test_recipient_only: true` until Julius enables live sends.

---

## End-to-end command sequence (reference)

```bash
# 1. Readiness (read-only)
npm run od:status

# 2. Evidence (no Open Design yet)
npm run enrich:lead -- --slug <slug> --no-build
npm run site:prepare -- --slug <slug>
npm run od:prepare -- --slug <slug>

# 3. Open Design (manual via MCP - see section C)
# create_project → copy images → BRIEF.md → start_run cursor-agent → get_artifact

# 4. Artifact QA (read-only)
npm run od:check -- --slug <slug>

# 5. Port to sites/<slug>/ (manual - see porting notes)

# 6. Build and deploy (only after artifact review passes)
npm run build:site -- --slug <slug>
npm run deploy -- --slug <slug>
```

Do not run steps 3 or 6 automatically from helper scripts in this repo.
