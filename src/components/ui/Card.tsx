import type { HTMLAttributes } from "react";

// "none" is for a card composed of multiple internally-padded zones (e.g.
// EvidenceStack's two-tone hero, dark top / white bottom) rather than one
// uniform surface — the zones own their own padding instead.
const PADDING = {
  none: "",
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

// "hero" is deliberately not the default — it's for the single spotlight
// moment per screen (Home's most-reviewed area). If every card used it,
// nothing would read as elevated anymore.
const ELEVATION = {
  card: "shadow-card",
  hero: "shadow-hero",
} as const;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof PADDING;
  border?: keyof typeof BORDER;
  elevation?: keyof typeof ELEVATION;
}

// Base surface used by Evidence Stack, review items, info cards, contribution
// rows, etc. A future design pass (different radius/elevation/fill) only
// edits this one component. `className` is for layout additions (flex,
// justify-between, ...), not for overriding radius/border/shadow/fill.
export function Card({ padding = "md", border = "default", elevation = "card", className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-white ${ELEVATION[elevation]} ${BORDER[border]} ${PADDING[padding]} ${className}`.trim()}
      {...props}
    />
  );
}
