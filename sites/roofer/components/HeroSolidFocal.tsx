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
      <div className="absolute left-0 top-0 z-10 border-b border-r border-border bg-background/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-stone">
        Site survey / 001
      </div>
      <div className="absolute right-0 top-0 z-10 border-b border-l border-accent bg-accent px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-accent-fg">
        Sheffield
      </div>
      <div className="absolute right-4 top-12 z-10 text-[9px] font-medium uppercase tracking-wider text-muted-fg/80">
        Photo pending
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t-2 border-accent bg-background/85 px-5 py-4 backdrop-blur-sm md:px-6 md:py-5">
        <p className="font-display text-lg uppercase tracking-wide text-foreground md:text-2xl">
          {caption}
        </p>
      </div>
      <div
        className="pointer-events-none absolute left-5 top-14 z-20 h-10 w-10 border-l-[3px] border-t-[3px] border-accent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-5 right-5 z-20 h-10 w-10 border-b-[3px] border-r-[3px] border-accent"
        aria-hidden
      />
    </div>
  );
}
