import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AreaEvidenceStack } from "../types";
import { ScoreBandBadge } from "./ScoreBandBadge";
import { AspectRow } from "./AspectRow";
import { ConfidenceStrip } from "./ConfidenceStrip";
import { ASPECT_ORDER } from "./aspectMeta";
import { Card } from "./ui/Card";

interface EvidenceStackProps {
  overall: AreaEvidenceStack["overall"];
  aspects: AreaEvidenceStack["aspects"];
  size?: "compact" | "full";
}

// files/DESIGN_SYSTEM.md §5.2 — the signature component. Band -> figure ->
// contributor count -> aspect breakdown, always in that order, never
// collapsed to just the top line (the contributor count survives even in
// `compact` mode).
export function EvidenceStack({ overall, aspects, size = "full" }: EvidenceStackProps) {
  const [expanded, setExpanded] = useState(size === "full");
  const orderedAspects = ASPECT_ORDER.map((a) => aspects.find((x) => x.aspect === a)).filter(
    (a): a is AreaEvidenceStack["aspects"][number] => Boolean(a)
  );

  if (overall.score === null || overall.band === null) {
    return (
      <Card padding="lg">
        <p className="text-body-lg text-ink">Be the first to review this area</p>
        <p className="text-caption text-mute">No reviews yet — share your experience to get started.</p>
      </Card>
    );
  }

  return (
    <Card padding="lg" elevation={size === "full" ? "hero" : "card"}>
      <ScoreBandBadge band={overall.band} />
      <p
        className={`mt-2 tabular-nums text-ink ${size === "full" ? "text-data-xl" : "text-data-lg"}`}
      >
        {overall.score.toFixed(1)}
      </p>
      <p className="text-caption text-mute">
        Based on {overall.N} verified resident{overall.N === 1 ? "" : "s"}
      </p>

      <div className="mt-3">
        <ConfidenceStrip n={overall.N} />
      </div>

      <div className="my-4 border-t border-line" />

      {size === "compact" && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-fit items-center gap-1.5 text-body text-mute transition-colors hover:text-ink"
        >
          Show breakdown
          <ChevronDown size={16} />
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {orderedAspects.map((a) => (
            <AspectRow key={a.aspect} aspect={a.aspect} score={a.score} n={a.N} confidence={a.confidence} />
          ))}
        </div>
      )}
    </Card>
  );
}
