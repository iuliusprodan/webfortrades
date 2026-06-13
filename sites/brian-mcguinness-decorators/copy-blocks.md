# Copy blocks - Brian McGuinness Decorators (Path B)

Full draft of every visible copy block. Each annotated with `[src: ...]` (evidence source in the frozen
brief) and `[swap: PASS/FAIL]` where **FAIL = lead-specific (good)**, PASS = generic (would fit another
decorating firm with a name swap). Functional UI labels (nav, buttons, form fields) are marked `[fn]`
and are expected-generic - excluded from the specificity goal. No em dashes; British English; no banned
phrases. Geo framed honestly around the real Coatbridge ML5 base (never Glasgow city centre).

---

## Header `[fn]`
- Wordmark: **Brian McGuinness Decorators** `[src: business_name]`
- Nav: Work · Reviews · Areas
- Button: **Get a quote**

## Hero
- Eyebrow: **Painters and decorators · Coatbridge and east Glasgow** `[src: services/niche + based_location 'Coatbridge, ML5'; geo framed honestly per voice.json geo_honesty]` `[swap: FAIL - Coatbridge/east-Glasgow specific]`
- H1: **Painters and decorators for Coatbridge and the east of Glasgow, trusted with period homes.** `[src: services + based_location Coatbridge ML5 + reviews[4] Jim 'Victorian cornices and ceilings', reviews[3] Bob 'hall (3 floors)']` `[swap: FAIL]`
- Subhead: **Brian decorates period and tenement homes across Coatbridge and the east of Glasgow: Victorian cornices and ceilings, halls and staircases, painting and wallpaper, all to a high standard and left clean and tidy.** `[src: real_services + reviews Jim/Bob/Helena/Linda + based_location]` `[swap: FAIL]` (211 chars, single sentence - within hero_subhead limits)
- Proof chip: **5.0 on Google · 98 reviews** `[src: google_rating 5, google_review_count 98 (sourced)]` `[swap: FAIL - exact numbers]`
- Primary CTA: **Get a quote** `[fn]` -> #quote
- Secondary CTA: **Call Brian · 07879 054484** `[src: phone]` `[fn]`

## Proof strip (marquee)
- Items (looped twice for a seamless loop): **5.0 on Google** · **98 reviews** · **Coatbridge and east Glasgow** · **Victorian cornices and ceilings** · **Painting and wallpaper** · **Neat, tidy, reliable** `[src: google_rating, google_review_count; based_location; reviews[4] Jim (cornices); reviews[0] Linda (painting and papering, neat and tidy); reviews[1] Helena (reliable)]` `[swap: FAIL - cornices + 5.0/98 are this lead's]`

## The period difference (signature block)
- Eyebrow: **What Brian's known for** `[swap: FAIL - named]`
- Statement 1: **Work that respects an old house.** `[swap: FAIL]`
  - Body: **Victorian cornices and ceilings, original plasterwork and period detail painted to a high standard, with the care an old room needs rather than a quick coat.** `[src: reviews[4] Jim 'good work on the Victorian cornices and ceilings ... very high standard']` `[swap: FAIL]`
- Statement 2: **Halls and staircases over several floors.** `[swap: FAIL]`
  - Body: **Whole homes taken on room by room, including the hall, staircase and landing across more than one floor, in paint and in wallpaper.** `[src: reviews[3] Bob 'paint our hall (3 floors) ... wallpaper our bedroom', reviews[1] Helena 'hall and staircase', reviews[0] Linda 'painting and papering']` `[swap: FAIL]`
- Statement 3: **Left clean, tidy and on time.** `[swap: FAIL - verbatim review behaviour]`
  - Body: **Brian is a clean, tidy worker who finishes to the time he gives you, and puts any small thing right quickly if it needs it.** `[src: reviews[0] Linda 'extremely neat and very tidy ... completing the job in timescale', reviews[1] Helena 'spotlessly clean worker', reviews[2] Jodie 'out within the hour to sort it']` `[swap: FAIL]`
- Stats band (inline): **5.0 · Google rating** | **98 · Google reviews** | **Mon to Fri · 9am to 5pm** `[src: google_rating, google_review_count, opening_hours]` (sourced stats only; no photo count) `[swap: FAIL]`

## Services - "What Brian does"
- Heading: **What Brian does** `[swap: FAIL - named]`
- PD · **Period and heritage decorating** - Victorian cornices, ceilings and original plasterwork in period and tenement homes, painted carefully to a high standard. `[src: reviews[4] Jim; photos[] period rooms with ornate cornice/coving]` `[swap: FAIL - cornices/plasterwork is this lead's specialism]`
- PT · **Interior painting** - Whole homes taken on room by room, the way Helena's hall, staircase, living and dining room and kitchen were, in clean, even brushwork. `[src: reviews[1] Helena (hall, staircase, living/dining room, kitchen), reviews[0] Linda (3 rooms), reviews[2] Jodie (living room)]` `[swap: FAIL - the whole-house room run is this lead's evidenced job]`
- WP · **Wallpaper and paper-hanging** - Feature walls and full rooms papered, including pattern-matched and lining paper, alongside the painting. `[src: reviews[0] Linda 'painting and papering superb', reviews[3] Bob 'wallpaper our bedroom'; photos[] floral feature wall + botanical cloakroom paper]` `[swap: FAIL]`
- HS · **Halls, stairs and landings** - The awkward multi-floor runs done properly: hallways, staircases and landings painted or papered across several floors. `[src: reviews[3] Bob 'hall (3 floors)', reviews[1] Helena 'hall and staircase', reviews[2] Jodie 'Hallway'; photos[] stairwell feature wall]` `[swap: FAIL]`

## Selected work (gallery)
- Heading: **Recent work** `[swap: PASS]`
- Intro: **Finished period rooms, cornices, hallways and papered walls from around Coatbridge and the east of Glasgow.** `[src: photos[] finished period rooms with ornate cornice (02/03), hall/stair (06), wallpaper (01/05) + service_area (honest)]` `[swap: FAIL - period rooms + cornices ties to this lead's photos/angle]`
- Captions: neutral and safe only - no invented room owner, job address or customer. Per image, describe only what the photo clearly shows:
  - 02 (period living room, ornate cornice, marble fireplace): **"Period living room, Coatbridge"** `[src: photos[1] classification completed_project]` `[swap: PASS]`
  - 06 (hall/stair feature wall, spindle banister): **"Hall and staircase"** `[src: photos[5]]` `[swap: PASS]`
  - 01 (floral feature wallpaper, cornice): **"Wallpapered feature wall"** `[src: photos[0]]` `[swap: PASS]`
  - 05 (botanical-paper cloakroom): **"Wallpapered cloakroom"** `[src: photos[4]]` `[swap: PASS]`
  - (Implementer note: hero photo 03 is NOT repeated in the gallery; WIP/exterior/people shots 04/07/08/09/10 are excluded per the site-design skill.)

## Reviews - "What homeowners say about Brian"
- Heading: **What homeowners say about Brian** `[swap: FAIL - names Brian]`
- Stat: **5.0 Google rating · 98 reviews** `[src: google_rating, google_review_count]` (label "Google rating" - allowed; no banned sub-labels) `[swap: FAIL]`
- Quote 1 (verbatim, period plasterwork): **"Brian has painted all the rooms in our flat to a very high standard. Especially pleased by his good work on the Victorian cornices and ceilings. All Brian's work has been excellent, a reliable and trustworthy decorator. We would happily recommend him!"** - **Jim, Google review** `[src: reviews[4] verbatim]` `[swap: FAIL]`
- Quote 2 (verbatim, multi-floor + wallpaper): **"We used Brian to paint our hall (3 floors), bathroom and wallpaper our bedroom. His quote was reasonable, the job was completed in the agreed time and his work was of a very high standard. We were very pleased overall and wouldn't hesitate to recommend him, and would certainly use him again."** - **Bob, Google review** `[src: reviews[3] verbatim]` `[swap: FAIL]`
- Quote 3 (verbatim, whole house, clean): **"Brian has just finished painting my house to include the hall and staircase, living room/dining room and kitchen. He did a fantastic job and is a first class decorator. Brian is very reliable, spotlessly clean worker and is competitively priced. I have engaged the services of many decorators over the years and Brian in my opinion is by far the best."** - **Helena, Google review** `[src: reviews[1] verbatim (internal double space and trailing line normalised; no words changed)]` `[swap: FAIL]`
- Quote 4 (verbatim trimmed, painting + papering, tidy): **"Outstanding Decorator and very professional indeed. He is extremely neat and very tidy completing the job in timescale given which was so helpful. The quality and finish of his painting and papering superb and he diligently worked away completing 3 rooms to my complete satisfaction."** - **Linda, Google review** `[src: reviews[0]; trimmed to a contiguous-sense excerpt, each sentence verbatim; the emoji and the 'great singer' aside are dropped, no paraphrase]` `[swap: FAIL]`
- Link: **Read all reviews on Google** `[fn]` -> https://maps.google.com/?cid=2307249476113286934

## How a job works with Brian (numbered - real sequence)
- Heading: **How a job works** `[swap: PASS]`
- 01 **Come and look, then quote** - Brian comes out, looks at the rooms and the plasterwork, and gives you a clear price for the work. `[src: reviews[3] Bob 'His quote was reasonable'; reviews[2] Jodie 'efficient with communication start to finish']` `[swap: PASS]`
- 02 **Protect the room first** - Floors and furniture covered, surfaces prepared, so an old room is kept clean while the work is done. `[src: reviews[0] Linda 'extremely neat and very tidy', reviews[1] Helena 'spotlessly clean worker']` `[swap: FAIL - tidy/clean is this lead's repeated theme]`
- 03 **Painted and papered to a high standard** - Cornices, ceilings, walls, halls and stairs done carefully in paint or paper, at the right pace rather than rushed. `[src: reviews[4] Jim 'very high standard ... Victorian cornices and ceilings', reviews[0] Linda 'painting and papering superb']` `[swap: FAIL]`
- 04 **Finished on time, snags sorted** - The work is finished to the time agreed and the place left tidy; if a small thing needs putting right, Brian is back quickly. `[src: reviews[3] Bob 'completed in the agreed time', reviews[2] Jodie 'out within the hour to sort it']` `[swap: FAIL]`

## Where Brian works (areas + hours)
- Heading: **Where Brian works** `[swap: FAIL - named]`
- Body: **Based in Coatbridge, Brian covers North Lanarkshire and the east of Glasgow, from Airdrie and Bargeddie across to Baillieston, Shettleston and the Glasgow east end.** `[src: based_location Coatbridge ML5; honest geo per voice.json - Coatbridge is the evidenced base ~10mi east of Glasgow city centre; surrounding towns/districts derived from ML5, plausible one-van radius]` `[swap: FAIL]`
- Area list: **Coatbridge · Coatdyke · Airdrie · Bargeddie · Calderbank · Bellshill · Baillieston · Mount Vernon · Shettleston · Easterhouse · Glasgow east end · Uddingston** `[src: Coatbridge evidenced (based_location); the rest are UK-geographic derivations from the ML5 base - North Lanarkshire towns + east-Glasgow districts within a plausible one-van radius; flagged as derived, no Glasgow city centre or west-Glasgow over-claim]`
- Hours: **Monday to Friday, 9am to 5pm.** `[src: opening_hours Mon-Fri 9:00-17:00, Sat/Sun closed]` `[swap: FAIL - specific sourced hours]`
- Map: keyless Google Maps iframe, query **Coatbridge ML5** (town + outward only; no street address). `[src: google_maps_url cid; based_location]`

## Get a quote (#quote)
- Heading: **Get a quote for your decorating** `[swap: PASS]`
- Body: **Tell Brian about the rooms - what you're after, painting or paper, and roughly when - and he'll come back to you with a price. Photos of the space help if you have them.** `[src: phone + general]` `[swap: PASS]`
- Side details (left column): **Call Brian on 07879 054484** `[src: phone]` · **Based in Coatbridge, ML5** `[src: based_location]` · **Monday to Friday, 9am to 5pm** `[src: opening_hours]`
- Form fields `[fn]`: Name · Phone · Email (optional) · Postcode · Job type (Interior painting / Wallpaper / Period decorating / Halls and stairs / Other) · Details
- Submit button: **Send job details** `[fn]` (says what happens; not "Submit")
- Disclaimer (internal note): form is presentational only and must not submit to the business or carry any "preview form" banned text.
- Sticky CTA (quote-only): **Get a quote** `[fn]`

## Footer `[fn]`
- Brand: **Brian McGuinness Decorators** `[src: business_name]`
- Line: **Painting, wallpaper and period decorating across Coatbridge and the east of Glasgow.** `[src: service_area (honest) + real_services]`
- Phone: **07879 054484** `[src: phone]`
- Areas: **Coatbridge · Airdrie · Bargeddie · Bellshill · Baillieston · Glasgow east end** `[src: based_location + derived areas]`
- Hours: **Monday to Friday, 9am to 5pm** `[src: opening_hours]`
- Quick links: Work · Reviews · Areas · Get a quote
- **Read our Google reviews** -> https://maps.google.com/?cid=2307249476113286934
- Credit: **Website by WebForTrades** (small) -> https://webfortradesuk.co.uk

---

## Notes for implementation (Phase 3)
- No creative copy decisions remain. Phase 3 translates these blocks verbatim into JSX.
- Forbidden in build: any certification/insurance/years-trading claim; any third-party platform proof
  (Yell/MyBuilder/Trustpilot/TrustATrader); the street address '2 Seamill Way'; a Glasgow-city-centre
  base claim; 'Bathroom installations' as a service (a misread of Bob's review - Brian PAINTED the
  bathroom); 'painters and decorators'/'Painting and decorating' duplicated as separate services; calling
  Chris a co-owner; em dashes.
- Only citable proof is Google 5.0 / 98.
- Hero image: 03-places.webp (sage period room with Victorian cornice) - vision-selected; reason in
  build-notes. Gallery: 02, 06, 01, 05 (finished only).
