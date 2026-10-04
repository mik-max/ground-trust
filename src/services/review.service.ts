import api from "./api";
import type { ReviewReportReason } from "../types";

export async function reportReview(reviewId: string, reason: ReviewReportReason, note?: string) {
  await api.post(`/reviews/${reviewId}/report`, { reason, note: note?.trim() || undefined });
}
