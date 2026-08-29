import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Area } from "../../types";
import { areaMarkerIcon } from "./areaMarkerIcon";

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const METERS_PER_DEGREE_LAT = 111320;

interface AreaLocationMapProps {
  area: Pick<Area, "name" | "geoCentroidLat" | "geoCentroidLng" | "geoRadiusMeters">;
}

// files/ADDENDUM.md §4 — centroid + radius only, no polygon (explicitly
// deferred as future work). --brand matches the app's palette rather than
// Leaflet's default blue.
//
// Bounds are computed from the radius rather than using a fixed zoom level:
// seeded areas range 2000-3000m, and a fixed zoom close enough to read street
// names put the circle's edge well outside this map's small preview size
// (confirmed by inspecting the rendered SVG directly — a 2000m circle is
// ~420px across at zoom 14, more than this widget is tall). Bounds-fitting
// keeps the whole circle in view regardless of any given area's radius.
export function AreaLocationMap({ area }: AreaLocationMapProps) {
  const center: [number, number] = [area.geoCentroidLat, area.geoCentroidLng];
  const latOffset = area.geoRadiusMeters / METERS_PER_DEGREE_LAT;
  const lngOffset = area.geoRadiusMeters / (METERS_PER_DEGREE_LAT * Math.cos((area.geoCentroidLat * Math.PI) / 180));
  const bounds: [[number, number], [number, number]] = [
    [area.geoCentroidLat - latOffset, area.geoCentroidLng - lngOffset],
    [area.geoCentroidLat + latOffset, area.geoCentroidLng + lngOffset],
  ];

  return (
    <MapContainer bounds={bounds} scrollWheelZoom={false} className="h-64 w-full rounded-md">
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      <Circle
        center={center}
        radius={area.geoRadiusMeters}
        pathOptions={{ color: "#128066", fillColor: "#128066", fillOpacity: 0.15 }}
      />
      <Marker position={center} icon={areaMarkerIcon}>
        <Popup>{area.name}</Popup>
      </Marker>
    </MapContainer>
  );
}
