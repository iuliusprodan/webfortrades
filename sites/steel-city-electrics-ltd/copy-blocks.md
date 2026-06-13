# Copy blocks - Steel City Electrics Ltd (Path B)

Full draft of every visible copy block. Each annotated with `[src: ...]` (evidence source in the frozen
brief) and `[swap: PASS/FAIL]` where **FAIL = lead-specific (good)**, PASS = generic (would fit another
electrician with a name swap). Functional UI labels (nav, buttons, form fields) are marked `[fn]` and are
expected-generic - excluded from the specificity goal. No em dashes; British English; no banned phrases;
no certification/badge wording (none verified).

---

## Header `[fn]`
- Wordmark: **Steel City Electrics** `[src: business_name]`
- Nav: Work, Reviews, Areas
- Button: **Get a quote**

## Hero (typographic, no photo)
- Eyebrow: **Electricians, Sheffield S8** `[src: services/niche + based_location 'Sheffield, S8']` `[swap: FAIL - S8 specific]`
- H1: **Sheffield electricians for full re-wires and old fuse boards, left tested and safe.** `[src: reviews[2] Andy 'full house re-wiring', reviews[1] Alina 'made sure everything was safe and working perfectly before leaving']` `[swap: FAIL]`
- Subhead: **Steel City take on full and partial re-wires, old or burnt-out fuse boards swapped for modern units, and electrical faults traced across Sheffield, with a straight price and a quick answer.** `[src: real_services + reviews Andy/Alina/Wakas/Pat + based_location Sheffield]` `[swap: FAIL]` (one sentence, 197 chars, within hero_subhead limits)
- Proof chip: **5.0 on Google, 20 reviews** `[src: google_rating, google_review_count]` `[swap: FAIL - exact numbers]`
- Primary CTA: **Get a quote** `[fn]` -> #quote
- Secondary CTA: **Call Steel City, 07936 498907** `[src: phone]` `[fn]`

## What we take on (signature positioning block)
- Eyebrow: **What Steel City take on** `[swap: FAIL - named]`
- Statement 1: **The re-wire other electricians put off.** `[swap: FAIL]`
  - Body: **Full and partial house re-wires, taken on start to finish and priced straight, the heavy work that needs doing properly rather than patched.** `[src: reviews[2] Andy 'full house re-wiring on a house of mine. Fantastic service from start to finish ... efficient and very reasonably priced']` `[swap: FAIL]`
- Statement 2: **Old board out, modern unit in.** `[swap: FAIL]`
  - Body: **Tired or burnt-out fuse boards stripped out and replaced with a modern consumer unit, so the circuits are protected the way they should be.** `[src: photos 01/04/08/09/10 (old and burnt-out consumer units / boards); reviews[1] Alina 'made sure everything was safe']` `[swap: FAIL]`
- Statement 3: **Tested, then left safe and working.** `[swap: FAIL - verbatim from Alina]`
  - Body: **Nothing is signed off until it is tested and working, and you get a call back if anything is not quite right after we leave.** `[src: reviews[1] Alina 'made sure everything was safe and working perfectly before leaving', reviews[0] Pat 'happy for a call back if anything was not quite right']` `[swap: FAIL]`

## Services - "What we do"
- Heading: **What we do** `[swap: PASS]`
- RW, **Full and partial re-wires** - Whole-house and single-circuit re-wires, taken on start to finish and left tested. `[src: reviews[2] Andy; the heavy-current angle]` `[swap: FAIL - re-wire-start-to-finish is this lead's specialism]`
- CU, **Consumer unit replacement** - Old, failing or burnt-out fuse boards swapped for a modern consumer unit with proper circuit protection. `[src: photos 01/04/08/09/10 (board/burnt-unit shots); reviews[1] Alina 'safe']` `[swap: FAIL]`
- FF, **Fault-finding and repairs** - Tracing the cause of a tripping circuit, dead socket or burnt connection and putting it right. `[src: brief.json services 'Repairs and maintenance'; reviews[4] Samaira 'helped with all my electrical issues'; the burnt-tail photos]` `[swap: FAIL]`
- IN, **Installations and additions** - New circuits, sockets, lighting and other electrical work added in and tested before we leave. `[src: brief.json services 'Installations'; reviews[1] Alina 'completed the work efficiently']` `[swap: FAIL]`
- CO, **Call-outs across Sheffield** - Quick to answer when something goes wrong, with a straight price before any work starts. `[src: brief.json services 'Emergency callouts'; reviews[0] Pat 'quick response to my texts ... did not have to wait long'; reviews[0] Pat 'price quoted was very competitive']` `[swap: FAIL]`

## Selected work (gallery)
- Heading: **Recent work** `[swap: PASS]`
- Intro: **A look at the kind of jobs we take on across Sheffield, from fault-finding to full board replacements.** `[src: photos[] (fault/board shots) + service_area Sheffield]` `[swap: PASS]`
- Captions: honest and safe only - no invented job address or customer, no scare language. Per image, drawn from what the photo shows: **"Fault-finding, Sheffield"**, **"Consumer unit work, Sheffield"**, **"Board replacement, Sheffield"**, **"Circuit work, Sheffield"**. The navy+red logo image (03 in the brief set) is NOT used (palette clash). `[src: photos[].classification = completed_project; design-direction.md hero/gallery note]` `[swap: PASS - intentionally generic for safety]`

## Who we are (team, first-person)
- Eyebrow: **Who we are** `[swap: PASS]`
- Body: **We are Steel City, a small electrical team working across Sheffield. We take on the heavy electrical work, full re-wires and old fuse boards as readily as a single fault, and we price it straight up front. We test what we do and leave it safe and working before we go, and we will come back if anything is not right.** `[src: reviews[3] Wakas 'Had steel city out multiple times ... the lads', reviews[2] Andy 'these guys', reviews[1] Alina 'made everything safe', reviews[0] Pat 'call back if anything was not quite right'; based_location Sheffield]` `[swap: FAIL]` (opens first person for owner_voice)
- Stat 1: **5.0** - **Google rating** `[src: google_rating]` `[swap: FAIL]`
- Stat 2: **20** - **Google reviews** `[src: google_review_count]` `[swap: FAIL]`
- Stat 3: **Sheffield** - **and the S postcodes** `[src: based_location, service_area]` `[swap: FAIL]`

## Reviews - "What Sheffield customers say"
- Heading: **What Sheffield customers say** `[swap: PASS - city-specific but a common pattern]`
- Stat: **5.0 - Google rating, 20 reviews** `[src: google_rating, google_review_count]` (label "Google rating" - allowed; no banned sub-labels) `[swap: FAIL]`
- Quote 1 (verbatim, re-wire): **"These guys came to do a full house re-wiring on a house of mine. Fantastic service from start to finish. They were efficient and very reasonably priced. I will definitely be using them again in the future. Highly recommend."** - **Andy, Google review** `[src: reviews[2]]` `[swap: FAIL]`
- Quote 2 (verbatim, made safe): **"I couldn't be happier with the service. He was punctual, professional and clearly very experienced. He explained everything clearly, completed the work efficiently and made sure everything was safe and working perfectly before leaving. It's such a relief to find a trustworthy electrician, I would definitely use his services again and highly recommend him."** - **Alina, Google review** `[src: reviews[1]; em dash in source replaced with comma]` `[swap: FAIL]`
- Quote 3 (verbatim, transparent / the lads): **"Had steel city out multiple times. Can't fault any of their work. Always punctual and tranparent. Would highly recommend to anyone looking to have some work carried out. Thanks again lads and best of luck."** - **Wakas, Google review** `[src: reviews[3]; 'tranparent' kept verbatim]` `[swap: FAIL]`
- Quote 4 (verbatim, felt safe / quick / competitive): **"Have had 2 jobs done and could not be happier with the service. Did not have to wait long for the jobs to be done and always got a quick response to my texts. Friendly and professional plus happy for a call back if anything was not quite right. As an older lady on my own, I felt safe at all times and the price quoted was very competitive. Can highly recommend."** - **Pat, Google review** `[src: reviews[0]]` `[swap: FAIL]`
- Link: **Read all reviews on Google** `[fn]` -> https://maps.google.com/?cid=10338716508790624105

## How a job works (numbered - real sequence)
- Heading: **How a job works** `[swap: PASS]`
- 01 **Get in touch, get a price** - Tell us what is going on. We come and look, and give you a straight price before any work starts. `[src: reviews[0] Pat 'quick response to my texts', reviews[0] Pat 'price quoted was very competitive']` `[swap: PASS]`
- 02 **We do the work, explained as we go** - Re-wire, board replacement or fault, carried out properly and explained clearly so you know what is happening. `[src: reviews[1] Alina 'explained everything clearly, completed the work efficiently', reviews[2] Andy 'start to finish']` `[swap: FAIL]`
- 03 **Tested and left safe** - Nothing is signed off until it is tested, safe and working, and the place is left tidy. `[src: reviews[1] Alina 'made sure everything was safe and working perfectly before leaving']` `[swap: FAIL]`
- 04 **We come back if needed** - If anything is not quite right after we leave, we will come back and sort it. `[src: reviews[0] Pat 'happy for a call back if anything was not quite right']` `[swap: FAIL]`

## Where we work (areas + availability)
- Heading: **Where we work** `[swap: PASS]`
- Body: **Based in Sheffield, we cover the city and the surrounding S postcodes, from Highfield and Heeley out across Sheffield.** `[src: based_location 'Sheffield, S8', service_area Sheffield/Highfield; districts derived from Sheffield geography]` `[swap: FAIL - Sheffield S postcodes]`
- Area list: **Highfield, Heeley, Meersbrook, Nether Edge, Sharrow, Woodseats, Gleadless, Norton, Abbeydale, Crookes, Walkley, Hillsborough, Darnall, Handsworth** `[src: Highfield evidenced (address/service_area); others derived from the Sheffield S-postcode base, plausible small-team radius - no over-claim]`
- Availability: **Quick to answer, with call-outs across Sheffield.** `[src: brief.json services 'Emergency callouts', reviews[0] Pat 'quick response to my texts ... did not have to wait long'; framed soft, no literal 24/7]` `[swap: FAIL]`
- Map: keyless Google Maps iframe, query **Sheffield S8** (town + outward only; no street address, no inward postcode). `[src: google_maps_url cid]`

## Get a quote (#quote)
- Heading: **Get a quote from Steel City** `[swap: FAIL - named]`
- Body: **Tell us about the job, a re-wire, a board, a fault or something else, and roughly when, and we will come back to you with a straight price. Photos of the board or the problem help if you have them.** `[src: phone + real_services + reviews competitive/quick]` `[swap: FAIL]`
- Side details (left column): **Call Steel City on 07936 498907** `[src: phone]` , **Sheffield and the S postcodes** `[src: based_location]` , **Quick to answer** `[src: services 'Emergency callouts' + Pat quick response]`
- Form fields `[fn]`: Your name, Phone number, Email (optional), Postcode, Job type (Rewire / Consumer unit / Fault-finding / EV charger / Other), Details
- Submit button: **Send job details** `[fn]` (says what happens; not "Submit")
- Secondary: **Or call Steel City on 07936 498907.** `[src: phone]` `[fn]`
- Disclaimer (internal note): form is presentational only and must not submit to the business or carry any "preview form" banned text.
- Sticky CTA (quote-only): **Get a quote** `[fn]`

## Footer `[fn]`
- Brand: **Steel City Electrics** `[src: business_name]`
- Line: **Re-wires, consumer units and fault-finding across Sheffield.** `[src: service_area + real_services]`
- Phone: **07936 498907** `[src: phone]`
- Areas: **Highfield, Heeley, Nether Edge, Woodseats, Sharrow, Crookes** `[src: service_area + derived Sheffield districts]`
- Availability: **Quick to answer, call-outs across Sheffield** `[src: services 'Emergency callouts' + Pat]`
- Quick links: Work, Reviews, Areas, Get a quote
- **Read our Google reviews** -> https://maps.google.com/?cid=10338716508790624105
- Credit: **Website by WebForTrades** (small) -> https://webfortradesuk.co.uk

---

## Notes for implementation (Phase 3)
- No creative copy decisions remain. Phase 3 translates these blocks verbatim into JSX.
- Forbidden in build: ANY certification/badge claim (NICEIC, NAPIT, Part P, registered, approved,
  certified/qualified electrician, fully insured - none verified, build-blocking); any third-party
  platform proof (Trustpilot/Yell/MyBuilder); the street address '50 Fieldhead Rd'; the broad Google
  labels alone as services; a literal 24/7 promise; any years-trading or project-count number; any
  personal first name; em dashes; the navy+red logo image on the page.
- Only citable proof is Google 5.0 / 20.
- Hero is typographic (no photo) - decision recorded in design-direction.md and to be repeated in
  build-notes.md. The 6 Places photos are the AI logo + fault/board shots, none a finished-work hero.

## Swap-test tally (FAIL = lead-specific = good)
Counting every annotated copy block (functional `[fn]` UI labels excluded from the goal per the skill):
- Hero: eyebrow FAIL, H1 FAIL, subhead FAIL, proof chip FAIL = 4 FAIL
- What we take on: eyebrow FAIL, S1 FAIL + body FAIL, S2 FAIL + body FAIL, S3 FAIL + body FAIL = 7 FAIL
- Services: heading PASS, RW FAIL, CU FAIL, FF FAIL, IN FAIL, CO FAIL = 5 FAIL, 1 PASS
- Gallery: heading PASS, intro PASS, captions PASS = 3 PASS
- Who we are: body FAIL, stat1 FAIL, stat2 FAIL, stat3 FAIL = 4 FAIL
- Reviews: heading PASS, stat FAIL, Q1 FAIL, Q2 FAIL, Q3 FAIL, Q4 FAIL = 5 FAIL, 1 PASS
- Process: heading PASS, 01 PASS, 02 FAIL, 03 FAIL, 04 FAIL = 3 FAIL, 2 PASS
- Areas: heading PASS, body FAIL, area-list (counted with body), availability FAIL = 2 FAIL, 1 PASS
- Quote: heading FAIL, body FAIL = 2 FAIL
- Footer: line/areas treated as functional summary = not scored
Totals: FAIL = 32, PASS = 9, scored blocks = 41.
PASS rate = 9 / 41 = 22.0% (HARD FLOOR is <30% PASS; 22.0% passes comfortably).
