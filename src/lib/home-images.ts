/** Official Tradexo brand assets (public/). */
export const BRAND_LOGO = {
  light: "/tradexo-logo.png",
  dark: "/tradexo-logo-on-dark.png",
} as const;

export const BRAND_TAGLINE = "Markets near you, wholesalers across India.";

/** Hero badge — platform positioning (logo tagline stays on logo asset). */
export const BRAND_HERO_BADGE = "India's Premium B2B Business Platform";

/** Hero background slider slides (public/images/home). */
export const DEFAULT_HERO_SLIDES = [
  {
    src: "/images/home/hero-bg-b2b-platform.png",
    alt: "Premium B2B business platform",
    enabled: true,
  },
  {
    src: "/images/home/hero-bg-dark.png",
    alt: "Modern trade and supply chain",
    enabled: true,
  },
  {
    src: "/images/home/india-network.png",
    alt: "Pan-India business network",
    enabled: true,
  },
  {
    src: "/images/home/hero-main.png",
    alt: "Connect with verified suppliers",
    enabled: true,
  },
] as const;

export const DEFAULT_HERO_SLIDER_INTERVAL_MS = 5500;

/** @deprecated use DEFAULT_HERO_SLIDES */
export const HERO_SLIDES = DEFAULT_HERO_SLIDES;

export type HeroSlideConfig = {
  src: string;
  alt?: string;
  enabled?: boolean;
};

export function resolveHeroSlides(slides?: HeroSlideConfig[] | null) {
  const active = (slides || [])
    .filter((slide) => slide?.enabled !== false && slide?.src?.trim())
    .map((slide) => ({
      src: slide.src.trim(),
      alt: slide.alt?.trim() || "Tradexo hero slide",
    }));

  if (active.length) return active;

  return DEFAULT_HERO_SLIDES.map((slide) => ({
    src: slide.src,
    alt: slide.alt,
  }));
}

export function resolveHeroSliderIntervalMs(value?: number | null) {
  if (typeof value === "number" && value >= 2000 && value <= 30000) {
    return value;
  }
  return DEFAULT_HERO_SLIDER_INTERVAL_MS;
}

/** Local homepage marketing images (public/images/home). */
export const HOME_IMAGES = {
  heroBg: "/images/home/hero-bg-b2b-platform.png",
  heroBgNew: "/images/home/hero-bg-new.png",
  heroBgDark: "/images/home/hero-bg-dark.png",
  hero: "/images/home/hero-main.png",
  heroB2bMarketplace: "/images/home/hero-b2b-marketplace.png",
  buyerSearch: "/images/home/buyer-search.png",
  sellerLeads: "/images/home/seller-leads.png",
  indiaNetwork: "/images/home/india-network.png",
  listBusinessCta: "/images/home/list-business-cta.png",
  howItWorks: "/images/home/how-it-works.png",
  registerHero: "/images/register/hero-visual.png",
  registerSeller: "/images/home/seller-leads.png",
} as const;
