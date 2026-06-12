interface MidPageCtaProps {
  text: string;
  quoteHref?: string;
  callHref?: string;
  callLabel?: string;
}

export function MidPageCta({
  text,
  quoteHref = "#contact",
  callHref,
  callLabel,
}: MidPageCtaProps) {
  return (
    <div
      data-review="mid-page-cta"
      className="mx-auto max-w-6xl px-5 md:px-10"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-fg">{text}</p>
        <div className="flex flex-wrap gap-3">
          <a
            href={quoteHref}
            className="focus-ring inline-flex min-h-tap items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg"
          >
            Get a free quote
          </a>
          {callHref && callLabel ? (
            <a
              href={callHref}
              className="focus-ring inline-flex min-h-tap items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium"
            >
              {callLabel}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
