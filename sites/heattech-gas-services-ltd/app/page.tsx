import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

const phone = "07506 042175";
const phoneTel = "07506042175";

export default function HomePage() {
  return (
    <>
      <header className="site-header" id="site-header" data-od-id="header">
        <div className="container">
          <div className="header-inner">
            <div className="brand">
              <span className="brand-name">Heattech Gas Services Ltd</span>
              <span className="brand-tag">Edinburgh · Building &amp; construction</span>
            </div>
            <nav className="header-nav" aria-label="Primary">
              <a href="#services">Services</a>
              <a href="#gallery">Work</a>
              <a href="#reviews">Reviews</a>
              <a href="#quote">Contact</a>
            </nav>
            <div className="header-actions">
              <a className="btn btn-ghost" href={`tel:${phoneTel}`}>
                {phone}
              </a>
              <a className="btn btn-primary" href="#quote">
                Get a quote
              </a>
              <button
                className="menu-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="mobile-nav"
                aria-label="Open menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile">
            <a href="#services">Services</a>
            <a href="#gallery">Work</a>
            <a href="#reviews">Reviews</a>
            <a href="#quote">Contact</a>
            <a href={`tel:${phoneTel}`}>Call {phone}</a>
          </nav>
        </div>
      </header>

      <main>
        <section
          className="hero"
          data-section-id="review-led-hero"
          data-od-id="review-led-hero"
          aria-labelledby="hero-heading"
        >
          <div className="container hero-grid">
            <div className="reveal">
              <h1 className="hero-quote" id="hero-heading">
                &ldquo;I have had both Brett and Ryan visit on separate issues with my boiler.&rdquo;
                <cite>Google review</cite>
              </h1>
              <p className="hero-lead">
                Heattech Gas Services Ltd serves Edinburgh EH15 for building, plumbing, heating and gas work.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#quote">
                  Get a quote
                </a>
                <a className="btn btn-ghost" href={`tel:${phoneTel}`}>
                  Call {phone}
                </a>
              </div>
            </div>
            <figure className="hero-visual reveal">
              <img
                src="/assets/images/06-places.webp"
                alt="Recent plumbing and heating work carried out by Heattech Gas Services Ltd in Edinburgh"
                width={1600}
                height={1200}
                fetchPriority="high"
              />
            </figure>
          </div>
        </section>

        <section
          className="proof-strip"
          data-section-id="stats-sourced-only"
          data-od-id="stats-sourced-only"
          aria-label="Business details"
        >
          <div className="container proof-grid">
            <div className="proof-item">
              <strong>Edinburgh EH15</strong>
              <span>Service area</span>
            </div>
            <div className="proof-item">
              <strong>Building &amp; construction</strong>
              <span>Registered trade</span>
            </div>
            <div className="proof-item">
              <strong>{phone}</strong>
              <span>Direct line</span>
            </div>
          </div>
        </section>

        <section
          className="emergency"
          data-section-id="emergency-callout"
          data-od-id="emergency-callout"
          aria-labelledby="emergency-heading"
        >
          <div className="container emergency-inner reveal">
            <div>
              <h2 id="emergency-heading">Emergency plumbing and heating callouts</h2>
              <p>
                When a leak, loss of heating or boiler fault cannot wait, call Heattech Gas Services Ltd on the
                number below.
              </p>
            </div>
            <a className="emergency-phone" href={`tel:${phoneTel}`}>
              {phone}
            </a>
          </div>
        </section>

        <section
          className="gallery"
          id="gallery"
          data-section-id="gallery-lean"
          data-od-id="gallery-lean"
          aria-labelledby="gallery-heading"
        >
          <div className="container">
            <header className="section-head reveal">
              <h2 id="gallery-heading">Recent plumbing work in Edinburgh</h2>
              <p>Photographs from recent jobs across the Edinburgh area.</p>
            </header>
            <div className="gallery-grid">
              <figure className="gallery-item reveal">
                <img
                  src="/assets/images/01-places.webp"
                  alt="Plumbing work in Edinburgh by Heattech Gas Services Ltd"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure className="gallery-item reveal">
                <img
                  src="/assets/images/02-places.webp"
                  alt="Heating installation detail in Edinburgh"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure className="gallery-item reveal">
                <img
                  src="/assets/images/03-places.webp"
                  alt="Pipework and fittings on a recent Edinburgh job"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure className="gallery-item reveal">
                <img
                  src="/assets/images/04-places.webp"
                  alt="Bathroom plumbing work in Edinburgh"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure className="gallery-item reveal">
                <img
                  src="/assets/images/08-places.webp"
                  alt="Central heating work completed in Edinburgh"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure className="gallery-item reveal">
                <img
                  src="/assets/images/09-places.webp"
                  alt="Gas and heating service work in Edinburgh"
                  width={1600}
                  height={1200}
                  loading="lazy"
                />
              </figure>
              <figure className="gallery-item reveal">
                <img
                  src="/assets/images/10-places.webp"
                  alt="Completed plumbing job in the Edinburgh area"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
            </div>
          </div>
        </section>

        <section
          className="services"
          id="services"
          data-section-id="service-explainers"
          data-od-id="service-explainers"
          aria-labelledby="services-heading"
        >
          <div className="container">
            <header className="section-head reveal">
              <h2 id="services-heading">5 services explained plainly</h2>
              <p>Work covered by Heattech Gas Services Ltd, drawn from the business profile and service scope.</p>
            </header>
            <ul className="services-list">
              <li className="service-card reveal">
                <h3>Gas services</h3>
                <p>Gas work carried out under the Heattech Gas Services Ltd name for homes across Edinburgh EH15.</p>
              </li>
              <li className="service-card reveal">
                <h3>Plumbing</h3>
                <p>
                  General plumbing repairs and installations, including the bathroom and pipework shown in recent job
                  photographs.
                </p>
              </li>
              <li className="service-card reveal">
                <h3>Heating</h3>
                <p>Heating system support, including boiler issues attended by engineers named in customer reviews.</p>
              </li>
              <li className="service-card reveal">
                <h3>Emergency callouts</h3>
                <p>Urgent plumbing and heating attendance when a fault needs prompt attention.</p>
              </li>
              <li className="service-card reveal">
                <h3>Building &amp; construction</h3>
                <p>Building and construction work as registered for Heattech Gas Services Ltd in Edinburgh.</p>
              </li>
            </ul>
          </div>
        </section>

        <section
          className="featured-review"
          data-section-id="featured-review-story"
          data-od-id="featured-review-story"
          aria-labelledby="featured-heading"
        >
          <div className="container">
            <header className="section-head reveal">
              <h2 id="featured-heading">What customers say</h2>
              <p>Engineers Brett and Ryan are both named in Google feedback for separate boiler visits.</p>
            </header>
            <div className="featured-panel reveal">
              <blockquote>
                <p>&ldquo;I have had both Brett and Ryan visit on separate issues with my boiler.&rdquo;</p>
              </blockquote>
              <div className="featured-names">
                <span className="name-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path d="M20 21a8 8 0 1 0-16 0" />
                    <circle cx="12" cy="8" r="4" />
                  </svg>
                  Brett
                </span>
                <span className="name-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path d="M20 21a8 8 0 1 0-16 0" />
                    <circle cx="12" cy="8" r="4" />
                  </svg>
                  Ryan
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="process"
          data-section-id="process-section"
          data-od-id="process-section"
          aria-labelledby="process-heading"
        >
          <div className="container">
            <header className="section-head reveal">
              <h2 id="process-heading">How a job with us works</h2>
              <p>A straightforward path from first contact to completed work.</p>
            </header>
            <ol className="process-steps">
              <li className="process-step reveal">
                <h3>Get in touch</h3>
                <p>Call {phone} or send a quote request with a short description of the job.</p>
              </li>
              <li className="process-step reveal">
                <h3>Discuss the issue</h3>
                <p>Explain what needs attention so the right engineer and visit can be arranged.</p>
              </li>
              <li className="process-step reveal">
                <h3>Engineer attends</h3>
                <p>An engineer such as Brett or Ryan visits to assess and carry out the required work.</p>
              </li>
              <li className="process-step reveal">
                <h3>Job completed</h3>
                <p>Work is finished and you know where to call if anything else needs attention.</p>
              </li>
            </ol>
          </div>
        </section>

        <section
          className="reviews"
          id="reviews"
          data-section-id="review-wall"
          data-od-id="review-wall"
          aria-labelledby="reviews-heading"
        >
          <div className="container">
            <header className="section-head reveal">
              <h2 id="reviews-heading">5 on Google reviews</h2>
              <p>Feedback published on Google for Heattech Gas Services Ltd.</p>
            </header>
            <article className="review-card reveal">
              <blockquote>
                <p>&ldquo;I have had both Brett and Ryan visit on separate issues with my boiler.&rdquo;</p>
              </blockquote>
            </article>
          </div>
        </section>

        <section
          className="local"
          data-section-id="local-coverage"
          data-od-id="local-coverage"
          aria-labelledby="local-heading"
        >
          <div className="container local-grid reveal">
            <div>
              <h2 id="local-heading">Based in Edinburgh</h2>
              <p>
                Heattech Gas Services Ltd serves Edinburgh EH15 and surrounding areas for building, plumbing, heating
                and gas work.
              </p>
              <span className="local-tag">Edinburgh EH15 3FD</span>
            </div>
            <figure>
              <img
                className="local-photo"
                src="/assets/images/10-places.webp"
                alt="Plumbing and heating work in the Edinburgh area"
                width={1200}
                height={1600}
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        <section
          className="contact"
          id="contact"
          data-section-id="simple-contact"
          data-od-id="simple-contact"
          aria-labelledby="contact-heading"
        >
          <div className="container contact-grid">
            <div className="reveal">
              <h2 id="contact-heading">Get a quote from Heattech Gas Services Ltd</h2>
              <p className="contact-intro">
                Describe the job and we will come back to arrange a visit or provide a quote. For urgent faults, call
                the line below.
              </p>
              <a className="contact-phone" href={`tel:${phoneTel}`}>
                {phone}
              </a>
            </div>
            <QuoteForm />
          </div>
        </section>
      </main>

      <footer className="site-footer" data-od-id="footer">
        <div className="container footer-inner">
          <span>&copy; Heattech Gas Services Ltd</span>
          <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
            Website by WebForTrades
          </a>
        </div>
      </footer>

      <div className="mobile-sticky" id="mobile-sticky" role="region" aria-label="Quick actions">
        <a className="btn btn-primary" href="#quote">
          Get a quote
        </a>
        <a className="btn btn-ghost" href={`tel:${phoneTel}`}>
          Call
        </a>
      </div>

      <SiteEnhancements />
    </>
  );
}
