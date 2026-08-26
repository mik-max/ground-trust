// Centralized text style combos so a future design pass edits these once
// instead of hunting through every page. Apply to whatever tag is
// semantically correct at the call site — these are class strings, not
// components, so they don't force a fixed heading level.
//
// Headings/eyebrow/caption bake in a color because that pairing is constant
// everywhere they're used (ink for headings, mute for kickers/metadata).
// body/bodyLg deliberately stay color-agnostic — the same size is used for
// both primary (text-ink) and de-emphasized (text-mute) copy, so callers add
// the color utility explicitly.
export const text = {
  displayLg: "text-display-lg font-display font-bold text-ink",
  displayMd: "text-display-md font-display font-bold text-ink",
  heading: "text-heading font-display font-bold text-ink",
  bodyLg: "text-body-lg",
  body: "text-body",
  caption: "text-caption text-mute",
  eyebrow: "text-eyebrow font-bold uppercase tracking-[2px] text-mute",
} as const;
