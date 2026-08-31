import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import type { Aspect } from "../../types";
import {
  listPendingAreas,
  listPendingReviews,
  moderateArea,
  moderateReview,
  type PendingArea,
  type PendingReview,
} from "../../services/admin.service";
import { ASPECT_META, ASPECT_ORDER } from "../../components/aspectMeta";
import { AreaLocationMap } from "../../components/map/AreaLocationMap";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { text } from "../../styles/typography";

const RATING_BY_ASPECT: Record<Aspect, keyof PendingReview> = {
  power: "ratingPower",
  water: "ratingWater",
  security: "ratingSecurity",
  roads_flooding: "ratingRoadsFlooding",
  accessibility: "ratingAccessibility",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// files/ADDENDUM.md §3 — the human-in-the-loop half of moderation. Shown
// both the original and translated text (unlike the public ReviewCard's
// toggle) since an admin judging content needs both, not a reader's
// preferred default. "Simple admin list view, not a workflow engine" per
// spec — no assignment, no filters, just approve/reject.
export function ModerationQueue() {
  const [reviews, setReviews] = useState<PendingReview[] | null>(null);
  const [areas, setAreas] = useState<PendingArea[] | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  function refresh() {
    listPendingReviews().then(setReviews);
    listPendingAreas().then(setAreas);
  }

  useEffect(refresh, []);

  async function handleDecision(reviewId: string, decision: "approved" | "rejected") {
    setActingOn(reviewId);
    try {
      await moderateReview(reviewId, decision);
      setReviews((prev) => prev?.filter((r) => r.id !== reviewId) ?? null);
    } finally {
      setActingOn(null);
    }
  }

  async function handleAreaDecision(areaId: string, decision: "approved" | "rejected") {
    setActingOn(areaId);
    try {
      await moderateArea(areaId, decision);
      setAreas((prev) => prev?.filter((a) => a.id !== areaId) ?? null);
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className={text.displayMd}>Moderation Queue</h1>

      <div>
        <h2 className={text.heading}>Proposed areas</h2>
        {areas === null ? (
          <p className={`${text.body} text-mute`}>Loading...</p>
        ) : areas.length === 0 ? (
          <p className={`${text.body} text-mute`}>No area proposals pending.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {areas.map((a) => (
              <li key={a.id}>
                <Card border={a.possibleDuplicate ? "accent" : "default"} className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className="text-body-lg text-ink">
                          {a.name} <span className="text-mute">· {a.city}, {a.state}</span>
                        </p>
                        <p className="text-caption text-mute">
                          Proposed by {a.createdBy?.fullName ?? "Unknown resident"}
                          {a.createdBy?.email ? ` (${a.createdBy.email})` : ""}
                        </p>
                        <p className="text-caption text-mute">
                          {a.geoCentroidLat.toFixed(4)}, {a.geoCentroidLng.toFixed(4)} · {a.geoRadiusMeters.toLocaleString()}m radius
                        </p>
                      </div>

                      {a.possibleDuplicate && a.nearestOtherArea && (
                        <div className="flex items-start gap-2 rounded-md bg-paper-2 p-3">
                          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber" />
                          <p className="text-caption text-ink">
                            Only {Math.round(a.nearestOtherArea.distanceMeters).toLocaleString()}m from{" "}
                            <span className="font-bold">{a.nearestOtherArea.name}</span> (
                            {a.nearestOtherArea.status}) — check this isn't the same place proposed again.
                          </p>
                        </div>
                      )}

                      {!a.possibleDuplicate && a.nearestOtherArea && (
                        <p className="text-caption text-mute">
                          Nearest other area: {a.nearestOtherArea.name} (
                          {Math.round(a.nearestOtherArea.distanceMeters / 1000)}km away)
                        </p>
                      )}

                      {a.otherPendingFromSameUser > 0 && (
                        <p className="text-caption text-mute">
                          This resident has {a.otherPendingFromSameUser} other area proposal
                          {a.otherPendingFromSameUser === 1 ? "" : "s"} pending too.
                        </p>
                      )}
                    </div>

                    <AreaLocationMap area={a} />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" disabled={actingOn === a.id} onClick={() => handleAreaDecision(a.id, "approved")}>
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actingOn === a.id}
                      onClick={() => handleAreaDecision(a.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2 className={text.heading}>Pending reviews</h2>
      {reviews === null ? (
        <p className={`${text.body} text-mute`}>Loading...</p>
      ) : reviews.length === 0 ? (
        <p className={`${text.body} text-mute`}>Nothing pending review.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((r) => {
            const ratedAspects = ASPECT_ORDER.filter((a) => r[RATING_BY_ASPECT[a]] !== null);
            const showBothTexts = r.translatedText && r.translatedText !== r.originalText;

            return (
              <li key={r.id}>
                <Card className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Link to={`/areas/${r.area.id}`} className="text-body-lg text-ink">
                      {r.area.name} <span className="text-mute">· {r.area.city}</span>
                    </Link>
                    <span className="text-caption text-mute">{formatDate(r.submittedAt)}</span>
                  </div>
                  <p className="text-caption text-mute">Submitted by {r.user?.fullName ?? "Unknown resident"}</p>

                  {r.originalAudioRef && <audio controls src={r.originalAudioRef} className="w-full" />}

                  {r.originalText && (
                    <div className="flex flex-col gap-1">
                      <p className="text-body text-ink">{r.originalText}</p>
                      {showBothTexts && (
                        <p className="text-caption text-mute">Translated: {r.translatedText}</p>
                      )}
                    </div>
                  )}

                  {ratedAspects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {ratedAspects.map((aspect) => (
                        <span key={aspect} className="rounded-full bg-paper-2 px-2.5 py-1 text-caption text-mute">
                          {ASPECT_META[aspect].label}: {r[RATING_BY_ASPECT[aspect]] as number}/5
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={actingOn === r.id}
                      onClick={() => handleDecision(r.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actingOn === r.id}
                      onClick={() => handleDecision(r.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
