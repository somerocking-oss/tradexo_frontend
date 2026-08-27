import { SITE_URL } from "@/lib/constants";
import type { SitemapUrl } from "@/lib/sitemap-xml";
import {
  getStatesServer,
  getCityCategoryCombosServer,
  getCityCategorySubCategoryCombosServer,
} from "@/lib/api/business-server";
import {
  buildListingsCityCategoryPath,
  buildListingsCategoryPath,
  buildFlatSuppliersPath,
} from "@/lib/listings-url";
import { fetchAllCategoriesAllPages } from "@/lib/api/category-server";
import { categoryToSlug } from "@/lib/listings-url";
import type { MarketplaceProductsResponse } from "@/lib/api/products";

const PRODUCTS_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";

// Safety cap — every combo here is backed by >=1 real business (no thin-content
// risk), but this bounds sitemap size until per-chunk pagination is added.
const MAX_CITY_CATEGORY_SITEMAP_ENTRIES = 5000;
const MAX_CITY_CATEGORY_SUBCATEGORY_SITEMAP_ENTRIES = 5000;
const MAX_PRODUCT_SITEMAP_ENTRIES = 5000;

// A combo with only a couple of businesses has no unique content of its own —
// keep it out of the sitemap rather than indexing 76 categories × 179 cities
// blindly. Mirrors the noIndex threshold in buildListingsSeo (src/lib/seo.ts).
const MIN_INDEXABLE_BUSINESS_COUNT = 5;

export const STATIC_SITEMAP_ROUTES: SitemapUrl[] = [
  { loc: `${SITE_URL}`, changefreq: "daily", priority: 1 },
  { loc: `${SITE_URL}/listings`, changefreq: "daily", priority: 0.9 },
  { loc: `${SITE_URL}/listings/near-me`, changefreq: "weekly", priority: 0.8 },
  { loc: `${SITE_URL}/listings/near-me/map`, changefreq: "weekly", priority: 0.75 },
  { loc: `${SITE_URL}/browse`, changefreq: "daily", priority: 0.85 },
  { loc: `${SITE_URL}/categories`, changefreq: "weekly", priority: 0.8 },
  { loc: `${SITE_URL}/products`, changefreq: "daily", priority: 0.8 },
  { loc: `${SITE_URL}/register-business`, changefreq: "weekly", priority: 0.7 },
  { loc: `${SITE_URL}/plans`, changefreq: "weekly", priority: 0.7 },
  { loc: `${SITE_URL}/post-requirement`, changefreq: "weekly", priority: 0.75 },
  { loc: `${SITE_URL}/blog`, changefreq: "daily", priority: 0.7 },
  { loc: `${SITE_URL}/site-map`, changefreq: "weekly", priority: 0.5 },
];

export async function getCategorySitemapEntries(): Promise<SitemapUrl[]> {
  const categories = await fetchAllCategoriesAllPages();
  return categories.map((category) => ({
    loc: `${SITE_URL}${buildListingsCategoryPath(categoryToSlug(category))}`,
    changefreq: "weekly" as const,
    priority: 0.65,
  }));
}

export async function getProductSitemapEntries(): Promise<SitemapUrl[]> {
  const entries: SitemapUrl[] = [];
  let page = 1;
  const limit = 100;

  while (entries.length < MAX_PRODUCT_SITEMAP_ENTRIES) {
    let payload: MarketplaceProductsResponse | undefined;
    try {
      const res = await fetch(
        `${PRODUCTS_API}/api/v1/business-services/marketplace?inStock=true&page=${page}&limit=${limit}`,
        { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) break;
      const json = await res.json();
      payload = json.data;
    } catch {
      break;
    }

    const items = payload?.items || [];
    if (!items.length) break;

    for (const item of items) {
      if (item.slug) {
        entries.push({
          loc: `${SITE_URL}/product/${item.slug}`,
          changefreq: "weekly",
          priority: 0.55,
        });
      }
    }

    const totalPages = payload?.pagination?.totalPages ?? page;
    if (page >= totalPages) break;
    page += 1;
  }

  return entries.slice(0, MAX_PRODUCT_SITEMAP_ENTRIES);
}

export async function getStateSitemapEntries(): Promise<SitemapUrl[]> {
  const states = await getStatesServer();
  return [
    { loc: `${SITE_URL}/directory`, changefreq: "weekly", priority: 0.7 },
    ...states.map((s) => ({
      loc: `${SITE_URL}/directory/${s.slug}`,
      changefreq: "weekly" as const,
      priority: 0.65,
    })),
  ];
}

export async function getCityCategorySitemapEntries(): Promise<SitemapUrl[]> {
  const combos = await getCityCategoryCombosServer();
  return combos
    .filter((combo) => combo.count >= MIN_INDEXABLE_BUSINESS_COUNT)
    .slice(0, MAX_CITY_CATEGORY_SITEMAP_ENTRIES)
    .map((combo) => ({
      loc: `${SITE_URL}${buildListingsCityCategoryPath(combo.city, combo.categorySlug)}`,
      changefreq: "weekly" as const,
      priority: 0.6,
    }));
}

export async function getCityCategorySubCategorySitemapEntries(): Promise<SitemapUrl[]> {
  const combos = await getCityCategorySubCategoryCombosServer();
  return combos
    .filter((combo) => combo.count >= MIN_INDEXABLE_BUSINESS_COUNT)
    .slice(0, MAX_CITY_CATEGORY_SUBCATEGORY_SITEMAP_ENTRIES)
    .map((combo) => ({
      loc: `${SITE_URL}${buildListingsCityCategoryPath(combo.city, combo.categorySlug, combo.subCategorySlug)}`,
      changefreq: "weekly" as const,
      priority: 0.55,
    }));
}

// Long-tail `/{category}-suppliers-in-{city}` and `/{subcategory}-suppliers-in-{city}`
// landing pages. Each canonicalizes back to its nested /city/{city}/{slug} page
// (see buildFlatSuppliersPath) — listing them here is purely for crawl discovery,
// not a claim that they're the canonical URL.
export async function getFlatCategoryCitySitemapEntries(): Promise<SitemapUrl[]> {
  const combos = await getCityCategoryCombosServer();
  return combos
    .filter((combo) => combo.count >= MIN_INDEXABLE_BUSINESS_COUNT)
    .slice(0, MAX_CITY_CATEGORY_SITEMAP_ENTRIES)
    .map((combo) => ({
      loc: `${SITE_URL}${buildFlatSuppliersPath(combo.categorySlug, combo.city)}`,
      changefreq: "weekly" as const,
      priority: 0.65,
    }));
}

export async function getFlatSubCategoryCitySitemapEntries(): Promise<SitemapUrl[]> {
  const combos = await getCityCategorySubCategoryCombosServer();
  return combos
    .filter((combo) => combo.count >= MIN_INDEXABLE_BUSINESS_COUNT)
    .slice(0, MAX_CITY_CATEGORY_SUBCATEGORY_SITEMAP_ENTRIES)
    .map((combo) => ({
      loc: `${SITE_URL}${buildFlatSuppliersPath(combo.subCategorySlug, combo.city)}`,
      changefreq: "weekly" as const,
      priority: 0.6,
    }));
}

export function mapPathToSitemapUrl(page: { path: string; updatedAt?: string }): SitemapUrl {
  const isBrowse = page.path.startsWith("/browse/");
  const isBusiness = page.path.startsWith("/business/");

  return {
    loc: `${SITE_URL}${page.path}`,
    lastmod: page.updatedAt,
    changefreq: "weekly",
    priority: isBrowse ? 0.75 : isBusiness ? 0.7 : 0.6,
  };
}
