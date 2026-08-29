import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import type { Area } from "../types";
import { findNearestArea, listAreas } from "../services/area.service";
import { searchLocations, type GeocodeSuggestion } from "../services/geocode.service";

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Two result sources live in one dropdown: areas we already have data for
// (instant, from our own DB) and real-world Nigerian places (from the
// Nominatim geocode proxy — see geocode.service.ts) for discovering
// somewhere we don't cover yet. `value`/`onChange` stay controlled by the
// caller (Home still filters its own grid off the same text), this
// component only owns the dropdown's open/suggestions state.
export function LocationSearchInput({ value, onChange, placeholder }: LocationSearchInputProps) {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [ownMatches, setOwnMatches] = useState<Area[]>([]);
  const [geoMatches, setGeoMatches] = useState<GeocodeSuggestion[]>([]);
  const [notCovered, setNotCovered] = useState<string | null>(null);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 3) {
      setOwnMatches([]);
      setGeoMatches([]);
      return;
    }
    const handle = setTimeout(() => {
      listAreas(query).then((results) => setOwnMatches(results.map((r) => r.area)));
      searchLocations(query).then(setGeoMatches);
    }, 300);
    return () => clearTimeout(handle);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectOwnArea(area: Area) {
    setOpen(false);
    navigate(`/areas/${area.id}`);
  }

  async function selectGeoSuggestion(suggestion: GeocodeSuggestion) {
    setNotCovered(null);
    const area = await findNearestArea(suggestion.lat, suggestion.lng);
    if (area) {
      setOpen(false);
      navigate(`/areas/${area.id}`);
    } else {
      const shortLabel = suggestion.label.split(",").slice(0, 2).join(",");
      setNotCovered(`No resident data yet for ${shortLabel}.`);
    }
  }

  const hasResults = ownMatches.length > 0 || geoMatches.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setNotCovered(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? "Search any area or neighbourhood in Nigeria..."}
          className="w-full rounded-lg border border-line bg-white py-4 pl-11 pr-4 text-body-lg placeholder:text-mute"
        />
      </div>

      {open && (hasResults || notCovered) && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-line bg-white shadow-raised">
          {ownMatches.length > 0 && (
            <li>
              <p className="px-4 pt-3 text-caption text-mute">Areas we cover</p>
              {ownMatches.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => selectOwnArea(area)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-body text-ink hover:bg-paper-2"
                >
                  <MapPin size={16} className="shrink-0 text-brand" />
                  {area.name} <span className="text-mute">· {area.city}</span>
                </button>
              ))}
            </li>
          )}

          {geoMatches.length > 0 && (
            <li>
              <p className="px-4 pt-3 text-caption text-mute">Other locations</p>
              {geoMatches.map((s) => (
                <button
                  key={`${s.lat}-${s.lng}`}
                  type="button"
                  onClick={() => selectGeoSuggestion(s)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-body text-ink hover:bg-paper-2"
                >
                  <MapPin size={16} className="shrink-0 text-mute" />
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </li>
          )}

          {notCovered && <p className="border-t border-line px-4 py-3 text-caption text-mute">{notCovered}</p>}
        </ul>
      )}
    </div>
  );
}
