import type { HTMLAttributes } from "react";

// "none" is for a card composed of multiple internally-padded zones (e.g.
// EvidenceStack's score header and breakdown) rather than one uniform
// surface — the zones own their own padding instead.
const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

// Same-specificity Tailwind utilities (e.g. two border-color classes) race on
// generation order, not className/JSX order — so border treatment is a fixed
// variant, not something callers bolt on via className. Cards are white on
// the off-white canvas with a hairline border; "accent" adds a single
// categorization edge on the left.
const BORDER = {
  default: "border border-line",
  accent: "border border-line border-l-4 border-l-amber",
} as const;

// "hero" is for the single spotlight surface per screen; it lifts with a
// soft shadow instead of only a border.
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
