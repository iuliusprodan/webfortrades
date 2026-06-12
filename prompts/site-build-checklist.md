# WebForTrades site-build checklist

Mandatory. Read `skills/webfortrades-site-design/SKILL.md` then this file before every build, rebuild, review, or deploy of a site.

## 0. Site design skill (before build)

- Read `skills/webfortrades-site-design/SKILL.md`. It overrides scattered design rules on conflict.
- **Gathering comes before design.** Run `npm run enrich:lead -- --slug <slug> --no-build` after gather and before build.
- Run `npm run brief:quality -- --slug <slug>` (or `--all-known`) to clean invalid `website_url` values before enrich or build.
- Always check email domains for hidden or broken websites when an email exists. Email-domain discovery is mandatory when email is present.
- Facebook images require retry and public-access verification. Failed downloads must record reasons in source evidence.
- **Do not use personal logged-in Facebook scraping.** Preferred path: Meta Graph API when configured, then Apify (`APIFY_TOKEN`) for public page images, then public HTML fallback (often ~315px thumbnails only).
- Cookie/login-based Facebook scraping is not allowed in automation.
- If `facebook_media_quality` is `LOW_RES_ONLY`, use proof-led or typography-led layout. Mark `NEEDS_MANUAL_ASSET_REVIEW` when a verified page exists but only thumbnails are accessible.
- Manual asset workflow: when automatic images fail, pause before Open Design. Add files to `briefs/<slug>/images/manual/`, run `npm run assets:manual -- --slug <slug>`. Statuses: `MANUAL_ASSET_REVIEW_RECOMMENDED`, `MANUAL_ASSET_REVIEW_REQUIRED`. Never render visible placeholders on the final public site.
- **AI hero imagery (optional, explicit only):** If image readiness FAIL and the failure reason is hero-only, you MAY run `npm run images:generate -- --slug <slug>` to fill the hero slot with AI imagery. Galleries still require real photos. Do not auto-trigger this step in batch scripts until explicitly enabled. AI images are tagged `source: ai_generated` and must never appear in galleries, reviews, or before/after blocks. A verified Google Places photo at 1000px+ always beats AI for the hero.
- **Section integrity:** Galleries must be multi-column on desktop (3 cols >=1024px, 2 cols 640-1023px, 1 col mobile). Single-column desktop galleries are invalid. Section titles that promise "explained plainly" or similar must have one-line evidence-based descriptions on each service item. Checked by `section_integrity` during deploy (built HTML + live style verify). Run `npm run test:section-integrity`.
- Directory image probing saves usable public images under `briefs/<slug>/images/directory/<source>/`.
- Broken-site leads (`BROKEN_SITE_READY`) are different from no-site leads (`NO_WEBSITE_READY`). Pitch framing must match validity status.
- Directory probes (Checkatrade, Yell, TrustATrader, MyBuilder) are useful but must be verified. Do not bypass anti-bot protections.
- `ready_for_build` is not the same as `ready_for_pitch`. Location mismatch blocks pitch until resolved.
- Always search public social and trade directory sources. Always extract verified logos where appropriate.
- If a real website exists (`HAS_REAL_SITE`), do not build by default.
- If evidence is incomplete, stop before building.
- Run `npm run benchmark:sources -- --slug <slug>` to verify logo/photo/website extraction before batch builds.
- If logo discovery fails but Facebook or website shows logo signals, flag manual review.
- If photo count is weak after discovery, use proof-led or typography-led layout only.
- Build starts from evidence, not layout. Run `npm run site:prepare -- --slug <slug>` after enrich.
- Required artifacts before build: `source-evidence`, `site-strategy`, `section-plan`, `creative-brief` (see `config.yaml` site_design flags).
- Do not use the fixed 10-section template skeleton by default.
- Clone review must pass before READY_TO_PITCH: `npm run review:clone -- --slug <slug>`.
- Palette uniqueness alone is not enough. Section plan and copy must be business-specific.
- If `site_design.skill_enforced` is true in config.yaml, build fails when artifacts are missing.

## 1. CTAs

- Every prospect site must include a **quote form** section with id `#quote`.
- Main CTA must be "Get a quote" or "Get a free quote".
- Main CTA always scrolls to the quote form (`#quote`).
- Secondary CTA is the phone number (`tel:` link).
- Email is tertiary, not the main hero CTA.
- Hero must use this pair:
  - Primary: Get a quote / Get a free quote → `#quote`
  - Secondary: Call [business/owner] - [phone]
- Mobile sticky bar must use the same pair, with shortened labels if needed:
  - Get quote → `#quote`
  - Call → `tel:` link
- Mobile sticky CTA must **fade in only after the hero scrolls out of view**, not on initial page load.
- Mobile sticky CTA must hide before the footer or avoid covering the WebForTrades credit.
- Desktop header can use a light "Get quote" linking to `#quote`; phone optional if layout supports it.
- Static preview quote forms must not submit, send email, or contact the business. Prevent default and show a small notice only after submit attempt.
- Add only 2-3 tasteful mid-page CTAs total, for example:
  - after Selected work
  - after Services
  - after FAQ or near Contact
- Do not add CTAs after every section.
- Do not put a generic quote CTA in the Reviews section if the Google reviews button is present.
- Mid-page CTA examples:
  - "Need this sorted? Get a free quote."
  - "Want a price before booking? Get a quote."
  - "Prefer to talk it through? Call [business/owner]."

## 2. Stats

- Only show stats that are certain from the brief/source.
- Do not use inferred service areas as a numeric stat.
- Do not show "9 towns covered" unless the business explicitly states those 9 areas.
- Do not invent "100% customer satisfaction" unless the source proves it.
- Do not reuse demo/template stats.
- **Never use these as headline stats:**
  - photos gathered
  - real project photos
  - project photos
  - gallery size
  - images collected
  - number of images
- **Avoid weak filler stats** like "services listed" or "core services" unless there are not enough stronger sourced stats and the design genuinely needs it. Log the reason in build-notes.md if used.
- **Prefer strong sourced stats:**
  1. Google rating, if sourced
  2. Google review count, if sourced
  3. Years trading, only if sourced
  4. Emergency / same-day availability, only if sourced
  5. Insured / certified / Gas Safe / NICEIC, only if sourced
  6. Fixed quote / written quote / response promise, only if sourced
- If only 2 strong stats are available, show 2 stats.
- If only 3 strong stats are available, show 3 stats.
- Do not force 4 stats.
- Do not pad stats with weak ones.
- If a stat is uncertain, omit it.

## 3. Reviews

- Review count must come from Google Places or another verified source for that exact business.
- Never confuse "number of review snippets gathered" with total Google review count.
- Never hardcode template values like 5 reviews, 47 reviews, 73 reviews, etc.
- If the review count is uncertain, do not show a numeric review-count stat.
- If only review snippets were gathered but no total count, say "Google reviews" without a count.
- **Evergreen public review proof:** keep exact counts in `source-evidence.json`, briefs, and internal notes. On the live site, larger sourced counts may use plus-style phrasing (e.g. "45+ reviews" when 45 is sourced). For small secondary-platform counts, omit the count if it dates quickly (prefer "100% recommended on Facebook" over "100% recommended on Facebook from 10 reviews"). Use correct grammar: "recommended on Facebook". Do not invent or inflate numbers. Plus-style phrasing only when the exact count is sourced.
- Review text must be real sourced text, not invented.
- Reviewer names should be first names only.
- Add a **"Read all Google reviews"** button in the Reviews section when a Google Maps / Business Profile URL is in the brief.
- The button must link to the business's Google listing (`google_maps_url`).
- Use a Google "G" icon in or beside the button.
- If no Google profile / Maps URL is available, omit the button rather than inventing a link.
- The Google reviews button replaces a generic mid-page CTA in that section. Do not stack too many CTAs.

## 4. Service areas

- Service areas must be city/town/local-area led.
- Never use a street address as a town covered.
- Never use a full postcode as a town covered.
- If areas are inferred, do not turn them into a numeric stat.
- Keep the main location first.
- If the listing does not specify coverage, use a modest nearby-area list but treat it as copy, not a stat.
- Use "Based" as city/town + outward postcode, for example "Bristol, BS2".
- Avoid repeating full street addresses in visible copy.
- Treat Google listing addresses as possible home addresses unless clearly a showroom, shop, office, yard, or public premises.
- **Local area map (mandatory when location evidence exists):** add a Google Maps embed (lazy-loaded iframe, no paid API key) or a polished static map-style area card with verified areas and a safe public Maps link. Do not invent service areas. **Map queries should use area/postcode (e.g. Bristol BS5 8JB, UK), not a full residential street address**, unless the business clearly operates from a public premises.
- **Address privacy (prospect sites):** do not show full street addresses on the public site by default. Use city, postcode district or postcode, and service areas. Keep full addresses in internal evidence only. JSON-LD: locality and postalCode, not streetAddress, unless a public showroom/office is verified.
- **Review copy usage:** reviews guide copy but should not dominate every section. One strong quote section and review cards are fine. Avoid naming multiple reviewers across many normal sections. Prefer natural evidence-backed summaries. Do not invent named reviewers, jobs, certifications, years, guarantees or awards.
- **Business footer:** include brand, verified contact details, service areas, quick section links, sourced opening hours when available, and a smaller WebForTrades credit linking to `https://webfortradesuk.co.uk`. No fake company numbers, VAT, certifications, or guarantees.

## 5. Services

- Validate services before building.
- Do not use the broad trade/niche as a service.
- Invalid examples:
  - plumbers
  - electricians
  - roofers
  - mechanics
  - decorators
- Merge duplicates like "Plumbing" and "General plumbing".
- Use 4-6 specific services where possible.
- Services should be supported by photos, reviews, categories, snippets, or sensible trade context.
- Do not repeat the same generic description for every service.
- If uncertain, use fewer stronger services instead of filler.

## 6. Owner, contact names and business voice

- Do not invent an owner name.
- Scan Google review **body text** for repeated staff/contact first-name mentions.
- Exclude reviewer display names, business name tokens, city names, service words, and common stopwords.
- Require at least **2 independent review bodies** mentioning the same first name before storing `contact_name` with `contact_name_usage_allowed: true`.
- If only 1 review body mentions a name, store `possible_contact_name` only. Do not use it in public copy without manual review.
- Store confidence and evidence:
  - `high`: 3 or more review-body mentions
  - `medium`: 2 review-body mentions
  - `low`: 1 review-body mention
- Fields: `contact_name`, `contact_name_source: "google_reviews"`, `contact_name_confidence`, `contact_name_evidence_count`, `contact_name_usage_allowed`.
- Keep `owner_name: null` unless a stronger explicit source confirms ownership (not review mentions alone).
- A review-mentioned first name may be used in soft copy such as "Call Jack" or "A note from Jack".
- Do not promote a review-mentioned first name to `owner_name` without verified ownership source.
- Do not invent surnames, roles, founder claims, family claims, or ownership claims.
- Do not use names from reviewer profiles as contact-name evidence.
- If `contact_name_usage_allowed` is true:
  - Hero phone CTA may use "Call {contact_name} - {phone}"
  - Mobile sticky call CTA may use "Call {contact_name}"
  - Owner note may use "A note from {contact_name}" (not "owner {contact_name}")
  - About/reviews copy may note customers name the person in reviews
- If `owner_name` is explicitly sourced, owner-specific copy is allowed.
- If only `contact_name` from reviews, use contact/person language, not owner language.
- If no contact_name or owner_name:
  - Use "Call {business_name}" or "Call the team"
  - Use "A note from the team", "A note from the plumber", or "A note from {business_name}"
- Do not put contact names in metadata title unless there is a strong reason. Keep metadata business-led.
- If owner_name is missing, use:
  - "A note from the team"
  - "A note from the plumber"
  - "A note from [Business Name]"
  - Or "A note from {contact_name}" when review evidence supports it
- Do not write "A note from [city]".
- Do not write first-person owner copy unless a real owner name is known.
- Use team/business voice when owner is unknown and contact_name is not allowed.
- No em dashes.

## 7. Header and sticky mobile bar

- Header brand must be the **business name** (`brief.business_name`), linked to the top of the page.
- Never use a service, trade, niche, or generated service label as the header brand.
- Do not use `primaryTrade()`, first service, or category as header brand fallback.
- If business name is missing from brief and lead, **fail the build**.
- Header must be sticky or fixed on every site.
- Header must have top: 0 and a correct z-index.
- Header must remain readable while scrolling.
- Mobile sticky bar must never cover the footer or the WebForTrades credit.
- Reserve enough bottom padding on the page or hide the sticky bar when the footer enters view.
- Test this on mobile at 390px.

## 8. Forms

- Quote form must include:
  - name
  - email
  - phone
  - postcode
  - job type dropdown
  - details textarea
  - optional multi-image upload
- Photo upload label: "Add photos of the job (optional)"
- Photo upload must be visible unless there is a clear trade-specific reason to omit it.
- If omitted, log the reason in build-notes.md.

## 9. Design

- Use the library to help, not copy.
- Read /library/index.md before build.
- Same studio DNA, different site.
- Pick the corner style, font pairing, palette, hero layout and gallery treatment to suit the trade and photos.
- Do not just recolour the previous site.

## 9a. Subtle animations

- Real prospect websites should include subtle, clean, professional animations by default.
- Use gentle fade-ins, slight upward reveal on sections, soft image hover states, smooth anchor scrolling, and small CTA hover transitions.
- Keep animations tasteful, lightweight, and premium. Do not overdo it. No distracting movement.
- Animations should make the site feel polished, not flashy.
- Respect `prefers-reduced-motion`. Disable or simplify motion when the user prefers reduced motion.
- Animations must not hurt performance, readability, or mobile usability.
- Animations must not break screenshots, OG images, or preview video capture.
- Preview videos still use stable capture settings (production static export, white capture header, constant-speed scroll). Avoid animation jitter during capture.
- No em dashes.

## 10. Deployment

- Internal demo/template sites can use random unguessable aliases.
- Real prospect sites should use the business slug where possible.
- Example: bristol-plumbing-co.vercel.app
- If taken:
  - bristol-plumbing-co-site.vercel.app
  - bristol-plumbing-co-xxxxxx.vercel.app
- Update leads.db, library/index.md, build-notes.md and outreach drafts with the final URL.

## 12. Metadata and outreach previews

- Every real prospect site must have strong metadata that reads like a real local business website.
- Never mention demo, sample, preview, test, concept, speculative, or WebForTrades in public metadata.
- Never claim the site is official unless the business has explicitly approved it.
- Title must include business name, location, and main service category when data exists.
- Description must explain what the business does, where it works, and how to contact it.
- Include sourced proof such as rating and review count only when verified from the brief.
- Do not use raw comma-separated service lists as descriptions.
- Do not use random business or project photos as Open Graph images.
- Prefer a generated hero screenshot as the Open Graph image (`/og-image.png`, 1200 x 630).
- If hero screenshot cannot be generated, use a clean branded OG card with business name, city, trade, sourced proof, and phone.
- If neither can be generated, use no OG image.
- Run `npm run preview:site -- --slug <slug>` after build to generate outreach screenshots.
- Video previews are optional (`--video` flag). Screenshot previews are mandatory.
- Default video format is desktop 16:9 at 1280 x 720. Optional 4:3 at 1024 x 768 via `--ratio 4:3`.
- Delete stale `site-scroll.mp4` before regenerating a video.
- Do not start video recording until the page is loaded, fonts are ready, hero content is visible, and a preflight frame is not blank.
- Pre-scroll the page once to load lazy images, then return to top before recording.
- Generate preview assets from production static export (`npm run build` + serve `out/`), not `next dev`.
- Preview assets must not show Next.js dev indicators or local dev UI. `devIndicators: false` in next.config.ts.
- Video motion: hold briefly on hero (~1.5s), then constant-speed scroll to the quote/contact form, then hold on the form (~1.5s).
- During video capture, use a clean white capture-only header (no backdrop blur) if blur causes jitter. Stability beats decorative glass.
- No em dashes in metadata.

## 14. Outreach pitch (approval first)

- After deploy, prepare WhatsApp or email drafts for approval. Do not send until `sending_enabled=true` and Julius approves.
- Generate OG image, hero screenshot, and optional preview video before pitching.
- WhatsApp touch 1: short, personal, low pressure. Use contact first name only when review evidence is strong. Never owner/founder claims.
- Do not include price in first WhatsApp by default. Suggest £200 to £300 based on reviews, niche, and site complexity. Keep a price reply ready.
- Attach `briefs/<slug>/outreach/site-scroll.mp4` on WhatsApp when available.
- Never send automatically while `test_recipient_only=true`.
- No em dashes in outreach copy.

Commands:

```bash
npm run preview:site -- --slug <slug>
npm run preview:site -- --slug <slug> --video
npm run preview:site -- --slug <slug> --video --ratio 16:9
npm run preview:site -- --slug <slug> --video --ratio 4:3
```

## 11. Final self-review before deploy

Before deploying, check:

- Header sticky works
- Header brand is the business name (not a service or trade label)
- Hero CTA pair is correct
- Mobile sticky CTA pair is correct
- Mobile sticky bar does not cover footer credit
- Stats are sourced and safe (no photo counts or weak filler)
- Review count is correct or omitted (not snippet count)
- Google reviews button present when Maps URL exists
- No quote CTA inside Reviews when Google button is shown
- Services are specific and not filler
- Service areas do not contain street addresses or full postcodes
- Full address is not repeated in visible copy
- Unknown owner is handled honestly
- Review contact names extracted when evidence supports (2+ review bodies)
- Contact name used without owner/founder/surname claims when only review-sourced
- Quote form includes email and photo upload
- Metadata title and description are specific, local, and sourced
- OG image is hero screenshot or branded card, not a project photo
- Outreach preview screenshots exist (run preview:site)
- Footer credit links to https://www.webfortradesuk.co.uk
- Footer includes business contact, areas, quick links, and sourced hours when available (not credit only)
- Local area map or map-style area card present when location/service area evidence exists
- Public site does not show full street address unless user approved or public premises verified
- Gallery has no near-duplicate images; portrait and landscape ratios respected
- Gallery tiles top-aligned with natural heights; no empty strip under shorter images (masonry columns or grid `align-items: start`)
- No em dashes
- Site looks bespoke, not generic
- Subtle animations present where appropriate, with reduced-motion fallback

- Run batch QA: `npm run review:batch -- --batch data/<batch>.json`

## 13. Contactability before build

- Before building a real prospect site, confirm the lead has a valid contact method (`contactability_status=CONTACTABLE`).
- If no email exists, confirm WhatsApp availability on a UK mobile during gather. This is check-only and must not send messages.
- If no email and no WhatsApp, do not build, deploy, or outreach by default (`DISQUALIFIED_NO_CONTACT_METHOD`).
- Landline-only leads with no email are disqualified. OpenWA must not be called for landlines.
- WhatsApp API or session errors go to manual review (`NEEDS_MANUAL_REVIEW`), not automatic disqualification.
- Use `--allow-manual-review` on build, deploy, or outreach only after a human has reviewed a `NEEDS_MANUAL_REVIEW` lead.
- No em dashes.

## 14. Creative brief and design diversity (mandatory)

- Before every real prospect build, generate and save `briefs/<slug>/creative-brief.json` and `.md`.
- Each site must have a distinct visual direction. Do not clone the last successful website.
- Do not reuse the same palette, font pair, layout family, or hero headline across consecutive batch sites.
- Gallery: cluster near-duplicates. Max 2 images per project cluster unless photo count is very low.
- Photo captions must be safe. Never use supplier names or inferred service areas as job locations.
- Based city comes from Google address when confidence is high. Review must fail Bristol/Swansea mismatches.
- Run batch QA: `npm run review:batch -- --batch data/<batch>.json`

## 15. Deploy URL verification (mandatory)

- Every generated site must include hidden build markers in HTML (`webfortrades-build-id`, `webfortrades-business-slug`).
- Preflight alias URLs before assignment. If a live page exists without our build marker, treat as taken.
- Try fallback aliases: slug-city, slug-postcode, slug-uk, slug-web. Never use "demo" in prospect URLs.
- Deploy verifies build marker, business name, and phone at the final URL. HTTP 200 alone is not enough.
- Store verified_site_url and alias_status. Do not pitch unless READY_TO_PITCH.

## 16. Controlled parallel batches (mandatory for multi-site runs)

- Use `npm run batch:sites -- --location <loc> --niche <niche> --count <n> --concurrency 3 --no-outreach` for multi-site runs.
- Prospecting, lead selection and dedupe happen once centrally before any worker starts.
- Contactability is confirmed before build. Only `CONTACTABLE` leads build unless `--allow-manual-review`.
- Each lead gets its own isolated job under `data/batches/<batch-id>/jobs/<slug>.json` and a pre-assigned distinct creative direction (`briefs/<slug>/creative-constraint.json`).
- Site work (gather, build, preview, review) runs in parallel up to `--concurrency` (default 3).
- Deploy runs at lower concurrency (`--deploy-concurrency`, default 2). Vercel alias assignment is serialised with a cross-process lock.
- SQLite writes are safe under concurrency via WAL plus `busy_timeout`.
- Each worker uses unique ports (review 4400+slot, preview 4500+slot). Never share ports or temp folders.
- Batch review runs once after all sites finish: `npm run review:batch -- --batch data/batches/<batch-id>/batch-report.json`.
- The orchestrator never sends outreach and never writes `outreach/contacted-leads.md` or `data/outreach-log.jsonl`.
- READY_TO_PITCH requires: contactable, gather, creative brief, build, review, batch uniqueness, deploy verified, final URL verified, screenshots, preview video, no location mismatch needing review, no critical warnings.
- Test with `--count 2 --concurrency 2` before running a full 8-site batch.
- No em dashes.

## 17. Verified public Facebook sources

- Google Places is the default source, but verified public Facebook pages are valuable for logos, photos, service hints and brand colours.
- Search for Facebook when Google photos are weak, repetitive, or missing.
- **Do not use personal logged-in Facebook scraping.** Do not automate a logged-in browser or bypass login walls, CAPTCHAs, or private content.
- **Preferred media path:** Meta Graph API when configured, then Apify REST API (`APIFY_TOKEN`, `scripts/apify_facebook.ts`), then public HTML/OG fallback. Apify MCP is optional for Cursor manual actor tests (`docs/apify-mcp-setup.md`).
- Verify Facebook pages before use. High confidence when phone matches Google and name or location also matches.
- Save all Facebook source URLs, Graph API status (`facebook_graph`), Apify status (`facebook_apify`) in source-evidence.
- Use verified high-res Facebook photos to improve gallery diversity. Max 2 images per near-duplicate cluster.
- If only low-res Facebook thumbnails exist, mark `LOW_RES_FACEBOOK_ONLY` and do not use a photo-led design unless Apify enrichment or manual assets are supplied.
- Use verified Facebook logo/profile colours where useful. Logo is for branding, not the gallery.
- Facebook photo captions must be safe. Do not invent job locations.
- Manual override: `npm run gather -- --slug <slug> --facebook-url "<url>"`
- If Facebook access is blocked, mark manual review rather than guessing.
- Tests: `npm run test:facebook-graph`. Benchmark: `npm run benchmark:sources -- --slug <slug>`.
- No em dashes.

## 18. Open Design (bespoke visual generation)

Use when generating a bespoke HTML concept instead of the template builder. **Do not rediscover the workflow each time.**

- Read `docs/open-design-to-vercel-recipe.md` and `docs/open-design-deploy-checklist.md`.
- Readiness (read-only): `npm run od:status`.
- Evidence first: enrich, `site:prepare`, then `npm run od:prepare -- --slug <slug>`.
- Do not start Open Design if `HAS_REAL_SITE`, source-quality FAIL, or enrichment incomplete.
- OD project name: `webfortrades-<slug>-pilot`. Skill: **design-taste-frontend**. Agent: **cursor-agent** only.
- Copy real images into OD `assets/images/`. Write `BRIEF.md` in the OD project. Poll until run succeeds.
- Save artifact to `open-design-artifacts/<slug>/`. Run `npm run od:check -- --slug <slug>` before port.
- Do not deploy if artifact review fails.
- Port using `docs/open-design-next-porting-notes.md`: `next/font/google`, Tailwind layers + safelist, build marker, JSON-LD exact business name, footer `https://webfortradesuk.co.uk`.
- Remove old template skeleton when porting. No outreach after deploy unless explicitly approved.
- No em dashes.
