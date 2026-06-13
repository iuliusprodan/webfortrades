# Build notes - AC Painters & Decorators (Path B)

## Hero image selection
Chose **10-places.webp** (1200x1600 portrait). It is the only one of the three available photos that is a
genuinely **finished, well-lit surface**: a smooth deep grey-charcoal stairwell and landing with a crisp
black flush door, white-painted spindles and a chrome rail. It reads boutique and moody and sits naturally
with the deep-aubergine palette and the colour-confidence angle. Portrait is fine per the site-design skill
(object-fit: cover crops it cleanly into the full-bleed hero and it fits mobile/portrait viewports);
`object-position: center 35%` keeps the door and landing in frame on the desktop crop. Verified at
screenshot stage.

Rejected as hero (and the reasons):
- **02-places.webp** - a room mid strip-out: bare pink plaster, exposed floorboards, a hired dehumidifier
  (DEH 587) in the centre. Work-in-progress, no finished surface. Excluded from the gallery entirely.
- **03-places.webp** - a period staircase mid-renovation: freshly applied bare plaster, stripped treads,
  dark stained newels with bare pine spindles. Shows period-house craft but is unfinished. Used once in the
  gallery with an honest neutral caption ("Period staircase, Liverpool"), never claimed as "finished".

## Gallery
Only one genuinely finished photo exists, so the gallery is deliberately compact (2 tiles: 10 + 03) rather
than padded. Captions are honest and never name a customer or street. The colour story is carried by the
signature block and the verbatim reviews instead of a large image wall. This is the honest reading of the
evidence, not a template default.

## Owner name
"Chris" used in a light third person, tied to the named team ("Chris and the team"). Basis:
brief.json `contact_name_usage_allowed=true`, named in 3 separate Google reviews (N, Gemma, Helen),
evidence_count=3, high confidence - clears the skill bar (>=2 review bodies). Business name is "AC Painters
& Decorators" (not "Chris's..."), so no possessive brand, no invented surname, no owner backstory.

## Location
enrich raised LOCATION_MISMATCH_NEEDS_REVIEW only because the Google address city (Bootle) differs from the
prospect region label (Liverpool). Same metro: Bootle (L20) is in the Liverpool/Merseyside urban area and
Crosby (evidenced in reviews[4]) sits just north. Coverage framed as Bootle, Crosby, Liverpool and north
Merseyside. No real mismatch. Street ("Springs Cl") never published; map uses "Bootle L20" only.

## Palette + fonts (distinctness)
"Boutique Feature": deep aubergine/damson `--ink #2E1A2C` (purple-toned, not burgundy), damson feature
`--plum #43223E`, bone white `--surface #F2EDE4`, warm brass `--accent #B08433`. Fonts: Bodoni Moda
(display, high-contrast editorial serif) + Mulish (body). Distinct from Kyle (slate/teal + Bricolage),
Damo (iron/cedar + Oswald), the library pairings, and the two parallel painter builds (sage+pewter,
white+eucalyptus+oak).

## Proof / claims
Only citable proof: Google 4.9 / 58. No certification, insurance, years-trading, third-party-platform proof
(all directory probes NOT_FOUND / snippet-only / rejected homonym). No invented colour beyond the evidenced
olive green. Review emoji stripped from quoted text.


## Deploy verification (2026-06-13)
- Preferred alias: ac-painters-decorators.vercel.app
- Deployment URL: https://ac-painters-decorators-i49l7d565-iulius-projects-0cb33a7b.vercel.app
- Verified URL: https://ac-painters-decorators.vercel.app
- Alias status: VERIFIED
- Deploy manifest: `/Users/iuliusprodan/.cursor/website/briefs/ac-painters-decorators/deploy.json`
- Marker found: yes
- Business name verified: yes
- Phone verified: yes
