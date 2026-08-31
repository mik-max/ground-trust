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

  // Full size (Area Profile only) gets a genuine two-tone hero — a dark
  // brand-700 zone for the band/score/N, a white zone for everything that
  // supports it. ConfidenceStrip deliberately stays in the white zone, not
  // the dark one: its "high confidence" color IS brand-700 (same token
  // reused), so on a brand-700 background the filled segments would
  // literally vanish into it.
  if (size === "full") {
    return (
      <Card padding="none" elevation="hero" className="overflow-hidden">
        <div className="bg-brand-700 px-8 py-8">
          <ScoreBandBadge band={overall.band} onDark />
          <p className="mt-2 text-data-xl tabular-nums text-white">{overall.score.toFixed(1)}</p>
          <p className="text-caption text-white/80">
            Based on {overall.N} verified resident{overall.N === 1 ? "" : "s"}
          </p>
        </div>

        <div className="px-8 py-6">
          <ConfidenceStrip n={overall.N} />
          <div className="my-4 border-t border-line" />
          <div className="flex flex-col gap-3">
            {orderedAspects.map((a) => (
              <AspectRow key={a.aspect} aspect={a.aspect} score={a.score} n={a.N} confidence={a.confidence} />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <ScoreBandBadge band={overall.band} />
      <p className="mt-2 text-data-lg tabular-nums text-ink">{overall.score.toFixed(1)}</p>
      <p className="text-caption text-mute">
        Based on {overall.N} verified resident{overall.N === 1 ? "" : "s"}
      </p>

      <div className="mt-3">
        <ConfidenceStrip n={overall.N} />
      </div>

      <div className="my-4 border-t border-line" />

      {!expanded ? (
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
