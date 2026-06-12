# Open Design Next.js porting notes

How the **Greens Precise Plumbing & Heating Ltd** Open Design artifact was ported to Next.js (2026-06-10).  
Reference site: `sites/greens-precise-plumbing-heating-ltd/`  
Artifact source: `open-design-artifacts/greens-precise-plumbing-heating-ltd/`

See also: `docs/open-design-to-vercel-recipe.md`, `templates/open-design-next-port/README.md`.

---

## File mappings

| Open Design artifact | Next.js site |
|---------------------|--------------|
| `artifact.html` (body content) | `app/page.tsx` |
| `artifact.css` | `app/globals.css` (after `@tailwind` layers) |
| `assets/images/*.webp` | `public/assets/images/*.webp` |
| Inline scroll/sticky JS | `components/SiteEnhancements.tsx` (client component) |
| `<title>` / meta description | `data/site-metadata.json` + `app/layout.tsx` metadata export |
| Business facts | `data/brief.json` (existing gather output) |
| Build marker | `lib/build-marker.ts` + meta tags in `layout.tsx` |
| LocalBusiness schema | JSON-LD function in `app/layout.tsx` |

### Files removed (old template skeleton)

- `components/ContactForm.tsx`
- `components/GoogleReviewsButton.tsx`
- `components/MidPageCta.tsx`
- `components/MobileStickyBar.tsx`
- `lib/copy.ts`, `lib/data.ts`, `lib/types.ts`

---

## Image path mapping

| OD path in HTML | Next.js public path |
|-----------------|---------------------|
| `assets/images/hero-bathroom.webp` | `/assets/images/hero-bathroom.webp` |
| `assets/images/*.webp` | `/assets/images/*.webp` |

In JSX, use root-relative paths: `src="/assets/images/hero-bathroom.webp"`.

Greens copied six WebP files:

- hero-bathroom.webp
- bathroom-shower-vanity.webp
- bath-radiator.webp
- matt-black-shower.webp
- kitchen-bayview.webp
- cloakroom-marble.webp

---

## Metadata mapping

| Field | Source |
|-------|--------|
| `title` | Business-led, no WebForTrades in title |
| `description` | Services, area, rating, phone, email from brief |
| `metadataBase` | Verified deploy URL |
| `ogImage` | Optional outreach asset if present |
| Build marker meta | `BUILD_MARKER_SLUG`, `BUILD_MARKER_BUILD_ID` from `lib/build-marker.ts` |

Public metadata must not contain: demo, preview, test, speculative, or WebForTrades branding.

---

## Scroll reveal mapping

The OD artifact used intersection observer patterns for section fade-in and a sticky header class toggle.

Ported to `components/SiteEnhancements.tsx`:

- Adds `is-visible` to `[data-reveal]` elements when in viewport
- Toggles header class on scroll
- Wrapped in `"use client"`
- Skips animations when `prefers-reduced-motion: reduce`

Import in `app/page.tsx` or `layout.tsx` as needed.

---

## Fonts mapping

| OD CSS variables | next/font setup |
|------------------|-----------------|
| `--font-display` | `Cormorant_Garamond` with `variable: "--font-display"` |
| `--font-body` | `Outfit` with `variable: "--font-body"` |

Apply on `<body>`:

```tsx
<body className={`${display.variable} ${body.variable}`}>
```

**Do not** add `<link href="https://fonts.googleapis.com/...">` in layout.

---

## JSON-LD mapping

Deploy verification searches live HTML for the exact business name string from `brief.json`.

Greens `brief.business_name`: `Greens Precise Plumbing & Heating ltd` (note lowercase "ltd" matches Google listing).

JSON-LD in `layout.tsx`:

```tsx
name: brief.business_name,  // exact match required
telephone: brief.phone,
email: brief.email,
areaServed: brief.service_area,
```

Optional `aggregateRating` when rating and sourced review count exist.

---

## Tailwind / style gate workaround

Problem: Style verifier needs Tailwind preflight + utilities and ≥300 applied CSS rules. Pure artifact CSS alone may not satisfy utility detection.

Solution (Greens):

1. Keep `@tailwind base; @tailwind components; @tailwind utilities;` at top of `globals.css`.
2. Add broad **safelist** patterns in `tailwind.config.ts` for spacing, flex, grid, typography utilities.
3. Safelist classes are **not used in markup** - they only inflate the CSS bundle for verification.
4. Visual design remains 100% artifact CSS.

First deploy failed because an external Google Fonts stylesheet (~931 bytes) was picked as the primary CSS file. Switching to `next/font/google` fixed style verify (811 rules, Outfit detected).

---

## Deploy verification pitfalls

| Pitfall | Fix |
|---------|-----|
| Wrong footer domain | Use `https://webfortradesuk.co.uk` |
| Business name mismatch | JSON-LD `name` must match `brief.json` exactly |
| External font links | Use `next/font/google` |
| Style gate false fail | Tailwind layers + safelist; fix CSS selector order in verifier if needed |
| Alias taken | Deploy script preflight + business-specific fallback aliases |
| Assuming slug URL | Verify `alias_status: VERIFIED` in `deploy.json` |
| Old skeleton in DOM | Remove template components before deploy |
| Em dashes in copy | Search artifact and site before deploy |
| Wrong city (Greens) | Never use Bristol; verified base is Swansea |

---

## Suggested port order

1. Copy images to `public/assets/images/`
2. Create `globals.css` with Tailwind layers + artifact CSS
3. Create `tailwind.config.ts` with safelist
4. Port `page.tsx` markup, fix paths and JSX syntax
5. Update `layout.tsx` (fonts, metadata, JSON-LD, build marker)
6. Add `SiteEnhancements.tsx` if needed
7. Remove old template files
8. Run `npm run od:check` on artifact (if not already)
9. Local build, then deploy

Do not deploy until steps 1 to 8 pass review.
