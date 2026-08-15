import axios from 'axios';

const publicApi = axios.create({ baseURL: '/api' });

export interface VerifyResult {
  id: string;
  name: string;
  prize: string;
  status: string;
  drawDate: string;
  winnersCount: number;
  algorithm: string;
  entriesCount: number;
  auditLog: {
    id: string;
    drawExecutedAt: string;
    participantCount: number;
    randomSeed: string;
    algorithm: string;
    winnerIds: string[];
    createdAt: string;
  } | null;
}

export const verifyDraw = (raffleId: string) =>
  publicApi.get<VerifyResult>(`/verify/${raffleId}`);
