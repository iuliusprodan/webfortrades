# Build notes - D.G. Decorating Services (Path B)

## Hero image choice
**Chosen: `05-places.webp`** (1200x1600 portrait). A hallway of freshly painted smooth white panel
doors and crisp white trim against a calm soft blue-grey wall, on a warm wood floor. Well lit, finished,
no people, minimal clutter. It is the distinctive angle (prep-led flawlessly smooth finishes; old doors
and woodwork brought back to look like new) made literally visible, and its calm light palette matches the
"chalk white + soft eucalyptus-grey + pale oak" seed almost exactly. Portrait crops cleanly into the
full-bleed hero via `object-fit: cover` (skill allows a stronger portrait completed shot over a weaker
landscape one); confirmed at screenshot verification.

Considered and not used as hero:
- 06 (kitchen/diner, landscape, finished): strong, used in gallery; has an appliance (fridge), less on-angle.
- 04 (dining feature wall, portrait): finished but busier with furniture; gallery.
- 01 (living room, dark teal chimney breast, landscape): finished but some cables/clutter near the hearth; gallery.
- 09 (teal feature wall, empty room), 10 (botanical feature wall, pale-oak floor): finished feature walls; gallery.
- 03 (money-print wallpaper, sofas in frame): weaker/cluttered; placed last in gallery.

Excluded entirely (not finished interior decorating proof):
- 02 (house exterior / brickwork + painted door): exterior, not the evidenced interior service.
- 07 (commercial reception desk, blurry): commercial setting, not a home, low quality.
- 08 (a person standing by a Wagner paint-shop sprayer demo in a store): a promo/WIP shot with a person, not a finished room.
- Facebook thumbnails (315px): too low-res for hero/gallery per the skill (LOW_RES_FACEBOOK_ONLY). The
  verified Facebook page is used only as a multi-source corroboration signal, never as a media source.

## Owner first-name usage ("Dan")
Approved. `brief.json` has `contact_name: "Dan"`, `contact_name_usage_allowed: true`,
`contact_name_evidence_count: 2`. Dan is named in two review bodies (Lynn: "the work that Dan has done";
simon: "Dan prepares well before decorating") and "D" is the initial in the business name "D.G.
Decorating services". The skill permits a first name when named in the business name or in >=2 review
bodies; both hold. Surname is unknown, so only "Dan" is used, never an invented surname.

## Source quality / multi-source note
`source-quality.json` reads FAIL with reason "Email present but email-domain website discovery not
completed". The email is a gmail.com address, so there is no business domain to discover - this is a
mechanical gate, not an evidence gap. The real signal is the opposite: the Facebook page
(http://www.facebook.com/dgdecoratingservices) is VERIFIED high-confidence (phone match, name match,
public email visible), giving a genuine second independent source. This lead is multi-source
(Google + verified Facebook), corroborated stronger than a Google-only lead. The page never names the
Facebook page (that would be banned meta-provenance). This is a BUILD run; pitch_gate enforces at
outreach time.

## Palette + fonts (distinctness)
"Chalk & Eucalyptus": --ink #2C3230, --surface #F7F8F5, --stone #E9EDE7, --line #D2D9CF,
--accent #7E9A86 (soft greyed eucalyptus), --accent-deep #5E7766, --oak #C9A87C, --muted #69716B.
Fonts: Schibsted Grotesk (display) + Mulish (body). Deliberately not Kyle's (#1B2420 + #0F6E5C;
Bricolage + Instrument), not Damo's (#22201C + #A96B23; Oswald + Hanken), not any library pairing, and
kept light/clean (cool chalk white + grotesque + soft grey-green) so it does not read as the warm-cream
AI cluster, and anchored away from the two parallel painter builds (heritage-sage+pewter; aubergine+brass).


## Deploy verification (2026-06-13)
- Preferred alias: d-g-decorating-services.vercel.app
- Deployment URL: https://d-g-decorating-services-8hap11vne-iulius-projects-0cb33a7b.vercel.app
- Verified URL: https://d-g-decorating-services.vercel.app
- Alias status: VERIFIED
- Deploy manifest: `/Users/iuliusprodan/.cursor/website/briefs/d-g-decorating-services/deploy.json`
- Marker found: yes
- Business name verified: yes
- Phone verified: yes
