import Image from "next/image";
import Link from "next/link";
import {
  brief,
  design,
  basedLocation,
  buildSafeStats,
  googleRatingDisplay,
  headerBrandName,
  logoPublicPath,
  phoneHref,
  photoPublicPath,
  areaLabel,
  googleProfileUrl,
  callLabelEntity,
} from "@/lib/data";
import {
  hasSectionPlan,
  moodClass,
  sectionPlan,
  siteStrategy,
  type PlanSection,
} from "@/lib/plan";
import { ContactForm } from "@/components/ContactForm";
import { GoogleReviewsButton } from "@/components/GoogleReviewsButton";
import { MidPageCta } from "@/components/MidPageCta";
import { MobileStickyBar } from "@/components/MobileStickyBar";

const ctaStyle = design.ctaStyle ?? "rounded-pill";

function ctaClass(primary = true): string {
  const base = "focus-ring inline-flex min-h-tap items-center px-6 py-3 font-medium";
  if (ctaStyle === "sharp-block") {
    return primary
      ? `${base} bg-accent text-accent-fg uppercase tracking-wider`
      : `${base} border-2 border-foreground`;
  }
  return primary
    ? `${base} rounded-full bg-accent text-accent-fg`
    : `${base} rounded-full border border-border`;
}

function displayServices(): string[] {
  return brief.services
    .filter((s) => !/home goods|building & construction/i.test(s))
    .slice(0, 5);
}

function serviceBlurb(title: string): string {
  const t = title.toLowerCase();
  if (/bathroom install/.test(t)) {
    return "Full bathroom installations across Kingswood and Bristol, planned with clear expectations before work starts.";
  }
  if (/bathroom refit|shower/.test(t)) {
    return "Complete bathroom refits and shower installs. Jack and Nick explain the job properly and finish to a high standard.";
  }
  if (/tap|toilet|shower repair/.test(t)) {
    return "Running taps, toilets and showers sorted without dragging the job out.";
  }
  if (/tiling|tile/.test(t)) {
    return "Kitchen, utility and bathroom tiling with attention to grout, layout and the finish customers mention in reviews.";
  }
  if (/plumbing/.test(t)) {
    return "General plumbing repairs across Bristol BS15, including macerator installs where pipework needs planning properly.";
  }
  return `${title} for homes around ${areaLabel()}.`;
}

function UtilityBar() {
  const rating = googleRatingDisplay();
  const logo = logoPublicPath();
  return (
    <div data-review="utility" className="border-b border-border bg-surface/95 text-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-10">
        <p className="flex items-center gap-2 text-muted-fg">
          {logo ? (
            <Image
              src={logo}
              alt={`${brief.business_name} logo`}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-border object-cover"
            />
          ) : null}
          <a
            href="#"
            data-review="header-brand"
            className="focus-ring font-medium text-foreground hover:text-accent"
          >
            {headerBrandName()}
          </a>
          <span className="mx-2 text-border">·</span>
          {basedLocation()}
          {rating ? (
            <>
              <span className="mx-2 text-border">·</span>
              <span>{rating}★ Google</span>
            </>
          ) : null}
        </p>
        <Link href="#contact" className={`${ctaClass()} hidden text-sm md:inline-flex`}>
          Get a free quote
        </Link>
      </div>
    </div>
  );
}

function ReviewLedHero({ section }: { section: PlanSection }) {
  const quote = siteStrategy.strongest_review_quote;
  return (
    <section
      data-section-id={section.id}
      data-review="review-led-hero"
      className={`section-pad border-b border-border ${moodClass(section.background_mood)}`}
      aria-labelledby="plan-hero-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Bathroom and tiling · {areaLabel()}</p>
        <h1 id="plan-hero-heading" className="display-heading mb-6 max-w-4xl">
          {section.heading ?? "Bathroom work finished properly"}
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-fg">{siteStrategy.business_angle}</p>
        {quote ? (
          <blockquote className="mb-8 max-w-3xl border-l-4 border-accent pl-5 text-lg italic text-foreground/90">
            &ldquo;{quote.text.slice(0, 220)}
            {quote.text.length > 220 ? "…" : ""}&rdquo;
            <footer className="mt-3 text-sm not-italic text-muted-fg">
              {quote.author} · Google review
            </footer>
          </blockquote>
        ) : null}
        <div className="flex flex-wrap gap-4">
          <Link href="#contact" className={ctaClass(true)}>
            Get a free quote
          </Link>
          {brief.phone ? (
            <a href={phoneHref()} className={ctaClass(false)}>
              Call {callLabelEntity()} - {brief.phone}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatsSourced({ section }: { section: PlanSection }) {
  const stats = buildSafeStats();
  if (!stats.length) return null;
  return (
    <section
      data-section-id={section.id}
      data-review="stats-sourced"
      className={`border-b border-border ${moodClass(section.background_mood)}`}
      aria-label="Key figures"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4 md:px-10">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl font-semibold md:text-4xl">{s.n}</p>
            <p className="mt-1 text-sm text-muted-fg">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SignatureJobStory({ section }: { section: PlanSection }) {
  const chris = brief.reviews.find((r) => r.reviewer === "Chris");
  return (
    <section
      data-section-id={section.id}
      data-review="signature-job-story"
      className={`section-pad border-b border-border ${moodClass(section.background_mood)}`}
      aria-labelledby="signature-heading"
    >
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="section-label mb-3">Signature work</p>
          <h2 id="signature-heading" className="font-display text-3xl font-semibold md:text-5xl">
            {section.heading}
          </h2>
          <p className="mt-4 text-muted-fg">
            Reviews keep coming back to full bathroom renovations. Customers mention competitive
            quotes, clear expectations and an exceptional finish when Jack and Nick take the job on.
          </p>
        </div>
        {chris ? (
          <blockquote className="mt-8 rounded-2xl border border-border bg-background p-6 lg:mt-0">
            <p className="text-foreground/90">&ldquo;{chris.text.slice(0, 280)}…&rdquo;</p>
            <footer className="mt-4 text-sm text-muted-fg">{chris.reviewer} · Google</footer>
          </blockquote>
        ) : null}
      </div>
    </section>
  );
}

function ServiceExplainers({ section }: { section: PlanSection }) {
  const services = displayServices();
  return (
    <section
      data-section-id={section.id}
      data-review="service-explainers"
      className={`section-pad border-b border-border ${moodClass(section.background_mood)}`}
      aria-labelledby="services-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Services</p>
        <h2 id="services-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {section.heading}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {services.map((title) => (
            <article key={title} className="rounded-2xl border border-border bg-background p-6">
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-muted-fg">{serviceBlurb(title)}</p>
            </article>
          ))}
        </div>
        <MidPageCta
          text="Planning a bathroom refit in Bristol? Request a free quote."
          callHref={phoneHref()}
          callLabel={`Call ${callLabelEntity()}`}
        />
      </div>
    </section>
  );
}

function TeamPersonSection({ section }: { section: PlanSection }) {
  const people = siteStrategy.named_people;
  return (
    <section
      data-section-id={section.id}
      data-review="team-person-section"
      className={`section-pad border-b border-border ${moodClass(section.background_mood)}`}
      aria-labelledby="team-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">The team customers name</p>
        <h2 id="team-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {section.heading}
        </h2>
        <p className="mt-4 max-w-3xl text-muted-fg">
          Google reviewers mention {people.join(" and ")} by name. Harriet found Corvell on
          Instagram before Jack measured up for tiling. Chris and Stephen both booked full bathroom
          work after competitive quotes and clear communication.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {people.map((name) => (
            <li key={name} className="rounded-xl border border-border bg-background px-5 py-4">
              <p className="font-display text-xl font-semibold">{name}</p>
              <p className="mt-1 text-sm text-muted-fg">Named in verified Google reviews</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ProcessSection({ section }: { section: PlanSection }) {
  const steps = [
    {
      n: "01",
      title: "Call or message",
      body: `Ring ${brief.phone ?? brief.business_name} with a rough idea of the bathroom or tiling job.`,
    },
    {
      n: "02",
      title: "Measure and quote",
      body: "Jack or Nick visit to measure up, advise on tiles or fittings, and leave a competitive written quote.",
    },
    {
      n: "03",
      title: "Plan the work",
      body: "Expectations are set clearly before installation, especially on full bathroom renovations.",
    },
    {
      n: "04",
      title: "Finish and tidy",
      body: "Work is completed to the high standard reviewers describe, with the place left tidy.",
    },
  ];
  return (
    <section
      data-section-id={section.id}
      data-review="process-section"
      className={`section-pad border-b border-border ${moodClass(section.background_mood)}`}
      aria-labelledby="process-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">How it works</p>
        <h2 id="process-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {section.heading}
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-2">
          {steps.map((step) => (
            <li key={step.n} className="rounded-2xl border border-border bg-background p-6">
              <p className="font-mono text-sm text-accent">{step.n}</p>
              <h3 className="mt-2 font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-fg">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ReviewWall({ section }: { section: PlanSection }) {
  const rating = googleRatingDisplay();
  return (
    <section
      data-section-id={section.id}
      data-review="review-wall"
      className={`section-pad border-b border-border ${moodClass(section.background_mood)}`}
      aria-labelledby="reviews-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">In their own words</p>
        <h2 id="reviews-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {rating ? `${rating} on Google reviews` : section.heading}
        </h2>
        <p className="mt-3 max-w-2xl text-muted-fg">
          Every quote below is from a real Google review for Corvell Ltd. Customers across Bristol
          mention tidy finishes, fair pricing and bathroom work done properly.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {brief.reviews.slice(0, 4).map((r) => (
            <article key={r.reviewer + r.text.slice(0, 20)} className="rounded-2xl border border-border bg-background p-6">
              <p className="text-foreground/90">&ldquo;{r.text}&rdquo;</p>
              <footer className="mt-4 flex items-center justify-between text-sm text-muted-fg">
                <span>{r.reviewer}</span>
                <span>{r.rating}★</span>
              </footer>
            </article>
          ))}
        </div>
        {googleProfileUrl() ? (
          <div className="mt-8">
            <GoogleReviewsButton href={googleProfileUrl()!} />
          </div>
        ) : null}
        <div className="mt-10">
          <MidPageCta
            text="Prefer to talk it through before booking? Call Jack or Nick."
            callHref={phoneHref()}
            callLabel={`Call ${callLabelEntity()}`}
          />
        </div>
      </div>
    </section>
  );
}

function LocalCoverage({ section }: { section: PlanSection }) {
  const areas = brief.service_area.slice(0, 10);
  return (
    <section
      data-section-id={section.id}
      data-review="local-coverage"
      className={`section-pad border-b border-border ${moodClass(section.background_mood)}`}
      aria-labelledby="area-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Coverage</p>
        <h2 id="area-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {section.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-muted-fg">
          Based in Kingswood, Bristol BS15. Regular work across the east Bristol area. Ask if you are
          just outside the list.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {areas.map((a) => (
            <li key={a} className="rounded-full border border-border px-4 py-2 text-sm">
              {a}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SimpleContact({ section }: { section: PlanSection }) {
  return (
    <section
      id="contact"
      data-section-id={section.id}
      data-review="contact"
      data-plan-section="simple-contact"
      className={`section-pad ${moodClass(section.background_mood)}`}
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Contact</p>
        <h2 id="contact-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {section.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-muted-fg">
          Fastest is a phone call to Jack or Nick between jobs. Otherwise send a few lines about
          your bathroom or tiling job and the team will come back.
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {brief.phone ? (
              <p>
                <span className="block text-sm uppercase tracking-wide opacity-80">Phone</span>
                <a href={phoneHref()} className="focus-ring text-2xl font-medium text-accent">
                  {brief.phone}
                </a>
              </p>
            ) : null}
            <p>
              <span className="block text-sm uppercase tracking-wide opacity-80">Based</span>
              {basedLocation()}
            </p>
          </div>
          <ContactForm
            ownerName={brief.business_name}
            phone={brief.phone}
            services={displayServices()}
            submitLabel={`Send to ${brief.business_name}`}
          />
        </div>
      </div>
    </section>
  );
}

function GalleryLean({ section }: { section: PlanSection }) {
  const photos = brief.photos.slice(0, 4);
  if (!photos.length) return null;
  return (
    <section
      data-section-id={section.id}
      data-review="gallery-lean"
      className={`section-pad border-b border-border ${moodClass(section.background_mood)}`}
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-6xl">
        <p className="section-label mb-3">Recent work</p>
        <h2 id="gallery-heading" className="font-display text-3xl font-semibold md:text-5xl">
          {section.heading ?? "Bathroom and plumbing work"}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {photos.map((photo, i) => (
            <figure key={photo.local} className="overflow-hidden rounded-2xl border border-border">
              <Image
                src={photoPublicPath(photo.local)}
                alt={photo.caption ?? `${brief.business_name} project photo ${i + 1}`}
                width={photo.width}
                height={photo.height}
                className="h-64 w-full object-cover"
              />
              {photo.caption ? (
                <figcaption className="px-4 py-3 text-sm text-muted-fg">{photo.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderSection(section: PlanSection) {
  switch (section.id) {
    case "review-led-hero":
    case "proof-led-hero":
    case "photo-led-hero":
      return <ReviewLedHero key={section.id} section={section} />;
    case "stats-sourced-only":
      return <StatsSourced key={section.id} section={section} />;
    case "signature-job-story":
      return <SignatureJobStory key={section.id} section={section} />;
    case "service-explainers":
      return <ServiceExplainers key={section.id} section={section} />;
    case "team-person-section":
      return <TeamPersonSection key={section.id} section={section} />;
    case "process-section":
      return <ProcessSection key={section.id} section={section} />;
    case "review-wall":
      return <ReviewWall key={section.id} section={section} />;
    case "local-coverage":
      return <LocalCoverage key={section.id} section={section} />;
    case "simple-contact":
      return <SimpleContact key={section.id} section={section} />;
    case "gallery-lean":
      return <GalleryLean key={section.id} section={section} />;
    case "quote-form":
      return null;
    default:
      return null;
  }
}

function Footer() {
  return (
    <footer data-review="footer" className="border-t border-border bg-foreground px-5 py-10 text-background md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl">{brief.business_name}</p>
          <p className="mt-2 text-sm text-background/70">{basedLocation()}</p>
        </div>
        <p className="text-xs text-background/60">
          <a href="https://www.webfortradesuk.co.uk" className="underline-offset-2 hover:underline">
            Website by WebForTrades
          </a>
        </p>
      </div>
    </footer>
  );
}

export function PlanPage() {
  if (!hasSectionPlan()) return null;

  return (
    <>
      <header data-review="header" className="site-header sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <UtilityBar />
      </header>
      <main className="main-with-mobile-bar md:pb-0">
        {sectionPlan.sections.map((section) => renderSection(section))}
      </main>
      <Footer />
      <MobileStickyBar
        quoteLabel="Get quote"
        callLabel={`Call ${callLabelEntity()}`}
        phoneHref={phoneHref()}
      />
    </>
  );
}
