import { Link } from "react-router-dom";
import type { AreaEvidenceStack } from "../types";
import { ScoreBandBadge } from "./ScoreBandBadge";
import { ASPECT_META, ASPECT_ORDER } from "./aspectMeta";
import { Card } from "./ui/Card";

interface AreaCardProps extends AreaEvidenceStack {
  // The single most-reviewed area on Home renders larger and more present
  // than the rest of the grid — visual hierarchy following data hierarchy,
  // instead of every card (a 15-resident area and a 1-resident cold-start
  // one) reading as equally weighted. Never more than one per grid.
  spotlight?: boolean;
}

// The Home page's actual structural departure from the old design: a
// browsable grid of areas rather than a stacked list of full Evidence
// Stacks. Each card is deliberately lighter than EvidenceStack — band,
// score, N, and which aspects have data at a glance (icons, not a full
// breakdown) — full detail lives one click away on Area Profile.
export function AreaCard({ area, overall, aspects, spotlight = false }: AreaCardProps) {
  return (
    <Link to={`/areas/${area.id}`} className={`block h-full ${spotlight ? "sm:col-span-2" : ""}`}>
      <Card
        padding={spotlight ? "lg" : "md"}
        elevation={spotlight ? "hero" : "card"}
        className="flex h-full flex-col gap-3 transition-shadow hover:shadow-raised"
      >
        {spotlight && (
          <span className="w-fit rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[1px] text-brand">
            Most reviewed
          </span>
        )}

        <div>
          <p className={spotlight ? "text-display-md text-ink" : "text-heading text-ink"}>{area.name}</p>
          <p className={spotlight ? "text-body text-mute" : "text-caption text-mute"}>
            {area.city}, {area.state}
          </p>
        </div>

        {overall.score === null ? (
          <p className="mt-auto text-body text-mute">Be the first to review this area</p>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <p className={`tabular-nums text-ink ${spotlight ? "text-data-xl" : "text-data-lg"}`}>
                {overall.score.toFixed(1)}
              </p>
              {overall.band && <ScoreBandBadge band={overall.band} size="sm" />}
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
