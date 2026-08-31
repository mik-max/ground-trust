import type { Band } from "../types";

const BAND_LABEL: Record<Band, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

const BAND_COLOR_CLASS: Record<Band, string> = {
  excellent: "bg-band-excellent/[12%] text-band-excellent",
  good: "bg-band-good/[12%] text-band-good",
  fair: "bg-band-fair/[12%] text-band-fair",
  poor: "bg-band-poor/[12%] text-band-poor",
};

// "sm" is for dense card contexts (AreaCard) where the default --text-eyebrow
// size reads as too heavy next to a compact score — not a global change, since
// the default size is correct on Area Profile's hero and Compare Areas.
const SIZE_CLASS = {
  md: "px-3 py-1 text-eyebrow tracking-[2px]",
  sm: "px-2 py-0.5 text-[10px] tracking-[1px]",
} as const;

// files/DESIGN_SYSTEM.md §5.1 — label only, never the numeric score.
// Always render alongside a contributor count (see EvidenceStack).
export function ScoreBandBadge({ band, size = "md" }: { band: Band; size?: keyof typeof SIZE_CLASS }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase ${SIZE_CLASS[size]} ${BAND_COLOR_CLASS[band]}`}
    >
      {BAND_LABEL[band]}
    </span>
  );
}
