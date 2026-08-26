import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { AreaEvidenceStack, Review } from "../types";
import { getArea, getAreaReviews } from "../services/area.service";
import { EvidenceStack } from "../components/EvidenceStack";
import { ReviewCard } from "../components/ReviewCard";
import { useAuthStore } from "../store/auth.store";

// GroundTruth_Design_Implementation_Guide.md §7.3 — eyebrow kicker, two-column
// layout (Evidence Stack + Compare CTA on the left; explanatory info cards on
// the right), paginated review list below. "Compare with another area" is
// styled per spec but disabled — the Compare Areas screen itself is still a
// later pass.
export function AreaProfile() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<AreaEvidenceStack | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    if (!id) return;
    setData(null);
    setReviews(null);
    getArea(id).then(setData);
    getAreaReviews(id).then((r) => setReviews(r.reviews));
  }, [id]);

  if (!data) {
    return <p className="text-body text-mute">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-eyebrow font-bold uppercase tracking-[2px] text-mute">Area Profile</p>
        <h1 className="text-display-lg font-display font-bold text-ink">{data.area.name}</h1>
        <p className="text-body-lg text-mute">
          {data.area.city}, {data.area.state}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <EvidenceStack overall={data.overall} aspects={data.aspects} size="full" />

          <button
            type="button"
            disabled
            title="Compare Areas is coming soon"
            className="w-fit rounded-md bg-amber px-6 py-3 text-body-lg text-white opacity-50"
          >
            Compare with another area
          </button>

          {user?.role === "resident" && (
            <Link
              to={`/areas/${id}/review`}
              className="w-fit rounded-md bg-ink px-6 py-3 text-body-lg text-white"
            >
              Share your experience
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-md border border-line bg-white p-4 shadow-card">
            <h2 className="text-heading font-display font-bold text-ink">How this score is calculated</h2>
            <p className="mt-1 text-body text-mute">
              Each score is a weighted average of ratings from verified residents. Longer-verified
              residents carry more weight, so the score reflects lived experience, not just volume.
            </p>
          </div>
          <div className="rounded-md border border-line bg-white p-4 shadow-card">
            <h2 className="text-heading font-display font-bold text-ink">Verification tiers</h2>
            <p className="mt-1 text-body text-mute">
              Residents earn more influence over time — Registered counts least, Location-confirmed
              counts more, and Verified residents (60+ days confirmed) count most.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-display-md font-display font-bold text-ink">Reviews</h2>
        {reviews === null ? (
          <p className="text-body text-mute">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-body text-mute">No reviews yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
