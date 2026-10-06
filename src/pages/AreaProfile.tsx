import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UserCheck, Scale, ShieldCheck, Shield, User, Clock, ImagePlus } from "lucide-react";
import type { AreaEvidenceStack, Review } from "../types";
import { getArea, getAreaReviews } from "../services/area.service";
import { EvidenceStack } from "../components/EvidenceStack";
import { ShareButton } from "../components/share/ShareButton";
import { AddPhotoSheet } from "../components/AddPhotoSheet";
import { ILLUSTRATIONS } from "../components/ui/SpotIllustration";
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
  const [addingPhoto, setAddingPhoto] = useState(false);
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

  const photo = data.photo ?? null;

  return (
    <div className="flex flex-col gap-8">
      <BackLink to="/" label="All areas" />

      {photo ? (
        <figure className="flex flex-col gap-2">
          <div
            className="aspect-[3/1] w-full rounded-xl bg-paper-2 bg-cover bg-center sm:aspect-[10/3]"
            style={{ backgroundImage: `url(${photo.banner})` }}
            role="img"
            aria-label={`A view of ${data.area.name}`}
          />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <PhotoCredit photo={photo} />
            {user?.role === "resident" && (
              <button
                type="button"
                onClick={() => setAddingPhoto(true)}
                className="inline-flex items-center gap-1.5 text-caption text-mute hover:text-ink"
              >
                <ImagePlus size={14} />
                Add a photo
              </button>
            )}
          </div>
        </figure>
      ) : (
        data.area.status === "approved" && (
          <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-[#c9d0cb] bg-white/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img src={ILLUSTRATIONS.location} alt="" className="h-11 w-11 shrink-0" />
              <div>
                <p className="text-body-lg font-medium text-ink">No photo of {data.area.name} yet</p>
                <p className="text-body text-mute">
                  {user?.role === "resident"
                    ? "Live here? A photo of a street or junction helps people picture it."
                    : "Residents can add one, and it shows once an admin approves it."}
                </p>
              </div>
            </div>
            {user?.role === "resident" && (
              <button
                type="button"
                onClick={() => setAddingPhoto(true)}
                className={buttonClassName({ variant: "outline" }, "inline-flex shrink-0 items-center gap-2")}
              >
                <ImagePlus size={16} />
                Add a photo
              </button>
            )}
          </div>
        )
      )}
      {addingPhoto && (
        <AddPhotoSheet areaId={data.area.id} areaName={data.area.name} onClose={() => setAddingPhoto(false)} />
      )}

      <div>
        <Eyebrow>Area profile</Eyebrow>
        <h1 className={`${text.displayLg} mt-2`}>{data.area.name}</h1>
        <p className={`${text.bodyLg} text-mute`}>
          {data.area.lga ?? data.area.city} · {data.area.state} State
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

          <div className={`grid gap-3 sm:flex sm:w-fit ${user?.role === "resident" ? "grid-cols-2" : "grid-cols-1"}`}>
            <Link
              to={`/compare?areas=${id}`}
              className={buttonClassName({ variant: "outline" }, "inline-flex items-center justify-center text-center")}
            >
              Compare with another area
            </Link>

            <ShareButton
              target={{ kind: "area", id: data.area.id, name: data.area.name }}
              className={user?.role === "resident" ? "order-last col-span-2 sm:order-none" : ""}
            />

            {user?.role === "resident" && (
              <Link
                to={`/areas/${id}/review`}
                className={buttonClassName({ variant: "primary" }, "inline-flex items-center justify-center text-center")}
              >
                Share your experience
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h2 className={text.heading}>How this score is calculated</h2>
            <InfoRow icon={UserCheck}>Every resident counts; verified residents count more</InfoRow>
            <InfoRow icon={Scale}>Longer residency carries more weight</InfoRow>
            <InfoRow icon={Clock}>Recent ratings count more than older ones</InfoRow>
          </Card>
          <Card className="flex flex-col gap-3">
            <h2 className={text.heading}>Verification tiers</h2>
            <InfoRow icon={User}>Not yet verified — counts least</InfoRow>
            <InfoRow icon={Shield}>Verified resident — counts more</InfoRow>
            <InfoRow icon={ShieldCheck}>Long-term resident (verified 60+ days) — counts most</InfoRow>
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
            illustration="comments"
            size="inline"
            title="No comments yet"
            description={`Ratings and comments from residents of ${data.area.name} will appear here.`}
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

// The attribution open licences require, beneath the photo.
function PhotoCredit({ photo }: { photo: NonNullable<AreaEvidenceStack["photo"]> }) {
  if (!photo.credit && !photo.license) return null;
  return (
    <figcaption className="text-[12px] text-mute">
      {photo.creditUrl ? (
        <a href={photo.creditUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">
          {photo.credit}
        </a>
      ) : (
        photo.credit
      )}
      {photo.license && (
        <>
          {photo.credit ? " · " : ""}
          {photo.licenseUrl ? (
            <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">
              {photo.license}
            </a>
          ) : (
            photo.license
          )}
        </>
      )}
    </figcaption>
  );
}
