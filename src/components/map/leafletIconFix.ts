import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Leaflet's default marker icon resolves image paths relative to its own
// CSS file, which breaks under a bundler (a well-known Leaflet+Vite/webpack
// issue, not specific to this project). Fixed the standard way: delete the
// broken path-resolution method and point the default icon at the
// bundler-resolved asset URLs instead. Importing this module (once, at the
// app's entry point) is enough — every <Marker> then renders correctly.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
