import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

const PHONE = "07765 436385";
const PHONE_TEL = "07765436385";
const GOOGLE_URL = "https://maps.google.com/?cid=10046209844566892378";

const services = [
  { mark: "DK", name: "Garden decking", desc: "Raised and ground-level decking, screwed and fixed throughout and set true even where the ground is uneven." },
  { mark: "FN", name: "Fencing", desc: "Boundary and garden fencing built strong and straight, including runs across slopes and over retaining walls." },
  { mark: "GW", name: "Groundwork and levelling", desc: "The prep that makes the rest last: levelling uneven ground and working around rock and drainage before anything is built." },
  { mark: "GT", name: "Garden transformations", desc: "Whole areas reworked from start to finish, planned with you and delivered to the timescale you agree." },
];

// Hero is 10 (large finished raised deck, sunny, no people, clean - decking is the
// headline trade). Gallery is the remaining finished shots. 08 (pre-existing/overgrown
// fence, not a showcase) and 09 (decking detail crop) are excluded per the site-design
// skill (no WIP / detail crops / non-showcase).
const gallery = [
  { src: "/assets/images/02-places.webp", cap: "Finished garden build, Leeds" },
  { src: "/assets/images/01-places.webp", cap: "Garden fencing, Leeds" },
  { src: "/assets/images/03-places.webp", cap: "Completed decking, Leeds" },
  { src: "/assets/images/05-places.webp", cap: "Completed decking, Leeds" },
  { src: "/assets/images/04-places.webp", cap: "Garden fencing, Leeds" },
  { src: "/assets/images/06-places.webp", cap: "Garden fencing, Leeds" },
];

const stats = [
  { num: "4.9", label: "Google rating" },
  { num: "79", label: "Google reviews" },
  { num: "6 days", label: "Monday to Saturday" },
];

const districts = [
  "Meanwood", "Headingley", "Far Headingley", "Weetwood", "Chapel Allerton", "Roundhay",
  "Gledhow", "Alwoodley", "Moortown", "Adel", "Cookridge", "Horsforth", "Shadwell", "Oakwood",
];

const marquee = [
  "4.9 on Google", "79 local reviews", "North Leeds, LS6", "Screwed and fixed, never nailed",
  "Fences built dead straight", "Monday to Saturday, 8 to 4",
];

const reviews = [
  {
    text: `Damo has just completed the most perfect decking. It wasn't easy - levels on the house were out, rock under the lawn (which explains all the moss!) and a drain inspection chamber higher than I wanted the finished decking. Not a problem for Damo - he sorted it all out, constructed the decking to a high standard (not a nail in sight - all screwed and fixed).`,
    by: "Gail, Google review",
  },
  {
    text: `Really pleased with the fence Damo installed. He pays attention to detail, notices things I didn't see such as ensuring it goes in a straight line, and it's built to be as strong as can be. Really neat work, particularly given my driveway is sloped and also has a retaining wall beneath the fence. I found him personable and trustworthy.`,
    by: "Lisa, Google review",
  },
  {
    text: `We are absolutely over the moon with the transformation of the area we had to work with. Damo and his team executed the plan to perfection, delivering everything within the agreed timescale. The whole team worked incredibly hard from start to finish and clearly take real pride in the quality of their work.`,
    by: "Google review",
  },
  {
    text: `Damo has provided a first class service. He was quick with correspondence and his quality of work is fabulous. We will definitely be using his services in the future.`,
    by: "Sarah, Google review",
  },
];

const process = [
  { n: "01", title: "A look at the ground", body: "Damo comes out, looks at the levels and the ground, and gives you a straight price for the work." },
  { n: "02", title: "Ground sorted first", body: "Uneven ground, rock or drainage is dealt with before anything is built, so the finish sits true." },
  { n: "03", title: "Built and fixed properly", body: "Decking screwed and fixed board by board, fencing set out to a straight line and built strong, done at the right pace rather than rushed." },
  { n: "04", title: "Finished on time, left tidy", body: "The work is delivered to the timescale you agreed and the site left clean." },
];

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="wordmark">Damo&apos;s Decking &amp; Fencing</a>
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
            <img src="/assets/images/10-places.webp" alt="Finished raised timber deck by Damo's Decking and Fencing, Leeds" loading="eager" />
          </div>
          <div className="hero-scrim" />
          <div className="container hero-inner">
            <p className="eyebrow">Decking and fencing, north Leeds LS6</p>
            <h1>Decking and fencing for north Leeds, built straight on ground that never sits level.</h1>
            <p className="hero-sub">
              Damo builds raised and ground-level decking and boundary fencing across Meanwood, Roundhay and Alwoodley - screwed and fixed throughout, set true where levels are out, and finished dead straight.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#quote">Get a quote</a>
              <a className="btn btn-secondary" href={`tel:${PHONE_TEL}`} style={{ color: "#fff", borderColor: "#fff" }}>Call Damo, {PHONE}</a>
            </div>
            <p className="hero-proof"><span className="accent-text">4.9</span> on Google · 79 reviews</p>
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
            <p className="eyebrow" data-reveal>What Damo&apos;s known for</p>
            <div className="difference-item" data-reveal>
              <h3>Built true, even when the ground fights back.</h3>
              <p>Levels out on the house, rock under the lawn, a drain chamber sitting in the way: Damo sorts the ground first and builds to it, so the decking sits right and stays put.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3><span className="accent-text">Screwed and fixed</span>, not a nail in sight.</h3>
              <p>Every board is screwed and fixed rather than nailed, so nothing works loose over the seasons. It is the slower way to build a deck, and the reason it stays solid.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>Fences that run dead straight.</h3>
              <p>Damo sets a fence out to a straight line and builds it strong, including the awkward runs across a sloped driveway or over a retaining wall.</p>
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
            <h2 data-reveal>What Damo builds</h2>
            <p className="section-intro" data-reveal>Real decking and fencing work, from a single fence run to a whole garden.</p>
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
            <h2 data-reveal>Recent decking and fencing</h2>
            <p className="section-intro" data-reveal>A selection of finished decks, fences and garden builds from around north Leeds.</p>
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
            <h2 data-reveal>What Leeds homeowners say about Damo</h2>
            <p className="review-stat" data-reveal><span>4.9</span> Google rating, 79 reviews</p>
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
            <p className="eyebrow" data-reveal>How a job works with Damo</p>
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
            <h2 data-reveal>Where Damo works</h2>
            <div className="areas-grid" style={{ marginTop: "1.5rem" }}>
              <div className="map-embed" data-reveal>
                <iframe
                  src="https://maps.google.com/maps?q=Leeds%20LS6&output=embed&z=12"
                  title="Map showing Leeds LS6"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div data-reveal>
                <p>Based in Meanwood, Damo covers north Leeds and the surrounding LS postcodes, from Headingley and Chapel Allerton up to Roundhay, Alwoodley and Moortown.</p>
                <ul className="areas-districts">
                  {districts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="hours">Monday to Saturday, 8am to 4pm.</p>
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
                <h2>Get a quote for your decking or fencing</h2>
                <p className="quote-lead">
                  Tell Damo about the job - the garden, what you&apos;re after and roughly when - and he&apos;ll come back to you with a price. Photos of the space help if you have them.
                </p>
                <dl className="quote-details">
                  <div><dt>Call</dt><dd><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></dd></div>
                  <div><dt>Based</dt><dd>Meanwood, Leeds LS6</dd></div>
                  <div><dt>Hours</dt><dd>Monday to Saturday, 8am to 4pm</dd></div>
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
              <div className="footer-brand">Damo&apos;s Decking &amp; Fencing</div>
              <p style={{ marginTop: "0.5rem", maxWidth: "34ch" }}>Decking, fencing and garden builds across north Leeds.</p>
              <p style={{ marginTop: "0.5rem" }}><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></p>
            </div>
            <div>
              <h4>Areas</h4>
              <ul className="footer-links">
                <li>Meanwood</li>
                <li>Headingley</li>
                <li>Chapel Allerton</li>
                <li>Roundhay</li>
                <li>Alwoodley</li>
                <li>Moortown</li>
              </ul>
              <h4 style={{ marginTop: "1.25rem" }}>Hours</h4>
              <p style={{ margin: 0 }}>Monday to Saturday, 8am to 4pm</p>
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
