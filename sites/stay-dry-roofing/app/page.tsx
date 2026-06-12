import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

export default function HomePage() {
  return (
    <>
      <header className="site-header" data-review="header">
        <div className="container site-header__inner">
          <a className="wordmark" href="#">
            Stay Dry Roofing
          </a>
          <nav aria-label="Primary">
            <ul className="site-nav">
              <li>
                <a href="#reviews">Reviews</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#gallery">Recent work</a>
              </li>
              <li>
                <a href="#area">Coverage</a>
              </li>
              <li>
                <a href="#contact">Get a quote</a>
              </li>
            </ul>
          </nav>
          <a className="header-phone" href="tel:07393696585">
            07393 696585
          </a>
        </div>
      </header>

      <main>
        <section
          className="hero hero--asymmetric"
          id="hero"
          data-section-id="hero"
          data-review="hero"
          aria-labelledby="hero-title"
        >
          <div className="container hero__grid">
            <div className="hero__content reveal">
              <p className="hero__eyebrow">Roofer in Sheffield</p>
              <h1 id="hero-title" className="hero__title">
                Sheffield roofing, kept watertight.
              </h1>
              <p className="hero__proof">
                <strong>5 stars on Google</strong> across 5 reviews. Roof repairs, new tiled roofs and
                chimney work, with tidy finishes and clear communication.
              </p>
              <div className="hero__actions">
                <a className="btn btn--primary" href="#contact">
                  Get a quote
                </a>
                <a className="btn btn--ghost" href="tel:07393696585">
                  Call 07393 696585
                </a>
              </div>
            </div>
            <figure className="hero__photo reveal">
              <img
                src="/assets/images/03-places.webp"
                alt="Stay Dry Roofing team working on a roof in Sheffield"
                width={480}
                height={360}
              />
            </figure>
          </div>
        </section>

        <section
          id="reviews"
          className="section section--muted"
          data-section-id="reviews"
          aria-labelledby="reviews-heading"
        >
          <div className="container">
            <div className="reveal">
              <hr className="section__rule" />
              <h2 id="reviews-heading">What customers say</h2>
              <p className="section__lead">Verbatim Google reviews, attributed by first name only.</p>
            </div>
            <div className="reviews">
              <article className="review-card reveal">
                <blockquote>
                  Excellent service from Star Dry Roofing from start to finish. The team were punctual,
                  professional, and extremely knowledgeable. They explained everything clearly, provided before
                  and after photos, and completed the work to a very high standard. The site was left clean and
                  tidy, and the workmanship was outstanding. It&apos;s reassuring to find a roofing company that
                  is honest, reliable, and takes pride in their work. I would highly recommend Star Dry Roofing
                  to anyone needing roofing repairs or a new roof. Thank you for a fantastic job!
                </blockquote>
                <footer>Kallum</footer>
              </article>
              <article className="review-card reveal">
                <blockquote>
                  I would highly recommend Stay Dry Roofing to anyone looking for reliable and trustworthy
                  roofers in Sheffield. A fantastic job completed efficiently and professionally.
                </blockquote>
                <footer>Tom</footer>
              </article>
              <article className="review-card reveal">
                <blockquote>
                  We had a leek at are business office had a couple quote but these lads turned up very
                  professional I knew exactly what to do cannot recommend them enough cheers lad
                </blockquote>
                <footer>Alpine</footer>
              </article>
              <article className="review-card reveal">
                <blockquote>
                  Absolutely fantastic team! Had installed a brand new tiled roof for me &amp; replaced all my
                  lead flashing on my chimney, thanks to Thomas &amp; his team.
                </blockquote>
                <footer>Mark</footer>
              </article>
              <article className="review-card reveal">
                <blockquote>
                  absolute brilliant services repair my roof couldn&apos;t of ask for better thank you Thomas
                  &amp; the team
                </blockquote>
                <footer>Ffion</footer>
              </article>
            </div>
          </div>
        </section>

        <div className="proof-strip">
          <div className="container">
            <ul className="proof-strip__list">
              <li className="proof-strip__item">
                <span>5</span> stars on Google
              </li>
              <li className="proof-strip__item">
                <span>5</span> Google reviews
              </li>
              <li className="proof-strip__item">
                Covering <span>Sheffield S1</span>
              </li>
            </ul>
          </div>
        </div>

        <section
          id="services"
          className="section section--white"
          data-section-id="services"
          aria-labelledby="services-heading"
        >
          <div className="container">
            <div className="reveal">
              <hr className="section__rule" />
              <h2 id="services-heading">Roofing services explained plainly</h2>
              <p className="section__lead">
                The work Stay Dry Roofing handles across Sheffield, in plain language.
              </p>
            </div>
            <ul className="services-list reveal">
              <li className="service-item">
                <h3>Roof repairs</h3>
                <p>
                  Leak and tile repairs on pitched roofs. Reviews mention quick quotes, clear communication and
                  tidy finishes on repair jobs.
                </p>
              </li>
              <li className="service-item">
                <h3>New tiled roofs</h3>
                <p>
                  Full re-roofs with new tiles, as described in customer reviews. Work completed to a high standard
                  with sites left clean and tidy.
                </p>
              </li>
              <li className="service-item">
                <h3>Lead flashing</h3>
                <p>
                  Chimney and abutment flashing replaced where leaks have started. Mentioned alongside full roof
                  replacements in Google reviews.
                </p>
              </li>
              <li className="service-item">
                <h3>Chimney work</h3>
                <p>
                  Weatherproofing and flashing around chimneys. Customers note chimney work quoted and completed
                  alongside roof repairs.
                </p>
              </li>
              <li className="service-item">
                <h3>General roofing</h3>
                <p>
                  Smaller roofing jobs scoped and quoted plainly. Reviews describe roof repairs handled efficiently
                  without unnecessary upsells.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section
          id="gallery"
          className="section section--muted"
          data-section-id="gallery"
          aria-labelledby="gallery-heading"
        >
          <div className="container">
            <div className="reveal">
              <hr className="section__rule" />
              <h2 id="gallery-heading">Recent roofing work in Sheffield</h2>
              <p className="section__lead">Photos from completed jobs. Captions kept general on purpose.</p>
            </div>
            <div className="gallery gallery--masonry">
              <figure className="gallery__item reveal">
                <img
                  src="/assets/images/01-places.webp"
                  alt="Recent roofing work in Sheffield"
                  loading="lazy"
                  width={600}
                  height={450}
                />
                <figcaption className="gallery__caption">Recent roofing work in Sheffield</figcaption>
              </figure>
              <figure className="gallery__item reveal">
                <img
                  src="/assets/images/02-places.webp"
                  alt="Roof repair work in Sheffield"
                  loading="lazy"
                  width={600}
                  height={800}
                />
                <figcaption className="gallery__caption">Recent roofing work in Sheffield</figcaption>
              </figure>
              <figure className="gallery__item reveal">
                <img
                  src="/assets/images/04-places.webp"
                  alt="Tiled roof work in Sheffield"
                  loading="lazy"
                  width={800}
                  height={600}
                />
                <figcaption className="gallery__caption">Recent roofing work in Sheffield</figcaption>
              </figure>
              <figure className="gallery__item reveal">
                <img
                  src="/assets/images/05-places.webp"
                  alt="Roofing project in Sheffield"
                  loading="lazy"
                  width={600}
                  height={750}
                />
                <figcaption className="gallery__caption">Recent roofing work in Sheffield</figcaption>
              </figure>
              <figure className="gallery__item reveal">
                <img
                  src="/assets/images/06-places.webp"
                  alt="Completed roof work in Sheffield"
                  loading="lazy"
                  width={600}
                  height={500}
                />
                <figcaption className="gallery__caption">Recent roofing work in Sheffield</figcaption>
              </figure>
              <figure className="gallery__item reveal">
                <img
                  src="/assets/images/07-places.webp"
                  alt="Roofing and chimney work in Sheffield"
                  loading="lazy"
                  width={600}
                  height={700}
                />
                <figcaption className="gallery__caption">Recent roofing work in Sheffield</figcaption>
              </figure>
              <figure className="gallery__item reveal">
                <img
                  src="/assets/images/09-places.webp"
                  alt="Stay Dry Roofing job in Sheffield"
                  loading="lazy"
                  width={600}
                  height={450}
                />
                <figcaption className="gallery__caption">Recent roofing work in Sheffield</figcaption>
              </figure>
              <figure className="gallery__item reveal">
                <img
                  src="/assets/images/10-places.webp"
                  alt="Roofing team at work in Sheffield"
                  loading="lazy"
                  width={800}
                  height={600}
                />
                <figcaption className="gallery__caption">Recent roofing work in Sheffield</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section
          className="section section--white"
          data-section-id="process"
          aria-labelledby="process-heading"
        >
          <div className="container">
            <div className="reveal">
              <hr className="section__rule" />
              <h2 id="process-heading">How a job works</h2>
              <p className="section__lead">The pattern customers describe in their reviews.</p>
            </div>
            <ol className="steps">
              <li className="reveal">
                <h3>Enquire</h3>
                <p>
                  Call with the job. Reviews mention quick responses and clear communication from the first
                  contact.
                </p>
              </li>
              <li className="reveal">
                <h3>Quote</h3>
                <p>Customers note good quotes on roof repairs, chimney work and full roof replacements.</p>
              </li>
              <li className="reveal">
                <h3>Agree timing</h3>
                <p>Dates arranged promptly. Teams turn up when they say they will.</p>
              </li>
              <li className="reveal">
                <h3>Tidy finish</h3>
                <p>Work completed to a high standard, with sites left clean and tidy throughout.</p>
              </li>
            </ol>
          </div>
        </section>

        <section
          id="area"
          className="section section--muted"
          data-section-id="service-area"
          aria-labelledby="area-heading"
        >
          <div className="container">
            <div className="reveal">
              <hr className="section__rule" />
              <h2 id="area-heading">Local coverage</h2>
              <p className="section__lead">Based in Sheffield. Serving Sheffield City Centre and the S1 area.</p>
            </div>
            <ul className="area-list reveal">
              <li>Sheffield</li>
              <li>Sheffield City Centre</li>
              <li>Sheffield S1</li>
            </ul>
            <div className="map-wrap reveal">
              <iframe
                title="Map of Sheffield S1 area"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=Sheffield+S1&amp;t=&amp;z=13&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
                allowFullScreen
              />
            </div>
            <a
              className="map-link reveal"
              href="https://maps.google.com/?cid=14607676387471236693"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Stay Dry Roofing on Google Maps
            </a>
          </div>
        </section>

        <section
          id="contact"
          className="section section--white"
          data-section-id="contact"
          aria-labelledby="contact-heading"
        >
          <div className="container">
            <div className="reveal">
              <hr className="section__rule" />
              <h2 id="contact-heading">Get a quote from Stay Dry Roofing</h2>
              <p className="section__lead">
                Send a quick request or call to describe the job. No email address is listed for this business.
              </p>
            </div>
            <div className="quote-layout reveal">
              <div className="contact-panel">
                <div>
                  <ul className="contact-details">
                    <li>
                      Phone: <a href="tel:07393696585">07393 696585</a>
                    </li>
                    <li>Based: Sheffield, S1</li>
                    <li>Service area: Sheffield, Sheffield City Centre, Sheffield S1</li>
                  </ul>
                  <div className="contact-actions">
                    <a className="btn btn--primary" href="tel:07393696585">
                      Call 07393 696585
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="footer-heading">Opening hours</h3>
                  <table className="hours-table">
                    <tbody>
                      <tr>
                        <th scope="row">Monday to Saturday</th>
                        <td>7:00 to 18:30</td>
                      </tr>
                      <tr>
                        <th scope="row">Sunday</th>
                        <td>7:00 to 16:00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <QuoteForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <p className="footer-brand">Stay Dry Roofing</p>
              <p>Roofer in Sheffield.</p>
              <p>
                <a href="tel:07393696585">07393 696585</a>
              </p>
            </div>
            <div>
              <p className="footer-heading">Quick links</p>
              <ul className="footer-links">
                <li>
                  <a href="#reviews">Reviews</a>
                </li>
                <li>
                  <a href="#services">Services</a>
                </li>
                <li>
                  <a href="#gallery">Recent work</a>
                </li>
                <li>
                  <a href="#area">Coverage</a>
                </li>
                <li>
                  <a href="#contact">Get a quote</a>
                </li>
              </ul>
            </div>
            <div>
              <p className="footer-heading">Service areas</p>
              <ul className="footer-links">
                <li>Sheffield</li>
                <li>Sheffield City Centre</li>
                <li>Sheffield S1</li>
              </ul>
            </div>
            <div>
              <p className="footer-heading">Opening hours</p>
              <ul className="footer-links">
                <li>Mon-Sat: 7:00-18:30</li>
                <li>Sun: 7:00-16:00</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; Stay Dry Roofing</span>
            <a href="https://webfortradesuk.co.uk" target="_blank" rel="noopener noreferrer">
              Website by WebForTrades
            </a>
          </div>
        </div>
      </footer>

      <div className="call-bar" id="call-bar" aria-hidden="true">
        <a href="tel:07393696585">Call 07393 696585</a>
        <a href="#contact">Get a quote</a>
      </div>

      <SiteEnhancements />
    </>
  );
}
