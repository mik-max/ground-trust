import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const FIELD_CLASS = "rounded-md border border-line px-4 py-3 text-body-lg";

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${FIELD_CLASS} ${className}`.trim()} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${FIELD_CLASS} min-h-24 ${className}`.trim()} {...props} />;
}
