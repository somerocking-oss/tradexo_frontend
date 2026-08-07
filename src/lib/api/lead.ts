import { apiGet, apiPost } from "@/lib/api/client";
import type { Lead } from "@/types";
import type { BuyerRfq, BuyerRfqDetail } from "@/types";

export async function createLead(payload: {
  businessId?: string;
  customerName: string;
  phone: string;
  email?: string;
  message?: string;
  type?: string;
  name?: string;
  mobile?: string;
  leadType?: string;
}) {
  const body = {
    businessId: payload.businessId,
    customerName: payload.customerName || payload.name || "",
    phone: (payload.phone || payload.mobile || "").replace(/\D/g, "").slice(-10),
    email: payload.email,
    message: payload.message,
    type: payload.type || payload.leadType || "enquiry",
  };

  return apiPost<Lead>("/leads", body);
}

export async function createRfq(payload: {
  productName: string;
  customerName: string;
  phone: string;
  email?: string;
  message?: string;
  requirement?: string;
  quantity?: number;
  unit?: string;
  deliveryCity?: string;
  deliveryState?: string;
  buyerType?: string;
  categoryId?: string;
  items?: Array<{
    productName: string;
    categoryId?: string;
    quantity?: number;
    unit?: string;
    specifications?: string;
  }>;
  exclusivity?: "shared" | "exclusive";
  website?: string;
}) {
  const hasMultipleItems = (payload.items?.length || 0) > 1;

  return apiPost<Lead>("/leads", {
    type: hasMultipleItems ? "bulk_order" : "rfq",
    source: "rfq_form",
    website: payload.website,
    productName: payload.productName,
    customerName: payload.customerName,
    phone: payload.phone.replace(/\D/g, "").slice(-10),
    email: payload.email,
    message: payload.message || payload.requirement,
    requirement: payload.requirement || payload.message,
    quantity: payload.quantity,
    unit: payload.unit,
    deliveryCity: payload.deliveryCity,
    deliveryState: payload.deliveryState,
    buyerType: payload.buyerType || "business",
    categoryId: payload.categoryId,
    items: payload.items,
    exclusivity: payload.exclusivity,
  });
}

export async function getMyLeads() {
  return apiGet<Lead[] | { data?: Lead[] }>("/leads/my");
}

export async function getBuyerRfqs() {
  return apiGet<BuyerRfq[]>("/leads/buyer/rfqs");
}

export async function getBuyerRfqDetail(id: string) {
  return apiGet<BuyerRfqDetail>(`/leads/buyer/rfqs/${id}`);
}

export async function respondToQuote(
  leadId: string,
  payload: { businessId: string; action: "accept" | "reject" }
) {
  const { apiPatch } = await import("@/lib/api/client");
  return apiPatch<BuyerRfqDetail>(`/leads/buyer/rfqs/${leadId}/quote-response`, payload);
}

export async function getBusinessLeads(businessId: string) {
  return apiGet<Lead[] | { data?: Lead[] }>(`/leads/business/${businessId}`);
}

export async function updateLeadStatus(id: string, status: string) {
  const { apiPatch } = await import("@/lib/api/client");
  return apiPatch<Lead>(`/leads/${id}/status`, { status });
}

export async function unlockLead(id: string, businessId: string, method: "subscription" | "wallet" = "subscription") {
  return apiPost<{
    lead: Lead;
    creditsLeft?: number;
    walletBalance?: number;
  }>(`/leads/${id}/unlock`, { businessId, method });
}

export async function createLeadUnlockOrder(id: string, businessId: string) {
  return apiPost<{
    order: { id: string; amount: number; currency: string };
    transaction: { _id: string; orderId: string; amount: number };
    price: number;
    keyId: string;
    paymentsEnabled: boolean;
  }>(`/leads/${id}/unlock-order`, { businessId });
}

export async function submitLeadQuote(
  id: string,
  payload: {
    businessId: string;
    unitPrice: number;
    moq?: number;
    deliveryDays?: number;
    priceUnit?: string;
    message?: string;
  }
) {
  return apiPost<Lead>(`/leads/${id}/quote`, payload);
}

export interface SuggestedQuote {
  productId: string;
  productName: string;
  unitPrice: number;
  priceUnit?: string;
  moq?: number;
}

export async function getSuggestedQuote(id: string, businessId: string) {
  return apiGet<SuggestedQuote | null>(`/leads/${id}/suggested-quote`, { businessId });
}

export function extractLeadList(data: unknown): Lead[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.map(normalizeLead);
  const obj = data as { data?: Lead[]; items?: Lead[]; leads?: Lead[] };
  const list = obj.data || obj.items || obj.leads || [];
  return Array.isArray(list) ? list.map(normalizeLead) : [];
}

export function normalizeLead(lead: Lead): Lead {
  const populatedBusiness =
    typeof lead.businessId === "object" && lead.businessId && "name" in lead.businessId
      ? (lead.businessId as Lead["business"])
      : undefined;

  const business = lead.business || populatedBusiness;

  const businessId =
    typeof lead.businessId === "string"
      ? lead.businessId
      : (lead.businessId as { _id?: string })?._id || String(lead.businessId || "");

  return {
    ...lead,
    businessId,
    business,
    name: lead.name || lead.customerName || "Unknown",
    mobile: lead.mobile || lead.phone || "",
    customerName: lead.customerName || lead.name,
    phone: lead.phone || lead.mobile,
    isRfqOpportunity: lead.isRfqOpportunity || lead.type === "rfq" || lead.type === "bulk_order",
    isUnlocked: lead.isUnlocked,
    unlockBusinessId: lead.unlockBusinessId,
    isContactMasked: lead.isContactMasked,
  };
}

export function getLeadBusinessName(lead: Lead) {
  if (typeof lead.business === "object" && lead.business?.name) {
    return lead.business.name;
  }
  if (typeof lead.businessId === "object" && lead.businessId && "name" in lead.businessId) {
    return String((lead.businessId as { name?: string }).name || "");
  }
  return "";
}
