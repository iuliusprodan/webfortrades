export function PlaceholderImage({
  label,
  aspect = "4/3",
  embedded = false,
}: {
  label: string;
  aspect?: "4/3" | "16/9" | "3/4";
  embedded?: boolean;
}) {
  const aspectClass =
    aspect === "16/9"
      ? "aspect-video"
      : aspect === "3/4"
        ? "aspect-[3/4]"
        : "aspect-[4/3]";

  return (
    <div
      className={`relative ${aspectClass} w-full bg-gradient-to-br from-muted to-surface ${
        embedded ? "" : "card card-hover"
      }`}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-fg">
          Gallery slot
        </span>
        <span className="mt-2 max-w-[85%] text-center text-xs text-muted-fg">{label}</span>
      </div>
    </div>
  );
}
