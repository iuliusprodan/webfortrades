export function PlaceholderImage({
  label,
  aspect = "4/3",
  embedded = false,
  large = false,
}: {
  label: string;
  aspect?: "4/3" | "16/9" | "3/4";
  embedded?: boolean;
  large?: boolean;
}) {
  const aspectClass =
    aspect === "16/9"
      ? "aspect-video"
      : aspect === "3/4"
        ? "aspect-[3/4]"
        : large
          ? "aspect-[5/4] md:aspect-[4/3]"
          : "aspect-[4/3]";

  return (
    <div
      className={`relative ${aspectClass} w-full bg-gradient-to-br from-[#5a6a70] via-[#4a5a60] to-[#3a4a50] ${
        embedded ? "" : "card card-hover"
      }`}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone">
          Gallery slot
        </span>
        <span className="mt-2 max-w-[85%] text-center text-xs font-medium uppercase tracking-wide text-muted-fg">
          {label}
        </span>
      </div>
    </div>
  );
}
