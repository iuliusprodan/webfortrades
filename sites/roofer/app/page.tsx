import {
  brief,
  design,
  GALLERY_COUNT,
  mapEmbedUrl,
  mapSearchUrl,
  openingHoursList,
  ownerName,
  phoneHref,
  primaryTrade,
  areaLabel,
} from "@/lib/data";
import {
  faqItems,
  heroHeadline,
  heroSub,
  heroFocalCaption,
  ownerNoteParagraphs,
  photoCaption,
  reviewHeadline,
  reviewThemes,
  serviceDescription,
  serviceTags,
} from "@/lib/copy";
import { ContactForm } from "@/components/ContactForm";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { StickyHeader } from "@/components/StickyHeader";
import { HeroSolidFocal } from "@/components/HeroSolidFocal";
import { Reveal, RevealStagger } from "@/components/Reveal";
import { FaqAccordion } from "@/components/FaqAccordion";

export default function HomePage() {
  const owner = ownerName();
  const faq = faqItems();

  return (
    <>
      <StickyHeader
        businessName={brief.business_name}
        trade={primaryTrade()}
        area={areaLabel()}
        rating={brief.rating}
        reviewCount={brief.review_count}
        phone={brief.phone}
        phoneHref={phoneHref()}
        ownerName={owner}
      />

      <main className="pb-24 md:pb-0">
        <section
          data-review="hero"
          className="section-pad border-b border-border pt-5 md:pt-8"
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-12">
            <Reveal>
              <div className="flex h-full flex-col justify-center">
                <p className="section-label mb-4">
                  Sheffield · {brief.years_trading} years · Storm call-out
                </p>
                <h1 id="hero-heading" className="display-heading mb-5">
                  {heroHeadline()}
                </h1>
                <p className="max-w-md text-base font-medium leading-relaxed text-muted-fg md:text-lg">
                  {heroSub()}
                </p>
                <div className="mt-8 flex w-full flex-col gap-3 md:w-auto md:flex-row md:flex-wrap">
                  <a
                    href="#contact"
                    className="btn-primary flex w-full items-center justify-center px-8 py-4 md:w-auto"
                  >
                    Get a free quote
                  </a>
                  <a
                    href={phoneHref()}
                    className="btn-secondary flex w-full items-center justify-center px-8 py-4 md:w-auto"
                  >
                    Call {owner} - {brief.phone}
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <HeroSolidFocal caption={heroFocalCaption()} />
            </Reveal>
          </div>
        </section>

        <section
          data-review="stats"
          className="border-b border-border bg-surface"
          aria-label="Key figures"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4 md:px-10">
            {[
              { n: `${brief.rating}★`, label: "Google rating" },
              { n: String(brief.review_count), label: "Verified reviews" },
              { n: `${brief.years_trading}+`, label: "Years on the roof" },
              { n: String(brief.service_area.length).padStart(2, "0"), label: "Areas covered" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 70}>
                <div className="border-l-[3px] border-accent pl-4">
                  <p className="font-display text-3xl uppercase tracking-wide text-foreground md:text-4xl">
                    {s.n}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-fg">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section
          data-review="owner-note"
          className="section-pad border-b border-border"
          aria-labelledby="owner-note"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">{owner}, owner &amp; roofer</p>
              <h2 id="owner-note" className="font-display text-3xl uppercase tracking-wide md:text-5xl">
                A note from {owner}
              </h2>
              <p className="mt-3 text-lg font-medium text-stone md:text-xl">
                Tough weather. Straight answers.
              </p>
              <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5 text-lg leading-relaxed text-muted-fg">
                  {ownerNoteParagraphs().map((p) => (
                    <p key={p.slice(0, 28)}>{p}</p>
                  ))}
                </div>
                <RevealStagger stagger={80} className="grid grid-cols-2 gap-4">
                  {[
                    { n: `${brief.years_trading}+`, l: "years in Sheffield" },
                    { n: String(brief.rating), l: "average review" },
                    { n: "24h", l: "storm call-out" },
                    { n: "01", l: "roofer on site" },
                  ].map((c) => (
                    <div key={c.l} className="card card-hover border-l-[3px] border-l-accent p-5">
                      <p className="font-display text-3xl uppercase text-accent">{c.n}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-fg">
                        {c.l}
                      </p>
                    </div>
                  ))}
                </RevealStagger>
              </div>
            </div>
          </Reveal>
        </section>

        <section
          id="work"
          data-review="gallery"
          className="section-pad border-b border-border bg-surface"
          aria-labelledby="work-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Selected work</p>
              <h2 id="work-heading" className="font-display text-3xl uppercase tracking-wide md:text-5xl">
                Finished roofs. No shortcuts.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                Completed jobs across Sheffield, Rotherham and Chesterfield. Re-roofs, repairs, fascias and storm fixes. Every slot here would be a real finished roof.
              </p>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {Array.from({ length: GALLERY_COUNT }, (_, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <figure className="card card-hover overflow-hidden">
                      <PlaceholderImage label={photoCaption(i)} large embedded />
                      <figcaption className="border-t border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-fg">
                        {photoCaption(i)}
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section
          data-review="services"
          className="section-pad border-b border-border"
          aria-labelledby="services-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">What {owner} does</p>
              <h2 id="services-heading" className="font-display text-3xl uppercase tracking-wide md:text-5xl">
                {String(brief.services.length).padStart(2, "0")} services. Plain English.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                Roof repairs, full re-roofs, flat roofing, lead work and storm damage across Sheffield and South Yorkshire.
              </p>
              <div className="mt-10 divide-y divide-border border border-border bg-surface">
                {brief.services.map((service, i) => (
                  <Reveal key={service} delay={i * 50}>
                    <article className="card-hover grid gap-4 px-5 py-8 md:grid-cols-[72px_1fr] md:px-6">
                      <p className="font-display text-2xl uppercase text-accent md:text-3xl">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <div>
                        <h3 className="font-display text-xl uppercase tracking-wide md:text-2xl">
                          {service}
                        </h3>
                        <p className="mt-3 max-w-2xl text-muted-fg">{serviceDescription(service)}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {serviceTags(service).map((tag) => (
                            <span
                              key={tag}
                              className="border border-border bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-fg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
              <p className="mt-8 text-muted-fg">
                Not on the list? Probably still in scope.{" "}
                <a href={phoneHref()} className="focus-ring font-medium text-foreground underline-offset-4 hover:underline">
                  Talk it through with {owner}
                </a>
                .
              </p>
            </div>
          </Reveal>
        </section>

        <section
          data-review="about"
          className="section-pad border-b border-border bg-surface"
          aria-labelledby="about-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">About {brief.business_name}</p>
              <h2 id="about-heading" className="font-display text-3xl uppercase tracking-wide md:text-5xl">
                One trade. Sheffield postcodes. Built to last.
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-fg">
                {brief.business_name} is run by {owner}, a roofer covering Sheffield, Rotherham, Chesterfield and out to Dronfield.
                Repairs, re-roofs, flat roofing, chimney work and storm damage.
              </p>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-fg">
                The promise is straightforward: scaffold when needed, fix it properly, clear the site, charge a fair price.
                After {brief.years_trading} years, most new work still arrives by recommendation.
              </p>
              <ul className="mt-8 grid gap-3 text-muted-fg md:grid-cols-2">
                <li>· Scaffold booked for height work</li>
                <li>· Public liability insurance, receipts on request</li>
                <li>· Sole trader, same person quoting and on the roof</li>
                <li>· Repeat customers across Sheffield, Hillsborough &amp; Ecclesall</li>
              </ul>
            </div>
          </Reveal>
        </section>

        <div
          data-review="marquee"
          className="overflow-hidden border-b border-border bg-accent py-4 text-accent-fg"
          aria-hidden
        >
          <div className="marquee-track whitespace-nowrap text-sm font-display uppercase tracking-[0.28em] md:text-base">
            {[...reviewThemes(), ...brief.service_area, ...reviewThemes(), ...brief.service_area].join(
              ` ${design.separator} `
            )}
          </div>
        </div>

        <section
          data-review="reviews"
          className="section-pad border-b border-border"
          aria-labelledby="reviews-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Review highlights</p>
              <h2 id="reviews-heading" className="font-display text-3xl uppercase tracking-wide md:text-5xl">
                {brief.review_count} reviews. Three clear themes.
              </h2>
              <p className="mt-4 text-muted-fg">
                {brief.rating}★ average across {brief.review_count} Google reviews. Fixed properly, fair price, site left clean.
              </p>
              <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
                {brief.reviews.map((review, i) => (
                  <Reveal key={review.name} delay={i * 90} className="h-full">
                    <blockquote className="card card-hover flex h-full flex-col border-t-[3px] border-t-accent p-6">
                      <p className="font-display text-lg uppercase tracking-wide">
                        {reviewHeadline(review.text)}
                      </p>
                      <p className="mt-4 flex-1 leading-relaxed text-muted-fg">
                        &ldquo;{review.text}&rdquo;
                      </p>
                      <footer className="mt-6 text-sm text-muted-fg">
                        {review.name}
                        <span className="mx-2">·</span>
                        {"★".repeat(review.rating)}
                      </footer>
                    </blockquote>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section
          data-review="service-area"
          className="section-pad border-b border-border bg-surface"
          aria-labelledby="area-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Service area</p>
              <h2 id="area-heading" className="font-display text-3xl uppercase tracking-wide md:text-5xl">
                Sheffield and South Yorkshire.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                Based in Sheffield. Most jobs are S1 to S36 and out to Chesterfield. Not sure if you are in range? Ring.
              </p>
              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {brief.service_area.map((town, i) => (
                    <li key={town} className="flex gap-3 text-muted-fg">
                      <span className="font-display uppercase text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium uppercase tracking-wide text-foreground">{town}</span>
                    </li>
                  ))}
                </ol>
                <div className="card card-hover overflow-hidden">
                  <iframe
                    title={`Map of ${brief.business_name} service area`}
                    src={mapEmbedUrl()}
                    className="h-72 w-full"
                    loading="lazy"
                  />
                  <p className="border-t border-border px-4 py-3 text-sm text-muted-fg">
                    <a href={mapSearchUrl()} className="focus-ring text-foreground underline-offset-4 hover:underline">
                      Open map
                    </a>
                    {" · "}
                    {brief.address}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section
          data-review="faq"
          className="section-pad border-b border-border"
          aria-labelledby="faq-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Practical answers</p>
              <h2 id="faq-heading" className="font-display text-3xl uppercase tracking-wide md:text-5xl">
                Questions before you ring.
              </h2>
              <p className="mt-4 text-muted-fg">
                Anything not answered here? Pick up the phone. {owner} can usually tell you in two minutes whether it is a patch or a full re-roof.{" "}
                <a href={phoneHref()} className="focus-ring font-medium text-foreground underline-offset-4 hover:underline">
                  Call {brief.phone}
                </a>
              </p>
              <div className="mt-10">
                <FaqAccordion items={faq} />
              </div>
            </div>
          </Reveal>
        </section>

        <section id="contact" data-review="contact" className="section-pad bg-surface" aria-labelledby="contact-heading">
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Get in touch</p>
              <h2 id="contact-heading" className="font-display text-3xl uppercase tracking-wide md:text-5xl">
                Describe the roof, or call.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                Fastest is the phone, especially for active leaks. Otherwise leave a few lines below, photos of the damage help. {owner} picks these up between jobs.
              </p>
              <div className="mt-10 grid gap-10 lg:grid-cols-2">
                <div className="space-y-4 text-muted-fg">
                  <p>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                      Phone
                    </span>
                    <a href={phoneHref()} className="focus-ring text-2xl font-display uppercase tracking-wide text-foreground">
                      {brief.phone}
                    </a>
                  </p>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Hours</p>
                    <ul className="mt-2 space-y-1">
                      {openingHoursList().map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                  <p>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                      Based
                    </span>
                    {brief.address}
                  </p>
                  <p>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                      Cover
                    </span>
                    {brief.service_area.join(", ")} and wider S postcodes.
                  </p>
                </div>
                <ContactForm ownerName={owner} phone={brief.phone} services={brief.services} />
              </div>
              <p className="mt-8 text-center text-muted-fg md:text-left">
                Or just call{" "}
                <a href={phoneHref()} className="focus-ring font-medium text-foreground underline-offset-4 hover:underline">
                  {brief.phone}
                </a>
                . Quickest way to a quote.
              </p>
            </div>
          </Reveal>
        </section>
      </main>

      <footer
        data-review="footer"
        className="site-footer border-t border-border bg-background px-5 md:px-10"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-2xl uppercase tracking-wide">{brief.business_name}</p>
            <p className="mt-2 text-sm uppercase tracking-wider text-muted-fg">
              Sheffield &amp; South Yorkshire
            </p>
          </div>
          <a
            href="https://www.webfortradesuk.co.uk"
            target="_blank"
            rel="noopener"
            className="focus-ring text-xs text-muted-fg hover:text-foreground"
          >
            Website by WebForTrades
          </a>
        </div>
      </footer>

      <div
        data-review="mobile-call"
        className="fixed inset-x-0 bottom-0 z-50 flex gap-1.5 border-t-2 border-accent bg-surface/98 px-2 py-2 backdrop-blur-md md:hidden"
      >
        <a
          href="#contact"
          className="btn-mobile-sticky btn-mobile-sticky-primary focus-ring"
        >
          Get quote
        </a>
        <a
          href={phoneHref()}
          className="btn-mobile-sticky btn-mobile-sticky-secondary focus-ring"
        >
          Call {owner}
        </a>
      </div>
    </>
  );
}
