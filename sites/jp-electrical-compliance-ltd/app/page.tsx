import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

const PHONE = "07803 541347";
const PHONE_TEL = "07803541347";
const GOOGLE_URL = "https://maps.google.com/?cid=16513911354490674125";

const services = [
  { mark: "ET", name: "EICR and electrical testing", desc: "Periodic inspection and testing of an installation, with a report you can hand to a letting agent, a buyer or your insurer." },
  { mark: "CU", name: "Consumer unit upgrades", desc: "Old fuse boards swapped for a modern, RCD-protected unit, every circuit labelled and recorded." },
  { mark: "EV", name: "EV charger installation", desc: "Home and workplace EV chargers wired in and certified, with the relevant paperwork provided on completion." },
  { mark: "RW", name: "Rewires and new circuits", desc: "New circuits, lighting, sockets and full or partial rewires, including media-wall and room electrics." },
  { mark: "FF", name: "Fault-finding and repairs", desc: "Tracing and fixing electrical faults, sorted quickly rather than by guesswork." },
];

// Hero is 02 (a labelled, certified consumer unit with a visible inspection record and dated
// board - finished, well-lit, no people, no clutter, and it IS the compliance/EICR angle). The
// gallery is the remaining strong finished shots. 09 (WIP, tools on the ground), 10 (mid-
// replacement with drill/light/step-stool) and 07 (floor clutter) are excluded per the
// site-design skill (no WIP / detail / clutter).
const gallery = [
  { src: "/assets/images/04-places.webp", cap: "Recessed lighting and sockets, Bristol" },
  { src: "/assets/images/05-places.webp", cap: "EV charger install, Bristol" },
  { src: "/assets/images/06-places.webp", cap: "EV charger install, Bristol" },
  { src: "/assets/images/01-places.webp", cap: "Consumer unit, Bristol" },
  { src: "/assets/images/08-places.webp", cap: "Control panel wiring, Bristol" },
];

const stats = [
  { num: "5.0", label: "Google rating" },
  { num: "21", label: "Google reviews" },
  { num: "7 days", label: "Reachable, incl. emergencies" },
];

const districts = [
  "Easton", "Whitehall", "Redfield", "St George", "Barton Hill", "Eastville",
  "Fishponds", "Kingswood", "Bedminster", "Clifton", "Bishopston", "Brislington",
];

const marquee = [
  "5.0 on Google", "21 five-star reviews", "Bristol BS5", "EICRs done within a week",
  "Certificates handed over", "Pier and Jack on every job",
];

const reviews = [
  {
    text: `Fantastic job by the boys Pier & Jack fitting my EV charger. Excellent service with very reasonable pricing. Job completed quickly and efficiently with all the relevant certs provided. Would 100% recommend. Thanks chaps`,
    by: "Craig, Google review",
  },
  {
    text: `Brilliant service! EICR booked & done within a week. Jack & Pierre absolutely sound chaps. Another 5* review fully deserved! Thanks guys :)`,
    by: "Sandi, Google review",
  },
  {
    text: `I would highly recommend Pier from JP Electrical & Compliance Ltd for their outstanding service and professionalism. They carried out all the electrics for my media wall, as well as installing lights and sockets in the front and dining rooms, and the quality of their work was excellent throughout. They were punctual, well-organised, and clearly experienced in what they do.`,
    by: "Dan, Google review",
  },
  {
    text: `Jack and Pier were brilliant. They sorted the problem quickly and were very polite. I will definitely come back again.`,
    by: "Poppy, Google review",
  },
];

const process = [
  { n: "01", title: "Tell us the job", body: "Call or message Pier with what you need, whether that is an inspection, a board, an EV charger or a fault." },
  { n: "02", title: "We come and look", body: "We assess the work in person and give you a clear price before anything starts." },
  { n: "03", title: "Done to standard", body: "The work is carried out and tested properly, at the right pace rather than rushed." },
  { n: "04", title: "Certified and left tidy", body: "You get the relevant certificates and a board that is labelled, and the space is left clean." },
];

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="wordmark">JP Electrical &amp; Compliance</a>
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
        {/* HERO */}
        <section className="hero" data-section-id="hero">
          <div className="hero-media">
            <img src="/assets/images/02-places.webp" alt="Labelled, certified consumer unit installed by JP Electrical and Compliance, Bristol" loading="eager" />
          </div>
          <div className="hero-scrim" />
          <div className="container hero-inner">
            <p className="eyebrow">Electricians, Bristol BS5</p>
            <h1>Bristol electrical work, tested, signed off and certified.</h1>
            <p className="hero-sub">
              JP Electrical &amp; Compliance covers EICRs, consumer units, EV chargers and rewires across Bristol, with the relevant certificates handed over when the job is done.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#quote">Get a quote</a>
              <a className="btn btn-secondary" href={`tel:${PHONE_TEL}`} style={{ color: "#fff", borderColor: "#fff" }}>Call Pier, {PHONE}</a>
            </div>
            <p className="hero-proof"><span className="accent-text">5.0</span> on Google, 21 reviews</p>
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

        {/* THE DIFFERENCE (signature) - content rows, stats inline */}
        <section className="section difference" data-section-id="the-difference">
          <div className="container">
            <p className="eyebrow" data-reveal>What JP Electrical is known for</p>
            <div className="difference-item" data-reveal>
              <h3>The certificate, not just the wiring.</h3>
              <p>An EICR booked and done inside a week, an EV charger fitted with all the relevant certificates provided: the paperwork that proves the work is right is part of the job, not an afterthought.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3><span className="accent-text">Boards done properly</span> and labelled.</h3>
              <p>Consumer units fitted neatly, every circuit labelled and the inspection record filled in, so anyone who opens the board later can read exactly what was done.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>Two electricians, finished on time and left tidy.</h3>
              <p>You deal with Pier and Jack, not a different crew each visit. Work is completed when it was promised and the space is left clean.</p>
            </div>
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

        {/* SERVICES */}
        <section className="section" data-section-id="services">
          <div className="container">
            <h2 data-reveal>What JP Electrical does</h2>
            <p className="section-intro" data-reveal>Domestic and small commercial electrical work across Bristol, from a single inspection to a full rewire.</p>
            <div style={{ marginTop: "1.5rem" }}>
              {services.map((s) => (
                <div className="service-row" key={s.mark} data-reveal>
                  <div className="service-mark">{s.mark}</div>
                  <div>
                    <div className="service-name">{s.name}</div>
                    <p className="service-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM - owner note, first person */}
        <section className="section team" data-section-id="team">
          <div className="container">
            <p className="eyebrow" data-reveal>Who you deal with</p>
            <h2 data-reveal>Pier and Jack</h2>
            <p data-reveal>
              We are Pier and Jack, the two electricians behind JP Electrical &amp; Compliance. We turn up when we say, do the work to standard, test it and hand over the certificates, and we leave the place clean. Most of our work across Bristol comes from people we have worked for before, and their neighbours.
            </p>
          </div>
        </section>

        {/* GALLERY */}
        <section className="section" data-section-id="gallery" id="work">
          <div className="container">
            <h2 data-reveal>Recent work around Bristol</h2>
            <p className="section-intro" data-reveal>A selection of finished consumer units, EV chargers and installation work from around Bristol.</p>
            <div className="gallery-masonry" style={{ marginTop: "1.5rem" }}>
              {gallery.map((g) => (
                <figure className="gallery-item" key={g.src}>
                  <img src={g.src} alt={g.cap} loading="lazy" />
                  <figcaption className="gallery-cap">{g.cap}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="section reviews" data-section-id="reviews" id="reviews">
          <div className="container">
            <h2 data-reveal>What Bristol customers say about JP Electrical</h2>
            <p className="review-stat" data-reveal><span>5.0</span> Google rating, 21 reviews</p>
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
            <p className="eyebrow" data-reveal>How a job works with JP Electrical</p>
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

        {/* AREAS + HOURS */}
        <section className="section" data-section-id="areas" id="areas">
          <div className="container">
            <h2 data-reveal>Where JP Electrical works</h2>
            <div className="areas-grid" style={{ marginTop: "1.5rem" }}>
              <div className="map-embed" data-reveal>
                <iframe
                  src="https://maps.google.com/maps?q=Bristol%20BS5&output=embed&z=12"
                  title="Map showing Bristol BS5"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div data-reveal>
                <p>Based in BS5, JP Electrical covers Easton, Whitehall and the surrounding Bristol postcodes, out to St George, Fishponds, Bedminster and Clifton.</p>
                <ul className="areas-districts">
                  {districts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="hours">Reachable seven days a week, including emergencies.</p>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE - two column, dark navy ink */}
        <section className="section quote" data-section-id="quote" id="quote">
          <div className="container">
            <div className="quote-grid">
              <div className="quote-aside" data-reveal>
                <p className="eyebrow">Get in touch</p>
                <h2>Get a quote from JP Electrical</h2>
                <p className="quote-lead">
                  Tell us about the job, the property, what you need and roughly when, and we will come back to you with a price. If it is an EICR or a let, say so and we will sort the report.
                </p>
                <dl className="quote-details">
                  <div><dt>Call</dt><dd><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></dd></div>
                  <div><dt>Based</dt><dd>Bristol, BS5</dd></div>
                  <div><dt>Hours</dt><dd>Seven days, including emergencies</dd></div>
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
              <div className="footer-brand">JP Electrical &amp; Compliance</div>
              <p style={{ marginTop: "0.5rem", maxWidth: "36ch" }}>Electrical inspection, consumer units, EV chargers and rewires across Bristol.</p>
              <p style={{ marginTop: "0.5rem" }}><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></p>
            </div>
            <div>
              <h4>Areas</h4>
              <ul className="footer-links">
                <li>Easton</li>
                <li>Whitehall</li>
                <li>St George</li>
                <li>Fishponds</li>
                <li>Bedminster</li>
                <li>Clifton</li>
              </ul>
              <h4 style={{ marginTop: "1.25rem" }}>Hours</h4>
              <p style={{ margin: 0 }}>Seven days, including emergencies</p>
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
