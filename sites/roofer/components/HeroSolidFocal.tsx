export function HeroSolidFocal({ caption }: { caption: string }) {
  return (
    <div
      className="card relative min-h-[420px] w-full overflow-hidden md:min-h-[520px] lg:min-h-[560px]"
      role="img"
      aria-label={`Featured roof work: ${caption}`}
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#4a5a60] via-[#3a4a50] to-[#2c3a3f]" />
      <div className="slate-grid absolute inset-0 z-0 opacity-25" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute left-0 top-0 z-10 border-b border-r border-border bg-background/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-stone">
        Site survey / 001
      </div>
      <div className="absolute right-0 top-0 z-10 border-b border-l border-accent bg-accent px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-fg">
        Sheffield
      </div>
      <div className="absolute left-6 top-24 z-10 max-w-[200px] border-2 border-border bg-background/85 p-4 backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone">Spec</p>
        <p className="mt-2 font-display text-sm uppercase leading-tight tracking-wide text-foreground">
          Slate &amp; tile · Scaffold safe
        </p>
      </div>
      <div className="absolute right-6 top-20 z-10 border border-border bg-muted px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-fg">
        Photo pending
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t-2 border-accent bg-background/85 p-5 backdrop-blur-sm md:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone">
          Latest completion
        </p>
        <p className="mt-2 font-display text-xl uppercase tracking-wide text-foreground md:text-2xl">
          {caption}
        </p>
      </div>
      <div
        className="pointer-events-none absolute left-6 top-16 z-20 h-12 w-12 border-l-[3px] border-t-[3px] border-accent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-6 right-6 z-20 h-12 w-12 border-b-[3px] border-r-[3px] border-accent"
        aria-hidden
      />
    </div>
  );
}
