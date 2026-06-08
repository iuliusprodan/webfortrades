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
  ownerNoteParagraphs,
  photoCaption,
  reviewHeadline,
  reviewThemes,
  serviceDescription,
  serviceTags,
} from "@/lib/copy";
import { ContactForm } from "@/components/ContactForm";
import { PlaceholderImage } from "@/components/PlaceholderImage";

function UtilityBar() {
  return (
    <div data-review="utility" className="border-b border-border bg-surface text-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-10">
        <p className="text-muted-fg">
          <span className="font-medium text-foreground">{primaryTrade()}</span>
          <span className="mx-2 text-border">·</span>
          {areaLabel()} &amp; surrounds
          <span className="mx-2 text-border">·</span>
          {brief.rating}★ · {brief.review_count} reviews
        </p>
        <a
          href={phoneHref()}
          className="focus-ring min-h-tap min-w-tap font-medium text-accent underline-offset-4 hover:underline"
        >
          {brief.phone}
        </a>
      </div>
    </div>
  );
}

function Hero() {
  const owner = ownerName();
  return (
    <section data-review="hero" className="section-pad border-b border-border" aria-labelledby="hero-heading">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="section-label mb-4">
            Cambridge · Est. {brief.years_trading} years on reputation
          </p>
          <h1 id="hero-heading" className="display-heading mb-6">
            {heroHeadline()}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-fg md:text-xl">
            {heroSub()}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={phoneHref()}
              className="focus-ring inline-flex min-h-tap items-center rounded-full bg-accent px-6 py-3 font-medium text-accent-fg"
            >
              Call {owner} — {brief.phone}
            </a>
            <a
              href="#work"
              className="focus-ring inline-flex min-h-tap items-center rounded-full border border-border px-6 py-3 font-medium"
            >
              See recent work
            </a>
          </div>
        </div>
        <PlaceholderImage label="Hero — recent job photo" />
      </div>
    </section>
  );
}

function StatRow() {
  const stats = [
    { n: `${brief.rating}★`, label: "Google rating" },
    { n: String(brief.review_count), label: "Verified reviews" },
    { n: `${brief.years_trading}+`, label: "Years on the road" },
    { n: String(brief.service_area.length).padStart(2, "0"), label: "Towns covered" },
  ];

  return (
    <section data-review="stats" className="border-b border-border bg-surface" aria-label="Key figures">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4 md:px-10">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-4xl font-semibold md:text-5xl">{s.n}</p>
            <p className="mt-2 text-sm text-muted-fg">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function OwnerNote() {
  const owner = ownerName();
  return (
    <section data-review="owner-note" className="section-pad border-b border-border" aria-labelledby="owner-note">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">{owner} — owner &amp; electrician</p>
        <h2 id="owner-note" className="font-display text-3xl font-semibold md:text-5xl">
          A note from {owner}
        </h2>
        <p className="mt-4 font-display text-xl text-muted-fg md:text-2xl">
          A trade you can show off.
        </p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5 text-lg leading-relaxed text-muted-fg">
            {ownerNoteParagraphs().map((p) => (
              <p key={p.slice(0, 28)}>{p}</p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border p-5">
              <p className="font-display text-3xl">{brief.years_trading}+</p>
              <p className="text-sm text-muted-fg">years on the road</p>
            </div>
            <div className="rounded-2xl border border-border p-5">
              <p className="font-display text-3xl">{brief.rating}</p>
              <p className="text-sm text-muted-fg">average review</p>
            </div>
            <div className="rounded-2xl border border-border p-5">
              <p className="font-display text-3xl">★★★★★</p>
              <p className="text-sm text-muted-fg">every review</p>
            </div>
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
  return (
    <section id="work" data-review="gallery" className="section-pad border-b border-border" aria-labelledby="work-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Selected work</p>
        <h2 id="work-heading" className="font-display text-3xl font-semibold md:text-5xl">
          Recent jobs around the Cam.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-fg">
          From a single EV charger to a full rewire — every photo here would be from a real finished job.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: GALLERY_COUNT }, (_, i) => (
            <figure key={i} className="overflow-hidden rounded-2xl border border-border">
              <PlaceholderImage label={photoCaption(i)} />
              <figcaption className="border-t border-border px-4 py-3 text-sm text-muted-fg">
                {photoCaption(i)}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section data-review="services" className="section-pad border-b border-border bg-surface" aria-labelledby="services-heading">
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
        <p className="mt-8 text-muted-fg">
          Not on the list? Probably still on the books —{" "}
          <a href={phoneHref()} className="focus-ring text-accent underline-offset-4 hover:underline">
            talk it through with Dave
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function About() {
  const owner = ownerName();
  return (
    <section data-review="about" className="section-pad border-b border-border" aria-labelledby="about-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">About {brief.business_name}</p>
        <h2 id="about-heading" className="font-display text-3xl font-semibold md:text-5xl">
          One van. One trade. A name on a list.
        </h2>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-fg">
          {brief.business_name} is run by {owner} — a domestic electrician working out of Cambridge.
          Fuse boards, EV chargers, full rewires on 1930s terraces, garden lighting that makes the patio usable in November.
        </p>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-fg">
          The promise is plain: turn up when I said I would, finish to a standard you&apos;d photograph,
          leave the place tidier than I found it, charge a fair price. After {brief.years_trading} years,
          that&apos;s the only marketing the business has needed.
        </p>
        <ul className="mt-8 grid gap-3 text-muted-fg md:grid-cols-2">
          <li>· Time-served electrician — 18th-edition wiring regs</li>
          <li>· Public liability insurance, certificates for notifiable work</li>
          <li>· Sole trader — same person on the phone and at the door</li>
          <li>· Repeat customers across Cambridge, Histon, Trumpington, Ely &amp; Newmarket</li>
        </ul>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...reviewThemes(), ...brief.service_area];
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
  return (
    <section data-review="reviews" className="section-pad border-b border-border bg-surface" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Review highlights</p>
        <h2 id="reviews-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {brief.review_count} reviews. Three clear themes.
        </h2>
        <p className="mt-4 text-muted-fg">
          {brief.rating}★ average across {brief.review_count} Google reviews — tidy, fair, explained properly.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brief.reviews.map((review) => (
            <blockquote
              key={review.name}
              className="rounded-2xl border border-border p-6"
            >
              <p className="font-display text-lg font-semibold">{reviewHeadline(review.text)}</p>
              <p className="mt-4 leading-relaxed text-muted-fg">&ldquo;{review.text}&rdquo;</p>
              <footer className="mt-4 text-sm text-muted-fg">
                — {review.name}
                <span className="mx-2">·</span>
                {"★".repeat(review.rating)}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceArea() {
  return (
    <section data-review="service-area" className="section-pad border-b border-border" aria-labelledby="area-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Service area</p>
        <h2 id="area-heading" className="font-display text-3xl font-semibold md:text-5xl">
          Cambridge and the surrounding fens.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-fg">
          Based in Cambridge. Most jobs are CB1, CB2, CB3 and out to Ely and Newmarket — if you&apos;re nearby and not sure, just ring.
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
              {" · "}
              {brief.address}
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
        <p className="mt-4 text-muted-fg">
          Anything not answered here? Pick up the phone — Dave can usually tell you in two minutes whether it&apos;s a quick fix or a half-day job.{" "}
          <a href={phoneHref()} className="focus-ring text-accent underline-offset-4 hover:underline">
            Call {brief.phone}
          </a>
        </p>
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
    </section>
  );
}

function Contact() {
  const owner = ownerName();
  return (
    <section id="contact" data-review="contact" className="section-pad" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Get in touch</p>
        <h2 id="contact-heading" className="font-display text-3xl font-semibold md:text-5xl">
          Pick up the phone — or write.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-fg">
          Quickest is the phone. Otherwise leave a few lines below — {owner} picks these up between jobs.
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
          <ContactForm
            ownerName={owner}
            phone={brief.phone}
            services={brief.services}
          />
        </div>
        <p className="mt-8 text-center text-muted-fg md:text-left">
          Or just call{" "}
          <a href={phoneHref()} className="focus-ring font-medium text-accent underline-offset-4 hover:underline">
            {brief.phone}
          </a>
          — quickest way to a quote.
        </p>
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
          <p className="mt-2 text-sm text-background/70">Cambridge &amp; Cambridgeshire</p>
        </div>
        <p className="text-xs text-background/60">Website by WebForTrades</p>
      </div>
    </footer>
  );
}

function MobileCallBar() {
  return (
    <div data-review="mobile-call" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface p-3 md:hidden">
      <a
        href={phoneHref()}
        className="focus-ring flex min-h-tap w-full items-center justify-center rounded-full bg-accent font-medium text-accent-fg"
      >
        Call {ownerName()} — {brief.phone}
      </a>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <header>
        <UtilityBar />
      </header>
      <main className="pb-24 md:pb-0">
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
      <MobileCallBar />
    </>
  );
}
