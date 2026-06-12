import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

const year = new Date().getFullYear();
const mapsCid = "5408751554141722089";

export default function HomePage() {
  return (
    <>
      <SiteEnhancements />

      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="The Lock Dr home">
            <span className="brand-name">The Lock Dr</span>
            <span className="brand-trade">Locksmith</span>
          </a>
          <nav className="site-nav" aria-label="Primary">
            <a href="#services">Services</a>
            <a href="#process">How it works</a>
            <a href="#reviews">Reviews</a>
            <a href="#coverage">Coverage</a>
            <a className="nav-phone" href="tel:07859881354">
              Call <span className="num">07859 881354</span>
            </a>
          </nav>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="mobile-menu"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="mobile-nav" id="mobile-menu" hidden>
        <nav aria-label="Mobile">
          <a href="#services">Services</a>
          <a href="#process">How it works</a>
          <a href="#reviews">Reviews</a>
          <a href="#coverage">Coverage</a>
          <a href="#quote">Get a quote</a>
          <a className="nav-phone" href="tel:07859881354">
            Call <span className="num">07859 881354</span>
          </a>
        </nav>
      </div>

      <main id="main">
        <section
          className="section hero"
          id="top"
          data-section-id="hero"
          data-od-id="review-led-hero"
          aria-labelledby="hero-heading"
        >
          <div className="container hero-grid reveal">
            <div>
              <blockquote className="hero-quote">
                <p id="hero-heading">
                  &ldquo;We were having problems with closing our front door, and subsequently opening it, which
                  be.&rdquo;
                </p>
                <cite>From a Google review</cite>
              </blockquote>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#quote">
                  Request a quote
                </a>
                <a className="btn btn-ghost" href="tel:07859881354">
                  Call <span className="num">07859 881354</span>
                </a>
              </div>
            </div>
            <aside className="hero-aside" aria-label="Quick contact">
              <p>
                <strong>The Lock Dr</strong> is a locksmith covering Southampton and nearby villages. If your door
                will not close, will not open, or the lock has stopped behaving as it should, call to explain the
                problem.
              </p>
              <p className="num">07859 881354</p>
            </aside>
          </div>
        </section>

        <section
          className="section section-accent"
          data-section-id="stats"
          data-od-id="stats-sourced-only"
        >
          <div className="container reveal">
            <div className="evidence-strip" role="list">
              <div className="evidence-item" role="listitem">
                <strong className="num">07859 881354</strong>
                <span>Direct line for enquiries</span>
              </div>
              <div className="evidence-item" role="listitem">
                <strong>Locksmith</strong>
                <span>Trade registered on the business listing</span>
              </div>
              <div className="evidence-item" role="listitem">
                <strong>Southampton area</strong>
                <span>Wingreen, North Baddesley and nearby</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section-cool"
          data-section-id="signature-job-story"
          data-od-id="signature-job-story"
          aria-labelledby="story-heading"
        >
          <div className="container split reveal">
            <div>
              <h2 id="story-heading">Front door lock problems in Southampton</h2>
              <p className="lead">
                Customer reviews describe doors that stick when closing, then refuse to open properly. That is the
                kind of fault The Lock Dr is called out for.
              </p>
            </div>
            <div>
              <p>
                When a front door stops lining up with the frame, the lock can bind, the handle can feel stiff, and
                what should be routine becomes a daily frustration.
              </p>
              <ul className="problem-list">
                <li>A door that will not close flush without force</li>
                <li>A lock that jams after the door has been shut</li>
                <li>A handle or cylinder that will not turn when you need to leave</li>
              </ul>
            </div>
          </div>
        </section>

        <section
          className="section"
          id="services"
          data-section-id="services"
          data-od-id="service-explainers"
          aria-labelledby="services-heading"
        >
          <div className="container reveal">
            <h2 id="services-heading">3 services explained plainly</h2>
            <p className="lead">
              Work is shaped by what customers describe in reviews and by standard locksmith jobs for homes in the
              area.
            </p>
            <div className="service-grid">
              <article className="service-card">
                <h3>Door and lock faults</h3>
                <p>
                  Diagnosis and repair when a front door will not close, open, or lock reliably. This matches the
                  problem raised in customer feedback.
                </p>
              </article>
              <article className="service-card">
                <h3>Lock changes</h3>
                <p>
                  Replacement or upgrading of locks when security needs to be restored after wear, damage, or lost
                  keys.
                </p>
              </article>
              <article className="service-card">
                <h3>Local call-outs</h3>
                <p>
                  Visits across Southampton, Wingreen, North Baddesley and surrounding postcodes listed on the business
                  profile.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section section-warm"
          data-section-id="featured-review-story"
          data-od-id="featured-review-story"
          aria-labelledby="steve-heading"
        >
          <div className="container reveal">
            <div className="steve-panel">
              <div className="steve-mark" aria-hidden="true">
                Steve
              </div>
              <div>
                <h2 id="steve-heading">What customers say</h2>
                <p className="lead">
                  Google reviewers refer to Steve when describing their experience. You know who you are speaking with
                  before the visit.
                </p>
                <p>
                  When you call <span className="num">07859 881354</span>, ask for Steve if you were referred by a
                  neighbour or saw his name in a review.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section-cool"
          id="process"
          data-section-id="process"
          data-od-id="process-section"
          aria-labelledby="process-heading"
        >
          <div className="container reveal">
            <h2 id="process-heading">How a job with us works</h2>
            <p className="lead">A straightforward sequence from first contact to completed lock work.</p>
            <div className="process-steps">
              <article className="process-step">
                <h3>Describe the fault</h3>
                <p>
                  Call or send the form with the door or lock symptoms. Include your postcode so travel can be
                  planned.
                </p>
              </article>
              <article className="process-step">
                <h3>Arrange a visit</h3>
                <p>A time is agreed for Steve to attend your property in the Southampton area.</p>
              </article>
              <article className="process-step">
                <h3>Quote before work</h3>
                <p>The repair or replacement is explained on site before any work begins.</p>
              </article>
              <article className="process-step">
                <h3>Lock work completed</h3>
                <p>
                  The door and lock are left working as they should, with advice if further adjustment is needed.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section"
          id="reviews"
          data-section-id="reviews"
          data-od-id="review-wall"
          aria-labelledby="reviews-heading"
        >
          <div className="container reveal">
            <h2 id="reviews-heading">5 on Google reviews</h2>
            <p className="lead">Feedback is taken from public Google reviews. Only verified wording is shown here.</p>
            <div className="review-grid">
              <article className="review-card">
                <blockquote cite={`https://maps.google.com/?cid=${mapsCid}`}>
                  <p>
                    &ldquo;We were having problems with closing our front door, and subsequently opening it, which
                    be.&rdquo;
                  </p>
                </blockquote>
                <p>Google review · door lock fault</p>
              </article>
              <div className="review-stack">
                <div className="review-note">
                  <strong>Named in reviews</strong>
                  Customers refer to Steve when recommending the business.
                </div>
                <div className="review-note">
                  <strong>Local work</strong>
                  Reviews centre on practical door and lock problems for homes in the Southampton area.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section-accent"
          id="coverage"
          data-section-id="service-area"
          data-od-id="local-coverage"
          aria-labelledby="coverage-heading"
        >
          <div className="container reveal">
            <h2 id="coverage-heading">Based in Southampton</h2>
            <p className="lead">
              The business listing places The Lock Dr in the Southampton area with coverage across nearby
              neighbourhoods.
            </p>
            <div className="area-grid">
              <ul className="area-list">
                <li>Southampton</li>
                <li>Wingreen</li>
                <li>North Baddesley</li>
                <li>Surrounding SO postcodes</li>
              </ul>
              <div className="map-panel">
                <address>
                  The Lock Dr
                  <br />
                  Southampton area
                  <br />
                  Wingreen, North Baddesley
                  <br />
                  Southampton
                </address>
                <span className="postcode num">SO52 9DX</span>
                <div className="map-embed">
                  <iframe
                    title="The Lock Dr service area on Google Maps"
                    src="https://maps.google.com/maps?q=Southampton+SO52+9DX&amp;t=&amp;z=12&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <p style={{ marginTop: "1rem", fontSize: "var(--fs-small)", color: "var(--muted)" }}>
                  <a href={`https://maps.google.com/?cid=${mapsCid}`} rel="noopener noreferrer">
                    View The Lock Dr on Google Maps
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section-dark"
          id="quote"
          data-section-id="contact"
          data-od-id="simple-contact"
          aria-labelledby="contact-heading"
        >
          <div className="container contact-grid reveal">
            <div>
              <h2 id="contact-heading">Get a quote from The Lock Dr</h2>
              <p className="lead">
                Describe the door or lock problem, your postcode, and a number to call you back. For urgent access
                issues, phone is fastest.
              </p>
              <div className="contact-details">
                <div className="contact-block">
                  <strong>Phone</strong>
                  <a href="tel:07859881354" className="num">
                    07859 881354
                  </a>
                </div>
                <div className="contact-block">
                  <strong>WhatsApp</strong>
                  <a href="https://wa.me/447859881354" rel="noopener noreferrer">
                    Message 07859 881354
                  </a>
                </div>
                <div className="contact-block">
                  <strong>Trade</strong>
                  <span>Locksmith</span>
                </div>
                <div className="contact-block">
                  <strong>Base postcode</strong>
                  <span className="num">SO52 9DX</span>
                </div>
                <div className="contact-block">
                  <strong>Opening hours</strong>
                  <span>Open 24 hours</span>
                </div>
              </div>
            </div>

            <QuoteForm />
          </div>
        </section>
      </main>

      <footer className="site-footer" id="footer">
        <div className="container footer-inner footer-grid">
          <div>
            <p>
              <strong>The Lock Dr</strong> · Locksmith · Southampton
            </p>
            <p>
              <a href="tel:07859881354" className="num">
                07859 881354
              </a>
            </p>
            <p>Wingreen, North Baddesley · SO52 9DX · Open 24 hours</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="#services">Services</a>
            <a href="#process">How it works</a>
            <a href="#reviews">Reviews</a>
            <a href="#coverage">Coverage</a>
            <a href="#quote">Get a quote</a>
          </nav>
          <div className="footer-meta">
            <p>
              &copy; {year} The Lock Dr
            </p>
            <p>
              <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
                Website by WebForTrades
              </a>
            </p>
          </div>
        </div>
      </footer>

      <div className="sticky-call" id="sticky-call" aria-hidden="true">
        <a className="btn btn-primary" href="tel:07859881354">
          Call <span className="num">07859 881354</span>
        </a>
      </div>
    </>
  );
}
