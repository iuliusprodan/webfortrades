import { SiteEnhancements } from "@/components/SiteEnhancements";
import { QuoteForm } from "@/components/QuoteForm";

export default function HomePage() {
  return (
    <>
      
      
        <header className="site-header">
          <div className="container header-inner">
            <a href="#" className="logo">
              <span className="logo-mark">JT <span>Plumbing</span></span>
              <span className="logo-sub">Bristol BS5</span>
            </a>
            <div className="header-actions">
              <a href="tel:07817850729" className="header-phone">07817 850729</a>
              <a href="#quote" className="btn btn-primary">Get a quote</a>
            </div>
          </div>
        </header>
      
        <main>
          
          <section className="hero" id="hero" data-od-id="hero">
            <div className="container hero-grid">
              <div className="hero-content reveal">
                <div className="hero-proof">
                  <span className="badge badge-accent">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    4.9 on Google
                  </span>
                  <span className="badge">15+ reviews</span>
                  <span className="badge">100% recommend on Facebook</span>
                </div>
                <h1>A Bristol plumber who turns up, does a good job and charges fairly</h1>
                <p className="hero-lead">Reliable, friendly and affordable plumbing and heating across Bristol, Redfield, St George and Easton.</p>
                <blockquote className="hero-quote">
                  <p>"If you want a plumber that actually turns up, does a good job and reasonably priced, then Josh is the man!"</p>
                  <cite>Hayley, Google review</cite>
                </blockquote>
                <div className="hero-ctas">
                  <a href="#quote" className="btn btn-primary">Get a quote</a>
                  <a href="tel:07817850729" className="btn btn-secondary">Call 07817 850729</a>
                </div>
                <p className="hero-meta">Open 24 hours · Based in Bristol BS5 8JB</p>
              </div>
              <div className="hero-visual reveal">
                <div className="hero-image-wrap">
                  <img src="/assets/images/hero-bathroom.webp" alt="Recent bathroom work in Bristol" width="800" height="600" loading="eager" />
                </div>
                <p className="hero-caption">Recent bathroom work in Bristol</p>
              </div>
            </div>
          </section>
      
          <div id="hero-sentinel" aria-hidden="true"></div>
      
          
          <section className="emergency reveal" data-od-id="emergency">
            <div className="container emergency-inner">
              <div>
                <h2>Emergency plumbing, day or night</h2>
                <p>JT Plumbing is open 24 hours. Customers praise Josh for coming the very next day on urgent jobs. Burst pipes, boiler trouble or a leaking shower: call now and we will do our best to help.</p>
              </div>
              <div className="emergency-actions">
                <a href="tel:07817850729" className="btn btn-primary">Call 07817 850729</a>
                <a href="#quote" className="btn btn-secondary">Get a quote</a>
              </div>
            </div>
          </section>
      
          
          <section className="section" id="services" data-od-id="services">
            <div className="container">
              <div className="section-header reveal">
                <h2>What we can help with</h2>
                <p>From everyday repairs to full bathroom and heating work across Bristol and nearby.</p>
              </div>
              <div className="services-grid">
                <article className="service-card reveal">
                  <div className="service-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                  </div>
                  <h3>General plumbing repairs</h3>
                  <p>Leaks, pipework and the jobs that cannot wait around the house.</p>
                </article>
                <article className="service-card reveal">
                  <div className="service-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>
                  </div>
                  <h3>Boiler repairs and servicing</h3>
                  <p>Keep your heating running safely and efficiently through the year.</p>
                </article>
                <article className="service-card reveal">
                  <div className="service-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M6 8h12M8 8v10a4 4 0 0 0 8 0V8"/></svg>
                  </div>
                  <h3>Heating and radiators</h3>
                  <p>Radiator fitting, pipework and heating system work.</p>
                </article>
                <article className="service-card reveal">
                  <div className="service-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <h3>Bathroom installations</h3>
                  <p>Stunning new bathrooms fitted with care, from shower upgrades to full refits.</p>
                </article>
                <article className="service-card reveal">
                  <div className="service-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <h3>Emergency callouts</h3>
                  <p>Urgent plumbing problems handled promptly, including next-day attendance when possible.</p>
                </article>
                <article className="service-card reveal">
                  <div className="service-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  </div>
                  <h3>Tap, toilet and shower repairs</h3>
                  <p>Quick fixes for dripping taps, faulty toilets and shower problems.</p>
                </article>
              </div>
            </div>
          </section>
      
          
          <section className="section section-alt" id="gallery" data-od-id="gallery">
            <div className="container">
              <div className="section-header reveal">
                <h2>Recent work</h2>
                <p>Real jobs from JT Plumbing in and around Bristol.</p>
              </div>
              <div className="gallery-grid">
                <figure className="gallery-item gallery-item--landscape reveal">
                  <div className="gallery-media">
                    <img src="/assets/images/hero-bathroom.webp" alt="Recent bathroom work in Bristol" width="1600" height="1200" loading="lazy" />
                  </div>
                  <figcaption>Recent bathroom work in Bristol</figcaption>
                </figure>
                <figure className="gallery-item gallery-item--portrait reveal">
                  <div className="gallery-media">
                    <img src="/assets/images/radiator-pipework.webp" alt="Heating pipework and radiators" width="1200" height="1600" loading="lazy" />
                  </div>
                  <figcaption>Heating pipework and radiators</figcaption>
                </figure>
                <figure className="gallery-item gallery-item--portrait reveal">
                  <div className="gallery-media">
                    <img src="/assets/images/shower-detail.webp" alt="Shower and bathroom fit" width="1200" height="1600" loading="lazy" />
                  </div>
                  <figcaption>Shower and bathroom fit</figcaption>
                </figure>
                <figure className="gallery-item gallery-item--portrait reveal">
                  <div className="gallery-media">
                    <img src="/assets/images/bathroom-finish.webp" alt="Finished bathroom work" width="1200" height="1600" loading="lazy" />
                  </div>
                  <figcaption>Finished bathroom work</figcaption>
                </figure>
              </div>
            </div>
          </section>
      
          
          <section className="section" id="story" data-od-id="featured-story">
            <div className="container">
              <div className="featured-story">
                <div className="featured-image reveal">
                  <img src="/assets/images/shower-detail.webp" alt="Shower and bathroom fit by JT Plumbing" width="600" height="450" loading="lazy" />
                </div>
                <div className="reveal">
                  <h2>When you need someone reliable</h2>
                  <p className="story-quote">"I can&apos;t recommend Josh highly enough. He saved us recently on two separate occasions with emergency plumbing issues... both times he was able to come the very next day."</p>
                  <p className="story-attribution">Martin, Google review</p>
                  <p className="story-body">Whether it is an emergency callout or a planned bathroom upgrade, customers across Bristol value Josh for honest advice, fair pricing and work done properly. Camille praised him for ordering, collecting and carefully installing a beautiful new rain shower, so fast. Jessamy had her salon sink fixed super fast and calls him a lovely chap too.</p>
                  <p style={{ marginTop: "1.25rem" }}>
                    <a href="#quote" className="btn btn-primary">Get a quote</a>
                  </p>
                </div>
              </div>
            </div>
          </section>
      
          
          <section className="section section-alt" id="reviews" data-od-id="reviews">
            <div className="container">
              <div className="section-header reveal">
                <h2>What customers say</h2>
                <p>Verified reviews from Google and Facebook. JT Plumbing is rated 4.9 on Google with 15+ reviews.</p>
              </div>
              <div className="reviews-grid">
                <article className="review-card reveal">
                  <div className="review-stars" aria-label="5 out of 5 stars">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <p className="review-text">"Josh was honest, prompt and very well priced... If you want a plumber that actually turns up, does a good job and reasonably priced, then Josh is the man!"</p>
                  <p className="review-author">Hayley</p>
                  <p className="review-source">Google review</p>
                </article>
                <article className="review-card reveal">
                  <div className="review-stars" aria-label="5 out of 5 stars">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <p className="review-text">"Josh is worth his weight in gold... ordered, collected and carefully installed a beautiful new rain shower, so fast!"</p>
                  <p className="review-author">Camille</p>
                  <p className="review-source">Google review</p>
                </article>
                <article className="review-card reveal">
                  <div className="review-stars" aria-label="5 out of 5 stars">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <p className="review-text">"I can&apos;t recommend Josh highly enough. He saved us recently on two separate occasions with emergency plumbing issues... both times he was able to come the very next day."</p>
                  <p className="review-author">Martin</p>
                  <p className="review-source">Google review</p>
                </article>
                <article className="review-card reveal">
                  <div className="review-stars" aria-label="5 out of 5 stars">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <p className="review-text">"Highly recommend Josh. Fixed my salon sink super fast and is a lovely chap too!"</p>
                  <p className="review-author">jessamy</p>
                  <p className="review-source">Google review</p>
                </article>
              </div>
            </div>
          </section>
      
          
          <section className="section" id="areas" data-od-id="coverage">
            <div className="container">
              <div className="coverage-grid">
                <div className="coverage-copy reveal">
                  <h2>Covering Bristol and nearby</h2>
                  <p>JT Plumbing is based in Bristol BS5. We work across Bristol and the surrounding areas, including:</p>
                  <ul className="coverage-list">
                    <li>Bristol</li>
                    <li>Redfield</li>
                    <li>St George</li>
                    <li>Easton</li>
                    <li>Nearby areas</li>
                  </ul>
                  <p className="coverage-note">Based in Bristol BS5 8JB. Open 24 hours.</p>
                </div>
                <div className="coverage-map reveal">
                  <div className="map-frame">
                    <iframe
                      src="https://www.google.com/maps?q=Bristol+BS5+8JB,+UK&output=embed"
                      title="Map showing JT Plumbing service area around Bristol BS5"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                  <p className="map-link-wrap">
                    <a
                      href="https://www.google.com/maps?q=Bristol+BS5+8JB,+UK"
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
      
          
          <section className="section quote-section" id="quote" data-od-id="quote">
            <div className="container">
              <div className="quote-grid">
                <div className="contact-details reveal">
                  <div className="section-header" style={{ marginBottom: "1.5rem" }}>
                    <h2>Request a quote</h2>
                    <p>Tell us what you need and we will get back to you. For urgent jobs, call <a href="tel:07817850729">07817 850729</a>.</p>
                  </div>
                  <div className="contact-block">
                    <h3>Call</h3>
                    <a href="tel:07817850729">07817 850729</a>
                    <p className="sub">Open 24 hours</p>
                  </div>
                  <div className="contact-block">
                    <h3>Email</h3>
                    <a href="mailto:jtplumbingbristol@gmail.com">jtplumbingbristol@gmail.com</a>
                  </div>
                  <div className="contact-block">
                    <h3>Facebook</h3>
                    <a href="https://www.facebook.com/jtplumbingbristol" rel="noopener noreferrer">JT Plumbing Bristol</a>
                    <p className="sub">100% recommend</p>
                  </div>
                </div>
          <QuoteForm />
              </div>
            </div>
          </section>
        </main>
      
        <div id="footer-sentinel" aria-hidden="true"></div>
      
        <footer className="site-footer" id="footer" data-od-id="footer">
          <div className="container footer-grid">
            <div className="footer-brand">
              <p className="footer-logo">JT <span>Plumbing</span></p>
              <p className="footer-tagline">Reliable, friendly plumbing and heating across Bristol BS5 and nearby.</p>
            </div>
            <div className="footer-col">
              <h3>Contact</h3>
              <ul className="footer-links">
                <li><a href="tel:07817850729">07817 850729</a></li>
                <li><a href="mailto:jtplumbingbristol@gmail.com">jtplumbingbristol@gmail.com</a></li>
                <li>
                  <a href="https://www.facebook.com/jtplumbingbristol" rel="noopener noreferrer">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Areas</h3>
              <ul className="footer-links footer-links-plain">
                <li>Bristol</li>
                <li>Redfield</li>
                <li>St George</li>
                <li>Easton</li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Quick links</h3>
              <ul className="footer-links">
                <li><a href="#services">Services</a></li>
                <li><a href="#gallery">Recent work</a></li>
                <li><a href="#reviews">Reviews</a></li>
                <li><a href="#areas">Areas</a></li>
                <li><a href="#quote">Quote</a></li>
              </ul>
            </div>
          </div>
          <div className="container footer-bottom">
            <p className="footer-hours">Open 24 hours</p>
            <p className="footer-credit">
              <a href="https://webfortradesuk.co.uk" rel="noopener noreferrer">Website by WebForTrades</a>
            </p>
          </div>
        </footer>
      
        <div className="mobile-sticky" id="mobile-sticky" role="region" aria-label="Quick actions">
          <a href="#quote" className="btn btn-primary">Get a quote</a>
          <a href="tel:07817850729" className="btn btn-navy">Call</a>
        </div>
      
        
      
      <SiteEnhancements />
    </>
  );
}
