import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";

export interface BusinessBranch {
  _id: string;
  business: string;
  name: string;
  city: string;
  area?: string;
  mobile?: string;
}

export async function getBusinessBranches(businessId: string) {
  return apiGet<BusinessBranch[]>("/business-branches", { businessId });
}

export async function createBranch(payload: {
  businessId: string;
  name: string;
  city: string;
  area?: string;
  mobile?: string;
}) {
  return apiPost<BusinessBranch>("/business-branches", payload);
}

export async function updateBranch(branchId: string, payload: Partial<BusinessBranch>) {
  return apiPut<BusinessBranch>(`/business-branches/${branchId}`, payload);
}

export async function deleteBranch(branchId: string) {
  return apiDelete(`/business-branches/${branchId}`);
}

export function extractBranchList(data: unknown): BusinessBranch[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}
