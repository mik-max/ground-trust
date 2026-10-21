import api from "./api";
import type { Area, VerificationTier } from "../types";

export type TierProgress =
  | { toward: "tier1"; nights: number; nightsNeeded: number; windowDays: number }
  | { toward: "tier2"; daysConfirmed: number; daysNeeded: number }
  | null;

export interface Residency {
  userId: string;
  areaId: string;
  verificationTier: VerificationTier;
  confirmedSince: string | null;
  trustWeight: number;
  area: Pick<Area, "id" | "name" | "city" | "state" | "status">;
  progress: TierProgress;
  // When a fresh night-time check is needed to keep this status.
  keepBy: string | null;
  lastReviewedAt: string | null;
}

export async function getVerificationStatus() {
  const { data } = await api.get<{ residencies: Residency[] }>("/verification/status");
  return data.residencies;
}

export async function postGpsSample(areaId: string, lat: number, lng: number, accuracy: number) {
  const { data } = await api.post<{ residency: Residency }>("/verification/gps-sample", { areaId, lat, lng, accuracy });
  return data.residency;
}
