const SEGMENTS = 10;

// files/DESIGN_SYSTEM.md §5.8 — makes the cold-start limitation visible: an
// area with 2 reviews must visibly look thinner than one with 80, not just
// say so in text.
export function ConfidenceStrip({ n, suggestedMin = 10 }: { n: number; suggestedMin?: number }) {
  const filled = Math.min(SEGMENTS, Math.round((n / suggestedMin) * SEGMENTS));

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < filled ? "bg-confidence-high" : "bg-confidence-low"}`}
          />
        ))}
      </div>
      <p className="text-caption text-mute">
        {n} of a suggested {suggestedMin}+ for high confidence
      </p>
    </div>
  );
}
