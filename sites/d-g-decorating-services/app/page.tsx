import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

const PHONE = "07411 680190";
const PHONE_TEL = "07411680190";
const GOOGLE_URL = "https://maps.google.com/?cid=3767856490354972796";

const services = [
  { mark: "PD", name: "Interior painting and decorating", desc: "Walls, ceilings, woodwork and whole rooms, painted to a clean, smooth finish." },
  { mark: "DW", name: "Doors and woodwork", desc: "Old doors, skirting and trim sanded back and repainted so they look like new rather than just recoated." },
  { mark: "PR", name: "Surface preparation", desc: "The part most of the finish depends on: filling, sanding and covering the room properly before any paint goes near it." },
  { mark: "WH", name: "Whole-home redecoration", desc: "A full home taken on room by room, from the hall and stairs to the kitchen, en-suite and bedrooms, with a written quote up front." },
];

// Hero is 05-places (a hallway of freshly painted smooth white panel doors and crisp
// trim - the prep-and-finish angle made visible; well-lit, finished, no people, clean).
// Gallery is the remaining finished Google Places interiors. Excluded: 02 (exterior),
// 03 (cluttered/sofas), 07 (commercial reception, blurry), 08 (paint-shop sprayer demo,
// a person/promo not a finished room) per the site-design skill (no WIP / off-trade).
const gallery = [
  { src: "/assets/images/06-places.webp", cap: "Kitchen diner, North Tyneside" },
  { src: "/assets/images/04-places.webp", cap: "Feature wall, North Tyneside" },
  { src: "/assets/images/01-places.webp", cap: "Finished living room, North Tyneside" },
  { src: "/assets/images/10-places.webp", cap: "Feature wall, North Tyneside" },
  { src: "/assets/images/09-places.webp", cap: "Finished decorating, North Tyneside" },
  { src: "/assets/images/03-places.webp", cap: "Finished decorating, North Tyneside" },
];

const stats = [
  { num: "5.0", label: "Google rating" },
  { num: "24", label: "Google reviews" },
  { num: "6 days", label: "Monday to Saturday" },
];

const districts = [
  "Killingworth", "Forest Hall", "Longbenton", "Benton", "Gosforth", "South Gosforth",
  "Wideopen", "Dudley", "Annitsford", "Backworth", "Shiremoor", "West Moor", "Wallsend",
  "Newcastle upon Tyne",
];

const marquee = [
  "5.0 on Google", "24 reviews", "Killingworth, NE12", "Prep before every coat",
  "Old doors brought back like new", "Booked well ahead",
];

const reviews = [
  {
    text: `Had some work done recently it looks amazing, very thorough from start to finish. I have never saw paintwork so smooth, doors were not new ones so had been painted before, they were sanded and there is not a flaw with them, they are so good look like new. Everything was covered with dust sheets right throughout property, they are very respectful of your home and very approachable.`,
    by: "Walter, Google review",
  },
  {
    text: `We are absolutely delighted with the work that Dan has done. From our first contact with Dan to completion we couldn't fault him. We had hall, landing and stairs, dining kitchen, utility, en-suite and bedroom redecorated. Everything was done to a very high standard, preparation work was excellent. He came when he said and we had a detailed written quotation within a few days. Dan is such a friendly guy, such tidy workers. Will definitely use again.`,
    by: "Lynn, Google review",
  },
  {
    text: `Fantastic job as usual. Dan prepares well before decorating which gives that great finish. I have always had to book well in advance as he is always booked up. Wouldn't go anywhere else.`,
    by: "Simon, Google review",
  },
  {
    text: `Our home looked outdated for years, but D.G. Decorating Services completely transformed it. The fresh paint and neat decorating work made every room feel brighter and more welcoming.`,
    by: "Allen, Google review",
  },
];

const process = [
  { n: "01", title: "A look round and a written quote", body: "Dan comes when he says, looks at the rooms and gets a detailed written quote back to you within a few days." },
  { n: "02", title: "Rooms covered and prepped first", body: "Dust sheets go down throughout, then the filling and sanding, so the surface is right before any paint goes on." },
  { n: "03", title: "Painted to a smooth finish", body: "Doors and woodwork sanded back and repainted, walls and ceilings finished smooth, taken at the pace good prep needs." },
  { n: "04", title: "Left tidy, the home brighter", body: "The work is finished to a high standard, the place left tidy, and the rooms come back fresher and more welcoming." },
];

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="wordmark">D.G. Decorating Services</a>
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
            <img src="/assets/images/05-places.webp" alt="Freshly painted smooth white doors and woodwork by D.G. Decorating Services, Killingworth" loading="eager" />
          </div>
          <div className="hero-scrim" />
          <div className="container hero-inner">
            <p className="eyebrow">Painters and decorators, Killingworth NE12</p>
            <h1>Painters and decorators in Killingworth, with a finish so smooth it looks like new.</h1>
            <p className="hero-sub">
              Dan preps every surface and sands old doors and woodwork back before he paints, so dated rooms across Killingworth and North Tyneside come back flawlessly smooth and brighter.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#quote">Get a quote</a>
              <a className="btn btn-secondary" href={`tel:${PHONE_TEL}`} style={{ color: "#fff", borderColor: "#fff" }}>Call Dan, {PHONE}</a>
            </div>
            <p className="hero-proof"><span className="accent-text">5.0</span> on Google, 24 reviews</p>
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
            <p className="eyebrow" data-reveal>What Dan is known for</p>
            <div className="difference-item" data-reveal>
              <h3>The prep is done before a single coat goes on.</h3>
              <p>Dan preps every surface first, covers the room in dust sheets and sands old doors and woodwork back, because that is what makes the finish come up right.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3><span className="accent-text">A finish so smooth</span> it looks like new.</h3>
              <p>Old doors that had been painted before come back without a flaw, and customers say they have never seen paintwork so smooth.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>Dated rooms brought back brighter.</h3>
              <p>A whole home that had looked outdated for years comes back fresher and more welcoming, one room at a time, and the place is left tidy.</p>
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
            <h2 data-reveal>What Dan does</h2>
            <p className="section-intro" data-reveal>Real interior decorating work, from a few rooms to a whole home.</p>
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
            <h2 data-reveal>Recent decorating in and around Killingworth</h2>
            <p className="section-intro" data-reveal>A selection of finished rooms, doors and feature walls from homes across North Tyneside.</p>
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
            <h2 data-reveal>What Killingworth homeowners say about Dan</h2>
            <p className="review-stat" data-reveal><span>5.0</span> Google rating, 24 reviews</p>
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
            <p className="eyebrow" data-reveal>How a job works with Dan</p>
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
            <p className="process-note" data-reveal>Dan is usually booked well in advance, so it is worth getting in touch early.</p>
          </div>
        </section>

        {/* AREAS + HOURS */}
        <section className="section" data-section-id="areas" id="areas">
          <div className="container">
            <h2 data-reveal>Where Dan works</h2>
            <div className="areas-grid" style={{ marginTop: "1.5rem" }}>
              <div className="map-embed" data-reveal>
                <iframe
                  src="https://maps.google.com/maps?q=Killingworth%20NE12&output=embed&z=12"
                  title="Map showing Killingworth NE12"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div data-reveal>
                <p>Based in Killingworth, Dan covers North Tyneside and the Newcastle upon Tyne suburbs, from Forest Hall and Longbenton across to Gosforth and up to Wideopen.</p>
                <ul className="areas-districts">
                  {districts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="hours">Monday to Friday, 8am to 5pm. Saturday, 8am to 1pm.</p>
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
                <h2>Get a quote for your decorating</h2>
                <p className="quote-lead">
                  Tell Dan about the rooms, what you&apos;re after and roughly when, and he&apos;ll get a written quote back to you. He books up well in advance, so it helps to get in touch early.
                </p>
                <dl className="quote-details">
                  <div><dt>Call</dt><dd><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></dd></div>
                  <div><dt>Based</dt><dd>Killingworth, NE12</dd></div>
                  <div><dt>Hours</dt><dd>Mon to Fri 8am to 5pm, Sat 8am to 1pm</dd></div>
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
              <div className="footer-brand">D.G. Decorating Services</div>
              <p style={{ marginTop: "0.75rem", maxWidth: "36ch" }}>Painting and decorating across Killingworth, North Tyneside and Newcastle upon Tyne.</p>
              <p style={{ marginTop: "0.5rem" }}><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></p>
            </div>
            <div>
              <h4>Areas</h4>
              <ul className="footer-links">
                <li>Killingworth</li>
                <li>Forest Hall</li>
                <li>Longbenton</li>
                <li>Gosforth</li>
                <li>Wideopen</li>
                <li>Newcastle upon Tyne</li>
              </ul>
              <h4 style={{ marginTop: "1.25rem" }}>Hours</h4>
              <p style={{ margin: 0 }}>Mon to Fri 8am to 5pm</p>
              <p style={{ margin: 0 }}>Sat 8am to 1pm</p>
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
