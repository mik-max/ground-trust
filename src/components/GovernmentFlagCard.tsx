import type { Flag } from "../types";
import { ASPECT_META } from "./aspectMeta";
import { Card } from "./ui/Card";
import { text } from "../styles/typography";

// files/DESIGN_SYSTEM.md §5.7 — read-only, no action buttons (the dashboard
// is monitoring-only, not case management).
export function GovernmentFlagCard({ flag }: { flag: Flag }) {
  return (
    <Card border="accent">
      <p className={text.heading}>{flag.area?.name ?? "Unknown area"}</p>
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
    </Card>
  );
}
