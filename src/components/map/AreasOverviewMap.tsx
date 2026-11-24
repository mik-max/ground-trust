import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { AreaEvidenceStack } from "../../types";
import { areaGroupIcon, areaMarkerIcon } from "./areaMarkerIcon";

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
      // A single area gives zero-size bounds; without a maximum zoom Leaflet
      // computes an infinite zoom and throws "Invalid LatLng (NaN, NaN)".
      boundsOptions={{ padding: [40, 40], maxZoom: 14 }}
      maxZoom={18}
      scrollWheelZoom={false}
      maxBounds={NIGERIA_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={6}
      className="h-80 w-full rounded-md"
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      <AreaMarkers areas={areas} onOpen={(id) => navigate(`/areas/${id}`)} />
    </MapContainer>
  );
}

// Pins whose anchor points are closer than this on screen would overlap
// (a pin is 26×34 px and a group circle 32×32 px), leaving each too small a
// touch target (WCAG 2.2 asks for 24×24 px). Such areas are shown as one
// numbered marker until the map is zoomed in far enough to separate them.
const MIN_MARKER_DISTANCE_PX = 48;

type MarkerGroup = { areas: AreaEvidenceStack[]; position: L.LatLng };

function groupNearbyAreas(areas: AreaEvidenceStack[], map: L.Map, zoom: number): MarkerGroup[] {
  const pointOf = ({ area }: AreaEvidenceStack) => map.project([area.geoCentroidLat, area.geoCentroidLng], zoom);
  const center = (members: AreaEvidenceStack[]) => {
    const sum = members.map(pointOf).reduce((a, b) => a.add(b));
    return sum.divideBy(members.length);
  };
  let groups = areas.map((a) => ({ areas: [a], point: pointOf(a) }));
  // Merge the first overlapping pair until none is left; a merged group sits
  // at its members' center, which can bring it close to another group.
  for (;;) {
    let pair: [number, number] | null = null;
    for (let i = 0; i < groups.length && !pair; i++) {
      for (let j = i + 1; j < groups.length && !pair; j++) {
        if (groups[i].point.distanceTo(groups[j].point) < MIN_MARKER_DISTANCE_PX) pair = [i, j];
      }
    }
    if (!pair) break;
    const members = [...groups[pair[0]].areas, ...groups[pair[1]].areas];
    groups = [...groups.filter((_, k) => k !== pair![0] && k !== pair![1]), { areas: members, point: center(members) }];
  }
  return groups.map((g) => ({ areas: g.areas, position: map.unproject(g.point, zoom) }));
}

function AreaMarkers({ areas, onOpen }: { areas: AreaEvidenceStack[]; onOpen: (id: string) => void }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const groups = useMemo(() => groupNearbyAreas(areas, map, zoom), [areas, map, zoom]);

  return (
    <>
      {groups.map(({ areas: members, position }) => {
        if (members.length === 1) {
          const { area } = members[0];
          return (
            <Marker
              key={area.id}
              position={[area.geoCentroidLat, area.geoCentroidLng]}
              icon={areaMarkerIcon}
              title={`${area.name}, ${area.city}`}
              eventHandlers={{ click: () => onOpen(area.id) }}
            >
              <Popup>
                {area.name} · {area.city}
              </Popup>
            </Marker>
          );
        }
        const names = members.map(({ area }) => area.name);
        const zoomIn = () =>
          map.fitBounds(L.latLngBounds(members.map(({ area }) => [area.geoCentroidLat, area.geoCentroidLng])), {
            padding: [60, 60],
            maxZoom: map.getMaxZoom(),
          });
        return (
          <Marker
            key={members.map(({ area }) => area.id).join("+")}
            position={position}
            icon={areaGroupIcon(members.length)}
            title={`${members.length} areas: ${names.join(", ")}. Zoom in to see each one.`}
            eventHandlers={{ click: zoomIn }}
          />
        );
      })}
    </>
  );
}
