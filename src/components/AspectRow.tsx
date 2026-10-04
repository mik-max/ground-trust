import type { Aspect, ConfidenceLevel } from "../types";
import { AspectIconChip } from "./AspectIconChip";
import { ASPECT_META } from "./aspectMeta";

interface AspectRowProps {
  aspect: Aspect;
  score: number | null;
  n: number;
  confidence: ConfidenceLevel;
  /** Residents giving each rating 1-5; when given, a small spread chart is shown. */
  distribution?: number[];
}

// Residents are split when at least 4 rated and at least 30% gave 1-2 while
// at least 30% gave 4-5 — an average of 3 would hide that disagreement.
function isMixed(d: number[]) {
  const total = d.reduce((a, b) => a + b, 0);
  if (total < 4) return false;
  return (d[0] + d[1]) / total >= 0.3 && (d[3] + d[4]) / total >= 0.3;
}

function SpreadChart({ distribution }: { distribution: number[] }) {
  const max = Math.max(1, ...distribution);
  const title = distribution.map((c, i) => `${i + 1}★: ${c}`).join(", ");
  return (
    <span className="flex h-5 w-9 shrink-0 items-end gap-[2px]" title={`Ratings given — ${title}`} aria-label={`Ratings given — ${title}`}>
      {distribution.map((c, i) => (
        <span key={i} className="w-[5px] rounded-sm bg-mute/60" style={{ height: `${Math.max(2, (c / max) * 20)}px` }} />
      ))}
    </span>
  );
}

// files/DESIGN_SYSTEM.md §5.3. The bar color alone carries the
// low-confidence signal (bg-confidence-low vs. -high) — a separate info
// icon that only appeared on some rows used to make the row's right edge
// jump around, so it's gone; the color-coding already satisfies "low
// confidence must look visually distinct" without it. N is spelled out
// ("N residents") instead of a bare "(N)" so it doesn't read as some
// unexplained second number next to the score.
export function AspectRow({ aspect, score, n, confidence, distribution }: AspectRowProps) {
  const label = ASPECT_META[aspect].label;
  const lowConfidence = confidence === "low";
  const fillPercent = score !== null ? Math.max(0, Math.min(100, (score / 5) * 100)) : 0;

  return (
    <div className="flex items-center gap-3">
      <AspectIconChip aspect={aspect} />
      <span className="flex w-32 shrink-0 flex-col text-body">
        {label}
        {distribution && isMixed(distribution) && <span className="text-caption text-amber">Mixed views</span>}
      </span>
      <div className="h-2 flex-1 rounded-full bg-paper-2">
        <div
          className={`h-2 rounded-full ${lowConfidence ? "bg-confidence-low" : "bg-confidence-high"}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-data-md tabular-nums text-ink">
        {score !== null ? score.toFixed(1) : "—"}
      </span>
      {distribution && <SpreadChart distribution={distribution} />}
      <span className="w-24 shrink-0 text-caption text-mute">
        {n} {n === 1 ? "resident" : "residents"}
      </span>
    </div>
  );
}
