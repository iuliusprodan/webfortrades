# Copy blocks - Electrical Solutions Bristol Ltd

All verbatim copy for the page, with `[src:]` traceability and a swap-test mark per block
(**FAIL** = lead-specific, could not belong to another business = good; **PASS** = generic, could be
swapped onto another trader = bad). Hard floor: fewer than 30% may be PASS.

British English. No em/en dashes. No certification claims (none verified). 5.0 / 135 only.

---

## Header
- Wordmark: **Electrical Solutions Bristol** `[src: brief.business_name]` - **FAIL** (the business name)
- Nav: Work / Reviews / Areas / Get a quote `[src: nav convention]` - PASS (generic nav)
- Button: **Get a quote** `[src: sticky_cta allowed label]` - PASS (allowed CTA)

## Hero
- Eyebrow: **Electrician, Bristol BS16 - Downend and across the city** `[src: based_location "Bristol, BS16"; address Bromley Heath/Downend]` - **FAIL** (BS16 Downend is specific)
- Headline: **High-end home electrics for Bristol, lighting and all, done to a considered standard.** `[src: reviews[2] Emily lighting/high quality; reviews[1] Bel impeccable; reviews[4] Megan high standard; niche electricians; high-end-domestic angle]` - **FAIL** (the angle, trade + location)
- Sub-head: **Lawrence fits lighting and downlights, upgrades consumer units, rewires and chases down faults across Bristol and the BS postcodes. The board and the safety sorted first, the latest solutions rather than the same old kit, and the job left tidy.** `[src: contact_name Lawrence; reviews[0] Marc consumer unit/downlights/outdoor socket; reviews[1] Bel latest solutions; reviews[4] Megan tidy; reviews[2] Emily lighting]` - **FAIL** (names Lawrence, specific services + angle)
- CTA primary: **Get a quote** - PASS (allowed CTA)
- CTA secondary: **Call Lawrence, 07716 418405** `[src: contact_name Lawrence; brief.phone]` - **FAIL** (name + number)
- Proof chip: **5.0 on Google · 135 reviews** `[src: google_rating, google_review_count sourced]` - PASS (a rating chip is a common shape; numbers are specific but the block reads as generic-shaped, marked PASS to be conservative)

## Proof marquee
- Items: **5.0 on Google · 135 reviews · Bristol, BS16 · Lighting and downlights · The latest solutions, not the same old kit · Tidy, considered finish** `[src: google_rating/count; based_location; reviews[2] lighting; reviews[1] latest solutions; reviews[4] tidy]` - **FAIL** (the "latest solutions, not the same old kit" + lighting are this trader's specifics)

## The standard (signature block)
- Eyebrow: **The standard Lawrence works to** `[src: contact_name Lawrence; reviews[4] high standard]` - **FAIL** (names Lawrence)
- Item 1 heading: **Lighting and downlights, planned and fitted properly.** `[src: reviews[2] Emily fitting lights, high quality; reviews[0] Marc bathroom downlights, garden light]` - **FAIL**
  - Body: **From a run of downlights to a single switch or an outdoor light, the lighting is set out and fitted to the standard the rest of the house is held to, not just made to work.** `[src: reviews[2] Emily "exactly as we asked and done to a really high quality"; reviews[0] Marc downlights/switch/garden light]` - **FAIL**
- Item 2 heading: **The board and the safety sorted first.** `[src: reviews[0] Marc consumer unit outdated, explained it needed replacing before the other work]` - **FAIL**
  - Body: **If the consumer unit or the wiring needs bringing up to scratch before the rest can go ahead, Lawrence says so plainly, prices it, and does that first.** `[src: reviews[0] Marc "explained that it needed replacing before the other work could be done ... clear and honest about everything ... gave us a quote"]` - **FAIL**
- Item 3 heading: **The latest solutions, <span>not the same old kit</span>.** `[src: reviews[1] Bel "stays across industry innovation ... offer the latest solutions instead of using the same old stuff"]` - **FAIL** (near-verbatim of Bel's distinctive line, the single accented phrase)
  - Body: **Lawrence keeps across what is new in the trade, so the work uses current gear and methods, and the finish is left impeccably tidy.** `[src: reviews[1] Bel latest solutions; reviews[4] Megan "impeccably tidy"]` - **FAIL**

## Services
- Section heading: **What Lawrence does** `[src: contact_name Lawrence; real_services]` - **FAIL** (names Lawrence)
- Intro: **Domestic electrical work across Bristol, from a single light to a full rewire.** `[src: real_services; reviews[2] lighting; reviews[1] Bel domestic; based_location Bristol]` - **FAIL** (Bristol + the service range)
- LT - **Lighting and downlights**: **Downlights, feature and outdoor lighting, switches and dimmers, set out and fitted to a high standard.** `[src: reviews[2] Emily lighting; reviews[0] Marc bathroom downlights, garden light, hallway switch]` - **FAIL**
- CU - **Consumer units and fuse boards**: **Outdated boards replaced and brought up to current standard, sorted before any work that depends on it.** `[src: reviews[0] Marc consumer unit replaced before other work; photos[] 01 finished board]` - **FAIL**
- RW - **Rewires and new circuits**: **New sockets, outdoor power and added circuits, through to full and partial rewires, done neatly.** `[src: reviews[0] Marc outdoor socket; reviews[1] Bel unusual/complicated job; photos[] sockets, earthing]` - **FAIL**
- FF - **Fault-finding and repairs**: **Dodgy or intermittent electrics traced, explained, and put right, with recommendations where they help.** `[src: reviews[4] Megan "sorting out our dodgy electrics ... happy to offer his recommendations"; photos[] 04 tester]` - **FAIL**

## Gallery
- Heading: **Recent work around Bristol** `[src: based_location Bristol; photos[]]` - PASS (generic gallery heading shape)
- Intro: **A few finished jobs and the kit Lawrence works with, from consumer units to outdoor power.** `[src: contact_name Lawrence; photos[] consumer unit, outdoor spur, tester, van]` - **FAIL** (names Lawrence, specific photo subjects)
- Captions (safe, no invented locations/names):
  - 01: **Completed consumer unit, Bristol** `[src: photos[0] 01-places completed_project]`
  - 10: **Lawrence and the van, kitted for the job** `[src: photos 10-places; contact_name Lawrence]` - **FAIL**
  - 08: **Outdoor switched spur, Bristol** `[src: photos 08-places]`
  - 04: **Testing a finished circuit, Bristol** `[src: photos 04-places multifunction tester]`
  - 05: **Earth bonding, Bristol** `[src: photos 05-places]`
  - 06: **External earthing, Bristol** `[src: photos 06-places]`

## Reviews
- Heading: **What Bristol homeowners say about Lawrence** `[src: contact_name Lawrence; reviews[]; based_location Bristol]` - **FAIL** (names Lawrence + Bristol)
- Stat line: **5.0 Google rating, 135 reviews** `[src: google_rating, google_review_count sourced]` - PASS (a rating line shape)
- Review 1 (Bel) - verbatim, em dash removed: **"Lawrence is consistently brilliant. Not only is his work impeccable but he is a pleasure to have around. He also stays across industry innovation and development so he is always able to offer the latest solutions instead of using the same old stuff. He worked across our unusual and complicated job with good humour and advised us so well, so everything works perfectly. We will continue to use him and would recommend him without hesitation for all domestic and commercial jobs."** - attr **Bel, Google review** `[src: reviews[1]]` - **FAIL** (verbatim review)
- Review 2 (Emily): **"Lawrence did a fantastic job fitting some lights for us. He was easy to communicate with and was flexible when working around some other work that was being done in the space. Lawrence was very thorough and explained everything to us as he was doing it. The work he did was exactly as we asked and done to a really high quality. Such a friendly, positive person."** - attr **Emily, Google review** `[src: reviews[2]]` - **FAIL**
- Review 3 (Marc) - verbatim, em dash removed: **"Had a great experience with Electrical Solutions Bristol. Lawrence was brilliant, punctual, friendly, and really easy to communicate with. We originally asked him to quote for a few bits around the house. While he was there, he noticed our consumer unit was outdated and explained that it needed replacing before the other work could be done. He was clear and honest about everything, gave us a quote, and came back to do the work quickly and on time. He kept us updated throughout so there were no surprises."** - attr **Marc, Google review** `[src: reviews[0]]` - **FAIL**
- Review 4 (Megan): **"Lawrence did a fantastic job sorting out our dodgy electrics in our study. He was very patient with my lack of pre planning of what I wanted and was happy to offer his recommendations. His work is of a very high standard and he is impeccably tidy. Highly recommend and would absolutely use again."** - attr **Megan, Google review** `[src: reviews[4]]` - **FAIL**
- Reviews link: **Read all reviews on Google** `[src: google_maps_url]` - PASS (generic link)

## Process
- Eyebrow: **How a job works with Lawrence** `[src: contact_name Lawrence; reviews[3] Matthieu plan then quote; reviews[0] Marc]` - **FAIL** (names Lawrence)
- 01 **A look at the job** - **Lawrence comes out, looks at what you want and talks through the options before anything is quoted.** `[src: reviews[3] Matthieu "attended to discuss options and the general plan"]` - **FAIL**
- 02 **A clear quote** - **You get a quote that details the work to be done, so you know what is happening and what it costs.** `[src: reviews[3] Matthieu "promptly received a quote, which clearly detailed work to be undertaken"; reviews[0] Marc gave us a quote]` - **FAIL**
- 03 **Safety first, then the work** - **Anything the rest depends on, like an old consumer unit, is sorted first; then the work is done to standard and you are kept updated.** `[src: reviews[0] Marc consumer unit first, "kept us updated throughout so there were no surprises"]` - **FAIL**
- 04 **Finished and left tidy** - **The work is tested, checked it does exactly what you asked, and the space is left impeccably tidy.** `[src: reviews[2] Emily "exactly as we asked"; reviews[4] Megan "impeccably tidy"; photos[] 04 tester]` - **FAIL**

## Areas + hours
- Heading: **Where Lawrence works** `[src: contact_name Lawrence; based_location]` - **FAIL** (names Lawrence)
- Framing: **Based in Downend, Bristol BS16, Lawrence covers the city and the surrounding BS postcodes, from Fishponds and Kingswood across to Clifton and the centre.** `[src: based_location "Bristol, BS16"; address Bromley Heath/Downend; service_area chips Fishponds/Kingswood/Clifton used as plausible BS-district derivations, not raw chips]` - **FAIL** (BS16 Downend + named districts)
- District list (derived from BS16 geography, plausible one-van radius): **Downend · Bromley Heath · Fishponds · Staple Hill · Kingswood · Mangotsfield · Frenchay · Emersons Green · Redfield · St George · Clifton · Bristol city centre** `[src: based_location BS16; service_area chips + BS16-geography derivation]` - **FAIL**
- Hours line: **Monday to Friday, 9am to 5pm.** `[src: opening_hours Mon-Fri 9:00-17:00, Sat-Sun Closed]` - PASS (an hours line shape; the hours themselves are sourced)

## Quote
- Eyebrow: **Get in touch** - PASS (generic)
- Heading: **Get a quote for your electrical job** `[src: page_single_job; sticky_cta]` - PASS (a quote-section heading shape)
- Lead: **Tell Lawrence what you are after, the lighting, a rewire, a board upgrade or a fault, and roughly when, and he will come back with a price. Photos of the space help if you have them.** `[src: contact_name Lawrence; real_services; reviews[3] Matthieu quote process]` - **FAIL** (names Lawrence + the service list)
- Details: Call **07716 418405** `[src: brief.phone]` · Based **Downend, Bristol BS16** `[src: based_location]` · Hours **Monday to Friday, 9am to 5pm** `[src: opening_hours]` - **FAIL** (specific phone + BS16)
- Form labels: Your name / Phone number / Email (optional) / Postcode (e.g. BS16) / Job type [Lighting design, Rewire, Consumer unit, Fault-finding, Other] / Details - PASS (form is generic, job-type options are electrician-specific per assignment)
- Form submit: **Send job details** `[src: contact form rule - says what it does]` - PASS
- Form success: **Thanks, your job details are ready to send to Lawrence.** `[src: contact_name Lawrence]` - **FAIL** (names Lawrence)

## Footer
- Brand: **Electrical Solutions Bristol** `[src: business_name]` - **FAIL**
- Strap: **Domestic electrics, lighting and rewires across Bristol.** `[src: real_services; based_location]` - **FAIL** (the service mix + Bristol)
- Phone: **07716 418405** `[src: brief.phone]` - **FAIL**
- Areas list (footer): Downend · Fishponds · Kingswood · Staple Hill · Clifton · Bristol centre `[src: areas derivation]` - **FAIL**
- Hours: **Monday to Friday, 9am to 5pm** `[src: opening_hours]` - PASS
- Site links: Work / Reviews / Areas / Get a quote / Read our Google reviews - PASS
- Credit: **Website by WebForTrades** - PASS (agency credit, intentionally generic)

---

## Swap-test tally

Counting distinct copy blocks above (each bullet that carries copy = 1 block):

PASS (generic, could be swapped): Header nav, Header button, Hero CTA primary, Hero proof chip,
Gallery heading, Reviews stat line, Reviews link, Areas hours line, Quote eyebrow, Quote heading,
Quote form labels, Quote form submit, Footer hours, Footer site links, Footer credit = **15 PASS**

FAIL (lead-specific, good): Wordmark, Hero eyebrow, Hero headline, Hero sub-head, Hero CTA secondary,
Marquee, Standard eyebrow, Standard item1 head, Standard item1 body, Standard item2 head, Standard
item2 body, Standard item3 head, Standard item3 body, Services heading, Services intro, LT, CU, RW,
FF, Gallery intro, Gallery caption "Lawrence and the van", Reviews heading, Review 1, Review 2,
Review 3, Review 4, Process eyebrow, Process 01, Process 02, Process 03, Process 04, Areas heading,
Areas framing, Areas district list, Quote lead, Quote details, Quote form success, Footer brand,
Footer strap, Footer phone, Footer areas = **41 FAIL**

Total blocks = 56. PASS = 15 / 56 = **26.8% PASS**. Hard floor is < 30% PASS. **26.8% < 30% - PASS.**

(The five verbatim reviews are correctly FAIL - they name Lawrence and describe this trader's specific
jobs. The PASS blocks are genuinely generic shapes - nav, CTAs, form scaffolding, agency credit - that
no amount of authoring would make lead-specific without contrivance.)
