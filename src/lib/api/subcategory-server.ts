import { cache } from "react";
import { extractSubCategories } from "@/lib/api/subcategory";
import type { SubCategory } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
const FETCH_TIMEOUT_MS = 8000;

async function fetchSubCategoryRecord(
  idOrSlug: string,
  categoryId?: string
): Promise<SubCategory | null> {
  try {
    const qs = categoryId ? `?category=${encodeURIComponent(categoryId)}` : "";
    const res = await fetch(
      `${API}/api/v1/subcategories/${encodeURIComponent(idOrSlug)}${qs}`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as SubCategory) || null;
  } catch {
    return null;
  }
}

export const getSubCategoryBySlug = cache(
  async (slug: string, categoryId?: string): Promise<SubCategory | null> => {
    if (!slug?.trim()) return null;
    return fetchSubCategoryRecord(slug.trim().toLowerCase(), categoryId);
  }
);

export const getSubCategoryByIdServer = cache(async (id: string): Promise<SubCategory | null> => {
  if (!id?.trim()) return null;
  return fetchSubCategoryRecord(id.trim());
});

export async function fetchSubCategoriesForCategoryServer(
  categoryId: string
): Promise<SubCategory[]> {
  if (!categoryId) return [];

  const all: SubCategory[] = [];
  let page = 1;
  let pages = 1;

  do {
    try {
      const res = await fetch(
        `${API}/api/v1/subcategories?category=${encodeURIComponent(categoryId)}&limit=100&page=${page}&isActive=true&sort=sortOrder`,
        { next: { revalidate: 300 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
      );
      if (!res.ok) break;
      const json = await res.json();
      all.push(...extractSubCategories(json.data));
      pages = json.data?.pagination?.pages ?? 1;
      page += 1;
    } catch {
      break;
    }
  } while (page <= pages);

  return all.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function subCategoryToSlug(subCategory: { slug?: string; name: string }) {
  if (subCategory.slug?.trim()) return subCategory.slug.trim().toLowerCase();
  return subCategory.name.trim().toLowerCase().replace(/\s+/g, "-");
}
