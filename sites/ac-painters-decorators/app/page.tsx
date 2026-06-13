import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

const PHONE = "07592 753933";
const PHONE_TEL = "07592753933";
const GOOGLE_URL = "https://maps.google.com/?cid=8375067658394021796";

const services = [
  { mark: "FC", name: "Feature colour and full rooms", desc: "Bold feature walls and full-room repaints, from a deep boutique colour to a whole bedroom or living room, finished to a high standard." },
  { mark: "WP", name: "Wallpaper hanging", desc: "Wallpaper measured and hung to a clean, even finish, on its own or alongside paint in the same room." },
  { mark: "FR", name: "Furniture and shelving", desc: "Dated units, shelving and furniture rubbed down and refinished in colour, so the piece reads new instead of being replaced." },
  { mark: "EX", name: "Exterior house painting", desc: "The fronts of terrace and period houses repainted and tidied up, ready for the street to see." },
];

// Hero is 10-places.webp (the only genuinely finished, well-lit interior: a smooth deep-grey
// stairwell with a crisp black flush door and white spindles - reads boutique and sits with the
// aubergine palette). Gallery uses 10 + 03 (period staircase, mid-renovation, captioned honestly
// as period-house work, NOT "finished"). 02-places.webp (room strip-out with a hire dehumidifier
// and bare plaster, no finished surface) is EXCLUDED per the site-design skill (WIP / no finished
// surface). See build-notes.md.
const gallery = [
  { src: "/assets/images/10-places.webp", cap: "Stairwell and landing, Liverpool" },
  { src: "/assets/images/03-places.webp", cap: "Period staircase, Liverpool" },
];

const stats = [
  { num: "4.9", label: "Google rating" },
  { num: "58", label: "Google reviews" },
  { num: "7 days", label: "Open every day" },
];

const districts = [
  "Bootle", "Crosby", "Litherland", "Waterloo", "Seaforth", "Aintree",
  "Walton", "Orrell Park", "Netherton", "Maghull", "Anfield", "Liverpool city",
];

const marquee = [
  "4.9 on Google", "58 local reviews", "Bootle and Crosby, L20", "Interior and exterior",
  "Feature-colour finishes", "Open seven days, from early",
];

const reviews = [
  {
    text: `Wow, from a bit dated looking shelves unit into a luxurious boutique hotel look! I love it! The olive green paint and finish looks stunning! Super professional, excellent price. Definitely recommend. Thank you`,
    by: "Sylvia, Google review",
  },
  {
    text: `Great job by Chris and his team at AC Painters painting exterior of terrace house in Crosby for me this week. Looks great and very happy to recommend.`,
    by: "Helen, Google review",
  },
  {
    text: `Really hard to find top decorators - Chris and the lads were great. He managed to fit me in for a quote then bedroom paint / wallpaper, communication was really good, excellent finish and cleaned all up after. Wouldn't hesitate to use Chris again and highly recommend.`,
    by: "Google review",
  },
  {
    text: `Really pleased with these painters. They came out promptly to quote and were easy to deal with from the start. Turned up on time each day, kept everything tidy, and the standard of work was excellent. The finish is high quality and exactly what I was after.`,
    by: "nic, Google review",
  },
];

const process = [
  { n: "01", title: "Come out and quote", body: "Chris and the team come out to look at the room or the outside, talk through the colours and finish you want, and give you a straight price, often at short notice." },
  { n: "02", title: "Agree the colour and finish", body: "You settle on the colour, the wallpaper or the boutique finish together before any brush goes near a wall, so you get exactly what you were after." },
  { n: "03", title: "Painted to a high finish", body: "Walls, woodwork, wallpaper and furniture painted and finished to a high standard, with the team turning up on time each day." },
  { n: "04", title: "Cleaned up and left tidy", body: "Everything cleaned up and the room left tidy at the end, so you walk back into a finished space and nothing else." },
];

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="wordmark">AC Painters &amp; Decorators</a>
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
            <img src="/assets/images/10-places.webp" alt="Finished stairwell and landing painted in deep grey by AC Painters and Decorators, Liverpool" loading="eager" />
          </div>
          <div className="hero-scrim" />
          <div className="container hero-inner">
            <p className="eyebrow">Painters and decorators, Bootle and Crosby</p>
            <h1>Painters and decorators in Bootle and Crosby, confident with colour inside and out.</h1>
            <p className="hero-sub">
              Chris and the team paint rooms, feature walls and the fronts of houses across Bootle, Crosby and Liverpool, from a bold boutique-hotel finish to wallpaper, furniture and exteriors.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#quote">Get a quote</a>
              <a className="btn btn-secondary" href={`tel:${PHONE_TEL}`} style={{ color: "#fff", borderColor: "#fff" }}>Call {PHONE}</a>
            </div>
            <p className="hero-proof"><span className="accent-text">4.9</span> on Google, 58 reviews</p>
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
            <p className="eyebrow" data-reveal>What AC Painters are known for</p>
            <div className="difference-item" data-reveal>
              <h3>Colour, done with confidence.</h3>
              <p>A feature wall in a deep, deliberate colour, a whole room or a dated unit reworked into a <span className="accent-text">luxurious, boutique-hotel finish</span>: the kind of colour most decorators talk you out of, this team gets right.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>Not just walls.</h3>
              <p>Wallpaper hung to a clean finish, and tired furniture and shelving brought back to life rather than thrown out, so a whole room changes for the cost of paint and care.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>Inside and out.</h3>
              <p>The same care goes on the outside: the front of a terrace or period house repainted and tidied, the sort of exterior work that lifts a whole street in Crosby and Bootle.</p>
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
            <h2 data-reveal>What AC Painters do</h2>
            <p className="section-intro" data-reveal>Real painting and decorating work, from a single feature wall to the front of a house.</p>
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
            <h2 data-reveal>Recent work</h2>
            <p className="section-intro" data-reveal>A look at finished and in-progress work from around Bootle, Crosby and Liverpool.</p>
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
            <h2 data-reveal>What Bootle and Crosby customers say</h2>
            <p className="review-stat" data-reveal><span>4.9</span> Google rating, 58 reviews</p>
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
            <h2 data-reveal>Where AC Painters work</h2>
            <div className="areas-grid" style={{ marginTop: "1.5rem" }}>
              <div className="map-embed" data-reveal>
                <iframe
                  src="https://maps.google.com/maps?q=Bootle%20L20&output=embed&z=12"
                  title="Map showing Bootle L20"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div data-reveal>
                <p>Based in Bootle, Chris and the team cover Crosby, Liverpool and north Merseyside, from Litherland and Waterloo across to Aintree, Walton and the north Liverpool postcodes.</p>
                <ul className="areas-districts">
                  {districts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="hours">Open seven days, from early in the morning.</p>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE - two column, dark aubergine */}
        <section className="section quote" data-section-id="quote" id="quote">
          <div className="container">
            <div className="quote-grid">
              <div className="quote-aside" data-reveal>
                <p className="eyebrow">Get in touch</p>
                <h2>Get a quote for your painting or decorating</h2>
                <p className="quote-lead">
                  Tell Chris about the job, the room or the outside, the colours you have in mind and roughly when, and the team will come back to you with a price. A photo of the space helps if you have one.
                </p>
                <dl className="quote-details">
                  <div><dt>Call</dt><dd><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></dd></div>
                  <div><dt>Based</dt><dd>Bootle, L20</dd></div>
                  <div><dt>Hours</dt><dd>Open seven days, from early</dd></div>
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
              <div className="footer-brand">AC Painters &amp; Decorators</div>
              <p style={{ marginTop: "0.5rem", maxWidth: "36ch" }}>Painting and decorating, inside and out, across Bootle, Crosby and Liverpool.</p>
              <p style={{ marginTop: "0.5rem" }}><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></p>
            </div>
            <div>
              <h4>Areas</h4>
              <ul className="footer-links">
                <li>Bootle</li>
                <li>Crosby</li>
                <li>Litherland</li>
                <li>Waterloo</li>
                <li>Aintree</li>
                <li>Liverpool</li>
              </ul>
              <h4 style={{ marginTop: "1.25rem" }}>Hours</h4>
              <p style={{ margin: 0 }}>Open seven days, from early</p>
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
