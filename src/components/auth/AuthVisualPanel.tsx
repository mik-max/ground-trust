import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { AreaEvidenceStack } from "../../types";
import { listAreas } from "../../services/area.service";
import { areaMarkerIcon } from "../map/areaMarkerIcon";

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const NIGERIA_BOUNDS: [[number, number], [number, number]] = [
  [4, 2.5],
  [14, 15],
];

// The auth pages' right-side visual — deliberately real product data, not
// stock photography we don't have: a purely decorative (no zoom/pan/click)
// map of every area actually being tracked, with a live stat card over it.
// Ties the very first thing a visitor sees to what the product actually
// does, the same way the reference layout's floating "Links 10/125" card
// showed its own real product surface rather than a generic hero image.
export function AuthVisualPanel() {
  const [areas, setAreas] = useState<AreaEvidenceStack[] | null>(null);

  useEffect(() => {
    listAreas().then(setAreas);
  }, []);

  const totalResidents = areas?.reduce((sum, a) => sum + a.overall.N, 0) ?? 0;
  const featured = areas?.filter((a) => a.overall.score !== null).sort((a, b) => (b.overall.N ?? 0) - (a.overall.N ?? 0))[0];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-ink">
      <MapContainer
        center={[9.082, 8.6753]}
        zoom={6}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        maxBounds={NIGERIA_BOUNDS}
        className="h-full w-full"
      >
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
        {areas?.map(({ area }) => (
          <Marker key={area.id} position={[area.geoCentroidLat, area.geoCentroidLng]} icon={areaMarkerIcon} />
        ))}
      </MapContainer>

      {/* Brand-tinted wash + bottom gradient, purely decorative — keeps the
          default OSM tile colors from clashing with the app's palette and
          keeps the stat card legible over whatever's beneath it. Explicit
          z-index (not just DOM order) is required here: Leaflet's own
          panes/attribution control carry explicit z-index up to ~1000, and
          `.leaflet-container`'s `position: relative` has no z-index of its
          own, so it never contains them in a local stacking context — they
          escape upward and paint over any sibling with the default
          z-index: auto regardless of markup order. */}
      <div className="pointer-events-none absolute inset-0 z-1100 bg-brand/20 mix-blend-multiply" />
      <div className="pointer-events-none absolute inset-0 z-1100 bg-linear-to-t from-ink/85 via-ink/10 to-transparent" />

      <div className="absolute inset-x-6 bottom-6 z-1100 rounded-2xl bg-ink/80 p-5 text-white backdrop-blur-sm sm:inset-x-8 sm:bottom-8">
        <p className="text-eyebrow font-bold uppercase tracking-[2px] text-white/60">Live on GroundTrust</p>
        <p className="mt-1.5 text-heading font-display font-bold text-white">
          {areas === null ? "Loading..." : `${areas.length} areas · ${totalResidents} verified residents`}
        </p>
        {featured && (
          <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3">
            <span className="text-body text-white/90">
              {featured.area.name}, {featured.area.city}
            </span>
            <span className="text-data-md font-bold tabular-nums text-white">
              {featured.overall.score!.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
