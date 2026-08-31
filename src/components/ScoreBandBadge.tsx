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
//
// `onDark` (Area Profile's hero, which sits on a brand-700 background):
// deliberately neutral (white on translucent white), not a band color —
// band-good's tinted green rendered on the brand-green hero would be
// exactly the brand-vs-band-green collision the palette was built to
// avoid. The word itself ("Good", "Poor") still carries the meaning
// without needing color here; every other render context keeps the
// color-coded version.
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
      className={`inline-flex items-center rounded-full font-bold uppercase ${SIZE_CLASS[size]} ${
        onDark ? "bg-white/15 text-white" : BAND_COLOR_CLASS[band]
      }`}
    >
      {BAND_LABEL[band]}
    </span>
  );
}
