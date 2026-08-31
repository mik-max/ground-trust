import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import type { AreaEvidenceStack } from "../types";
import { listAreas } from "../services/area.service";
import { useAuthStore } from "../store/auth.store";
import { AreaCard } from "../components/AreaCard";
import { AreasOverviewMap } from "../components/map/AreasOverviewMap";
import { LocationSearchInput } from "../components/LocationSearchInput";
import { Card } from "../components/ui/Card";
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

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className={text.displayMd}>Find out what an area is really like</h1>
          <p className={`${text.bodyLg} text-mute`}>Rated by the residents who live there.</p>
        </div>

        <LocationSearchInput value={query} onChange={setQuery} />
      </div>

      {user?.role === "resident" && (
        <Card className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MessageCircle size={20} className="shrink-0 text-brand" />
            <p className="text-body text-ink">Lived experience is what makes GroundTrust real.</p>
          </div>
          <Link to="/share" className={buttonClassName({ variant: "primary" }, "shrink-0")}>
            Talk about your environment
          </Link>
        </Card>
      )}

      {loading ? (
        <p className={`${text.body} text-mute`}>Loading areas...</p>
      ) : areas.length === 0 ? (
        <p className={`${text.body} text-mute`}>No areas reviewed near you yet — be the first.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((a) => (
            <AreaCard key={a.area.id} {...a} />
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
