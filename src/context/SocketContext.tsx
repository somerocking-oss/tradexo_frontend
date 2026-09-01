"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/api-url";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (loading || !isAuthenticated || !user?._id) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const instance = io(API_URL, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
    });

    const onConnect = () => {
      instance.emit("join-user", String(user._id));
    };

    instance.on("connect", onConnect);

    setSocket(instance);

    return () => {
      instance.off("connect", onConnect);
      instance.disconnect();
    };
  }, [isAuthenticated, loading, user?._id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
