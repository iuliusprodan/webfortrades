import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

const PHONE = "07936 498907";
const PHONE_TEL = "07936498907";
const GOOGLE_URL = "https://maps.google.com/?cid=10338716508790624105";

const services = [
  { name: "Full and partial re-wires", desc: "Whole-house and single-circuit re-wires, taken on start to finish and left tested." },
  { name: "Consumer unit replacement", desc: "Old, failing or burnt-out fuse boards swapped for a modern consumer unit with proper circuit protection." },
  { name: "Fault-finding and repairs", desc: "Tracing the cause of a tripping circuit, dead socket or burnt connection and putting it right." },
  { name: "Installations and additions", desc: "New circuits, sockets, lighting and other electrical work added in and tested before we leave." },
  { name: "Call-outs across Sheffield", desc: "Quick to answer when something goes wrong, with a straight price before any work starts." },
];

// HERO is typographic (no image): none of the 6 Google Places photos is a usable finished-work
// hero (they are the AI navy+red logo, plus close-up work-in-progress / fault shots of old and
// burnt-out consumer units). The "Recent work" gallery was REMOVED (2026-06-13): it failed the
// Fix B gate (repair / fault shots, no clean finished-work photo). All board shots show burnt
// busbars, charred wiring or bare masonry; none reads as a finished-unit showcase, so NO photo is
// inlined anywhere. The strong typographic hero carries the page.

const stats = [
  { num: "5.0", label: "Google rating" },
  { num: "20", label: "Google reviews" },
  { num: "Sheffield", label: "and the S postcodes" },
];

const districts = [
  "Highfield", "Heeley", "Meersbrook", "Nether Edge", "Sharrow", "Woodseats", "Gleadless",
  "Norton", "Abbeydale", "Crookes", "Walkley", "Hillsborough", "Darnall", "Handsworth",
];

const marquee = [
  "5.0 on Google", "20 reviews", "Sheffield", "Full re-wires and board upgrades",
  "Tested and left safe", "Straight prices, quick to answer",
];

const reviews = [
  {
    text: `These guys came to do a full house re-wiring on a house of mine. Fantastic service from start to finish. They were efficient and very reasonably priced. I will definitely be using them again in the future. Highly recommend.`,
    by: "Andy, Google review",
  },
  {
    text: `I couldn't be happier with the service. He was punctual, professional and clearly very experienced. He explained everything clearly, completed the work efficiently and made sure everything was safe and working perfectly before leaving. It's such a relief to find a trustworthy electrician, I would definitely use his services again and highly recommend him.`,
    by: "Alina, Google review",
  },
  {
    text: `Had steel city out multiple times. Can't fault any of their work. Always punctual and tranparent. Would highly recommend to anyone looking to have some work carried out. Thanks again lads and best of luck.`,
    by: "Wakas, Google review",
  },
  {
    text: `Have had 2 jobs done and could not be happier with the service. Did not have to wait long for the jobs to be done and always got a quick response to my texts. Friendly and professional plus happy for a call back if anything was not quite right. As an older lady on my own, I felt safe at all times and the price quoted was very competitive. Can highly recommend.`,
    by: "Pat, Google review",
  },
];

const process = [
  { n: "01", title: "Get in touch, get a price", body: "Tell us what is going on. We come and look, and give you a straight price before any work starts." },
  { n: "02", title: "We do the work, explained as we go", body: "Re-wire, board replacement or fault, carried out properly and explained clearly so you know what is happening." },
  { n: "03", title: "Tested and left safe", body: "Nothing is signed off until it is tested, safe and working, and the place is left tidy." },
  { n: "04", title: "We come back if needed", body: "If anything is not quite right after we leave, we will come back and sort it." },
];

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="wordmark">Steel City Electrics</a>
          <nav className="nav-desktop" aria-label="Primary">
            <a className="nav-link" href="#work">Work</a>
            <a className="nav-link" href="#reviews">Reviews</a>
            <a className="nav-link" href="#areas">Areas</a>
            <a className="btn btn-primary" href="#quote">Get a quote</a>
          </nav>
          <button className="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      {/* Overlay nav + scrim live OUTSIDE <header> at body level (defensive against the
          fixed-element containing-block trap). */}
      <div id="nav-scrim" aria-hidden="true" />
      <nav id="nav-mobile" aria-label="Mobile">
        <button className="nav-close" type="button" aria-label="Close menu"><span aria-hidden="true">&times;</span></button>
        <a href="#work">Work</a>
        <a href="#reviews">Reviews</a>
        <a href="#areas">Areas</a>
        <a href="#quote">Get a quote</a>
      </nav>

      <main id="top">
        {/* HERO - typographic, no photo */}
        <section className="hero" data-section-id="hero">
          <div className="hero-field" />
          <div className="container hero-inner">
            <div className="hero-panel">
              <p className="eyebrow">Electricians, Sheffield S8</p>
              <h1>Sheffield electricians for full re-wires and old fuse boards, left tested and safe.</h1>
              <p className="hero-sub">
                Steel City take on full and partial re-wires, old or burnt-out fuse boards swapped for modern units, and electrical faults traced across Sheffield, with a straight price and a quick answer.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#quote">Get a quote</a>
                <a className="btn btn-secondary" href={`tel:${PHONE_TEL}`} style={{ color: "#fff", borderColor: "#fff" }}>Call Steel City, {PHONE}</a>
              </div>
              <p className="hero-proof"><span className="accent-text">5.0</span> on Google, 20 reviews</p>
            </div>
          </div>
        </section>

        {/* PROOF MARQUEE */}
        <section className="proof-strip" data-section-id="proof-strip" aria-label="Proof points">
          <div className="marquee" aria-hidden="false">
            <div className="marquee-track">
              {[...marquee, ...marquee].map((item, i) => (
                <span className="marquee-item" key={i}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT WE TAKE ON (signature) */}
        <section className="section takeon" data-section-id="what-we-take-on">
          <div className="container">
            <p className="eyebrow" data-reveal>What Steel City take on</p>
            <div className="takeon-item" data-reveal>
              <h3>The re-wire other electricians put off.</h3>
              <p>Full and partial house re-wires, taken on start to finish and priced straight, the heavy work that needs doing properly rather than patched.</p>
            </div>
            <div className="takeon-item" data-reveal>
              <h3>Old board out, modern unit in.</h3>
              <p>Tired or burnt-out fuse boards stripped out and replaced with a modern consumer unit, so the circuits are protected the way they should be.</p>
            </div>
            <div className="takeon-item" data-reveal>
              <h3><span className="accent-text">Tested</span>, then left safe and working.</h3>
              <p>Nothing is signed off until it is tested and working, and you get a call back if anything is not quite right after we leave.</p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="section" data-section-id="services" id="work">
          <div className="container">
            <h2 data-reveal>What we do</h2>
            <p className="section-intro" data-reveal>Real electrical work across Sheffield, from a single fault to a full re-wire.</p>
            <div style={{ marginTop: "1.5rem" }}>
              {services.map((s) => (
                <div className="service-row" key={s.name} data-reveal>
                  <span className="service-mark" aria-hidden="true" />
                  <div>
                    <div className="service-name">{s.name}</div>
                    <p className="service-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHO WE ARE (team, first-person) - stats inline */}
        <section className="section team" data-section-id="who-we-are">
          <div className="container">
            <p className="eyebrow" data-reveal>Who we are</p>
            <p className="team-lead" data-reveal>
              We are Steel City, a small electrical team working across Sheffield. We take on the heavy electrical work, full re-wires and old fuse boards as readily as a single fault, and we price it straight up front. We test what we do and leave it safe and working before we go, and we will come back if anything is not right.
            </p>
            <div className="stats-band" data-reveal>
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="section reviews" data-section-id="reviews" id="reviews">
          <div className="container">
            <h2 data-reveal>What Sheffield customers say</h2>
            <p className="review-stat" data-reveal><span>5.0</span> Google rating, 20 reviews</p>
            <div className="review-grid">
              {reviews.map((r) => (
                <blockquote className="review-card" key={r.by + r.text.slice(0, 12)} data-reveal>
                  <p className="review-quote">{`"${r.text}"`}</p>
                  <p className="review-attr">{r.by}</p>
                </blockquote>
              ))}
            </div>
            <a className="reviews-link" href={GOOGLE_URL} target="_blank" rel="noopener noreferrer">Read all reviews on Google</a>
          </div>
        </section>

        {/* PROCESS */}
        <section className="section process" data-section-id="process">
          <div className="container">
            <p className="eyebrow" data-reveal>How a job works</p>
            <div className="process-grid">
              {process.map((p) => (
                <div className="process-step" key={p.n} data-reveal>
                  <div className="process-num">{p.n}</div>
                  <div>
                    <div className="process-title">{p.title}</div>
                    <p className="process-body">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AREAS + AVAILABILITY */}
        <section className="section" data-section-id="areas" id="areas">
          <div className="container">
            <h2 data-reveal>Where we work</h2>
            <div className="areas-grid" style={{ marginTop: "1.5rem" }}>
              <div className="map-embed" data-reveal>
                <iframe
                  src="https://maps.google.com/maps?q=Sheffield%20S8&output=embed&z=12"
                  title="Map showing Sheffield S8"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div data-reveal>
                <p>Based in Sheffield, we cover the city and the surrounding S postcodes, from Highfield and Heeley out across Sheffield.</p>
                <ul className="areas-districts">
                  {districts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="availability">Quick to answer, with call-outs across Sheffield.</p>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE - two column, dark graphite */}
        <section className="section quote" data-section-id="quote" id="quote">
          <div className="container">
            <div className="quote-grid">
              <div className="quote-aside" data-reveal>
                <p className="eyebrow">Get in touch</p>
                <h2>Get a quote from Steel City</h2>
                <p className="quote-lead">
                  Tell us about the job, a re-wire, a board, a fault or something else, and roughly when, and we will come back to you with a straight price. Photos of the board or the problem help if you have them.
                </p>
                <dl className="quote-details">
                  <div><dt>Call</dt><dd><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></dd></div>
                  <div><dt>Covering</dt><dd>Sheffield and the S postcodes</dd></div>
                  <div><dt>Availability</dt><dd>Quick to answer</dd></div>
                </dl>
              </div>
              <div className="quote-formwrap" data-reveal>
                <QuoteForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">Steel City Electrics</div>
              <p style={{ marginTop: "0.5rem", maxWidth: "34ch" }}>Re-wires, consumer units and fault-finding across Sheffield.</p>
              <p style={{ marginTop: "0.5rem" }}><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></p>
            </div>
            <div>
              <h4>Areas</h4>
              <ul className="footer-links">
                <li>Highfield</li>
                <li>Heeley</li>
                <li>Nether Edge</li>
                <li>Woodseats</li>
                <li>Sharrow</li>
                <li>Crookes</li>
              </ul>
              <h4 style={{ marginTop: "1.25rem" }}>Availability</h4>
              <p style={{ margin: 0 }}>Quick to answer, call-outs across Sheffield</p>
            </div>
            <div>
              <h4>Site</h4>
              <ul className="footer-links">
                <li><a href="#work">Work</a></li>
                <li><a href="#reviews">Reviews</a></li>
                <li><a href="#areas">Areas</a></li>
                <li><a href="#quote">Get a quote</a></li>
                <li><a href={GOOGLE_URL} target="_blank" rel="noopener noreferrer">Read our Google reviews</a></li>
              </ul>
            </div>
          </div>
          <p className="footer-credit">
            Website by <a href="https://webfortradesuk.co.uk" target="_blank" rel="noopener noreferrer">WebForTrades</a>
          </p>
        </div>
      </footer>

      <div id="mobile-quote-bar" aria-hidden="true">
        <a className="btn btn-primary" href="#quote">Get a quote</a>
      </div>

      <SiteEnhancements />
    </>
  );
}
