import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPinOff, MessageCircle } from "lucide-react";
import type { AreaEvidenceStack } from "../types";
import { listAreas } from "../services/area.service";
import { useAuthStore } from "../store/auth.store";
import { AreaCard } from "../components/AreaCard";
import { AreasOverviewMap } from "../components/map/AreasOverviewMap";
import { LocationSearchInput } from "../components/LocationSearchInput";
import { Card } from "../components/ui/Card";
import { AreaCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { buttonClassName } from "../components/ui/Button";
import { text } from "../styles/typography";

// A grid of areas is the front door now, not a map — the map is real but
// secondary (Browse by map, below the fold), and the search bar doubles as
// a real-world location lookup (LocationSearchInput) on top of filtering
// this grid, per the "give me something new" structural feedback.
export function Home() {
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState("");
  const [areas, setAreas] = useState<AreaEvidenceStack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listAreas(query || undefined)
      .then(setAreas)
      .finally(() => setLoading(false));
  }, [query]);

  // The single most-reviewed area gets the spotlight treatment — but only
  // on the default, unfiltered view. Spotlighting one of two or three
  // active search results doesn't mean anything; the point is surfacing
  // the most-trusted area when someone's just browsing.
  const spotlightId =
    !query && areas.length > 1
      ? [...areas].sort((a, b) => b.overall.N - a.overall.N)[0].area.id
      : null;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 rounded-xl bg-paper-2 px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h1 className={text.displayLg}>Find out what an area is really like</h1>
          <p className={`${text.bodyLg} text-mute`}>Rated by the residents who live there.</p>
        </div>
        <div className="mx-auto w-full max-w-xl">
          <LocationSearchInput value={query} onChange={setQuery} />
        </div>
      </div>

      {user?.role === "resident" && (
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={20} className="shrink-0 text-brand" />
            <p className="text-body text-ink">Lived experience is what makes GroundTrust real.</p>
          </div>
          <Link to="/share" className={buttonClassName({ variant: "primary" }, "w-full text-center sm:w-auto")}>
            Talk about your environment
          </Link>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <AreaCardSkeleton key={i} />
          ))}
        </div>
      ) : areas.length === 0 ? (
        <EmptyState
          icon={MapPinOff}
          title="No areas reviewed near you yet"
          description="Be the first to share what it's really like where you live."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((a) => (
            <AreaCard key={a.area.id} {...a} spotlight={a.area.id === spotlightId} />
          ))}
        </div>
      )}

      {areas.length > 0 && (
        <div>
          <h2 className={text.heading}>Browse by map</h2>
          <Card className="mt-3" padding="sm">
            <AreasOverviewMap areas={areas} />
          </Card>
        </div>
      )}
    </div>
  );
}
