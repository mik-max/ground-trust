import { useState } from "react";
import { Mic, RotateCcw, Square, Star } from "lucide-react";
import type { Aspect } from "../types";
import { ASPECT_ORDER, ASPECT_META } from "./aspectMeta";
import { submitReview } from "../services/area.service";
import { uploadAudio } from "../services/upload.service";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/TextInput";

interface ReviewComposerProps {
  areaId: string;
  onSubmitted?: () => void;
}

// files/DESIGN_SYSTEM.md §5.6. Recording + upload is wired (this pass);
// transcription/translation isn't — the NLP pipeline (files/HANDOFF.md §3)
// is still on BACKLOG.md, so a voice review is stored and playable but not
// yet turned into text.
export function ReviewComposer({ areaId, onSubmitted }: ReviewComposerProps) {
  const [activeTab, setActiveTab] = useState<"voice" | "text">("voice");
  const [reviewText, setReviewText] = useState("");
  const [ratings, setRatings] = useState<Partial<Record<Aspect, number>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorder = useAudioRecorder();

  const allRated = ASPECT_ORDER.every((a) => ratings[a]);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      let originalAudioRef: string | undefined;
      if (recorder.audioBlob) {
        originalAudioRef = await uploadAudio(recorder.audioBlob);
      }
      await submitReview(areaId, { originalText: reviewText || undefined, originalAudioRef, ratings });
      onSubmitted?.();
    } catch {
      setError("Couldn't submit your review — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
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
              <button
                type="button"
                onClick={recorder.status === "recording" ? recorder.stop : recorder.start}
                disabled={recorder.status === "requesting"}
                className={`flex h-16 w-16 items-center justify-center rounded-full text-white disabled:opacity-50 ${
                  recorder.status === "recording" ? "bg-band-poor" : "bg-brand"
                }`}
              >
                {recorder.status === "recording" ? <Square size={24} /> : <Mic size={28} />}
              </button>
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
        {ASPECT_ORDER.map((aspect) => (
          <div key={aspect} className="flex items-center justify-between">
            <span className="text-body text-ink">{ASPECT_META[aspect].label}</span>
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
        {submitting ? "Sharing..." : "Share your experience"}
      </Button>
    </div>
  );
}
