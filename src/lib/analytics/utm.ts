const UTM_STORAGE_KEY = "ld_utm";

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

export function parseUtmFromSearch(search: string): UtmParams {
  const params = new URLSearchParams(search);
  const utm: UtmParams = {};

  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ] as const) {
    const value = params.get(key)?.trim();
    if (value) utm[key] = value;
  }

  return utm;
}

export function saveUtmParams(utm: UtmParams) {
  if (typeof window === "undefined") return;
  if (!Object.keys(utm).length) return;

  try {
    const existing = getStoredUtm();
    sessionStorage.setItem(
      UTM_STORAGE_KEY,
      JSON.stringify({ ...existing, ...utm })
    );
  } catch {
    // ignore storage errors
  }
}

export function getStoredUtm(): UtmParams {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

export function getCampaignId(): string | undefined {
  const utm = getStoredUtm();
  if (utm.utm_campaign) return utm.utm_campaign;
  if (utm.utm_source) {
    return [utm.utm_source, utm.utm_medium].filter(Boolean).join(":");
  }
  return undefined;
}

export function captureUtmFromLocation() {
  if (typeof window === "undefined") return;
  const utm = parseUtmFromSearch(window.location.search);
  saveUtmParams(utm);
}
