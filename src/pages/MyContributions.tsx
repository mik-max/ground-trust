import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { getVerificationStatus, type Residency, type TierProgress } from "../services/verification.service";
import { VerificationTierBadge } from "../components/VerificationTierBadge";
import { useGpsPresenceSample } from "../hooks/useGpsPresenceSample";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { buttonClassName } from "../components/ui/Button";
import { BackLink } from "../components/ui/BackLink";
import { text } from "../styles/typography";

function formatProgress(progress: TierProgress): string | null {
  if (!progress) return null;
  if (progress.toward === "tier1") {
    return `${progress.nightSamples} of ${progress.nightSamplesNeeded} confirmed night visits toward Verified resident`;
  }
  const daysLeft = Math.max(0, progress.daysNeeded - progress.daysConfirmed);
  return daysLeft === 0
    ? "Verification pending — check back soon"
    : `${daysLeft} more day${daysLeft === 1 ? "" : "s"} of confirmed residency to reach Long-term resident`;
}

// files/DESIGN_SYSTEM.md §6.6. Fires a best-effort background GPS sample
// for every area a resident has already engaged with — this is one of the
// two natural moments (alongside Submit Review) where the app checks
// device location per the onboarding consent screen's promise.
// A rating older than this gets a "has anything changed?" prompt: the
// resident's newest rating replaces their older one in the score.
const UPDATE_PROMPT_DAYS = 90;

function isOld(iso: string | null) {
  return iso !== null && Date.now() - new Date(iso).getTime() > UPDATE_PROMPT_DAYS * 24 * 60 * 60 * 1000;
}

export function MyContributions() {
  const [residencies, setResidencies] = useState<Residency[] | null>(null);
  useGpsPresenceSample(residencies?.map((r) => r.areaId) ?? []);

  useEffect(() => {
    getVerificationStatus().then(setResidencies);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <BackLink to="/" label="All areas" />
      <h1 className={text.displayMd}>My Contributions</h1>

      {residencies === null ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i}>
              <Card className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </Card>
            </li>
          ))}
        </ul>
      ) : residencies.length === 0 ? (
        <EmptyState
          illustration="home"
          title="You haven't rated an area yet"
          description="Start with where you live now. Your ratings and verification progress will show here."
          action={
            <Link to="/share" className={buttonClassName({ variant: "primary" })}>
              Talk about your environment
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {residencies.map((r) => {
            const isPending = r.area.status === "pending";
            return (
              <li key={r.areaId}>
                <Link to={`/areas/${r.areaId}`} className="block">
                  <Card className="flex flex-col gap-1 transition-shadow hover:shadow-raised">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-body-lg text-ink">{r.area.name}</span>
                      {isPending ? (
                        <span className="shrink-0 rounded-full bg-paper-2 px-2.5 py-1 text-caption text-mute">
                          Awaiting admin approval
                        </span>
                      ) : (
                        <VerificationTierBadge tier={r.verificationTier} />
                      )}
                    </div>
                    {isPending ? (
                      <p className="text-caption text-mute">
                        You proposed this area — it'll appear publicly once approved.
                      </p>
                    ) : (
                      formatProgress(r.progress) && (
                        <p className="text-caption text-mute">{formatProgress(r.progress)}</p>
                      )
                    )}
                  </Card>
                </Link>
                {!isPending && isOld(r.lastReviewedAt) && (
                  <Link
                    to={`/areas/${r.areaId}/review`}
                    className="mt-2 inline-flex items-center gap-1.5 px-1 text-caption text-brand underline"
                  >
                    <RefreshCw size={12} />
                    Has anything changed since your last rating? Update it
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
