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

// files/DESIGN_SYSTEM.md §5.1 — label only, never the numeric score.
// Always render alongside a contributor count (see EvidenceStack).
export function ScoreBandBadge({ band }: { band: Band }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-eyebrow font-bold uppercase tracking-[2px] ${BAND_COLOR_CLASS[band]}`}
    >
      {BAND_LABEL[band]}
    </span>
  );
}
