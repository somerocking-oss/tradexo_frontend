import { cache } from "react";
import { extractBusinessList, extractPagination } from "@/lib/api/business";
import type { Business } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
const FETCH_TIMEOUT_MS = 8000;

async function fetchBusinessesServer(params: Record<string, string | number | boolean>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  try {
    const res = await fetch(`${API}/api/v1/businesses?${query.toString()}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) return [] as Business[];
    const json = await res.json();
    return extractBusinessList(json.data);
  } catch {
    return [] as Business[];
  }
}

export interface CategorySampleSection {
  category: { _id: string; name: string; slug: string; icon?: string };
  businesses: Business[];
}

export const getCategorySampleBusinessesServer = cache(
  async (itemsPerCategory = 6, categoriesLimit = 16): Promise<CategorySampleSection[]> => {
    try {
      const res = await fetch(
        `${API}/api/v1/businesses/category-samples?itemsPerCategory=${itemsPerCategory}&categoriesLimit=${categoriesLimit}`,
        { next: { revalidate: 300 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
      );
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch {
      return [];
    }
  }
);

export const getBusinessByIdServer = cache(async (id: string): Promise<Business | null> => {
  try {
    const res = await fetch(`${API}/api/v1/businesses/${id}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
});

export const getLatestBusinessesServer = cache(async (limit = 12) =>
  fetchBusinessesServer({ limit, sort: "newest" })
);

export const getFeaturedBusinessesServer = cache(async (limit = 8) => {
  const featured = await fetchBusinessesServer({
    limit,
    sort: "featured",
    isFeatured: true,
  });
  if (featured.length > 0) return featured;
  return fetchBusinessesServer({ limit, sort: "popular" });
});

export const searchBusinessesServer = cache(
  async (params: Record<string, string | number | boolean | undefined>) => {
    const json = await fetchBusinessSearchJson(params);
    return extractBusinessList(json?.data);
  }
);

async function fetchBusinessSearchJson(
  params: Record<string, string | number | boolean | undefined>
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== false) {
      query.set(key, String(value));
    }
  });

  try {
    const res = await fetch(`${API}/api/v1/business/search?${query.toString()}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Like searchBusinessesServer, but also returns pagination metadata so the
// initial server-rendered page can seed correct totalPages state instead of
// defaulting to 1 (which hid the pagination controls on first load).
export const searchBusinessesServerWithMeta = cache(
  async (params: Record<string, string | number | boolean | undefined>) => {
    const json = await fetchBusinessSearchJson(params);
    const businesses = extractBusinessList(json?.data);
    const pagination = extractPagination(json?.data);
    return {
      businesses,
      total: pagination?.total ?? businesses.length,
      totalPages: pagination?.totalPages ?? 1,
    };
  }
);

/** Cheap total-only lookup for a city/category/subcategory combo — used to
 *  decide whether a combo page has enough real content to be indexable.
 *  Search filters by categoryId/subCategoryId, not slug (see
 *  searchBusinessesServerWithMeta callers in loadListingsPage.ts), so this
 *  takes ids even though every caller only has slugs on hand at first. */
export const getCategoryCityBusinessCount = cache(
  async (params: { city?: string; categoryId?: string; subCategoryId?: string }) => {
    const { total } = await searchBusinessesServerWithMeta({ ...params, limit: 1 });
    return total;
  }
);

/** Same idea as getCategoryCityBusinessCount, for role×city pages
 *  (/manufacturers-in-{city}) — gates indexability the same way. */
export const getRoleBusinessCount = cache(
  async (params: { city?: string; marketplaceType?: string }) => {
    const { total } = await searchBusinessesServerWithMeta({ ...params, limit: 1 });
    return total;
  }
);

export interface StateDirectoryEntry {
  state: string;
  slug: string;
  count: number;
  cityCount: number;
}

export interface CityDirectoryEntry {
  city: string;
  slug: string;
  count: number;
}

export const getStatesServer = cache(async (): Promise<StateDirectoryEntry[]> => {
  try {
    const res = await fetch(`${API}/api/v1/businesses/states`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
});

export const getCitiesByStateServer = cache(
  async (state: string): Promise<CityDirectoryEntry[]> => {
    try {
      const res = await fetch(
        `${API}/api/v1/businesses/states/${encodeURIComponent(state)}/cities`,
        { next: { revalidate: 3600 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
      );
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch {
      return [];
    }
  }
);

export interface CityCategoryCombo {
  city: string;
  citySlug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  count: number;
}

export const getCityCategoryCombosServer = cache(
  async (): Promise<CityCategoryCombo[]> => {
    try {
      const res = await fetch(`${API}/api/v1/businesses/seo/city-category-combos`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch {
      return [];
    }
  }
);

export interface CityCategorySubCategoryCombo {
  city: string;
  citySlug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  subCategoryId: string;
  subCategoryName: string;
  subCategorySlug: string;
  count: number;
}

export const getCityCategorySubCategoryCombosServer = cache(
  async (): Promise<CityCategorySubCategoryCombo[]> => {
    try {
      const res = await fetch(
        `${API}/api/v1/businesses/seo/city-category-subcategory-combos`,
        { next: { revalidate: 3600 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
      );
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch {
      return [];
    }
  }
);

export async function getTrendingSearchesServer(limit = 8): Promise<string[]> {
  try {
    const res = await fetch(`${API}/api/v1/search/trending`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data;
    if (!Array.isArray(data)) return [];
    return data
      .map((item: { _id?: string; keyword?: string }) => item._id || item.keyword || "")
      .filter(Boolean)
      .slice(0, limit);
  } catch {
    return [];
  }
}
