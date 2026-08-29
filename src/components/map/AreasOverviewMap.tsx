import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { AreaEvidenceStack } from "../../types";
import { areaMarkerIcon } from "./areaMarkerIcon";

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

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
    <MapContainer bounds={bounds} boundsOptions={{ padding: [40, 40] }} scrollWheelZoom={false} className="h-80 w-full rounded-md">
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
