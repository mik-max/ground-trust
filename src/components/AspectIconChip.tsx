import type { Aspect } from "../types";
import { ASPECT_META } from "./aspectMeta";

// files/DESIGN_SYSTEM.md §5.4 — one fixed icon per aspect, never varies.
export function AspectIconChip({ aspect }: { aspect: Aspect }) {
  const Icon = ASPECT_META[aspect].icon;
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-paper-2">
      <Icon size={20} className="text-ink" />
    </div>
  );
}
