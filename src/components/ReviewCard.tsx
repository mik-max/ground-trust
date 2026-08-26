import { useState } from "react";
import type { Aspect, Review } from "../types";
import { VerificationTierBadge } from "./VerificationTierBadge";
import { ASPECT_META, ASPECT_ORDER } from "./aspectMeta";

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
// most viewers. (Both fields are currently the same since the NLP
// translation pipeline isn't built yet — see files/HANDOFF.md §3 — but the
// toggle only appears once the two actually diverge.)
export function ReviewCard({ review }: { review: Review }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const ratedAspects = ASPECT_ORDER.filter((a) => review[RATING_BY_ASPECT[a]] !== null);
  const hasTranslation = Boolean(review.translatedText && review.translatedText !== review.originalText);
  const bodyText = review.translatedText ?? review.originalText;

  return (
    <li className="rounded-md border border-line bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <VerificationTierBadge tier={review.tierAtSubmission} />
        <span className="text-caption text-mute">{formatDate(review.submittedAt)}</span>
      </div>

      {bodyText && <p className="mt-3 text-body text-ink">{showOriginal ? review.originalText : bodyText}</p>}

      {ratedAspects.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {ratedAspects.map((aspect) => (
            <span key={aspect} className="rounded-full bg-paper-2 px-2.5 py-1 text-caption text-mute">
              {ASPECT_META[aspect].label}
            </span>
          ))}
          {hasTranslation && (
            <button
              type="button"
              onClick={() => setShowOriginal((v) => !v)}
              className="text-caption text-steel underline"
            >
              {showOriginal ? "View translation" : "View original"}
            </button>
          )}
        </div>
      )}
    </li>
  );
}
