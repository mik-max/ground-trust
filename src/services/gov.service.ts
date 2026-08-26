import api from "./api";
import type { Aspect, Flag } from "../types";

export async function listFlags(aspect?: Aspect) {
  const { data } = await api.get<{ flags: Flag[] }>("/gov/flags", { params: { aspect } });
  return data.flags;
}
