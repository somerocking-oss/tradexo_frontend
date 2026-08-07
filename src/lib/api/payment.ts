import { apiGet, apiPost } from "@/lib/api/client";

export interface PlanFromApi {
  id: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  limits?: Record<string, unknown>;
  popular?: boolean;
}

export interface PaymentOrderResponse {
  order: { id: string; amount: number; currency: string };
  transaction: { _id: string; orderId: string; amount: number };
  plan: PlanFromApi;
  keyId: string;
  paymentsEnabled: boolean;
}

export interface PlansApiResponse {
  plans: PlanFromApi[];
  pageTitle?: string;
  pageSubtitle?: string;
  popularPlanId?: string;
}

export async function getPlans() {
  return apiGet<PlansApiResponse | PlanFromApi[]>("/payments/plans");
}

export async function getPaymentConfig() {
  return apiGet<{ keyId: string; enabled: boolean }>("/payments/config");
}

export async function createPaymentOrder(payload: {
  planId: string;
  businessId: string;
}) {
  return apiPost<PaymentOrderResponse>("/payments/create-order", payload);
}

export interface FeatureBoostOrderResponse {
  order: { id: string; amount: number; currency: string };
  transaction: { _id: string; orderId: string; amount: number };
  price: number;
  days: number;
  keyId: string;
  paymentsEnabled: boolean;
}

export async function createFeatureBoostOrder(businessId: string) {
  return apiPost<FeatureBoostOrderResponse>("/payments/feature-boost-order", { businessId });
}

export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  return apiPost<{
    transaction?: { type?: string; amount?: number };
    leadUnlock?: { lead?: Record<string, unknown> };
    walletCredit?: { balance?: number; amount?: number };
  }>("/payments/verify", payload);
}

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}
