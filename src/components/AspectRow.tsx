import type { Aspect, ConfidenceLevel } from "../types";
import { AspectIconChip } from "./AspectIconChip";
import { ASPECT_META } from "./aspectMeta";

interface AspectRowProps {
  aspect: Aspect;
  score: number | null;
  n: number;
  confidence: ConfidenceLevel;
  /** Residents giving each rating 1-5; used to show "Mixed views" when residents are split. */
  distribution?: number[];
  trend?: "improving" | "declining" | null;
}

// Residents are split when at least 4 rated and at least 30% gave 1-2 while
// at least 30% gave 4-5 — an average of 3 would hide that disagreement.
function isMixed(d: number[]) {
  const total = d.reduce((a, b) => a + b, 0);
  if (total < 4) return false;
  return (d[0] + d[1]) / total >= 0.3 && (d[3] + d[4]) / total >= 0.3;
}


// files/DESIGN_SYSTEM.md §5.3. The bar color alone carries the
// low-confidence signal (bg-confidence-low vs. -high) — a separate info
// icon that only appeared on some rows used to make the row's right edge
// jump around, so it's gone; the color-coding already satisfies "low
// confidence must look visually distinct" without it. N is spelled out
// ("N residents") instead of a bare "(N)" so it doesn't read as some
// unexplained second number next to the score.
export function AspectRow({ aspect, score, n, confidence, distribution, trend }: AspectRowProps) {
  const label = ASPECT_META[aspect].label;
  const lowConfidence = confidence === "low";
  const fillPercent = score !== null ? Math.max(0, Math.min(100, (score / 5) * 100)) : 0;

  return (
    <div className="flex items-center gap-3">
      <AspectIconChip aspect={aspect} />
      <span className="flex min-w-0 flex-1 flex-col text-body sm:w-32 sm:flex-none sm:shrink-0">
        {label}
        <span className="text-caption text-mute sm:hidden">
          {n} {n === 1 ? "resident" : "residents"}
        </span>
        {trend === "improving" && <span className="text-caption text-band-good">Improving recently</span>}
        {trend === "declining" && <span className="text-caption text-band-poor">Getting worse recently</span>}
        {distribution && isMixed(distribution) && <span className="text-caption text-amber">Mixed views</span>}
      </span>
      {/* Hidden on phones, where the score and spread chart already carry it and the row would overflow. */}
      <div className="hidden h-2 flex-1 rounded-full bg-paper-2 sm:block">
        <div
          className={`h-2 rounded-full ${lowConfidence ? "bg-confidence-low" : "bg-confidence-high"}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-data-md tabular-nums text-ink">
        {score !== null ? score.toFixed(1) : "—"}
      </span>
      <span className="hidden w-24 shrink-0 text-caption text-mute sm:block">
        {n} {n === 1 ? "resident" : "residents"}
      </span>
    </div>
  );
}
