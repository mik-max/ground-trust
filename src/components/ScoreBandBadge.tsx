import type { Band } from "../types";

export const BAND_LABEL: Record<Band, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export const BAND_DOT_CLASS: Record<Band, string> = {
  excellent: "bg-band-excellent",
  good: "bg-band-good",
  fair: "bg-band-fair",
  poor: "bg-band-poor",
};

const SIZE_CLASS = {
  md: "gap-2 px-3 py-1.5 text-body",
  sm: "gap-1.5 px-2.5 py-1 text-caption",
} as const;

// Label only, never the numeric score; always render alongside a
// contributor count (see EvidenceStack). A colored dot plus the word —
// never color alone — on a neutral pill, so it sits calmly on any surface
// (white cards, photos, the dark score header via `onDark`).
export function ScoreBandBadge({
  band,
  size = "md",
  onDark = false,
}: {
  band: Band;
  size?: keyof typeof SIZE_CLASS;
  onDark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${SIZE_CLASS[size]} ${
        onDark ? "bg-white/12 text-white" : "border border-line bg-white text-ink"
      }`}
    >
      <i className={`inline-block h-2 w-2 rounded-full ${BAND_DOT_CLASS[band]}`} aria-hidden="true" />
      {BAND_LABEL[band]}
    </span>
  );
}
