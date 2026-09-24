import api from "./api";
import type { Aspect, Flag, FlagResponseStatus } from "../types";

export async function listFlags(aspect?: Aspect) {
  const { data } = await api.get<{ flags: Flag[] }>("/gov/flags", { params: { aspect } });
  return data.flags;
}

export async function respondToFlag(id: string, status: Exclude<FlagResponseStatus, "unacknowledged">, note?: string) {
  const { data } = await api.patch<{ flag: Flag }>(`/gov/flags/${id}/response`, { status, note });
  return data.flag;
}
