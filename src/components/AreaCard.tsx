import { Link } from "react-router-dom";
import type { AreaEvidenceStack } from "../types";
import { ScoreBandBadge } from "./ScoreBandBadge";
import { ASPECT_META, ASPECT_ORDER } from "./aspectMeta";
import { Card } from "./ui/Card";

// The Home page's actual structural departure from the old design: a
// browsable grid of areas rather than a stacked list of full Evidence
// Stacks. Each card is deliberately lighter than EvidenceStack — band,
// score, N, and which aspects have data at a glance (icons, not a full
// breakdown) — full detail lives one click away on Area Profile.
export function AreaCard({ area, overall, aspects }: AreaEvidenceStack) {
  return (
    <Link to={`/areas/${area.id}`} className="block h-full">
      <Card className="flex h-full flex-col gap-3 transition-shadow hover:shadow-raised">
        <div>
          <p className="text-heading text-ink">{area.name}</p>
          <p className="text-caption text-mute">
            {area.city}, {area.state}
          </p>
        </div>

        {overall.score === null ? (
          <p className="mt-auto text-body text-mute">Be the first to review this area</p>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <p className="text-data-lg tabular-nums text-ink">{overall.score.toFixed(1)}</p>
              {overall.band && <ScoreBandBadge band={overall.band} />}
            </div>
            <p className="text-caption text-mute">
              Based on {overall.N} verified resident{overall.N === 1 ? "" : "s"}
            </p>

            <div className="mt-auto flex gap-2 border-t border-line pt-3">
              {ASPECT_ORDER.map((a) => {
                const row = aspects.find((x) => x.aspect === a);
                const hasData = Boolean(row && row.N > 0);
                const Icon = ASPECT_META[a].icon;
                return (
                  <div
                    key={a}
                    title={ASPECT_META[a].label}
                    className={`flex h-8 w-8 items-center justify-center rounded-sm bg-paper-2 text-ink ${
                      hasData ? "" : "opacity-25"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </Link>
  );
}
