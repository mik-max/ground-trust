import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import type { Area, AreaEvidenceStack } from "../types";
import { getArea, listAreas } from "../services/area.service";
import { ScoreBandBadge } from "../components/ScoreBandBadge";
import { AspectRow } from "../components/AspectRow";
import { ConfidenceStrip } from "../components/ConfidenceStrip";
import { ASPECT_ORDER } from "../components/aspectMeta";
import { TextInput } from "../components/ui/TextInput";
import { text } from "../styles/typography";

const MAX_AREAS = 3;

// files/DESIGN_SYSTEM.md §6.4 / GroundTruth §7.4 — "aspect rows aligned in a
// shared grid (same vertical position per aspect across all columns)" is a
// specific alignment requirement, not just placing cards side by side. A
// standalone EvidenceStack per column can't guarantee that (header text of
// different lengths would throw rows out of sync), so this screen builds
// its own CSS grid directly from the lower-level pieces (ScoreBandBadge,
// AspectRow, ConfidenceStrip) — one real grid row per concept (badge, score,
// caption, confidence strip, each aspect), one column per area. CSS Grid
// auto-sizes every row to its tallest cell, so alignment holds regardless
// of content length in any one column.
export function CompareAreas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ids = (searchParams.get("areas") ?? "").split(",").filter(Boolean);

  const [areas, setAreas] = useState<AreaEvidenceStack[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Area[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setAreas([]);
      return;
    }
    Promise.all(ids.map((id) => getArea(id))).then(setAreas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  useEffect(() => {
    if (!query || areas.length >= MAX_AREAS) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      listAreas(query).then((r) =>
        setResults(r.map((x) => x.area).filter((a) => !ids.includes(a.id)))
      );
    }, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, areas.length]);

  function addArea(id: string) {
    setSearchParams({ areas: [...ids, id].join(",") });
    setQuery("");
    setResults([]);
  }

  function removeArea(id: string) {
    setSearchParams({ areas: ids.filter((x) => x !== id).join(",") });
  }

  const gridStyle = { gridTemplateColumns: `repeat(${areas.length}, minmax(0, 1fr))` };

  return (
    <div className="flex flex-col gap-6">
      <h1 className={text.displayMd}>Compare Areas</h1>

      {areas.length < MAX_AREAS && (
        <div className="relative max-w-sm">
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Add an area to compare..."
            className="w-full"
          />
          {results.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-md border border-line bg-white shadow-raised">
              {results.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => addArea(a.id)}
                    className="block w-full px-4 py-2 text-left text-body text-ink hover:bg-paper-2"
                  >
                    {a.name} <span className="text-mute">· {a.city}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {areas.length === 0 ? (
        <p className="text-body text-mute">Search above to start comparing areas.</p>
      ) : (
        <div className="grid gap-x-6" style={gridStyle}>
          {areas.map((a) => (
            <div key={a.area.id} className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <p className={text.heading}>{a.area.name}</p>
                <p className="text-caption text-mute">
                  {a.area.city}, {a.area.state}
                </p>
              </div>
              {areas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArea(a.area.id)}
                  aria-label={`Remove ${a.area.name} from comparison`}
                  className="text-mute"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}

          {areas.map((a) => (
            <div key={a.area.id} className="pt-4">
              {a.overall.band ? (
                <ScoreBandBadge band={a.overall.band} />
              ) : (
                <span className="text-caption text-mute">No reviews yet</span>
              )}
            </div>
          ))}

          {areas.map((a) => (
            <p key={a.area.id} className="mt-2 text-data-lg tabular-nums text-ink">
              {a.overall.score !== null ? a.overall.score.toFixed(1) : "—"}
            </p>
          ))}

          {areas.map((a) => (
            <p key={a.area.id} className="text-caption text-mute">
              Based on {a.overall.N} verified resident{a.overall.N === 1 ? "" : "s"}
            </p>
          ))}

          {areas.map((a) => (
            <div key={a.area.id} className="mt-3">
              <ConfidenceStrip n={a.overall.N} />
            </div>
          ))}

          {areas.map((a) => (
            <div key={a.area.id} className="my-4 border-t border-line" />
          ))}

          {ASPECT_ORDER.flatMap((aspect) =>
            areas.map((a) => {
              const row = a.aspects.find((x) => x.aspect === aspect);
              return (
                <div key={`${a.area.id}-${aspect}`} className="py-1.5">
                  <AspectRow aspect={aspect} score={row?.score ?? null} n={row?.N ?? 0} confidence={row?.confidence ?? "low"} />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
