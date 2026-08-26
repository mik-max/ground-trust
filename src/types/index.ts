export type Aspect = "power" | "water" | "security" | "roads_flooding" | "accessibility";
export type Band = "poor" | "fair" | "good" | "excellent";
export type ConfidenceLevel = "low" | "medium" | "high";
export type Role = "resident" | "newcomer" | "government" | "admin";
export type VerificationTier = "tier0" | "tier1" | "tier2" | "tier3";

export interface Area {
  id: string;
  name: string;
  city: string;
  state: string;
  geoCentroidLat: number;
  geoCentroidLng: number;
  geoRadiusMeters: number;
}

export interface AspectScore {
  aspect: Aspect;
  score: number | null;
  band: Band | null;
  N: number;
  confidence: ConfidenceLevel;
}

export interface AreaEvidenceStack {
  area: Area;
  overall: {
    score: number | null;
    band: Band | null;
    N: number;
    confidence: ConfidenceLevel;
  };
  aspects: AspectScore[];
}

export interface Review {
  id: string;
  areaId: string;
  userId: string;
  user?: { id: string; fullName: string };
  originalText: string | null;
  originalLanguage: string | null;
  translatedText: string | null;
  submittedAt: string;
  ratingPower: number | null;
  ratingWater: number | null;
  ratingSecurity: number | null;
  ratingRoadsFlooding: number | null;
  ratingAccessibility: number | null;
  tierAtSubmission: VerificationTier;
}

export interface Flag {
  id: string;
  areaId: string;
  area?: Area;
  aspect: Aspect;
  triggeredAt: string;
  consecutiveWeeksBelowThreshold: number;
  resolved: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}
