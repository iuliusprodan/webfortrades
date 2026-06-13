# Copy blocks - Kyle Knowles Tiling (Path B)

Full draft of every visible copy block. Each annotated with `[src: ...]` (evidence source in the frozen
brief) and `[swap: PASS/FAIL]` where **FAIL = lead-specific (good)**, PASS = generic (would fit another
tiler with a name swap). Functional UI labels (nav, buttons, form fields) are marked `[fn]` and are
expected-generic - they are excluded from the specificity goal. No em dashes; British English; no
banned phrases.

---

## Header `[fn]`
- Wordmark: **Kyle Knowles Tiling** `[src: business_name]`
- Nav: Work · Reviews · Areas
- Button: **Get a quote**

## Hero
- Eyebrow: **Floor and wall tiling · Manchester M11** `[src: services/niche + based_location]` `[swap: FAIL - M11 specific]`
- H1: **The Manchester tiler other fitters call when the job's too complex.** `[src: reviews[2] Stephanie 'too complex', reviews[1] Luca 'stepped in']` `[swap: FAIL]`
- Subhead: **Kyle Knowles levels difficult floors and sets out the intricate tile work other fitters pass on, across Manchester and the M11. Rated 4.9 on Google by 43 local homeowners.** `[src: reviews Laura/Paulo levelling + Stephanie/Luca complex + google_rating 4.9 + google_review_count 43]` `[swap: FAIL]` (168 chars, 2 sentences - within hero_subhead limits)
- Proof chip: **4.9 on Google · 43 reviews** `[src: google_rating, google_review_count]` `[swap: FAIL - exact numbers]`
- Primary CTA: **Get a quote** `[fn]` -> #quote
- Secondary CTA: **Call Kyle · 07913 163118** `[src: phone]` `[fn]`

## The difference (signature block)
- Eyebrow: **What Kyle's known for**
- Statement 1: **He takes the jobs that beat other fitters.** `[swap: FAIL]`
  - Body: **One customer's previous tiler walked off the job. Another was told by their bathroom fitter that the tiles they wanted were too complex. Kyle stepped in on both and got them finished.** `[src: reviews[1] Luca 'previous fitter/tiler went AWOL', reviews[2] Stephanie 'too complex for him']` `[swap: FAIL]`
- Statement 2: **Difficult floors levelled first.** `[swap: FAIL]`
  - Body: **Uneven kitchen floors, hallways that need bringing back to level: Kyle sorts the subfloor before a single tile goes down, so the finish lasts.** `[src: reviews[0] Laura 'kitchen floor and hallway that needed leveling', reviews[3] Paulo 'the floor was uneven']` `[swap: FAIL]`
- Statement 3: **Set out with care, left tidy.** `[swap: FAIL - tied to this lead's specific reliability cluster]`
  - Body: **Kyle turns up each day as promised, even on jobs with a hard deadline, works to the detail rather than rushing to finish, and clears up at the end of every day.** `[src: reviews[0] Laura 'turned up as promised each day', reviews[2] Stephanie 'strict deadline with a baby due the following week', reviews[3] Paulo 'Did not rush ... Cleaned up after himself everyday']` `[swap: FAIL]`

## Services - "What Kyle tiles"
- Heading: **What Kyle tiles** `[swap: FAIL - named]`
- FL · **Floor tiling and levelling** - New floors laid level and true, including subfloors that need levelling first. `[src: reviews[0] Laura, reviews[3] Paulo]` `[swap: FAIL - levelling emphasis is this lead's specialism]`
- BA · **Bathroom tiling** - Walls and floors for bathrooms and en-suites, including the more involved layouts other fitters pass on. `[src: reviews[1] Luca, reviews[2] Stephanie 'too complex', reviews[4] Shel]` `[swap: FAIL - ties bathrooms to the too-complex angle]`
- KT · **Kitchen floors and walls** - Kitchen floors levelled and laid, with walls and splashbacks to match. `[src: reviews[0] Laura 'challenging kitchen floor ... needed leveling', reviews[1] Luca]` `[swap: FAIL - levelling-led, this lead's method]`
- IN · **Intricate and large-format layouts** - Detailed patterns and large-format tiles: the set-out other fitters would rather not take on. `[src: reviews[2] Stephanie 'too complex']` `[swap: FAIL]`

## Selected work (gallery)
- Heading: **Recent tiling** `[swap: PASS]`
- Intro: **A selection of finished work from around Manchester.** `[src: photos[] 9 completed_project + service_area]` `[swap: PASS]`
- Captions: neutral and safe only - no invented room or customer. Default per image: **"Completed tiling, Manchester"**. Implementer may use a more specific tiling caption (e.g. "Tiled floor", "Wall tiling", "Floor detail") ONLY where the image clearly shows it; never name a room/location/customer that isn't verifiable. `[src: photos[].classification = completed_project only - no room typing available]` `[swap: PASS - intentionally generic for safety]`

## Reviews - "What Manchester homeowners say about Kyle"
- Heading: **What Manchester homeowners say about Kyle** `[swap: FAIL - names Kyle]`
- Stat: **4.9 - Google rating · 43 reviews** `[src: google_rating, google_review_count]` (label "Google rating" - allowed; no banned sub-labels) `[swap: FAIL]`
- Quote 1 (verbatim): **"I found him through Google after our bathroom fitter said the tiles we wanted were a too complex for him. Kyle did a brilliant job, was enthusiastic, turned up on time and got the job done in a good time (knowing we were on a strict deadline with a baby due the following week!)"** - **Stephanie, Google review** `[src: reviews[2]]` `[swap: FAIL]`
- Quote 2 (verbatim): **"I've had the pleasure to have Kyle work on both my kitchen and bathroom. Coming from the back of an awful experience where previous fitter/tiler went AWOL Kyle had to step in and I'm really glad he did. Reliable, punctual and very proud of his work."** - **Luca, Google review** `[src: reviews[1]]` `[swap: FAIL]`
- Quote 3 (verbatim): **"I had a challenging kitchen floor and hallway that needed leveling and lots more TLC. Kyle was not phased by the level of work that needed to be done and reassured me that he would be able to work with it. And he did! I am so pleased with my new floor."** - **Laura, Google review** `[src: reviews[0]]` `[swap: FAIL]`
- Quote 4 (verbatim): **"Extreme attention to detail. Did not rush himself to finish the job and gave it plenty of time. Cleaned up after himself everyday. And went above and beyond the ask. Amazing tiling specially considering the floor was uneven!"** - **Paulo, Google review** `[src: reviews[3]]` `[swap: FAIL]`
- Link: **Read all reviews on Google** `[fn]` -> https://maps.google.com/?cid=13809484651488138570

## How a job works with Kyle (numbered - real sequence)
- Heading: **How a job works with Kyle** `[swap: FAIL - named]`
- 01 **A proper look first** - Kyle comes to see the job and gives you honest advice on the tiles and the layout. `[src: reviews[1] Luca 'expert advice ... choosing the right tiles']` `[swap: PASS]`
- 02 **Prep and levelling** - Any uneven or difficult floor is levelled and prepped before tiling starts. `[src: reviews[0] Laura, reviews[3] Paulo]` `[swap: FAIL - levelling-first is this lead's method]`
- 03 **Set out and tiled** - The tiling is set out carefully and done at the right pace, not rushed. `[src: reviews[3] Paulo 'Did not rush']` `[swap: PASS]`
- 04 **Tidy finish** - He keeps you updated as he goes and clears up at the end of each day. `[src: reviews[1] Luca 'kept up to date', reviews[3] Paulo 'Cleaned up ... everyday']` `[swap: PASS]`

## Where Kyle works (areas + hours)
- Heading: **Where Kyle works** `[swap: FAIL - named]`
- Body: **Based in Openshaw, Kyle covers Manchester and the surrounding East Manchester area, M11 and nearby.** `[src: address Openshaw, based_location 'Manchester, M11', service_area]` `[swap: FAIL]`
- Hours: **Seven days a week, 7am to 7pm.** `[src: opening_hours all days 7:00-19:00]` `[swap: FAIL - specific sourced hours]`
- Map: keyless Google Maps iframe, query **Manchester M11** (town + outward only; no street address). `[src: google_maps_url cid]`

## Get a quote (#quote)
- Heading: **Get a quote for your tiling** `[swap: PASS]`
- Body: **Tell Kyle about the job, the room, the tiles and your timing, and he'll come back with a price. Photos help if you have them.** `[src: phone + general]` `[swap: PASS]`
- Form fields `[fn]`: Name · Phone · Postcode · Job type (Floor tiling / Bathroom / Kitchen / Other) · Details · Add photos (optional)
- Submit button: **Send job details** `[fn]` (says what happens, per frontend-design CTA naming; not "Submit")
- Secondary: **Or call Kyle on 07913 163118.** `[src: phone]` `[fn]`
- Disclaimer (internal note): form is presentational only and must not submit to the business or carry any "preview form" banned text.
- Sticky CTA (quote-only): **Get a quote** `[fn]`

## Footer `[fn]`
- Brand: **Kyle Knowles Tiling** `[src: business_name]`
- Line: **Floor and wall tiling across Manchester and East Manchester.** `[src: service_area]`
- Phone: **07913 163118** `[src: phone]`
- Areas: **Manchester · Openshaw · East Manchester (M11)** `[src: service_area]`
- Hours: **Seven days, 7am to 7pm** `[src: opening_hours]`
- Quick links: Work · Reviews · Areas · Get a quote
- **Read our Google reviews** -> https://maps.google.com/?cid=13809484651488138570
- Credit: **Website by WebForTrades** (small) -> https://webfortradesuk.co.uk

---

## Notes for implementation (Phase 2)
- No creative copy decisions remain. Phase 2 translates these blocks verbatim into JSX.
- Forbidden in build: any certification/insurance/years-trading claim; any third-party platform proof
  (Yell/MyBuilder/Trustpilot); the street address; Google junk categories as services; em dashes.
- Only citable proof is Google 4.9 / 43.
