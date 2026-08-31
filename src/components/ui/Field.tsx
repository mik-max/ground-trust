import type { ReactNode } from "react";
import { text } from "../../styles/typography";

// A visible label above the input, not just a placeholder — placeholders
// disappear the moment someone starts typing, so a returning user glancing
// at a half-filled form loses the field's meaning. Used by the auth pages;
// TextInput itself stays label-less for places (e.g. search bars) where a
// placeholder is genuinely enough.
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={`${text.body} font-medium text-ink`}>{label}</span>
      {children}
    </label>
  );
}
