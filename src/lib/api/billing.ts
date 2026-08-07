import { apiGet } from "@/lib/api/client";

export interface Transaction {
  _id: string;
  type?: string;
  amount?: number;
  status?: string;
  orderId?: string;
  paymentId?: string;
  businessId?: string;
  invoiceId?: string;
  createdAt?: string;
  description?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount?: number;
  totalAmount?: number;
  status?: string;
  invoiceDate?: string;
  createdAt?: string;
  business?: { _id: string; name?: string; city?: string };
  transaction?: { type?: string; orderId?: string; amount?: number };
}

export async function getMyTransactions(params?: { businessId?: string }) {
  return apiGet<Transaction[]>("/payments/transactions", params);
}

export async function getMyInvoices(params?: { businessId?: string }) {
  return apiGet<Invoice[]>("/payments/invoices", params);
}

export async function downloadInvoicePdf(invoiceId: string, invoiceNumber?: string) {
  const api = (await import("@/lib/api/client")).default;
  const response = await api.get(`/payments/invoices/${invoiceId}/pdf`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${invoiceNumber || "invoice"}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export function extractTransactionList(data: unknown): Transaction[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}

export function extractInvoiceList(data: unknown): Invoice[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}
