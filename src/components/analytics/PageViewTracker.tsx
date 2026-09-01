"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { API_URL as API } from "@/lib/api-url";

const SESSION_KEY = "ld_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getUserId(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?._id || parsed?.id || null;
  } catch {
    return null;
  }
}

async function sendPageView(path: string, referrer: string, durationMs = 0) {
  try {
    await fetch(`${API}/api/v1/analytics/track/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        url: window.location.href,
        title: document.title,
        sessionId: getSessionId(),
        deviceType: getDeviceType(),
        referrer,
        userId: getUserId(),
        durationMs,
      }),
      keepalive: true,
    });
  } catch {
    // silently ignore tracking errors
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  const enteredAtRef = useRef<number>(Date.now());
  const prevPathRef = useRef<string>("");
  const prevReferrerRef = useRef<string>("");

  useEffect(() => {
    const currentPath = pathname;

    // On navigation: send exit duration for previous page, then track new page
    if (prevPathRef.current && prevPathRef.current !== currentPath) {
      const duration = Date.now() - enteredAtRef.current;
      sendPageView(prevPathRef.current, prevReferrerRef.current, duration);
    }

    // Reset timer for current page
    enteredAtRef.current = Date.now();
    prevReferrerRef.current = document.referrer || prevPathRef.current;
    prevPathRef.current = currentPath;

    // Track new page view (duration 0 on entry, updated on exit)
    sendPageView(currentPath, prevReferrerRef.current, 0);

    // Track duration when user leaves the tab or closes browser
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const duration = Date.now() - enteredAtRef.current;
        sendPageView(currentPath, prevReferrerRef.current, duration);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
