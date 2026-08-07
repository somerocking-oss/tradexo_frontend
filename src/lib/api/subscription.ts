import { apiGet } from "@/lib/api/client";

export interface SubscriptionUsage {
  leadsUsed?: number;
  leadsLeft?: number;
}

export interface ActiveSubscription {
  _id: string;
  plan?: string;
  planName?: string;
  status?: string;
  usage?: SubscriptionUsage;
  limits?: { maxLeads?: number };
  endDate?: string;
  nextBillingDate?: string;
}

export async function getActiveSubscription(businessId: string) {
  return apiGet<ActiveSubscription>(`/subscriptions/active/${businessId}`);
}
