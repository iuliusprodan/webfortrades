export function HeroJobSheet({ caption, jobNumber = "0001" }: { caption: string; jobNumber?: string }) {
  return (
    <div
      className="card relative aspect-[4/5] w-full overflow-hidden md:aspect-[4/5] lg:aspect-auto lg:min-h-[520px]"
      role="img"
      aria-label={`Featured job: ${caption}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1c2128] via-[#2a3038] to-[#12151a]" />
      <div className="ops-grid absolute inset-0 opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
      <div className="absolute left-0 top-0 border-b border-r border-border bg-background/80 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
        Job sheet / {jobNumber}
      </div>
      <div className="absolute left-5 top-16 h-10 w-10 border-l-2 border-t-2 border-accent" />
      <div className="absolute bottom-5 right-5 h-10 w-10 border-b-2 border-r-2 border-accent" />
      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/70 p-5 backdrop-blur-sm md:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-fg">
          Latest dispatch
        </p>
        <p className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-foreground md:text-xl">
          {caption}
        </p>
      </div>
      <div className="absolute right-5 top-16 border border-border bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-fg">
        Photo pending
      </div>
    </div>
  );
}
