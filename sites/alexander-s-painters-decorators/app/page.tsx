import brief from "@/data/brief.json";
import { QuoteForm } from "@/components/QuoteForm";
import { SiteEnhancements } from "@/components/SiteEnhancements";

const name = brief.business_name;
const phone = brief.phone ?? "07944 444082";
const phoneTel = phone.replace(/\s/g, "");

export default function HomePage() {
  return (
    <>
      <header className="site-header" data-od-id="header" data-review="header">
        <div className="container site-header__inner">
          <a className="site-header__brand" href="#top">
            <span className="site-header__name">{name}</span>
            <span className="site-header__tagline">Bramhall &amp; Stockport SK7</span>
          </a>
          <nav className="site-header__nav" aria-label="Primary">
            <a href="#services">Services</a>
            <a href="#gallery">Work</a>
            <a href="#reviews">Reviews</a>
            <a href="#area">Coverage</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="site-header__actions">
            <a className="site-header__phone" href={`tel:${phoneTel}`}>
              {phone}
            </a>
            <a className="btn btn--primary" href="#quote">
              Get a quote
            </a>
          </div>
        </div>
      </header>

      <main id="content">
        <section
          className="section hero section--cool"
          data-section-id="hero"
          data-od-id="hero"
          data-review="hero"
          id="top"
          aria-labelledby="hero-heading"
        >
          <div className="container">
            <div className="hero__proof reveal">
              <div className="hero__rating num" aria-label="5 star Google rating">
                5.0<span>★ on Google</span>
              </div>
              <blockquote className="hero__quote">
                &ldquo;Having our upstairs box room refurbished. Neil removed the historic wallpaper, filled and sanded
                everywhere that needed it, and decorated the room fully.&rdquo;
                <cite>Sachin · Google review</cite>
              </blockquote>
            </div>
            <div className="hero__main">
              <div className="hero__copy reveal">
                <p className="hero__eyebrow">Painter &amp; decorator · Bramhall, Stockport</p>
                <h1 className="h1" id="hero-heading">
                  Bramhall and Stockport decorating, finished with care.
                </h1>
                <p className="lead">
                  Interior painting, wallpaper removal and room refurbishments across Bramhall, Stockport and surrounding
                  SK7 postcodes. Google reviews often mention tidy preparation, a lovely paint finish and attention to detail.
                </p>
                <div className="hero__cta">
                  <a className="btn btn--primary" href="#quote">
                    Get a quote
                  </a>
                  <a className="btn btn--secondary" href={`tel:${phoneTel}`}>
                    Call {phone}
                  </a>
                </div>
              </div>
              <figure className="hero__image reveal">
                <img
                  src="/assets/images/02-places.webp"
                  width={1600}
                  height={1200}
                  alt={`Finished interior decorating work by ${name}`}
                  loading="eager"
                />
              </figure>
            </div>
          </div>
        </section>

        <section
          className="section section--accent"
          data-section-id="stats"
          data-od-id="stats"
          aria-label="Google rating and reviews"
        >
          <div className="container">
            <div className="stats-strip reveal">
              <div className="stats-strip__item">
                <div className="stats-strip__num num">
                  5.0<span style={{ fontSize: "0.55em" }}>★</span>
                </div>
                <p className="stats-strip__label">
                  Average rating on Google from customers who have booked decorating work.
                </p>
              </div>
              <div className="stats-strip__item">
                <div className="stats-strip__num num">34+</div>
                <p className="stats-strip__label">Written Google reviews you can read before you call.</p>
              </div>
              <div className="stats-strip__item">
                <div
                  className="stats-strip__num"
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    paddingTop: "0.5rem",
                  }}
                >
                  Mon to Sun
                  <br />
                  8 am to 7 pm
                </div>
                <p className="stats-strip__label">Opening hours listed on Google for {name}.</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section"
          data-section-id="gallery"
          data-od-id="gallery"
          id="gallery"
          aria-labelledby="gallery-heading"
        >
          <div className="container stack-lg">
            <div className="reveal">
              <h2 className="h2" id="gallery-heading">
                Recent decorating work in Stockport
              </h2>
              <p className="lead">Photos from completed projects shared on Google.</p>
            </div>
            <div className="gallery reveal" aria-label="Gallery of completed decorating projects">
              <figure className="gallery__item">
                <img src="/assets/images/03-places.webp" width={1242} height={1551} alt="Decorated interior room" loading="lazy" />
              </figure>
              <figure className="gallery__item">
                <img src="/assets/images/04-places.webp" width={1200} height={1600} alt="Painted room interior" loading="lazy" />
              </figure>
              <figure className="gallery__item">
                <img src="/assets/images/05-places.webp" width={1199} height={1600} alt="Finished decorating project" loading="lazy" />
              </figure>
              <figure className="gallery__item">
                <img src="/assets/images/06-places.webp" width={988} height={1600} alt="Interior paint finish" loading="lazy" />
              </figure>
              <figure className="gallery__item">
                <img src="/assets/images/07-places.webp" width={1135} height={1600} alt="Room decoration detail" loading="lazy" />
              </figure>
              <figure className="gallery__item">
                <img src="/assets/images/08-places.webp" width={1206} height={928} alt="Wide view of decorated room" loading="lazy" />
              </figure>
              <figure className="gallery__item">
                <img src="/assets/images/09-places.webp" width={1195} height={1426} alt="Completed paintwork" loading="lazy" />
              </figure>
              <figure className="gallery__item">
                <img src="/assets/images/10-places.webp" width={1200} height={1600} alt="Finished interior space" loading="lazy" />
              </figure>
            </div>
          </div>
        </section>

        <section
          className="section section--warm"
          data-section-id="services"
          data-od-id="services"
          id="services"
          aria-labelledby="services-heading"
        >
          <div className="container stack-lg">
            <div className="reveal">
              <h2 className="h2" id="services-heading">
                4 services explained plainly
              </h2>
              <p className="lead">Work described in Google reviews and the business listing for {name}.</p>
            </div>
            <div className="services reveal">
              <article className="service">
                <h3 className="h3">Interior painting and decorating</h3>
                <p>
                  Living rooms, bedrooms and box rooms finished with walls, ceilings and woodwork painted to a high
                  standard. Customers mention a lovely paint finish and quality workmanship.
                </p>
              </article>
              <article className="service">
                <h3 className="h3">Wallpaper removal and preparation</h3>
                <p>
                  Historic wallpaper stripped, surfaces filled and sanded where needed so rooms are ready to decorate
                  without calling in a separate plasterer for minor repairs.
                </p>
              </article>
              <article className="service">
                <h3 className="h3">Woodwork, ceilings and radiators</h3>
                <p>
                  Full room decoration includes skirting, architraves, ceilings and radiators painted as part of the
                  job, not left half finished.
                </p>
              </article>
              <article className="service">
                <h3 className="h3">Room refurbishments</h3>
                <p>
                  Upstairs box rooms and bedrooms refurbished from stripped walls through to a finished, liveable
                  space. Reviews describe complete room makeovers rather than touch-ups only.
                </p>
              </article>
            </div>
            <div className="services-inline-gallery reveal" aria-label="Decorating project photos">
              <figure className="services-inline-gallery__item">
                <img src="/assets/images/03-places.webp" width={1242} height={1551} alt="Decorated interior room" loading="lazy" />
              </figure>
              <figure className="services-inline-gallery__item">
                <img src="/assets/images/05-places.webp" width={1199} height={1600} alt="Finished decorating project" loading="lazy" />
              </figure>
              <figure className="services-inline-gallery__item">
                <img src="/assets/images/07-places.webp" width={1135} height={1600} alt="Room decoration detail" loading="lazy" />
              </figure>
              <figure className="services-inline-gallery__item">
                <img src="/assets/images/09-places.webp" width={1195} height={1426} alt="Completed paintwork" loading="lazy" />
              </figure>
            </div>
          </div>
        </section>

        <section
          className="section section--surface"
          data-section-id="reviews"
          data-od-id="reviews"
          id="reviews"
          aria-labelledby="reviews-heading"
        >
          <div className="container stack-lg">
            <div className="reveal">
              <h2 className="h2" id="reviews-heading">
                What customers say
              </h2>
              <p className="lead">Full quotes from customers who left feedback on Google for {name}.</p>
            </div>
            <div className="reviews reveal">
              <article className="review">
                <div className="review__stars" aria-hidden="true">
                  ★★★★★
                </div>
                <p className="review__text">
                  Having our upstairs box room refurbished. Neil came over and firstly removed all the historic wall
                  paper (layers of it) and then saved us money on a plasterer by carefully filling and sanding
                  everywhere that needed it. He decorated the room fully, including the walls, ceiling, woodwork and
                  the radiator. Neil did a really good job! He&apos;s also a really good guy; professional and also
                  personable. I would definitely recommend him for any decorating jobs you have.
                </p>
                <p className="review__author">Sachin</p>
              </article>
              <article className="review">
                <div className="review__stars" aria-hidden="true">
                  ★★★★★
                </div>
                <p className="review__text">
                  Neil is a true professional with attention to detail. He is very friendly and a perfectionist with
                  his paint work. Neil helped us pick our perfect shade of paint for our living room by coming up with
                  a few suggestions. I highly recommend Neil you can tell he has a passion in what he does. Looking
                  forward to him coming back in the future! 5*
                </p>
                <p className="review__author">J</p>
              </article>
              <article className="review">
                <div className="review__stars" aria-hidden="true">
                  ★★★★★
                </div>
                <p className="review__text">
                  Neil did a great job for us. Lovely paint finish. He is very professional and courteous. He works
                  well around the needs of his customers. Would have no hesitation to recommend.
                </p>
                <p className="review__author">Simon</p>
              </article>
              <article className="review">
                <div className="review__stars" aria-hidden="true">
                  ★★★★★
                </div>
                <p className="review__text">
                  Neil did a great job decorating our bedroom, he is friendly and professional with good
                  communication and attention to detail. We will use him again
                </p>
                <p className="review__author">Amrik</p>
              </article>
              <article className="review">
                <div className="review__stars" aria-hidden="true">
                  ★★★★★
                </div>
                <p className="review__text">
                  Neil was absolutely brilliant. Very professional and high quality of workmanship. Highly Recommend.
                  Thank you
                </p>
                <p className="review__author">Caroline</p>
              </article>
            </div>
            <p className="reveal">
              <a
                className="btn btn--ghost"
                href="https://maps.google.com/?cid=2664396191179093018"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read all reviews on Google Maps
              </a>
            </p>
          </div>
        </section>

        <section
          className="section section--cool"
          data-section-id="process"
          data-od-id="process"
          id="process"
          aria-labelledby="process-heading"
        >
          <div className="container stack-lg">
            <div className="reveal">
              <h2 className="h2" id="process-heading">
                How a job with us works
              </h2>
              <p className="lead">
                A straightforward path from first call to a finished room, based on how customers describe their
                bookings.
              </p>
            </div>
            <ol className="process reveal">
              <li className="process__step">
                <h3 className="h3">Call or message</h3>
                <p>Ring {phone} to describe the room and arrange a visit to see the work in person.</p>
              </li>
              <li className="process__step">
                <h3 className="h3">Agree scope and colours</h3>
                <p>
                  Discuss what needs doing and compare paint shades. Reviews mention help choosing the right colour for
                  a living room.
                </p>
              </li>
              <li className="process__step">
                <h3 className="h3">Strip, fill and sand</h3>
                <p>Wallpaper removed where needed and surfaces prepared carefully before any paint goes on.</p>
              </li>
              <li className="process__step">
                <h3 className="h3">Decorate the full room</h3>
                <p>
                  Walls, ceiling, woodwork and radiators finished so the room is ready to use, not left with partial
                  work.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section
          className="section section--accent"
          data-section-id="service-area"
          data-od-id="coverage"
          id="area"
          aria-labelledby="area-heading"
        >
          <div className="container">
            <div className="coverage reveal">
              <div>
                <h2 className="h2" id="area-heading">
                  Based in Bramhall, Stockport
                </h2>
                <p className="lead">
                  {name} serves homeowners across Bramhall, Stockport and surrounding SK7 postcodes. The business is listed on Google in the Stockport SK7 area.
                </p>
                <div className="area-tags" aria-label="Service areas">
                  <span className="area-tag">Bramhall</span>
                  <span className="area-tag">Stockport</span>
                  <span className="area-tag">Stockport SK7</span>
                  <span className="area-tag">SK7 postcodes</span>
                </div>
                <p className="hours-list">Open Monday to Sunday, 8:00 am to 7:00 pm.</p>
              </div>
              <div className="map-embed" aria-label="Map showing Stockport area">
                <iframe
                  title="Bramhall and Stockport area map"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d381029.553!2d-2.25!3d53.41!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487bb1b0f3a20a91%3A0x79d37a5542f4d3d8!2sStockport!5e0!3m2!1sen!2suk!4v1710000000000!5m2!1sen!2suk"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className="section section--dark"
          data-section-id="contact"
          data-od-id="contact"
          id="contact"
          aria-labelledby="contact-heading"
        >
          <div className="container stack-lg">
            <div className="reveal">
              <h2 className="h2" id="contact-heading">
                Get a quote from {name}
              </h2>
              <p className="lead">
                Describe the rooms you want decorated and we can discuss the work when you call. No email address is
                listed publicly for this business.
              </p>
            </div>
            <div className="contact-grid reveal">
              <div className="contact-details">
                <div>
                  <p className="meta">Phone</p>
                  <p className="contact-phone">
                    <a href={`tel:${phoneTel}`}>{phone}</a>
                  </p>
                </div>
                <div>
                  <p className="meta">Areas covered</p>
                  <p>Bramhall, Stockport and surrounding SK7 postcodes.</p>
                </div>
                <div>
                  <p className="meta">Hours</p>
                  <p>Monday to Sunday, 8:00 am to 7:00 pm.</p>
                </div>
                <div>
                  <a
                    className="btn btn--secondary"
                    href="https://maps.google.com/?cid=2664396191179093018"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
              <QuoteForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" data-od-id="footer">
        <div className="container">
          <div className="site-footer__grid">
            <div>
              <p className="site-footer__brand">{name}</p>
              <p>Painting and decorating in Bramhall and Stockport.</p>
            </div>
            <div>
              <h4>Sections</h4>
              <ul>
                <li>
                  <a href="#services">Services</a>
                </li>
                <li>
                  <a href="#gallery">Work</a>
                </li>
                <li>
                  <a href="#reviews">Reviews</a>
                </li>
                <li>
                  <a href="#area">Coverage</a>
                </li>
                <li>
                  <a href="#quote">Get a quote</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li>
                  <a href={`tel:${phoneTel}`}>{phone}</a>
                </li>
                <li>Mon to Sun, 8 am to 7 pm</li>
                <li>Bramhall, Stockport SK7</li>
              </ul>
            </div>
          </div>
          <div className="site-footer__bottom">
            <p>© {name}</p>
            <p>
              <a href="https://webfortradesuk.co.uk" target="_blank" rel="noopener noreferrer">
                Website by WebForTrades
              </a>
            </p>
          </div>
        </div>
      </footer>

      <aside className="mobile-cta" id="mobile-cta" aria-label="Quick contact actions">
        <div className="mobile-cta__inner">
          <a className="btn btn--secondary" href={`tel:${phoneTel}`}>
            Call now
          </a>
          <a className="btn btn--primary" href="#quote">
            Get a quote
          </a>
        </div>
      </aside>

      <SiteEnhancements />
    </>
  );
}
