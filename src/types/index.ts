export type Role = 'PARTICIPANT' | 'BUSINESS';
export type RaffleStatus = 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type DrawAlgorithm = 'UNIFORM' | 'WEIGHTED';

export interface RaffleCreator {
  id: string;
  name: string;
  businessName: string | null;
}

export interface Raffle {
  id: string;
  name: string;
  description: string;
  prize: string;
  status: RaffleStatus;
  startDate: string;
  endDate: string;
  drawDate: string;
  maxParticipants: number | null;
  winnersCount: number;
  algorithm: DrawAlgorithm;
  entriesCount: number;
  createdAt: string;
  createdBy: RaffleCreator;
}

export interface AuditLog {
  id: string;
  drawExecutedAt: string;
  participantCount: number;
  randomSeed: string;
  algorithm: DrawAlgorithm;
  winnerIds: string[];
  createdAt: string;
}

export interface RaffleDetail extends Raffle {
  auditLog: AuditLog | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessName: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: { msg: string; path: string }[];
}
