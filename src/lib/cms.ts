import { cache } from "react";
import { normalizeBrandText, resolveSiteName } from "./brand";
import { SITE_URL } from "./constants";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
const FETCH_TIMEOUT_MS = 8000;

export interface OnPageSeoListings {
  defaultTitle?: string;
  defaultDescription?: string;
  defaultSubtitle?: string;
  keywordTitle?: string;
  keywordDescription?: string;
  keywordCityTitle?: string;
  keywordCityDescription?: string;
  cityTitle?: string;
  cityDescription?: string;
  filteredSubtitle?: string;
  citySuffix?: string;
}

export interface OnPageSeoBrowse {
  titleWithCity?: string;
  title?: string;
  descriptionWithCity?: string;
  description?: string;
}

export interface OnPageSeoPageMeta {
  metaTitle?: string;
  metaDescription?: string;
}

export interface OnPageSeoSchema {
  enableWebSite?: boolean;
  enableOrganization?: boolean;
  enableBreadcrumbs?: boolean;
  enableItemList?: boolean;
  enableFaqPage?: boolean;
}

export interface OnPageSeoSettings {
  listings?: OnPageSeoListings;
  browse?: OnPageSeoBrowse;
  plans?: OnPageSeoPageMeta;
  registerBusiness?: OnPageSeoPageMeta;
  schema?: OnPageSeoSchema;
}

export interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  siteLogo?: string;
  siteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  adsEmail?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    twitterHandle?: string;
    canonicalUrl?: string;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    googleSiteVerification?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    disallowPaths?: string[];
    onPage?: OnPageSeoSettings;
  };
  homepage?: {
    badgeText?: string;
    heroTitle?: string;
    heroHighlight?: string;
    heroSubtitle?: string;
    heroSliderIntervalMs?: number;
    heroSlides?: HeroSlide[];
    heroBuyLabel?: string;
    heroSellLabel?: string;
    heroSellPitchTitle?: string;
    heroSellPitchSubtitle?: string;
    heroSellCtaLabel?: string;
    heroSellCtaHref?: string;
    heroSellBadgeText?: string;
    popularSearches?: string[];
    trustStats?: Array<{ value?: string; label?: string; icon?: string }>;
    trendingSection?: TrendingSection;
    categoriesSection?: CategoriesSection;
    latestListingsSection?: LatestListingsSection;
    featuredSection?: FeaturedSection;
    cityCategoriesSection?: CityCategoriesSection;
    ctaTitle?: string;
    ctaSubtitle?: string;
    featuresSection?: FeaturesSection;
    testimonialsSection?: TestimonialsSection;
    howItWorksSection?: HowItWorksSection;
    whyChooseUsSection?: WhyChooseUsSection;
    buyerSellerHubSection?: BuyerSellerHubSection;
  };
  footer?: FooterSettings;
  pricing?: PricingSettings;
  navigation?: NavigationSettings;
}

export interface FeatureItem {
  title?: string;
  description?: string;
  href?: string;
  cta?: string;
  icon?: string;
  color?: string;
}

export interface FeaturesSection {
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
  highlightCard?: {
    title?: string;
    description?: string;
    href?: string;
    cta?: string;
  };
}

export interface TrustStat {
  value?: string;
  label?: string;
  icon?: string;
}

export interface HeroSlide {
  src: string;
  alt?: string;
  enabled?: boolean;
}

export interface TrendingSection {
  label?: string;
  useApi?: boolean;
  terms?: string[];
}

export interface CategoriesSection {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
}

export interface LatestListingsSection {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
}

export interface FeaturedSection {
  title?: string;
  subtitle?: string;
}

export interface CityCategoryChip {
  label?: string;
  keyword?: string;
}

export interface CityCategoryGroup {
  city?: string;
  items?: CityCategoryChip[];
}

export interface CityCategoriesSection {
  eyebrow?: string;
  title?: string;
  subtitleDefault?: string;
  subtitleDetected?: string;
  detectButtonText?: string;
  allInCityLinkText?: string;
  cities?: string[];
  categoryGroups?: CityCategoryGroup[];
}

export interface TestimonialItem {
  name?: string;
  role?: string;
  quote?: string;
  rating?: number;
}

export interface TestimonialsSection {
  eyebrow?: string;
  title?: string;
  items?: TestimonialItem[];
}

export interface HowItWorksStep {
  step?: string;
  icon?: string;
  title?: string;
  description?: string;
}

export interface HowItWorksSection {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: HowItWorksStep[];
}

export interface WhyChooseItem {
  icon?: string;
  title?: string;
  description?: string;
  color?: string;
}

export interface WhyChooseUsSection {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  bulletPoints?: string[];
  items?: WhyChooseItem[];
}

export interface HubButton {
  label?: string;
  href?: string;
  variant?: string;
  icon?: string;
}

export interface HubSide {
  badge?: string;
  badgeIcon?: string;
  title?: string;
  description?: string;
  bulletPoints?: string[];
  buttons?: HubButton[];
}

export interface BuyerSellerHubSection {
  title?: string;
  subtitle?: string;
  buyer?: HubSide;
  seller?: HubSide;
}

export interface CmsPage {
  _id?: string;
  slug: string;
  title: string;
  body?: string;
  pageType?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  updatedAt?: string;
}

export interface FooterLink {
  label?: string;
  href?: string;
}

export interface FooterSection {
  title?: string;
  links?: FooterLink[];
}

export interface FooterStat {
  value?: string;
  label?: string;
}

export interface FooterSocialLink {
  platform?: string;
  label?: string;
  href?: string;
}

export interface FooterAppLinks {
  googlePlay?: string;
  appStore?: string;
}

export interface FooterNewsletter {
  enabled?: boolean;
  actionUrl?: string;
}

export interface FooterSettings {
  logo?: string;
  tagline?: string;
  description?: string;
  legalText?: string;
  phone?: string;
  supportPhone?: string;
  stats?: FooterStat[];
  sections?: FooterSection[];
  socialLinks?: FooterSocialLink[];
  appLinks?: FooterAppLinks;
  newsletter?: FooterNewsletter;
  sitemapLabel?: string;
  sitemapHref?: string;
}

export interface PricingPlan {
  id?: string;
  name?: string;
  price?: number;
  currency?: string;
  durationDays?: number;
  features?: string[];
  popular?: boolean;
  enabled?: boolean;
  limits?: Record<string, unknown>;
}

export interface PricingSettings {
  pageTitle?: string;
  pageSubtitle?: string;
  popularPlanId?: string;
  payPerLeadPrice?: number;
  featureBoostPrice?: number;
  featureBoostDays?: number;
  plans?: PricingPlan[];
}

export interface NavLink {
  label?: string;
  href?: string;
  icon?: string;
}

export interface NavCta {
  label?: string;
  href?: string;
  enabled?: boolean;
}

export interface NavigationSettings {
  links?: NavLink[];
  ctaRfq?: NavCta;
  ctaListBusiness?: NavCta;
  mobileBottomBar?: NavLink[];
}

async function fetchSiteSettingsOnce(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${API}/api/v1/settings`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const settings = json.data?.settings;
    if (!settings) return null;

    return {
      ...settings,
      siteName: resolveSiteName(settings.siteName),
      siteDescription: normalizeBrandText(settings.siteDescription),
      seo: settings.seo
        ? {
            ...settings.seo,
            metaTitle: normalizeBrandText(settings.seo.metaTitle),
            metaDescription: normalizeBrandText(settings.seo.metaDescription),
          }
        : settings.seo,
      homepage: settings.homepage
        ? Object.fromEntries(
            Object.entries(settings.homepage).map(([key, value]) => [
              key,
              typeof value === "string" ? normalizeBrandText(value) : value,
            ])
          )
        : settings.homepage,
      footer: settings.footer
        ? {
            ...settings.footer,
            tagline: normalizeBrandText(settings.footer.tagline),
            description: normalizeBrandText(settings.footer.description),
          }
        : settings.footer,
    };
  } catch {
    return null;
  }
}

export const fetchSiteSettings = cache(fetchSiteSettingsOnce);

export const fetchCmsPage = cache(async (slug: string): Promise<CmsPage | null> => {
  try {
    const res = await fetch(`${API}/api/v1/pages/${slug}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
});

export const fetchSitemapPages = cache(async (): Promise<
  Array<{ path: string; updatedAt?: string }>
> => {
  try {
    const res = await fetch(`${API}/api/v1/pages/sitemap-data`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const pages = json.data?.pages || [];
    return pages.map((page: { path: string; updatedAt?: string }) => ({
      path: page.path,
      updatedAt: page.updatedAt,
    }));
  } catch {
    return [];
  }
});

export interface SitemapStats {
  coreCount: number;
  businessCount: number;
  businessChunks: number;
  chunkSize: number;
  totalUrls: number;
}

export async function fetchSitemapStats(): Promise<SitemapStats> {
  try {
    const res = await fetch(`${API}/api/v1/pages/sitemap-data?type=stats`, {
      next: { revalidate: 3600, tags: ["sitemap"] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { coreCount: 0, businessCount: 0, businessChunks: 0, chunkSize: 5000, totalUrls: 0 };
    }
    const json = await res.json();
    return json.data || { coreCount: 0, businessCount: 0, businessChunks: 0, chunkSize: 5000, totalUrls: 0 };
  } catch {
    return { coreCount: 0, businessCount: 0, businessChunks: 0, chunkSize: 5000, totalUrls: 0 };
  }
}

export async function fetchSitemapCorePages(): Promise<Array<{ path: string; updatedAt?: string }>> {
  try {
    const res = await fetch(`${API}/api/v1/pages/sitemap-data?type=core`, {
      next: { revalidate: 3600, tags: ["sitemap"] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const pages = json.data?.pages || [];
    return pages.map((page: { path: string; updatedAt?: string }) => ({
      path: page.path,
      updatedAt: page.updatedAt,
    }));
  } catch {
    return [];
  }
}

export async function fetchSitemapBusinessChunk(
  page: number
): Promise<Array<{ path: string; updatedAt?: string }>> {
  try {
    const res = await fetch(`${API}/api/v1/pages/sitemap-data?type=business&page=${page}`, {
      next: { revalidate: 3600, tags: ["sitemap"] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const pages = json.data?.pages || [];
    return pages.map((entry: { path: string; updatedAt?: string }) => ({
      path: entry.path,
      updatedAt: entry.updatedAt,
    }));
  } catch {
    return [];
  }
}

export function getPagePublicPath(slug: string) {
  if (["terms", "privacy", "support", "infringement"].includes(slug)) {
    return `/${slug}`;
  }
  return `/page/${slug}`;
}

export function buildCmsMetadata(
  page: CmsPage | null,
  fallback: { title: string; description?: string }
) {
  const title = page?.metaTitle || page?.title || fallback.title;
  const description = page?.metaDescription || fallback.description || "";
  const canonical =
    page?.canonicalUrl ||
    (page?.slug ? `${SITE_URL}${getPagePublicPath(page.slug)}` : undefined);

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: page?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      images: page?.ogImage ? [page.ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: page?.ogImage ? [page.ogImage] : undefined,
    },
  };
}
