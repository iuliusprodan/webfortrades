# Copy blocks - Damo's Decking & Fencing (Path B)

Full draft of every visible copy block. Each annotated with `[src: ...]` (evidence source in the frozen
brief) and `[swap: PASS/FAIL]` where **FAIL = lead-specific (good)**, PASS = generic (would fit another
decking/fencing firm with a name swap). Functional UI labels (nav, buttons, form fields) are marked `[fn]`
and are expected-generic - excluded from the specificity goal. No em dashes; British English; no banned phrases.

---

## Header `[fn]`
- Wordmark: **Damo's Decking & Fencing** `[src: business_name]`
- Nav: Work · Reviews · Areas
- Button: **Get a quote**

## Hero
- Eyebrow: **Decking & fencing · North Leeds, LS6** `[src: services/niche + based_location 'Leeds, LS6']` `[swap: FAIL - LS6 specific]`
- H1: **Decking and fencing for north Leeds, built straight on ground that never sits level.** `[src: reviews[1] Gail 'levels on the house were out - rock under the lawn', reviews[2] Lisa 'sloped driveway ... retaining wall ... straight line']` `[swap: FAIL]`
- Subhead: **Damo builds raised and ground-level decking and boundary fencing across Meanwood, Roundhay and Alwoodley - screwed and fixed throughout, set true where levels are out, and finished dead straight.** `[src: real_services + reviews Gail/Lisa + areas Meanwood/Roundhay/Alwoodley]` `[swap: FAIL]` (199 chars, within hero_subhead limits)
- Proof chip: **4.9 on Google · 79 reviews** `[src: google_rating, google_review_count]` `[swap: FAIL - exact numbers]`
- Primary CTA: **Get a quote** `[fn]` -> #quote
- Secondary CTA: **Call Damo · 07765 436385** `[src: phone]` `[fn]`

## The difference (signature block)
- Eyebrow: **What Damo's known for**
- Statement 1: **Built true, even when the ground fights back.** `[swap: FAIL]`
  - Body: **Levels out on the house, rock under the lawn, a drain chamber sitting in the way: Damo sorts the ground first and builds to it, so the decking sits right and stays put.** `[src: reviews[1] Gail 'levels on the house were out - rock under the lawn ... a drain inspection chamber higher than I wanted ... he sorted it all out']` `[swap: FAIL]`
- Statement 2: **Screwed and fixed, not a nail in sight.** `[swap: FAIL - verbatim method from Gail]`
  - Body: **Every board is screwed and fixed rather than nailed, so nothing works loose over the seasons. It is the slower way to build a deck, and the reason it stays solid.** `[src: reviews[1] Gail 'not a nail in sight - all screwed and fixed']` `[swap: FAIL]`
- Statement 3: **Fences that run dead straight.** `[swap: FAIL]`
  - Body: **Damo sets a fence out to a straight line and builds it strong, including the awkward runs across a sloped driveway or over a retaining wall.** `[src: reviews[2] Lisa 'straight line ... as strong as can be ... driveway is sloped ... retaining wall', reviews[3] Alwoodley 'professional fencing with a brilliant finish']` `[swap: FAIL]`

## Services - "What Damo builds"
- Heading: **What Damo builds** `[swap: FAIL - named]`
- DK · **Garden decking** - Raised and ground-level decking, screwed and fixed throughout and set true even where the ground is uneven. `[src: reviews[1] Gail; photos[] completed decking]` `[swap: FAIL - screwed-and-fixed-on-uneven-ground is this lead's method]`
- FN · **Fencing** - Boundary and garden fencing built strong and straight, including runs across slopes and over retaining walls. `[src: reviews[2] Lisa, reviews[3] Alwoodley]` `[swap: FAIL]`
- GW · **Groundwork and levelling** - The prep that makes the rest last: levelling uneven ground and working around rock and drainage before anything is built. `[src: reviews[1] Gail]` `[swap: FAIL]`
- GT · **Garden transformations** - Whole areas reworked from start to finish, planned with you and delivered to the timescale you agree. `[src: reviews[0] the Boylans 'transformation of the area ... within the agreed timescale']` `[swap: FAIL]`

## Selected work (gallery)
- Heading: **Recent decking and fencing** `[swap: PASS]`
- Intro: **A selection of finished decks, fences and garden builds from around north Leeds.** `[src: photos[] 9 completed_project + service_area]` `[swap: PASS]`
- Captions: neutral and safe only - no invented room, job address or customer. Default per image: **"Completed work, Leeds"**. Implementer may use a more specific caption (e.g. "Completed decking, Leeds", "Completed fencing, Leeds", "Finished garden build, Leeds") ONLY where the image clearly shows it; never name a location/customer that isn't verifiable. `[src: photos[].classification = completed_project only]` `[swap: PASS - intentionally generic for safety]`

## Reviews - "What Leeds homeowners say about Damo"
- Heading: **What Leeds homeowners say about Damo** `[swap: FAIL - names Damo + Leeds]`
- Stat: **4.9 - Google rating · 79 reviews** `[src: google_rating, google_review_count]` (label "Google rating" - allowed; no banned sub-labels) `[swap: FAIL]`
- Quote 1 (verbatim, decking): **"Damo has just completed the most perfect decking. It wasn't easy - levels on the house were out, rock under the lawn (which explains all the moss!) and a drain inspection chamber higher than I wanted the finished decking. Not a problem for Damo - he sorted it all out, constructed the decking to a high standard (not a nail in sight - all screwed and fixed)."** - **Gail, Google review** `[src: reviews[1]]` `[swap: FAIL]`
- Quote 2 (verbatim, fencing): **"Really pleased with the fence Damo installed. He pays attention to detail, notices things I didn't see such as ensuring it goes in a straight line, and it's built to be as strong as can be. Really neat work, particularly given my driveway is sloped and also has a retaining wall beneath the fence. I found him personable and trustworthy."** - **Lisa, Google review** `[src: reviews[2]]` `[swap: FAIL]`
- Quote 3 (verbatim, transformation): **"We are absolutely over the moon with the transformation of the area we had to work with. Damo and his team executed the plan to perfection, delivering everything within the agreed timescale. The whole team worked incredibly hard from start to finish and clearly take real pride in the quality of their work."** - **Google review** `[src: reviews[0] the Boylans; attributed 'Google review' to avoid a surname]` `[swap: FAIL]`
- Quote 4 (verbatim, responsiveness): **"Damo has provided a first class service. He was quick with correspondence and his quality of work is fabulous. We will definitely be using his services in the future."** - **Sarah, Google review** `[src: reviews[4]]` `[swap: FAIL]`
- Link: **Read all reviews on Google** `[fn]` -> https://maps.google.com/?cid=10046209844566892378

## How a job works with Damo (numbered - real sequence)
- Heading: **How a job works with Damo** `[swap: FAIL - named]`
- 01 **A look at the ground** - Damo comes out, looks at the levels and the ground, and gives you a straight price for the work. `[src: reviews[4] Sarah 'quick with correspondence'; general quote step]` `[swap: PASS]`
- 02 **Ground sorted first** - Uneven ground, rock or drainage is dealt with before anything is built, so the finish sits true. `[src: reviews[1] Gail]` `[swap: FAIL - ground-first method]`
- 03 **Built and fixed properly** - Decking screwed and fixed board by board, fencing set out to a straight line and built strong, done at the right pace rather than rushed. `[src: reviews[1] Gail 'all screwed and fixed', reviews[2] Lisa 'straight line']` `[swap: FAIL]`
- 04 **Finished on time, left tidy** - The work is delivered to the timescale you agreed and the site left clean. `[src: reviews[0] the Boylans 'within the agreed timescale']` `[swap: PASS]`

## Where Damo works (areas + hours)
- Heading: **Where Damo works** `[swap: FAIL - named]`
- Body: **Based in Meanwood, Damo covers north Leeds and the surrounding LS postcodes, from Headingley and Chapel Allerton up to Roundhay, Alwoodley and Moortown.** `[src: based_location Meanwood Leeds LS6; reviews[0] Gledhow/Roundhay + reviews[3] Alwoodley evidenced; rest derived from LS6 geography]` `[swap: FAIL]`
- Area list: **Meanwood · Headingley · Far Headingley · Weetwood · Chapel Allerton · Roundhay · Gledhow · Alwoodley · Moortown · Adel · Cookridge · Horsforth · Shadwell · Oakwood** `[src: Roundhay/Gledhow + Alwoodley evidenced (reviews); others derived from LS6 base, plausible one-van radius - no over-claim]`
- Hours: **Monday to Saturday, 8am to 4pm.** `[src: opening_hours Mon-Sat 8:00-16:00, Sun closed]` `[swap: FAIL - specific sourced hours]`
- Map: keyless Google Maps iframe, query **Leeds LS6** (town + outward only; no street address). `[src: google_maps_url cid]`

## Get a quote (#quote)
- Heading: **Get a quote for your decking or fencing** `[swap: PASS]`
- Body: **Tell Damo about the job - the garden, what you're after and roughly when - and he'll come back to you with a price. Photos of the space help if you have them.** `[src: phone + general]` `[swap: PASS]`
- Side details (left column): **Call Damo on 07765 436385** `[src: phone]` · **Based in Meanwood, Leeds LS6** `[src: based_location]` · **Monday to Saturday, 8am to 4pm** `[src: opening_hours]`
- Form fields `[fn]`: Name · Phone · Postcode · Job type (Decking / Fencing / Garden transformation / Other) · Details · Add photos (optional)
- Submit button: **Send job details** `[fn]` (says what happens; not "Submit")
- Secondary: **Or call Damo on 07765 436385.** `[src: phone]` `[fn]`
- Disclaimer (internal note): form is presentational only and must not submit to the business or carry any "preview form" banned text.
- Sticky CTA (quote-only): **Get a quote** `[fn]`

## Footer `[fn]`
- Brand: **Damo's Decking & Fencing** `[src: business_name]`
- Line: **Decking, fencing and garden builds across north Leeds.** `[src: service_area]`
- Phone: **07765 436385** `[src: phone]`
- Areas: **Meanwood · Headingley · Chapel Allerton · Roundhay · Alwoodley · Moortown** `[src: service_area + evidenced areas]`
- Hours: **Monday to Saturday, 8am to 4pm** `[src: opening_hours]`
- Quick links: Work · Reviews · Areas · Get a quote
- **Read our Google reviews** -> https://maps.google.com/?cid=10046209844566892378
- Credit: **Website by WebForTrades** (small) -> https://webfortradesuk.co.uk

---

## Notes for implementation (Phase 2)
- No creative copy decisions remain. Phase 2 translates these blocks verbatim into JSX.
- Forbidden in build: any certification/insurance/years-trading claim; any third-party platform proof
  (Checkatrade/Yell/MyBuilder/Trustpilot); the street address '32 Sunset Hilltop'; Google junk categories
  as services ('Building & construction', 'Drain unblocking', 'landscapers'); drain unblocking / patios /
  driveway-laying as services; em dashes.
- Only citable proof is Google 4.9 / 79.
- Hero image: vision-select the best landscape completed-project photo in Phase 2; state file + reason.
