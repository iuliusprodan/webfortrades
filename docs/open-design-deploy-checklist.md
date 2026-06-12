# Open Design deploy checklist

Short operational checklist. Full detail: `docs/open-design-to-vercel-recipe.md`.

---

## Before Open Design

- [ ] `npm run od:status` passes (daemon + cursor-agent)
- [ ] `npm run enrich:lead -- --slug <slug> --no-build` done
- [ ] `source-quality.json` is PASS or PASS_WITH_WARNINGS
- [ ] `lead-validity.json` does not block (`HAS_REAL_SITE` = stop)
- [ ] `enrichment_complete === true`
- [ ] `npm run site:prepare -- --slug <slug>` done
- [ ] Images curated under `briefs/<slug>/images/`
- [ ] If `manual_asset_status` is `MANUAL_ASSET_REVIEW_REQUIRED`, add images to `briefs/<slug>/images/manual/` and run `npm run assets:manual -- --slug <slug>` before Open Design
- [ ] If automatic images are weak, use proof-led layout. Never ask Open Design for visible placeholders
- [ ] `npm run od:prepare -- --slug <slug>` done (blocks when manual assets required but missing)
- [ ] Creative direction distinct from recent batch sites
- [ ] Outreach still blocked (`sending_enabled: false`)

## During Open Design

- [ ] Project name: `webfortrades-<slug>-pilot`
- [ ] Skill: `design-taste-frontend` (unless documented reason not to)
- [ ] Agent: **`cursor-agent`** only
- [ ] Real images copied to OD `assets/images/`
- [ ] `BRIEF.md` written in project (no placeholders, no em dashes)
- [ ] Poll `get_run` until succeeded (do not cancel early)
- [ ] Save bundle to `open-design-artifacts/<slug>/`

## Before port

- [ ] `npm run od:check -- --slug <slug>` passes
- [ ] Human review: layout, copy, images, location, claims
- [ ] Decision: integrate / revise / reject
- [ ] If reject or revise, do not port yet

## Before deploy

- [ ] Artifact ported to `sites/<slug>/`
- [ ] Old template skeleton removed
- [ ] `next/font/google` used (no external font links)
- [ ] Tailwind layers + safelist present for style gate
- [ ] Build marker meta tags in `layout.tsx`
- [ ] JSON-LD business name matches `brief.json` exactly
- [ ] Footer links to `https://webfortradesuk.co.uk`
- [ ] Quote form section `#quote` added (if artifact had none)
- [ ] Primary CTA → `#quote`, secondary → call, email tertiary
- [ ] Mobile sticky appears after hero, hides near footer
- [ ] Local area map or map-style area card present when location evidence exists
- [ ] Public site uses area/postcode only, not full street address (unless approved)
- [ ] Review copy does not over-name reviewers across every section
- [ ] Business footer includes contact, areas, quick links, and smaller WebForTrades credit
- [ ] Gallery has no near-duplicates; natural aspect ratios; tiles top-aligned, no empty strip under shorter images
- [ ] Public review proof is evergreen (exact counts in evidence only; 45+ on site if 45 sourced; no "from 10 reviews" on Facebook)
- [ ] Local build succeeds (`npm run build` in `sites/<slug>/`, not template `build:site` for OD ports)

## After deploy

- [ ] `deploy.json` alias_status VERIFIED
- [ ] Live HTML has build marker, name, phone, email
- [ ] `style-verify.json` passes
- [ ] Screenshot saved
- [ ] Lead state DEPLOYED (review only if blockers remain)
- [ ] READY_TO_PITCH only if all pitch gates clear
- [ ] No outreach logs touched

## Safety checks (always)

- [ ] No Open Design generation from unattended scripts
- [ ] No outreach, WhatsApp, or email
- [ ] `outreach.sending_enabled: false`
- [ ] `outreach.test_recipient_only: true`
- [ ] No contact with any business
