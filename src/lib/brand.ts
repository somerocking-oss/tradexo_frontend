import { SITE_NAME } from "@/lib/constants";

const STALE_LOGO_PATTERNS = [
  /ek[-_\s]?call/i,
  /leaddikhao/i,
  /lead[-_\s]?dikhao/i,
];

const LEGACY_BRAND_PATTERN =
  /ek[-_\s]?call|leaddikhao|lead[-_\s]?dikhao|justdial|indiamart|jd clone/i;

export const DEFAULT_SITE_LOGO = "/tradexo-logo.png";

/** Ignore CMS logos uploaded under old brand names. */
export function resolveSiteLogo(siteLogo?: string | null): string | undefined {
  const trimmed = siteLogo?.trim();
  if (!trimmed) return DEFAULT_SITE_LOGO;
  if (STALE_LOGO_PATTERNS.some((re) => re.test(trimmed))) return DEFAULT_SITE_LOGO;
  return trimmed;
}

/** Replace legacy brand names in any user-facing string. */
export function normalizeBrandText(text?: string | null, brand = SITE_NAME): string {
  if (!text?.trim()) return "";
  return text
    .replace(/Lead\s*Dikhao/gi, brand)
    .replace(/leaddikhao/gi, brand)
    .replace(/Ek\s*Call/gi, brand)
    .replace(/JustDial/gi, brand)
    .replace(/IndiaMART/gi, brand);
}

/** Resolve CMS site name — always returns Tradexo for legacy DB values. */
export function resolveSiteName(siteName?: string | null, brand = SITE_NAME): string {
  const trimmed = siteName?.trim();
  if (!trimmed || LEGACY_BRAND_PATTERN.test(trimmed)) return brand;
  return normalizeBrandText(trimmed, brand) || brand;
}
