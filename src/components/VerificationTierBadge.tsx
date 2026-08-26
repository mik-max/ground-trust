import { Shield, ShieldCheck } from "lucide-react";
import type { VerificationTier } from "../types";

// files/DESIGN_SYSTEM.md §5.5 / GroundTruth §3.5 — visualizes the
// trust-weighting mechanism; not decorative, it's the reason a reader
// should weight one review over another.
export function VerificationTierBadge({ tier }: { tier: VerificationTier }) {
  if (tier === "tier2" || tier === "tier3") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-steel/[15%] px-2.5 py-1 text-caption text-steel">
        <ShieldCheck size={14} />
        Verified resident
      </span>
    );
  }
  if (tier === "tier1") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky/[15%] px-2.5 py-1 text-caption text-sky">
        <Shield size={14} />
        Location-confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-caption text-mute">
      Registered
    </span>
  );
}
