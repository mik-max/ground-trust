import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import type { Area } from "../types";
import { findNearestArea, listAreas } from "../services/area.service";
import { searchLocations, type GeocodeSuggestion } from "../services/geocode.service";
import { useAuthStore } from "../store/auth.store";
import { Button } from "./ui/Button";

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  // "browse" (default, used on Home): picking an existing area opens its
  // profile. "review" (used on TalkAboutEnvironment): picking one goes
  // straight to writing a review of it — the whole point of that flow is
  // getting a resident from "where do I live" to "review submitted" in one
  // continuous motion, not through the profile page first.
  mode?: "browse" | "review";
}

// Two result sources live in one dropdown: areas we already have data for
// (instant, from our own DB) and real-world Nigerian places (from the
// Nominatim geocode proxy — see geocode.service.ts) for discovering
// somewhere we don't cover yet. `value`/`onChange` stay controlled by the
// caller (Home still filters its own grid off the same text), this
// component only owns the dropdown's open/suggestions state.
export function LocationSearchInput({ value, onChange, placeholder, mode = "browse" }: LocationSearchInputProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [ownMatches, setOwnMatches] = useState<Area[]>([]);
  const [geoMatches, setGeoMatches] = useState<GeocodeSuggestion[]>([]);
  const [uncovered, setUncovered] = useState<GeocodeSuggestion | null>(null);

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

  function goToArea(areaId: string) {
    setOpen(false);
    navigate(mode === "review" ? `/areas/${areaId}/review` : `/areas/${areaId}`);
  }

  function selectOwnArea(area: Area) {
    goToArea(area.id);
  }

  async function selectGeoSuggestion(suggestion: GeocodeSuggestion) {
    setUncovered(null);
    const area = await findNearestArea(suggestion.lat, suggestion.lng);
    if (area) {
      goToArea(area.id);
    } else {
      setUncovered(suggestion);
    }
  }

  function goProposeArea() {
    if (!uncovered) return;
    setOpen(false);
    navigate(
      `/areas/propose?lat=${uncovered.lat}&lng=${uncovered.lng}&label=${encodeURIComponent(uncovered.label)}`
    );
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
            setUncovered(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? "Search any area or neighbourhood in Nigeria..."}
          className="w-full rounded-lg border border-line bg-white py-4 pl-11 pr-4 text-body-lg placeholder:text-mute"
        />
      </div>

      {open && (hasResults || uncovered) && (
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

          {uncovered && (
            <li className="flex flex-col gap-2 border-t border-line p-4">
              <p className="text-caption text-mute">
                No resident data yet for {uncovered.label.split(",").slice(0, 2).join(",")}.
              </p>
              {user?.role === "resident" ? (
                <Button type="button" variant="outline" onClick={goProposeArea} className="w-fit">
                  Share your experience here
                </Button>
              ) : (
                <p className="text-caption text-mute">Log in as a resident to add it.</p>
              )}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
