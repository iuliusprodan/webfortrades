export function PlaceholderImage({
  label,
  aspect = "4/3",
}: {
  label: string;
  aspect?: "4/3" | "16/9" | "3/4";
}) {
  const aspectClass =
    aspect === "16/9"
      ? "aspect-video"
      : aspect === "3/4"
        ? "aspect-[3/4]"
        : "aspect-[4/3]";

  return (
    <div
      className={`flex ${aspectClass} w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted`}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-fg">
        Placeholder
      </span>
      <span className="mt-2 max-w-[80%] text-center text-xs text-muted-fg">{label}</span>
    </div>
  );
}
