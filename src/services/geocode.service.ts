import api from "./api";

export interface GeocodeSuggestion {
  label: string;
  lat: number;
  lng: number;
}

// Proxied through our own backend (see backend/src/controllers/geocode.controller.ts)
// rather than calling Nominatim directly — see that file for why.
export async function searchLocations(query: string): Promise<GeocodeSuggestion[]> {
  const { data } = await api.get<{ results: GeocodeSuggestion[] }>("/geocode/search", {
    params: { q: query },
  });
  return data.results;
}
