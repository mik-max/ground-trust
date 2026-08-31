import { useState } from "react";
import { Mic, RotateCcw, Square, Star } from "lucide-react";
import type { Aspect } from "../types";
import { ASPECT_ORDER, ASPECT_META } from "./aspectMeta";
import { AspectIconChip } from "./AspectIconChip";
import { uploadAudio } from "../services/upload.service";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Textarea } from "./ui/TextInput";

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

// files/DESIGN_SYSTEM.md §5.6. Recording + upload is wired (this pass);
// transcription/translation isn't — the NLP pipeline (files/HANDOFF.md §3)
// is still on BACKLOG.md, so a voice review is stored and playable but not
// yet turned into text.
export function ReviewComposer({ onSubmit, onSubmitted, submitLabel }: ReviewComposerProps) {
  const [activeTab, setActiveTab] = useState<"voice" | "text">("voice");
  const [reviewText, setReviewText] = useState("");
  const [ratings, setRatings] = useState<Partial<Record<Aspect, number>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorder = useAudioRecorder();

  const ratedCount = ASPECT_ORDER.filter((a) => ratings[a]).length;
  const allRated = ratedCount === ASPECT_ORDER.length;

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
      <div className="flex gap-2 border-b border-line">
        <Button type="button" variant="tab" active={activeTab === "voice"} onClick={() => setActiveTab("voice")}>
          Voice
        </Button>
        <Button type="button" variant="tab" active={activeTab === "text"} onClick={() => setActiveTab("text")}>
          Text
        </Button>
      </div>

      {activeTab === "voice" ? (
        <div className="flex flex-col items-center gap-3 py-6">
          {recorder.status === "recorded" && recorder.audioUrl ? (
            <>
              <audio controls src={recorder.audioUrl} className="w-full max-w-sm" />
              <Button type="button" variant="outline" onClick={recorder.reset} className="flex items-center gap-2">
                <RotateCcw size={16} />
                Re-record
              </Button>
            </>
          ) : (
            <>
              <div className="relative flex h-16 w-16 items-center justify-center">
                {recorder.status === "recording" && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-band-poor/40" />
                )}
                <button
                  type="button"
                  onClick={recorder.status === "recording" ? recorder.stop : recorder.start}
                  disabled={recorder.status === "requesting"}
                  aria-label={recorder.status === "recording" ? "Stop recording" : "Start recording your review"}
                  aria-pressed={recorder.status === "recording"}
                  className={`relative flex h-16 w-16 items-center justify-center rounded-full text-white disabled:opacity-50 ${
                    recorder.status === "recording" ? "bg-band-poor" : "bg-brand"
                  }`}
                >
                  {recorder.status === "recording" ? <Square size={24} /> : <Mic size={28} />}
                </button>
              </div>
              <p className="text-caption text-mute">
                {recorder.status === "recording"
                  ? "Recording — tap to stop"
                  : recorder.status === "requesting"
                    ? "Requesting microphone access..."
                    : "Tap to record your review"}
              </p>
            </>
          )}
          {recorder.errorMessage && <p className="text-caption text-band-poor">{recorder.errorMessage}</p>}
        </div>
      ) : (
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share what it's like living here (optional)..."
        />
      )}

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
                    className={(ratings[aspect] ?? 0) >= value ? "fill-amber text-amber" : "text-line"}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-caption text-band-poor">{error}</p>}

      <Button type="button" disabled={!allRated || submitting} onClick={handleSubmit}>
        {submitting
          ? "Sharing..."
          : allRated
            ? (submitLabel ?? "Share your experience")
            : `Rate all ${ASPECT_ORDER.length} aspects to continue`}
      </Button>
    </Card>
  );
}
