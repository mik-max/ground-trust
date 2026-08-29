import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { AreaEvidenceStack, Review } from "../types";
import { getArea, getAreaReviews } from "../services/area.service";
import { EvidenceStack } from "../components/EvidenceStack";
import { ReviewCard } from "../components/ReviewCard";
import { AreaLocationMap } from "../components/map/AreaLocationMap";
import { useAuthStore } from "../store/auth.store";
import { buttonClassName } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Eyebrow } from "../components/ui/Eyebrow";
import { text } from "../styles/typography";

// GroundTruth_Design_Implementation_Guide.md §7.3 — eyebrow kicker, two-column
// layout (Evidence Stack + Compare CTA on the left; explanatory info cards on
// the right), paginated review list below.
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
    return <p className={`${text.body} text-mute`}>Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Eyebrow>Area Profile</Eyebrow>
        <h1 className={text.displayLg}>{data.area.name}</h1>
        <p className={`${text.bodyLg} text-mute`}>
          {data.area.city}, {data.area.state}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <EvidenceStack overall={data.overall} aspects={data.aspects} size="full" />

          <Link to={`/compare?areas=${id}`} className={buttonClassName({ variant: "accent" }, "w-fit")}>
            Compare with another area
          </Link>

          {user?.role === "resident" && (
            <Link to={`/areas/${id}/review`} className={buttonClassName({ variant: "primary" }, "w-fit")}>
              Share your experience
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className={text.heading}>How this score is calculated</h2>
            <p className="mt-1 text-body text-mute">
              Each score is a weighted average of ratings from verified residents. Longer-verified
              residents carry more weight, so the score reflects lived experience, not just volume.
            </p>
          </Card>
          <Card>
            <h2 className={text.heading}>Verification tiers</h2>
            <p className="mt-1 text-body text-mute">
              Residents earn more influence over time — Registered counts least, Location-confirmed
              counts more, and Verified residents (60+ days confirmed) count most.
            </p>
          </Card>
          <Card>
            <h2 className={text.heading}>Location</h2>
            <p className="mt-1 mb-3 text-caption text-mute">
              Approximate area boundary ({data.area.geoRadiusMeters.toLocaleString()}m radius) — not a
              precise boundary.
            </p>
            <AreaLocationMap area={data.area} />
          </Card>
        </div>
      </div>

      <div>
        <h2 className={text.displayMd}>Reviews</h2>
        {reviews === null ? (
          <p className={`${text.body} text-mute`}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className={`${text.body} text-mute`}>No reviews yet.</p>
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
