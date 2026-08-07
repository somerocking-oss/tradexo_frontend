import { apiGet } from "@/lib/api/client";

export interface SearchSuggestion {
  _id: string;
  name: string;
  slug?: string;
  marketplaceType?: string;
  sellerIntent?: string;
}

export async function getSearchAutocomplete(keyword: string) {
  if (!keyword.trim()) return { success: true, data: [] as SearchSuggestion[] };
  return apiGet<SearchSuggestion[]>("/search/autocomplete", { keyword: keyword.trim() });
}

export async function getTrendingSearches() {
  return apiGet<{ _id: string; count: number }[] | { keyword: string }[]>("/search/trending");
}

export function extractTrendingKeywords(data: unknown): string[] {
  if (!data) return [];
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null) {
        const obj = item as { _id?: string; keyword?: string; count?: number };
        return obj._id || obj.keyword || "";
      }
      return "";
    })
    .filter(Boolean);
}
