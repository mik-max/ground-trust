import { useState } from "react";
import { Mic } from "lucide-react";
import type { Aspect, Review } from "../types";
import { VerificationTierBadge } from "./VerificationTierBadge";
import { ASPECT_META, ASPECT_ORDER } from "./aspectMeta";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

const RATING_BY_ASPECT: Record<Aspect, keyof Review> = {
  power: "ratingPower",
  water: "ratingWater",
  security: "ratingSecurity",
  roads_flooding: "ratingRoadsFlooding",
  accessibility: "ratingAccessibility",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// GroundTruth_Design_Implementation_Guide.md §3.9. The translated English
// text is the default body copy — the original is a "View original" toggle,
// not the primary text, so non-English contributions read naturally for
// most viewers.
//
// Privacy: a voice review's raw recording is only ever sent to government
// viewers (backend strips it for everyone else — see
// area.controller.ts's getAreaReviews) — residents/visitors always get the
// transcribed text instead. `hasVoiceRecording` survives that stripping so
// non-government viewers still see an honest "this was spoken" indicator,
// just never the recording itself.
export function ReviewCard({ review }: { review: Review }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const ratedAspects = ASPECT_ORDER.filter((a) => review[RATING_BY_ASPECT[a]] !== null);
  const hasTranslation = Boolean(review.translatedText && review.translatedText !== review.originalText);
  const bodyText = review.translatedText ?? review.originalText;

  return (
    <li>
      <Card>
        <div className="flex items-center justify-between">
          <VerificationTierBadge tier={review.tierAtSubmission} />
          <span className="text-caption text-mute">{formatDate(review.submittedAt)}</span>
        </div>

        {review.originalAudioRef ? (
          // Only ever present for government viewers — see the privacy note above.
          <audio controls src={review.originalAudioRef} className="mt-3 w-full" />
        ) : (
          review.hasVoiceRecording && (
            <span className="mt-3 inline-flex w-fit items-center gap-1.5 text-caption text-mute">
              <Mic size={13} />
              Originally a voice review — shown here as text to protect the resident's privacy.
            </span>
          )
        )}

        {bodyText && <p className="mt-3 text-body text-ink">{showOriginal ? review.originalText : bodyText}</p>}

        {ratedAspects.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {ratedAspects.map((aspect) => {
              const Icon = ASPECT_META[aspect].icon;
              return (
                <span
                  key={aspect}
                  className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-1 text-caption text-mute"
                >
                  <Icon size={12} />
                  {ASPECT_META[aspect].label}: {review[RATING_BY_ASPECT[aspect]] as number}/5
                </span>
              );
            })}
            {hasTranslation && (
              <Button type="button" variant="link" className="text-caption" onClick={() => setShowOriginal((v) => !v)}>
                {showOriginal ? "View translation" : "View original"}
              </Button>
            )}
          </div>
        )}
      </Card>
    </li>
  );
}
