import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";

export interface BusinessOffer {
  _id: string;
  business: string;
  title: string;
  description?: string;
  discount?: string;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
}

export async function getBusinessOffers(businessId: string, activeOnly = true) {
  return apiGet<BusinessOffer[]>("/business-offers/business/" + businessId, {
    activeOnly,
  });
}

export async function createOffer(payload: {
  businessId: string;
  title: string;
  description?: string;
  discount?: string;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
}) {
  return apiPost<BusinessOffer>("/business-offers", payload);
}

export async function updateOffer(id: string, payload: Partial<BusinessOffer>) {
  return apiPut<BusinessOffer>(`/business-offers/${id}`, payload);
}

export async function deleteOffer(id: string) {
  return apiDelete(`/business-offers/${id}`);
}

export function extractOfferList(data: unknown): BusinessOffer[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}
