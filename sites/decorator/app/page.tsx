import {
  brief,
  design,
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
  ownerNoteParagraphs,
  reviewHeadline,
  reviewThemes,
  serviceDescription,
  serviceTags,
} from "@/lib/copy";
import { ContactForm } from "@/components/ContactForm";
import { StickyHeader } from "@/components/StickyHeader";
import { HeroGalleryLed } from "@/components/HeroGalleryLed";
import { WorkGallery } from "@/components/WorkGallery";
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
          className="relative flex min-h-[min(100svh,820px)] items-center border-b border-border md:min-h-[min(90vh,780px)] md:items-end"
          aria-labelledby="hero-heading"
        >
          <HeroGalleryLed />
          <div className="relative z-10 w-full px-5 pb-10 pt-24 md:px-10 md:pb-20 md:pt-32 lg:px-16">
            <Reveal>
              <div className="mx-auto max-w-6xl">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-white/90">
                  York · {brief.years_trading} years · Painter &amp; decorator
                </p>
                <h1
                  id="hero-heading"
                  className="display-heading mb-4 max-w-2xl text-white"
                >
                  {heroHeadline()}
                </h1>
                <p className="max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
                  {heroSub()}
                </p>
                <div className="mt-8 flex w-full max-w-md flex-col gap-3 md:max-w-none md:flex-row md:flex-wrap">
                  <a
                    href="#contact"
                    className="btn-primary flex w-full items-center justify-center px-7 py-3.5 text-base md:w-auto"
                  >
                    Get a free quote
                  </a>
                  <a
                    href={phoneHref()}
                    className="btn-secondary flex w-full items-center justify-center border-white/25 bg-white/10 px-6 py-3.5 text-white backdrop-blur-sm hover:bg-white/15 md:w-auto"
                  >
                    Call Dan - {brief.phone}
                  </a>
                </div>
              </div>
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
              { n: `${brief.years_trading}+`, label: "Years in the trade" },
              { n: String(brief.service_area.length).padStart(2, "0"), label: "Areas covered" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 70}>
                <div className="border-l-2 border-accent pl-4">
                  <p className="font-display text-3xl font-medium text-foreground md:text-4xl">
                    {s.n}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-muted-fg">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section
          id="work"
          data-review="gallery"
          className="gallery-pad border-b border-border bg-background"
          aria-labelledby="work-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Selected work</p>
              <h2 id="work-heading" className="font-display text-3xl font-medium md:text-5xl lg:text-6xl">
                Rooms finished properly.
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-fg md:text-xl">
                The work speaks first. Before and after, detail shots, and full-room refreshes across York and the surrounding villages. Every slot here would be a real finished job.
              </p>
              <div className="mt-12 md:mt-16">
                <WorkGallery />
              </div>
            </div>
          </Reveal>
        </section>

        <section
          data-review="owner-note"
          className="section-pad border-b border-border bg-surface"
          aria-labelledby="owner-note"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">{owner}, owner &amp; decorator</p>
              <h2 id="owner-note" className="font-display text-3xl font-medium md:text-5xl">
                A note from {owner}
              </h2>
              <p className="mt-3 text-lg text-muted-fg md:text-xl">
                Prep before paint. Tidy before tea.
              </p>
              <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5 text-lg leading-relaxed text-muted-fg">
                  {ownerNoteParagraphs().map((p) => (
                    <p key={p.slice(0, 28)}>{p}</p>
                  ))}
                </div>
                <RevealStagger stagger={80} className="grid grid-cols-2 gap-4">
                  {[
                    { n: `${brief.years_trading}+`, l: "years in York" },
                    { n: String(brief.rating), l: "average review" },
                    { n: "02", l: "coats where it counts" },
                    { n: "01", l: "decorator on site" },
                  ].map((c) => (
                    <div key={c.l} className="card card-hover p-5">
                      <p className="font-display text-3xl font-medium text-accent">{c.n}</p>
                      <p className="mt-1 text-xs text-muted-fg">{c.l}</p>
                    </div>
                  ))}
                </RevealStagger>
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
              <p className="section-label mb-3">What Dan does</p>
              <h2 id="services-heading" className="font-display text-3xl font-medium md:text-5xl">
                {String(brief.services.length).padStart(2, "0")} services. Explained plainly.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                Interior and exterior painting, wallpapering and careful prep for homes across York, Clifton, Acomb and out to Tadcaster.
              </p>
              <div className="mt-10 divide-y divide-border rounded-md border border-border bg-surface">
                {brief.services.map((service, i) => (
                  <Reveal key={service} delay={i * 50}>
                    <article className="card-hover grid gap-4 px-5 py-8 md:grid-cols-[72px_1fr] md:px-6">
                      <p className="font-display text-2xl font-medium text-accent md:text-3xl">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <div>
                        <h3 className="font-display text-xl font-medium md:text-2xl">{service}</h3>
                        <p className="mt-3 max-w-2xl text-muted-fg">{serviceDescription(service)}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {serviceTags(service).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md border border-border bg-muted px-3 py-1 text-xs text-muted-fg"
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
                <a href={phoneHref()} className="focus-ring text-foreground underline-offset-4 hover:underline">
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
              <h2 id="about-heading" className="font-display text-3xl font-medium md:text-5xl">
                One trade. York postcodes. Finish you notice.
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-fg">
                {brief.business_name} is run by {owner}, a painter and decorator covering York, Clifton, Fulford and out to Tadcaster.
                Interior rooms, exterior masonry, wallpaper and heritage woodwork.
              </p>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-fg">
                The promise is straightforward: protect the house, prep properly, leave lines sharp and the place tidy.
                After {brief.years_trading} years, most new work still arrives by recommendation.
              </p>
              <ul className="mt-8 grid gap-3 text-muted-fg md:grid-cols-2">
                <li>· Dust sheets and floor protection as standard</li>
                <li>· Public liability insurance, receipts on request</li>
                <li>· Sole trader, same person quoting and painting</li>
                <li>· Repeat customers across York, Clifton, Acomb &amp; Haxby</li>
              </ul>
            </div>
          </Reveal>
        </section>

        <div
          data-review="marquee"
          className="overflow-hidden border-b border-border bg-foreground py-4 text-background"
          aria-hidden
        >
          <div className="marquee-track whitespace-nowrap text-sm font-medium uppercase tracking-[0.25em] md:text-base">
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
              <h2 id="reviews-heading" className="font-display text-3xl font-medium md:text-5xl">
                {brief.review_count} reviews. Three clear themes.
              </h2>
              <p className="mt-4 text-muted-fg">
                {brief.rating}★ average across {brief.review_count} Google reviews. Tidy, careful, proper prep.
              </p>
              <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
                {brief.reviews.map((review, i) => (
                  <Reveal key={review.name} delay={i * 90} className="h-full">
                    <blockquote className="card card-hover flex h-full flex-col p-6">
                      <p className="font-display text-lg font-medium">
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
              <h2 id="area-heading" className="font-display text-3xl font-medium md:text-5xl">
                York and the surrounding villages.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                Based in York. Most jobs are YO1 to YO32 and out to Tadcaster. Not sure if you are in range? Ring.
              </p>
              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {brief.service_area.map((town, i) => (
                    <li key={town} className="flex gap-3 text-muted-fg">
                      <span className="font-display font-medium text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium text-foreground">{town}</span>
                    </li>
                  ))}
                </ol>
                <div className="card card-hover overflow-hidden rounded-md">
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
              <h2 id="faq-heading" className="font-display text-3xl font-medium md:text-5xl">
                Questions before you ring.
              </h2>
              <p className="mt-4 text-muted-fg">
                Anything not answered here? Pick up the phone. {owner} can usually tell you in two minutes whether it is a single room or a full house.{" "}
                <a href={phoneHref()} className="focus-ring text-foreground underline-offset-4 hover:underline">
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
              <h2 id="contact-heading" className="font-display text-3xl font-medium md:text-5xl">
                Describe the room, or call.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                Fastest is the phone for a quick sense of scale. Otherwise leave a few lines below, photos welcome. {owner} picks these up between jobs.
              </p>
              <div className="mt-10 grid gap-10 lg:grid-cols-2">
                <div className="space-y-4 text-muted-fg">
                  <p>
                    <span className="block text-xs font-medium uppercase tracking-[0.15em] text-accent">
                      Phone
                    </span>
                    <a href={phoneHref()} className="focus-ring text-2xl font-medium text-foreground">
                      {brief.phone}
                    </a>
                  </p>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-accent">Hours</p>
                    <ul className="mt-2 space-y-1">
                      {openingHoursList().map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                  <p>
                    <span className="block text-xs font-medium uppercase tracking-[0.15em] text-accent">
                      Based
                    </span>
                    {brief.address}
                  </p>
                  <p>
                    <span className="block text-xs font-medium uppercase tracking-[0.15em] text-accent">
                      Cover
                    </span>
                    {brief.service_area.join(", ")} and wider YO postcodes.
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
        className="site-footer border-t border-border bg-foreground px-5 text-background md:px-10"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-2xl font-medium">{brief.business_name}</p>
            <p className="mt-2 text-sm text-background/70">York &amp; surrounding areas</p>
          </div>
          <a
            href="https://www.webfortradesuk.co.uk"
            target="_blank"
            rel="noopener"
            className="focus-ring text-xs text-background/60 hover:text-background/90"
          >
            Website by WebForTrades
          </a>
        </div>
      </footer>

      <div
        data-review="mobile-call"
        className="fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-border bg-surface/95 p-3 backdrop-blur-md md:hidden"
      >
        <a href="#contact" className="btn-primary flex min-h-tap flex-1 items-center justify-center text-sm">
          Get a free quote
        </a>
        <a href={phoneHref()} className="btn-secondary flex min-h-tap flex-1 items-center justify-center text-sm">
          Call Dan
        </a>
      </div>
    </>
  );
}
