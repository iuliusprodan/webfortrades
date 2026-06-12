import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

const phone = "07849 279308";
const phoneTel = "07849279308";

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteEnhancements />

      <header className="site-header">
        <div className="container site-header__inner">
          <a className="brand" href="#top">
            Painters Force LTD
          </a>
          <nav className="site-nav" aria-label="Main">
            <a href="#services">Services</a>
            <a href="#gallery">Gallery</a>
            <a href="#reviews">Reviews</a>
            <a href="#coverage">Areas</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="header-actions">
            <a className="btn btn--call" href={`tel:${phoneTel}`}>
              {phone}
            </a>
            <a className="btn btn--ghost" href="#quote">
              Get a quote
            </a>
            <a className="btn btn--primary" href="#quote">
              Quote
            </a>
          </div>
        </div>
      </header>

      <main>
        <section
          className="hero"
          id="top"
          data-section-id="review-led-hero"
          data-od-id="review-led-hero"
        >
          <div className="container hero__layout">
            <div className="hero__intro">
              <p className="eyebrow">Building &amp; painting · Nottingham NG7</p>
              <h1>
                I recently had the pleasure of hiring Painters Force LTD who truly exceeded all my
                expectations.
              </h1>
              <div className="hero__proof" aria-label="Google rating">
                <div className="hero__stars" aria-hidden="true">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
                <p className="hero__stat">
                  <strong>5.0</strong> <span>· 16 Google reviews</span>
                </p>
              </div>
              <div className="hero__actions reveal">
                <a className="btn btn--primary" href="#quote">
                  Get a quote
                </a>
                <a className="btn btn--ghost" href={`tel:${phoneTel}`}>
                  Call {phone}
                </a>
              </div>
            </div>

            <div className="hero__visual reveal">
              <img
                src="/assets/images/02-places.webp"
                alt="Painting and decorating work by Painters Force LTD in Nottingham"
                width={1600}
                height={1200}
                fetchPriority="high"
              />
            </div>

            <blockquote className="hero__quote reveal">
              <p>
                From start to finish, their work was nothing short of exceptional. Their attention to detail was
                extraordinary, as they carefully listened to my vision and offered insightful suggestions to enhance
                the overall aesthetic of my home. If you desire a flawlessly painted home go for these guys.
              </p>
              <cite>Jowita · Google review</cite>
            </blockquote>
          </div>
        </section>

        <section
          className="stats-bar"
          aria-label="Business highlights"
          data-section-id="stats-sourced-only"
          data-od-id="stats-sourced-only"
        >
          <div className="container stats-bar__inner">
            <div className="stats-bar__item">
              <strong>5.0</strong>
              <span>Google rating</span>
            </div>
            <div className="stats-bar__item">
              <strong>16</strong>
              <span>Google reviews</span>
            </div>
            <div className="stats-bar__item">
              <strong>Mon-Sat</strong>
              <span>9:00 AM to 5:00 PM</span>
            </div>
            <div className="stats-bar__item">
              <strong>NG7</strong>
              <span>Nottingham &amp; surrounding areas</span>
            </div>
          </div>
        </section>

        <section
          className="section"
          id="mentions"
          data-section-id="what-customers-keep-mentioning"
          data-od-id="what-customers-keep-mentioning"
        >
          <div className="container">
            <h2>What Nottingham customers mention most</h2>
            <p className="section__lead">
              Repeated praise themes taken from Google reviews for Painters Force LTD.
            </p>
            <div className="mentions-grid">
              <article className="mention-card reveal">
                <h3>Attention to detail</h3>
                <p>
                  Customers describe extraordinary care, listening to their vision and enhancing the overall look of
                  the property.
                </p>
              </article>
              <article className="mention-card reveal">
                <h3>Professional and efficient</h3>
                <p>
                  Teams described as professional, diligent and efficient on both domestic and commercial jobs.
                </p>
              </article>
              <article className="mention-card reveal">
                <h3>Paint product advice</h3>
                <p>
                  Reviewers value guidance on the best products to use for different surfaces before work begins.
                </p>
              </article>
              <article className="mention-card reveal">
                <h3>Competitive pricing</h3>
                <p>
                  Customers mention competitive pricing alongside high-quality finishes on homes and business premises.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section section--cool"
          id="gallery"
          data-section-id="gallery-lean"
          data-od-id="gallery-lean"
        >
          <div className="container">
            <h2>Recent painting work in Nottingham</h2>
            <p className="section__lead">Photographs from Painters Force LTD&apos;s Google Business Profile.</p>
            <div className="gallery-clusters">
              <div className="gallery-cluster reveal">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/03-places.webp"
                    alt="Painting and decorating project in Nottingham"
                    width={1600}
                    height={721}
                    loading="lazy"
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/04-places.webp"
                    alt="Interior or exterior paintwork in Nottingham"
                    width={810}
                    height={1080}
                    loading="lazy"
                  />
                </figure>
              </div>
              <div className="gallery-cluster reveal">
                <figure className="gallery-item gallery-item--tall">
                  <img
                    src="/assets/images/05-places.webp"
                    alt="Decorating finish by Painters Force LTD"
                    width={1200}
                    height={1600}
                    loading="lazy"
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/06-places.webp"
                    alt="Painting work completed in Nottingham"
                    width={960}
                    height={720}
                    loading="lazy"
                  />
                </figure>
              </div>
              <div className="gallery-cluster reveal">
                <figure className="gallery-item">
                  <img
                    src="/assets/images/09-places.webp"
                    alt="Commercial or domestic decorating in Nottingham"
                    width={1440}
                    height={1080}
                    loading="lazy"
                  />
                </figure>
                <figure className="gallery-item">
                  <img
                    src="/assets/images/10-places.webp"
                    alt="Recent decorating project in Nottingham"
                    width={1600}
                    height={1200}
                    loading="lazy"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section"
          id="services"
          data-section-id="service-explainers"
          data-od-id="service-explainers"
        >
          <div className="container">
            <h2>4 services explained plainly</h2>
            <p className="section__lead">
              Building, painting and decorating services listed for Painters Force LTD on Google.
            </p>
            <div className="services-grid">
              <article className="service-card reveal">
                <h3>Painting &amp; decorating</h3>
                <p>
                  Domestic painting and decorating for homes, from single rooms through to whole-house projects
                  completed on schedule.
                </p>
              </article>
              <article className="service-card reveal">
                <h3>Commercial painting</h3>
                <p>
                  Commercial painting contractors for business premises, with teams praised for reliable service and
                  vibrant results.
                </p>
              </article>
              <article className="service-card reveal">
                <h3>Warehouse decorating</h3>
                <p>
                  Warehouse and large-space decorating, including transformations customers describe as remarkable.
                </p>
              </article>
              <article className="service-card reveal">
                <h3>Building &amp; construction</h3>
                <p>
                  Building and construction work alongside decorating, listed as the business trade on Google Places.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section section--cool"
          id="process"
          data-section-id="process-section"
          data-od-id="process-section"
        >
          <div className="container">
            <h2>How a job with us works</h2>
            <p className="section__lead">
              A straightforward process shaped by what customers describe in their reviews.
            </p>
            <ol className="process-steps">
              <li className="process-step reveal">
                <div>
                  <h3>Get in touch</h3>
                  <p>
                    Call or send a quote request with the rooms, surfaces or premises you need painting or decorating.
                  </p>
                </div>
              </li>
              <li className="process-step reveal">
                <div>
                  <h3>Discuss your vision</h3>
                  <p>
                    Talk through the look you want. Customers mention the team listening carefully and offering helpful
                    suggestions.
                  </p>
                </div>
              </li>
              <li className="process-step reveal">
                <div>
                  <h3>Product advice and preparation</h3>
                  <p>Receive guidance on the best paints and products for each surface before work starts on site.</p>
                </div>
              </li>
              <li className="process-step reveal">
                <div>
                  <h3>Finish on schedule</h3>
                  <p>
                    Work completed efficiently, from whole houses within a week to commercial projects finished ahead of
                    schedule.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section
          className="section"
          id="reviews"
          data-section-id="review-wall"
          data-od-id="review-wall"
        >
          <div className="container">
            <h2>5 on Google reviews</h2>
            <p className="section__lead">
              Full review quotes from Painters Force LTD&apos;s Google profile. Overall rating 5.0 from 16 reviews.
            </p>
            <div className="reviews-grid">
              <article className="review-card reveal">
                <div className="review-card__stars" aria-hidden="true">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
                <blockquote>
                  I recently had the pleasure of hiring Painters Force LTD who truly exceeded all my expectations. From
                  start to finish, their work was nothing short of exceptional. Their attention to detail was
                  extraordinary, as they carefully listened to my vision and offered insightful suggestions to enhance
                  the overall aesthetic of my home. If you desire a flawlessly painted home go for these guys.
                </blockquote>
                <cite>Jowita</cite>
              </article>
              <article className="review-card reveal">
                <div className="review-card__stars" aria-hidden="true">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
                <blockquote>
                  Absolutely outstanding job done on the warehouse decorating! The transformation is simply remarkable.
                  The team was professional, efficient, and brought a creative touch that exceeded our expectations.
                  Our warehouse has never looked better. Highly recommended.
                </blockquote>
                <cite>Fabian</cite>
              </article>
              <article className="review-card reveal">
                <div className="review-card__stars" aria-hidden="true">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
                <blockquote>
                  Excellent service promote,worked to complete a whole house in a week. Highly recommended. Great job
                  they advised on paints and what was best products to use for different surfaces. I would use this
                  company again. Competivtive pricing too.
                </blockquote>
                <cite>Vanessa</cite>
              </article>
              <article className="review-card reveal">
                <div className="review-card__stars" aria-hidden="true">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
                <blockquote>
                  If you need a reliable commercial painting contractor, look no further. The team provided excellent
                  service, and my business has never looked better. I&apos;m thrilled with their work!
                </blockquote>
                <cite>RALIAT</cite>
              </article>
              <article className="review-card reveal">
                <div className="review-card__stars" aria-hidden="true">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
                <blockquote>
                  Their team of commercial painting contractors worked diligently and completed the project ahead of
                  schedule. The fresh vibrant look of our building has received many compliments.
                </blockquote>
                <cite>benjamin</cite>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section section--cool"
          id="coverage"
          data-section-id="local-coverage"
          data-od-id="local-coverage"
        >
          <div className="container">
            <h2>Based in Nottingham</h2>
            <p className="section__lead">
              Painters Force LTD is based in Nottingham NG7 4AA on Google Places.
            </p>
            <div className="coverage-layout">
              <div className="reveal">
                <div className="area-tags">
                  <span className="area-tag">Nottingham</span>
                  <span className="area-tag">NG7 4AA</span>
                  <span className="area-tag">Nottinghamshire</span>
                </div>
                <p className="hours-list">
                  <strong>Opening hours:</strong> Monday to Saturday, 9:00 AM to 5:00 PM. Closed Sunday.
                </p>
                <p style={{ marginTop: "1rem" }}>
                  <a
                    href="https://maps.google.com/?cid=5705655930724980249"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Google Maps
                  </a>
                </p>
              </div>
              <div className="coverage-map reveal">
                <iframe
                  title="Map of Painters Force LTD service area, Nottingham NG7 4AA"
                  src="https://maps.google.com/maps?q=Nottingham+NG7+4AA,+UK&amp;output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section--dark"
          id="contact"
          data-section-id="simple-contact"
          data-od-id="simple-contact"
        >
          <div className="container">
            <h2>Get a quote from Painters Force LTD</h2>
            <p className="section__lead">
              Call to discuss domestic, commercial or warehouse decorating in Nottingham, or send a quote request
              below.
            </p>
            <div className="contact-grid">
              <div className="reveal">
                <p className="eyebrow">Phone</p>
                <p className="contact-phone">
                  <a href={`tel:${phoneTel}`}>{phone}</a>
                </p>
                <p>Available Monday to Saturday, 9:00 AM to 5:00 PM.</p>
                <p>Nottingham NG7 4AA.</p>
                <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                  <a className="btn btn--primary" href={`tel:${phoneTel}`}>
                    Call now
                  </a>
                  <a className="btn btn--ghost" href="#quote">
                    Request a quote
                  </a>
                </div>
              </div>
              <QuoteForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="footer" data-od-id="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <p className="footer-brand">Painters Force LTD</p>
              <p>
                Building and painting contractors in Nottingham. Domestic decorating, commercial painting, warehouse
                work and construction services.
              </p>
            </div>
            <nav className="footer-nav" aria-label="Footer">
              <a href="#services">Services</a>
              <a href="#gallery">Gallery</a>
              <a href="#reviews">Reviews</a>
              <a href="#coverage">Areas</a>
              <a href="#quote">Get a quote</a>
            </nav>
            <div>
              <p>
                <a href={`tel:${phoneTel}`}>{phone}</a>
              </p>
              <p>Mon-Sat, 9:00 AM to 5:00 PM</p>
              <p>Nottingham · NG7 4AA</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; Painters Force LTD</span>
            <span>
              Website by{" "}
              <a href="https://webfortradesuk.co.uk" target="_blank" rel="noopener noreferrer">
                WebForTrades
              </a>
            </span>
          </div>
        </div>
      </footer>

      <div className="mobile-cta" id="mobile-cta" aria-hidden="true">
        <a className="btn btn--call" href={`tel:${phoneTel}`}>
          Call
        </a>
        <a className="btn btn--primary" href="#quote">
          Get a quote
        </a>
      </div>
    </>
  );
}
