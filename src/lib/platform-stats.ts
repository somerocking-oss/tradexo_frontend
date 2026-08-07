import { cache } from "react";
import type { TrustStat } from "@/lib/cms";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
const FETCH_TIMEOUT_MS = 8000;

export interface PlatformStats {
  businessCount: number;
  verifiedCount: number;
  leadCount: number;
  monthlyLeads: number;
  registeredToday: number;
  categoryCount: number;
  cityCount: number;
  averageRating: number | null;
  reviewCount: number;
  topCities: Array<{ city: string; slug: string; count: number }>;
}

export interface DisplayStat {
  value: string;
  label: string;
  icon?: string;
}

export function formatStatCount(n: number): string {
  if (n <= 0) return "0";
  if (n >= 10000000) {
    return `${(n / 10000000).toFixed(1).replace(/\.0$/, "")}Cr+`;
  }
  if (n >= 100000) {
    const lakhs = n / 100000;
    return `${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1).replace(/\.0$/, "")}L+`;
  }
  if (n >= 1000) {
    return `${Math.floor(n / 100) / 10}K+`;
  }
  return `${n.toLocaleString("en-IN")}+`;
}

export function formatCityCount(n: number): string {
  if (n <= 0) return "0";
  return `${n.toLocaleString("en-IN")}+`;
}

export const fetchPlatformStats = cache(async (): Promise<PlatformStats | null> => {
  try {
    const res = await fetch(`${API}/api/v1/businesses/platform-stats`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
});

function injectLiveValue(
  label: string,
  currentValue: string,
  platform: PlatformStats | null
): string {
  if (!platform) return currentValue;
  const l = label.toLowerCase();
  if (/business|listing|supplier|verified/.test(l) && platform.businessCount > 0) {
    return formatStatCount(platform.businessCount);
  }
  if (/lead|quote|rfq|enquir/.test(l) && platform.leadCount > 0) {
    return formatStatCount(platform.leadCount);
  }
  if (/monthly/.test(l) && platform.monthlyLeads > 0) {
    return formatStatCount(platform.monthlyLeads);
  }
  if (/cit/.test(l) && platform.cityCount > 0) {
    return formatCityCount(platform.cityCount);
  }
  if (/categor/.test(l) && platform.categoryCount > 0) {
    return formatCityCount(platform.categoryCount);
  }
  return currentValue;
}

export function buildTrustStats(
  cmsStats: TrustStat[] | undefined,
  platform: PlatformStats | null
): DisplayStat[] {
  if (cmsStats?.length) {
    return cmsStats
      .map((s) => ({
        value: injectLiveValue(s.label || "", s.value || "", platform),
        label: s.label || "",
        icon: s.icon,
      }))
      .filter((s) => s.value && s.label);
  }

  if (!platform) return [];

  const stats: DisplayStat[] = [];
  if (platform.businessCount > 0) {
    stats.push({
      value: formatStatCount(platform.businessCount),
      label: "Verified Businesses",
      icon: "Users",
    });
  }
  if (platform.monthlyLeads > 0) {
    stats.push({
      value: formatStatCount(platform.monthlyLeads),
      label: "Monthly Leads",
      icon: "TrendingUp",
    });
  }
  if (platform.leadCount > 0) {
    stats.push({
      value: formatStatCount(platform.leadCount),
      label: "RFQs Generated",
      icon: "Zap",
    });
  }
  if (platform.cityCount > 0) {
    stats.push({
      value: formatCityCount(platform.cityCount),
      label: "Cities Covered",
      icon: "Globe2",
    });
  }
  return stats;
}

export function buildFooterStats(
  cmsStats: TrustStat[] | undefined,
  platform: PlatformStats | null
): DisplayStat[] {
  const fromCms = buildTrustStats(cmsStats, platform);
  if (fromCms.length) return fromCms.slice(0, 4);
  return buildTrustStats(undefined, platform);
}
