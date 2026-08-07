import { apiGet, apiPatch } from "@/lib/api/client";

export interface AppNotification {
  _id: string;
  type: string;
  subType?: string;
  title: string;
  message?: string;
  link?: string;
  isRead?: boolean;
  createdAt?: string;
  metadata?: {
    leadId?: string;
    businessId?: string;
    conversationId?: string;
    clickType?: string;
    contactClick?: boolean;
    rfq?: boolean;
    isBuyerQuote?: boolean;
  };
}

export async function getNotifications(page = 1, limit = 15) {
  return apiGet<{
    notifications: AppNotification[];
    pagination?: { total: number; page: number; limit: number };
  }>("/notifications", { page, limit });
}

export async function getUnreadNotifications() {
  return apiGet<AppNotification[]>("/notifications/unread");
}

export async function markNotificationRead(id: string) {
  return apiPatch<AppNotification>(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead() {
  return apiPatch("/notifications/read-all", {});
}

export function extractNotificationList(data: unknown): AppNotification[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  const obj = data as { notifications?: AppNotification[]; data?: AppNotification[] };
  return obj.notifications || obj.data || [];
}
