import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

const PHONE = "07824 566582";
const PHONE_TEL = "07824566582";
const GOOGLE_URL = "https://maps.google.com/?cid=654358521196426038";

const services = [
  { name: "Additional sockets and lighting", desc: "Extra sockets added where you need them and tired light fittings updated, the bread and butter of bringing an older home up to date." },
  { name: "Electric fires and storage heaters", desc: "Electric fires fitted and connected on a fused spur with the fuel effect set up, and storage heaters removed and replaced." },
  { name: "EV and car charger installation", desc: "A home car charger fitted and wired in, added as part of an upgrade or on its own." },
  { name: "Extra circuits and power to outbuildings", desc: "New circuits run safely where you need them, including power out to a garage, workshop or outbuilding." },
];

// Recent-work gallery section is GATED OUT: only ONE usable finished photo exists
// (02-places.webp, the completed living-room media wall + electric fire; 01 is
// work-in-progress and 03 is the brand logo, both excluded per the site-design skill).
// A 1-photo grid is banned, so there is no gallery section. That single strong photo is
// reused once as the hero supporting image (desktop: right of the hero copy; mobile:
// below the headline) - see the hero section.

const stats = [
  { num: "5.0", label: "Google rating" },
  { num: "27", label: "Google reviews" },
  { num: "Naz & Henry", label: "Your two-man team" },
];

const districts = [
  "Cyncoed", "Llanishen", "Lisvane", "Heath", "Birchgrove", "Roath", "Penylan",
  "Whitchurch", "Rhiwbina", "Thornhill", "Pontprennau", "Pentwyn", "Llanedeyrn", "Cardiff city centre",
];

const marquee = [
  "5.0 on Google", "27 local reviews", "Cardiff, CF23", "Older homes brought up to standard",
  "Explained as we go", "EV chargers fitted",
];

const reviews = [
  {
    text: `I recently purchased an older property that needed a fair bit of electrical work - including installing additional sockets, updating light fittings, and adding a car charger. From start to finish, Naz and Henry were absolutely fantastic. Communication with Naz via WhatsApp was seamless; he always responded promptly and helpfully. Henry handled much of the installation work and was consistently friendly, professional, and efficient. We're really pleased with the end results - everything looks great and works perfectly.`,
    by: "Molly, Google review",
  },
  {
    text: `Naz & Co. from Amrock installed my new electrical fire and connected it to a Fused spur through the wall. Excellent work carried out and their rates were VERY affordable. They even setup the fuel effect. 5* service at great prices, Highly recommend.`,
    by: "Simon, Google review",
  },
  {
    text: `5* service from Naz and team. Not only with the removal and fitting of a new storage heater, but also acting as intermediary between us (tenants) and landlord. Excellent communication throughout and a quick resolution. Would highly recommend.`,
    by: "Rhys, Google review",
  },
  {
    text: `I recently hired Naz from Amrock to run power to an outbuilding on my property, and I couldn't be happier with the results. He showed up on time, explained everything clearly, and made sure the job was done safely and up to regulations. The quality of the work was excellent - clean, efficient, and exactly what I needed.`,
    by: "Faye, Google review",
  },
];

const process = [
  { n: "01", title: "Get in touch", body: "Message or call Naz with what you need doing. He is quick to come back to you and easy to talk to." },
  { n: "02", title: "A look and a clear price", body: "Naz comes out, looks at the job in your home, and gives you a straight price before anything starts." },
  { n: "03", title: "Done the right way, kept informed", body: "The work is carried out safely and properly, and you are kept in the loop while it happens." },
  { n: "04", title: "Tested, tidied and explained", body: "It is left working, the space cleared up, and Naz talks you through what was done." },
];

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="brand-lockup" aria-label="Amrock Electrical, home">
            <img className="brand-logo" src="/logo.png" alt="Amrock Electrical" width={962} height={412} />
          </a>
          <nav className="nav-desktop" aria-label="Primary">
            <a className="nav-link" href="#services">Services</a>
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
        <a href="#services">Services</a>
        <a href="#reviews">Reviews</a>
        <a href="#areas">Areas</a>
        <a href="#quote">Get a quote</a>
      </nav>

      <main id="top">
        {/* HERO - typographic, no photo (deliberate decision; see build-notes) */}
        <section className="hero" data-section-id="hero">
          <div className="hero-media" aria-hidden="true" />
          <div className="hero-scrim" aria-hidden="true" />
          <div className="container hero-inner">
            <div className="hero-layout">
              <div className="hero-copy">
                <p className="eyebrow">Electricians, Cardiff CF23</p>
                <div className="hero-rule" aria-hidden="true" />
                <h1>Electricians for Cardiff&apos;s older homes, brought up to standard.</h1>
                <p className="hero-sub">
                  Naz and Henry add sockets, update tired light fittings, and fit storage heaters and electric fires across Cardiff, plus EV chargers, explaining the work as they go.
                </p>
                <div className="hero-cta">
                  <a className="btn btn-primary" href="#quote">Get a quote</a>
                  <a className="btn btn-secondary" href={`tel:${PHONE_TEL}`}>Call Naz, {PHONE}</a>
                </div>
                <p className="hero-proof"><span className="accent-text">5.0</span> on Google · 27 reviews</p>
              </div>
              <figure className="hero-photo">
                <img src="/assets/images/02-places.webp" alt="Completed living-room install in Cardiff: a new electric fire and media wall, wired in" loading="eager" width={400} height={300} />
                <figcaption>Completed living-room install, Cardiff</figcaption>
              </figure>
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

        {/* THE DIFFERENCE (signature) - content rows, stats inline */}
        <section className="section difference" data-section-id="the-difference">
          <div className="container">
            <p className="eyebrow" data-reveal>What Amrock is known for</p>
            <div className="difference-item" data-reveal>
              <h3>Older homes, brought up to standard.</h3>
              <p>Extra sockets where you actually need them, tired light fittings updated, and the small upgrades that make an older Cardiff house work the way it should.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>Storage heaters and electric fires, fitted and connected.</h3>
              <p>From swapping a storage heater to fitting an electric fire on a fused spur and setting up the fuel effect, the heating jobs in an older home, done properly.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3><span className="accent-text">Explained as we go</span>, left tidy.</h3>
              <p>Naz keeps you in the loop from the first message, and the work is done safely, the right way, and the place left clean.</p>
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
        <section className="section" data-section-id="services" id="services">
          <div className="container">
            <h2 data-reveal>What Amrock does</h2>
            <p className="section-intro" data-reveal>Domestic electrical work for Cardiff homes, from a single socket to a full upgrade.</p>
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

        {/* REVIEWS */}
        <section className="section reviews" data-section-id="reviews" id="reviews">
          <div className="container">
            <h2 data-reveal>What Cardiff homeowners say about Amrock</h2>
            <p className="review-stat" data-reveal><span>5.0</span> Google rating, 27 reviews</p>
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
            <p className="eyebrow" data-reveal>How a job works with Amrock</p>
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

        {/* AREAS */}
        <section className="section" data-section-id="areas" id="areas">
          <div className="container">
            <h2 data-reveal>Where Amrock works</h2>
            <div className="areas-grid" style={{ marginTop: "1.5rem" }}>
              <div className="map-embed" data-reveal>
                <iframe
                  src="https://maps.google.com/maps?q=Cardiff%20CF23&output=embed&z=12"
                  title="Map showing Cardiff CF23"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div data-reveal>
                <p>Based in Cardiff, CF23, Naz and Henry cover the city and the surrounding CF postcodes, from Cyncoed and Llanishen across to Roath, Penylan and Whitchurch.</p>
                <ul className="areas-districts">
                  {districts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="hours">Most days, including evenings by arrangement.</p>
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
                <h2>Get a quote for your electrical work</h2>
                <p className="quote-lead">
                  Tell Naz about the job - the property, what you need doing and roughly when - and he&apos;ll come back to you with a price. A few photos help if you have them.
                </p>
                <dl className="quote-details">
                  <div><dt>Call</dt><dd><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></dd></div>
                  <div><dt>Based</dt><dd>Cardiff, CF23</dd></div>
                  <div><dt>Covers</dt><dd>Cardiff and the CF postcodes</dd></div>
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
              <div className="footer-brand"><img className="footer-logo" src="/logo.png" alt="Amrock Electrical" width={962} height={412} /></div>
              <p style={{ marginTop: "0.75rem", maxWidth: "34ch" }}>Domestic electrical work across Cardiff and the CF postcodes.</p>
              <p style={{ marginTop: "0.5rem" }}><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></p>
            </div>
            <div>
              <h4>Areas</h4>
              <ul className="footer-links">
                <li>Cyncoed</li>
                <li>Llanishen</li>
                <li>Roath</li>
                <li>Penylan</li>
                <li>Whitchurch</li>
                <li>Rhiwbina</li>
              </ul>
            </div>
            <div>
              <h4>Site</h4>
              <ul className="footer-links">
                <li><a href="#services">Services</a></li>
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
