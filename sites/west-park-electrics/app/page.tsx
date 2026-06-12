import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

export default function HomePage() {
  return (
    <>
      <SiteEnhancements />
      <header className="site-header" data-review="header">
        <div className="container">
          <a href="#" className="wordmark">
            West Park Electrics
          </a>
          <nav className="header-nav" aria-label="Main">
            <a href="#services">Services</a>
            <a href="#gallery">Work</a>
            <a href="#reviews">Reviews</a>
            <a href="#areas">Areas</a>
            <a href="#quote">Get a quote</a>
          </nav>
          <a className="header-call" href="tel:07889228995">
            Call 07889 228995
          </a>
        </div>
      </header>

      <section
        className="hero-typography"
        id="hero"
        data-section-id="hero"
        data-review="hero"
        aria-labelledby="hero-heading"
      >
        <div className="container reveal">
          <p className="hero-eyebrow">Electrician · Leeds LS16</p>
          <h1 id="hero-heading">Leeds electrics, tested and tidy.</h1>
          <p className="hero-lead">
            Domestic electrical work across Leeds, from light fittings and sockets to cooker installs and
            extractor fans.
          </p>
          <div className="hero-proof-bar" aria-label="Customer proof">
            <div className="proof-item">
              <strong>5.0 on Google</strong>
              <span>Across 30 reviews</span>
            </div>
            <div className="proof-item">
              <strong>Based in Leeds</strong>
              <span>LS16 area</span>
            </div>
            <div className="proof-item">
              <strong>Quick to respond</strong>
              <span>Mentioned in customer reviews</span>
            </div>
          </div>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#quote">
              Get a quote
            </a>
            <a className="btn btn-ghost" href="tel:07889228995">
              Call 07889 228995
            </a>
          </div>
          <figure className="hero-quote">
            <blockquote cite="https://maps.google.com/?cid=3796732482915553652">
              My father was an electrician and he was planning to fit a cooker for my nan, unfortunately he
              passed away. I rang Choudhary and he got it done, the man is a saint and understood what my
              nan was going through and did not charge! The whole family will be praying for you Choudhary!
              She will definitely be using him again.
            </blockquote>
            <cite>Aiden · Google review</cite>
          </figure>
        </div>
      </section>

      <section
        className="section section--warm"
        id="services"
        data-section-id="services"
        aria-labelledby="services-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="services-heading">Three electrical services</h2>
            <p>What customers actually hired West Park Electrics for, taken from Google reviews.</p>
          </div>
          <div className="services-grid">
            <article className="service-card">
              <p className="service-num">01</p>
              <h3>Electrical lights and light fittings</h3>
              <p>
                Fixing electrical lights and changing light fittings. Tecle praised short-notice work carried
                out with great care. Lesley-Ann had light fittings changed and a dodgy socket sorted.
              </p>
            </article>
            <article className="service-card">
              <p className="service-num">02</p>
              <h3>Extractor fan installation</h3>
              <p>
                Bathroom extractor fans installed after a quick response to queries and a date arranged
                promptly. Nick had a couple of fans fitted and described a really tidy job.
              </p>
            </article>
            <article className="service-card">
              <p className="service-num">03</p>
              <h3>Cooker fitting and socket work</h3>
              <p>
                Cooker fitting when a family needed help at short notice. Socket faults diagnosed and
                repaired after a super quick quote.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        className="section section--surface"
        id="gallery"
        data-section-id="gallery"
        aria-labelledby="gallery-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="gallery-heading">Recent electrical work in Leeds</h2>
            <p>Photos from completed projects listed on Google.</p>
          </div>
          <div className="gallery-strip">
            <figure className="gallery-item">
              <img
                src="/assets/images/03-places.webp"
                alt="Completed project photo"
                width={1200}
                height={1600}
                loading="lazy"
              />
            </figure>
            <figure className="gallery-item">
              <img
                src="/assets/images/04-places.webp"
                alt="Electrical installation project"
                width={1200}
                height={1600}
                loading="lazy"
              />
            </figure>
            <figure className="gallery-item">
              <img
                src="/assets/images/05-places.webp"
                alt="Completed project photo"
                width={1200}
                height={1600}
                loading="lazy"
              />
            </figure>
            <figure className="gallery-item">
              <img
                src="/assets/images/06-places.webp"
                alt="Completed project photo"
                width={1200}
                height={1600}
                loading="lazy"
              />
            </figure>
            <figure className="gallery-item">
              <img
                src="/assets/images/09-places.webp"
                alt="Completed project photo"
                width={1200}
                height={1600}
                loading="lazy"
              />
            </figure>
          </div>
        </div>
      </section>

      <section
        className="section section--light"
        id="reviews"
        data-section-id="reviews"
        aria-labelledby="reviews-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="reviews-heading">5 on Google reviews</h2>
            <p>Full quotes from verified Google reviews. Wording unchanged.</p>
          </div>
          <div className="review-highlights">
            <h3 id="highlights-heading">What reviewers highlight</h3>
            <ul className="highlight-list">
              <li>Quick response to queries and a date arranged promptly</li>
              <li>Professional, polite and friendly throughout the job</li>
              <li>Tidy installation work on lights, sockets and extractor fans</li>
              <li>Fair pricing and customers who would recommend again</li>
            </ul>
            <figure className="featured-review">
              <blockquote cite="https://maps.google.com/?cid=3796732482915553652">
                We had installation of a bathroom extractor fan. Choudhary was really quick to respond to all
                of our queries and arrange a date for installation. He was really professional, polite and
                friendly. Would definitely recommend this company.
              </blockquote>
              <cite>Piotr · Google review</cite>
            </figure>
          </div>
          <div className="review-grid">
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=3796732482915553652">
                My father was an electrician and he was planning to fit a cooker for my nan, unfortunately he
                passed away. I rang Choudhary and he got it done, the man is a saint and understood what my
                nan was going through and did not charge! The whole family will be praying for you Choudhary!
                She will definitely be using him again.
              </blockquote>
              <cite>Aiden</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=3796732482915553652">
                ⭐️⭐️⭐️⭐️⭐️ West Park Electrics provided an excellent service in fixing my electrical lights.
                Ateeque was especially professional, friendly, and down to earth. He carried out the work on
                short notice and did so with great care. I&apos;m very pleased with the service and highly
                recommend them. Kind regards, Tecle
              </blockquote>
              <cite>Tecle</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=3796732482915553652">
                We had installation of a bathroom extractor fan. Choudhary was really quick to respond to all
                of our queries and arrange a date for installation. He was really professional, polite and
                friendly. Would definitely recommend this company.
              </blockquote>
              <cite>Piotr</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=3796732482915553652">
                Choudhary did an amazing job of changing my light fittings and sorting a dodgy socket. He was
                super quick to quote and got the work done in no time. Really happy with his service and would
                100% recommend!
              </blockquote>
              <cite>Lesley-Ann</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=3796732482915553652">
                Had a couple of extractor fans fitted and very happy with the work. Really tidy job and polite
                and professional throughout. Highly recommended.
              </blockquote>
              <cite>Nick</cite>
            </article>
          </div>
        </div>
      </section>

      <section
        className="section section--cool"
        id="process"
        data-section-id="process"
        aria-labelledby="process-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="process-heading">How a job with us works</h2>
            <p>A straightforward process described across verified customer feedback.</p>
          </div>
          <ol className="process-steps">
            <li className="process-step">
              <h3>Ring or message</h3>
              <p>Get in touch to describe the electrical job you need doing.</p>
            </li>
            <li className="process-step">
              <h3>Quick quote</h3>
              <p>You get a prompt response and a date arranged for the work.</p>
            </li>
            <li className="process-step">
              <h3>Tidy installation</h3>
              <p>Work carried out professionally, politely and with a neat finish.</p>
            </li>
            <li className="process-step">
              <h3>Would recommend</h3>
              <p>Customers say they would use West Park Electrics again and recommend to others.</p>
            </li>
          </ol>
        </div>
      </section>

      <section
        className="section section--accent"
        id="areas"
        data-section-id="service-area"
        aria-labelledby="areas-heading"
      >
        <div className="container reveal">
          <div className="coverage-grid">
            <div>
              <div className="section-intro">
                <h2 id="areas-heading">Based in Leeds</h2>
                <p>
                  West Park Electrics is listed in Leeds, LS16. Service area covers Leeds and the surrounding
                  LS16 postcode area.
                </p>
              </div>
              <ul className="area-list">
                <li>Leeds</li>
                <li>Leeds LS16</li>
              </ul>
            </div>
            <div className="map-embed">
              <iframe
                title="West Park Electrics on Google Maps"
                src="https://maps.google.com/maps?q=Leeds+LS16+5DF&output=embed"
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
        aria-labelledby="contact-heading"
      >
        <div className="container reveal">
          <div className="contact-grid">
            <div>
              <div className="section-intro">
                <h2 id="contact-heading">Get a quote from West Park Electrics</h2>
                <p>
                  Call to discuss lights, sockets, cooker fitting, extractor fans or other domestic electrical
                  work in Leeds.
                </p>
              </div>
              <div className="contact-details">
                <div className="contact-block">
                  <h3>Phone</h3>
                  <p>
                    <a href="tel:07889228995">07889 228995</a>
                  </p>
                </div>
                <div className="contact-block">
                  <h3>Opening hours</h3>
                  <ul className="hours-list">
                    <li>Monday: 8:00 AM to 4:30 AM</li>
                    <li>Tuesday: 8:00 AM to 4:30 PM</li>
                    <li>Wednesday: 8:00 AM to 4:30 PM</li>
                    <li>Thursday: 8:00 AM to 4:30 PM</li>
                    <li>Friday: 8:00 AM to 12:00 PM</li>
                    <li>Saturday: 8:00 AM to 3:00 PM</li>
                    <li>Sunday: 8:00 AM to 3:00 PM</li>
                  </ul>
                </div>
                <div className="contact-block">
                  <h3>Google listing</h3>
                  <p>
                    <a href="https://maps.google.com/?cid=3796732482915553652" rel="noopener noreferrer">
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

      <footer className="site-footer" id="footer">
        <div className="container footer-inner">
          <p>
            West Park Electrics · Leeds · <a href="tel:07889228995">07889 228995</a>
          </p>
          <p>
            <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
              Website by WebForTrades
            </a>
          </p>
        </div>
      </footer>

      <div className="sticky-call" id="sticky-call" aria-hidden="true">
        <a className="btn btn-primary" href="tel:07889228995">
          Call 07889 228995
        </a>
      </div>
    </>
  );
}
