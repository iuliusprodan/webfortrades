# JT Plumbing deploy notes

## 2026-06-10 refine (manual port polish)

- Added Google Maps embed to areas section (`#areas`) with lazy-loaded iframe and public Maps link
- Expanded business footer: brand, contact, areas, quick links, open 24 hours, smaller WebForTrades credit
- Removed duplicate gallery image (`facebook-bathroom-work.webp`, similar to radiator pipework)
- Gallery: 2x2 desktop grid, portrait vs landscape aspect handling
- Featured story image uses 3:4 ratio for portrait photo
- Mobile sticky adds body padding when visible
- Future rules saved: local area map + business footer in `.cursorrules`, README, checklist, recipe, SKILL

## 2026-06-10 gallery layout fix

- Gallery uses CSS columns masonry on desktop (natural image heights, no row stretching)
- Future gallery layout rule added to pipeline docs

- Removed full street address from public copy (64 Malvern Rd). Public location: Bristol BS5 8JB
- Google Maps iframe and link now query Bristol BS5 8JB, UK (area-level, not street pin)
- JSON-LD uses PostalAddress with locality + postalCode only
- Future rules: address privacy + review copy usage in pipeline docs

**URL:** https://jt-plumbing-bs5.vercel.app/

**Outreach:** NOT SENT. READY_TO_PITCH: false.
