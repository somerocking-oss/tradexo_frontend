"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { AppChrome } from "@/components/layout/AppChrome";
import { PushNotificationPrompt } from "@/components/notifications/PushNotificationPrompt";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <AppChrome />
          <PushNotificationPrompt />
          {children}
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
