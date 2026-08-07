"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWebPush } from "@/hooks/useWebPush";

export function PushNotificationPrompt() {
  const { isAuthenticated } = useAuth();
  const { supported, subscribed, subscribe } = useWebPush();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("push-prompt-dismissed") === "1") setDismissed(true);
  }, []);

  if (!isAuthenticated || !supported || subscribed || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-[#d4d4d4] bg-white p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-[#e8e8e8] p-2 text-[#ff6c00]">
          <Bell className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Enable Notifications</p>
          <p className="mt-1 text-xs text-slate-500">Get instant alerts for leads, chat & payments.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => subscribe()}>
              Enable
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                localStorage.setItem("push-prompt-dismissed", "1");
                setDismissed(true);
              }}
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
