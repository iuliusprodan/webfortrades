import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

const phone = "07504 684804";
const phoneTel = "07504684804";
const email = "edgar.landscapes1@gmail.com";

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>

      <header className="topnav" data-od-id="topnav">
        <div className="container topnav-inner">
          <a className="logo" href="#top">
            Edgar Landscapes <span>&amp; driveways Ltd</span>
          </a>
          <nav className="nav-desktop" aria-label="Primary">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#reviews">Reviews</a>
            <a href="#coverage">Coverage</a>
            <a href="#quote">Contact</a>
          </nav>
          <a className="btn btn-primary" href={`tel:${phoneTel}`}>
            Call <span className="num">{phone}</span>
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
            <a className="btn btn-primary" href={`tel:${phoneTel}`}>
              Call <span className="num">{phone}</span>
            </a>
          </div>
        </div>
      </header>

      <main id="content">
        <section
          className="section section-cool hero"
          id="top"
          data-section-id="review-led-hero"
          data-od-id="review-led-hero"
        >
          <div className="container hero-split">
            <div>
              <div className="hero-meta">
                <span className="tag">Landscaping · Liverpool</span>
                <span className="pill">
                  <span className="num">5</span> Google rating
                </span>
              </div>
              <blockquote className="hero-quote">
                <p>
                  &ldquo;After meeting Bill, Josh and Tony, it was clear from the very start we didn&rsquo;t need to
                  search other companies.&rdquo;
                </p>
                <cite>andrew · Google review</cite>
              </blockquote>
              <p className="lead">
                Garden transformations, driveways and structural building work across Liverpool. Bill leads a team
                customers describe as passionate, tidy and meticulous on every detail.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#quote">
                  Get a quote
                </a>
                <a className="btn btn-secondary" href={`tel:${phoneTel}`}>
                  Call <span className="num">{phone}</span>
                </a>
              </div>
            </div>
            <figure className="hero-image">
              <img
                src="/assets/images/01-places.webp"
                alt="Landscaped garden with decking and raised planters by Edgar Landscapes in Liverpool"
                width={800}
                height={1000}
              />
            </figure>
          </div>
        </section>

        <section
          className="section section-accent"
          data-section-id="stats-sourced-only"
          data-od-id="stats-sourced-only"
        >
          <div className="container">
            <div className="stats-row">
              <div className="stat-card stat-card-accent">
                <div className="stat-num stat-num-accent num">5</div>
                <p className="stat-label">Google rating for Edgar Landscapes &amp; driveways Ltd.</p>
              </div>
              <div className="stat-card">
                <div className="stat-num num">40</div>
                <p className="stat-label">Written Google reviews you can read before you book.</p>
              </div>
              <div className="stat-card">
                <div className="stat-num">Liverpool</div>
                <p className="stat-label">Based at 232 Muirhead Ave E, Liverpool L11 1EP.</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section-surface"
          data-section-id="what-customers-keep-mentioning"
          data-od-id="what-customers-keep-mentioning"
        >
          <div className="container">
            <div className="section-head">
              <h2>What Liverpool customers mention most</h2>
              <p className="lead">
                Repeated praise in Google reviews centres on workmanship, communication and how carefully the team
                leaves each site.
              </p>
            </div>
            <div className="theme-grid">
              <article className="theme-card">
                <h3>Highest standard finish</h3>
                <p>
                  Customers describe driveways, gardens and structural work completed to a very high standard, with
                  pride taken in every stage.
                </p>
              </article>
              <article className="theme-card">
                <h3>Clear communication</h3>
                <p>
                  Bill keeps customers updated on timelines and explains each step so you know what to expect as the
                  project progresses.
                </p>
              </article>
              <article className="theme-card">
                <h3>Attention to detail</h3>
                <p>
                  Reviewers mention tiles changed without the customer noticing, practical suggestions that improve
                  original plans, and respectful care for neighbouring properties.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="work" data-section-id="gallery-lean" data-od-id="gallery-lean">
          <div className="container">
            <div className="section-head">
              <h2>Recent landscaping work in Liverpool</h2>
              <p className="lead">
                Photos from the business Google listing showing finished gardens, driveways and outdoor projects.
              </p>
            </div>
            <div className="gallery-clusters">
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/02-places.webp"
                    alt="Landscaping project in Liverpool"
                    loading="lazy"
                    width={900}
                    height={600}
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/03-places.webp"
                    alt="Garden work in Liverpool"
                    loading="lazy"
                    width={700}
                    height={600}
                  />
                </figure>
              </div>
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/04-places.webp"
                    alt="Driveway or paving in Liverpool"
                    loading="lazy"
                    width={700}
                    height={600}
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/05-places.webp"
                    alt="Outdoor landscaping in Liverpool"
                    loading="lazy"
                    width={900}
                    height={600}
                  />
                </figure>
              </div>
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/06-places.webp"
                    alt="Finished garden landscaping in Liverpool"
                    loading="lazy"
                    width={900}
                    height={600}
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/07-places.webp"
                    alt="Patio or paving work in Liverpool"
                    loading="lazy"
                    width={700}
                    height={600}
                  />
                </figure>
              </div>
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/08-places.webp"
                    alt="Landscaping and building work in Liverpool"
                    loading="lazy"
                    width={700}
                    height={600}
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/09-places.webp"
                    alt="Garden transformation in Liverpool"
                    loading="lazy"
                    width={900}
                    height={600}
                  />
                </figure>
              </div>
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/10-places.webp"
                    alt="Completed outdoor project in Liverpool"
                    loading="lazy"
                    width={900}
                    height={600}
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/01-places.webp"
                    alt="Decking and planters by Edgar Landscapes"
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
          data-section-id="service-explainers"
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
                <h3>Garden landscaping</h3>
                <p>
                  Full garden transformations including turf, planting, patios and outdoor layouts. Customers praise
                  practical advice on materials and finishes that suit their home.
                </p>
              </article>
              <article className="service-card">
                <h3>Driveways</h3>
                <p>
                  New driveways laid with care at every stage. Reviewers mention Bill&rsquo;s &ldquo;trust the
                  process&rdquo; approach and driveways finished clean, tidy and on time.
                </p>
              </article>
              <article className="service-card">
                <h3>Building and structural work</h3>
                <p>
                  Walls and wider building and construction work alongside outdoor projects. Structural jobs are
                  discussed step by step so you stay happy as work progresses.
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
            <div className="lead-panel">
              <div className="lead-mark" aria-hidden="true">
                B
              </div>
              <div>
                <h2>What customers say</h2>
                <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                  Google reviewers refer to Bill when describing communication, quality checks and the team he leads
                  with Josh and Tony.
                </p>
                <p style={{ marginTop: "var(--gap-md)", maxWidth: "58ch" }}>
                  &ldquo;Bill communicated well throughout the whole process, so we knew what to expect and how the
                  timeline was progressing. He gave great advice in relation to what materials would work best for
                  us.&rdquo; When you call <a href={`tel:${phoneTel}`}><span className="num">{phone}</span></a> or
                  email <a href={`mailto:${email}`}>{email}</a>, you reach the person customers name in their reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section-cool"
          data-section-id="process-section"
          data-od-id="process-section"
        >
          <div className="container">
            <div className="section-head">
              <h2>How a job with us works</h2>
              <p className="lead">
                A straightforward sequence from first contact to a finished, tidy site, based on how customers
                describe their projects.
              </p>
            </div>
            <div className="process-list">
              <article className="process-step">
                <h3>Discuss your project</h3>
                <p>
                  Call or email to explain the garden, driveway or building work you need. Bill, Josh and Tony listen
                  to what you want before quoting.
                </p>
              </article>
              <article className="process-step">
                <h3>Plan on site</h3>
                <p>
                  Options are explained on site with practical suggestions along the way, including structural details
                  where walls or paving are involved.
                </p>
              </article>
              <article className="process-step">
                <h3>Work with updates</h3>
                <p>
                  The team progresses the job while keeping you aware of what is happening and checking you are happy
                  at each stage.
                </p>
              </article>
              <article className="process-step">
                <h3>Finish clean and tidy</h3>
                <p>
                  Everything is left clean and tidy, with small details checked even when you might not notice them
                  yourself.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="reviews" data-section-id="review-wall" data-od-id="review-wall">
          <div className="container reviews-layout">
            <div>
              <h2>5 on Google reviews</h2>
              <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                Customer feedback shared on Google for Edgar Landscapes &amp; driveways Ltd.
              </p>
              <div className="review-stack" style={{ marginTop: "var(--gap-lg)" }}>
                <article className="review-card">
                  <blockquote>
                    <p>
                      &ldquo;All the work completed is done to the highest standard and everything was discussed
                      making sure we were happy with it as it progressed. I would 100% recommend them.&rdquo;
                    </p>
                  </blockquote>
                  <cite>andrew · Google review</cite>
                </article>
                <article className="review-card">
                  <blockquote>
                    <p>
                      &ldquo;Bill&rsquo;s motto, trust the process, really shone through in the quality and
                      craftsmanship of the finished driveway. We are absolutely delighted with the final outcome.&rdquo;
                    </p>
                  </blockquote>
                  <cite>david · Google review</cite>
                </article>
                <article className="review-card">
                  <blockquote>
                    <p>
                      &ldquo;We are delighted with the transformation Edgar Landscapes have done to our garden. Their
                      workmanship is fantastic.&rdquo;
                    </p>
                  </blockquote>
                  <cite>Rebecca · Google review</cite>
                </article>
                <article className="review-card">
                  <blockquote>
                    <p>
                      &ldquo;Bill pays attention to the tiniest of detail to ensure best outcome for us. Fantastic job,
                      fantastic lads and I wouldn&rsquo;t hesitate to recommend them.&rdquo;
                    </p>
                  </blockquote>
                  <cite>Dave · Google review</cite>
                </article>
                <article className="review-card">
                  <blockquote>
                    <p>
                      &ldquo;Their workmanship is second to none and site tidiness was meticulous. Bill and the two
                      lads were polite and respectful.&rdquo;
                    </p>
                  </blockquote>
                  <cite>Peter · Google review</cite>
                </article>
              </div>
              <p style={{ marginTop: "var(--gap-md)" }}>
                <a
                  className="btn btn-secondary"
                  href="https://maps.google.com/?cid=9980755847186953696"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read all 40 reviews on Google Maps
                </a>
              </p>
            </div>
            <aside className="review-score">
              <div className="stat-num stat-num-accent num">5</div>
              <p className="stat-label" style={{ marginInline: "auto" }}>
                Average Google rating
              </p>
              <p className="meta" style={{ marginTop: "var(--gap-sm)" }}>
                <span className="num">40</span> reviews
              </p>
            </aside>
          </div>
        </section>

        <section
          className="section section-accent"
          id="coverage"
          data-section-id="local-coverage"
          data-od-id="local-coverage"
        >
          <div className="container coverage-grid">
            <div>
              <h2>Based in Liverpool</h2>
              <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                Edgar Landscapes &amp; driveways Ltd works across Liverpool and the surrounding area.
              </p>
              <div className="area-list">
                <span className="area-tag">Liverpool</span>
                <span className="area-tag">L11 1EP</span>
              </div>
            </div>
            <div className="map-panel">
              <h3>Business address</h3>
              <address>
                Edgar Landscapes &amp; driveways Ltd
                <br />
                232 Muirhead Ave E
                <br />
                Liverpool L11 1EP
              </address>
              <p className="meta" style={{ marginTop: "var(--gap-md)" }}>
                Phone:{" "}
                <a href={`tel:${phoneTel}`}>
                  <span className="num">{phone}</span>
                </a>
              </p>
              <p className="meta">
                Email: <a href={`mailto:${email}`}>{email}</a>
              </p>
              <ul className="hours-list" aria-label="Opening hours">
                <li>Monday: 9:00 AM to 7:00 PM</li>
                <li>Tuesday to Friday: 9:00 AM to 7:30 PM</li>
                <li>Saturday: 9:00 AM to 7:30 PM</li>
                <li>Sunday: Closed</li>
              </ul>
              <p style={{ marginTop: "var(--gap-md)" }}>
                <a
                  href="https://maps.google.com/?cid=9980755847186953696"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              </p>
            </div>
          </div>
        </section>

        <section
          className="section section-dark"
          id="contact"
          data-section-id="simple-contact"
          data-od-id="simple-contact"
        >
          <div className="container contact-grid">
            <div>
              <h2>Get a quote from Edgar Landscapes &amp; driveways Ltd</h2>
              <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                Call Bill directly, send an email, or use the form to prepare your job details before you contact the
                team.
              </p>
              <div className="contact-card">
                <h3>Phone</h3>
                <a href={`tel:${phoneTel}`}>
                  <span className="num">{phone}</span>
                </a>
                <p>
                  Call Monday to Saturday during opening hours to discuss landscaping, driveways or building work.
                </p>
              </div>
              <div className="contact-card">
                <h3>Email</h3>
                <a href={`mailto:${email}`}>{email}</a>
                <p>Send photos and a short description of the work you need and Bill can reply with next steps.</p>
              </div>
            </div>

            <QuoteForm />
          </div>
        </section>
      </main>

      <footer className="pagefoot" data-od-id="footer">
        <div className="container pagefoot-inner">
          <span>&copy; Edgar Landscapes &amp; driveways Ltd</span>
          <span>
            <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
              Website by WebForTrades
            </a>
          </span>
        </div>
      </footer>

      <div className="mobile-call-bar" id="mobile-call-bar" aria-hidden="true">
        <a href={`tel:${phoneTel}`}>Call {phone}</a>
        <a href="#quote">Get a quote</a>
      </div>

      <SiteEnhancements />
    </>
  );
}
