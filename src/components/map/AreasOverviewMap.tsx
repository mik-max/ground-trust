import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { AreaEvidenceStack } from "../../types";
import { areaMarkerIcon } from "./areaMarkerIcon";

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Every Area this app knows about is Nigerian — the browse map should never
// pan/zoom out into neighbouring countries. Generous box around Nigeria's
// actual extent (roughly 4°N-14°N, 2.5°E-15°E) rather than a tight fit, so
// the restriction isn't visible as a hard wall right at the border.
const NIGERIA_BOUNDS: [[number, number], [number, number]] = [
  [3.5, 1.5],
  [14.5, 15.5],
];

// files/ADDENDUM.md §4 / BACKLOG.md — area discovery by location, alongside
// (not replacing) the existing text search on Home. Auto-fits to whatever
// areas are currently in view rather than guessing a center/zoom.
export function AreasOverviewMap({ areas }: { areas: AreaEvidenceStack[] }) {
  const navigate = useNavigate();

  if (areas.length === 0) {
    return null;
  }

  const bounds: [number, number][] = areas.map(({ area }) => [area.geoCentroidLat, area.geoCentroidLng]);

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [40, 40] }}
      scrollWheelZoom={false}
      maxBounds={NIGERIA_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={6}
      className="h-80 w-full rounded-md"
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      {areas.map(({ area }) => (
        <Marker
          key={area.id}
          position={[area.geoCentroidLat, area.geoCentroidLng]}
          icon={areaMarkerIcon}
          eventHandlers={{ click: () => navigate(`/areas/${area.id}`) }}
        >
          <Popup>
            {area.name} · {area.city}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
