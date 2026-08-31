import api from "./api";
import type { Area, AreaEvidenceStack, Review } from "../types";
import type { ReviewInput } from "../components/ReviewComposer";

export async function listAreas(query?: string) {
  const { data } = await api.get<{ areas: AreaEvidenceStack[] }>("/areas", { params: { query } });
  return data.areas;
}

export async function getArea(id: string) {
  const { data } = await api.get<AreaEvidenceStack>(`/areas/${id}`);
  return data;
}

export async function getAreaReviews(id: string, page = 1) {
  const { data } = await api.get<{ reviews: Review[]; page: number; pageSize: number; total: number }>(
    `/areas/${id}/reviews`,
    { params: { page } }
  );
  return data;
}

// Proposes a new area — starts "pending" until an admin approves it (see
// admin.service.ts's moderateArea), so it won't show up in listAreas or
// findNearestArea until then. An optional `review` bundles the proposer's
// own review of the place into the same request — see ProposeArea.tsx —
// rather than making them come back separately once it's approved.
export async function createArea(input: {
  name: string;
  city: string;
  state: string;
  geoCentroidLat: number;
  geoCentroidLng: number;
  review?: ReviewInput;
}) {
  const { data } = await api.post<{ area: Area; review: Review | null }>("/areas", input);
  return data.area;
}

// Given a real-world point (from a geocode suggestion), finds the seeded
// Area whose geofence actually contains it, if any — see
// backend/src/controllers/area.controller.ts's findNearestArea.
export async function findNearestArea(lat: number, lng: number) {
  const { data } = await api.get<{ area: Area | null }>("/areas/nearest", { params: { lat, lng } });
  return data.area;
}

export async function submitReview(areaId: string, input: ReviewInput) {
  const { data } = await api.post<{ review: Review }>(`/areas/${areaId}/reviews`, input);
  return data.review;
}
