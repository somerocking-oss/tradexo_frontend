import { apiGet } from "@/lib/api/client";
import type { Category } from "@/types";
import type { ProviderType } from "@/lib/business-registration";

interface CategoriesPayload {
  categories?: Category[];
  data?: Category[];
  items?: Category[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/** Normalizes API responses — backend returns { categories, pagination } */
export function extractCategories(data: unknown): Category[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const obj = data as CategoriesPayload;
  return obj.categories || obj.data || obj.items || [];
}

export async function getCategories(params?: Record<string, unknown>) {
  return apiGet<CategoriesPayload>("/categories", {
    limit: 100,
    isActive: true,
    sort: "sortOrder",
    ...params,
  });
}

export async function getFeaturedCategories() {
  return apiGet<Category[] | CategoriesPayload>("/categories/featured/list");
}

export async function getTrendingCategories() {
  return apiGet<Category[] | CategoriesPayload>("/categories/trending/list");
}

export async function getCategoryById(id: string) {
  return apiGet<Category>(`/categories/${id}`);
}

export async function fetchCategoriesList(params?: Record<string, unknown>): Promise<Category[]> {
  const res = await getCategories(params);
  if (!res.success) return [];
  return extractCategories(res.data);
}

/** Fetch all pages of active categories (75+ taxonomy) */
export async function fetchAllCategories(params?: Record<string, unknown>): Promise<Category[]> {
  const all: Category[] = [];
  let page = 1;
  let pages = 1;

  do {
    const res = await getCategories({
      ...params,
      page,
      limit: 100,
      isActive: true,
      sort: "sortOrder",
    });
    if (!res.success || !res.data) break;

    all.push(...extractCategories(res.data));
    const payload = res.data as CategoriesPayload;
    pages = payload.pagination?.pages ?? 1;
    page += 1;
  } while (page <= pages);

  return all.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/** Homepage: featured first, then homepage flag, then top by sort order */
export function pickHomepageCategories(categories: Category[], limit = 12): Category[] {
  const featured = categories.filter((c) => c.isFeatured || c.showOnHomepage);
  const source = featured.length >= 4 ? featured : categories;
  return source.slice(0, limit);
}

/** Registration: filter taxonomy by product vs service business type */
export function filterCategoriesForProvider(
  categories: Category[],
  providerType: ProviderType | ""
): Category[] {
  if (!providerType) return categories;

  if (providerType === "service") {
    return categories.filter(
      (c) =>
        c.marketplaceVertical === "local_service" ||
        c.marketplaceVertical === "hybrid" ||
        !c.marketplaceVertical
    );
  }

  return categories.filter(
    (c) =>
      c.marketplaceVertical === "b2b_product" ||
      c.marketplaceVertical === "supplier" ||
      c.marketplaceVertical === "hybrid" ||
      !c.marketplaceVertical
  );
}
