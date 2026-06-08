export function PlaceholderImage({
  label,
  aspect = "4/3",
  embedded = false,
  tone = "neutral",
}: {
  label: string;
  aspect?: "4/3" | "16/9" | "21/9" | "3/4";
  embedded?: boolean;
  tone?: "neutral" | "before" | "after";
}) {
  const aspectClass =
    aspect === "21/9"
      ? "aspect-[21/9]"
      : aspect === "16/9"
        ? "aspect-video"
        : aspect === "3/4"
          ? "aspect-[3/4]"
          : "aspect-[4/3]";

  const toneClass =
    tone === "before"
      ? "bg-gradient-to-br from-[#b8b0a6] via-[#a89f94] to-[#9a9186]"
      : tone === "after"
        ? "bg-gradient-to-br from-[#e8e2d8] via-[#ddd6cb] to-[#d0c8bc]"
        : "bg-gradient-to-br from-[#d4cdc3] via-[#c8c0b5] to-[#b8afa4]";

  return (
    <div
      className={`relative ${aspectClass} w-full ${toneClass} ${embedded ? "" : "card card-hover"}`}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-fg">
          Gallery slot
        </span>
        <span className="mt-2 max-w-[85%] text-center text-xs text-muted-fg">{label}</span>
      </div>
    </div>
  );
}
