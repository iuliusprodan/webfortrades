# Copy blocks - AC Painters & Decorators (Path B)

Full draft of every visible copy block. Each annotated with `[src: ...]` (evidence source in the frozen
brief) and `[swap: PASS/FAIL]` where **FAIL = lead-specific (good)**, PASS = generic (would fit another
painter with a name swap). Functional UI labels (nav, buttons, form fields) are marked `[fn]` and are
expected-generic - excluded from the specificity goal. No em dashes; British English; no banned phrases
(salesy/provenance words appear only inside attributed review quotes).

---

## Header `[fn]`
- Wordmark: **AC Painters & Decorators** `[src: business_name]`
- Nav: Work, Reviews, Areas
- Button: **Get a quote**

## Hero
- Eyebrow: **Painters and decorators, Bootle and Crosby** `[src: niche + based_location 'Bootle, L20' + reviews[4] Crosby]` `[swap: FAIL - named base/area]`
- H1: **Painters and decorators in Bootle and Crosby, confident with colour inside and out.** `[src: niche + based_location + reviews[2] Sylvia (olive green, boutique look) + reviews[4] Helen (exterior, Crosby)]` `[swap: FAIL]`
- Subhead: **Chris and the team paint rooms, feature walls and the fronts of houses across Bootle, Crosby and Liverpool, from a bold boutique-hotel finish to wallpaper, furniture and exteriors.** `[src: real_services + reviews Sylvia/N/Helen + based_location]` `[swap: FAIL]` (197 chars, within hero_subhead limits)
- Proof chip: **4.9 on Google, 58 reviews** `[src: google_rating, google_review_count]` `[swap: FAIL - exact numbers]`
- Primary CTA: **Get a quote** `[fn]` -> #quote
- Secondary CTA: **Call 07592 753933** `[src: phone]` `[fn]`

## The difference (signature block)
- Eyebrow: **What AC Painters are known for**
- Statement 1: **Colour, done with confidence.** `[swap: FAIL]`
  - Body: **A feature wall in a deep, deliberate colour, a whole room or a dated unit reworked into a luxurious, boutique-hotel finish: the kind of colour most decorators talk you out of, this team gets right.** `[src: reviews[2] Sylvia 'from a bit dated looking shelves unit into a luxurious boutique hotel look ... The olive green paint and finish looks stunning']` `[swap: FAIL]`
- Statement 2: **Not just walls.** `[swap: FAIL]`
  - Body: **Wallpaper hung to a clean finish, and tired furniture and shelving brought back to life rather than thrown out, so a whole room changes for the cost of paint and care.** `[src: reviews[1] N 'bedroom paint / wallpaper ... excellent finish'; reviews[2] Sylvia 'dated looking shelves unit']` `[swap: FAIL]`
- Statement 3: **Inside and out.** `[swap: FAIL]`
  - Body: **The same care goes on the outside: the front of a terrace or period house repainted and tidied, the sort of exterior work that lifts a whole street in Crosby and Bootle.** `[src: reviews[4] Helen 'painting exterior of terrace house in Crosby ... Looks great']` `[swap: FAIL]`

## Services - "What AC Painters do"
- Heading: **What AC Painters do** `[swap: FAIL - named]`
- FC, **Feature colour and full rooms** - Bold feature walls and full-room repaints, from a deep boutique colour to a whole bedroom or living room, finished to a high standard. `[src: reviews[2] Sylvia (olive green, boutique), reviews[1] N (bedroom paint), reviews[3] Gemma (son's room)]` `[swap: FAIL - boutique-colour framing]`
- WP, **Wallpaper hanging** - Wallpaper measured and hung to a clean, even finish, on its own or alongside paint in the same room. `[src: reviews[1] N 'bedroom paint / wallpaper ... excellent finish']` `[swap: FAIL]`
- FR, **Furniture and shelving** - Dated units, shelving and furniture rubbed down and refinished in colour, so the piece reads new instead of being replaced. `[src: reviews[2] Sylvia 'dated looking shelves unit into a luxurious boutique hotel look']` `[swap: FAIL]`
- EX, **Exterior house painting** - The fronts of terrace and period houses repainted and tidied up, ready for the street to see. `[src: reviews[4] Helen 'painting exterior of terrace house in Crosby']` `[swap: FAIL]`

## Selected work (gallery)
- Heading: **Recent work** `[swap: PASS]`
- Intro: **A look at finished and in-progress work from around Bootle, Crosby and Liverpool.** `[src: photos[] + service_area]` `[swap: PASS]`
- Captions: honest and safe only - never claim a finish a photo does not show, and never name a customer or street. Image 10 (finished grey stairwell, black door, white spindles): **"Stairwell and landing, Liverpool"**. Image 03 (period staircase, freshly plastered, treads stripped - clearly mid-renovation): **"Period staircase, Liverpool"** (neutral, does not claim 'finished'). Image 02 (room strip-out with a hire dehumidifier, bare plaster, no finished surface) is EXCLUDED. `[src: photos[] classification + 10/03 honest description]` `[swap: PASS - intentionally generic for safety]`

## Reviews - "What Bootle and Crosby customers say"
- Heading: **What Bootle and Crosby customers say** `[swap: FAIL - named areas]`
- Stat: **4.9 - Google rating, 58 reviews** `[src: google_rating, google_review_count]` (label "Google rating" - allowed; no banned sub-labels) `[swap: FAIL]`
- Quote 1 (verbatim, boutique colour; emoji stripped): **"Wow, from a bit dated looking shelves unit into a luxurious boutique hotel look! I love it! The olive green paint and finish looks stunning! Super professional, excellent price. Definitely recommend. Thank you"** - **Sylvia, Google review** `[src: reviews[2]]` `[swap: FAIL]`
- Quote 2 (verbatim, exterior, Crosby): **"Great job by Chris and his team at AC Painters painting exterior of terrace house in Crosby for me this week. Looks great and very happy to recommend."** - **Helen, Google review** `[src: reviews[4]]` `[swap: FAIL]`
- Quote 3 (verbatim, Chris + wallpaper; dash normalised, exclamation kept as written): **"Really hard to find top decorators - Chris and the lads were great. He managed to fit me in for a quote then bedroom paint / wallpaper, communication was really good, excellent finish and cleaned all up after. Wouldn't hesitate to use Chris again and highly recommend."** - **Google review** `[src: reviews[1]; attributed 'Google review' because 'N' is an initial, not a usable first name]` `[swap: FAIL]`
- Quote 4 (verbatim, finish + tidy + on time): **"Really pleased with these painters. They came out promptly to quote and were easy to deal with from the start. Turned up on time each day, kept everything tidy, and the standard of work was excellent. The finish is high quality and exactly what I was after."** - **nic, Google review** `[src: reviews[0]]` `[swap: FAIL]`
- Link: **Read all reviews on Google** `[fn]` -> https://maps.google.com/?cid=8375067658394021796

## How a job works (numbered - real sequence)
- Heading: **How a job works** `[swap: PASS]`
- 01 **Come out and quote** - Chris and the team come out to look at the room or the outside, talk through the colours and finish you want, and give you a straight price, often at short notice. `[src: reviews[0] nic 'came out promptly to quote ... fit me in at short notice'; reviews[1] N 'fit me in for a quote']` `[swap: FAIL - short-notice quoting tied to reviews]`
- 02 **Agree the colour and finish** - You settle on the colour, the wallpaper or the boutique finish together before any brush goes near a wall, so you get exactly what you were after. `[src: reviews[2] Sylvia (boutique finish), reviews[0] nic 'exactly what I was after']` `[swap: FAIL]`
- 03 **Painted to a high finish** - Walls, woodwork, wallpaper and furniture painted and finished to a high standard, with the team turning up on time each day. `[src: reviews[0] nic 'turned up on time each day ... standard of work was excellent', reviews[2] Sylvia 'finish looks stunning']` `[swap: FAIL]`
- 04 **Cleaned up and left tidy** - Everything cleaned up and the room left tidy at the end, so you walk back into a finished space and nothing else. `[src: reviews[0] nic 'kept everything tidy', reviews[1] N 'cleaned all up after', reviews[3] Gemma 'tidied up after themselves']` `[swap: PASS]`

## Where AC Painters work (areas + hours)
- Heading: **Where AC Painters work** `[swap: FAIL - named]`
- Body: **Based in Bootle, Chris and the team cover Crosby, Liverpool and north Merseyside, from Litherland and Waterloo across to Aintree, Walton and the north Liverpool postcodes.** `[src: based_location Bootle L20; reviews[4] Crosby evidenced; rest derived from L20 geography]` `[swap: FAIL]`
- Area list: **Bootle, Crosby, Litherland, Waterloo, Seaforth, Aintree, Walton, Orrell Park, Netherton, Maghull, Anfield, Liverpool city** `[src: Crosby evidenced (reviews[4]); others derived from the L20 Bootle base, plausible small-team radius - no over-claim]`
- Hours: **Open seven days, from early in the morning.** `[src: opening_hours Mon-Fri 6:00-20:00, Sat-Sun 6:30-19:00]` `[swap: FAIL - specific sourced availability]`
- Map: keyless Google Maps iframe, query **Bootle L20** (town + outward only; no street address). `[src: google_maps_url cid; based_location]`

## Get a quote (#quote)
- Heading: **Get a quote for your painting or decorating** `[swap: PASS]`
- Body: **Tell Chris about the job, the room or the outside, the colours you have in mind and roughly when, and the team will come back to you with a price. A photo of the space helps if you have one.** `[src: phone + reviews[0] quoting behaviour]` `[swap: PASS]`
- Side details (left column): **Call 07592 753933** `[src: phone]`, **Based in Bootle, L20** `[src: based_location]`, **Open seven days, from early** `[src: opening_hours]`
- Form fields `[fn]`: Your name, Phone number, Email (optional), Postcode, Job type (Interior painting / Feature colour / Wallpaper / Furniture and shelving / Exterior painting / Other), Details, Submit
- Submit button: **Send job details** `[fn]` (says what happens; not "Submit")
- Disclaimer (internal note): form is presentational only and must not submit to the business or carry any "preview form" banned text.
- Sticky CTA (quote-only): **Get a quote** `[fn]`

## Footer `[fn]`
- Brand: **AC Painters & Decorators** `[src: business_name]`
- Line: **Painting and decorating, inside and out, across Bootle, Crosby and Liverpool.** `[src: service_area + niche]`
- Phone: **07592 753933** `[src: phone]`
- Areas: **Bootle, Crosby, Litherland, Waterloo, Aintree, Liverpool** `[src: service_area + evidenced Crosby]`
- Hours: **Open seven days, from early** `[src: opening_hours]`
- Quick links: Work, Reviews, Areas, Get a quote
- **Read our Google reviews** -> https://maps.google.com/?cid=8375067658394021796
- Credit: **Website by WebForTrades** (small) -> https://webfortradesuk.co.uk

---

## Swap-test tally (non-[fn] blocks only)
Non-[fn] copy blocks scored: hero eyebrow (FAIL), hero H1 (FAIL), hero subhead (FAIL), hero proof (FAIL),
diff S1 + body (FAIL, FAIL), diff S2 + body (FAIL, FAIL), diff S3 + body (FAIL, FAIL), services heading
(FAIL), FC (FAIL), WP (FAIL), FR (FAIL), EX (FAIL), gallery heading (PASS), gallery intro (PASS), gallery
captions (PASS), reviews heading (FAIL), reviews stat (FAIL), process heading (PASS), process 01 (FAIL),
process 02 (FAIL), process 03 (FAIL), process 04 (PASS), areas heading (FAIL), areas body (FAIL), areas
hours (FAIL), quote heading (PASS), quote body (PASS), footer line (PASS).
- Total non-[fn] scored: 28. PASS: 8 (gallery heading/intro/captions, process heading, process 04, quote
  heading, quote body, footer line). FAIL (lead-specific, good): 20.
- PASS rate: 8/28 = **28.6%**, under the 30% hard floor. (Verbatim review quotes are lead-specific by
  definition; the small PASS set is the unavoidably generic gallery/quote/footer connective tissue.)

## Notes for implementation (Phase 2)
- No creative copy decisions remain. Phase 2 translates these blocks verbatim into JSX.
- Forbidden in build: any certification/insurance/years-trading claim; any third-party platform proof
  (Yell/MyBuilder/Trustpilot/Checkatrade/TrustATrader); the street 'Springs Cl' / full address; the
  repeated Google niche label as a service; an invented colour beyond olive green; em dashes; salesy words
  in site prose (only allowed inside attributed quotes).
- Only citable proof is Google 4.9 / 58.
- Hero image: 10-places.webp (the only finished interior). Gallery: 10 + 03 (honest captions). 02 excluded.
- Strip emoji from review quote text (Sylvia's review carries several in the brief).
