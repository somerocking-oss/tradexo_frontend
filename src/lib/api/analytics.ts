import { apiGet } from "@/lib/api/client";

export type SellerEngagementTotals = {
  profileViews: number;
  calls: number;
  whatsapp: number;
  website: number;
  directions: number;
  shares: number;
  callIntents: number;
  leads: number;
  searchAppearances: number;
  impressions: number;
  ctr: number;
  avgResponseHours?: number | null;
  responseRate?: number | null;
};

export type SellerBusinessEngagement = SellerEngagementTotals & {
  businessId: string;
  name: string;
  city?: string;
  slug?: string;
  avgResponseHours?: number | null;
  responseRate?: number | null;
};

export type SellerEngagementData = {
  days: number;
  totals: SellerEngagementTotals;
  byBusiness: SellerBusinessEngagement[];
  daily: { date: string; clicks: number }[];
};

export async function getMyEngagementStats(days = 30) {
  return apiGet<SellerEngagementData>("/business-analytics/my/engagement", { days });
}
