import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

const phone = "07535 601836";
const phoneTel = "07535601836";

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <header className="site-header" id="site-header" data-od-id="header">
        <div className="container">
          <div className="header-inner">
            <div className="brand">
              <span className="brand-name">Tom Baker Plumbing and Gas Solutions</span>
              <span className="brand-tag">Bristol · Gas work</span>
            </div>
            <nav className="header-nav" aria-label="Primary">
              <a href="#services">Services</a>
              <a href="#reviews">Reviews</a>
              <a href="#areas">Areas</a>
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
            <a href="#reviews">Reviews</a>
            <a href="#areas">Areas</a>
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
                &ldquo;Tom is knowledgeable, professional &amp; efficient.&rdquo;
                <cite>Claire · Google review</cite>
              </h1>
              <p className="hero-lead">
                Gas work, plumbing and heating across Bristol. Boiler installs, leak repairs and emergency
                callouts from a local engineer customers trust.
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
                src="/assets/images/01-places.webp"
                alt="Worcester Bosch boiler installation with neat copper pipework by Tom Baker Plumbing and Gas Solutions in Bristol"
                width={1200}
                height={1600}
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
              <strong>4.9 on Google</strong>
              <span>15 reviews</span>
            </div>
            <div className="proof-item">
              <strong>Gas work</strong>
              <span>Registered trade</span>
            </div>
            <div className="proof-item">
              <strong>{phone}</strong>
              <span>Direct line</span>
            </div>
            <div className="proof-item">
              <strong>Bristol BS15</strong>
              <span>Service area</span>
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
                When a leak, loss of heating or boiler fault cannot wait, call Tom Baker Plumbing and Gas
                Solutions. Claire&apos;s review describes a quick response to a heating leak before a new
                boiler was fitted.
              </p>
            </div>
            <a className="emergency-phone" href={`tel:${phoneTel}`}>
              {phone}
            </a>
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
              <p>
                Work covered by Tom Baker Plumbing and Gas Solutions, drawn from the business profile and
                customer feedback.
              </p>
            </header>
            <ul className="services-list">
              <li className="service-card reveal">
                <h3>Gas work</h3>
                <p>
                  Registered gas work for homes across Bristol, including boiler installations and gas-related
                  repairs.
                </p>
              </li>
              <li className="service-card reveal">
                <h3>Boiler repairs and servicing</h3>
                <p>
                  Boiler faults, servicing and new Worcester installations. Doug&apos;s review describes a new
                  boiler fitted for a reasonable price with requirements considered carefully.
                </p>
              </li>
              <li className="service-card reveal">
                <h3>General plumbing</h3>
                <p>
                  Everyday plumbing repairs and installations, including leak and burst pipe work when heating
                  or pipework fails.
                </p>
              </li>
              <li className="service-card reveal">
                <h3>Tap, toilet and shower repairs</h3>
                <p>
                  Stop taps, toilets and bathroom fittings. Neil&apos;s review mentions a new stop tap and toilet
                  repair at short notice.
                </p>
              </li>
              <li className="service-card reveal">
                <h3>Heating and radiators</h3>
                <p>
                  Heating system support including radiator work. Claire&apos;s review describes a heating leak
                  repaired before a new boiler was fitted.
                </p>
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
              <p>
                Google feedback for Tom Baker Plumbing and Gas Solutions names Tom directly across boiler,
                plumbing and commercial jobs.
              </p>
            </header>
            <div className="featured-grid">
              <article className="featured-card reveal">
                <blockquote>
                  <p>
                    &ldquo;Had a new Worcester boiler fitted by Tom, very pleased with the work he has done for a
                    reasonable price. He considered our requirements and was courteous in our home. I
                    couldn&apos;t recommend him more.&rdquo;
                  </p>
                </blockquote>
                <footer>Doug · Google review</footer>
              </article>
              <article className="featured-card reveal">
                <blockquote>
                  <p>
                    &ldquo;Tom came over at short notice and fitted a new stop tap and fixed our toilet. He was very
                    polite and left everything clean and tidy.&rdquo;
                  </p>
                </blockquote>
                <footer>Neil · Google review</footer>
              </article>
              <article className="featured-card reveal">
                <blockquote>
                  <p>
                    &ldquo;Tom is 100% professional and reliable. I have called on Tom twice and completely trust
                    his honesty and workmanship and he&apos;s a really nice guy.&rdquo;
                  </p>
                </blockquote>
                <footer>Jules · Google review</footer>
              </article>
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
                <p>
                  Explain what needs attention so Tom can advise on the right approach, as Claire&apos;s review
                  describes for boiler location and choice.
                </p>
              </li>
              <li className="process-step reveal">
                <h3>Tom attends</h3>
                <p>
                  Tom visits to assess and carry out the work, including jobs completed while customers are out,
                  as noted in customer feedback.
                </p>
              </li>
              <li className="process-step reveal">
                <h3>Job completed</h3>
                <p>Work is finished tidily and you know where to call if anything else needs attention.</p>
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
              <h2 id="reviews-heading">4.9 on Google reviews</h2>
              <p>Feedback published on Google for Tom Baker Plumbing and Gas Solutions.</p>
              <span className="rating-badge" aria-label="4.9 out of 5 from 15 Google reviews">
                <StarIcon />
                4.9 · 15 reviews
              </span>
            </header>
            <div className="reviews-grid">
              <article className="review-card reveal">
                <blockquote>
                  <p>
                    &ldquo;Tom is knowledgeable, professional &amp; efficient. He was able to respond quickly to a
                    leak in my heating &amp; as well as fixing the leak, I also wanted him to fit a new boiler. He
                    gave great advice on the most suitable boiler &amp; the best place to locate it. He worked alone
                    whilst I was out at work &amp; was totally trustworthy, along with being incredibly tidy in his
                    work, even staying late on his last day, to ensure he left everything tidy. A very
                    conscientious, friendly &amp; professional person, with high standards. I would highly recommend
                    to others.&rdquo;
                  </p>
                </blockquote>
                <footer>Claire · 5 stars</footer>
              </article>
              <article className="review-card reveal">
                <blockquote>
                  <p>
                    &ldquo;Tom came over at short notice and fitted a new stop tap and fixed our toilet. He was very
                    polite and left everything clean and tidy. The price was very reasonable too! I&apos;d happily
                    recommend him to anyone looking for good plumber.&rdquo;
                  </p>
                </blockquote>
                <footer>Neil · 5 stars</footer>
              </article>
              <article className="review-card reveal">
                <blockquote>
                  <p>
                    &ldquo;Had a new Worcester boiler fitted by Tom, very pleased with the work he has done for a
                    reasonable price. He considered our requirements and was courteous in our home. I
                    couldn&apos;t recommend him more.&rdquo;
                  </p>
                </blockquote>
                <footer>Doug · 5 stars</footer>
              </article>
              <article className="review-card reveal">
                <blockquote>
                  <p>
                    &ldquo;Tom is 100% professional and reliable. I have called on Tom twice and completely trust
                    his honesty and workmanship and he&apos;s a really nice guy. Thanks Tom for your work.&rdquo;
                  </p>
                </blockquote>
                <footer>Jules · 5 stars</footer>
              </article>
              <article className="review-card reveal">
                <blockquote>
                  <p>
                    &ldquo;Thank you so much for sorting out our coffee machine leak. Fast and professional service,
                    up to very high standards. Highly recommend.&rdquo;
                  </p>
                </blockquote>
                <footer>Sweven · 5 stars</footer>
              </article>
            </div>
          </div>
        </section>

        <section
          className="local"
          id="areas"
          data-section-id="local-coverage"
          data-od-id="local-coverage"
          aria-labelledby="local-heading"
        >
          <div className="container local-grid reveal">
            <div>
              <h2 id="local-heading">Based in Bristol</h2>
              <p>
                Tom Baker Plumbing and Gas Solutions is based in Bristol BS15 and covers Bristol and nearby
                neighbourhoods.
              </p>
              <ul className="area-list" aria-label="Areas covered">
                <li>Redfield</li>
                <li>St George</li>
                <li>Easton</li>
                <li>Bedminster</li>
                <li>Clifton</li>
              </ul>
            </div>
            <figure>
              <img
                className="local-photo"
                src="/assets/images/02-places.webp"
                alt="Commercial plumbing work including coffee machine pipework by Tom Baker Plumbing and Gas Solutions"
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
              <h2 id="contact-heading">Get a quote from Tom Baker Plumbing and Gas Solutions</h2>
              <p className="contact-intro">
                Describe the job and Tom will come back to arrange a visit or provide a quote. For urgent faults,
                call the line below.
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
          <span>&copy; Tom Baker Plumbing and Gas Solutions</span>
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
