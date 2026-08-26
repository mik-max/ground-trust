import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVerificationStatus, type Residency } from "../services/verification.service";
import { VerificationTierBadge } from "../components/VerificationTierBadge";
import { Card } from "../components/ui/Card";
import { text } from "../styles/typography";

// files/DESIGN_SYSTEM.md §6.6. Every residency will show tier0 until GPS
// sampling exists (files/HANDOFF.md §2.1) — deferred to a later pass.
export function MyContributions() {
  const [residencies, setResidencies] = useState<Residency[] | null>(null);

  useEffect(() => {
    getVerificationStatus().then(setResidencies);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className={text.displayMd}>My Contributions</h1>

      {residencies === null ? (
        <p className={`${text.body} text-mute`}>Loading...</p>
      ) : residencies.length === 0 ? (
        <p className={`${text.body} text-mute`}>You haven't reviewed any areas yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {residencies.map((r) => (
            <li key={r.areaId}>
              <Card className="flex items-center justify-between">
                <Link to={`/areas/${r.areaId}`} className="text-body-lg text-ink">
                  {r.area.name}
                </Link>
                <VerificationTierBadge tier={r.verificationTier} />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
