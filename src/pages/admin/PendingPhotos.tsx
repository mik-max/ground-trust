import { useEffect, useState } from "react";
import { listPendingPhotos, moderatePhoto, type PendingPhoto } from "../../services/admin.service";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { text } from "../../styles/typography";

// Residents' area photos waiting for a decision. Check the photo shows the
// area (a street, road or buildings) with no recognisable faces, number
// plates or private interiors. Rejecting deletes it from storage.
export function PendingPhotos() {
  const [photos, setPhotos] = useState<PendingPhoto[] | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => {
    listPendingPhotos().then(setPhotos);
  }, []);

  async function decide(photo: PendingPhoto, decision: "approved" | "rejected", cover = false) {
    setActingOn(photo.id);
    try {
      await moderatePhoto(photo.id, decision, cover);
      setPhotos((prev) => prev?.filter((p) => p.id !== photo.id) ?? null);
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div>
      <h2 className={text.heading}>Area photos</h2>
      <p className="mt-1 text-body text-mute">
        Approve photos that show the area, with no recognisable faces, number plates or private interiors.
      </p>
      {photos === null ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      ) : photos.length === 0 ? (
        <div className="mt-3">
          <EmptyState size="inline" illustration="allClear" title="All clear" description="No photos waiting." />
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {photos.map((p) => (
            <li key={p.id}>
              <Card padding="none" className="overflow-hidden">
                <a href={p.fullUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open the photo of ${p.area.name} full size`}>
                  <img src={p.url} alt={`Photo submitted for ${p.area.name}`} className="aspect-[16/10] w-full object-cover" />
                </a>
                <div className="flex flex-col gap-3 p-4">
                  <div>
                    <p className="text-body-lg font-medium text-ink">{p.area.name}</p>
                    <p className="text-caption text-mute">
                      {p.area.lga ?? p.area.city} · from {p.uploadedBy ?? "a resident"} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                    </p>
                    {!p.areaHasPhoto && (
                      <p className="mt-1 text-caption text-brand">This area has no photo yet, so approving makes it the cover.</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => decide(p, "approved")} disabled={actingOn === p.id} className="px-4! py-2! text-body!">
                      Approve
                    </Button>
                    {p.areaHasPhoto && (
                      <Button type="button" variant="outline" onClick={() => decide(p, "approved", true)} disabled={actingOn === p.id}>
                        Approve as cover
                      </Button>
                    )}
                    <Button type="button" variant="outline" onClick={() => decide(p, "rejected")} disabled={actingOn === p.id}>
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
