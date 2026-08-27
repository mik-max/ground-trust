import api from "./api";
import type { Area, GovernmentAccount, Review } from "../types";

export async function listGovernmentAccounts() {
  const { data } = await api.get<{ accounts: GovernmentAccount[] }>("/admin/government-accounts");
  return data.accounts;
}

export async function createGovernmentAccount(input: { fullName: string; email: string; password: string }) {
  const { data } = await api.post<{ account: GovernmentAccount }>("/admin/government-accounts", input);
  return data.account;
}

export type PendingReview = Omit<Review, "tierAtSubmission"> & {
  area: Pick<Area, "id" | "name" | "city" | "state">;
};

export async function listPendingReviews() {
  const { data } = await api.get<{ reviews: PendingReview[] }>("/admin/reviews/pending");
  return data.reviews;
}

export async function moderateReview(reviewId: string, decision: "approved" | "rejected") {
  const { data } = await api.post<{ review: PendingReview }>(`/admin/reviews/${reviewId}/moderate`, { decision });
  return data.review;
}
