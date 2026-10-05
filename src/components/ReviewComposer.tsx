import { useState } from "react";
import { Keyboard, Mic, Star } from "lucide-react";
import type { Aspect } from "../types";
import { ASPECT_ORDER, ASPECT_META } from "./aspectMeta";
import { AspectIconChip } from "./AspectIconChip";
import { uploadAudio } from "../services/upload.service";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { VoiceInput } from "./review/VoiceInput";
import { ReviewTextInput } from "./review/TextInput";

export interface ReviewInput {
  originalText?: string;
  originalAudioRef?: string;
  ratings: Partial<Record<Aspect, number>>;
}

interface ReviewComposerProps {
  // Decoupled from a specific area/endpoint — SubmitReview posts straight to
  // an existing area, ProposeArea bundles it into a new-area proposal
  // instead. This component only collects the input.
  onSubmit: (input: ReviewInput) => Promise<void>;
  onSubmitted?: () => void;
  submitLabel?: string;
}

// files/DESIGN_SYSTEM.md §5.6. An optional comment, spoken (VoiceInput) or
// typed (ReviewTextInput), then the per-aspect ratings.
export function ReviewComposer({ onSubmit, onSubmitted, submitLabel }: ReviewComposerProps) {
  const [activeTab, setActiveTab] = useState<"voice" | "text">("voice");
  const [reviewText, setReviewText] = useState("");
  const [ratings, setRatings] = useState<Partial<Record<Aspect, number>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorder = useAudioRecorder();

  const ratedCount = ASPECT_ORDER.filter((a) => ratings[a]).length;
  const hasRating = ratedCount > 0;
  const recording = recorder.status === "recording" || recorder.status === "requesting";

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      let originalAudioRef: string | undefined;
      if (recorder.audioBlob) {
        originalAudioRef = await uploadAudio(recorder.audioBlob);
      }
      await onSubmit({ originalText: reviewText || undefined, originalAudioRef, ratings });
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't submit your review — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card padding="lg" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-body-lg font-medium text-ink">Tell us about it</p>
            <p className="text-caption text-mute">Optional, but it helps the next person.</p>
          </div>
          <div role="tablist" aria-label="How you'd like to share" className="inline-flex rounded-full bg-paper-2 p-1">
            {(
              [
                ["voice", "Speak", Mic],
                ["text", "Type", Keyboard],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-body transition-all ${
                  activeTab === key ? "bg-white font-medium text-ink shadow-[0_1px_3px_rgba(17,23,21,.12)]" : "text-mute hover:text-ink"
                }`}
              >
                <Icon size={15} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "voice" ? (
          <VoiceInput recorder={recorder} />
        ) : (
          <ReviewTextInput value={reviewText} onChange={setReviewText} />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-body font-medium text-ink">Rate each aspect</span>
          <span className="text-caption text-mute">{ratedCount} of {ASPECT_ORDER.length} rated</span>
        </div>
        {ASPECT_ORDER.map((aspect) => (
          <div key={aspect} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AspectIconChip aspect={aspect} />
              <span className="text-body text-ink">{ASPECT_META[aspect].label}</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRatings((r) => ({ ...r, [aspect]: value }))}
                  aria-label={`Rate ${ASPECT_META[aspect].label} ${value} out of 5`}
                >
                  <Star
                    size={22}
                    className={(ratings[aspect] ?? 0) >= value ? "fill-ink text-ink" : "text-[#c9d0cb]"}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-caption text-band-poor">{error}</p>}

      <Button type="button" disabled={!hasRating || submitting || recording} onClick={handleSubmit}>
        {submitting
          ? "Sharing..."
          : recording
            ? "Stop recording to continue"
            : hasRating
            ? (submitLabel ?? "Share your experience")
            : "Rate at least one aspect to continue"}
      </Button>
    </Card>
  );
}
