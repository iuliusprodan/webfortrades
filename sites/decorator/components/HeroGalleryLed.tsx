export function HeroGalleryLed() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[#c8c0b5] via-[#b5aca0] to-[#9f968b]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute inset-0 bg-hero-dark/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-hero-dark/90 via-hero-dark/45 to-hero-dark/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-hero-dark/70 via-transparent to-transparent" />
      <div className="absolute bottom-6 right-6 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/75 backdrop-blur-sm">
        Photo pending
      </div>
    </div>
  );
}
