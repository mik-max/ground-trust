import type { ReactNode } from "react";
import { SpotIllustration, type IllustrationName } from "./SpotIllustration";
import { text } from "../../styles/typography";

interface EmptyStateProps {
  illustration: IllustrationName;
  title: string;
  description?: string;
  action?: ReactNode;
  /** "page" for a whole empty screen; "inline" for an empty section inside a page. */
  size?: "page" | "inline";
}

// One reusable component instead of every page writing its own one-off
// "No X yet" sentence. Every empty state says what happens next, not just
// that there's nothing here.
export function EmptyState({ illustration, title, description, action, size = "page" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-lg bg-paper-2/60 text-center ${
        size === "page" ? "px-6 py-16" : "px-5 py-10"
      }`}
    >
      <SpotIllustration name={illustration} className="bg-white" />
      <div className="flex flex-col items-center gap-1">
        <p className={text.heading}>{title}</p>
        {description && <p className={`${text.body} max-w-sm text-mute`}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
