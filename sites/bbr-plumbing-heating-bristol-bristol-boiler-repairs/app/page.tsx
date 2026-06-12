import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

export default function HomePage() {
  return (
    <>
      <SiteEnhancements />

      <header className="site-header" data-review="header">
        <div className="container">
          <a href="#" className="logo-wordmark" aria-label="Bristol Boiler Repairs home">
            Bristol Boiler Repairs
          </a>
          <nav className="header-nav" aria-label="Main">
            <a href="#services">Services</a>
            <a href="#gallery">Recent work</a>
            <a href="#reviews">Reviews</a>
            <a href="#areas">Areas</a>
            <a href="#quote">Get a quote</a>
          </nav>
          <a className="header-call" href="tel:07854476888">
            Call 07854 476888
          </a>
        </div>
      </header>

      <section className="hero" data-review="hero" data-section-id="hero" aria-labelledby="hero-heading">
        <div className="hero-bg">
          <img
            src="/assets/images/hero-bathroom.webp"
            alt="Bathroom refit work by Bristol Boiler Repairs"
            width={1920}
            height={1080}
            fetchPriority="high"
          />
          <div className="hero-overlay" aria-hidden="true" />
        </div>
        <div className="hero-content">
          <div className="container">
            <p className="hero-proof">5.0 on Google · 31+ reviews</p>
            <h1 id="hero-heading">Warm homes. Reliable heating across Bristol.</h1>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#quote">
                Get a quote
              </a>
              <a className="btn btn-outline" href="tel:07854476888">
                Call 07854 476888
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="proof-strip" data-section-id="stats">
        <div className="container">
          <div className="proof-item">
            <strong>5.0 on Google</strong>
            Across 31+ reviews
          </div>
          <div className="proof-item">
            <strong>Open 24 hours</strong>
            Monday to Sunday
          </div>
          <div className="proof-item">
            <strong>Based in Bristol</strong>
            BS13
          </div>
        </div>
      </div>

      <section className="section" id="reviews" data-section-id="reviews" aria-labelledby="reviews-heading">
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="reviews-heading">What customers say</h2>
            <p>Verified reviews from Bristol Boiler Repairs customers.</p>
          </div>
          <div className="featured-review">
            <blockquote cite="https://www.google.com/maps">
              <p>
                &ldquo;Bristol Boiler Repairs, and in particular Chris, were very helpful in providing quotes for 3 boilers
                and guiding us to the most appropriate one for our property. They also prioritised the work as our existing
                boiler had broken. Installation was completed on time and the work was tidy and unobtrusive. We have no
                hesitation in recommending Bristol Boiler Repairs as both cost effective and reliable.&rdquo;
              </p>
            </blockquote>
            <cite>Mark · Google review</cite>
          </div>
          <div className="reviews-grid">
            <article className="review-card">
              <p className="review-stars" aria-label="5 out of 5 stars">
                ★★★★★
              </p>
              <blockquote>
                <p>
                  &ldquo;Chris completely redid my heating system having bought a house with very old plumbing system. He was
                  very efficient and explained everything to me as he also installed a Hive and he explained to me how it
                  worked (I am clueless on these things). His prices were fair in comparison and also considering his level
                  of expertise and experience. I would definitely recommend Bristol Boiler Repairs!&rdquo;
                </p>
              </blockquote>
              <cite>sarah</cite>
            </article>
            <article className="review-card">
              <p className="review-stars" aria-label="5 out of 5 stars">
                ★★★★★
              </p>
              <blockquote>
                <p>
                  &ldquo;Chris and the chaps installed our boiler, radiators, two bathrooms, underfloor heating and
                  powerflushed the system. They talked us through all the options available and provided installation in a
                  timely manor. All in all very helpful, polite and friendly and didn&apos;t cost the earth. We will be using
                  Bristol Boiler Repairs in the future on other projects. Thanks again.&rdquo;
                </p>
              </blockquote>
              <cite>Michael</cite>
            </article>
            <article className="review-card">
              <p className="review-stars" aria-label="5 out of 5 stars">
                ★★★★★
              </p>
              <blockquote>
                <p>
                  &ldquo;Good customer service. Was flexible with appointment times and carrying out the job. Installed boiler
                  and radiators to high standard, keeping me informed on progress throughout the job. Reasonably priced.
                  Would definitely use again and recommend to all friends and family. Thanks.&rdquo;
                </p>
              </blockquote>
              <cite>Spike</cite>
            </article>
            <article className="review-card">
              <p className="review-stars" aria-label="5 out of 5 stars">
                ★★★★★
              </p>
              <blockquote>
                <p>
                  &ldquo;Chris was very professional on his work. Finished it like a champ and was ready to help if problem
                  arises in the future. Will definitely recommend if any of my friends or family, requires it. Thank you.&rdquo;
                </p>
              </blockquote>
              <cite>Om</cite>
            </article>
            <article className="review-card">
              <p className="review-stars" aria-label="5 out of 5 stars">
                ★★★★★
              </p>
              <blockquote>
                <p>
                  &ldquo;Bristol Boiler Repairs, and in particular Chris, were very helpful in providing quotes for 3 boilers
                  and guiding us to the most appropriate one for our property. They also prioritised the work as our existing
                  boiler had broken. Installation was completed on time and the work was tidy and unobtrusive. We have no
                  hesitation in recommending Bristol Boiler Repairs as both cost effective and reliable.&rdquo;
                </p>
              </blockquote>
              <cite>Mark</cite>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--stone" id="services" data-section-id="services" aria-labelledby="services-heading">
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="services-heading">Services</h2>
            <p>Boiler repairs, heating and plumbing work across Bristol, backed by verified customer feedback.</p>
          </div>
          <ul className="services-list">
            <li className="service-item">
              <h3>Boiler repairs and servicing</h3>
              <p>Repairs, replacements and servicing when your boiler lets you down.</p>
            </li>
            <li className="service-item">
              <h3>Heating and radiators</h3>
              <p>Radiator installs, system upgrades and powerflushing.</p>
            </li>
            <li className="service-item">
              <h3>Bathroom installations and refits</h3>
              <p>Full bathroom refits including tiles and finishes.</p>
            </li>
            <li className="service-item">
              <h3>General plumbing repairs</h3>
              <p>Everyday plumbing faults and maintenance.</p>
            </li>
            <li className="service-item">
              <h3>Shower installs and underfloor heating</h3>
              <p>Shower fitting and underfloor heating from recent customer projects.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="section" id="gallery" data-section-id="gallery" aria-labelledby="gallery-heading">
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="gallery-heading">Recent work</h2>
            <p>Real jobs from Bristol Boiler Repairs. Photos from our own projects.</p>
          </div>
          <div className="gallery-masonry">
            <figure className="gallery-item">
              <img src="/assets/images/boiler-work.webp" alt="Boiler work" width={800} height={600} loading="lazy" />
              <figcaption>Boiler work</figcaption>
            </figure>
            <figure className="gallery-item">
              <img
                src="/assets/images/radiator-pipework.webp"
                alt="Radiator pipework on a heating project"
                width={800}
                height={1000}
                loading="lazy"
              />
              <figcaption>Radiator pipework (same project)</figcaption>
            </figure>
            <figure className="gallery-item">
              <img
                src="/assets/images/bathroom-finish.webp"
                alt="Bathroom finish on a refit project"
                width={800}
                height={900}
                loading="lazy"
              />
              <figcaption>Bathroom finish (same project)</figcaption>
            </figure>
            <figure className="gallery-item">
              <img src="/assets/images/plumbing-detail.webp" alt="Plumbing detail" width={800} height={600} loading="lazy" />
              <figcaption>Plumbing detail</figcaption>
            </figure>
            <figure className="gallery-item">
              <img src="/assets/images/bathroom-tiles.webp" alt="Bathroom tiles" width={800} height={700} loading="lazy" />
              <figcaption>Bathroom tiles</figcaption>
            </figure>
            <figure className="gallery-item">
              <img src="/assets/images/radiator-install.webp" alt="Radiator install" width={800} height={650} loading="lazy" />
              <figcaption>Radiator install</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section section--stone" data-section-id="process" aria-labelledby="process-heading">
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="process-heading">How a job works</h2>
            <p>A straightforward process, drawn from what customers describe in their reviews.</p>
          </div>
          <ol className="process-steps">
            <li className="process-step">
              <h3>Quote</h3>
              <p>Helpful quotes and guidance on the right boiler or system for your property.</p>
            </li>
            <li className="process-step">
              <h3>Agree price</h3>
              <p>Fair pricing explained clearly before any work begins.</p>
            </li>
            <li className="process-step">
              <h3>Install on agreed timescale</h3>
              <p>Work prioritised when needed and completed on time.</p>
            </li>
            <li className="process-step">
              <h3>Tidy finish</h3>
              <p>Professional, unobtrusive installation with progress kept you informed.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section" id="areas" data-section-id="service-area" aria-labelledby="areas-heading">
        <div className="container reveal">
          <div className="coverage-layout">
            <div>
              <div className="section-intro">
                <h2 id="areas-heading">Where we work</h2>
                <p>Based in Bristol, BS13. We cover Bristol and surrounding neighbourhoods.</p>
              </div>
              <div className="area-tags" role="list" aria-label="Service areas">
                <span className="area-tag" role="listitem">
                  Bristol
                </span>
                <span className="area-tag" role="listitem">
                  Redfield
                </span>
                <span className="area-tag" role="listitem">
                  St George
                </span>
                <span className="area-tag" role="listitem">
                  Easton
                </span>
                <span className="area-tag" role="listitem">
                  Bedminster
                </span>
                <span className="area-tag" role="listitem">
                  Clifton
                </span>
                <span className="area-tag" role="listitem">
                  Kingswood
                </span>
                <span className="area-tag" role="listitem">
                  Fishponds
                </span>
              </div>
            </div>
            <div className="map-wrap">
              <iframe
                title="Map showing Bristol BS13 area"
                src="https://maps.google.com/maps?q=BS13,+Bristol,+UK&hl=en&z=13&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--stone" id="quote" data-section-id="contact" aria-labelledby="quote-heading">
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="quote-heading">Get a quote</h2>
            <p>Tell us about your boiler, heating or plumbing job. We will get back to you as soon as we can.</p>
          </div>
          <div className="quote-layout">
            <div className="contact-details">
              <div className="contact-block">
                <h3>Phone</h3>
                <a href="tel:07854476888">07854 476888</a>
              </div>
              <div className="contact-block">
                <h3>Email</h3>
                <a href="mailto:bristolboilerrepairs247@gmail.com">bristolboilerrepairs247@gmail.com</a>
              </div>
              <div className="contact-block">
                <h3>Opening hours</h3>
                <p>Open 24 hours, Monday to Sunday</p>
              </div>
              <div className="contact-block">
                <h3>Location</h3>
                <p>Bristol, BS13</p>
              </div>
            </div>
            <QuoteForm />
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <span className="footer-wordmark">Bristol Boiler Repairs</span>
              <p>BBR Plumbing and Heating Bristol. Boiler repairs, heating and plumbing across Bristol.</p>
            </div>
            <div className="footer-col">
              <h3>Contact</h3>
              <ul>
                <li>
                  <a href="tel:07854476888">07854 476888</a>
                </li>
                <li>
                  <a href="mailto:bristolboilerrepairs247@gmail.com">bristolboilerrepairs247@gmail.com</a>
                </li>
                <li>Bristol, BS13</li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Areas</h3>
              <ul>
                <li>Bristol</li>
                <li>Redfield · St George · Easton</li>
                <li>Bedminster · Clifton</li>
                <li>Kingswood · Fishponds</li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Quick links</h3>
              <ul>
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
                  <a href="#quote">Get a quote</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>Open 24 hours, Monday to Sunday</span>
            <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
              Website by WebForTrades
            </a>
          </div>
        </div>
      </footer>

      <div className="sticky-call" id="sticky-call" aria-hidden="true">
        <a className="sticky-quote" href="#quote">
          Get a quote
        </a>
        <a className="sticky-phone" href="tel:07854476888">
          Call now
        </a>
      </div>
    </>
  );
}
