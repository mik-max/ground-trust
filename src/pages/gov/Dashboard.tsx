import { useEffect, useState } from "react";
import type { Flag } from "../../types";
import { listFlags } from "../../services/gov.service";
import { GovernmentFlagCard } from "../../components/GovernmentFlagCard";
import { BackLink } from "../../components/ui/BackLink";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { text } from "../../styles/typography";

// files/DESIGN_SYSTEM.md §6.7. Filter-by-aspect UI and drill-into-Area-Profile
// are deferred to a later pass; each flag can be acknowledged from its card.
export function GovDashboard() {
  const [flags, setFlags] = useState<Flag[] | null>(null);

  useEffect(() => {
    listFlags().then(setFlags);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <BackLink to="/" label="All areas" />
      <h1 className={text.displayMd}>Flagged areas</h1>

      {flags === null ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : flags.length === 0 ? (
        <EmptyState
          illustration="allClear"
          title="No areas flagged right now"
          description="An area appears here when verified residents rate a category poorly for four weeks running."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {flags.map((flag) => (
            <GovernmentFlagCard key={flag.id} flag={flag} />
          ))}
        </div>
      )}
    </div>
  );
}
