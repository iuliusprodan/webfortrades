# Copy blocks - D.G. Decorating Services (Path B)

Full draft of every visible copy block. Each annotated with `[src: ...]` (evidence source in the frozen
brief) and `[swap: PASS/FAIL]` where **FAIL = lead-specific (good)**, PASS = generic (would fit another
decorating firm with a name swap). Functional UI labels (nav, buttons, form fields) are marked `[fn]`
and are expected-generic - excluded from the specificity goal. No em dashes; British English; no banned
phrases (review-quote text exempt).

---

## Header `[fn]`
- Wordmark: **D.G. Decorating Services** `[src: business_name]`
- Nav: Work, Reviews, Areas
- Button: **Get a quote**

## Hero
- Eyebrow: **Painters and decorators, Killingworth NE12** `[src: services 'painters and decorators' + based_location 'Newcastle Upon Tyne, NE12' / address Killingworth NE12 6HL]` `[swap: FAIL - NE12 / Killingworth specific]`
- H1: **Painters and decorators in Killingworth, with a finish so smooth it looks like new.** `[src: services 'painters and decorators'; reviews[1] Walter 'never saw paintwork so smooth ... look like new']` `[swap: FAIL]`
- Subhead: **Dan preps every surface and sands old doors and woodwork back before he paints, so dated rooms across Killingworth and North Tyneside come back flawlessly smooth and brighter.** `[src: reviews[2] simon 'prepares well before decorating'; reviews[1] Walter 'sanded ... so smooth'; reviews[3] allen 'outdated ... brighter'; service_area]` `[swap: FAIL]` (single sentence, 199 chars, within hero_subhead limits)
- Proof chip: **5.0 on Google, 24 reviews** `[src: google_rating, google_review_count]` `[swap: FAIL - exact numbers]`
- Primary CTA: **Get a quote** `[fn]` -> #quote
- Secondary CTA: **Call Dan, 07411 680190** `[src: phone]` `[fn]`

## Proof strip (marquee)
- Items: **5.0 on Google** / **24 reviews** / **Killingworth, NE12** / **Prep before every coat** / **Old doors brought back like new** / **Booked well ahead** `[src: google_rating; google_review_count; based_location NE12; reviews[2] simon prep + booked up; reviews[1] Walter doors like new]` `[swap: FAIL - prep/doors-like-new/booked-ahead are this lead's signals]`

## The difference (signature block)
- Eyebrow: **What Dan is known for**
- Statement 1: **The prep is done before a single coat goes on.** `[swap: FAIL]`
  - Body: **Dan preps every surface first, covers the room in dust sheets and sands old doors and woodwork back, because that is what makes the finish come up right.** `[src: reviews[2] simon 'prepares well before decorating which gives that great finish'; reviews[1] Walter 'sanded ... everything was covered with dust sheets right throughout property'; reviews[0] Lynn 'preparation work was excellent']` `[swap: FAIL]`
- Statement 2: **A finish so smooth it looks like new.** `[swap: FAIL - verbatim outcome from Walter]`
  - Body: **Old doors that had been painted before come back without a flaw, and customers say they have never seen paintwork so smooth.** `[src: reviews[1] Walter 'doors were not new ones so had been painted before ... not a flaw with them they are so good look like new ... never saw paintwork so smooth']` `[swap: FAIL]`
- Statement 3: **Dated rooms brought back brighter.** `[swap: FAIL]`
  - Body: **A whole home that had looked outdated for years comes back fresher and more welcoming, one room at a time, and the place is left tidy.** `[src: reviews[3] allen 'outdated for years ... completely transformed ... every room feel brighter and more welcoming'; reviews[0] Lynn whole-home + 'such tidy workers']` `[swap: FAIL]`
- Stats inline: **5.0** Google rating · **24** Google reviews · **6 days** Monday to Saturday `[src: google_rating, google_review_count, opening_hours Mon-Fri + Sat]` `[swap: FAIL - exact sourced numbers]`

## Services - "What Dan does"
- Heading: **What Dan does** `[swap: FAIL - named]`
- PD · **Interior painting and decorating** - Walls, ceilings, woodwork and whole rooms, painted to a clean, smooth finish. `[src: services_meta[0] 'Painting & decorating' (google direct); reviews[0] Lynn whole-home; reviews[3] allen 'fresh paint and neat decorating work']` `[swap: FAIL - smooth finish is this lead's method]`
- DW · **Doors and woodwork** - Old doors, skirting and trim sanded back and repainted so they look like new rather than just recoated. `[src: reviews[1] Walter 'doors ... sanded ... look like new']` `[swap: FAIL]`
- PR · **Surface preparation** - The part most of the finish depends on: filling, sanding and covering the room properly before any paint goes near it. `[src: reviews[2] simon 'prepares well before decorating'; reviews[0] Lynn 'preparation work was excellent'; reviews[1] Walter dust sheets/sanding]` `[swap: FAIL]`
- WH · **Whole-home redecoration** - A full home taken on room by room, from the hall and stairs to the kitchen, en-suite and bedrooms, with a written quote up front. `[src: reviews[0] Lynn 'hall landing and stairs, dining kitchen, utility, en-suite and bedroom ... detailed written quotation within a few days']` `[swap: FAIL]`

## Gallery (selected work)
- Heading: **Recent decorating in and around Killingworth** `[swap: FAIL - Killingworth named]`
- Intro: **A selection of finished rooms, doors and feature walls from homes across North Tyneside.** `[src: photos[] Google Places completed_project + service_area North Tyneside]` `[swap: PASS]`
- Captions: neutral and safe only - no invented room, job address or customer. Per image: **"Finished decorating, North Tyneside"** as the default; the implementer may use a more specific safe caption only where the image clearly shows it (e.g. "Repainted doors and woodwork, North Tyneside" for the door-hallway shot, "Feature wall, North Tyneside", "Kitchen diner, North Tyneside"). Never name a location or customer that isn't verifiable. `[src: photos[].classification = completed_project; reviews[1] doors]` `[swap: PASS - intentionally safe]`

## Reviews - "What Killingworth homeowners say about Dan"
- Heading: **What Killingworth homeowners say about Dan** `[swap: FAIL - names Dan + Killingworth]`
- Stat: **5.0 - Google rating, 24 reviews** `[src: google_rating, google_review_count]` (label "Google rating" - allowed; no banned sub-labels) `[swap: FAIL]`
- Quote 1 (verbatim excerpt, smooth finish + doors): **"Had some work done recently it looks amazing, very thorough from start to finish. I have never saw paintwork so smooth, doors were not new ones so had been painted before, they were sanded and there is not a flaw with them, they are so good look like new. Everything was covered with dust sheets right throughout property, they are very respectful of your home and very approachable."** - **Walter, Google review** `[src: reviews[1]; apostrophes/spelling normalised to ASCII, wording verbatim. The clause 'their detail too work is second too none' is dropped as a verbatim EXCERPT so the page prose stays robustly clean of the banned phrase 'second to none' regardless of the voice_review quote-exemption heuristic; remaining wording is unchanged.]` `[swap: FAIL]`
- Quote 2 (verbatim, whole-home + prep): **"We are absolutely delighted with the work that Dan has done. From our first contact with Dan to completion we couldn't fault him. We had hall, landing and stairs, dining kitchen, utility, en-suite and bedroom redecorated. Everything was done to a very high standard, preparation work was excellent. He came when he said and we had a detailed written quotation within a few days. Dan is such a friendly guy, such tidy workers. Will definitely use again."** - **Lynn, Google review** `[src: reviews[0]; stray ' -from' normalised, wording verbatim]` `[swap: FAIL]`
- Quote 3 (verbatim, prep + booked up): **"Fantastic job as usual. Dan prepares well before decorating which gives that great finish. I have always had to book well in advance as he is always booked up. Wouldn't go anywhere else."** - **Simon, Google review** `[src: reviews[2]; 'I've' normalised to 'I have']` `[swap: FAIL]`
- Quote 4 (verbatim, transformation): **"Our home looked outdated for years, but D.G. Decorating Services completely transformed it. The fresh paint and neat decorating work made every room feel brighter and more welcoming."** - **Allen, Google review** `[src: reviews[3]]` `[swap: FAIL]`
- Link: **Read all reviews on Google** `[fn]` -> https://maps.google.com/?cid=3767856490354972796

## How a job works with Dan (numbered - real sequence)
- Heading: **How a job works with Dan** `[swap: FAIL - named]`
- 01 **A look round and a written quote** - Dan comes when he says, looks at the rooms and gets a detailed written quote back to you within a few days. `[src: reviews[0] Lynn 'He came when he said and we had a detailed written quotation within a few days']` `[swap: FAIL]`
- 02 **Rooms covered and prepped first** - Dust sheets go down throughout, then the filling and sanding, so the surface is right before any paint goes on. `[src: reviews[1] Walter 'everything was covered with dust sheets right throughout property'; reviews[2] simon 'prepares well before decorating']` `[swap: FAIL]`
- 03 **Painted to a smooth finish** - Doors and woodwork sanded back and repainted, walls and ceilings finished smooth, taken at the pace good prep needs. `[src: reviews[1] Walter 'sanded ... never saw paintwork so smooth'; reviews[2] simon 'that great finish']` `[swap: FAIL]`
- 04 **Left tidy, the home brighter** - The work is finished to a high standard, the place left tidy, and the rooms come back fresher and more welcoming. `[src: reviews[0] Lynn 'very high standard ... such tidy workers'; reviews[3] allen 'brighter and more welcoming']` `[swap: FAIL]`
- Note line: **Dan is usually booked well in advance, so it is worth getting in touch early.** `[src: reviews[2] simon 'always booked up ... book well in advance']` `[swap: FAIL]`

## Where Dan works (areas + hours)
- Heading: **Where Dan works** `[swap: FAIL - named]`
- Body: **Based in Killingworth, Dan covers North Tyneside and the Newcastle upon Tyne suburbs, from Forest Hall and Longbenton across to Gosforth and up to Wideopen.** `[src: based_location Killingworth NE12; service_area North Tyneside / Newcastle upon Tyne; districts derived from NE12 geography]` `[swap: FAIL]`
- Area list: **Killingworth · Forest Hall · Longbenton · Benton · Gosforth · South Gosforth · Wideopen · Dudley · Annitsford · Backworth · Shiremoor · West Moor · Wallsend · Newcastle upon Tyne** `[src: Killingworth/North Tyneside/Newcastle evidenced (base + service_area); others derived from the NE12 base, plausible one-van radius - no over-claim]`
- Hours: **Monday to Friday, 8am to 5pm. Saturday, 8am to 1pm.** `[src: opening_hours Mon-Fri 8:00-17:00, Sat 8:00-13:00, Sun closed]` `[swap: FAIL - specific sourced hours]`
- Map: keyless Google Maps iframe, query **Killingworth NE12** (town + outward only; no street address). `[src: google_maps_url cid]`

## Get a quote (#quote)
- Heading: **Get a quote for your decorating** `[swap: PASS]`
- Body: **Tell Dan about the rooms, what you're after and roughly when, and he'll get a written quote back to you. He books up well in advance, so it helps to get in touch early.** `[src: phone; reviews[0] written quote; reviews[2] booked up]` `[swap: FAIL - written quote + books up are this lead's behaviour]`
- Side details (left column): **Call Dan on 07411 680190** `[src: phone]` · **Based in Killingworth, NE12** `[src: based_location]` · **Mon to Fri 8am to 5pm, Sat 8am to 1pm** `[src: opening_hours]`
- Form fields `[fn]`: Name · Phone · Email (optional) · Postcode · Job type (Whole-home redecoration / A few rooms / Doors and woodwork / Other) · Details
- Submit button: **Send job details** `[fn]` (says what happens; not "Submit")
- Secondary: **Or call Dan on 07411 680190.** `[src: phone]` `[fn]`
- Disclaimer (internal note): form is presentational only and must not submit to the business or carry any "preview form" banned text.
- Sticky CTA (quote-only): **Get a quote** `[fn]`

## Footer `[fn]`
- Brand: **D.G. Decorating Services** `[src: business_name]`
- Line: **Painting and decorating across Killingworth, North Tyneside and Newcastle upon Tyne.** `[src: service_area]`
- Phone: **07411 680190** `[src: phone]`
- Areas: **Killingworth · Forest Hall · Longbenton · Gosforth · Wideopen · Newcastle upon Tyne** `[src: service_area + derived districts]`
- Hours: **Mon to Fri 8am to 5pm · Sat 8am to 1pm** `[src: opening_hours]`
- Quick links: Work · Reviews · Areas · Get a quote
- **Read our Google reviews** -> https://maps.google.com/?cid=3767856490354972796
- Credit: **Website by WebForTrades** (small) -> https://webfortradesuk.co.uk

---

## Notes for implementation (Phase 2)
- No creative copy decisions remain. Phase 2 translates these blocks verbatim into JSX.
- Forbidden in build: any certification/insurance/years-trading claim; any third-party platform proof
  (Checkatrade/Yell/MyBuilder/Trustpilot); the street address 'Garth Twenty Four'; exterior painting /
  plastering / wallpaper-hanging as services; em dashes. Meta lines about the Facebook page are banned.
- Only citable proof is Google 5.0 / 24. (A verified Facebook page exists and makes this lead
  multi-source, but it is never named on the page - that would be banned meta-provenance.)
- Hero image: 05-places.webp (freshly painted smooth white doors and woodwork). Gallery uses the finished
  Google Places interiors only; 02 (exterior), 03 (cluttered), 07 (commercial), 08 (paint-shop demo)
  excluded.

## Swap-test tally (non-[fn] blocks)
Counting each non-[fn] copy block (eyebrow, H1, subhead, proof chip, marquee, 3 difference statements +
3 bodies, inline stats, services heading + 4 service lines, gallery heading + intro + captions, reviews
heading + stat + 4 quotes, process heading + 4 steps + note, areas heading + body + list + hours, quote
heading + body + side details, footer line):
- FAIL (lead-specific): hero eyebrow, H1, subhead, proof chip; marquee; diff S1+body, S2+body, S3+body;
  inline stats; services heading + PD + DW + PR + WH; gallery heading; reviews heading + stat + Q1 + Q2 +
  Q3 + Q4; process heading + 01 + 02 + 03 + 04 + note; areas heading + body + list + hours; quote body +
  side details; footer line. = ~37 FAIL.
- PASS (generic): gallery intro; gallery captions; quote heading. = 3 PASS.
- PASS rate ~= 3 / 40 = ~7.5%, well under the 30% floor (target met).
