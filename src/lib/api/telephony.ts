import { apiGet, apiPost } from "@/lib/api/client";

export type TelephonyConfig = {
  enabled: boolean;
  provider?: string;
  requireBuyerPhone?: boolean;
};

export async function getTelephonyConfig() {
  const res = await apiGet<TelephonyConfig>("/telephony/config");
  return res.data || { enabled: false };
}

export async function connectTelephonyCall(body: {
  businessId: string;
  buyerPhone?: string;
  source?: string;
  city?: string;
  sessionId?: string;
  campaignId?: string;
}) {
  try {
    return await apiPost<{ message?: string; callSid?: string }>("/telephony/connect", body);
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    throw new Error(axiosErr.response?.data?.message || "Could not start virtual call");
  }
}
