"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  extractNotificationList,
  getNotifications,
  getUnreadNotifications,
  type AppNotification,
} from "@/lib/api/notification";

type NotificationListener = (notification: AppNotification) => void;

const listeners = new Set<NotificationListener>();

export function subscribeToNotifications(listener: NotificationListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRealtimeNotifications(onNew?: NotificationListener) {
  const socket = useSocket();
  const { isAuthenticated } = useAuth();
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [unreadRes, allRes] = await Promise.all([
        getUnreadNotifications(),
        getNotifications(1, 8),
      ]);
      return {
        unread: unreadRes.success ? extractNotificationList(unreadRes.data) : [],
        recent: allRes.success ? extractNotificationList(allRes.data) : [],
      };
    } catch {
      return { unread: [], recent: [] };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    const handler = (payload: AppNotification) => {
      listeners.forEach((fn) => fn(payload));
      onNewRef.current?.(payload);
    };

    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [socket]);

  return { refresh };
}

export function useNotificationToast() {
  const [toast, setToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = subscribeToNotifications((notification) => {
      if (timer) clearTimeout(timer);
      setToast(notification);
      timer = setTimeout(() => setToast(null), 5000);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return toast;
}
