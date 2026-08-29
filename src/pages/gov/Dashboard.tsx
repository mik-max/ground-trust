import { useEffect, useState } from "react";
import type { Flag } from "../../types";
import { listFlags } from "../../services/gov.service";
import { GovernmentFlagCard } from "../../components/GovernmentFlagCard";
import { BackLink } from "../../components/ui/BackLink";
import { text } from "../../styles/typography";

// files/DESIGN_SYSTEM.md §6.7. Filter-by-aspect UI and drill-into-Area-Profile
// are deferred to a later pass; this shows the read-only flag list.
export function GovDashboard() {
  const [flags, setFlags] = useState<Flag[] | null>(null);

  useEffect(() => {
    listFlags().then(setFlags);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <BackLink to="/" label="All areas" />
      <h1 className={text.displayMd}>Flagged Areas</h1>

      {flags === null ? (
        <p className={`${text.body} text-mute`}>Loading...</p>
      ) : flags.length === 0 ? (
        <p className={`${text.body} text-mute`}>No areas currently meet the flagging threshold.</p>
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
