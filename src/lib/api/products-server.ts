import { cache } from "react";
import type { MarketplaceProduct } from "@/lib/api/products";
import { API_URL as API } from "@/lib/api-url";
const FETCH_TIMEOUT_MS = 8000;

export interface ProductDetailResponse {
  product: MarketplaceProduct;
  similar: MarketplaceProduct[];
}

export const getProductBySlugServer = cache(
  async (slug: string): Promise<ProductDetailResponse | null> => {
    try {
      const res = await fetch(`${API}/api/v1/business-services/slug/${slug}`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }
);

export const getTrendingProductsServer = cache(
  async (limit = 8): Promise<MarketplaceProduct[]> => {
    try {
      const res = await fetch(
        `${API}/api/v1/business-services/marketplace?sort=trending&inStock=true&limit=${limit}`,
        { next: { revalidate: 120 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
      );
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.items || [];
    } catch {
      return [];
    }
  }
);
