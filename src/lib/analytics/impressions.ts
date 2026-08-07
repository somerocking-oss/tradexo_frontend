import { apiPost } from "@/lib/api/client";
import { getCampaignId } from "@/lib/analytics/utm";
import type { ClickSource, TrackingContext } from "@/lib/analytics/track";

const SESSION_KEY = "ld_session_id";
const IMPRESSIONS_KEY = "ld_impressions";

type ImpressionPayload = {
  businessId: string;
  source?: ClickSource;
  keyword?: string;
  city?: string;
  rankPosition?: number;
  page?: number;
};

const queue: ImpressionPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function getSessionId() {
  if (typeof window === "undefined") return undefined;
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function detectDeviceType() {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function hasImpressionInSession(businessId: string) {
  if (typeof window === "undefined") return true;
  try {
    const raw = sessionStorage.getItem(IMPRESSIONS_KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    return seen.includes(businessId);
  } catch {
    return false;
  }
}

function markImpressionInSession(businessId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(IMPRESSIONS_KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    if (!seen.includes(businessId)) {
      seen.push(businessId);
      sessionStorage.setItem(IMPRESSIONS_KEY, JSON.stringify(seen.slice(-100)));
    }
  } catch {
    // ignore storage errors
  }
}

function flushImpressions() {
  if (!queue.length) return;
  const items = queue.splice(0, queue.length).map((item) => ({
    ...item,
    sessionId: getSessionId(),
    deviceType: detectDeviceType(),
    campaignId: getCampaignId(),
  }));

  void apiPost("/analytics/track/impressions", { items }).catch(() => {});
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushImpressions();
  }, 2000);
}

function ensureBeforeUnloadListener() {
  if (typeof window === "undefined") return;
  window.addEventListener("beforeunload", flushImpressions);
}

let beforeUnloadRegistered = false;

export function trackListingImpression(
  payload: ImpressionPayload,
  tracking?: TrackingContext
) {
  if (!beforeUnloadRegistered && typeof window !== "undefined") {
    beforeUnloadRegistered = true;
    ensureBeforeUnloadListener();
  }

  if (hasImpressionInSession(payload.businessId)) return;
  markImpressionInSession(payload.businessId);

  queue.push({
    businessId: payload.businessId,
    source: payload.source || tracking?.source || "listing",
    keyword: payload.keyword || tracking?.keyword,
    city: payload.city || tracking?.city,
    rankPosition: payload.rankPosition,
    page: payload.page || 1,
  });

  if (queue.length >= 8) {
    flushImpressions();
    return;
  }

  scheduleFlush();
}
