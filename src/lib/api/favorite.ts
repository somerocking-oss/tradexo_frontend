import { apiGet, apiPost } from "@/lib/api/client";
import type { Business } from "@/types";

export interface FavoriteRecord {
  _id: string;
  businessId: Business;
  isActive: boolean;
}

export async function getFavorites() {
  return apiGet<FavoriteRecord[]>("/favorites");
}

export async function toggleFavorite(businessId: string) {
  return apiPost<{ favorited: boolean; favorite: FavoriteRecord }>(
    `/favorites/${businessId}`
  );
}

export async function checkFavorite(businessId: string) {
  return apiGet<{ favorited: boolean }>(`/favorites/check/${businessId}`);
}
