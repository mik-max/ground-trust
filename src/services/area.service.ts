import api from "./api";
import type { Area, AreaEvidenceStack, Aspect, Review } from "../types";

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

// Given a real-world point (from a geocode suggestion), finds the seeded
// Area whose geofence actually contains it, if any — see
// backend/src/controllers/area.controller.ts's findNearestArea.
export async function findNearestArea(lat: number, lng: number) {
  const { data } = await api.get<{ area: Area | null }>("/areas/nearest", { params: { lat, lng } });
  return data.area;
}

export async function submitReview(
  areaId: string,
  input: {
    originalText?: string;
    originalLanguage?: string;
    originalAudioRef?: string;
    ratings: Partial<Record<Aspect, number>>;
  }
) {
  const { data } = await api.post<{ review: Review }>(`/areas/${areaId}/reviews`, input);
  return data.review;
}
