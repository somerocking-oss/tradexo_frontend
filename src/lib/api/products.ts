import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
import type { BusinessCatalogItem, Business } from "@/types";

export interface MarketplaceProduct extends BusinessCatalogItem {
  business?: Pick<
    Business,
    | "_id"
    | "name"
    | "slug"
    | "city"
    | "state"
    | "phone"
    | "mobile"
    | "whatsapp"
    | "isVerified"
    | "isFeatured"
    | "logo"
    | "averageRating"
    | "rating"
    | "establishmentYear"
    | "description"
    | "shortDescription"
  >;
  category?: { _id: string; name: string; slug?: string };
}

export interface MarketplaceProductsResponse {
  items: MarketplaceProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductsSearchParams {
  keyword?: string;
  categoryId?: string;
  city?: string;
  inStock?: boolean;
  itemType?: "product" | "service";
  page?: number;
  limit?: number;
}

export async function fetchMarketplaceProducts(params: ProductsSearchParams = {}) {
  return apiGet<MarketplaceProductsResponse>("/business-services/marketplace", params as Record<string, unknown>);
}

export interface BusinessPreviewItem {
  name: string;
  itemType: "product" | "service";
}

/** Up to 3 product/service names per business, batched for listing-card chips. */
export async function fetchBusinessPreviewItems(businessIds: string[]) {
  const ids = businessIds.filter(Boolean);
  if (ids.length === 0) return {} as Record<string, BusinessPreviewItem[]>;
  const res = await apiGet<Record<string, BusinessPreviewItem[]>>("/business-services/preview", {
    businessIds: ids.join(","),
  });
  return res.success && res.data ? res.data : ({} as Record<string, BusinessPreviewItem[]>);
}

export async function fetchBusinessProducts(businessId: string) {
  return apiGet<MarketplaceProductsResponse>("/business-services", {
    businessId,
  });
}

export async function createBusinessProduct(data: {
  businessId: string;
  name: string;
  itemType: "product" | "service";
  description?: string;
  price?: number;
  priceType?: string;
  brand?: string;
  unit?: string;
  minimumOrderQuantity?: number;
  inStock?: boolean;
}) {
  return apiPost<BusinessCatalogItem>("/business-services", data);
}

export interface BulkImportRow {
  name: string;
  itemType?: "product" | "service";
  description?: string;
  price?: number;
  priceType?: string;
  brand?: string;
  unit?: string;
  minimumOrderQuantity?: number;
  inStock?: boolean;
}

export interface BulkImportResult {
  created: BusinessCatalogItem[];
  errors: { row: number; message: string }[];
}

export async function bulkCreateBusinessProducts(businessId: string, items: BulkImportRow[]) {
  return apiPost<BulkImportResult>("/business-services/bulk", { businessId, items });
}

export async function updateBusinessProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    priceType: string;
    brand: string;
    unit: string;
    minimumOrderQuantity: number;
    inStock: boolean;
  }>
) {
  return apiPut<BusinessCatalogItem>(`/business-services/${id}`, data);
}

export async function deleteBusinessProduct(id: string) {
  return apiDelete<null>(`/business-services/${id}`);
}

export async function uploadProductImage(productId: string, imageFile: File) {
  const api = (await import("@/lib/api/client")).default;
  const fd = new FormData();
  fd.append("image", imageFile);
  const { data } = await api.post<{ success: boolean; data: BusinessCatalogItem }>(
    `/business-services/${productId}/image`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function uploadProductVideo(productId: string, videoFile: File) {
  const api = (await import("@/lib/api/client")).default;
  const fd = new FormData();
  fd.append("productVideo", videoFile);
  const { data } = await api.post<{ success: boolean; data?: BusinessCatalogItem; message?: string }>(
    `/business-services/${productId}/video`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deleteProductVideo(productId: string, publicId: string) {
  return apiDelete<BusinessCatalogItem>(
    `/business-services/${productId}/video/${encodeURIComponent(publicId)}`
  );
}
