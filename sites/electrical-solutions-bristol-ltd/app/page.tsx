import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

const PHONE = "07716 418405";
const PHONE_TEL = "07716418405";
const GOOGLE_URL = "https://maps.google.com/?cid=9346552790654223777";

const services = [
  { name: "Lighting and downlights", desc: "Downlights, feature and outdoor lighting, switches and dimmers, set out and fitted to a high standard." },
  { name: "Consumer units and fuse boards", desc: "Outdated boards replaced and brought up to current standard, sorted before any work that depends on it." },
  { name: "Rewires and new circuits", desc: "New sockets, outdoor power and added circuits, through to full and partial rewires, done neatly." },
  { name: "Fault-finding and repairs", desc: "Dodgy or intermittent electrics traced, explained, and put right, with recommendations where they help." },
];

// Hero now uses a copy|photo split. Hero photo is 10 (Lawrence at the kitted
// van, the personal brand: depth, natural light, sense of place) - removed from
// the gallery below to avoid showing the same image twice.
// Gallery keeps the strong finished-work shots: 01 (completed consumer unit),
// 08 (neat outdoor spur), 04 (testing a circuit), 05 + 06 (earthing/bonding).
// Excluded: 02 + 07 (work-in-progress on bare/peeling walls), 09 (workbench
// detail crop) and 10 (now the hero photo).
const HERO_PHOTO = { src: "/assets/images/10-places.webp", alt: "Lawrence of Electrical Solutions Bristol at his kitted-out van" };

const gallery = [
  { src: "/assets/images/01-places.webp", cap: "Completed consumer unit, Bristol" },
  { src: "/assets/images/08-places.webp", cap: "Outdoor switched spur, Bristol" },
  { src: "/assets/images/04-places.webp", cap: "Testing a finished circuit, Bristol" },
  { src: "/assets/images/05-places.webp", cap: "Earth bonding, Bristol" },
  { src: "/assets/images/06-places.webp", cap: "External earthing, Bristol" },
];

const districts = [
  "Downend", "Bromley Heath", "Fishponds", "Staple Hill", "Kingswood", "Mangotsfield",
  "Frenchay", "Emersons Green", "Redfield", "St George", "Clifton", "Bristol city centre",
];

const marquee = [
  "5.0 on Google", "135 reviews", "Bristol, BS16", "Lighting and downlights",
  "The latest solutions, not the same old kit", "Tidy, considered finish",
];

const reviews = [
  {
    text: `Lawrence is consistently brilliant. Not only is his work impeccable but he is a pleasure to have around. He also stays across industry innovation and development so he is always able to offer the latest solutions instead of using the same old stuff. He worked across our unusual and complicated job with good humour and advised us so well, so everything works perfectly. We will continue to use him and would recommend him without hesitation for all domestic and commercial jobs.`,
    by: "Bel, Google review",
  },
  {
    text: `Lawrence did a fantastic job fitting some lights for us. He was easy to communicate with and was flexible when working around some other work that was being done in the space. Lawrence was very thorough and explained everything to us as he was doing it. The work he did was exactly as we asked and done to a really high quality. Such a friendly, positive person.`,
    by: "Emily, Google review",
  },
  {
    text: `Had a great experience with Electrical Solutions Bristol. Lawrence was brilliant, punctual, friendly, and really easy to communicate with. We originally asked him to quote for a few bits around the house. While he was there, he noticed our consumer unit was outdated and explained that it needed replacing before the other work could be done. He was clear and honest about everything, gave us a quote, and came back to do the work quickly and on time. He kept us updated throughout so there were no surprises.`,
    by: "Marc, Google review",
  },
  {
    text: `Lawrence did a fantastic job sorting out our dodgy electrics in our study. He was very patient with my lack of pre planning of what I wanted and was happy to offer his recommendations. His work is of a very high standard and he is impeccably tidy. Highly recommend and would absolutely use again.`,
    by: "Megan, Google review",
  },
];

const process = [
  { n: "01", title: "A look at the job", body: "Lawrence comes out, looks at what you want and talks through the options before anything is quoted." },
  { n: "02", title: "A clear quote", body: "You get a quote that details the work to be done, so you know what is happening and what it costs." },
  { n: "03", title: "Safety first, then the work", body: "Anything the rest depends on, like an old consumer unit, is sorted first; then the work is done to standard and you are kept updated." },
  { n: "04", title: "Finished and left tidy", body: "The work is tested, checked it does exactly what you asked, and the space is left impeccably tidy." },
];

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="wordmark">Electrical Solutions Bristol</a>
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
        {/* HERO - copy left / photo right (stacks to copy-then-photo on mobile) */}
        <section className="hero" data-section-id="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">Electrician, Bristol BS16 - Downend and across the city</p>
              <h1>High-end home electrics for Bristol, lighting and all, done to a considered standard.</h1>
              <p className="hero-sub">
                Lawrence fits lighting and downlights, upgrades consumer units, rewires and chases down faults across Bristol and the BS postcodes. The board and the safety sorted first, the latest solutions rather than the same old kit, and the job left tidy.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#quote">Get a quote</a>
                <a className="btn btn-secondary" href={`tel:${PHONE_TEL}`} style={{ color: "#fff", borderColor: "#fff" }}>Call Lawrence, {PHONE}</a>
              </div>
              <p className="hero-proof"><span className="accent-text">5.0</span> on Google · 135 reviews</p>
            </div>
            <div className="hero-media">
              <img src={HERO_PHOTO.src} alt={HERO_PHOTO.alt} className="hero-photo" />
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

        {/* THE STANDARD (signature) */}
        <section className="section standard" data-section-id="the-standard">
          <div className="container">
            <p className="eyebrow" data-reveal>The standard Lawrence works to</p>
            <div className="standard-item" data-reveal>
              <h3>Lighting and downlights, planned and fitted properly.</h3>
              <p>From a run of downlights to a single switch or an outdoor light, the lighting is set out and fitted to the standard the rest of the house is held to, not just made to work.</p>
            </div>
            <div className="filament-rule" role="presentation" />
            <div className="standard-item" data-reveal>
              <h3>The board and the safety sorted first.</h3>
              <p>If the consumer unit or the wiring needs bringing up to scratch before the rest can go ahead, Lawrence says so plainly, prices it, and does that first.</p>
            </div>
            <div className="filament-rule" role="presentation" />
            <div className="standard-item" data-reveal>
              <h3>The latest solutions, <span className="accent-text">not the same old kit</span>.</h3>
              <p>Lawrence keeps across what is new in the trade, so the work uses current gear and methods, and the finish is left impeccably tidy.</p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="section" data-section-id="services">
          <div className="container">
            <h2 data-reveal>What Lawrence does</h2>
            <p className="section-intro" data-reveal>Domestic electrical work across Bristol, from a single light to a full rewire.</p>
            <div style={{ marginTop: "1.5rem" }}>
              {services.map((s, i) => (
                <div key={s.name} data-reveal>
                  {i > 0 ? <div className="filament-rule" role="presentation" /> : null}
                  <div className="service-row">
                    <span className="service-mark" aria-hidden="true" />
                    <div>
                      <div className="service-name">{s.name}</div>
                      <p className="service-desc">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="section" data-section-id="gallery" id="work">
          <div className="container">
            <h2 data-reveal>Recent work around Bristol</h2>
            <p className="section-intro" data-reveal>A few finished jobs and the kit Lawrence works with, from consumer units to outdoor power.</p>
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
            <h2 data-reveal>What Bristol homeowners say about Lawrence</h2>
            <p className="review-stat" data-reveal><span>5.0</span> Google rating, 135 reviews</p>
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
            <p className="eyebrow" data-reveal>How a job works with Lawrence</p>
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
            <h2 data-reveal>Where Lawrence works</h2>
            <div className="areas-grid" style={{ marginTop: "1.5rem" }}>
              <div className="map-embed" data-reveal>
                <iframe
                  src="https://maps.google.com/maps?q=Bristol%20BS16&output=embed&z=12"
                  title="Map showing Bristol BS16"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div data-reveal>
                <p>Based in Downend, Bristol BS16, Lawrence covers the city and the surrounding BS postcodes, from Fishponds and Kingswood across to Clifton and the centre.</p>
                <ul className="areas-districts">
                  {districts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="hours">Monday to Friday, 9am to 5pm.</p>
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
                <h2>Get a quote for your electrical job</h2>
                <p className="quote-lead">
                  Tell Lawrence what you are after, the lighting, a rewire, a board upgrade or a fault, and roughly when, and he will come back with a price. Photos of the space help if you have them.
                </p>
                <dl className="quote-details">
                  <div><dt>Call</dt><dd><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></dd></div>
                  <div><dt>Based</dt><dd>Downend, Bristol BS16</dd></div>
                  <div><dt>Hours</dt><dd>Monday to Friday, 9am to 5pm</dd></div>
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
              <div className="footer-brand">Electrical Solutions Bristol</div>
              <p style={{ marginTop: "0.5rem", maxWidth: "34ch" }}>Domestic electrics, lighting and rewires across Bristol.</p>
              <p style={{ marginTop: "0.5rem" }}><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></p>
            </div>
            <div>
              <h4>Areas</h4>
              <ul className="footer-links">
                <li>Downend</li>
                <li>Fishponds</li>
                <li>Kingswood</li>
                <li>Staple Hill</li>
                <li>Clifton</li>
                <li>Bristol centre</li>
              </ul>
              <h4 style={{ marginTop: "1.25rem" }}>Hours</h4>
              <p style={{ margin: 0 }}>Monday to Friday, 9am to 5pm</p>
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
