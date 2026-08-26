import api from "./api";
import type { GovernmentAccount } from "../types";

export async function listGovernmentAccounts() {
  const { data } = await api.get<{ accounts: GovernmentAccount[] }>("/admin/government-accounts");
  return data.accounts;
}

export async function createGovernmentAccount(input: { fullName: string; email: string; password: string }) {
  const { data } = await api.post<{ account: GovernmentAccount }>("/admin/government-accounts", input);
  return data.account;
}
