import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

export default function HomePage() {
  return (
    <>
      <SiteEnhancements />

      <header className="site-header">
        <div className="container">
          <a href="#" className="wordmark">
            RM ELECTRICAL
          </a>
          <nav className="header-nav" aria-label="Main">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#reviews">Reviews</a>
            <a href="#areas">Areas</a>
            <a href="#quote">Get a quote</a>
          </nav>
          <a className="header-call" href="tel:07807319073">
            Call 07807 319073
          </a>
        </div>
      </header>

      <section
        className="hero"
        id="hero"
        data-section-id="hero"
        aria-labelledby="hero-heading"
      >
        <div className="hero-grid">
          <div className="hero-content">
            <div className="container">
              <p className="hero-kicker">Electrician · Leeds LS4</p>
              <figure className="hero-quote">
                <blockquote cite="https://maps.google.com/?cid=1826696652184966720">
                  <p id="hero-heading">
                    Called Ryan on a Thursday asking to come replace our induction hob. Despite being booked up,
                    he managed to fit the job in the very next day. Excellent job done at a very fair price.
                  </p>
                </blockquote>
                <cite>David · Google review</cite>
              </figure>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#quote">
                  Get a quote
                </a>
                <a className="btn btn-ghost" href="tel:07807319073">
                  Call 07807 319073
                </a>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="/assets/images/01-places.webp"
              alt="Completed electrical work by RM ELECTRICAL in Leeds"
              width={900}
              height={1600}
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <div className="stats-band" data-section-id="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <strong>5.0 on Google</strong>
              <span>Across 21 reviews</span>
            </div>
            <div className="stat-item">
              <strong>Based in Kirkstall</strong>
              <span>Leeds LS4 2QR</span>
            </div>
            <div className="stat-item">
              <strong>Open 24 hours</strong>
              <span>Listed on Google</span>
            </div>
          </div>
        </div>
      </div>

      <section
        className="callout-dark"
        data-section-id="emergency"
        aria-labelledby="emergency-heading"
      >
        <div className="container callout-inner reveal">
          <div>
            <h2 id="emergency-heading">Urgent electrical jobs in Leeds</h2>
            <p>
              Customers mention Ryan fitting work quickly, even when already booked. One review describes an
              induction hob replacement brought forward to the next day. Another describes a boiler wiring fault
              sorted efficiently.
            </p>
          </div>
          <div className="callout-actions">
            <a className="btn btn-primary" href="tel:07807319073">
              Call 07807 319073
            </a>
            <a className="btn btn-ghost" href="https://wa.me/447807319073" rel="noopener noreferrer">
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section
        className="section section--light"
        id="work"
        data-section-id="gallery"
        aria-labelledby="gallery-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="gallery-heading">Recent electrical work in Leeds</h2>
            <p>Photos from completed projects listed on Google.</p>
          </div>
          <div className="gallery-pairs">
            <div className="gallery-pair">
              <figure>
                <img
                  src="/assets/images/02-places.webp"
                  alt="Completed electrical project photo"
                  width={900}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure>
                <img
                  src="/assets/images/03-places.webp"
                  alt="Completed electrical project photo"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
            </div>
            <div className="gallery-pair">
              <figure>
                <img
                  src="/assets/images/04-places.webp"
                  alt="Completed electrical project photo"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure>
                <img
                  src="/assets/images/05-places.webp"
                  alt="Completed electrical project photo"
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
                  alt="Completed electrical project photo"
                  width={900}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure>
                <img
                  src="/assets/images/07-places.webp"
                  alt="Completed electrical project photo"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
            </div>
            <div className="gallery-pair">
              <figure>
                <img
                  src="/assets/images/08-places.webp"
                  alt="Completed electrical project photo"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
              <figure>
                <img
                  src="/assets/images/09-places.webp"
                  alt="Completed electrical project photo"
                  width={1200}
                  height={1600}
                  loading="lazy"
                />
              </figure>
            </div>
            <div className="gallery-pair">
              <figure>
                <img
                  src="/assets/images/10-places.webp"
                  alt="Completed electrical project photo"
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
        className="section section--warm"
        id="services"
        data-section-id="services"
        aria-labelledby="services-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="services-heading">Three services explained plainly</h2>
            <p>What customers actually hired RM ELECTRICAL for, taken from Google reviews.</p>
          </div>
          <ul className="services-list">
            <li className="service-item">
              <h3>Kitchen electrical work</h3>
              <p>
                Induction hob replacement, kitchen spot lights, light fittings and fault finding. David had a hob
                fitted the day after calling. Gareth had spot lights changed, a fault fixed and two other fittings
                swapped.
              </p>
            </li>
            <li className="service-item">
              <h3>Security and outdoor lighting</h3>
              <p>
                Security light installation with polite, friendly communication from the first message. Mark
                described straightforward work and a cost he was happy with.
              </p>
            </li>
            <li className="service-item">
              <h3>Boiler wiring and small electrical jobs</h3>
              <p>
                Non-live wire issues at a boiler sorted efficiently. Annette lists several small electrical jobs
                completed to a high standard, professionally and tidily.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section
        className="section section--surface"
        data-section-id="featured-review"
        aria-labelledby="ryan-heading"
      >
        <div className="container reveal">
          <div className="section-intro">
            <h2 id="ryan-heading">What customers say</h2>
            <p>Five Google reviewers name Ryan directly when describing their experience.</p>
          </div>
          <figure className="featured-review">
            <blockquote cite="https://maps.google.com/?cid=1826696652184966720">
              Called <span className="name-callout">Ryan</span> who came round, quoted the job and completed it to a
              very high standard. Changed all spot lights in the kitchen, fixed a fault and swapped out two other light
              fittings. Would highly recommend them, prompt, fast, great customer service and very good price. A+
            </blockquote>
            <cite>Gareth · Google review</cite>
          </figure>
        </div>
      </section>

      <section
        className="section section--cool"
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
              <p>Call Ryan to describe the electrical job you need doing.</p>
            </li>
            <li className="process-step">
              <h3>Quote on the job</h3>
              <p>Ryan comes round, quotes the work and arranges a date that suits you.</p>
            </li>
            <li className="process-step">
              <h3>Tidy, high-standard finish</h3>
              <p>Work completed professionally. Reviews mention punctual, friendly service and a neat finish.</p>
            </li>
            <li className="process-step">
              <h3>Fair price, would recommend</h3>
              <p>Customers describe very fair pricing and say they would use RM ELECTRICAL again.</p>
            </li>
          </ol>
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
          <div className="review-grid">
            <article className="review-card review-card--wide">
              <blockquote cite="https://maps.google.com/?cid=1826696652184966720">
                Called Ryan on a Thursday asking to come replace our induction hob, he asked if he could come over on
                the following Monday as he was busy until then, i explained how I needed it sooner &amp; despite being
                booked up he managed to fit the job in the very next day . Excellent job done at a very fair price.
                Definitely recommend.
              </blockquote>
              <cite>David</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=1826696652184966720">
                Called Ryan who came round, quoted the job and completed it to a very high standard. Changed all spot
                lights in the kitchen, fixed a fault and swapped out two other light fittings. Would highly recommend
                them, prompt, fast, great customer service and very good price. A+
              </blockquote>
              <cite>Gareth</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=1826696652184966720">
                Ryan fitted a security light and did a great job. From the first communication, he was polite, friendly
                and punctual. Everything was straightforward and I was very happy with the cost of the job. Would
                recommend and use again!
              </blockquote>
              <cite>Mark</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=1826696652184966720">
                {`Great Service. Ryan was really professional; efficient; and tidy.\nWe had a number of small electrical jobs that Ryan sorted to a high standard\nWe would happily recommend his company and will definitely use again`}
              </blockquote>
              <cite>Annette</cite>
            </article>
            <article className="review-card">
              <blockquote cite="https://maps.google.com/?cid=1826696652184966720">
                We had an issue with the non live wire at our boiler. Ryan sorted it out efficiently. He was reasonable
                with price, very clean and done an amazing job for us. Would highly recommend.
              </blockquote>
              <cite>Zahid</cite>
            </article>
          </div>
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
                  RM ELECTRICAL is based in Kirkstall, Leeds LS4 2QR. Service area covers Leeds, Kirkstall and the
                  LS4 postcode area.
                </p>
              </div>
              <ul className="area-list">
                <li>Leeds</li>
                <li>Kirkstall</li>
                <li>Leeds LS4 2QR</li>
              </ul>
              <p className="address-block">Kirkstall, Leeds LS4 2QR</p>
            </div>
            <div className="map-embed">
              <iframe
                title="RM ELECTRICAL on Google Maps"
                src="https://maps.google.com/maps?q=Kirkstall,+Leeds+LS4+2QR&output=embed"
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
                <h2 id="contact-heading">Get a quote from RM ELECTRICAL</h2>
                <p>
                  Call Ryan to discuss kitchen electrical work, security lights, boiler wiring or other jobs in Leeds.
                </p>
              </div>
              <div className="contact-details">
                <div className="contact-block">
                  <h3>Phone</h3>
                  <p>
                    <a href="tel:07807319073">07807 319073</a>
                  </p>
                </div>
                <div className="contact-block">
                  <h3>WhatsApp</h3>
                  <p>
                    <a href="https://wa.me/447807319073" rel="noopener noreferrer">
                      Message 07807 319073
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
                    <li>Sunday: Open 24 hours</li>
                  </ul>
                </div>
                <div className="contact-block">
                  <h3>Google listing</h3>
                  <p>
                    <a href="https://maps.google.com/?cid=1826696652184966720" rel="noopener noreferrer">
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
            RM ELECTRICAL · Kirkstall, Leeds · <a href="tel:07807319073">07807 319073</a>
          </p>
          <p>
            <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">
              Website by WebForTrades
            </a>
          </p>
        </div>
      </footer>

      <div className="sticky-call" id="sticky-call" aria-hidden="true">
        <a className="btn btn-primary" href="tel:07807319073">
          Call 07807 319073
        </a>
      </div>
    </>
  );
}
