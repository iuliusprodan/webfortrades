export function HeroFullBleed() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[#8fa8be] via-[#6b8fa8] to-[#4a6d85]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/95 via-hero-dark/75 to-hero-dark/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-hero-dark/60 via-transparent to-transparent" />
      <div className="absolute bottom-6 right-6 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm">
        Photo pending
      </div>
    </div>
  );
}
