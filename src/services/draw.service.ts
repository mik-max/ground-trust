import api from './api';

export interface DrawResult {
  drawExecutedAt: string;
  participantCount: number;
  randomSeed: string;
  algorithm: string;
  winnerIds: string[];
  winnersCount: number;
}

export const executeDraw = (raffleId: string) =>
  api.post<DrawResult>(`/raffles/${raffleId}/draw`);
