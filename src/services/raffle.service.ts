import api from './api';
import type { Raffle, RaffleDetail, RaffleStatus, PaginatedResponse } from '../types';

interface ListRafflesParams {
  status?: RaffleStatus | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
}

export const listRaffles = (params: ListRafflesParams = {}) => {
  const { status, search, page = 1, limit = 12 } = params;
  const query: Record<string, string | number> = { page, limit };
  if (status && status !== 'ALL') query.status = status;
  if (search?.trim()) query.search = search.trim();
  return api.get<PaginatedResponse<Raffle>>('/raffles', { params: query });
};

export const getRaffle = (id: string) =>
  api.get<RaffleDetail>(`/raffles/${id}`);
