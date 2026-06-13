# Copy blocks - Amrock Electrical Ltd (Path B)

Full draft of every visible copy block. Each annotated with `[src: ...]` (evidence source in the
frozen brief) and `[swap: PASS/FAIL]` where **FAIL = lead-specific (good)**, PASS = generic (would
fit another electrician with a name swap). Functional UI labels (nav, buttons, form fields) are marked
`[fn]` and are expected-generic - excluded from the specificity goal. No em dashes; British English;
no banned phrases. Review quotes that contain em dashes in brief.json are converted to ` - ` here.

---

## Header `[fn]`
- Wordmark: **Amrock Electrical** `[src: business_name]`
- Nav: Work · Reviews · Areas
- Button: **Get a quote**

## Hero (typographic, no photo)
- Eyebrow: **Electricians · Cardiff, CF23** `[src: niche + based_location 'Cardiff, CF23']` `[swap: FAIL - CF23 specific]`
- H1: **Electricians for Cardiff's older homes, brought up to standard.** `[src: reviews[0] Molly 'purchased an older property that needed a fair bit of electrical work'; reviews[2] Simon (electric fire); reviews[3] Rhys (storage heater)]` `[swap: FAIL]`
- Subhead: **Naz and Henry add sockets, update tired light fittings, and fit storage heaters and electric fires across Cardiff, plus EV chargers, explaining the work as they go.** `[src: reviews[0] Molly (sockets, light fittings, car charger), reviews[2] Simon (electric fire), reviews[3] Rhys (storage heater), reviews[1] Faye (explained clearly)]` `[swap: FAIL]` (188 chars, within hero_subhead limits)
- Proof chip: **5.0 on Google · 27 reviews** `[src: google_rating, google_review_count]` `[swap: FAIL - exact numbers]`
- Primary CTA: **Get a quote** `[fn]` -> #quote
- Secondary CTA: **Call Naz · 07824 566582** `[src: phone + contact_name]` `[fn]`

## Proof marquee
- Items: **5.0 on Google** · **27 local reviews** · **Cardiff, CF23** · **Older homes brought up to standard** · **Explained as we go** · **EV chargers fitted** `[src: google_rating/google_review_count; based_location; reviews[0] Molly older home + car charger; reviews[1] Faye explained clearly]` `[swap: FAIL - lead-specific proof line]`

## The difference (signature block)
- Eyebrow: **What Amrock is known for**
- Statement 1: **Older homes, brought up to standard.** `[swap: FAIL]`
  - Body: **Extra sockets where you actually need them, tired light fittings updated, and the small upgrades that make an older Cardiff house work the way it should.** `[src: reviews[0] Molly 'purchased an older property ... installing additional sockets, updating light fittings']` `[swap: FAIL]`
- Statement 2: **Storage heaters and electric fires, fitted and connected.** `[swap: FAIL - verbatim work types from Simon and Rhys]`
  - Body: **From swapping a storage heater to fitting an electric fire on a fused spur and setting up the fuel effect, the heating jobs in an older home, done properly.** `[src: reviews[3] Rhys 'removal and fitting of a new storage heater'; reviews[2] Simon 'installed my new electrical fire and connected it to a Fused spur ... They even setup the fuel effect']` `[swap: FAIL]`
- Statement 3: **Explained as we go, left tidy.** `[swap: FAIL]`
  - Body: **Naz keeps you in the loop from the first message, and the work is done safely, the right way, and the place left clean.** `[src: reviews[0] Molly 'Communication with Naz via WhatsApp was seamless'; reviews[1] Faye 'explained everything clearly, and made sure the job was done safely'; reviews[3] Rhys 'Excellent communication throughout']` `[swap: FAIL]` (note: 'the right way' / 'safely' is plain description; the literal 'up to regulations' stays inside Faye's quote only)
- Stats band (inline): **5.0** Google rating · **27** Google reviews · **Naz & Henry** the two-man team `[src: google_rating, google_review_count, reviews[0] Molly 'Naz and Henry']` `[swap: FAIL]`

## Services - "What Amrock does"
- Heading: **What Amrock does** `[swap: FAIL - named]`
- Intro: **Domestic electrical work for Cardiff homes, from a single socket to a full upgrade.** `[src: real_services]` `[swap: PASS]`
- SL · **Additional sockets and lighting** - Extra sockets added where you need them and tired light fittings updated, the bread and butter of bringing an older home up to date. `[src: reviews[0] Molly 'additional sockets, updating light fittings']` `[swap: FAIL]`
- EF · **Electric fires and storage heaters** - Electric fires fitted and connected on a fused spur with the fuel effect set up, and storage heaters removed and replaced. `[src: reviews[2] Simon, reviews[3] Rhys]` `[swap: FAIL]`
- EV · **EV and car charger installation** - A home car charger fitted and wired in, added as part of an upgrade or on its own. `[src: reviews[0] Molly 'adding a car charger']` `[swap: FAIL - the EV add-on to this lead's heritage angle]`
- OB · **Extra circuits and power to outbuildings** - New circuits run safely where you need them, including power out to a garage, workshop or outbuilding. `[src: reviews[1] Faye 'run power to an outbuilding ... safely and up to regulations']` `[swap: FAIL]`

## Selected work (single featured photo)
- Heading: **Recent work in Cardiff** `[swap: PASS]`
- Intro: **A finished living-room install in Cardiff: a new electric fire and media wall, wired in and tidied up.** `[src: photos[1] 02-places.webp completed_project; reviews[2] Simon electric fire]` `[swap: FAIL - describes the actual photo]`
- Caption: **Completed living-room install, Cardiff** `[src: photos[1].classification = completed_project]` `[swap: PASS - intentionally safe]`
- (Implementation: ONLY 02-places.webp is used. 01-places.webp is work-in-progress, 03-places.webp is the brand logo - both excluded per the site-design skill.)

## Reviews - "What Cardiff homeowners say about Amrock"
- Heading: **What Cardiff homeowners say about Amrock** `[swap: FAIL - names Amrock + Cardiff]`
- Stat: **5.0 - Google rating · 27 reviews** `[src: google_rating, google_review_count]` (label "Google rating" - allowed; no banned sub-labels) `[swap: FAIL]`
- Quote 1 (verbatim, older home - em dashes converted to ' - '): **"I recently purchased an older property that needed a fair bit of electrical work - including installing additional sockets, updating light fittings, and adding a car charger. From start to finish, Naz and Henry were absolutely fantastic. Communication with Naz via WhatsApp was seamless; he always responded promptly and helpfully. Henry handled much of the installation work and was consistently friendly, professional, and efficient. We're really pleased with the end results - everything looks great and works perfectly."** - **Molly, Google review** `[src: reviews[0]]` `[swap: FAIL]`
- Quote 2 (verbatim, electric fire): **"Naz & Co. from Amrock installed my new electrical fire and connected it to a Fused spur through the wall. Excellent work carried out and their rates were VERY affordable. They even setup the fuel effect. 5* service at great prices, Highly recommend."** - **Simon, Google review** `[src: reviews[2]]` `[swap: FAIL]`
- Quote 3 (verbatim, storage heater): **"5* service from Naz and team. Not only with the removal and fitting of a new storage heater, but also acting as intermediary between us (tenants) and landlord. Excellent communication throughout and a quick resolution. Would highly recommend."** - **Rhys, Google review** `[src: reviews[3]]` `[swap: FAIL]`
- Quote 4 (verbatim, regulations - em dash converted to ' - '): **"I recently hired Naz from Amrock to run power to an outbuilding on my property, and I couldn't be happier with the results. He showed up on time, explained everything clearly, and made sure the job was done safely and up to regulations. The quality of the work was excellent - clean, efficient, and exactly what I needed."** - **Faye, Google review** `[src: reviews[1]]` `[swap: FAIL]`
- Link: **Read all reviews on Google** `[fn]` -> https://maps.google.com/?cid=654358521196426038

## How a job works with Amrock (numbered - real sequence)
- Heading: **How a job works with Amrock** `[swap: FAIL - named]`
- 01 **Get in touch** - Message or call Naz with what you need doing. He is quick to come back to you and easy to talk to. `[src: reviews[0] Molly 'Communication with Naz via WhatsApp was seamless; he always responded promptly'; reviews[3] Rhys 'Excellent communication']` `[swap: PASS]`
- 02 **A look and a clear price** - Naz comes out, looks at the job in your home, and gives you a straight price before anything starts. `[src: reviews[1] Faye 'explained everything clearly'; general quote step]` `[swap: PASS]`
- 03 **Done the right way, kept informed** - The work is carried out safely and properly, and you are kept in the loop while it happens. `[src: reviews[1] Faye 'done safely and up to regulations'; reviews[0] Molly (communication)]` `[swap: FAIL]`
- 04 **Tested, tidied and explained** - It is left working, the space cleared up, and Naz talks you through what was done. `[src: reviews[0] Molly 'everything looks great and works perfectly'; reviews[1] Faye 'clean, efficient']` `[swap: FAIL]`

## Where Amrock works (areas)
- Heading: **Where Amrock works** `[swap: FAIL - named]`
- Body: **Based in Cardiff, CF23, Naz and Henry cover the city and the surrounding CF postcodes, from Cyncoed and Llanishen across to Roath, Penylan and Whitchurch.** `[src: based_location 'Cardiff, CF23'; service_area Cardiff + CF23; districts derived from CF23/Cardiff geography - plausible one/two-van radius, no over-claim]` `[swap: FAIL]`
- Area list: **Cyncoed · Llanishen · Lisvane · Heath · Birchgrove · Roath · Penylan · Whitchurch · Rhiwbina · Thornhill · Pontprennau · Pentwyn · Llanedeyrn · Cardiff city centre** `[src: Cardiff + CF23 evidenced; others derived from the CF23 base, plausible local radius - no over-claim, no national footprint]`
- Availability: **Most days, including evenings by arrangement.** `[src: general; opening_hours 'Open 24 hours' is a Google default and is NOT surfaced as a 24/7 or emergency claim]` `[swap: PASS]`
- Map: keyless Google Maps iframe, query **Cardiff CF23** (town + outward only; no street address). `[src: google_maps_url cid]`

## Get a quote (#quote)
- Heading: **Get a quote for your electrical work** `[swap: PASS]`
- Body: **Tell Naz about the job - the property, what you need doing and roughly when - and he'll come back to you with a price. A few photos help if you have them.** `[src: phone + reviews[0] Molly (WhatsApp comms) + general]` `[swap: PASS]`
- Side details (left column): **Call or message Naz on 07824 566582** `[src: phone + reviews[0] Molly WhatsApp]` · **Based in Cardiff, CF23** `[src: based_location]` · **Cardiff and the surrounding CF postcodes** `[src: service_area]`
- Form fields `[fn]`: Your name · Phone · Email (optional) · Postcode · Job type (Older-home upgrade / Additional sockets & lighting / EV charger / Consumer unit / Other) · Details
- Submit button: **Send job details** `[fn]` (says what happens; not "Submit")
- Disclaimer (internal note): form is presentational only and must not submit to the business or carry any "preview form" banned text.
- Sticky CTA (quote-only): **Get a quote** `[fn]`

## Footer `[fn]`
- Brand: **Amrock Electrical** `[src: business_name]`
- Line: **Domestic electrical work across Cardiff and the CF postcodes.** `[src: service_area]`
- Phone: **07824 566582** `[src: phone]`
- Areas: **Cyncoed · Llanishen · Roath · Penylan · Whitchurch · Rhiwbina** `[src: service_area + derived districts]`
- Quick links: Work · Reviews · Areas · Get a quote
- **Read our Google reviews** -> https://maps.google.com/?cid=654358521196426038
- Credit: **Website by WebForTrades** (small) -> https://webfortradesuk.co.uk

---

## Swap-test tally (specificity goal: <30% PASS among non-`[fn]` copy blocks)
Counting evaluable copy blocks (excluding `[fn]` UI labels):
- FAIL (lead-specific): Hero eyebrow, Hero H1, Hero subhead, Hero proof chip, Marquee, Difference S1, Difference S1 body, Difference S2, Difference S2 body, Difference S3, Difference S3 body, Stats band, Services heading, Service SL, Service EF, Service EV, Service OB, Selected-work intro, Reviews heading, Reviews stat, Review Q1, Review Q2, Review Q3, Review Q4, Process heading, Process 03, Process 04, Areas heading, Areas body, Areas list = **30 FAIL**
- PASS (generic): Services intro, Selected-work heading, Selected-work caption, Process 01, Process 02, Areas availability, Quote heading, Quote body, Footer line = **9 PASS**
- Total evaluable = 39. PASS% = 9/39 = **23.1%** (< 30% floor - PASS).

## Notes for implementation (Phase 2)
- No creative copy decisions remain. Phase 2 translates these blocks verbatim into JSX.
- Forbidden in build: any certification/insurance/Part P/NICEIC/registered claim; 'Emergency callouts'/24-hour/24-7 service or positioning; any third-party platform proof (Yell/MyBuilder/Trustpilot/Checkatrade/TrustATrader); the street address '56 Rhyd-Y-Penau Rd'; broad Google labels as services; full rewire / consumer-unit upgrade as an advertised completed service; em dashes (convert review-quote em dashes to ' - ').
- Only citable proof is Google 5.0 / 27.
- Hero: typographic (no photo) - the deliberate decision; the one usable photo (02-places.webp) is featured in selected-work.
