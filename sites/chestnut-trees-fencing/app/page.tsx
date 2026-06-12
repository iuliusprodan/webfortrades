import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

const mapsCid = "13688766968420209735";
const year = new Date().getFullYear();

export default function HomePage() {
  return (
    <>
      <SiteEnhancements />

      <a className="skip-link" href="#content">
        Skip to content
      </a>

      <header className="topnav" data-od-id="topnav">
        <div className="container topnav-inner">
          <a className="logo" href="#top">
            Chestnut Trees <span>&amp; Fencing</span>
          </a>
          <nav className="nav-desktop" aria-label="Primary">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#reviews">Reviews</a>
            <a href="#coverage">Coverage</a>
            <a href="#quote">Contact</a>
          </nav>
          <a className="btn btn-primary" href="tel:07790163439">
            Call <span className="num">07790 163439</span>
          </a>
          <button
            className="nav-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="mobile-nav"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
        <div className="nav-mobile" id="mobile-nav" hidden>
          <div className="container nav-mobile-inner">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#reviews">Reviews</a>
            <a href="#coverage">Coverage</a>
            <a href="#quote">Contact</a>
            <a className="btn btn-primary" href="tel:07790163439">
              Call <span className="num">07790 163439</span>
            </a>
          </div>
        </div>
      </header>

      <main id="content">
        <section
          className="section section-cool hero"
          id="top"
          data-section-id="hero"
          data-od-id="review-led-hero"
          aria-labelledby="hero-heading"
        >
          <div className="container hero-split">
            <div>
              <div className="hero-meta">
                <span className="tag">Tree surgery · Exeter</span>
                <span className="pill">
                  <span className="num">4.9</span> Google rating
                </span>
              </div>
              <blockquote className="hero-quote">
                <p id="hero-heading">
                  &ldquo;Yesterday Chestnut Trees came to fell one large tree and reduce a second by 50% in our
                  garden.&rdquo;
                </p>
                <cite>joe · Google review</cite>
              </blockquote>
              <p className="lead">
                Professional tree work and fencing for homes around Exeter, Newton St Cyres and Sweetham. Dan leads
                every job with clear advice and a thorough clear-up.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#quote">
                  Get a quote
                </a>
                <a className="btn btn-secondary" href="tel:07790163439">
                  Call <span className="num">07790 163439</span>
                </a>
              </div>
            </div>
            <figure className="hero-image">
              <img
                src="/assets/images/02-places.webp"
                alt="Tree work by Chestnut Trees and Fencing in Exeter"
                width={800}
                height={1000}
                fetchPriority="high"
              />
            </figure>
          </div>
        </section>

        <section
          className="section section-accent"
          data-section-id="stats"
          data-od-id="stats-sourced-only"
        >
          <div className="container">
            <div className="stats-row">
              <div className="stat-card stat-card-accent">
                <div className="stat-num stat-num-accent num">4.9</div>
                <p className="stat-label">Google rating for Chestnut Trees &amp; Fencing.</p>
              </div>
              <div className="stat-card">
                <div className="stat-num num">57+</div>
                <p className="stat-label">Written Google reviews you can read before you book.</p>
              </div>
              <div className="stat-card">
                <div className="stat-num">Exeter</div>
                <p className="stat-label">Based in Newton St Cyres, Exeter EX5.</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section-surface"
          data-section-id="customer-themes"
          data-od-id="what-customers-keep-mentioning"
        >
          <div className="container">
            <div className="section-head">
              <h2>What Exeter customers mention most</h2>
              <p className="lead">
                Repeated praise in Google reviews centres on Dan&apos;s skill, communication and how tidy the garden
                is left.
              </p>
            </div>
            <div className="theme-grid">
              <article className="theme-card">
                <h3>Thorough clear-up</h3>
                <p>
                  Customers describe logs stacked, chippings left for mulch and everything cleared away after the
                  job.
                </p>
              </article>
              <article className="theme-card">
                <h3>Knowledgeable advice</h3>
                <p>
                  Dan is praised for good advice before and during work, helping customers decide what to do with
                  their trees.
                </p>
              </article>
              <article className="theme-card">
                <h3>Skilled tree work</h3>
                <p>
                  Reviewers mention calm, professional climbing in large canopies, even in confined sites with cables
                  and fences nearby.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section"
          id="work"
          data-section-id="gallery"
          data-od-id="gallery-lean"
        >
          <div className="container">
            <div className="section-head">
              <h2>Recent tree and fencing work in Exeter</h2>
              <p className="lead">Photos from the business Google listing showing finished jobs in the local area.</p>
            </div>
            <div className="gallery-clusters">
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/03-places.webp"
                    alt="Tree surgery project in Exeter"
                    loading="lazy"
                    width={900}
                    height={600}
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/04-places.webp"
                    alt="Tree work in Exeter"
                    loading="lazy"
                    width={700}
                    height={600}
                  />
                </figure>
              </div>
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/05-places.webp"
                    alt="Fencing or tree work in Exeter"
                    loading="lazy"
                    width={700}
                    height={600}
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/06-places.webp"
                    alt="Garden tree work in Exeter"
                    loading="lazy"
                    width={900}
                    height={600}
                  />
                </figure>
              </div>
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/07-places.webp"
                    alt="Tree or fencing project near Exeter"
                    loading="lazy"
                    width={900}
                    height={600}
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/08-places.webp"
                    alt="Finished tree work in Exeter"
                    loading="lazy"
                    width={700}
                    height={600}
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section-surface"
          id="services"
          data-section-id="services"
          data-od-id="service-explainers"
        >
          <div className="container">
            <div className="section-head">
              <h2>3 services explained plainly</h2>
              <p className="lead">
                Work shaped by what customers describe in reviews and by the services listed on the business profile.
              </p>
            </div>
            <div className="services-grid">
              <article className="service-card">
                <h3>Tree felling and reduction</h3>
                <p>
                  Large tree felling, crown reduction and dead tree removal. Dan climbs into the canopy to bring
                  branches down safely, even in tricky gardens.
                </p>
              </article>
              <article className="service-card">
                <h3>Hedge trimming</h3>
                <p>
                  Annual hedge cuts for customers who return each year. Work is described as reliable, tidy and
                  thorough, with all clippings cleared away.
                </p>
              </article>
              <article className="service-card">
                <h3>Fencing and building work</h3>
                <p>
                  Fencing and wider building and construction work for properties around Exeter, Newton St Cyres and
                  Sweetham.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section section-warm"
          data-section-id="featured-review-story"
          data-od-id="featured-review-story"
        >
          <div className="container">
            <div className="dan-panel">
              <div className="dan-mark" aria-hidden="true">
                D
              </div>
              <div>
                <h2>What customers say</h2>
                <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                  Google reviewers refer to Dan when describing advice, climbing skill and how carefully he listens on
                  site.
                </p>
                <p style={{ marginTop: "var(--gap-md)", maxWidth: "58ch" }}>
                  &ldquo;Dan was very knowledgeable and gave us good advice before and during the job. He was friendly
                  and highly skilled in his craft.&rdquo; When you call{" "}
                  <a href="tel:07790163439">
                    <span className="num">07790 163439</span>
                  </a>
                  , you speak with the person customers name in their reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section-cool"
          data-section-id="process"
          data-od-id="process-section"
        >
          <div className="container">
            <div className="section-head">
              <h2>How a job with us works</h2>
              <p className="lead">
                A straightforward sequence from first call to a cleared garden, based on how customers describe their
                visits.
              </p>
            </div>
            <div className="process-list">
              <article className="process-step">
                <h3>Call to discuss</h3>
                <p>
                  Ring <span className="num">07790 163439</span> to explain the trees, hedges or fencing you need help
                  with.
                </p>
              </article>
              <article className="process-step">
                <h3>Advice on site</h3>
                <p>Dan talks through options before and during the job so you can decide what is best for the garden.</p>
              </article>
              <article className="process-step">
                <h3>Carry out the work</h3>
                <p>
                  Tree felling, reduction, hedge cuts or fencing completed calmly, including work near cables and
                  neighbour boundaries.
                </p>
              </article>
              <article className="process-step">
                <h3>Clear up thoroughly</h3>
                <p>Logs stacked, useful chippings left if wanted, and the garden left tidy before the team leaves.</p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section"
          id="reviews"
          data-section-id="reviews"
          data-od-id="review-wall"
        >
          <div className="container reviews-layout">
            <div>
              <h2>4.9 on Google reviews</h2>
              <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                Customer feedback shared on Google for Chestnut Trees &amp; Fencing.
              </p>
              <div className="review-stack" style={{ marginTop: "var(--gap-lg)" }}>
                <article className="review-card">
                  <blockquote>
                    <p>
                      &ldquo;They did it in one day. Everything was cleared up very thoroughly. We can highly recommend
                      Chestnut Trees for any large or small jobs.&rdquo;
                    </p>
                  </blockquote>
                  <cite>joe · Google review</cite>
                </article>
                <article className="review-card">
                  <blockquote>
                    <p>
                      &ldquo;They calmly and professionally completed the job and left the garden tidy. Very
                      communicative, polite and accommodating.&rdquo;
                    </p>
                  </blockquote>
                  <cite>AWT · Google review</cite>
                </article>
                <article className="review-card">
                  <blockquote>
                    <p>
                      &ldquo;Dan is amazing, climbing up into the canopy to remove branches. Everything was cleared away
                      and left tidy.&rdquo;
                    </p>
                  </blockquote>
                  <cite>Helen · Google review</cite>
                </article>
                <article className="review-card">
                  <blockquote>
                    <p>
                      &ldquo;Reliable, and so tidy, everything cleared away. My neighbours are so impressed they have
                      given them work also.&rdquo;
                    </p>
                  </blockquote>
                  <cite>Helen · Google review</cite>
                </article>
                <article className="review-card">
                  <blockquote>
                    <p>
                      &ldquo;They worked extremely quickly and did an excellent job clearing up afterwards, despite our
                      site and access being a bit challenging.&rdquo;
                    </p>
                  </blockquote>
                  <cite>Andrew · Google review</cite>
                </article>
              </div>
              <p style={{ marginTop: "var(--gap-md)" }}>
                <a
                  className="btn btn-secondary"
                  href={`https://maps.google.com/?cid=${mapsCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read all 57+ reviews on Google Maps
                </a>
              </p>
            </div>
            <aside className="review-score">
              <div className="stat-num stat-num-accent num">4.9</div>
              <p className="stat-label" style={{ marginInline: "auto" }}>
                Average Google rating
              </p>
              <p className="meta" style={{ marginTop: "var(--gap-sm)" }}>
                <span className="num">57+</span> reviews
              </p>
            </aside>
          </div>
        </section>

        <section
          className="section section-accent"
          id="coverage"
          data-section-id="service-area"
          data-od-id="local-coverage"
        >
          <div className="container coverage-grid">
            <div>
              <h2>Based in Exeter</h2>
              <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                Chestnut Trees &amp; Fencing works across Exeter and nearby villages in Devon.
              </p>
              <div className="area-list">
                <span className="area-tag">Exeter</span>
                <span className="area-tag">Newton St Cyres</span>
                <span className="area-tag">Sweetham</span>
                <span className="area-tag">EX5 5AR</span>
              </div>
            </div>
            <div className="map-panel">
              <h3>Service area</h3>
              <address>
                Chestnut Trees &amp; Fencing
                <br />
                Newton St Cyres, Exeter
                <br />
                EX5 5AR
              </address>
              <p className="meta" style={{ marginTop: "var(--gap-md)" }}>
                Phone:{" "}
                <a href="tel:07790163439">
                  <span className="num">07790 163439</span>
                </a>
              </p>
              <ul className="hours-list" aria-label="Opening hours">
                <li>Monday to Friday: 8:00 AM to 8:00 PM</li>
                <li>Saturday: Closed</li>
                <li>Sunday: Closed</li>
              </ul>
              <div className="map-embed">
                <iframe
                  title="Chestnut Trees and Fencing service area near Exeter EX5"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://maps.google.com/maps?q=Newton+St+Cyres+Exeter+EX5&amp;t=&amp;z=12&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
                  allowFullScreen
                />
              </div>
              <p style={{ marginTop: "var(--gap-md)" }}>
                <a href={`https://maps.google.com/?cid=${mapsCid}`} target="_blank" rel="noopener noreferrer">
                  View on Google Maps
                </a>
              </p>
            </div>
          </div>
        </section>

        <section
          className="section section-dark"
          id="quote"
          data-section-id="contact"
          data-od-id="simple-contact"
        >
          <div className="container contact-grid">
            <div>
              <h2>Get a quote from Chestnut Trees &amp; Fencing</h2>
              <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                Call Dan directly or send your job details using the form. There is no email address on the business
                listing.
              </p>
              <div className="contact-card">
                <h3>Phone</h3>
                <a href="tel:07790163439">
                  <span className="num">07790 163439</span>
                </a>
                <p>Call Monday to Friday, 8:00 AM to 8:00 PM, to discuss tree work, hedges or fencing.</p>
              </div>
            </div>

            <QuoteForm />
          </div>
        </section>
      </main>

      <footer className="pagefoot" data-od-id="footer">
        <div className="container">
          <div className="pagefoot-grid">
            <div>
              <p className="pagefoot-brand">Chestnut Trees &amp; Fencing</p>
              <p>Tree surgery and fencing in Exeter and nearby.</p>
              <p>
                <a href="tel:07790163439">
                  <span className="num">07790 163439</span>
                </a>
              </p>
            </div>
            <div>
              <p className="pagefoot-heading">Quick links</p>
              <ul className="pagefoot-links">
                <li>
                  <a href="#work">Work</a>
                </li>
                <li>
                  <a href="#services">Services</a>
                </li>
                <li>
                  <a href="#reviews">Reviews</a>
                </li>
                <li>
                  <a href="#quote">Get a quote</a>
                </li>
              </ul>
            </div>
            <div>
              <p className="pagefoot-heading">Service areas</p>
              <ul className="pagefoot-links">
                <li>Exeter</li>
                <li>Newton St Cyres</li>
                <li>Sweetham</li>
                <li>EX5 5AR</li>
              </ul>
            </div>
            <div>
              <p className="pagefoot-heading">Opening hours</p>
              <ul className="pagefoot-links">
                <li>Mon-Fri: 8:00 AM - 8:00 PM</li>
                <li>Sat-Sun: Closed</li>
              </ul>
            </div>
          </div>
          <div className="pagefoot-inner">
            <span>&copy; {year} Chestnut Trees &amp; Fencing</span>
            <span>
              <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
                Website by WebForTrades
              </a>
            </span>
          </div>
        </div>
      </footer>

      <div className="mobile-call-bar" id="mobile-call-bar" aria-hidden="true">
        <a href="tel:07790163439">
          Call <span className="num">07790 163439</span>
        </a>
        <a href="#quote">Get a quote</a>
      </div>
    </>
  );
}
