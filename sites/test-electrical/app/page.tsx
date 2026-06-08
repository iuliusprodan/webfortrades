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
import { HeroFocal } from "@/components/HeroFocal";
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
        {/* Hero */}
        <section
          data-review="hero"
          className="section-pad border-b border-border pt-5 md:pt-8"
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            <Reveal>
              <div className="text-center md:text-left">
                <p className="section-label mb-3">
                  Cambridge · {brief.years_trading} years on reputation
                </p>
                <h1 id="hero-heading" className="display-heading mb-4">
                  {heroHeadline()}
                </h1>
                <p className="mx-auto max-w-md text-base leading-relaxed text-muted-fg md:mx-0 md:text-lg">
                  {heroSub()}
                </p>
                <div className="mt-7 flex w-full flex-col gap-3 md:w-auto md:flex-row md:flex-wrap">
                  <a
                    href="#contact"
                    className="btn-primary flex w-full items-center justify-center px-7 py-3.5 text-base md:w-auto"
                  >
                    Get a free quote
                  </a>
                  <a
                    href={phoneHref()}
                    className="btn-secondary flex w-full items-center justify-center px-6 py-3.5 md:w-auto"
                  >
                    Call Dave - {brief.phone}
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <HeroFocal caption={heroFocalCaption()} />
            </Reveal>
          </div>
        </section>

        {/* Stats */}
        <section
          data-review="stats"
          className="border-b border-border bg-surface"
          aria-label="Key figures"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4 md:px-10">
            {[
              { n: `${brief.rating}★`, label: "Google rating" },
              { n: String(brief.review_count), label: "Verified reviews" },
              { n: `${brief.years_trading}+`, label: "Years on the road" },
              { n: String(brief.service_area.length).padStart(2, "0"), label: "Towns covered" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 70}>
                <div>
                  <p className="font-display text-4xl font-semibold md:text-5xl">{s.n}</p>
                  <p className="mt-2 text-sm text-muted-fg">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Owner note */}
        <section
          data-review="owner-note"
          className="section-pad border-b border-border"
          aria-labelledby="owner-note"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">{owner}, owner &amp; electrician</p>
              <h2 id="owner-note" className="font-display text-3xl font-semibold md:text-5xl">
                A note from {owner}
              </h2>
              <p className="mt-3 font-display text-xl text-muted-fg md:text-2xl">
                A trade you can show off.
              </p>
              <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5 text-lg leading-relaxed text-muted-fg">
                  {ownerNoteParagraphs().map((p) => (
                    <p key={p.slice(0, 28)}>{p}</p>
                  ))}
                </div>
                <RevealStagger stagger={80} className="grid grid-cols-2 gap-4">
                  {[
                    { n: `${brief.years_trading}+`, l: "years on the road" },
                    { n: String(brief.rating), l: "average review" },
                    { n: "★★★★★", l: "every review" },
                    { n: "01", l: "van, no middle-men" },
                  ].map((c) => (
                    <div key={c.l} className="card card-hover p-5">
                      <p className="font-display text-3xl">{c.n}</p>
                      <p className="text-sm text-muted-fg">{c.l}</p>
                    </div>
                  ))}
                </RevealStagger>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Gallery */}
        <section
          id="work"
          data-review="gallery"
          className="section-pad border-b border-border"
          aria-labelledby="work-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Selected work</p>
              <h2 id="work-heading" className="font-display text-3xl font-semibold md:text-5xl">
                Recent jobs around the Cam.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                From a single EV charger to a full rewire. Every photo here would be from a real finished job.
              </p>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: GALLERY_COUNT }, (_, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <figure className="card card-hover">
                      <PlaceholderImage label={photoCaption(i)} embedded />
                      <figcaption className="border-t border-border px-4 py-3 text-sm text-muted-fg">
                        {photoCaption(i)}
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* Services */}
        <section
          data-review="services"
          className="section-pad border-b border-border bg-surface"
          aria-labelledby="services-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">What Dave does</p>
              <h2 id="services-heading" className="font-display text-3xl font-semibold md:text-5xl">
                {String(brief.services.length).padStart(2, "0")} services. Done plainly.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                Domestic work across Cambridge and the villages. If it carries voltage, it&apos;s probably already been done up the road.
              </p>
              <div className="mt-10 divide-y divide-border border-y border-border">
                {brief.services.map((service, i) => (
                  <Reveal key={service} delay={i * 50}>
                    <article className="card-hover grid gap-4 py-8 md:grid-cols-[80px_1fr]">
                      <p className="font-display text-2xl text-accent md:text-3xl">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <div>
                        <h3 className="font-display text-2xl font-semibold">{service}</h3>
                        <p className="mt-3 max-w-2xl text-muted-fg">{serviceDescription(service)}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {serviceTags(service).map((tag) => (
                            <span
                              key={tag}
                              className="border border-border px-3 py-1 text-xs uppercase tracking-wide text-muted-fg"
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
                Not on the list? Probably still on the books.{" "}
                <a href={phoneHref()} className="focus-ring text-accent underline-offset-4 hover:underline">
                  Talk it through with Dave
                </a>
                .
              </p>
            </div>
          </Reveal>
        </section>

        {/* About */}
        <section
          data-review="about"
          className="section-pad border-b border-border"
          aria-labelledby="about-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">About {brief.business_name}</p>
              <h2 id="about-heading" className="font-display text-3xl font-semibold md:text-5xl">
                One van. One trade. A name on a list.
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-fg">
                {brief.business_name} is run by {owner}, a domestic electrician working out of Cambridge.
                Fuse boards, EV chargers, full rewires on 1930s terraces, garden lighting that makes the patio usable in November.
              </p>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-fg">
                The promise is plain: turn up when I said I would, finish to a standard you&apos;d photograph,
                leave the place tidier than I found it, charge a fair price. After {brief.years_trading} years,
                that&apos;s the only marketing the business has needed.
              </p>
              <ul className="mt-8 grid gap-3 text-muted-fg md:grid-cols-2">
                <li>· Time-served electrician, 18th-edition wiring regs</li>
                <li>· Public liability insurance, certificates for notifiable work</li>
                <li>· Sole trader, same person on the phone and at the door</li>
                <li>· Repeat customers across Cambridge, Histon, Trumpington, Ely &amp; Newmarket</li>
              </ul>
            </div>
          </Reveal>
        </section>

        {/* Marquee */}
        <div
          data-review="marquee"
          className="overflow-hidden border-b border-border bg-foreground py-4 text-background"
          aria-hidden
        >
          <div className="marquee-track whitespace-nowrap font-display text-sm uppercase tracking-[0.3em] md:text-base">
            {[...reviewThemes(), ...brief.service_area, ...reviewThemes(), ...brief.service_area].join(
              ` ${design.separator} `
            )}
          </div>
        </div>

        {/* Reviews */}
        <section
          data-review="reviews"
          className="section-pad border-b border-border bg-surface"
          aria-labelledby="reviews-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Review highlights</p>
              <h2 id="reviews-heading" className="font-display text-3xl font-semibold md:text-5xl">
                {brief.review_count} reviews. Three clear themes.
              </h2>
              <p className="mt-4 text-muted-fg">
                {brief.rating}★ average across {brief.review_count} Google reviews. Tidy, fair, explained properly.
              </p>
              <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
                {brief.reviews.map((review, i) => (
                  <Reveal key={review.name} delay={i * 90} className="h-full">
                    <blockquote className="card card-hover flex h-full flex-col p-6">
                      <p className="font-display text-lg font-semibold">{reviewHeadline(review.text)}</p>
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

        {/* Service area */}
        <section
          data-review="service-area"
          className="section-pad border-b border-border"
          aria-labelledby="area-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Service area</p>
              <h2 id="area-heading" className="font-display text-3xl font-semibold md:text-5xl">
                Cambridge and the surrounding fens.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                Based in Cambridge. Most jobs are CB1, CB2, CB3 and out to Ely and Newmarket. If you&apos;re nearby and not sure, just ring.
              </p>
              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {brief.service_area.map((town, i) => (
                    <li key={town} className="flex gap-3 text-muted-fg">
                      <span className="font-display text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {town}
                    </li>
                  ))}
                </ol>
                <div className="card card-hover">
                  <iframe
                    title={`Map of ${brief.business_name} service area`}
                    src={mapEmbedUrl()}
                    className="h-72 w-full"
                    loading="lazy"
                  />
                  <p className="border-t border-border px-4 py-3 text-sm">
                    <a href={mapSearchUrl()} className="focus-ring text-accent underline-offset-4 hover:underline">
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

        {/* FAQ */}
        <section
          data-review="faq"
          className="section-pad border-b border-border bg-surface"
          aria-labelledby="faq-heading"
        >
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Practical answers</p>
              <h2 id="faq-heading" className="font-display text-3xl font-semibold md:text-5xl">
                Questions before you ring.
              </h2>
              <p className="mt-4 text-muted-fg">
                Anything not answered here? Pick up the phone. Dave can usually tell you in two minutes whether it&apos;s a quick fix or a half-day job.{" "}
                <a href={phoneHref()} className="focus-ring text-accent underline-offset-4 hover:underline">
                  Call {brief.phone}
                </a>
              </p>
              <div className="mt-10">
                <FaqAccordion items={faq} />
              </div>
            </div>
          </Reveal>
        </section>

        {/* Contact */}
        <section id="contact" data-review="contact" className="section-pad" aria-labelledby="contact-heading">
          <Reveal>
            <div className="mx-auto max-w-6xl">
              <p className="section-label mb-3">Get in touch</p>
              <h2 id="contact-heading" className="font-display text-3xl font-semibold md:text-5xl">
                Pick up the phone, or write.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-fg">
                Quickest is the phone. Otherwise leave a few lines below. {owner} picks these up between jobs.
              </p>
              <div className="mt-10 grid gap-10 lg:grid-cols-2">
                <div className="space-y-4 text-muted-fg">
                  <p>
                    <span className="block text-sm uppercase tracking-wide">Phone</span>
                    <a href={phoneHref()} className="focus-ring text-2xl font-medium text-accent">
                      {brief.phone}
                    </a>
                  </p>
                  <div>
                    <p className="text-sm uppercase tracking-wide">Hours</p>
                    <ul className="mt-2 space-y-1">
                      {openingHoursList().map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                  <p>
                    <span className="block text-sm uppercase tracking-wide">Based</span>
                    {brief.address}
                  </p>
                  <p>
                    <span className="block text-sm uppercase tracking-wide">Cover</span>
                    {brief.service_area.join(", ")} and wider CB postcodes.
                  </p>
                </div>
                <ContactForm ownerName={owner} phone={brief.phone} services={brief.services} />
              </div>
              <p className="mt-8 text-center text-muted-fg md:text-left">
                Or just call{" "}
                <a href={phoneHref()} className="focus-ring font-medium text-accent underline-offset-4 hover:underline">
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
            <p className="font-display text-2xl">{brief.business_name}</p>
            <p className="mt-2 text-sm text-background/70">Cambridge &amp; Cambridgeshire</p>
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
        <a href={phoneHref()} className="btn-secondary flex min-h-tap shrink-0 items-center justify-center px-4 text-sm">
          Call
        </a>
      </div>
    </>
  );
}
