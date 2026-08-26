import type { HTMLAttributes } from "react";
import { text } from "../../styles/typography";

export function Eyebrow({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`${text.eyebrow} ${className}`.trim()} {...props} />;
}
