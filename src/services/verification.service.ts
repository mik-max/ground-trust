import api from "./api";
import type { Area, VerificationTier } from "../types";

export interface Residency {
  userId: string;
  areaId: string;
  verificationTier: VerificationTier;
  confirmedSince: string | null;
  trustWeight: number;
  area: Pick<Area, "id" | "name" | "city" | "state">;
}

export async function getVerificationStatus() {
  const { data } = await api.get<{ residencies: Residency[] }>("/verification/status");
  return data.residencies;
}
