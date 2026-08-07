import { apiGet, apiPost } from "@/lib/api/client";
import type { Review } from "@/types";

export async function getBusinessReviews(businessId: string) {
  return apiGet<Review[]>(`/reviews/business/${businessId}`);
}

export async function createReview(payload: {
  businessId: string;
  rating: number;
  comment?: string;
}) {
  return apiPost<Review>("/reviews", payload);
}
