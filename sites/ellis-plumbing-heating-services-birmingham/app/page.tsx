import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

export default function HomePage() {
  return (
    <>
      <SiteEnhancements />

      <header className="site-header" data-od-id="header">
        <div className="container">
          <a href="#hero" className="wordmark">
            Ellis Plumbing &amp; Heating Services Birmingham
          </a>
          <nav className="header-nav" aria-label="Main">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#reviews">Reviews</a>
            <a href="#areas">Areas</a>
            <a href="#quote">Get a quote</a>
          </nav>
          <a className="header-call" href="tel:07854027655">
            Call 07854 027655
          </a>
          <button
            className="menu-toggle"
            id="menu-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="mobile-nav"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#reviews">Reviews</a>
          <a href="#areas">Areas</a>
          <a href="#quote">Get a quote</a>
          <a href="tel:07854027655">Call 07854 027655</a>
        </nav>
      </header>

      <section
        className="hero"
        id="hero"
        data-section-id="hero"
        data-od-id="review-led-hero"
        aria-labelledby="hero-heading"
      >
        <div className="hero-grid">
          <div className="hero-content">
            <div className="container">
              <p className="hero-kicker">Plumbing &amp; heating · King&apos;s Heath B14</p>
              <figure className="hero-quote">
                <blockquote cite="https://maps.google.com/?cid=16223918444705757032">
                  <p id="hero-heading">
                    Ish came out at short notice to repair and service an old boiler for my niece who has
                    learning difficulties. He ensured there was hot water and heating to all radiators and
                    everything is working perfectly since his visit.
                  </p>
                </blockquote>
                <cite>Tim · Google review</cite>
              </figure>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#quote">
                  Get a quote
                </a>
                <a className="btn btn-ghost" href="tel:07854027655">
                  Call 07854 027655
                </a>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="/assets/images/07-places.webp"
              alt="Completed plumbing work by Ellis Plumbing &amp; Heating Services Birmingham"
              width={1200}
              height={1600}
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section className="stats-band" data-section-id="stats" data-od-id="stats-sourced-only">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <strong>5.0 on Google</strong>
              <span>Across 108 reviews</span>
            </div>
            <div className="stat-item">
              <strong>Based in King&apos;s Heath</strong>
              <span>Birmingham B14 0GG</span>
            </div>
            <div className="stat-item">
              <strong>Open 24 hours</strong>
              <span>Monday to Saturday on Google</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section section--light"
        data-section-id="signature-job-story"
        data-od-id="signature-job-story"
        aria-labelledby="bathroom-heading"
      >
        <div className="container reveal">
          <div className="story-split">
            <figure>
              <img
                src="/assets/images/05-places.webp"
                alt="Bathroom installation work in Birmingham"
                width={1200}
                height={1600}
                loading="lazy"
              />
            </figure>
            <div className="story-body">
              <h2 id="bathroom-heading">Bathroom refits and installations in Birmingham</h2>
              <p>
                Reviews describe full bathroom projects with tiling, plumbing, heating and appliances fitted
                together. Customers mention professional, tidy work through the rest of the home.
              </p>
              <p className="story-pull">
                Ish fitted me a beautiful new bathroom complete with tiling , plumbing, heating and all my
                appliances. Nothing was to much of an ask.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section section--light"
        id="work"
        data-section-id="gallery"
        data-od-id="gallery-lean"
        aria-labelledby="gallery-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="gallery-heading">Recent plumbing work in Birmingham</h2>
            <p>Photos from completed projects listed on Google.</p>
          </div>
          <div className="gallery-pairs">
            <div className="gallery-pair">
              <figure>
                <img
                  src="/assets/images/01-places.webp"
                  alt="Completed plumbing project photo in Birmingham"
                  width={900}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure>
                <img
                  src="/assets/images/04-places.webp"
                  alt="Completed plumbing project photo in Birmingham"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
            </div>
            <div className="gallery-pair">
              <figure>
                <img
                  src="/assets/images/06-places.webp"
                  alt="Completed plumbing project photo in Birmingham"
                  width={900}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure>
                <img
                  src="/assets/images/08-places.webp"
                  alt="Completed plumbing project photo in Birmingham"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
            </div>
            <div className="gallery-pair">
              <figure>
                <img
                  src="/assets/images/09-places.webp"
                  alt="Completed plumbing project photo in Birmingham"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure>
                <img
                  src="/assets/images/10-places.webp"
                  alt="Completed plumbing project photo in Birmingham"
                  width={900}
                  height={1600}
                  loading="lazy"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section section--surface"
        id="services"
        data-section-id="services"
        data-od-id="service-explainers"
        aria-labelledby="services-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="services-heading">5 services explained plainly</h2>
            <p>
              What customers actually hired Ellis Plumbing &amp; Heating Services Birmingham for, taken from
              Google reviews.
            </p>
          </div>
          <ul className="services-list">
            <li className="service-item">
              <span className="service-num">01</span>
              <div>
                <h3>Building &amp; construction</h3>
                <p>
                  Listed trade covering wider building work alongside plumbing and heating jobs in Birmingham
                  homes.
                </p>
              </div>
            </li>
            <li className="service-item">
              <span className="service-num">02</span>
              <div>
                <h3>Heating and radiators</h3>
                <p>
                  Radiators removed before plastering and reinstalled afterwards, new Hive thermostat fitted,
                  and heating restored to all radiators after boiler work.
                </p>
              </div>
            </li>
            <li className="service-item">
              <span className="service-num">03</span>
              <div>
                <h3>General plumbing</h3>
                <p>
                  Plumbing tied into bathroom refits and appliance connections, with tidy pipework kept neat
                  through occupied homes.
                </p>
              </div>
            </li>
            <li className="service-item">
              <span className="service-num">04</span>
              <div>
                <h3>Boiler repairs and servicing</h3>
                <p>
                  Short-notice boiler repairs, servicing after faults, and photo diagnosis before a visit.
                  Lyahna called at 10pm; the repair was completed the next morning.
                </p>
              </div>
            </li>
            <li className="service-item">
              <span className="service-num">05</span>
              <div>
                <h3>Bathroom installations</h3>
                <p>
                  Full bathroom refits including tiling, plumbing, heating and appliances. chanai23 describes
                  a beautiful new bathroom with unforeseen issues sorted along the way.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section
        className="section section--warm"
        data-section-id="featured-review-story"
        data-od-id="featured-review-story"
        aria-labelledby="ish-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="ish-heading">What customers say</h2>
            <p>Five Google reviewers name Ish or Ishmael directly when describing their experience.</p>
          </div>
          <figure className="featured-review">
            <blockquote cite="https://maps.google.com/?cid=16223918444705757032">
              Was recommended <span className="name-callout">Ish</span> through a friend and he&apos;s been
              great, had 4 radiators removed prior to plastering and reinstalled after along with a new hive
              thermostat. Reliable and professional thank you
            </blockquote>
            <cite>Nees · Google review</cite>
          </figure>
        </div>
      </section>

      <section
        className="section section--cool"
        data-section-id="process"
        data-od-id="process-section"
        aria-labelledby="process-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="process-heading">How a job with us works</h2>
            <p>A straightforward process described across verified customer feedback.</p>
          </div>
          <ol className="process-steps">
            <li className="process-step">
              <h3>Ring or send photos</h3>
              <p>
                Call Ish to describe the job. Lyahna sent photos at 10pm and the problem was identified
                straightaway.
              </p>
            </li>
            <li className="process-step">
              <h3>Quote before the visit</h3>
              <p>Tim was quoted a price before the visit and charged exactly that amount on completion.</p>
            </li>
            <li className="process-step">
              <h3>Tidy, professional finish</h3>
              <p>
                Reviews mention professional, tidy work throughout the rest of the home while jobs are
                underway.
              </p>
            </li>
            <li className="process-step">
              <h3>Honest advice, fair price</h3>
              <p>
                Tim&apos;s old boiler was kept going with an honest assessment rather than a push for a new
                install before Christmas.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section
        className="section section--light"
        id="reviews"
        data-section-id="reviews"
        data-od-id="review-wall"
        aria-labelledby="reviews-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="reviews-heading">5 on Google reviews</h2>
            <p>Full quotes from verified Google reviews. Wording unchanged.</p>
          </div>
          <div className="review-grid">
            <article className="review-card review-card--wide">
              <blockquote cite="https://maps.google.com/?cid=16223918444705757032">
                Ish came out at short notice to repair and service an old boiler for my niece who has learning
                difficulties. He ensured there was hot water and heating to all radiators and everything is
                working perfectly since his visit last week. He quoted a price before the visit and
                that&apos;s what he charged. Even though the boiler was old, he didn&apos;t try to get us to
                install a new boiler just before Christmas, but gave an honest assessment of what might go
                wrong, but was able to keep it going for us for now. Much appreciated Ish, and we will use you
                from now on. Many thanks.
              </blockquote>
              <cite>Tim</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=16223918444705757032">
                Brilliant service, called at 10pm last night due to a problem with my boiler, sent over some
                photos and the problem was identified straightaway, came round this morning and completed the
                repair and serviced the boiler! Such a smooth, hassle free and quick process, I was incredibly
                relieved to have this sorted so quickly and efficiently at a really reasonable price. Thanks
                so much!
              </blockquote>
              <cite>Lyahna</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=16223918444705757032">
                Ish fitted me a beautiful new bathroom complete with tiling , plumbing, heating and all my
                appliances. Nothing was to much of an ask and he went above and beyond to fix some unforeseen
                issues that I had. Ish was very professional and tidy throughout the rest of my home which is
                appreciated! highly recommend.
              </blockquote>
              <cite>chanai23</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=16223918444705757032">
                Ishmael provided me with a new radiator and installation. He was knowledgeable, efficient, and
                very responsive even prior to the day of installation. The radiator is working well, looks
                great and very happy with it all. Thank you Ishmael for your hardwork and for fitting me in so
                quickly.
              </blockquote>
              <cite>Sunny</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=16223918444705757032">
                Was recommended Ish through a friend and he&apos;s been great, had 4 radiators removed prior to
                plastering and reinstalled after along with a new hive thermostat. Reliable and professional
                thank you
              </blockquote>
              <cite>Nees</cite>
            </article>
          </div>
        </div>
      </section>

      <section
        className="section section--accent"
        id="areas"
        data-section-id="service-area"
        data-od-id="local-coverage"
        aria-labelledby="areas-heading"
      >
        <div className="container reveal">
          <div className="coverage-grid">
            <div>
              <div className="section-intro">
                <h2 id="areas-heading">Based in Birmingham</h2>
                <p>
                  Ellis Plumbing &amp; Heating Services Birmingham is listed at Alcester Rd S, King&apos;s
                  Heath, Birmingham B14 0GG. Service area covers Birmingham, King&apos;s Heath and the B14
                  postcode area.
                </p>
              </div>
              <ul className="area-list">
                <li>Birmingham</li>
                <li>King&apos;s Heath</li>
                <li>Birmingham B14 0GG</li>
              </ul>
              <p className="address-block">Alcester Rd S, King&apos;s Heath, Birmingham B14 0GG, UK</p>
            </div>
            <div className="map-embed">
              <iframe
                title="Ellis Plumbing &amp; Heating Services Birmingham on Google Maps"
                src="https://maps.google.com/maps?q=Alcester+Rd+S,+King%27s+Heath,+Birmingham+B14+0GG&output=embed"
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
        id="quote"
        data-section-id="contact"
        data-od-id="simple-contact"
        aria-labelledby="contact-heading"
      >
        <div className="container reveal">
          <div className="contact-grid">
            <div>
              <div className="section-intro">
                <h2 id="contact-heading">Get a quote from Ellis Plumbing &amp; Heating Services Birmingham</h2>
                <p>
                  Call Ish to discuss bathroom refits, boiler repairs, radiator work or other plumbing and
                  heating jobs in Birmingham.
                </p>
              </div>
              <div className="contact-details">
                <div className="contact-block">
                  <h3>Phone</h3>
                  <p>
                    <a href="tel:07854027655">07854 027655</a>
                  </p>
                </div>
                <div className="contact-block">
                  <h3>WhatsApp</h3>
                  <p>
                    <a href="https://wa.me/447854027655" rel="noopener noreferrer">
                      Message 07854 027655
                    </a>
                  </p>
                </div>
                <div className="contact-block">
                  <h3>Opening hours</h3>
                  <ul className="hours-list">
                    <li>Monday: Open 24 hours</li>
                    <li>Tuesday: Open 24 hours</li>
                    <li>Wednesday: Open 24 hours</li>
                    <li>Thursday: Open 24 hours</li>
                    <li>Friday: Open 24 hours</li>
                    <li>Saturday: Open 24 hours</li>
                    <li>Sunday: 7:00 AM - 6:30 PM</li>
                  </ul>
                </div>
                <div className="contact-block">
                  <h3>Google listing</h3>
                  <p>
                    <a href="https://maps.google.com/?cid=16223918444705757032" rel="noopener noreferrer">
                      View on Google Maps
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <QuoteForm />
          </div>
        </div>
      </section>

      <footer className="site-footer" id="footer" data-od-id="footer">
        <div className="container footer-inner">
          <p>
            Ellis Plumbing &amp; Heating Services Birmingham · King&apos;s Heath ·{" "}
            <a href="tel:07854027655">07854 027655</a>
          </p>
          <p>
            <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
              Website by WebForTrades
            </a>
          </p>
        </div>
      </footer>

      <div className="sticky-call" id="sticky-call" aria-hidden="true">
        <a className="btn btn-primary" href="tel:07854027655">
          Call 07854 027655
        </a>
      </div>
    </>
  );
}
