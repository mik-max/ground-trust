import type { Flag } from "../types";
import { ASPECT_META } from "./aspectMeta";

// files/DESIGN_SYSTEM.md §5.7 — read-only, no action buttons (the dashboard
// is monitoring-only, not case management).
export function GovernmentFlagCard({ flag }: { flag: Flag }) {
  return (
    <div className="rounded-md border-l-4 border-amber bg-white p-4 shadow-card">
      <p className="text-heading font-display font-bold text-ink">{flag.area?.name ?? "Unknown area"}</p>
      <p className="text-body text-mute">
        {flag.area?.city}, {flag.area?.state}
      </p>
      <p className="mt-2 text-body text-ink">
        Flagged aspect: <span className="font-bold">{ASPECT_META[flag.aspect].label}</span>
      </p>
      <p className="text-caption text-mute">
        Below threshold for {flag.consecutiveWeeksBelowThreshold} consecutive week
        {flag.consecutiveWeeksBelowThreshold === 1 ? "" : "s"}
      </p>
    </div>
  );
}
