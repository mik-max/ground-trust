import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SpotIllustration } from "./SpotIllustration";
import { text } from "../../styles/typography";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

// One reusable component instead of every page writing its own one-off
// "No X yet" sentence — used for Home's no-results, both admin queues, My
// Contributions before a first review, and Compare before adding areas.
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <SpotIllustration icon={icon} />
      <div className="flex flex-col gap-1">
        <p className={text.heading}>{title}</p>
        {description && <p className={`${text.body} max-w-sm text-mute`}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
