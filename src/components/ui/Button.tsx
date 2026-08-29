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
export function buttonClassName({ variant = "primary", active = false }: ButtonStyleProps = {}, className = "") {
  const base = {
    primary: "rounded-lg bg-brand px-6 py-3 text-body-lg text-white transition-colors hover:bg-brand-700 disabled:opacity-40",
    outline: `rounded-lg border px-4 py-2 text-body transition-colors ${
      active ? "border-brand bg-brand text-white" : "border-line text-ink"
    }`,
    // No baked-in text size — "link" is used at both body and caption size
    // depending on context, and those are same-property Tailwind utilities
    // that would race on generation order if both were appended. Callers
    // supply the size via className (e.g. "text-body" or "text-caption").
    link: "text-brand underline",
    tab: `px-4 py-2 text-body border-b-2 ${active ? "border-brand text-brand" : "border-transparent text-mute"}`,
  }[variant];

  return `${base} ${className}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {}

export function Button({ variant = "primary", active = false, className = "", ...props }: ButtonProps) {
  return <button className={buttonClassName({ variant, active }, className)} {...props} />;
}
