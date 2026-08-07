import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api/client";
import type { BusinessContact, BusinessDocument, BusinessCatalogItem, BusinessKycProfile } from "@/types";

export async function getBusinessKyc(businessId: string) {
  return apiGet<BusinessKycProfile>(`/businesses/${businessId}/kyc`);
}

export async function updateBusinessKyc(
  businessId: string,
  payload: {
    contactPerson?: string;
    mobile?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    annualTurnover?: number;
    turnoverCurrency?: string;
    turnoverYear?: number;
    contacts?: BusinessContact[];
    catalog?: BusinessCatalogItem[];
  }
) {
  return apiPut<BusinessKycProfile>(`/businesses/${businessId}/kyc`, payload);
}

export async function verifyBusinessGstin(businessId: string, gstin: string) {
  return apiPost<BusinessKycProfile>(`/businesses/${businessId}/verify-gstin`, { gstin });
}

export async function uploadBusinessDocument(
  businessId: string,
  file: File,
  meta: { name: string; type: string }
) {
  const api = (await import("@/lib/api/client")).default;
  const formData = new FormData();
  formData.append("document", file);
  formData.append("name", meta.name);
  formData.append("type", meta.type);

  const { data } = await api.post(`/business-media/${businessId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateBusinessDocument(
  documentId: string,
  payload: { name?: string; type?: string }
) {
  return apiPatch<BusinessDocument>(`/business-media/documents/${documentId}`, payload);
}

export async function deleteBusinessDocument(documentId: string) {
  return apiDelete(`/business-media/documents/${documentId}`);
}

export async function uploadCatalogItemImage(businessId: string, file: File) {
  const api = (await import("@/lib/api/client")).default;
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post(`/business-media/${businessId}/catalog-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { success?: boolean; data?: { url?: string; public_id?: string }; message?: string };
}

export const DOCUMENT_TYPES = [
  { value: "gst", label: "GST Certificate" },
  { value: "pan", label: "PAN Card" },
  { value: "license", label: "Trade License" },
  { value: "certificate", label: "Business Certificate" },
  { value: "identity", label: "Identity Proof" },
  { value: "other", label: "Other Document" },
] as const;

export const TURNOVER_RANGES = [
  { value: 500000, label: "Up to ₹5 Lakh" },
  { value: 2500000, label: "₹5 Lakh – ₹25 Lakh" },
  { value: 10000000, label: "₹25 Lakh – ₹1 Crore" },
  { value: 50000000, label: "₹1 Crore – ₹5 Crore" },
  { value: 100000000, label: "₹5 Crore – ₹10 Crore" },
  { value: 500000000, label: "Above ₹10 Crore" },
] as const;

export function emptyContact(): BusinessContact {
  return {
    contactPerson: "",
    mobile: "",
    alternateMobile: "",
    whatsapp: "",
    landline: "",
    email: "",
    website: "",
    isPrimary: false,
  };
}

export const CATALOG_PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "starting", label: "Starting From" },
  { value: "hourly", label: "Per Hour" },
  { value: "per_unit", label: "Per Unit" },
  { value: "on_request", label: "Price on Request" },
] as const;

export function emptyCatalogItem(defaultType: "product" | "service" = "product"): BusinessCatalogItem {
  return {
    name: "",
    description: "",
    itemType: defaultType,
    priceType: "on_request",
    unit: "",
    minimumOrderQuantity: undefined,
    brand: "",
    inStock: true,
  };
}

export function formatTurnoverLabel(amount?: number) {
  if (!amount) return "Not set";
  const match = TURNOVER_RANGES.find((range) => range.value === amount);
  if (match) return match.label;
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function formatCatalogPrice(item: BusinessCatalogItem) {
  if (item.priceType === "on_request" || !item.price) return "Price on request";
  const prefix =
    item.priceType === "starting"
      ? "From "
      : item.priceType === "hourly"
        ? ""
        : "";
  const suffix =
    item.priceType === "hourly" ? "/hr" : item.unit ? `/${item.unit}` : "";
  return `${prefix}₹${Number(item.price).toLocaleString("en-IN")}${suffix}`;
}
