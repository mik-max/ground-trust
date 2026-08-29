import type { HTMLAttributes } from "react";

const PADDING = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

// Same-specificity Tailwind utilities (e.g. two border-color classes) race on
// generation order, not className/JSX order — so border treatment is a fixed
// variant, not something callers bolt on via className. Cards carry elevation
// through shadow alone (default has no border — a border AND a shadow doing
// the same "this is a distinct surface" job is redundant); "accent" adds a
// single categorization edge, a different job from elevation, so it can
// coexist with the shadow.
const BORDER = {
  default: "",
  accent: "border-l-4 border-amber",
} as const;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof PADDING;
  border?: keyof typeof BORDER;
}

// Base surface used by Evidence Stack, review items, info cards, contribution
// rows, etc. A future design pass (different radius/elevation/fill) only
// edits this one component. `className` is for layout additions (flex,
// justify-between, ...), not for overriding radius/border/shadow/fill.
export function Card({ padding = "md", border = "default", className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-white shadow-card ${BORDER[border]} ${PADDING[padding]} ${className}`.trim()}
      {...props}
    />
  );
}
