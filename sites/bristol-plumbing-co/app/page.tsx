import Image from "next/image";
import {
  brief,
  design,
  basedLocation,
  buildSafeStats,
  googleRatingDisplay,
  headerBrandName,
  mapEmbedUrl,
  mapSearchUrl,
  googleProfileUrl,
  phoneHref,
  photoPublicPath,
  areaLabel,
  reviewsHeading,
  reviewsSubheading,
} from "@/lib/data";
import {
  aboutParagraph,
  contactIntro,
  faqItems,
  formSubmitLabel,
  heroCallLabel,
  heroQuoteLabel,
  heroHeadline,
  heroSub,
  midPageCtaAfterServices,
  midPageCtaAfterFaq,
  midPageCtaAfterWork,
  mobileCallLabel,
  mobileQuoteLabel,
  ownerNoteLabel,
  ownerNoteParagraphs,
  ownerNoteTitle,
  photoCaption,
  reviewHeadline,
  reviewThemes,
  reviewsContactMention,
  serviceAreaIntro,
  serviceDescription,
  serviceTags,
} from "@/lib/copy";
import { ContactForm } from "@/components/ContactForm";
import { GoogleReviewsButton } from "@/components/GoogleReviewsButton";
import { MidPageCta } from "@/components/MidPageCta";
import { MobileStickyBar } from "@/components/MobileStickyBar";

const isIndustrial = design.trade === "industrial-mechanic";

function UtilityBar() {
  const rating = googleRatingDisplay();
  const brand = headerBrandName();
  return (
    <div data-review="utility" className="border-b border-border bg-surface/95 text-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-10">
        <p className={`text-muted-fg ${isIndustrial ? "font-mono text-xs uppercase tracking-[0.18em]" : ""}`}>
          <a
            href="#"
            data-review="header-brand"
            className="focus-ring font-medium text-foreground hover:text-accent"
          >
            {brand}
          </a>
          <span className="mx-2 text-border">·</span>
          {areaLabel()}
          {rating ? (
            <>
              <span className="mx-2 text-border">·</span>
              {rating}★ rating
            </>
          ) : null}
        </p>
        <a
          href="#contact"
          className="focus-ring hidden min-h-tap items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground md:inline-flex"
        >
          Get quote
        </a>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section data-review="hero" className="section-pad border-b border-border" aria-labelledby="hero-heading">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="section-label mb-4">
            {areaLabel()} · {brief.business_name}
          </p>
          <h1 id="hero-heading" className="display-heading mb-6">
            {heroHeadline()}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-fg md:text-xl">
            {heroSub()}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#contact"
              className={`focus-ring inline-flex min-h-tap items-center rounded-full bg-accent px-6 py-3 font-medium text-accent-fg ${isIndustrial ? "font-mono uppercase tracking-wider" : ""}`}
            >
              {isIndustrial ? heroQuoteLabel().toUpperCase() : heroQuoteLabel()}
            </a>
            {brief.phone ? (
              <a
                href={phoneHref()}
                className="focus-ring inline-flex min-h-tap items-center rounded-full border border-border px-6 py-3 font-medium"
              >
                {heroCallLabel()}
              </a>
            ) : null}
          </div>
        </div>
        {brief.photos[0] ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
            <Image
              src={photoPublicPath(brief.photos[0].local)}
              alt={`Recent work by ${brief.business_name}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function StatRow() {
  const stats = buildSafeStats();
  if (!stats.length) return null;

  const gridClass =
    stats.length === 2
      ? "grid-cols-2 max-w-xl mx-auto"
      : stats.length === 3
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-4";

  return (
    <section data-review="stats" className="border-b border-border bg-surface" aria-label="Key figures">
      <div className={`mx-auto grid max-w-6xl gap-6 px-5 py-10 ${gridClass} md:px-10`}>
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <p className="font-display text-4xl font-semibold md:text-5xl">{s.n}</p>
            <p className="mt-2 text-sm text-muted-fg">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function OwnerNote() {
  const rating = googleRatingDisplay();
  return (
    <section data-review="owner-note" className="section-pad border-b border-border" aria-labelledby="owner-note">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">{ownerNoteLabel()}</p>
        <h2 id="owner-note" className="font-display text-3xl font-semibold md:text-5xl">
          {ownerNoteTitle()}
        </h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5 text-lg leading-relaxed text-muted-fg">
            {ownerNoteParagraphs().map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {rating ? (
              <div className="rounded-2xl border border-border p-5">
                <p className="font-display text-3xl">{rating}</p>
                <p className="text-sm text-muted-fg">average review</p>
              </div>
            ) : null}
            <div className="rounded-2xl border border-border p-5">
              <p className="font-display text-3xl">01</p>
              <p className="text-sm text-muted-fg">van, no middle-men</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  if (!brief.photos.length) return null;
  return (
    <section id="work" data-review="gallery" className="section-pad border-b border-border" aria-labelledby="work-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Selected work</p>
        <h2 id="work-heading" className="font-display text-3xl font-semibold md:text-5xl">
          Recent jobs around {areaLabel()}.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brief.photos.slice(0, 9).map((photo, i) => (
            <figure key={photo.local} className="group overflow-hidden rounded-2xl border border-border">
              <div className="relative aspect-[4/3]">
                <Image
                  src={photoPublicPath(photo.local)}
                  alt={photoCaption(i)}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <figcaption className="border-t border-border px-4 py-3 text-sm text-muted-fg">
                {photoCaption(i)}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-10">
        <MidPageCta text={midPageCtaAfterWork()} callHref={phoneHref()} callLabel={mobileCallLabel()} />
      </div>
    </section>
  );
}

function Services() {
  if (!brief.services.length) return null;
  return (
    <section data-review="services" className="section-pad border-b border-border bg-surface" aria-labelledby="services-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">What we do</p>
        <h2 id="services-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {String(brief.services.length).padStart(2, "0")} services. Done plainly.
        </h2>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {brief.services.map((service, i) => (
            <article key={service} className="grid gap-4 py-8 md:grid-cols-[80px_1fr]">
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
                      className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide text-muted-fg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-10">
        <MidPageCta text={midPageCtaAfterServices()} />
      </div>
    </section>
  );
}

function About() {
  return (
    <section data-review="about" className="section-pad border-b border-border" aria-labelledby="about-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">About</p>
        <h2 id="about-heading" className="font-display text-3xl font-semibold md:text-5xl">
          One van. One trade. A name on a list.
        </h2>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-fg">{aboutParagraph()}</p>
        <ul className="mt-8 grid gap-3 text-muted-fg md:grid-cols-2">
          <li>· Fully insured, certificates where the job needs them</li>
          <li>· Same team on the phone and at the door</li>
          <li>· Based in {basedLocation()}</li>
          <li>· Repeat customers across {areaLabel()}</li>
        </ul>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...reviewThemes(), ...brief.service_area];
  if (!items.length) return null;
  const sep = ` ${design.separator} `;
  const line = [...items, ...items].join(sep);
  return (
    <div data-review="marquee" className="overflow-hidden border-b border-border bg-foreground py-4 text-background" aria-hidden>
      <div className="marquee-track whitespace-nowrap font-display text-sm uppercase tracking-[0.3em] md:text-base">
        {line}
      </div>
    </div>
  );
}

function Reviews() {
  if (!brief.reviews.length) return null;
  const sub = reviewsSubheading();
  const googleUrl = googleProfileUrl();
  return (
    <section data-review="reviews" className="section-pad border-b border-border bg-surface" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Reviews</p>
        <h2 id="reviews-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {reviewsHeading()}
        </h2>
        {sub ? <p className="mt-4 text-muted-fg">{sub}</p> : null}
        {reviewsContactMention() ? (
          <p className="mt-3 text-sm text-muted-fg">{reviewsContactMention()}</p>
        ) : null}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {brief.reviews.map((review) => (
            <blockquote
              key={`${review.reviewer}-${review.text.slice(0, 20)}`}
              className="rounded-2xl border border-border p-6"
            >
              <p className="font-display text-lg font-semibold">{reviewHeadline(review.text)}</p>
              <p className="mt-4 leading-relaxed text-muted-fg">&ldquo;{review.text}&rdquo;</p>
              <footer className="mt-4 text-sm text-muted-fg">
                - {review.reviewer}
                <span className="mx-2">·</span>
                {"★".repeat(review.rating)}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
      {googleUrl ? (
        <div className="mt-10">
          <GoogleReviewsButton href={googleUrl} />
        </div>
      ) : null}
    </section>
  );
}

function ServiceArea() {
  if (!brief.service_area.length) return null;
  return (
    <section data-review="service-area" className="section-pad border-b border-border" aria-labelledby="area-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Service area</p>
        <h2 id="area-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {areaLabel()} and nearby.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-fg">{serviceAreaIntro()}</p>
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
          <div className="overflow-hidden rounded-2xl border border-border">
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
              <span className="text-muted-fg"> · Based in {basedLocation()}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = faqItems();
  return (
    <section data-review="faq" className="section-pad border-b border-border bg-surface" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Practical answers</p>
        <h2 id="faq-heading" className="font-display text-3xl font-semibold md:text-5xl">
          Questions before you ring.
        </h2>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="focus-ring cursor-pointer list-none font-display text-xl font-semibold marker:content-none">
                {item.q}
              </summary>
              <p className="mt-3 max-w-3xl text-muted-fg">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
      <div className="mt-10">
        <MidPageCta
          text={midPageCtaAfterFaq()}
          callHref={phoneHref()}
          callLabel={mobileCallLabel()}
        />
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" data-review="contact" className="section-pad" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Get in touch</p>
        <h2 id="contact-heading" className="font-display text-3xl font-semibold md:text-5xl">
          Pick up the phone, or write.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-fg">{contactIntro()}</p>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 text-muted-fg">
            {brief.phone ? (
              <p>
                <span className="block text-sm uppercase tracking-wide">Phone</span>
                <a href={phoneHref()} className="focus-ring text-2xl font-medium text-accent">
                  {brief.phone}
                </a>
              </p>
            ) : null}
            {brief.opening_hours.length ? (
              <div>
                <p className="text-sm uppercase tracking-wide">Hours</p>
                <ul className="mt-2 space-y-1">
                  {brief.opening_hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p>
              <span className="block text-sm uppercase tracking-wide">Based</span>
              {basedLocation()}
            </p>
          </div>
          <ContactForm
            ownerName={ownerNoteLabel()}
            phone={brief.phone}
            services={brief.services}
            submitLabel={formSubmitLabel()}
          />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer data-review="footer" className="border-t border-border bg-foreground px-5 py-10 text-background md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl">{brief.business_name}</p>
          <p className="mt-2 text-sm text-background/70">{areaLabel()}</p>
        </div>
        <p className="text-xs text-background/60">
          <a
            href="https://www.webfortradesuk.co.uk"
            className="underline-offset-2 hover:underline"
          >
            Website by WebForTrades
          </a>
        </p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <header data-review="header" className="site-header sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <UtilityBar />
      </header>
      <main className="main-with-mobile-bar md:pb-0">
        <Hero />
        <StatRow />
        <OwnerNote />
        <Gallery />
        <Services />
        <About />
        <Marquee />
        <Reviews />
        <ServiceArea />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <MobileStickyBar
        quoteLabel={mobileQuoteLabel()}
        callLabel={mobileCallLabel()}
        phoneHref={phoneHref()}
      />
    </>
  );
}
