import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

export default function HomePage() {
  return (
    <>
      <header className="site-header" id="site-header" data-review="header">
        <div className="container header-inner">
          <div className="brand">
            <span className="brand-name">NFS Plumbing &amp; Heating</span>
          </div>
          <div className="header-actions">
            <a href="tel:07788488486" className="btn btn-secondary">
              Call 07788 488486
            </a>
            <a href="#quote" className="btn btn-primary">
              Get a quote
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="hero" data-section-id="hero" data-review="hero">
          <div className="container hero-stack fade-in">
            <div>
              <h1>Bathroom and pipework, done properly in Bristol.</h1>
              <p className="hero-lead">
                Assured plumbing and heating work across Bristol, from boilers and bathrooms to leaks and gas
                connections. Nick runs every job with tidy workmanship and clear communication.
              </p>
            </div>
            <div className="hero-proof">
              <div className="proof-card">
                <div className="proof-stars" aria-hidden="true">
                  ★★★★★
                </div>
                <div className="proof-label">5 stars on Google</div>
                <div className="proof-detail">Rated by local customers across Bristol</div>
              </div>
              <div className="proof-card">
                <div className="proof-label">18+ Google reviews</div>
                <div className="proof-detail">Customers mention reliability, fair pricing and neat pipework</div>
              </div>
              <div className="proof-card">
                <div className="proof-label">Bristol BS3</div>
                <div className="proof-detail">Based locally, serving neighbourhoods across the city</div>
              </div>
            </div>
            <div className="hero-ctas">
              <a href="#quote" className="btn btn-primary">
                Get a quote
              </a>
              <a href="tel:07788488486" className="btn btn-secondary">
                Call 07788 488486
              </a>
            </div>
          </div>
        </section>

        <section className="content-section" id="reviews" data-section-id="reviews">
          <div className="container">
            <div className="featured-review fade-in">
              <blockquote>
                &ldquo;Really fantastic service. Nick has worked diligently on our bathroom and gone the extra mile when
                things were difficult to complete due to our apartment structure. He has worked without complaint when met
                with unpredictable obstacles and the finished job is excellent. He has been respectful and tidy in his work
                throughout. I would highly recommend.&rdquo;
              </blockquote>
              <aside className="featured-aside">
                <h3>Why customers call back</h3>
                <p>
                  Reviews across Google mention the same things: quick response, often the same day, tidy sites, and plain
                  explanations. For bathrooms, boilers and urgent leaks, that consistency matters.
                </p>
              </aside>
            </div>
            <header className="section-header fade-in" style={{ marginTop: "3rem" }}>
              <h2>What Bristol customers say</h2>
              <p>Quotes taken from Google reviews. Names shortened where provided.</p>
            </header>
            <div className="review-wall fade-in">
              <article className="review-card">
                <div className="stars" aria-label="5 stars">
                  ★★★★★
                </div>
                <p>
                  &ldquo;Nick is great. Responds really quickly and often comes out same day. Does a great job and really
                  reasonable prices. Would highly recommend.&rdquo;
                </p>
                <footer>Google review</footer>
              </article>
              <article className="review-card">
                <div className="stars" aria-label="5 stars">
                  ★★★★★
                </div>
                <p>
                  &ldquo;I have been using Nick to do some work over the last year, after being let down by someone else. Nick
                  is reliable, efficient, trustworthy and honest.&rdquo;
                </p>
                <footer>Google review</footer>
              </article>
              <article className="review-card">
                <div className="stars" aria-label="5 stars">
                  ★★★★★
                </div>
                <p>
                  &ldquo;Nick helped fix a leak at very short notice. Nick is very well mannered, calm and got on with the job
                  quickly. I would definitely use him again.&rdquo;
                </p>
                <footer>Jude, Google review</footer>
              </article>
              <article className="review-card">
                <div className="stars" aria-label="5 stars">
                  ★★★★★
                </div>
                <p>
                  &ldquo;We had Nick fit a full central heating system and other odd jobs. He is fair with pricing and also
                  just a really nice guy. Also his pipework is very neat.&rdquo;
                </p>
                <footer>Google review</footer>
              </article>
              <article className="review-card">
                <div className="stars" aria-label="5 stars">
                  ★★★★★
                </div>
                <p>
                  &ldquo;Nick was brought in after we had an issue with our shower and bath leaking. He fixed the affected area,
                  retiled and sealed it all back up. He did an amazing job.&rdquo;
                </p>
                <footer>Google review</footer>
              </article>
              <article className="review-card">
                <div className="stars" aria-label="5 stars">
                  ★★★★★
                </div>
                <p>
                  &ldquo;Nick is the most capable and reliable plumber I ever met. On top of that, if you try and call him, he
                  always calls you back.&rdquo;
                </p>
                <footer>Google review</footer>
              </article>
            </div>
          </div>
        </section>

        <div className="callout fade-in" data-section-id="callout">
          <div className="container callout-inner">
            <div>
              <h2>Short-notice plumbing and heating</h2>
              <p>
                Leaks, boiler trouble or a bathroom that cannot wait? Call for a prompt response across Bristol.
              </p>
            </div>
            <a href="tel:07788488486" className="btn btn-accent">
              Call 07788 488486
            </a>
          </div>
        </div>

        <section className="content-section" id="services" data-section-id="services">
          <div className="container">
            <header className="section-header fade-in">
              <h2>What NFS Plumbing &amp; Heating covers</h2>
              <p>Plain-language plumbing and heating work for homes across Bristol. No jargon, no guesswork.</p>
            </header>
            <div className="services-grid fade-in">
              <article className="service-card">
                <h3>Heating and boilers</h3>
                <p>
                  Central heating installs, boiler repairs and radiator work. Customers praise fair pricing and neat
                  pipework on full system jobs.
                </p>
              </article>
              <article className="service-card">
                <h3>Bathrooms</h3>
                <p>
                  Full bathroom renovations including tiling, fittings and pipework. Nick handles awkward structures and
                  keeps the site tidy throughout.
                </p>
              </article>
              <article className="service-card">
                <h3>Taps, toilets and leaks</h3>
                <p>
                  From dripping taps to burst pipes and shower leaks. Quick response when you need a calm, capable plumber
                  on site.
                </p>
              </article>
              <article className="service-card">
                <h3>Gas work</h3>
                <p>Gas cooker connections, hob fittings and related gas plumbing. Straightforward jobs done properly with good value.</p>
              </article>
              <article className="service-card">
                <h3>General plumbing</h3>
                <p>
                  Odd jobs, repairs and maintenance that other tradespeople have left unfinished. Reliable follow-through on
                  every visit.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="content-section" id="gallery" data-section-id="gallery">
          <div className="container">
            <header className="section-header fade-in">
              <h2>Recent plumbing work in Bristol</h2>
              <p>Finished bathrooms, neat pipework and heating installs from jobs across the city.</p>
            </header>
            <div className="gallery gallery--masonry fade-in">
              <figure className="gallery__item">
                <img src="/assets/images/02-places.webp" alt="Pipework installation in a Bristol property" loading="lazy" />
                <figcaption className="gallery__caption">Pipework installation in a Bristol property</figcaption>
              </figure>
              <figure className="gallery__item">
                <img src="/assets/images/03-places.webp" alt="Bathroom renovation completed in Bristol" loading="lazy" />
                <figcaption className="gallery__caption">Bathroom renovation completed in Bristol</figcaption>
              </figure>
              <figure className="gallery__item">
                <img src="/assets/images/04-places.webp" alt="Heating and plumbing work in Bristol" loading="lazy" />
                <figcaption className="gallery__caption">Heating and plumbing work in Bristol</figcaption>
              </figure>
              <figure className="gallery__item">
                <img
                  src="/assets/images/05-places.webp"
                  alt="Tiled bathroom finish by NFS Plumbing and Heating"
                  loading="lazy"
                />
                <figcaption className="gallery__caption">Tiled bathroom finish by NFS Plumbing and Heating</figcaption>
              </figure>
              <figure className="gallery__item">
                <img src="/assets/images/06-places.webp" alt="Central heating pipework in Bristol home" loading="lazy" />
                <figcaption className="gallery__caption">Central heating pipework in Bristol home</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="content-section" data-section-id="process">
          <div className="container">
            <header className="section-header fade-in">
              <h2>How a job works</h2>
              <p>A straightforward process from first contact to a finished, tidy result.</p>
            </header>
            <div className="process-steps fade-in">
              <article className="process-step">
                <h3>Call or request a quote</h3>
                <p>Describe the job by phone. Nick listens, asks the right questions and gives you a clear picture of what is needed.</p>
              </article>
              <article className="process-step">
                <h3>Agree the work and timing</h3>
                <p>Fair pricing discussed upfront. For urgent leaks and heating faults, same-day attendance is often possible.</p>
              </article>
              <article className="process-step">
                <h3>Neat work on site</h3>
                <p>Respectful in your home, tidy throughout, and careful with pipework and finishes. No unnecessary mess left behind.</p>
              </article>
              <article className="process-step">
                <h3>Job signed off properly</h3>
                <p>Work tested, explained and left in good order. Customers regularly recommend NFS to neighbours and friends.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="content-section" id="areas" data-section-id="service-area">
          <div className="container">
            <header className="section-header fade-in">
              <h2>Where NFS Plumbing &amp; Heating works</h2>
              <p>Based in Bristol BS3, covering neighbourhoods across the city and nearby areas.</p>
            </header>
            <div className="coverage-grid fade-in">
              <div>
                <p className="coverage-note">
                  NFS Plumbing &amp; Heating serves homeowners and landlords across Bristol. Whether you are in Bedminster,
                  Clifton or Redfield, Nick travels to you for plumbing and heating jobs of all sizes.
                </p>
                <ul className="area-list" aria-label="Service areas">
                  <li>Bristol</li>
                  <li>BS3</li>
                  <li>Redfield</li>
                  <li>St George</li>
                  <li>Easton</li>
                  <li>Bedminster</li>
                  <li>Clifton</li>
                </ul>
              </div>
              <div className="coverage-map">
                <div className="map-frame">
                  <iframe
                    src="https://www.google.com/maps?q=Bristol+BS3,+UK&output=embed"
                    title="Map showing NFS Plumbing and Heating service area around Bristol BS3"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <p className="map-link-wrap">
                  <a
                    href="https://www.google.com/maps?q=Bristol+BS3,+UK"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    View on Google Maps
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" data-section-id="contact">
          <div className="container fade-in">
            <div className="contact-panel">
              <h2>Ready to book plumbing or heating work?</h2>
              <p>Call to describe the job and agree pricing before work starts.</p>
              <div className="contact-actions">
                <a href="#quote" className="btn btn-primary">
                  Get a quote
                </a>
                <a href="tel:07788488486" className="btn btn-secondary">
                  Call 07788 488486
                </a>
              </div>
            </div>
          </div>

          <div className="quote-section" id="quote">
            <div className="container">
              <div className="quote-grid">
                <div className="contact-details fade-in">
                  <div className="section-header" style={{ marginBottom: "1.25rem" }}>
                    <h2>Request a quote</h2>
                    <p>
                      Tell us what you need and we will get back to you. For urgent jobs, call{" "}
                      <a href="tel:07788488486">07788 488486</a>.
                    </p>
                  </div>
                  <div className="contact-block">
                    <h3>Call</h3>
                    <a href="tel:07788488486">07788 488486</a>
                    <p className="sub">Mon to Sat, 8am to 5pm</p>
                  </div>
                  <div className="contact-block">
                    <h3>Based in</h3>
                    <p>Bristol BS3</p>
                    <p className="sub">Serving Bristol and nearby areas</p>
                  </div>
                </div>
                <QuoteForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <p className="footer-brand-name">NFS Plumbing &amp; Heating</p>
              <p className="footer-tagline">Plumbing and heating across Bristol BS3 and nearby neighbourhoods.</p>
            </div>
            <div className="footer-col">
              <h3>Contact</h3>
              <ul className="footer-links">
                <li>
                  <a href="tel:07788488486">07788 488486</a>
                </li>
                <li>
                  <a href="#quote">Request a quote</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Areas</h3>
              <ul className="footer-links footer-links-plain">
                <li>Bristol BS3</li>
                <li>Redfield</li>
                <li>St George</li>
                <li>Easton</li>
                <li>Bedminster</li>
                <li>Clifton</li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Quick links</h3>
              <ul className="footer-links">
                <li>
                  <a href="#services">Services</a>
                </li>
                <li>
                  <a href="#gallery">Recent work</a>
                </li>
                <li>
                  <a href="#reviews">Reviews</a>
                </li>
                <li>
                  <a href="#areas">Areas</a>
                </li>
                <li>
                  <a href="#quote">Quote</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-hours">Mon to Sat, 8am to 5pm. Closed Sunday.</p>
            <p className="footer-credit">
              <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
                Website by WebForTrades
              </a>
            </p>
          </div>
        </div>
      </footer>

      <div className="mobile-sticky" id="mobile-sticky" role="region" aria-label="Quick actions">
        <a href="#quote" className="btn btn-primary">
          Get a quote
        </a>
        <a href="tel:07788488486" className="btn btn-secondary">
          Call
        </a>
      </div>

      <SiteEnhancements />
    </>
  );
}
