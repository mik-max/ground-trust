import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVerificationStatus, type Residency, type TierProgress } from "../services/verification.service";
import { VerificationTierBadge } from "../components/VerificationTierBadge";
import { useGpsPresenceSample } from "../hooks/useGpsPresenceSample";
import { Card } from "../components/ui/Card";
import { BackLink } from "../components/ui/BackLink";
import { text } from "../styles/typography";

function formatProgress(progress: TierProgress): string | null {
  if (!progress) return null;
  if (progress.toward === "tier1") {
    return `${progress.nightSamples} of ${progress.nightSamplesNeeded} confirmed night visits toward Location-confirmed`;
  }
  const daysLeft = Math.max(0, progress.daysNeeded - progress.daysConfirmed);
  return daysLeft === 0
    ? "Verification pending — check back soon"
    : `${daysLeft} more day${daysLeft === 1 ? "" : "s"} of confirmed residency to reach Verified resident`;
}

// files/DESIGN_SYSTEM.md §6.6. Fires a best-effort background GPS sample
// for every area a resident has already engaged with — this is one of the
// two natural moments (alongside Submit Review) where the app checks
// device location per the onboarding consent screen's promise.
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
        <p className={`${text.body} text-mute`}>Loading...</p>
      ) : residencies.length === 0 ? (
        <p className={`${text.body} text-mute`}>You haven't reviewed any areas yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {residencies.map((r) => (
            <li key={r.areaId}>
              <Card className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Link to={`/areas/${r.areaId}`} className="text-body-lg text-ink">
                    {r.area.name}
                  </Link>
                  <VerificationTierBadge tier={r.verificationTier} />
                </div>
                {formatProgress(r.progress) && (
                  <p className="text-caption text-mute">{formatProgress(r.progress)}</p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
