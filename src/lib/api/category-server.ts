import { cache } from "react";
import { extractCategories } from "@/lib/api/category";
import type { Category } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
const FETCH_TIMEOUT_MS = 8000;

async function fetchCategoryRecord(idOrSlug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API}/api/v1/categories/${encodeURIComponent(idOrSlug)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as Category) || null;
  } catch {
    return null;
  }
}

// Next.js does not URI-decode dynamic route segments, so a slug containing
// an encoded char (e.g. "&" in "Healthcare & Medical Services") arrives as
// literal "%26" text. Decode it once here so it isn't re-encoded downstream.
function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  if (!slug?.trim()) return null;
  return fetchCategoryRecord(decodeSlug(slug.trim()).toLowerCase());
});

export const getCategoryByIdServer = cache(async (id: string): Promise<Category | null> => {
  if (!id?.trim()) return null;
  return fetchCategoryRecord(id.trim());
});

async function fetchCategoryList(path: string): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/api/v1${path}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return extractCategories(json.data);
  } catch {
    return [];
  }
}

async function fetchAllCategoriesServer(): Promise<Category[]> {
  const all: Category[] = [];
  let page = 1;
  let pages = 1;

  do {
    try {
      const res = await fetch(
        `${API}/api/v1/categories?limit=100&page=${page}&isActive=true&sort=sortOrder`,
        { next: { revalidate: 300 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
      );
      if (!res.ok) break;
      const json = await res.json();
      all.push(...extractCategories(json.data));
      pages = json.data?.pagination?.pages ?? 1;
      page += 1;
    } catch {
      break;
    }
  } while (page <= pages);

  return all.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function pickTopCategories(
  trending: Category[],
  featured: Category[],
  all: Category[],
  limit = 12
): Category[] {
  const seen = new Set<string>();
  const result: Category[] = [];

  const add = (list: Category[]) => {
    for (const category of list) {
      if (result.length >= limit) break;
      if (!category._id || seen.has(category._id)) continue;
      seen.add(category._id);
      result.push(category);
    }
  };

  add(trending);
  add(featured);

  const byBusinessCount = [...all].sort(
    (a, b) => (b.businessCount ?? 0) - (a.businessCount ?? 0)
  );
  add(byBusinessCount);
  add(all);

  return result.slice(0, limit);
}

export const getTopCategoriesForHome = cache(async (limit = 12): Promise<Category[]> => {
  const [trending, featured, all] = await Promise.all([
    fetchCategoryList("/categories/trending/list"),
    fetchCategoryList("/categories/featured/list"),
    fetchAllCategoriesServer(),
  ]);

  const picked = pickTopCategories(trending, featured, all, limit);
  if (picked.length > 0) return picked;

  return all.slice(0, limit);
});

export const fetchAllCategoriesAllPages = cache(fetchAllCategoriesServer);

export const getTopCategoriesCount = cache(async (): Promise<number> => {
  try {
    const res = await fetch(`${API}/api/v1/categories?limit=1&isActive=true`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return 0;
    const json = await res.json();
    return json.data?.pagination?.total ?? extractCategories(json.data).length;
  } catch {
    return 0;
  }
});
