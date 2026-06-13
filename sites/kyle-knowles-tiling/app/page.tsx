import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

const PHONE = "07913 163118";
const PHONE_TEL = "07913163118";
const GOOGLE_URL = "https://maps.google.com/?cid=13809484651488138570";

const services = [
  { mark: "FL", name: "Floor tiling and levelling", desc: "New floors laid level and true, including subfloors that need levelling first." },
  { mark: "BA", name: "Bathroom tiling", desc: "Walls and floors for bathrooms and en-suites, including the more involved layouts other fitters pass on." },
  { mark: "KT", name: "Kitchen floors and walls", desc: "Kitchen floors levelled and laid, with walls and splashbacks to match." },
  { mark: "IN", name: "Intricate and large-format layouts", desc: "Detailed patterns and large-format tiles: the set-out other fitters would rather not take on." },
];

// Hero is 07 (full finished kitchen). Gallery is the clean finished shots only;
// 02 (top-down work-in-progress, grout bucket + spacers) and 09 (open bath-panel
// cavity, exposed subfloor) are excluded per the site-design skill (no WIP/debris).
const gallery = [
  { src: "/assets/images/08-places.webp", cap: "Marble-tiled bathroom" },
  { src: "/assets/images/01-places.webp", cap: "Kitchen splashback tiling" },
  { src: "/assets/images/10-places.webp", cap: "Tiled shower and patterned floor" },
  { src: "/assets/images/04-places.webp", cap: "Large-format floor tiling" },
  { src: "/assets/images/03-places.webp", cap: "Patterned floor tiling" },
  { src: "/assets/images/06-places.webp", cap: "Tiled hallway floor" },
];

const stats = [
  { num: "4.9", label: "Google rating" },
  { num: "43", label: "Google reviews" },
  { num: "7 days", label: "7am to 7pm" },
];

const districts = [
  "Openshaw", "Gorton", "Clayton", "Beswick", "Bradford", "Droylsden", "Audenshaw",
  "Failsworth", "Newton Heath", "Miles Platting", "Levenshulme", "Denton", "Reddish", "Ashton-under-Lyne",
];

const marquee = [
  "4.9 on Google", "43 local reviews", "Manchester M11", "Floors levelled first",
  "Jobs others turn down", "Seven days, 7am to 7pm",
];

const reviews = [
  {
    text: `I found him through Google after our bathroom fitter said the tiles we wanted were a too complex for him. Kyle did a brilliant job, was enthusiastic, turned up on time and got the job done in a good time (knowing we were on a strict deadline with a baby due the following week!)`,
    by: "Stephanie, Google review",
  },
  {
    text: `I've had the pleasure to have Kyle work on both my kitchen and bathroom. Coming from the back of an awful experience where previous fitter/tiler went AWOL Kyle had to step in and I'm really glad he did. Reliable, punctual and very proud of his work.`,
    by: "Luca, Google review",
  },
  {
    text: `I had a challenging kitchen floor and hallway that needed leveling and lots more TLC. Kyle was not phased by the level of work that needed to be done and reassured me that he would be able to work with it. And he did! I am so pleased with my new floor.`,
    by: "Laura, Google review",
  },
  {
    text: `Extreme attention to detail. Did not rush himself to finish the job and gave it plenty of time. Cleaned up after himself everyday. And went above and beyond the ask. Amazing tiling specially considering the floor was uneven!`,
    by: "Paulo, Google review",
  },
];

const process = [
  { n: "01", title: "A proper look first", body: "Kyle comes to see the job and gives you honest advice on the tiles and the layout." },
  { n: "02", title: "Prep and levelling", body: "Any uneven or difficult floor is levelled and prepped before tiling starts." },
  { n: "03", title: "Set out and tiled", body: "The tiling is set out carefully and done at the right pace, not rushed." },
  { n: "04", title: "Tidy finish", body: "He keeps you updated as he goes and clears up at the end of each day." },
];

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="wordmark">Kyle Knowles Tiling</a>
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

      {/* Overlay nav + scrim live OUTSIDE <header>: the header has backdrop-filter, which
          creates a containing block that would trap these fixed elements inside the header box. */}
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
            <img src="/assets/images/07-places.webp" alt="Finished tiled kitchen floor by Kyle Knowles, Manchester" loading="eager" />
          </div>
          <div className="hero-scrim" />
          <div className="container hero-inner">
            <p className="eyebrow">Floor and wall tiling, Manchester M11</p>
            <h1>The Manchester tiler other fitters call when the job&apos;s too complex.</h1>
            <p className="hero-sub">
              Kyle Knowles levels difficult floors and sets out the intricate tile work other fitters pass on, across Manchester and the M11. Rated 4.9 on Google by 43 local homeowners.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#quote">Get a quote</a>
              <a className="btn btn-secondary" href={`tel:${PHONE_TEL}`} style={{ color: "#fff", borderColor: "#fff" }}>Call Kyle, {PHONE}</a>
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

        {/* THE DIFFERENCE (signature) - 2 content rows, stats inline */}
        <section className="section difference" data-section-id="the-difference">
          <div className="container">
            <p className="eyebrow" data-reveal>What Kyle&apos;s known for</p>
            <div className="difference-item" data-reveal>
              <h3>He takes the jobs that beat other fitters.</h3>
              <p>One customer&apos;s previous tiler walked off the job. Another was told by their bathroom fitter that the tiles they wanted were too complex. Kyle stepped in on both and got them finished.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>Difficult floors <span className="accent-text">levelled first</span>, set out with care.</h3>
              <p>Uneven kitchen floors and hallways are brought back to level before a single tile goes down, so the finish lasts. Kyle turns up each day as promised, even on jobs with a hard deadline, works to the detail rather than rushing, and clears up at the end of every day.</p>
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
            <h2 data-reveal>What Kyle tiles</h2>
            <p className="section-intro" data-reveal>Real tiling work, from the everyday to the awkward.</p>
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
            <h2 data-reveal>Recent tiling</h2>
            <p className="section-intro" data-reveal>A selection of finished work from around Manchester.</p>
            <div className="gallery-masonry" style={{ marginTop: "1.5rem" }}>
              {gallery.map((g) => (
                <figure className="gallery-item" key={g.src}>
                  <img src={g.src} alt={`${g.cap}, Manchester`} loading="lazy" />
                  <figcaption className="gallery-cap">{g.cap}, Manchester</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="section reviews" data-section-id="reviews" id="reviews">
          <div className="container">
            <h2 data-reveal>What Manchester homeowners say about Kyle</h2>
            <p className="review-stat" data-reveal><span>4.9</span> Google rating, 43 reviews</p>
            <div className="review-grid">
              {reviews.map((r) => (
                <blockquote className="review-card" key={r.by} data-reveal>
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
            <p className="eyebrow" data-reveal>How a job works with Kyle</p>
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
            <h2 data-reveal>Where Kyle works</h2>
            <div className="areas-grid" style={{ marginTop: "1.5rem" }}>
              <div className="map-embed" data-reveal>
                <iframe
                  src="https://maps.google.com/maps?q=Manchester%20M11&output=embed&z=11"
                  title="Map showing Manchester M11"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div data-reveal>
                <p>Kyle works across east Manchester and the districts around the M11 base, all within easy reach for quotes and callouts.</p>
                <ul className="areas-districts">
                  {districts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="hours">Based in Openshaw. Seven days a week, 7am to 7pm.</p>
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
                <h2>Get a quote for your tiling</h2>
                <p className="quote-lead">
                  Tell Kyle about the job, the room, the tiles and your timing, and he&apos;ll come back with a price. Photos help if you have them.
                </p>
                <dl className="quote-details">
                  <div><dt>Call</dt><dd><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></dd></div>
                  <div><dt>Based</dt><dd>Openshaw, Manchester M11</dd></div>
                  <div><dt>Hours</dt><dd>Seven days, 7am to 7pm</dd></div>
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
              <div className="footer-brand">Kyle Knowles Tiling</div>
              <p style={{ marginTop: "0.5rem", maxWidth: "32ch" }}>Floor and wall tiling across Manchester and East Manchester.</p>
              <p style={{ marginTop: "0.5rem" }}><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></p>
            </div>
            <div>
              <h4>Areas</h4>
              <ul className="footer-links">
                <li>Manchester</li>
                <li>Openshaw</li>
                <li>East Manchester (M11)</li>
              </ul>
              <h4 style={{ marginTop: "1.25rem" }}>Hours</h4>
              <p style={{ margin: 0 }}>Seven days, 7am to 7pm</p>
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
