const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
const FETCH_TIMEOUT_MS = 8000;

export type SeoLandingPage = {
  city: string;
  keyword: string;
  categoryId?: string;
  categorySlug?: string;
  path: string;
  slug: string;
  title: string;
};

export async function fetchSeoLandingPages(params?: {
  page?: number;
  limit?: number;
  city?: string;
  keyword?: string;
  q?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.city) query.set("city", params.city);
  if (params?.keyword) query.set("keyword", params.keyword);
  if (params?.q) query.set("q", params.q);

  const fallback = { pages: [] as SeoLandingPage[], pagination: { total: 0, page: 1, limit: 48, pages: 1 } };

  try {
    const res = await fetch(`${API}/api/v1/seo-landing-pages?${query.toString()}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) return fallback;

    const json = await res.json();
    const payload = json.data || json;
    return {
      pages: (payload.pages || []) as SeoLandingPage[],
      pagination: payload.pagination || fallback.pagination,
    };
  } catch {
    return fallback;
  }
}
