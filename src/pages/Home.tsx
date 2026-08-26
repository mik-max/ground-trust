import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AreaEvidenceStack } from "../types";
import { listAreas } from "../services/area.service";
import { EvidenceStack } from "../components/EvidenceStack";
import { TextInput } from "../components/ui/TextInput";
import { text } from "../styles/typography";

// files/DESIGN_SYSTEM.md §6.2.
export function Home() {
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className={text.displayMd}>Find out what an area is really like</h1>
        <p className={`${text.bodyLg} text-mute`}>Rated by the residents who live there.</p>
      </div>

      <TextInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by area or city..."
      />

      {loading ? (
        <p className={`${text.body} text-mute`}>Loading areas...</p>
      ) : areas.length === 0 ? (
        <p className={`${text.body} text-mute`}>No areas reviewed near you yet — be the first.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {areas.map(({ area, overall, aspects }) => (
            <Link key={area.id} to={`/areas/${area.id}`} className="flex flex-col gap-2">
              <span className={text.heading}>
                {area.name} <span className="text-body font-body font-normal text-mute">· {area.city}</span>
              </span>
              <EvidenceStack overall={overall} aspects={aspects} size="compact" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
