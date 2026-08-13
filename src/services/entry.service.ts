import api from './api';

export interface MyEntry {
  id: string;
  createdAt: string;
  won: boolean;
  raffle: {
    id: string;
    name: string;
    prize: string;
    status: string;
    drawDate: string;
    endDate: string;
    winnersCount: number;
    auditLog: { winnerIds: string[] } | null;
  };
}

export const enterRaffle = (raffleId: string) =>
  api.post<{ id: string; createdAt: string; isFlagged: boolean }>(`/raffles/${raffleId}/enter`);

export const getMyEntry = (raffleId: string) =>
  api.get<{ entry: { id: string; createdAt: string; isFlagged: boolean } | null }>(`/raffles/${raffleId}/my-entry`);

export const getMyEntries = () =>
  api.get<{ data: MyEntry[] }>('/me/entries');
