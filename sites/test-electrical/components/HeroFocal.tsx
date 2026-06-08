export function HeroFocal({ caption }: { caption: string }) {
  return (
    <div
      className="hero-focal relative aspect-[4/5] w-full overflow-hidden rounded-2xl md:aspect-[4/5] lg:aspect-auto lg:min-h-[520px]"
      role="img"
      aria-label={`Featured work: ${caption}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2d2a3d] to-[#1a1a2e]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/80 via-transparent to-transparent" />
      <div className="absolute left-5 top-5 h-12 w-12 border-l-2 border-t-2 border-accent/60" />
      <div className="absolute bottom-5 right-5 h-12 w-12 border-b-2 border-r-2 border-accent/60" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
          Selected work
        </p>
        <p className="mt-2 font-display text-lg font-medium text-white md:text-xl">
          {caption}
        </p>
      </div>
      <div className="absolute right-5 top-5 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/70 backdrop-blur-sm">
        Photo pending
      </div>
    </div>
  );
}
