# Deploy notes - Greens Precise Plumbing & Heating Ltd

**Canonical first successful Open Design to Vercel deploy** (2026-06-10).  
Reference workflow: `docs/open-design-to-vercel-recipe.md`.

Deployment for **review only**. Not pitch approval.

## Refinement deploy (2026-06-10, second pass)

Targeted updates after layout approval. No Open Design re-run, no skeleton restore.

| Change | Detail |
|--------|--------|
| Trade-appropriate styling | Muted copper accent `#8a6640` (was bright brass `#b08a4f`). Sage label accent `#5a7a62` on light sections. Softer hero frame. |
| Typography | **Source Serif 4 + Outfit** (was Cormorant Garamond + Outfit). Sturdier serif, less interiors-magazine feel. |
| Quote form | New `#quote` section with name, phone, email, postcode, job type, details, optional photos. Presentational only (preventDefault). |
| CTA hierarchy | Primary → `#quote` ("Get a free quote"). Secondary → `tel:07309553552`. Email tertiary. |
| Mobile sticky | Hidden until hero scrolls out; fades in; hides near footer. Get quote + Call only. |
| Mid-page CTAs | After services and reviews sections. |

## Final URL

- https://greens-precise-plumbing-heating-ltd.vercel.app (HTTP 200)
- Alias status: **VERIFIED**
- Build marker: `greens-precise-plumbing-heating-ltd:20260610-a3f1c82d`

## Deploy verification (refinement)

- HTTP 200, build marker, business name, phone, email present
- Live style verified: **848 applied CSS rules**, body font **Outfit**, primary button `rgb(138, 102, 64)`, **0 issues**
- Quote form and `#quote` anchor on live page
- Footer credit: `https://webfortradesuk.co.uk`
- Screenshot: `screenshots/greens-precise-plumbing-heating-ltd/live-verify.png`
- Manifests: `briefs/greens-precise-plumbing-heating-ltd/deploy.json`, `style-verify.json`

## Open Design generation (original pilot)

| Item | Value |
|------|--------|
| OD project | `webfortrades-greens-precise-plumbing-heating-ltd-pilot-2574` |
| Agent | **cursor-agent** |
| Skill | **design-taste-frontend** |
| Runtime | ~8.5 minutes |

## Site files (key)

- `app/page.tsx` - layout preserved; CTAs, mid-page CTAs, contact + quote sections
- `components/QuoteForm.tsx` - static quote form (no submit)
- `components/SiteEnhancements.tsx` - scroll reveal, sticky header, mobile bar after hero
- `app/layout.tsx` - Source Serif 4 + Outfit via `next/font/google`
- `app/globals.css` - accent palette, quote form styles, mobile bar behaviour

## Outreach status

- Outreach: **NOT SENT**
- READY_TO_PITCH: **false**
- Reason: `LOCATION_MISMATCH_NEEDS_REVIEW` (prospect found under Bristol search, verified base Swansea)
- `outreach.sending_enabled: false`, `outreach.test_recipient_only: true` unchanged
- `outreach/contacted-leads.md` and `data/outreach-log.jsonl` not touched
- Lead state: **DEPLOYED** (review only)

## Commands used (refinement)

```bash
cd sites/greens-precise-plumbing-heating-ltd && npm run build
npm run deploy -- --slug greens-precise-plumbing-heating-ltd --allow-manual-review
```

Do **not** use `npm run build:site` for Open Design ports (would regenerate template).
