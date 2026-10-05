import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "outline" | "link" | "tab";

interface ButtonStyleProps {
  variant?: ButtonVariant;
  /** For "outline"/"tab": whether this option is the selected one. */
  active?: boolean;
}

// Every button look in the product lives here — a future design pass edits
// this function once instead of hunting through every page's className
// strings. Exported separately from <Button> so a non-<button> element (a
// react-router <Link> styled as a CTA) can share the exact same look.
// Calm redesign: pill-shaped, a near-black primary and a hairline outline;
// the eucalyptus accent is kept for selected state and links.
export function buttonClassName({ variant = "primary", active = false }: ButtonStyleProps = {}, className = "") {
  const base = {
    primary:
      "inline-flex items-center justify-center gap-2 rounded-full bg-night px-6 py-3 text-body-lg font-medium text-white transition-colors hover:bg-[#26302c] disabled:opacity-40",
    outline: `inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-body font-medium transition-colors ${
      active ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-[#c9d0cb]"
    }`,
    // No baked-in text size — "link" is used at both body and caption size
    // depending on context, and those are same-property Tailwind utilities
    // that would race on generation order if both were appended. Callers
    // supply the size via className (e.g. "text-body" or "text-caption").
    link: "text-brand underline underline-offset-4",
    tab: `px-4 py-2 text-body border-b-2 ${active ? "border-brand text-ink" : "border-transparent text-mute"}`,
  }[variant];

  return `${base} ${className}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {}

export function Button({ variant = "primary", active = false, className = "", ...props }: ButtonProps) {
  return <button className={buttonClassName({ variant, active }, className)} {...props} />;
}
