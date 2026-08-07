import { apiGet, apiPost } from "@/lib/api/client";

export interface ChatConversation {
  _id: string;
  businessId?: { _id: string; name: string; city?: string };
  buyerId?: { _id: string; name?: string; mobile?: string };
  sellerId?: { _id: string; name?: string; mobile?: string };
  lastMessage?: string;
  lastMessageAt?: string;
  buyerUnread?: number;
  sellerUnread?: number;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt?: string;
  readAt?: string;
}

export async function startConversation(businessId: string) {
  return apiPost<ChatConversation>("/chat/conversations", { businessId });
}

export async function getConversations() {
  return apiGet<ChatConversation[]>("/chat/conversations");
}

export async function getChatMessages(conversationId: string) {
  return apiGet<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`);
}

export async function sendChatMessage(conversationId: string, body: string) {
  return apiPost<ChatMessage>(`/chat/conversations/${conversationId}/messages`, { body });
}

export function extractConversationList(data: unknown): ChatConversation[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}

export function extractMessageList(data: unknown): ChatMessage[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}
