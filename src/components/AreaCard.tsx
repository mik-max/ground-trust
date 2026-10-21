import { Link } from "react-router-dom";
import type { AreaEvidenceStack, ConfidenceLevel } from "../types";
import { ScoreBandBadge } from "./ScoreBandBadge";
import { ASPECT_META, ASPECT_ORDER } from "./aspectMeta";
import { AspectIcon } from "./AspectIconChip";
import { ILLUSTRATIONS } from "./ui/SpotIllustration";
import { buttonClassName } from "./ui/Button";

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};
const CONFIDENCE_STEPS: Record<ConfidenceLevel, number> = { low: 1, medium: 2, high: 3 };

// A browsable card per area: photo (or a calm placeholder), band, overall
// score, each aspect's score with its icon, and who stands behind the
// numbers. Full detail lives one click away on Area Profile. An area with
// no ratings yet says so and invites the first one, rather than showing
// empty numbers.
export function AreaCard({ area, overall, aspects, photo: cover }: AreaEvidenceStack) {
  const photo = cover?.card ?? null;
  const place = area.lga ?? area.city;
  const unrated = overall.score === null;

  return (
    <Link
      to={`/areas/${area.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-raised"
    >
      <div
        className="relative flex aspect-[16/10] items-center justify-center bg-paper-2 bg-cover bg-center"
        style={photo ? { backgroundImage: `url(${photo})` } : undefined}
      >
        {!photo && <img src={ILLUSTRATIONS.location} alt="" className="h-14 w-14 opacity-80" />}
        {overall.band && (
          <span className="absolute left-3 top-3">
            <ScoreBandBadge band={overall.band} size="sm" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[22px] font-medium tracking-[-0.03em] text-ink">{area.name}</h3>
            <p className="text-caption text-mute">{place}</p>
          </div>
          <p className="shrink-0 text-data-lg font-normal tracking-[-0.04em] tabular-nums text-ink">
            {unrated ? <span className="text-faint">–</span> : overall.score!.toFixed(1)}
            {!unrated && <span className="text-body tracking-normal text-faint"> / 5</span>}
          </p>
        </div>

        {unrated ? (
          <>
            <p className="text-body text-mute">No ratings yet. Live here? Be the first to say what it's like.</p>
            <span className={buttonClassName({ variant: "primary" }, "mt-auto w-fit px-5! py-2.5! text-body!")}>
              Rate this area
            </span>
          </>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-1.5">
              {ASPECT_ORDER.map((a) => {
                const row = aspects.find((x) => x.aspect === a);
                const score = row && row.N > 0 ? row.score : null;
                return (
                  <div
                    key={a}
                    title={`${ASPECT_META[a].label}${score === null ? ": not rated yet" : ""}`}
                    className="flex flex-col items-center gap-1.5 rounded-sm bg-paper-2 px-0.5 pb-2 pt-2.5"
                  >
                    <AspectIcon aspect={a} size={26} />
                    <span
                      className={`text-body font-medium tabular-nums ${
                        score === null ? "text-faint" : score < 2 ? "text-band-poor" : "text-ink"
                      }`}
                    >
                      {score === null ? "–" : score.toFixed(1)}
                    </span>
                    <span className="sr-only">{ASPECT_META[a].label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 text-caption text-mute">
              <span>
                {overall.N} resident{overall.N === 1 ? "" : "s"} · {CONFIDENCE_LABEL[overall.confidence]}
              </span>
              <span className="flex gap-[3px]" aria-hidden="true">
                {[1, 2, 3].map((i) => (
                  <i
                    key={i}
                    className={`h-[5px] w-3.5 rounded-full ${
                      i <= CONFIDENCE_STEPS[overall.confidence] ? "bg-brand" : "bg-line"
                    }`}
                  />
                ))}
              </span>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
