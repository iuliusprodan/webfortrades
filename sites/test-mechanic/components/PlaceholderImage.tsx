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
      className={`relative ${aspectClass} w-full bg-gradient-to-br from-[#3d4550] via-[#2a3038] to-[#1c2128] ${
        embedded ? "" : "card card-hover"
      }`}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <div className="ops-grid absolute inset-0 opacity-20" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-fg">
          Image slot
        </span>
        <span className="mt-2 max-w-[90%] text-center font-mono text-[10px] uppercase tracking-wider text-muted-fg">
          {label}
        </span>
      </div>
    </div>
  );
}
