import type { Aspect, ConfidenceLevel } from "../types";
import { AspectIconChip } from "./AspectIconChip";
import { ASPECT_META } from "./aspectMeta";

interface AspectRowProps {
  aspect: Aspect;
  score: number | null;
  n: number;
  confidence: ConfidenceLevel;
}

// files/DESIGN_SYSTEM.md §5.3. The bar color alone carries the
// low-confidence signal (bg-confidence-low vs. -high) — a separate info
// icon that only appeared on some rows used to make the row's right edge
// jump around, so it's gone; the color-coding already satisfies "low
// confidence must look visually distinct" without it. N is spelled out
// ("N residents") instead of a bare "(N)" so it doesn't read as some
// unexplained second number next to the score.
export function AspectRow({ aspect, score, n, confidence }: AspectRowProps) {
  const label = ASPECT_META[aspect].label;
  const lowConfidence = confidence === "low";
  const fillPercent = score !== null ? Math.max(0, Math.min(100, (score / 5) * 100)) : 0;

  return (
    <div className="flex items-center gap-3">
      <AspectIconChip aspect={aspect} />
      <span className="w-32 shrink-0 text-body">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-paper-2">
        <div
          className={`h-2 rounded-full ${lowConfidence ? "bg-confidence-low" : "bg-confidence-high"}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-data-md tabular-nums text-ink">
        {score !== null ? score.toFixed(1) : "—"}
      </span>
      <span className="w-24 shrink-0 text-caption text-mute">
        {n} {n === 1 ? "resident" : "residents"}
      </span>
    </div>
  );
}
