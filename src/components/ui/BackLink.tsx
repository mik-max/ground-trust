import { ArrowLeft } from "lucide-react";
import { Link, type To } from "react-router-dom";

// Every page below the top level gets one of these — the app had no way
// back besides the browser's own button, which breaks the moment someone
// lands on a deep link directly. `to` is an explicit route rather than
// history.back(), since a direct link has no history to go back to.
export function BackLink({ to, label = "Back" }: { to: To; label?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex w-fit items-center gap-1.5 text-body text-mute transition-colors hover:text-ink"
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}
