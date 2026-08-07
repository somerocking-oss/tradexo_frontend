import { apiGet, apiPost, apiDelete } from "@/lib/api/client";

export async function getReferralStats() {
  return apiGet<{
    referralCode: string;
    signups: number;
    creditsEarned: number;
    rewardAmount: number;
    shareUrl: string;
  }>("/users/referral/stats");
}

export async function reportConversation(conversationId: string, reason: string) {
  return apiPost(`/chat/conversations/${conversationId}/report`, { reason });
}

export async function blockChatUser(userId: string, reason?: string) {
  return apiPost(`/chat/block/${userId}`, { reason });
}

export async function unblockChatUser(userId: string) {
  return apiDelete(`/chat/block/${userId}`);
}
