// Centralized text style combos so a future design pass edits these once
// instead of hunting through every page. Apply to whatever tag is
// semantically correct at the call site — these are class strings, not
// components, so they don't force a fixed heading level.
//
// Headings use a medium weight with tight tracking (the calm redesign's
// voice) rather than bold. body/bodyLg deliberately stay color-agnostic —
// the same size is used for both primary (text-ink) and de-emphasized
// (text-mute) copy, so callers add the color utility explicitly.
export const text = {
  displayXl: "text-[clamp(40px,6.4vw,76px)] leading-[1.02] font-display font-medium tracking-[-0.035em] text-ink text-balance",
  displayLg: "text-[clamp(30px,3.8vw,44px)] leading-[1.08] font-display font-medium tracking-[-0.035em] text-ink text-balance",
  displayMd: "text-display-md font-display font-medium tracking-[-0.03em] text-ink",
  heading: "text-heading font-display font-medium tracking-[-0.02em] text-ink",
  bodyLg: "text-body-lg",
  body: "text-body",
  caption: "text-caption text-mute",
  eyebrow: "text-eyebrow font-medium uppercase tracking-[0.14em] text-mute",
} as const;
