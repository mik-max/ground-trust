import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import type { Area } from "../types";
import { createArea, findNearestArea, listAreas } from "../services/area.service";
import { searchLocations, type GeocodeSuggestion } from "../services/geocode.service";
import { useAuthStore } from "../store/auth.store";
import { Button } from "./ui/Button";
import { TextInput } from "./ui/TextInput";

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Nominatim's display_name is a plain comma-separated string with no fixed
// shape ("Ikeja, Lagos State, Nigeria" vs a much longer address) — this is
// only ever a starting guess for the add-area form below, which stays fully
// editable, so getting it slightly wrong for an unusual result is fine.
function guessNameCityState(label: string): { name: string; city: string; state: string } {
  const parts = label.split(",").map((s) => s.trim());
  const name = parts[0] ?? "";
  const stateIndex = parts.findIndex((p) => /state/i.test(p));
  const state = stateIndex >= 0 ? parts[stateIndex].replace(/\s*state$/i, "") : "";
  const city = parts.length > 2 ? parts[1] : state || name;
  return { name, city, state };
}

// Two result sources live in one dropdown: areas we already have data for
// (instant, from our own DB) and real-world Nigerian places (from the
// Nominatim geocode proxy — see geocode.service.ts) for discovering
// somewhere we don't cover yet. `value`/`onChange` stay controlled by the
// caller (Home still filters its own grid off the same text), this
// component only owns the dropdown's open/suggestions state.
export function LocationSearchInput({ value, onChange, placeholder }: LocationSearchInputProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [ownMatches, setOwnMatches] = useState<Area[]>([]);
  const [geoMatches, setGeoMatches] = useState<GeocodeSuggestion[]>([]);
  const [uncovered, setUncovered] = useState<GeocodeSuggestion | null>(null);
  const [addForm, setAddForm] = useState<{ name: string; city: string; state: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  function resetUncoveredState() {
    setUncovered(null);
    setAddForm(null);
    setSubmitted(false);
  }

  function selectOwnArea(area: Area) {
    setOpen(false);
    navigate(`/areas/${area.id}`);
  }

  async function selectGeoSuggestion(suggestion: GeocodeSuggestion) {
    resetUncoveredState();
    const area = await findNearestArea(suggestion.lat, suggestion.lng);
    if (area) {
      setOpen(false);
      navigate(`/areas/${area.id}`);
    } else {
      setUncovered(suggestion);
    }
  }

  async function submitNewArea() {
    if (!uncovered || !addForm) return;
    setSubmitting(true);
    try {
      await createArea({
        name: addForm.name.trim(),
        city: addForm.city.trim(),
        state: addForm.state.trim(),
        geoCentroidLat: uncovered.lat,
        geoCentroidLng: uncovered.lng,
      });
      setAddForm(null);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
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
            resetUncoveredState();
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
            <li className="border-t border-line p-4">
              {submitted ? (
                <p className="text-caption text-mute">
                  Thanks — submitted for review. An admin will approve it before it appears publicly.
                </p>
              ) : addForm ? (
                <div className="flex flex-col gap-2">
                  <p className="text-caption text-mute">A few details before we submit it for review:</p>
                  <TextInput
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="Area name"
                  />
                  <div className="flex gap-2">
                    <TextInput
                      value={addForm.city}
                      onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                      placeholder="City"
                      className="flex-1"
                    />
                    <TextInput
                      value={addForm.state}
                      onChange={(e) => setAddForm({ ...addForm, state: e.target.value })}
                      placeholder="State"
                      className="flex-1"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={submitNewArea}
                    disabled={submitting || !addForm.name.trim() || !addForm.city.trim() || !addForm.state.trim()}
                    className="mt-1 w-fit"
                  >
                    {submitting ? "Submitting..." : "Submit for review"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-caption text-mute">No resident data yet for {uncovered.label.split(",").slice(0, 2).join(",")}.</p>
                  {user?.role === "resident" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddForm(guessNameCityState(uncovered.label))}
                      className="w-fit"
                    >
                      + Add this area
                    </Button>
                  )}
                </div>
              )}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
