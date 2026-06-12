import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

export default function HomePage() {
  return (
    <>
      <header className="site-header" id="site-header">
        <div className="container">
          <a href="#top" className="wordmark">
            Greens Precise
            <span>Plumbing &amp; Heating</span>
          </a>
          <div className="header-actions">
            <a href="#quote" className="btn btn-primary">Get quote</a>
            <a href="tel:07309553552" className="btn btn-outline header-phone">07309 553552</a>
          </div>
        </div>
      </header>

      {/* 1. Hero */}
      <section className="hero" id="top" data-od-id="hero">
        <div className="container hero-grid">
          <div className="hero-copy reveal">
            <h1>Precise plumbing, heating and beautiful bathrooms in Swansea</h1>
            <p className="hero-proof">5.0 on Google across 45+ reviews. 100% recommended on Facebook. A local plumbing and heating company with a reliable, friendly service.</p>
            <div className="hero-ctas">
              <a href="#quote" className="btn btn-primary">Get a free quote</a>
              <a href="tel:07309553552" className="btn btn-outline">Call 07309 553552</a>
            </div>
          </div>
          <div className="hero-image-wrap reveal">
            <figure className="hero-image">
              <img src="/assets/images/hero-bathroom.webp" alt="Renovated bathroom with freestanding bath, marble surfaces and brass fittings" width={800} height={1000} fetchPriority="high" />
            </figure>
            <p className="hero-caption">Full bathroom renovation, Swansea</p>
          </div>
        </div>
      </section>

      {/* 2. Proof strip */}
      <section className="section section-ivory" data-od-id="proof">
        <div className="container">
          <div className="proof-strip reveal">
            <div className="proof-item">
              <p className="proof-value">5.0</p>
              <p className="proof-label">on Google across 45+ reviews</p>
            </div>
            <div className="proof-item">
              <p className="proof-value">100%</p>
              <p className="proof-label">recommended on Facebook</p>
            </div>
            <div className="proof-item">
              <p className="proof-value">Swansea</p>
              <p className="proof-label">based in SA1, serving the local area</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. What customers keep mentioning */}
      <section className="section section-stone" data-od-id="mentions">
        <div className="container">
          <div className="section-intro reveal">
            <p className="section-label">What customers keep mentioning</p>
            <h2>The details that come up again and again</h2>
          </div>
          <div className="mention-grid">
            <article className="mention-card reveal">
              <h3>Accurate quotes</h3>
              <p>Customers describe quotes as spot on, emailed quickly, and delivered on agreed costs. Heidi booked a new boiler after her first visit.</p>
            </article>
            <article className="mention-card reveal">
              <h3>Tidy finishes</h3>
              <p>Chris and David both note the team cleaned up after themselves. Teresa was pleased with a shower enclosure and an extra toilet fix.</p>
            </article>
            <article className="mention-card reveal">
              <h3>Reliable</h3>
              <p>David&apos;s radiators were fitted on time. Teresa&apos;s work started when agreed. Rhys had a leak sorted within a couple of hours of calling.</p>
            </article>
            <article className="mention-card reveal">
              <h3>Friendly</h3>
              <p>Callum explained the job clearly. Teresa found the team polite and professional. Rhys called it the best experience he could have had.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 4. What Greens handles */}
      <section className="section section-ivory" id="services" data-od-id="services">
        <div className="container">
          <div className="section-intro reveal">
            <p className="section-label">What Greens handles</p>
            <h2>Plumbing, heating and high-end renovations</h2>
            <p>From a leaking tap to a full bathroom or kitchen refit, backed by review evidence across Swansea.</p>
          </div>
          <ul className="services-list">
            <li className="service-item reveal">
              <h3>Bathroom renovations and installations</h3>
              <p>Shower enclosures, vanity units, heated towel rails and full bathroom refits.</p>
            </li>
            <li className="service-item reveal">
              <h3>Heating and radiators</h3>
              <p>Radiator fitting, including tricky installs. David had four radiators fitted in super quick time.</p>
            </li>
            <li className="service-item reveal">
              <h3>Boiler repairs and servicing</h3>
              <p>Heidi booked Greens in for a new boiler after her first repair visit.</p>
            </li>
            <li className="service-item reveal">
              <h3>Leak and burst pipe repairs</h3>
              <p>Fast response when you need it. Rhys had a flush leak sorted the same day he called.</p>
            </li>
            <li className="service-item reveal">
              <h3>Taps, toilets and shower repairs</h3>
              <p>Kitchen tap leaks, toilets that will not flush, and shower fitting. Heidi and Teresa both had these dealt with efficiently.</p>
            </li>
            <li className="service-item reveal">
              <h3>General plumbing</h3>
              <p>New toilets, hand basins and everyday plumbing work. Chris needed a new toilet and basin plumbed in.</p>
            </li>
          </ul>
          <div className="mid-cta reveal">
            <p>Need plumbing, heating or bathroom work in Swansea?</p>
            <div className="mid-cta-actions">
              <a href="#quote" className="btn btn-primary">Get a free quote</a>
              <a href="tel:07309553552" className="btn btn-outline-dark">Call 07309 553552</a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Recent work */}
      <section className="section section-ivory" id="work" data-od-id="gallery">
        <div className="container">
          <div className="section-intro reveal">
            <p className="section-label">Recent work</p>
            <h2>Bathrooms, kitchens and heating</h2>
          </div>
          <div className="gallery">
            <figure className="gallery-item reveal">
              <img src="/assets/images/hero-bathroom.webp" alt="Full bathroom renovation with freestanding bath and marble" width={800} height={600} loading="lazy" />
              <figcaption>Full bathroom renovation, Swansea</figcaption>
            </figure>
            <figure className="gallery-item reveal">
              <img src="/assets/images/bathroom-shower-vanity.webp" alt="Walk-in shower with vanity and heated towel rail" width={600} height={450} loading="lazy" />
              <figcaption>Walk-in shower, vanity and heated towel rail</figcaption>
            </figure>
            <figure className="gallery-item reveal">
              <img src="/assets/images/bath-radiator.webp" alt="Freestanding bath with traditional radiator by a window" width={600} height={450} loading="lazy" />
              <figcaption>Freestanding bath and radiator fit</figcaption>
            </figure>
            <figure className="gallery-item reveal">
              <img src="/assets/images/matt-black-shower.webp" alt="Matt black shower fittings over a bath with concrete-effect tiles" width={500} height={400} loading="lazy" />
              <figcaption>Matt black shower fittings and bath</figcaption>
            </figure>
            <figure className="gallery-item reveal">
              <img src="/assets/images/kitchen-bayview.webp" alt="Modern fitted kitchen with island and sea view" width={500} height={400} loading="lazy" />
              <figcaption>Modern kitchen renovation with a bay view</figcaption>
            </figure>
            <figure className="gallery-item reveal">
              <img src="/assets/images/cloakroom-marble.webp" alt="Marble cloakroom with herringbone floor" width={500} height={400} loading="lazy" />
              <figcaption>Marble cloakroom with herringbone floor</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 6. One job in a customer's words */}
      <section className="section section-stone" data-od-id="pulled-quote">
        <div className="container">
          <div className="section-intro reveal" style={{ textAlign: "center", marginInline: "auto" }}>
            <p className="section-label">One job in a customer&apos;s words</p>
          </div>
          <div className="pulled-quote reveal">
            <blockquote>
              &quot;Have used several plumbers in the past, with varying success. Some were expensive, some were unreliable, it was always hit and miss. Thought I&apos;d give Greens Precise Plumbing a shot as I needed a new toilet and hand basin plumbed in. Callum was great, he explained the requirements for the job, provided an excellent quote and crucially delivered on the agreed costs and timescale. Highly recommended for being reliable, honest and professional, they even cleaned up after themselves. Great job Callum and Greens Precise Plumbing.&quot;
            </blockquote>
            <cite>Chris, Google review</cite>
          </div>
        </div>
      </section>

      {/* 7. How a job with Greens works */}
      <section className="section section-ivory" data-od-id="process">
        <div className="container">
          <div className="section-intro reveal">
            <p className="section-label">How a job with Greens works</p>
            <h2>From first call to tidy finish</h2>
          </div>
          <ol className="process-steps">
            <li className="process-step reveal">
              <span className="process-num" aria-hidden="true">1</span>
              <div>
                <h3>Book and quote</h3>
                <p>Call or email to describe the job. Chris received an excellent quote. Teresa had a quick quote emailed to her.</p>
              </div>
            </li>
            <li className="process-step reveal">
              <span className="process-num" aria-hidden="true">2</span>
              <div>
                <h3>Agree the price up front</h3>
                <p>Heidi found the quote spot on. Chris&apos;s costs matched what was agreed. Teresa was very happy with the price.</p>
              </div>
            </li>
            <li className="process-step reveal">
              <span className="process-num" aria-hidden="true">3</span>
              <div>
                <h3>Work on the agreed timescale</h3>
                <p>David&apos;s team arrived on time. Teresa&apos;s work started when agreed. Heidi was kept updated on arrival time.</p>
              </div>
            </li>
            <li className="process-step reveal">
              <span className="process-num" aria-hidden="true">4</span>
              <div>
                <h3>Tidy finish and easy invoicing</h3>
                <p>Chris and David both mention a clean finish. Rhys found payment over invoice straightforward.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* 8. More from Google */}
      <section className="section section-green" id="reviews" data-od-id="reviews">
        <div className="container">
          <div className="section-intro reveal">
            <p className="section-label">More from Google</p>
            <h2>What customers say</h2>
          </div>
          <div className="reviews-grid">
            <article className="review-card reveal">
              <p className="review-stars" aria-label="5 out of 5 stars">★★★★★</p>
              <blockquote>&quot;Have used several plumbers in the past, with varying success. Some were expensive, some were unreliable, it was always hit and miss. Thought I&apos;d give Greens Precise Plumbing a shot as I needed a new toilet and hand basin plumbed in. Callum was great, he explained the requirements for the job, provided an excellent quote and crucially delivered on the agreed costs and timescale. Highly recommended for being reliable, honest and professional, they even cleaned up after themselves. Great job Callum and Greens Precise Plumbing.&quot;</blockquote>
              <cite>Chris</cite>
            </article>
            <article className="review-card reveal">
              <p className="review-stars" aria-label="5 out of 5 stars">★★★★★</p>
              <blockquote>&quot;First class service from the Greens Plumbing team. Responsive service, easy to book and kept me updated on time of arrival so I did not have to wait in all day. I had a toilet that did not flush and a leak in the kitchen tap, both dealt with very well and efficiently. The quote was spot on. I have already booked them in for a new boiler. Would definitely recommend.&quot;</blockquote>
              <cite>Heidi</cite>
            </article>
            <article className="review-card reveal">
              <p className="review-stars" aria-label="5 out of 5 stars">★★★★★</p>
              <blockquote>&quot;Called Greens Precise Plumbing and Heating in the morning after I had a leak in my flush and did not think I would be seen to until at least the next day, but the guys came over a couple of hours later and sorted the issue out. Payment over invoice was also a breeze. Couldn&apos;t have had a better experience. Highly recommend them.&quot;</blockquote>
              <cite>Rhys</cite>
            </article>
            <article className="review-card reveal">
              <p className="review-stars" aria-label="5 out of 5 stars">★★★★★</p>
              <blockquote>&quot;Excellent service from start to finish. Quick and easy quote emailed, turned up when the work was agreed to be started. Really nice shower enclosure installed and also fixed my toilet which wasn&apos;t originally planned. Lovely, polite and professional. The price I was very happy with too.&quot;</blockquote>
              <cite>Teresa</cite>
            </article>
            <article className="review-card reveal">
              <p className="review-stars" aria-label="5 out of 5 stars">★★★★★</p>
              <blockquote>&quot;Callum and his team arrived on time, did a great job fitting 4 radiators, 2 of which were very tricky. Finished in super quick time and tidied up after themselves. Very impressed and definitely will use his services again.&quot;</blockquote>
              <cite>David</cite>
            </article>
          </div>
          <div className="mid-cta mid-cta-on-green reveal">
            <p>Ready to book Greens for your job?</p>
            <div className="mid-cta-actions">
              <a href="#quote" className="btn btn-primary">Get a free quote</a>
              <a href="tel:07309553552" className="btn btn-outline">Call 07309 553552</a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Where Greens works */}
      <section className="section section-stone" data-od-id="area">
        <div className="container">
          <div className="section-intro reveal">
            <p className="section-label">Where Greens works</p>
            <h2>Local to Swansea</h2>
          </div>
          <div className="area-content reveal">
            <div className="area-block">
              <h3>Swansea</h3>
              <p>Based in SA1. A local plumbing and heating company in the area of Swansea, with 823 followers on Facebook and a reliable, friendly service.</p>
            </div>
            <div className="area-block">
              <h3>The Mumbles</h3>
              <p>Recent kitchen renovation work with a bay view, part of Greens&apos; bathroom and kitchen renovation offering.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Contact */}
      <section className="section section-green" id="contact" data-od-id="contact">
        <div className="container">
          <div className="contact-grid">
            <div className="reveal">
              <p className="section-label">Get in touch</p>
              <h2>Call, email or request a quote</h2>
              <p className="contact-lead">Bathroom renovation, heating, boiler work or a leaking tap. Greens Precise Plumbing &amp; Heating is ready to help.</p>
              <div className="contact-ctas">
                <a href="#quote" className="btn btn-primary">Get a free quote</a>
                <a href="tel:07309553552" className="btn btn-outline">Call 07309 553552</a>
              </div>
              <p className="contact-email-line">
                Or email{" "}
                <a href="mailto:info@gpplumbingltd.com">info@gpplumbingltd.com</a>
              </p>
            </div>
            <div className="reveal">
              <dl className="contact-details">
                <div className="contact-row">
                  <dt>Phone</dt>
                  <dd><a href="tel:07309553552">07309 553552</a></dd>
                </div>
                <div className="contact-row">
                  <dt>Email</dt>
                  <dd><a href="mailto:info@gpplumbingltd.com">info@gpplumbingltd.com</a></dd>
                </div>
                <div className="contact-row">
                  <dt>Facebook</dt>
                  <dd><a href="https://www.facebook.com/GPPlumbingandHeatingLtd" rel="noopener noreferrer" target="_blank">GP Plumbing and Heating Ltd</a></dd>
                </div>
              </dl>
              <table className="hours-table" aria-label="Opening hours">
                <tbody>
                  <tr><td>Monday to Friday</td><td>8:00 to 17:00</td></tr>
                  <tr><td>Saturday</td><td>8:00 to 13:00</td></tr>
                  <tr><td>Sunday</td><td>Closed</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Quote form */}
      <section className="section section-ivory" id="quote" data-od-id="quote">
        <div className="container">
          <QuoteForm />
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <p>&copy; Greens Precise Plumbing &amp; Heating Ltd. Swansea.</p>
          <p>Website by <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer" target="_blank">WebForTrades</a></p>
        </div>
      </footer>

      <nav className="mobile-call-bar" aria-label="Quick actions">
        <a href="#quote">Get quote</a>
        <a href="tel:07309553552">Call</a>
      </nav>

      <SiteEnhancements />
    </>
  );
}
