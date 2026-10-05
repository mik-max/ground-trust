import { useLayoutEffect, useRef } from "react";

export const MAX_REVIEW_TEXT = 1000;

const PROMPTS = ["How often does light go off?", "Is the water supply steady?", "Does it flood when it rains?", "How safe is it at night?"];

// A writing surface rather than a bare box: grows with the text, offers a
// few prompts for people who aren't sure what to say, and shows a quiet
// character count near the limit.
export function ReviewTextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 360)}px`;
  }, [value]);

  function addPrompt(prompt: string) {
    const next = value.trim() ? `${value.trimEnd()}\n${prompt} ` : `${prompt} `;
    onChange(next.slice(0, MAX_REVIEW_TEXT));
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  const nearLimit = value.length > MAX_REVIEW_TEXT * 0.8;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-line bg-white transition-shadow focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/20">
        <label htmlFor="review-text" className="sr-only">
          Your comment
        </label>
        <textarea
          id="review-text"
          ref={ref}
          value={value}
          maxLength={MAX_REVIEW_TEXT}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="What's it like living here? Write in English, Yorùbá, Igbo, Hausa or Pidgin."
          className="block min-h-[132px] w-full resize-none rounded-md bg-transparent px-4 pb-2 pt-3.5 text-body-lg text-ink outline-none placeholder:text-mute focus-visible:outline-none"
        />
        <div className="flex items-center justify-between gap-3 px-4 pb-3 text-caption">
          <span className="text-mute">Optional. Don't include names or phone numbers.</span>
          <span className={`tabular-nums ${nearLimit ? "text-ink" : "text-faint"}`}>
            {value.length}/{MAX_REVIEW_TEXT}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Ideas to write about">
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => addPrompt(p)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-caption text-mute transition-colors hover:border-[#c9d0cb] hover:text-ink"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
