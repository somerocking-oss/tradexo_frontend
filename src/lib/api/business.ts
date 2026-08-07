import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
import type { Business, BusinessSearchParams, PaginatedResponse } from "@/types";
import { normalizeSearchBusiness } from "@/lib/geo";

export async function getBusinesses(params?: Record<string, unknown>) {
  return apiGet<PaginatedResponse<Business> | Business[]>("/businesses", params);
}

export async function getMyBusinesses() {
  return apiGet<Business[]>("/businesses/my");
}

export async function getBusinessById(id: string) {
  return apiGet<Business>(`/businesses/${id}`);
}

export async function getSimilarBusinesses(id: string, limit = 6) {
  return apiGet<Business[]>(`/businesses/${id}/similar`, { limit });
}

export async function searchBusinesses(params: BusinessSearchParams) {
  return apiGet<PaginatedResponse<Business> | Business[]>("/business/search", params as Record<string, unknown>);
}

export async function createBusiness(formData: FormData) {
  const api = (await import("@/lib/api/client")).default;
  const { data } = await api.post("/businesses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function checkDuplicateBusiness(params: {
  name: string;
  city?: string;
  mobile?: string;
}) {
  return apiGet<{ duplicate: boolean; business?: Business }>(
    "/businesses/check-duplicate",
    params as Record<string, unknown>
  );
}

export async function updateBusinessWithFiles(id: string, formData: FormData) {
  const api = (await import("@/lib/api/client")).default;
  const { data } = await api.put(`/businesses/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateBusiness(id: string, payload: Record<string, unknown>) {
  return apiPut<Business>(`/businesses/${id}`, payload);
}

export async function deleteBusiness(id: string) {
  return apiDelete(`/businesses/${id}`);
}

export async function testBusinessWebhook(id: string) {
  return apiPost<{ success: boolean; status?: number; error?: string }>(
    `/businesses/${id}/webhook-test`
  );
}

export function extractBusinessList(data: unknown): Business[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.map((item) => normalizeSearchBusiness(normalizeBusiness(item)));
  const obj = data as PaginatedResponse<Business>;
  const list = obj.items || obj.businesses || obj.data || [];
  return Array.isArray(list) ? list.map((item) => normalizeSearchBusiness(normalizeBusiness(item))) : [];
}

function normalizeBusiness(business: Business): Business {
  if (business._id) return business;
  const legacyId = (business as Business & { id?: string }).id;
  return legacyId ? { ...business, _id: legacyId } : business;
}

export function extractPagination(data: unknown) {
  if (!data || Array.isArray(data)) return null;
  const obj = data as PaginatedResponse<Business> & {
    pagination?: { total?: number; page?: number; limit?: number; pages?: number; totalPages?: number };
    meta?: { total?: number; page?: number; limit?: number; pages?: number; totalPages?: number };
  };
  const raw = obj.pagination || obj.meta;
  if (!raw) return null;

  const total = Number(raw.total ?? 0);
  const page = Number(raw.page ?? 1);
  const limit = Math.max(1, Number(raw.limit ?? 12));
  const totalPages = Math.max(
    1,
    Number(raw.totalPages ?? raw.pages ?? (Math.ceil(total / limit) || 1))
  );

  return { total, page, limit, totalPages };
}
