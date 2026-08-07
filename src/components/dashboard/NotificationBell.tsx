"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  extractNotificationList,
  getNotifications,
  getUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/api/notification";
import { cn } from "@/lib/utils";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

function formatTime(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getNotificationHref(n: AppNotification) {
  if (n.link) return n.link;
  if (n.metadata?.contactClick || n.subType === "contact_click") {
    return "/dashboard";
  }
  if (n.metadata?.isBuyerQuote || n.metadata?.leadId) {
    return n.metadata.leadId
      ? `/profile/requirements/${n.metadata.leadId}`
      : "/profile/requirements";
  }
  if (n.type === "chat" || n.metadata?.conversationId) {
    return n.link || "/dashboard/messages";
  }
  if (n.type === "lead" || n.metadata?.rfq) return "/dashboard/leads";
  if (n.type === "payment") return "/dashboard/billing";
  return "/dashboard";
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState<AppNotification[]>([]);
  const [recent, setRecent] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const [unreadRes, allRes] = await Promise.all([
        getUnreadNotifications(),
        getNotifications(1, 8),
      ]);
      if (unreadRes.success && unreadRes.data) {
        setUnread(extractNotificationList(unreadRes.data));
      }
      if (allRes.success && allRes.data) {
        setRecent(extractNotificationList(allRes.data));
      }
    } catch {
      // ignore when logged out
    }
  }, []);

  useRealtimeNotifications(() => {
    loadNotifications();
  });

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 120000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open) {
      setLoading(true);
      await loadNotifications();
      setLoading(false);
    }
  };

  const handleClickNotification = async (n: AppNotification) => {
    if (!n.isRead) {
      await markNotificationRead(n._id);
      setUnread((prev) => prev.filter((item) => item._id !== n._id));
      setRecent((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
      );
    }
    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setUnread([]);
    setRecent((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = unread.length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="font-semibold text-slate-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-[#ff6c00] hover:text-[#e86200]"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">Loading...</div>
            ) : recent.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                No notifications yet
              </div>
            ) : (
              recent.map((n) => (
                <Link
                  key={n._id}
                  href={getNotificationHref(n)}
                  onClick={() => handleClickNotification(n)}
                  className={cn(
                    "block border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50",
                    !n.isRead && "bg-[#e8e8e8]/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    {!n.isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#ff6c00]" />
                    )}
                  </div>
                  {n.message && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{n.message}</p>
                  )}
                  <p className="mt-1 text-[10px] text-slate-400">{formatTime(n.createdAt)}</p>
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-2">
            <Button
              href="/dashboard"
              variant="ghost"
              size="sm"
              className="w-full justify-center text-[#ff6c00]"
              onClick={() => setOpen(false)}
            >
              Open Seller Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
