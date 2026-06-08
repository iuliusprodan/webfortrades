import {
  galleryBeforeAfterPairs,
  galleryDetailCaptions,
  galleryFeatureCaption,
} from "@/lib/copy";
import { PlaceholderImage } from "./PlaceholderImage";
import { Reveal } from "./Reveal";

export function WorkGallery() {
  const pairs = galleryBeforeAfterPairs();
  const details = galleryDetailCaptions();

  return (
    <div className="space-y-12 md:space-y-16">
      <Reveal>
        <figure className="card card-hover overflow-hidden">
          <PlaceholderImage label={galleryFeatureCaption()} aspect="21/9" embedded />
          <figcaption className="border-t border-border px-5 py-4 text-sm text-muted-fg md:px-6">
            {galleryFeatureCaption()}
          </figcaption>
        </figure>
      </Reveal>

      <div className="space-y-10 md:space-y-14">
        {pairs.map((pair, i) => (
          <Reveal key={pair.title} delay={i * 80}>
            <article>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl font-medium md:text-3xl">{pair.title}</h3>
                <p className="text-sm text-muted-fg">
                  {pair.service} · {pair.place}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <figure className="card card-hover overflow-hidden">
                  <div className="relative">
                    <span className="absolute left-3 top-3 z-10 rounded-md bg-foreground/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-background">
                      Before
                    </span>
                    <PlaceholderImage
                      label={`Before · ${pair.title}`}
                      aspect="4/3"
                      embedded
                      tone="before"
                    />
                  </div>
                </figure>
                <figure className="card card-hover overflow-hidden">
                  <div className="relative">
                    <span className="absolute left-3 top-3 z-10 rounded-md bg-accent px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-accent-fg">
                      After
                    </span>
                    <PlaceholderImage
                      label={`After · ${pair.title}`}
                      aspect="4/3"
                      embedded
                      tone="after"
                    />
                  </div>
                </figure>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="grid gap-5 md:grid-cols-2">
          {details.map((caption) => (
            <figure key={caption} className="card card-hover overflow-hidden">
              <PlaceholderImage label={caption} aspect="3/4" embedded />
              <figcaption className="border-t border-border px-4 py-3 text-sm text-muted-fg">
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
