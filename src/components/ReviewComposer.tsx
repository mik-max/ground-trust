import { useState } from "react";
import { Mic, Star } from "lucide-react";
import type { Aspect } from "../types";
import { ASPECT_ORDER, ASPECT_META } from "./aspectMeta";
import { submitReview } from "../services/area.service";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/TextInput";

interface ReviewComposerProps {
  areaId: string;
  onSubmitted?: () => void;
}

// files/DESIGN_SYSTEM.md §5.6. Voice input is out of scope for this pass
// (no STT pipeline yet — see files/HANDOFF.md §3), so the voice tab renders
// per spec but recording is disabled; text and structured ratings are fully
// wired.
export function ReviewComposer({ areaId, onSubmitted }: ReviewComposerProps) {
  const [activeTab, setActiveTab] = useState<"voice" | "text">("voice");
  const [reviewText, setReviewText] = useState("");
  const [ratings, setRatings] = useState<Partial<Record<Aspect, number>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allRated = ASPECT_ORDER.every((a) => ratings[a]);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await submitReview(areaId, { originalText: reviewText || undefined, ratings });
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
        <div className="flex flex-col items-center gap-2 py-6">
          <button
            type="button"
            disabled
            title="Voice review is coming soon"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white opacity-50"
          >
            <Mic size={28} />
          </button>
          <p className="text-caption text-mute">Voice review is coming soon — use the Text tab for now.</p>
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
