import { apiPost } from "@/lib/api/client";
import { getCampaignId, getStoredUtm } from "@/lib/analytics/utm";

const SESSION_KEY = "ld_session_id";
const PROFILE_VIEWS_KEY = "ld_profile_views";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type ClickType =
  | "profile"
  | "call"
  | "whatsapp"
  | "website"
  | "direction"
  | "share"
  | "image"
  | "video"
  | "review"
  | "lead_unlock";

export type ClickSource =
  | "listing"
  | "search"
  | "map"
  | "seo"
  | "seo_landing"
  | "ads"
  | "homepage"
  | "direct";

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

function fireGaEvent(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const utm = getStoredUtm();
  window.gtag("event", eventName, {
    ...params,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
  });
}

type TrackClickPayload = {
  businessId: string;
  clickType: ClickType;
  source?: ClickSource;
  keyword?: string;
  city?: string;
};

function buildPayload(payload: TrackClickPayload) {
  return {
    ...payload,
    sessionId: getSessionId(),
    deviceType: detectDeviceType(),
    campaignId: getCampaignId(),
    referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
  };
}

export function trackClick(payload: TrackClickPayload) {
  fireGaEvent("ld_click", {
    click_type: payload.clickType,
    business_id: payload.businessId,
    source: payload.source || "listing",
    city: payload.city,
    keyword: payload.keyword,
  });

  void apiPost("/analytics/track/click", buildPayload(payload)).catch(() => {});
}

export function trackWebsiteClick(
  businessId: string,
  options?: { source?: ClickSource; city?: string }
) {
  trackClick({
    businessId,
    clickType: "website",
    source: options?.source || "seo",
    city: options?.city,
  });
}

export function trackDirectionClick(
  businessId: string,
  options?: { source?: ClickSource; city?: string }
) {
  trackClick({
    businessId,
    clickType: "direction",
    source: options?.source || "seo",
    city: options?.city,
  });
}

export function trackProfileClick(
  businessId: string,
  options?: {
    source?: ClickSource;
    keyword?: string;
    city?: string;
  }
) {
  trackClick({
    businessId,
    clickType: "profile",
    source: options?.source || "listing",
    keyword: options?.keyword,
    city: options?.city,
  });
}

function hasProfileViewInSession(businessId: string) {
  if (typeof window === "undefined") return true;
  try {
    const raw = sessionStorage.getItem(PROFILE_VIEWS_KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    return seen.includes(businessId);
  } catch {
    return false;
  }
}

function markProfileViewInSession(businessId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(PROFILE_VIEWS_KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    if (!seen.includes(businessId)) {
      seen.push(businessId);
      sessionStorage.setItem(PROFILE_VIEWS_KEY, JSON.stringify(seen.slice(-50)));
    }
  } catch {
    // ignore storage errors
  }
}

/** Fire once per browser session when a business profile page loads */
export function trackProfileView(
  businessId: string,
  options?: { source?: ClickSource; city?: string }
) {
  if (hasProfileViewInSession(businessId)) return;
  markProfileViewInSession(businessId);
  trackClick({
    businessId,
    clickType: "profile",
    source: options?.source || "seo",
    city: options?.city,
  });
}

export function buildMapsDirectionUrl(options: {
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}) {
  if (options.latitude != null && options.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${options.latitude},${options.longitude}`;
  }

  const query = [options.address, options.city].filter(Boolean).join(", ");
  if (!query) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export type TrackingContext = {
  source?: ClickSource;
  keyword?: string;
  city?: string;
};

export function trackCallClick(
  businessId: string,
  options?: {
    phone?: string;
    source?: ClickSource;
    city?: string;
  }
) {
  fireGaEvent("ld_call_click", {
    business_id: businessId,
    source: options?.source || "listing",
    city: options?.city,
  });

  void apiPost("/analytics/track/call", {
    businessId,
    receiverNumber: options?.phone,
    source: options?.source || "listing",
    city: options?.city,
    sessionId: getSessionId(),
    deviceType: detectDeviceType(),
    campaignId: getCampaignId(),
  }).catch(() => {});
}

export function trackWhatsAppClick(
  businessId: string,
  options?: {
    source?: ClickSource;
    city?: string;
  }
) {
  trackClick({
    businessId,
    clickType: "whatsapp",
    source: options?.source || "listing",
    city: options?.city,
  });
}

export function trackShareClick(
  businessId: string,
  options?: {
    source?: ClickSource;
    city?: string;
  }
) {
  trackClick({
    businessId,
    clickType: "share",
    source: options?.source || "seo",
    city: options?.city,
  });
}

export function trackLeadSubmit(
  businessId: string,
  options?: {
    source?: ClickSource;
    city?: string;
    leadType?: string;
  }
) {
  fireGaEvent("ld_lead_submit", {
    business_id: businessId,
    source: options?.source || "seo",
    city: options?.city,
    lead_type: options?.leadType || "inquiry",
  });

  trackClick({
    businessId,
    clickType: "lead_unlock",
    source: options?.source || "seo",
    city: options?.city,
  });
}

export function trackSearchEvent(keyword: string, city?: string) {
  fireGaEvent("ld_search", {
    search_term: keyword,
    city,
  });
}
