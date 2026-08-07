import { POPULAR_CITIES } from "@/lib/cities";
import { getCityCoordinates } from "@/lib/city-coordinates";

export const USER_CITY_STORAGE_KEY = "Tradexo_user_city";

export interface IpLocationResult {
  city: string | null;
  lat: number | null;
  lng: number | null;
  source: "ip";
}

const CITY_ALIAS_ENTRIES: [string, string][] = [
  ["delhi", "Delhi"],
  ["new delhi", "Delhi"],
  ["noida", "Delhi"],
  ["gurgaon", "Delhi"],
  ["gurugram", "Delhi"],
  ["ghaziabad", "Delhi"],
  ["faridabad", "Delhi"],
  ["mumbai", "Mumbai"],
  ["bombay", "Mumbai"],
  ["navi mumbai", "Mumbai"],
  ["thane", "Mumbai"],
  ["bengaluru", "Bangalore"],
  ["bangalore", "Bangalore"],
  ["ahmedabad", "Ahmedabad"],
  ["pune", "Pune"],
  ["hyderabad", "Hyderabad"],
  ["secunderabad", "Hyderabad"],
  ["chennai", "Chennai"],
  ["madras", "Chennai"],
  ["kolkata", "Kolkata"],
  ["calcutta", "Kolkata"],
];

const CITY_ALIASES: Record<string, string> = Object.fromEntries(CITY_ALIAS_ENTRIES);

let cachedIpLocation: IpLocationResult | null | undefined;
let ipLocationInflight: Promise<IpLocationResult | null> | null = null;

export function matchPopularCity(raw?: string | null): string | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();

  if (CITY_ALIASES[normalized]) {
    return CITY_ALIASES[normalized];
  }

  const direct = POPULAR_CITIES.find((city) => city.toLowerCase() === normalized);
  if (direct) return direct;

  const partial = POPULAR_CITIES.find(
    (city) => normalized.includes(city.toLowerCase()) || city.toLowerCase().includes(normalized)
  );
  return partial || null;
}

export function getStoredUserCity(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_CITY_STORAGE_KEY) || "";
}

export function storeUserCity(city: string) {
  if (typeof window === "undefined" || !city.trim()) return;
  localStorage.setItem(USER_CITY_STORAGE_KEY, city.trim());
  window.dispatchEvent(new CustomEvent("user-city-change", { detail: city.trim() }));
}

function coordsFromCity(city: string | null): { lat: number; lng: number } | null {
  if (!city) return null;
  return getCityCoordinates(city);
}

async function fetchFromIpApi(): Promise<IpLocationResult | null> {
  const res = await fetch("https://ipapi.co/json/", {
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    city?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
  };
  const city = matchPopularCity(data.city) || matchPopularCity(data.region);
  const lat = typeof data.latitude === "number" ? data.latitude : null;
  const lng = typeof data.longitude === "number" ? data.longitude : null;
  if (!city && lat == null) return null;
  return { city, lat, lng, source: "ip" };
}

async function fetchFromIpWho(): Promise<IpLocationResult | null> {
  const res = await fetch("https://ipwho.is/", {
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    success?: boolean;
    city?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
  };
  if (data.success === false) return null;
  const city = matchPopularCity(data.city) || matchPopularCity(data.region);
  const lat = typeof data.latitude === "number" ? data.latitude : null;
  const lng = typeof data.longitude === "number" ? data.longitude : null;
  if (!city && lat == null) return null;
  return { city, lat, lng, source: "ip" };
}

async function resolveIpLocation(): Promise<IpLocationResult | null> {
  const providers = [fetchFromIpApi, fetchFromIpWho];
  for (const provider of providers) {
    try {
      const result = await provider();
      if (result) {
        if (result.lat == null || result.lng == null) {
          const fallback = coordsFromCity(result.city);
          if (fallback) {
            result.lat = fallback.lat;
            result.lng = fallback.lng;
          }
        }
        return result;
      }
    } catch {
      // try next provider
    }
  }
  return null;
}

/** Shared IP lookup — cached so multiple hooks don't hammer the API. */
export async function detectLocationFromIp(): Promise<IpLocationResult | null> {
  if (cachedIpLocation !== undefined) {
    return cachedIpLocation;
  }
  if (!ipLocationInflight) {
    ipLocationInflight = resolveIpLocation().then((result) => {
      cachedIpLocation = result;
      ipLocationInflight = null;
      return result;
    });
  }
  return ipLocationInflight;
}

export async function detectUserCityFromIp(): Promise<string | null> {
  const result = await detectLocationFromIp();
  return result?.city ?? null;
}

export function formatGeolocationError(code?: number, message?: string): string {
  switch (code) {
    case 1:
      return "Location permission denied. Allow location in browser settings or enter your city manually.";
    case 2:
      return "Location unavailable. Enable Windows Location Services or enter your city manually.";
    case 3:
      return "Location request timed out. Try again or enter your city manually.";
    default:
      if (message?.toLowerCase().includes("network")) {
        return "GPS location unavailable on this device. Using network-based city detection instead.";
      }
      return "Could not detect location. Please enter your city manually.";
  }
}
