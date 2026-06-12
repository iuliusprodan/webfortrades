import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

const phone = "07760 104629";
const phoneTel = "07760104629";

export default function HomePage() {
  return (
    <>
      <header className="topnav" data-od-id="topnav">
        <div className="container topnav-inner">
          <a className="logo" href="#top">
            M. Ross building services
          </a>
          <nav className="nav-desktop" aria-label="Primary">
            <a href="#reviews">Reviews</a>
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#quote">Contact</a>
          </nav>
          <a className="btn btn-primary nav-desktop" href="#quote">
            Get a quote
          </a>
          <button
            className="nav-toggle"
            id="nav-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="nav-mobile"
            aria-label="Open menu"
          >
            Menu
          </button>
          <nav className="nav-mobile" id="nav-mobile" aria-label="Mobile">
            <a href="#reviews">Reviews</a>
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#quote">Contact</a>
            <a href={`tel:${phoneTel}`}>Call {phone}</a>
          </nav>
        </div>
      </header>

      <main id="content">
        <section
          className="section section--cool hero"
          data-section-id="review-led-hero"
          data-od-id="review-led-hero"
          id="top"
        >
          <div className="container hero-grid">
            <div>
              <p className="rating-pill">
                <strong>5.0</strong> from 13 Google reviews
              </p>
              <blockquote className="hero-quote">
                Like many older properties in Brighton, mine is suffering the wear and tear of wind and rain, with
                the firewalls in particular admitting water through cracks.
                <cite>Mat, Google review</cite>
              </blockquote>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#quote">
                  Get a quote
                </a>
                <a className="btn btn-secondary" href={`tel:${phoneTel}`}>
                  Call {phone}
                </a>
              </div>
            </div>
            <figure className="hero-visual">
              <img
                src="/assets/images/05-places.webp"
                alt="Completed roofing project photographed in Brighton"
                width={1600}
                height={900}
                fetchPriority="high"
              />
            </figure>
          </div>
        </section>

        <section
          className="section section--accent"
          data-section-id="stats-sourced-only"
          data-od-id="stats-sourced-only"
        >
          <div className="container stats-band">
            <div>
              <div className="stat-num num">5.0</div>
              <p className="stat-label">Average rating on Google</p>
            </div>
            <div>
              <div className="stat-num num">13</div>
              <p className="stat-label">Verified Google reviews</p>
            </div>
            <div>
              <div className="stat-num num">24/7</div>
              <p className="stat-label">Open every day, including weekends</p>
            </div>
          </div>
        </section>

        <section
          className="section section--surface"
          data-section-id="what-customers-keep-mentioning"
          data-od-id="what-customers-keep-mentioning"
        >
          <div className="container">
            <h2>What Brighton customers mention most</h2>
            <p className="lead" style={{ marginTop: "16px" }}>
              Repeated praise from Google reviews, not marketing copy.
            </p>
            <div className="themes-grid" style={{ marginTop: "40px" }}>
              <article className="theme-card">
                <h3>On time and professional</h3>
                <p>Callum noted the team came on time and were professional through and through.</p>
              </article>
              <article className="theme-card">
                <h3>Weatherproof results</h3>
                <p>Callum&apos;s roof has stayed weatherproof going into year five.</p>
              </article>
              <article className="theme-card">
                <h3>Happy with job and price</h3>
                <p>Connor was very happy with the full roof, the extras, and the price.</p>
              </article>
              <article className="theme-card">
                <h3>Work documented in photos</h3>
                <p>Mat praised the team for documenting what needed doing and the finished results.</p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section"
          data-section-id="gallery-lean"
          data-od-id="gallery-lean"
          id="work"
        >
          <div className="container">
            <h2 className="gallery-heading">Recent roofing work in Brighton</h2>
            <div className="gallery-clusters">
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/01-places.webp"
                    alt="Completed roofing project in Brighton"
                    width={1200}
                    height={1600}
                    loading="lazy"
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/02-places.webp"
                    alt="Completed roofing project in Brighton"
                    width={1200}
                    height={1600}
                    loading="lazy"
                  />
                </figure>
              </div>
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/07-places.webp"
                    alt="Completed roofing project in Brighton"
                    width={1600}
                    height={1200}
                    loading="lazy"
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/08-places.webp"
                    alt="Completed roofing project in Brighton"
                    width={1600}
                    height={1200}
                    loading="lazy"
                  />
                </figure>
              </div>
              <div className="gallery-cluster">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/09-places.webp"
                    alt="Completed roofing project in Brighton"
                    width={1600}
                    height={1200}
                    loading="lazy"
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/10-places.webp"
                    alt="Completed roofing project in Brighton"
                    width={1125}
                    height={861}
                    loading="lazy"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section--surface"
          data-section-id="service-explainers"
          data-od-id="service-explainers"
          id="services"
        >
          <div className="container">
            <h2>3 services explained plainly</h2>
            <p className="lead" style={{ marginTop: "16px" }}>
              Taken from what customers describe in their reviews.
            </p>
            <div className="services-list" style={{ marginTop: "40px" }}>
              <article className="service-row">
                <h3>Full roof work</h3>
                <p>
                  Connor had a full roof completed with additional extras. Numan and Kj both describe professional
                  roofing work they would recommend.
                </p>
              </article>
              <article className="service-row">
                <h3>Weatherproofing and firewall repair</h3>
                <p>
                  Mat&apos;s review describes firewall cracks letting in water, then repair and further weatherproofing
                  to stop wind and rain getting through.
                </p>
              </article>
              <article className="service-row">
                <h3>Rendering, gutters and exterior finishing</h3>
                <p>
                  While scaffolding was in place, Mat&apos;s job also included rendering cracks filled, a dodgy gutter
                  repaired, and the front of the house repainted.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section section--warm"
          data-section-id="featured-review-story"
          data-od-id="featured-review-story"
        >
          <div className="container story-block">
            <blockquote className="story-quote">
              Mark and his team are very efficient, friendly and document in photos what work needs to be done and the
              finished results. I couldn&apos;t recommend them more highly.
              <cite>Mat, Google review</cite>
            </blockquote>
            <figure className="story-visual">
              <img
                src="/assets/images/03-places.webp"
                alt="Exterior building work completed by M. Ross building services"
                width={1200}
                height={1600}
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        <section
          className="section section--cool"
          data-section-id="process-section"
          data-od-id="process-section"
        >
          <div className="container">
            <h2>How a job with us works</h2>
            <p className="lead" style={{ marginTop: "16px" }}>
              Based on what customers say happens on site, not a generic checklist.
            </p>
            <div className="process-steps">
              <article className="process-step">
                <h3>Call about the job</h3>
                <p>
                  Reach the team on {phone}. No email is listed publicly, so phone or WhatsApp is the route customers
                  use.
                </p>
              </article>
              <article className="process-step">
                <h3>Assess and photograph</h3>
                <p>Mat&apos;s review notes the team document in photos what work needs doing before starting.</p>
              </article>
              <article className="process-step">
                <h3>Carry out the work</h3>
                <p>
                  Reviews mention roofing, weatherproofing, rendering, gutter repair and repainting while access is
                  available.
                </p>
              </article>
              <article className="process-step">
                <h3>Finish and show results</h3>
                <p>
                  Customers describe professional work, on-time arrival, and finished results they are happy to
                  recommend.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section"
          data-section-id="review-wall"
          data-od-id="review-wall"
          id="reviews"
        >
          <div className="container">
            <h2>5 on Google reviews</h2>
            <p className="lead" style={{ marginTop: "16px" }}>
              Full quotes from verified Google reviews.
            </p>
            <div className="reviews-grid" style={{ marginTop: "40px" }}>
              <article className="review-card">
                <p className="review-stars">5 stars</p>
                <p className="review-text">
                  Like many older properties in Brighton, mine is suffering the wear and tear of wind and rain, with
                  the firewalls in particular admitting water through cracks. Mark and his team repaired and added
                  further weatherproofing to the firewalls, and, while the scaffolding was up, filled in cracks in the
                  rendering, repaired a dodgy gutter and, to seal the deal, repainted the front of the house to cheer
                  the place up. Mark and his team are very efficient, friendly and document in photos what work needs to
                  be done and the finished results. I couldn&apos;t recommend them more highly.
                </p>
                <p className="review-author">Mat</p>
              </article>
              <article className="review-card">
                <p className="review-stars">5 stars</p>
                <p className="review-text">
                  Fantastic service they came on time and were professional through and through…roof is weather proof
                  going on to year 5. Couldn&apos;t recommend enough.
                </p>
                <p className="review-author">Callum</p>
              </article>
              <article className="review-card">
                <p className="review-stars">5 stars</p>
                <p className="review-text">
                  Mr Ross did a Full roof with lots of other extras we were very happy with the job and price would
                  definitely definitely recommend
                </p>
                <p className="review-author">Connor</p>
              </article>
              <article className="review-card">
                <p className="review-stars">5 stars</p>
                <p className="review-text">
                  Amazing professional work had a great experience using this company would recommend highly
                </p>
                <p className="review-author">Numan</p>
              </article>
              <article className="review-card">
                <p className="review-stars">5 stars</p>
                <p className="review-text">
                  What great guy with a real good skills I would highly recommend using him
                </p>
                <p className="review-author">Kj</p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section section--accent"
          data-section-id="local-coverage"
          data-od-id="local-coverage"
        >
          <div className="container local-grid">
            <div>
              <h2>Based in Brighton</h2>
              <p className="lead" style={{ marginTop: "16px" }}>
                Brighton and Hove, BN1.
              </p>
              <div className="local-details" style={{ marginTop: "32px" }}>
                <div className="local-row">
                  <strong>Service area</strong>
                  Brighton and Hove, including BN1
                </div>
                <div className="local-row">
                  <strong>Opening hours</strong>
                  Open 24 hours, Monday to Sunday
                </div>
                <div className="local-row">
                  <strong>Google listing</strong>
                  <a
                    href="https://maps.google.com/?cid=6879426606290362114"
                    style={{ textDecoration: "underline" }}
                    rel="noopener noreferrer"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>
            <figure className="local-map">
              <img
                src="/assets/images/04-places.webp"
                alt="Building exterior in the Brighton service area"
                width={1125}
                height={1472}
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        <section
          className="section section--dark"
          data-section-id="simple-contact"
          data-od-id="simple-contact"
          id="contact"
        >
          <div className="container contact-grid">
            <div>
              <h2>Get a quote from M. Ross building services</h2>
              <p className="lead" style={{ marginTop: "16px" }}>
                Phone is the listed contact route. WhatsApp is available on this mobile number.
              </p>
              <p className="contact-phone" style={{ marginTop: "28px" }}>
                <a href={`tel:${phoneTel}`}>{phone}</a>
              </p>
              <div className="contact-actions">
                <a className="btn btn-primary" href="#quote">
                  Request a quote
                </a>
                <a className="btn btn-secondary" href={`tel:${phoneTel}`}>
                  Call now
                </a>
                <a className="btn btn-secondary" href="https://wa.me/447760104629">
                  Message on WhatsApp
                </a>
              </div>
            </div>
            <QuoteForm />
          </div>
        </section>
      </main>

      <footer className="pagefoot" data-od-id="footer" id="footer">
        <div className="container">
          <div
            className="pagefoot-inner"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "var(--gap-lg)",
              marginBottom: "var(--gap-xl)",
              alignItems: "start",
            }}
          >
            <div>
              <p className="logo" style={{ marginBottom: "8px" }}>
                M. Ross building services
              </p>
              <p>Roofing in Brighton and Hove.</p>
              <p style={{ marginTop: "8px" }}>
                <a href={`tel:${phoneTel}`}>{phone}</a>
              </p>
            </div>
            <div>
              <p className="meta" style={{ marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Quick links
              </p>
              <p>
                <a href="#work">Work</a>
              </p>
              <p>
                <a href="#services">Services</a>
              </p>
              <p>
                <a href="#reviews">Reviews</a>
              </p>
              <p>
                <a href="#quote">Get a quote</a>
              </p>
            </div>
            <div>
              <p className="meta" style={{ marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Service areas
              </p>
              <p>Brighton</p>
              <p>Brighton and Hove</p>
              <p>BN1</p>
            </div>
            <div>
              <p className="meta" style={{ marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Opening hours
              </p>
              <p>Open 24 hours</p>
              <p>Monday to Sunday</p>
            </div>
          </div>
          <div className="pagefoot-inner">
            <span>© M. Ross building services</span>
            <span>
              <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
                Website by WebForTrades
              </a>
            </span>
          </div>
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
