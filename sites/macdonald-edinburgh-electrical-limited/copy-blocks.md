# Copy blocks - Macdonald Edinburgh Electrical (Path B)

Full draft of every visible copy block. Each annotated with `[src: ...]` (evidence source in the frozen
brief) and `[swap: PASS/FAIL]` where **FAIL = lead-specific (good)**, PASS = generic (would fit another
electrician with a name swap). Functional UI labels (nav, buttons, form fields) are marked `[fn]` and are
expected-generic - excluded from the specificity goal. No em dashes; British English; no banned phrases.

---

## Header `[fn]`
- Wordmark: **Macdonald Edinburgh Electrical** `[src: business_name]`
- Nav: Work, Reviews, Areas
- Button: **Get a quote**

## Hero
- Eyebrow: **Solar, battery and electrical, Penicuik & south Edinburgh** `[src: real_services (solar/battery) + based_location 'Penicuik, EH26' + prospect_region Edinburgh]` `[swap: FAIL - Penicuik-specific]`
- H1: **Solar, battery storage and electrical work for homes across Penicuik and south Edinburgh.** `[src: reviews[0] Liam 'our solar system', reviews[4] Suzanne 'solar panels and batteries', reviews[2] Daniel 'consumer unit ... induction hob'; based_location Penicuik; prospect_region Edinburgh]` `[swap: FAIL]`
- Subhead: **David fits solar panels and battery storage, upgrades consumer units and wires for induction hobs and EV chargers, finished tidy and neatly labelled. Rated 4.9 on Google.** `[src: reviews[4] Suzanne (solar+batteries), reviews[2] Daniel (consumer unit, induction hob, 'tidy and neatly labeled'), google_rating]` `[swap: FAIL]` (single block, 2 sentences, ~200 chars - within hero_subhead limits)
- Proof chip: **4.9 on Google, 63 reviews** `[src: google_rating, google_review_count]` `[swap: FAIL - exact numbers]`
- Primary CTA: **Get a quote** `[fn]` -> #quote
- Secondary CTA: **Call David, 07453 277434** `[src: phone, contact_name David]` `[fn]`

## Proof marquee
- Items: **4.9 on Google · 63 local reviews · Penicuik & south Edinburgh · Solar and battery installs · Tidy and neatly labelled · Monday to Saturday** `[src: google_rating, google_review_count, based_location/prospect_region, real_services, reviews[2] Daniel, opening_hours]` `[swap: FAIL - composite of this lead's specifics]` (factual, no exclamation marks)

## The difference (signature block)
- Eyebrow: **How David works**
- Statement 1: **Solar and battery, set up around how you use power.** `[swap: FAIL]`
  - Body: **David fits the panels and battery, then sets the system up around how your home actually uses electricity, and talks you through it from the first visit to switch-on.** `[src: reviews[0] Liam 'setting up the system once it was installed in a way that worked best for our usage and needs ... talked us through each step diligently from the original consultation', reviews[4] Suzanne 'explained what he was doing at every stage']` `[swap: FAIL]`
- Statement 2: **Consumer units and wiring left <span>tidy and neatly labelled</span>.** `[swap: FAIL - verbatim theme from Daniel]`
  - Body: **A new consumer unit, extra sockets or a hob circuit goes in clean, with the board and wiring clearly labelled so anyone can read it later. The work area is left as it was found.** `[src: reviews[2] Daniel 'replaced our main consumer unit ... running wiring for additional sockets and induction hob - box and wiring all tidy and neatly labeled', reviews[1] Marianne 'tidied up at the end', reviews[0] Liam 'I don't think he left a spec of dust anywhere']` `[swap: FAIL]`
- Statement 3: **On the agreed day, explained as it goes.** `[swap: FAIL]`
  - Body: **You get a start date and David turns up on it. The job is explained step by step as it happens, so you know what is being done and why.** `[src: reviews[4] Suzanne 'arrived on our agreed start date ... explained what he was doing at every stage', reviews[3] Liliane 'David arrived on time and completed the job efficiently', reviews[1] Marianne 'He explained everything']` `[swap: FAIL]`
- Stats band (inline): **4.9 Google rating · 63 reviews · Monday to Saturday** `[src: google_rating, google_review_count, opening_hours]` (labels allowed; no banned sub-labels)

## Services - "What David fits"
- Heading: **What David fits** `[swap: FAIL - named]`
- Intro: **Clean-energy and home electrical work, from a full solar and battery install to a single new circuit.** `[src: real_services]` `[swap: FAIL - clean-energy framing]`
- SB · **Solar panels and battery storage** - Roof solar panels and home battery storage, installed and set up so the system suits how your house uses power. `[src: reviews[0] Liam, reviews[4] Suzanne; photos[] roof arrays + batteries/inverters]` `[swap: FAIL - solar+battery is this lead's lead specialism]`
- CU · **Consumer unit upgrades** - Replacing an old fuse board with a modern consumer unit, fitted and labelled clearly. `[src: reviews[2] Daniel 'replaced our main consumer unit'; photos[] mounted consumer unit (10)]` `[swap: FAIL]`
- EV · **EV chargers and induction-hob wiring** - New circuits for an EV charge point or an induction hob, including the extra sockets that go with them. `[src: reviews[2] Daniel 'running wiring for additional sockets and induction hob']` `[swap: FAIL]`
- EI · **Electrical installation and rewiring** - Sockets, lighting and rewiring work around the home, done to the same tidy standard. `[src: reviews[2] Daniel (running wiring); niche=electrician; brief.json services installations/repairs]` `[swap: FAIL - tidy-standard tie-in]`

## Selected work (gallery)
- Heading: **Recent installs** `[swap: PASS]`
- Intro: **A selection of finished solar, battery and electrical work from around Penicuik and Midlothian.** `[src: photos[] 10 completed_project + service_area]` `[swap: PASS]`
- Captions: neutral and safe only - no invented address or customer. Per image:
  - 08 (house + roof solar arrays): **"Completed solar install, Midlothian"** `[src: photo 08 completed_project]`
  - 05 (panels being fitted on a roof): **"Solar panel install, Penicuik"** `[src: photo 05]`
  - 07 (panel array on slate roof): **"Roof solar array, Midlothian"** `[src: photo 07]`
  - 03 (wall-mounted inverter + battery, David beside): **"Battery and inverter install, Penicuik"** `[src: photo 03]`
  - 04 (clean wall-mounted inverter + battery): **"Inverter and battery storage, Midlothian"** `[src: photo 04]`
  - 10 (mounted consumer unit): **"New consumer unit, Penicuik"** `[src: photo 10]`
  - (06 Anker Solix battery available as a substitute if any tile crops badly)
  `[src: photos[].classification = completed_project only]` `[swap: PASS - intentionally generic for safety]`

## Reviews - "What homeowners say about David"
- Heading: **What homeowners say about David** `[swap: FAIL - names David]`
- Stat: **4.9 Google rating, 63 reviews** `[src: google_rating, google_review_count]` (label "Google rating" - allowed; no banned sub-labels) `[swap: FAIL]`
- Quote 1 (verbatim, solar + batteries): **"David fitted our solar panels and batteries and throughout the whole process he was reliable and professional and arrived on our agreed start date. He explained what he was doing at every stage and I am delighted I chose his company to do the work. I recommend him 100%"** - **Suzanne, Google review** `[src: reviews[4]]` `[swap: FAIL]`
- Quote 2 (verbatim, solar system end to end): **"David MacDonald provided excellent service and quality of work from start to finish. He talked us through each step diligently from the original consultation to setting up the system once it was installed in a way that worked best for our usage and needs. His work standards are top quality, and I don't think he left a spec of dust anywhere which is refreshing. We're over the moon with our solar system."** - **Liam, Google review** `[src: reviews[0], trimmed verbatim from the middle/end of the review]` `[swap: FAIL]`
- Quote 3 (verbatim, consumer unit + induction hob): **"David and Ryan recently replaced our main consumer unit, as well as running wiring for additional sockets and induction hob. Couldn't be happier with their work - box and wiring all tidy and neatly labeled. Very honest and pleasant to deal with, and I'd highly recommend them to anyone."** - **Daniel, Google review** `[src: reviews[2]; Ryan named only inside this verbatim quote]` `[swap: FAIL]`
- Quote 4 (verbatim, responsiveness + on time): **"Craig responded to my post very promptly and arranged a convenient appointment. On the day, David arrived on time and completed the job efficiently. Happy customer and absolutely satisfied with their excellent service. would not hesitate to recommend to friends and family!"** - **Liliane, Google review** `[src: reviews[3]; Craig named only inside this verbatim quote]` `[swap: FAIL]`
- Link: **Read all reviews on Google** `[fn]` -> https://maps.google.com/?cid=1855229081902958572

## How a job works (numbered - real sequence)
- Heading: **How a job works** `[swap: PASS]`
- 01 **Arrange a visit and a price** - Get in touch and David arranges a convenient time to come and look at the job, then comes back with a price. `[src: reviews[3] Liliane 'arranged a convenient appointment'; general quote step]` `[swap: PASS]`
- 02 **Plan it around your home** - For solar and battery, the system is planned around how your house uses power; for other work, what goes where is agreed before anything starts. `[src: reviews[0] Liam 'in a way that worked best for our usage and needs']` `[swap: FAIL - usage-led planning]`
- 03 **Fitted and set up, explained as it goes** - The work is carried out on the agreed day and explained step by step, from first fix to switch-on. `[src: reviews[4] Suzanne 'arrived on our agreed start date ... explained at every stage', reviews[0] Liam 'talked us through each step']` `[swap: FAIL]`
- 04 **Left tidy and clearly labelled** - The consumer unit and wiring are labelled so they can be read later, and the work area is left clean. `[src: reviews[2] Daniel 'tidy and neatly labeled', reviews[1] Marianne 'tidied up at the end']` `[swap: FAIL]`

## Where David works (areas + hours)
- Heading: **Where David works** `[swap: FAIL - named]`
- Body: **Based in Penicuik, David covers Midlothian and the south of Edinburgh, from Penicuik and Loanhead through to the southern Edinburgh suburbs.** `[src: based_location 'Penicuik, EH26'; prospect_region Edinburgh; honest framing per voice.json location_framing - NOT a central-Edinburgh base]` `[swap: FAIL]`
- Area list: **Penicuik · Loanhead · Roslin · Bilston · Bonnyrigg · Lasswade · Auchendinny · Milton Bridge · Gilmerton · Liberton · Straiton · Fairmilehead** `[src: Penicuik base (EH26) + Midlothian/south-Edinburgh geography around EH26; plausible one-van radius, no national over-claim. NB the only directly evidenced locations are Penicuik (address) and Edinburgh (prospect_region); the rest are UK-geographic derivations and stay within a Midlothian / south-Edinburgh radius.]`
- Hours: **Monday to Saturday, 9am to 5pm.** `[src: opening_hours Mon-Sat 9:00-17:00, Sun closed]` `[swap: FAIL - specific sourced hours]`
- Map: keyless Google Maps iframe, query **Penicuik EH26** (town + outward only; no street address). `[src: google_maps_url cid]`

## Get a quote (#quote)
- Heading: **Get a quote for your solar, battery or electrical work** `[swap: FAIL - service-specific]`
- Body: **Tell David about the job - what you are after and roughly when - and he will come back to you with a price. If it is solar or a battery, a rough idea of your bills or roof helps; photos of a fuse board or the space help for other work.** `[src: phone + real_services]` `[swap: FAIL - solar/battery context]`
- Side details (left column): **Call David on 07453 277434** `[src: phone]` · **Based in Penicuik, EH26** `[src: based_location]` · **Monday to Saturday, 9am to 5pm** `[src: opening_hours]`
- Form fields `[fn]`: Name · Phone · Email (optional) · Postcode · Job type (Solar panels & battery / EV charger / Consumer unit upgrade / Rewire / Other) · Details
- Submit button: **Send job details** `[fn]` (says what happens; not "Submit")
- Disclaimer (internal note): form is presentational only and must not submit to the business or carry any "preview form" banned text.
- Sticky CTA (quote-only): **Get a quote** `[fn]`

## Footer `[fn]`
- Brand: **Macdonald Edinburgh Electrical** `[src: business_name]`
- Line: **Solar, battery storage and electrical work across Penicuik, Midlothian and south Edinburgh.** `[src: real_services + service_area]`
- Phone: **07453 277434** `[src: phone]`
- Areas: **Penicuik · Loanhead · Roslin · Bonnyrigg · Lasswade · south Edinburgh** `[src: service_area + EH26 geography]`
- Hours: **Monday to Saturday, 9am to 5pm** `[src: opening_hours]`
- Quick links: Work · Reviews · Areas · Get a quote
- **Read our Google reviews** -> https://maps.google.com/?cid=1855229081902958572
- Credit: **Website by WebForTrades** (small) -> https://webfortradesuk.co.uk

---

## Notes for implementation (Phase 2)
- No creative copy decisions remain. Phase 2 translates these blocks verbatim into JSX.
- Forbidden in build: any certification/insurance/years-trading claim (NICEIC, NAPIT, Part P, MCS, fully
  insured - the van shows NICEIC livery but the directory probe did NOT verify it); any third-party platform
  proof (Yell/MyBuilder/Trustpilot/RatedPeople/MyJobQuote/TrustATrader); the street address
  '4 Mauricewood Grove'; a central-Edinburgh base claim; emergency/24-hour callout; the broad Google labels
  ('Repairs and maintenance', 'Installations', 'Emergency callouts') as the service list; invented solar
  specifics (kW, savings, grants); em dashes.
- Only citable proof is Google 4.9 / 63.
- David usage: approved (5/5 reviews, contact_name_usage_allowed=true). Light third person only; no
  owner-monologue. Ryan and Craig appear only inside the verbatim review quotes.
- Hero image: 08-places.webp (house + roof solar arrays, landscape, no people) - chosen as the most on-angle
  finished-work shot. Reason recorded in build-notes.md.
- US spelling 'labeled' is preserved inside Daniel's verbatim quote; site prose uses British 'labelled'.
