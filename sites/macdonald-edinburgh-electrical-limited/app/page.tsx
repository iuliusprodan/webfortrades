import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

const PHONE = "07453 277434";
const PHONE_TEL = "07453277434";
const GOOGLE_URL = "https://maps.google.com/?cid=1855229081902958572";

const services = [
  { mark: "SB", name: "Solar panels and battery storage", desc: "Roof solar panels and home battery storage, installed and set up so the system suits how your house uses power." },
  { mark: "CU", name: "Consumer unit upgrades", desc: "Replacing an old fuse board with a modern consumer unit, fitted and labelled clearly." },
  { mark: "EV", name: "EV chargers and induction-hob wiring", desc: "New circuits for an EV charge point or an induction hob, including the extra sockets that go with them." },
  { mark: "EI", name: "Electrical installation and rewiring", desc: "Sockets, lighting and rewiring work around the home, done to the same tidy standard." },
];

// Hero is 08 (detached house with two completed roof solar arrays, blue sky, no
// people / no clutter) - the most on-angle finished-work shot, crops cleanly as a
// full-bleed landscape hero. Gallery is the remaining finished solar / battery /
// consumer-unit shots. The van-on-bridge shots (01/02), the selfie (09) and the
// duplicate battery (06) are excluded as gallery items per the site-design skill
// (non-showcase / selfie). Reason recorded in build-notes.md.
const gallery = [
  { src: "/assets/images/08-places.webp", cap: "Completed solar install, Midlothian" },
  { src: "/assets/images/05-places.webp", cap: "Solar panel install, Penicuik" },
  { src: "/assets/images/07-places.webp", cap: "Roof solar array, Midlothian" },
  { src: "/assets/images/03-places.webp", cap: "Battery and inverter install, Penicuik" },
  { src: "/assets/images/04-places.webp", cap: "Inverter and battery storage, Midlothian" },
  { src: "/assets/images/10-places.webp", cap: "New consumer unit, Penicuik" },
];

const stats = [
  { num: "4.9", label: "Google rating" },
  { num: "63", label: "Google reviews" },
  { num: "6 days", label: "Monday to Saturday" },
];

const districts = [
  "Penicuik", "Loanhead", "Roslin", "Bilston", "Bonnyrigg", "Lasswade",
  "Auchendinny", "Milton Bridge", "Gilmerton", "Liberton", "Straiton", "Fairmilehead",
];

const marquee = [
  "4.9 on Google", "63 local reviews", "Penicuik & south Edinburgh", "Solar and battery installs",
  "Tidy and neatly labelled", "Monday to Saturday",
];

const reviews = [
  {
    text: `David fitted our solar panels and batteries and throughout the whole process he was reliable and professional and arrived on our agreed start date. He explained what he was doing at every stage and I am delighted I chose his company to do the work. I recommend him 100%`,
    by: "Suzanne, Google review",
  },
  {
    text: `David MacDonald provided excellent service and quality of work from start to finish. He talked us through each step diligently from the original consultation to setting up the system once it was installed in a way that worked best for our usage and needs. His work standards are top quality, and I don't think he left a spec of dust anywhere which is refreshing. We're over the moon with our solar system.`,
    by: "Liam, Google review",
  },
  {
    text: `David and Ryan recently replaced our main consumer unit, as well as running wiring for additional sockets and induction hob. Couldn't be happier with their work - box and wiring all tidy and neatly labeled. Very honest and pleasant to deal with, and I'd highly recommend them to anyone.`,
    by: "Daniel, Google review",
  },
  {
    text: `Craig responded to my post very promptly and arranged a convenient appointment. On the day, David arrived on time and completed the job efficiently. Happy customer and absolutely satisfied with their excellent service. would not hesitate to recommend to friends and family!`,
    by: "Liliane, Google review",
  },
];

const process = [
  { n: "01", title: "Arrange a visit and a price", body: "Get in touch and David arranges a convenient time to come and look at the job, then comes back with a price." },
  { n: "02", title: "Plan it around your home", body: "For solar and battery, the system is planned around how your house uses power; for other work, what goes where is agreed before anything starts." },
  { n: "03", title: "Fitted and set up, explained as it goes", body: "The work is carried out on the agreed day and explained step by step, from first fix to switch-on." },
  { n: "04", title: "Left tidy and clearly labelled", body: "The consumer unit and wiring are labelled so they can be read later, and the work area is left clean." },
];

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="wordmark">Macdonald Edinburgh Electrical</a>
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
            <img src="/assets/images/08-places.webp" alt="Completed solar panel installation on a house by Macdonald Edinburgh Electrical, Midlothian" loading="eager" />
          </div>
          <div className="hero-scrim" />
          <div className="container hero-inner">
            <p className="eyebrow">Solar, battery and electrical, Penicuik &amp; south Edinburgh</p>
            <h1>Solar, battery storage and electrical work for homes across Penicuik and south Edinburgh.</h1>
            <p className="hero-sub">
              David fits solar panels and battery storage, upgrades consumer units and wires for induction hobs and EV chargers, finished tidy and neatly labelled. Rated 4.9 on Google.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#quote">Get a quote</a>
              <a className="btn btn-secondary" href={`tel:${PHONE_TEL}`} style={{ color: "#fff", borderColor: "#fff" }}>Call David, {PHONE}</a>
            </div>
            <p className="hero-proof"><span className="accent-text">4.9</span> on Google · 63 reviews</p>
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
            <p className="eyebrow" data-reveal>How David works</p>
            <div className="difference-item" data-reveal>
              <h3>Solar and battery, set up around how you use power.</h3>
              <p>David fits the panels and battery, then sets the system up around how your home actually uses electricity, and talks you through it from the first visit to switch-on.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>Consumer units and wiring left <span>tidy and neatly labelled</span>.</h3>
              <p>A new consumer unit, extra sockets or a hob circuit goes in clean, with the board and wiring clearly labelled so anyone can read it later. The work area is left as it was found.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>On the agreed day, explained as it goes.</h3>
              <p>You get a start date and David turns up on it. The job is explained step by step as it happens, so you know what is being done and why.</p>
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
            <h2 data-reveal>What David fits</h2>
            <p className="section-intro" data-reveal>Clean-energy and home electrical work, from a full solar and battery install to a single new circuit.</p>
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

        {/* GALLERY */}
        <section className="section" data-section-id="gallery" id="work">
          <div className="container">
            <h2 data-reveal>Recent installs</h2>
            <p className="section-intro" data-reveal>A selection of finished solar, battery and electrical work from around Penicuik and Midlothian.</p>
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
            <h2 data-reveal>What homeowners say about David</h2>
            <p className="review-stat" data-reveal><span>4.9</span> Google rating, 63 reviews</p>
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

        {/* AREAS + HOURS */}
        <section className="section" data-section-id="areas" id="areas">
          <div className="container">
            <h2 data-reveal>Where David works</h2>
            <div className="areas-grid" style={{ marginTop: "1.5rem" }}>
              <div className="map-embed" data-reveal>
                <iframe
                  src="https://maps.google.com/maps?q=Penicuik%20EH26&output=embed&z=12"
                  title="Map showing Penicuik EH26"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div data-reveal>
                <p>Based in Penicuik, David covers Midlothian and the south of Edinburgh, from Penicuik and Loanhead through to the southern Edinburgh suburbs.</p>
                <ul className="areas-districts">
                  {districts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="hours">Monday to Saturday, 9am to 5pm.</p>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE - two column, dark ink */}
        <section className="section quote" data-section-id="quote" id="quote">
          <div className="container">
            <div className="quote-grid">
              <div className="quote-aside" data-reveal>
                <p className="eyebrow">Get in touch</p>
                <h2>Get a quote for your solar, battery or electrical work</h2>
                <p className="quote-lead">
                  Tell David about the job - what you are after and roughly when - and he will come back to you with a price. If it is solar or a battery, a rough idea of your bills or roof helps; photos of a fuse board or the space help for other work.
                </p>
                <dl className="quote-details">
                  <div><dt>Call</dt><dd><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></dd></div>
                  <div><dt>Based</dt><dd>Penicuik, EH26</dd></div>
                  <div><dt>Hours</dt><dd>Monday to Saturday, 9am to 5pm</dd></div>
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
              <div className="footer-brand">Macdonald Edinburgh Electrical</div>
              <p style={{ marginTop: "0.5rem", maxWidth: "38ch" }}>Solar, battery storage and electrical work across Penicuik, Midlothian and south Edinburgh.</p>
              <p style={{ marginTop: "0.5rem" }}><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></p>
            </div>
            <div>
              <h4>Areas</h4>
              <ul className="footer-links">
                <li>Penicuik</li>
                <li>Loanhead</li>
                <li>Roslin</li>
                <li>Bonnyrigg</li>
                <li>Lasswade</li>
                <li>South Edinburgh</li>
              </ul>
              <h4 style={{ marginTop: "1.25rem" }}>Hours</h4>
              <p style={{ margin: 0 }}>Monday to Saturday, 9am to 5pm</p>
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
