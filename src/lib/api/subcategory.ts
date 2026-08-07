import { apiGet } from "@/lib/api/client";
import type { SubCategory } from "@/types";

interface SubCategoriesPayload {
  subcategories?: SubCategory[];
  data?: SubCategory[];
  items?: SubCategory[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export function extractSubCategories(data: unknown): SubCategory[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const obj = data as SubCategoriesPayload;
  return obj.subcategories || obj.data || obj.items || [];
}

export async function getSubCategories(params?: Record<string, unknown>) {
  return apiGet<SubCategoriesPayload>("/subcategories", {
    limit: 100,
    isActive: true,
    sort: "sortOrder",
    ...params,
  });
}

export async function fetchSubCategoriesForCategory(categoryId: string): Promise<SubCategory[]> {
  if (!categoryId) return [];

  const all: SubCategory[] = [];
  let page = 1;
  let pages = 1;

  do {
    const res = await getSubCategories({
      category: categoryId,
      page,
      limit: 100,
      isActive: true,
      sort: "sortOrder",
    });
    if (!res.success || !res.data) break;

    all.push(...extractSubCategories(res.data));
    const payload = res.data as SubCategoriesPayload;
    pages = payload.pagination?.pages ?? 1;
    page += 1;
  } while (page <= pages);

  return all;
}

export async function getSubCategoryById(id: string) {
  return apiGet<SubCategory>(`/subcategories/${id}`);
}
