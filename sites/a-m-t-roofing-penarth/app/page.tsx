import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

export default function HomePage() {
  return (
    <>
      <header className="topnav" data-od-id="topnav">
        <div className="container topnav-inner">
          <a className="logo" href="#top">
            A.M.T Roofing <span>Penarth</span>
          </a>
          <nav className="nav-desktop" aria-label="Primary">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#reviews">Reviews</a>
            <a href="#quote">Contact</a>
          </nav>
          <a className="btn btn-primary" href="tel:07464879664">
            Call 07464 879664
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
            <a href="#quote">Contact</a>
            <a className="btn btn-primary" href="tel:07464879664">
              Call 07464 879664
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
        >
          <div className="container hero-split">
            <div>
              <div className="hero-meta">
                <span className="tag">Roofing · Penarth</span>
                <span className="pill">4.7 Google rating</span>
              </div>
              <h1 className="hero-quote">These guys have done a fantastic job on our roof.</h1>
              <p className="lead">
                A.M.T Roofing Penarth carries out roofing work for homes in Penarth, Cardiff, Penlan Rise and
                Llandough.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#quote">
                  Get a quote
                </a>
                <a className="btn btn-secondary" href="tel:07464879664">
                  Call 07464 879664
                </a>
              </div>
            </div>
            <figure className="hero-image">
              <img
                src="/assets/images/01-places.webp"
                alt="Roofing work by A.M.T Roofing Penarth"
                width={800}
                height={1000}
              />
            </figure>
          </div>
        </section>

        <section className="section section-accent" data-section-id="stats" data-od-id="stats-sourced-only">
          <div className="container">
            <div className="stats-row">
              <div className="stat-card stat-card-accent">
                <div className="stat-num stat-num-accent num">4.7</div>
                <p className="stat-label">Google rating for A.M.T Roofing Penarth.</p>
              </div>
              <div className="stat-card">
                <div className="stat-num">Roofing</div>
                <p className="stat-label">The trade carried out by A.M.T Roofing Penarth.</p>
              </div>
              <div className="stat-card">
                <div className="stat-num">Penarth</div>
                <p className="stat-label">Based in Penarth, covering Cardiff, Penlan Rise and Llandough.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-accent" data-section-id="proof" data-od-id="third-party-proof-strip">
          <div className="container proof-strip">
            <div>
              <h2>Verified customer proof</h2>
              <p className="lead">
                Customer feedback and photos are sourced from Google and shared here with permission.
              </p>
            </div>
            <div className="proof-badges">
              <div className="proof-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                Google reviews
              </div>
              <div className="proof-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                Google Places photos
              </div>
            </div>
          </div>
        </section>

        <section
          className="section"
          data-section-id="mentions"
          data-od-id="what-customers-keep-mentioning"
        >
          <div className="container">
            <div className="section-head">
              <h2>What Penarth customers mention most</h2>
              <p className="lead">The strongest customer feedback highlights the quality of the roof work.</p>
            </div>
            <div className="theme-grid">
              <article className="theme-card">
                <h3>Roof work quality</h3>
                <p>Customers describe a fantastic job on their roof after the work is finished.</p>
              </article>
              <article className="theme-card">
                <h3>Local roofing</h3>
                <p>Work is carried out for homes in Penarth, Cardiff, Penlan Rise and Llandough.</p>
              </article>
              <article className="theme-card">
                <h3>Easy to contact</h3>
                <p>
                  Reach A.M.T Roofing Penarth by phone on 07464 879664 or email amtroofing@outlook.com.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section section-cool"
          id="work"
          data-section-id="gallery"
          data-od-id="facebook-work-gallery"
        >
          <div className="container">
            <div className="section-head">
              <h2>Recent work from A.M.T Roofing Penarth</h2>
              <p className="lead">Photos from Google Places showing roofing work in the local area.</p>
            </div>
            <div className="gallery-grid">
              <figure className="gallery-item">
                <img src="/assets/images/02-places.webp" alt="Roofing project in Penarth" loading="lazy" width={900} height={600} />
              </figure>
              <figure className="gallery-item">
                <img src="/assets/images/03-places.webp" alt="Roofing project in Penarth" loading="lazy" width={700} height={600} />
              </figure>
              <figure className="gallery-item">
                <img src="/assets/images/04-places.webp" alt="Roofing project in Penarth" loading="lazy" width={600} height={480} />
              </figure>
              <figure className="gallery-item">
                <img src="/assets/images/05-places.webp" alt="Roofing project in Penarth" loading="lazy" width={600} height={480} />
              </figure>
              <figure className="gallery-item">
                <img src="/assets/images/06-places.webp" alt="Roofing project in Penarth" loading="lazy" width={600} height={480} />
              </figure>
              <figure className="gallery-item">
                <img src="/assets/images/07-places.webp" alt="Roofing project in Penarth" loading="lazy" width={500} height={400} />
              </figure>
              <figure className="gallery-item">
                <img src="/assets/images/08-places.webp" alt="Roofing project in Penarth" loading="lazy" width={500} height={400} />
              </figure>
              <figure className="gallery-item">
                <img src="/assets/images/09-places.webp" alt="Roofing project in Penarth" loading="lazy" width={500} height={400} />
              </figure>
              <figure className="gallery-item">
                <img src="/assets/images/10-places.webp" alt="Roofing project in Penarth" loading="lazy" width={500} height={400} />
              </figure>
            </div>
          </div>
        </section>

        <section className="section" id="services" data-section-id="services" data-od-id="service-explainers">
          <div className="container">
            <div className="section-head">
              <h2>3 services explained plainly</h2>
              <p className="lead">Roofing help for local homes, explained in straightforward terms.</p>
            </div>
            <div className="services-grid">
              <article className="service-card">
                <h3>Roofing</h3>
                <p>A.M.T Roofing Penarth carries out roofing work for homes in the local area.</p>
              </article>
              <article className="service-card">
                <h3>Local coverage</h3>
                <p>Work covers Penarth, Cardiff, Penlan Rise and Llandough, including Penarth CF64 2LS.</p>
              </article>
              <article className="service-card">
                <h3>Quotes by phone or email</h3>
                <p>Call 07464 879664 or email amtroofing@outlook.com to discuss your roof and request a quote.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-cool" data-section-id="process" data-od-id="process-section">
          <div className="container">
            <div className="section-head">
              <h2>How a job with us works</h2>
              <p className="lead">A straightforward way to get roofing help from A.M.T Roofing Penarth.</p>
            </div>
            <div className="process-list">
              <article className="process-step">
                <h3>Contact us</h3>
                <p>Call 07464 879664 or email amtroofing@outlook.com to describe the roofing work you need.</p>
              </article>
              <article className="process-step">
                <h3>Discuss the roof</h3>
                <p>Talk through the job so we understand what needs doing on your property.</p>
              </article>
              <article className="process-step">
                <h3>Agree a quote</h3>
                <p>We provide a quote before the roofing work begins.</p>
              </article>
              <article className="process-step">
                <h3>Complete the work</h3>
                <p>Customers describe a fantastic job on their roof once the work is finished.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="reviews" data-section-id="reviews" data-od-id="review-wall">
          <div className="container reviews-grid">
            <div>
              <h2>4.7 on Google reviews</h2>
              <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                Customer feedback shared on Google for A.M.T Roofing Penarth.
              </p>
              <blockquote className="review-quote" style={{ marginTop: "var(--gap-xl)" }}>
                These guys have done a fantastic job on our roof.
              </blockquote>
              <p className="review-source">Google review</p>
            </div>
            <aside className="review-score">
              <div className="stat-num stat-num-accent num">4.7</div>
              <p className="stat-label" style={{ marginInline: "auto" }}>
                Google rating
              </p>
            </aside>
          </div>
        </section>

        <section className="section section-accent" data-section-id="service-area" data-od-id="local-coverage">
          <div className="container coverage-grid">
            <div>
              <h2>Based in Penarth</h2>
              <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                A.M.T Roofing Penarth works across Penarth and nearby areas in South Wales.
              </p>
              <div className="area-list">
                <span className="area-tag">Penarth</span>
                <span className="area-tag">Cardiff</span>
                <span className="area-tag">Penlan Rise</span>
                <span className="area-tag">Llandough</span>
                <span className="area-tag">CF64 2LS</span>
              </div>
            </div>
            <div className="map-panel">
              <h3>Service area</h3>
              <address>
                A.M.T Roofing Penarth
                <br />
                Penarth, Cardiff, Penlan Rise, Llandough
                <br />
                Penarth CF64 2LS
              </address>
              <p className="meta" style={{ marginTop: "var(--gap-md)" }}>
                Phone: <a href="tel:07464879664">07464 879664</a>
                <br />
                Email: <a href="mailto:amtroofing@outlook.com">amtroofing@outlook.com</a>
              </p>
              <div className="map-embed">
                <iframe
                  title="Map of Penarth CF64 area"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://maps.google.com/maps?q=Penarth+CF64&amp;t=&amp;z=13&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
                  allowFullScreen
                />
              </div>
              <a
                className="map-link"
                href="https://maps.google.com/?cid=1564530328914605086"
                target="_blank"
                rel="noopener noreferrer"
              >
                View A.M.T Roofing Penarth on Google Maps
              </a>
            </div>
          </div>
        </section>

        <section className="section" data-section-id="faq" data-od-id="faq">
          <div className="container">
            <div className="section-head">
              <h2>Practical questions</h2>
              <p className="lead">Straight answers using the contact details and service area on this page.</p>
            </div>
            <div className="faq-list">
              <article className="faq-item">
                <button className="faq-trigger" type="button" aria-expanded="false">
                  <h3>How do I get a quote?</h3>
                  <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <div className="faq-panel">
                  <div className="faq-panel-inner">
                    <p>Call 07464 879664 or email amtroofing@outlook.com. You can also use the quote form below.</p>
                  </div>
                </div>
              </article>
              <article className="faq-item">
                <button className="faq-trigger" type="button" aria-expanded="false">
                  <h3>Which areas do you cover?</h3>
                  <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <div className="faq-panel">
                  <div className="faq-panel-inner">
                    <p>
                      A.M.T Roofing Penarth covers Penarth, Cardiff, Penlan Rise and Llandough, including Penarth
                      CF64 2LS.
                    </p>
                  </div>
                </div>
              </article>
              <article className="faq-item">
                <button className="faq-trigger" type="button" aria-expanded="false">
                  <h3>What is your Google rating?</h3>
                  <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <div className="faq-panel">
                  <div className="faq-panel-inner">
                    <p>A.M.T Roofing Penarth has a 4.7 rating on Google reviews.</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-dark" id="contact" data-section-id="contact" data-od-id="simple-contact">
          <div className="container contact-grid">
            <div>
              <h2>Get a quote from A.M.T Roofing Penarth</h2>
              <p className="lead" style={{ marginTop: "var(--gap-sm)" }}>
                Speak to us directly or send a message with details about your roof.
              </p>
              <div className="contact-cards" style={{ marginTop: "var(--gap-xl)" }}>
                <div className="contact-card">
                  <h3>Phone</h3>
                  <a href="tel:07464879664">07464 879664</a>
                  <p>Call to discuss roofing work in Penarth and nearby.</p>
                </div>
                <div className="contact-card">
                  <h3>Email</h3>
                  <a href="mailto:amtroofing@outlook.com">amtroofing@outlook.com</a>
                  <p>Email with photos or a short description of the job.</p>
                </div>
              </div>
            </div>

            <div data-od-id="quote-form">
              <QuoteForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="pagefoot" data-od-id="footer">
        <div className="container">
          <div className="pagefoot-grid">
            <div>
              <p className="pagefoot-brand">A.M.T Roofing Penarth</p>
              <p>Roofing in Penarth, Cardiff and nearby.</p>
              <p>
                <a href="tel:07464879664">07464 879664</a>
                {" · "}
                <a href="mailto:amtroofing@outlook.com">amtroofing@outlook.com</a>
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
                <li>Penarth</li>
                <li>Cardiff</li>
                <li>Penlan Rise</li>
                <li>Llandough</li>
                <li>CF64 2LS</li>
              </ul>
            </div>
            <div>
              <p className="pagefoot-heading">Opening hours</p>
              <ul className="pagefoot-links">
                <li>Mon: 7:30 AM - 10:00 PM</li>
                <li>Tue-Sun: 8:00 AM - 8:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="pagefoot-inner">
            <span>© A.M.T Roofing Penarth</span>
            <span>
              <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
                Website by WebForTrades
              </a>
            </span>
          </div>
        </div>
      </footer>

      <div className="mobile-call-bar" id="mobile-call-bar" aria-hidden="true">
        <a href="tel:07464879664">Call 07464 879664</a>
        <a href="#quote">Get a quote</a>
      </div>

      <SiteEnhancements />
    </>
  );
}
