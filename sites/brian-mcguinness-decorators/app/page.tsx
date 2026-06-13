import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

const PHONE = "07879 054484";
const PHONE_TEL = "07879054484";
const GOOGLE_URL = "https://maps.google.com/?cid=2307249476113286934";

const services = [
  { mark: "PD", name: "Period and heritage decorating", desc: "Victorian cornices, ceilings and original plasterwork in period and tenement homes, painted carefully to a high standard." },
  { mark: "PT", name: "Interior painting", desc: "Whole homes taken on room by room, the way Helena's hall, staircase, living and dining room and kitchen were, in clean, even brushwork." },
  { mark: "WP", name: "Wallpaper and paper-hanging", desc: "Feature walls and full rooms papered, including pattern-matched and lining paper, alongside the painting." },
  { mark: "HS", name: "Halls, stairs and landings", desc: "The awkward multi-floor runs done properly: hallways, staircases and landings painted or papered across several floors." },
];

// Hero is 03 (finished period room in soft sage with an ornate white Victorian cornice,
// ceiling rose, chandelier and panelled period doors): finished, well-lit, no people, and it
// shows the period-plasterwork specialism the reviews praise. The room's own sage echoes the
// palette. Gallery is the remaining finished shots. WIP/exterior/people shots (04, 07, 08, 09,
// 10) are excluded per the site-design skill (no WIP / no people / on-trade only).
const gallery = [
  { src: "/assets/images/02-places.webp", cap: "Period living room, Coatbridge" },
  { src: "/assets/images/06-places.webp", cap: "Hall and staircase" },
  { src: "/assets/images/01-places.webp", cap: "Wallpapered feature wall" },
  { src: "/assets/images/05-places.webp", cap: "Wallpapered cloakroom" },
];

const stats = [
  { num: "5.0", label: "Google rating" },
  { num: "98", label: "Google reviews" },
  { num: "Mon to Fri", label: "9am to 5pm" },
];

const districts = [
  "Coatbridge", "Coatdyke", "Airdrie", "Bargeddie", "Calderbank", "Bellshill",
  "Baillieston", "Mount Vernon", "Shettleston", "Easterhouse", "Glasgow east end", "Uddingston",
];

const marquee = [
  "5.0 on Google", "98 reviews", "Coatbridge and east Glasgow", "Victorian cornices and ceilings",
  "Painting and wallpaper", "Neat, tidy, reliable",
];

const reviews = [
  {
    text: `Brian has painted all the rooms in our flat to a very high standard. Especially pleased by his good work on the Victorian cornices and ceilings. All Brian's work has been excellent, a reliable and trustworthy decorator. We would happily recommend him!`,
    by: "Jim, Google review",
  },
  {
    text: `We used Brian to paint our hall (3 floors), bathroom and wallpaper our bedroom. His quote was reasonable, the job was completed in the agreed time and his work was of a very high standard. We were very pleased overall and wouldn't hesitate to recommend him, and would certainly use him again.`,
    by: "Bob, Google review",
  },
  {
    text: `Brian has just finished painting my house to include the hall and staircase, living room/dining room and kitchen. He did a fantastic job and is a first class decorator. Brian is very reliable, spotlessly clean worker and is competitively priced. I have engaged the services of many decorators over the years and Brian in my opinion is by far the best.`,
    by: "Helena, Google review",
  },
  {
    text: `Outstanding Decorator and very professional indeed. He is extremely neat and very tidy completing the job in timescale given which was so helpful. The quality and finish of his painting and papering superb and he diligently worked away completing 3 rooms to my complete satisfaction.`,
    by: "Linda, Google review",
  },
];

const process = [
  { n: "01", title: "Come and look, then quote", body: "Brian comes out, looks at the rooms and the plasterwork, and gives you a clear price for the work." },
  { n: "02", title: "Protect the room first", body: "Floors and furniture covered, surfaces prepared, so an old room is kept clean while the work is done." },
  { n: "03", title: "Painted and papered to a high standard", body: "Cornices, ceilings, walls, halls and stairs done carefully in paint or paper, at the right pace rather than rushed." },
  { n: "04", title: "Finished on time, snags sorted", body: "The work is finished to the time agreed and the place left tidy; if a small thing needs putting right, Brian is back quickly." },
];

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="wordmark">Brian McGuinness Decorators</a>
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
            <img src="/assets/images/03-places.webp" alt="Period room with a Victorian cornice and ceiling decorated by Brian McGuinness Decorators, Coatbridge" loading="eager" />
          </div>
          <div className="hero-scrim" />
          <div className="container hero-inner">
            <p className="eyebrow">Painters and decorators, Coatbridge and east Glasgow</p>
            <h1>Painters and decorators for Coatbridge and the east of Glasgow, trusted with period homes.</h1>
            <p className="hero-sub lead">
              Brian decorates period and tenement homes across Coatbridge and the east of Glasgow: Victorian cornices and ceilings, halls and staircases, painting and wallpaper, all to a high standard and left clean and tidy.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#quote">Get a quote</a>
              <a className="btn btn-secondary" href={`tel:${PHONE_TEL}`} style={{ color: "#fff", borderColor: "#fff" }}>Call Brian, {PHONE}</a>
            </div>
            <p className="hero-proof"><span className="accent-text">5.0</span> on Google · 98 reviews</p>
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

        {/* THE PERIOD DIFFERENCE (signature) - content rows, stats inline */}
        <section className="section difference" data-section-id="the-period-difference">
          <div className="container">
            <p className="eyebrow" data-reveal>What Brian&apos;s known for</p>
            <div className="difference-item" data-reveal>
              <h3>Work that respects an old house.</h3>
              <p><span className="accent-text">Victorian cornices and ceilings</span>, original plasterwork and period detail painted to a high standard, with the care an old room needs rather than a quick coat.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>Halls and staircases over several floors.</h3>
              <p>Whole homes taken on room by room, including the hall, staircase and landing across more than one floor, in paint and in wallpaper.</p>
            </div>
            <div className="difference-item" data-reveal>
              <h3>Left clean, tidy and on time.</h3>
              <p>Brian is a clean, tidy worker who finishes to the time he gives you, and puts any small thing right quickly if it needs it.</p>
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
            <h2 data-reveal>What Brian does</h2>
            <p className="section-intro" data-reveal>Real decorating work, from a single feature wall to a whole period home.</p>
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
            <p className="section-intro" data-reveal>Finished period rooms, cornices, hallways and papered walls from around Coatbridge and the east of Glasgow.</p>
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
            <h2 data-reveal>What homeowners say about Brian</h2>
            <p className="review-stat" data-reveal><span>5.0</span> Google rating, 98 reviews</p>
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
            <h2 data-reveal>Where Brian works</h2>
            <div className="areas-grid" style={{ marginTop: "1.5rem" }}>
              <div className="map-embed" data-reveal>
                <iframe
                  src="https://maps.google.com/maps?q=Coatbridge%20ML5&output=embed&z=12"
                  title="Map showing Coatbridge ML5"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div data-reveal>
                <p>Based in Coatbridge, Brian covers North Lanarkshire and the east of Glasgow, from Airdrie and Bargeddie across to Baillieston, Shettleston and the Glasgow east end.</p>
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
                <h2>Get a quote for your decorating</h2>
                <p className="quote-lead">
                  Tell Brian about the rooms - what you&apos;re after, painting or paper, and roughly when - and he&apos;ll come back to you with a price. Photos of the space help if you have them.
                </p>
                <dl className="quote-details">
                  <div><dt>Call</dt><dd><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></dd></div>
                  <div><dt>Based</dt><dd>Coatbridge, ML5</dd></div>
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
              <div className="footer-brand">Brian McGuinness Decorators</div>
              <p style={{ marginTop: "0.5rem", maxWidth: "38ch" }}>Painting, wallpaper and period decorating across Coatbridge and the east of Glasgow.</p>
              <p style={{ marginTop: "0.5rem" }}><a href={`tel:${PHONE_TEL}`}>{PHONE}</a></p>
            </div>
            <div>
              <h4>Areas</h4>
              <ul className="footer-links">
                <li>Coatbridge</li>
                <li>Airdrie</li>
                <li>Bargeddie</li>
                <li>Bellshill</li>
                <li>Baillieston</li>
                <li>Glasgow east end</li>
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
