const SIZE_CLASS = {
  md: "px-3 py-1.5 text-body",
  sm: "px-2.5 py-1 text-caption",
  xs: "px-2 py-0.5 text-caption",
} as const;

// Marks ratings that come from seeded demonstration accounts (User.isDemo),
// so the working product can be shown without anyone mistaking sample
// ratings for real residents'. Same pill shape as ScoreBandBadge, with a
// dashed outline so it reads as a note about the data, not a rating.
export function DemoBadge({ size = "sm", onDark = false }: { size?: keyof typeof SIZE_CLASS; onDark?: boolean }) {
  return (
    <span
      title="Sample ratings from demonstration accounts, not real residents"
      className={`inline-flex shrink-0 items-center rounded-full border border-dashed font-medium ${SIZE_CLASS[size]} ${
        onDark ? "border-white/40 text-white/85" : "border-faint bg-white text-mute"
      }`}
    >
      Demo data
    </span>
  );
}
