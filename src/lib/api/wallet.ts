import { apiGet, apiPost } from "@/lib/api/client";

export interface WalletInfo {
  businessId: string;
  businessName?: string;
  balance: number;
  currency: string;
  unlockPrice: number;
  recentTopups?: Array<{ amount?: number; createdAt?: string; status?: string }>;
}

export async function getWallet(businessId: string) {
  return apiGet<WalletInfo>("/payments/wallet", { businessId });
}

export async function createWalletTopupOrder(businessId: string, amount: number) {
  return apiPost<{
    order: { id: string; amount: number; currency: string };
    transaction: { _id: string; orderId: string; amount: number };
    amount: number;
    keyId: string;
    paymentsEnabled: boolean;
  }>("/payments/wallet/topup-order", { businessId, amount });
}
