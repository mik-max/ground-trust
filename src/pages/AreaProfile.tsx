import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UserCheck, Scale, ShieldCheck, Shield, User, MessageSquareOff } from "lucide-react";
import type { AreaEvidenceStack, Review } from "../types";
import { getArea, getAreaReviews } from "../services/area.service";
import { EvidenceStack } from "../components/EvidenceStack";
import { ReviewCard } from "../components/ReviewCard";
import { AreaLocationMap } from "../components/map/AreaLocationMap";
import { useAuthStore } from "../store/auth.store";
import { buttonClassName, Button } from "../components/ui/Button";
import { BackLink } from "../components/ui/BackLink";
import { Card } from "../components/ui/Card";
import { Eyebrow } from "../components/ui/Eyebrow";
import { EvidenceStackSkeleton, ReviewCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { text } from "../styles/typography";

function InfoRow({ icon: Icon, children }: { icon: typeof UserCheck; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-paper-2 text-brand">
        <Icon size={16} />
      </div>
      <p className="text-body text-ink">{children}</p>
    </div>
  );
}

// GroundTruth_Design_Implementation_Guide.md §7.3 — eyebrow kicker, two-column
// layout (Evidence Stack + Compare CTA on the left; explanatory info cards on
// the right), paginated review list below.
export function AreaProfile() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<AreaEvidenceStack | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!id) return;
    setData(null);
    setReviews(null);
    setPage(1);
    getArea(id).then(setData);
    getAreaReviews(id, 1).then((r) => {
      setReviews(r.reviews);
      setTotalReviews(r.total);
    });
  }, [id]);

  function loadMoreReviews() {
    if (!id) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    getAreaReviews(id, nextPage)
      .then((r) => {
        setReviews((prev) => [...(prev ?? []), ...r.reviews]);
        setPage(nextPage);
      })
      .finally(() => setLoadingMore(false));
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-8">
        <BackLink to="/" label="All areas" />
        <div className="flex flex-col gap-2">
          <div className="h-3.5 w-24 animate-pulse rounded-md bg-paper-2" />
          <div className="h-9 w-64 animate-pulse rounded-md bg-paper-2" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-paper-2" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
          <EvidenceStackSkeleton />
          <div className="flex flex-col gap-4">
            <div className="h-32 animate-pulse rounded-lg bg-paper-2" />
            <div className="h-40 animate-pulse rounded-lg bg-paper-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <BackLink to="/" label="All areas" />

      <div>
        <Eyebrow>Area Profile</Eyebrow>
        <h1 className={text.displayLg}>{data.area.name}</h1>
        <p className={`${text.bodyLg} text-mute`}>
          {data.area.city}, {data.area.state}
        </p>
      </div>

      {data.area.status === "pending" && (
        <Card border="accent">
          <p className="text-body text-ink">Awaiting admin approval</p>
          <p className="text-caption text-mute">
            You're seeing this because you proposed it. It isn't visible to anyone else yet — an admin
            checks new areas before they go public, to keep out spam and duplicates.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <EvidenceStack overall={data.overall} aspects={data.aspects} size="full" />

          <Link to={`/compare?areas=${id}`} className={buttonClassName({ variant: "outline" }, "w-fit")}>
            Compare with another area
          </Link>

          {user?.role === "resident" && (
            <Link to={`/areas/${id}/review`} className={buttonClassName({ variant: "primary" }, "w-fit")}>
              Share your experience
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h2 className={text.heading}>How this score is calculated</h2>
            <InfoRow icon={UserCheck}>Only counts verified residents</InfoRow>
            <InfoRow icon={Scale}>Longer residency carries more weight</InfoRow>
          </Card>
          <Card className="flex flex-col gap-3">
            <h2 className={text.heading}>Verification tiers</h2>
            <InfoRow icon={User}>Registered — counts least</InfoRow>
            <InfoRow icon={Shield}>Location-confirmed — counts more</InfoRow>
            <InfoRow icon={ShieldCheck}>Verified resident (60+ days) — counts most</InfoRow>
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
          <ul className="mt-4 flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </ul>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquareOff}
            title="No reviews yet"
            description="Be the first resident to share what this area is really like."
          />
        ) : (
          <>
            <ul className="mt-4 flex flex-col gap-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </ul>
            {reviews.length < totalReviews && (
              <Button
                type="button"
                variant="outline"
                onClick={loadMoreReviews}
                disabled={loadingMore}
                className="mt-4 w-fit"
              >
                {loadingMore ? "Loading..." : `Load more (${totalReviews - reviews.length} remaining)`}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
