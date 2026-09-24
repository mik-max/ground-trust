export type Aspect = "power" | "water" | "security" | "roads_flooding" | "accessibility";
export type Band = "poor" | "fair" | "good" | "excellent";
export type ConfidenceLevel = "low" | "medium" | "high";
export type Role = "resident" | "government" | "admin";
export type VerificationTier = "tier0" | "tier1" | "tier2" | "tier3";

export type AreaStatus = "approved" | "pending" | "rejected";

export interface Area {
  id: string;
  name: string;
  city: string;
  state: string;
  geoCentroidLat: number;
  geoCentroidLng: number;
  geoRadiusMeters: number;
  status: AreaStatus;
  createdByUserId: string | null;
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
  originalAudioRef: string | null;
  hasVoiceRecording: boolean;
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
  responseStatus: FlagResponseStatus;
  responseNote: string | null;
  respondedAt: string | null;
  respondedBy?: { id: string; fullName: string } | null;
}

export type FlagResponseStatus = "unacknowledged" | "acknowledged" | "in_progress";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface GovernmentAccount {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}
