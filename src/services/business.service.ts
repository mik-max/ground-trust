import api from './api';
import type { Raffle } from '../types';

export interface CreateRafflePayload {
  name: string;
  description: string;
  prize: string;
  startDate: string;
  endDate: string;
  drawDate: string;
  maxParticipants?: number | null;
  winnersCount: number;
}

export const createRaffle = (payload: CreateRafflePayload) =>
  api.post<Raffle>('/raffles', payload);

export const getMyRaffles = () =>
  api.get<{ data: (Raffle & { entriesCount: number })[] }>('/raffles/mine');
