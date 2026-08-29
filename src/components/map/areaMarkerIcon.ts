import L from "leaflet";

// Leaflet's bundled default marker is blue and clashes with the green
// palette — a plain inline SVG divIcon avoids shipping/importing marker
// image assets just to recolor a pin.
const PIN_SVG = `
<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
  <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21s13-11.25 13-21C26 5.82 20.18 0 13 0z" fill="#128066"/>
  <circle cx="13" cy="13" r="5.5" fill="#ffffff"/>
</svg>`;

export const areaMarkerIcon = L.divIcon({
  html: PIN_SVG,
  className: "",
  iconSize: [26, 34],
  iconAnchor: [13, 34],
  popupAnchor: [0, -32],
});
