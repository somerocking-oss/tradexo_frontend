import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  buildListingsSearchParams,
  buildListingsSeo,
  isCategoryProductLed,
} from "@/lib/seo";
import { searchBusinessesServerWithMeta, getTrendingSearchesServer } from "@/lib/api/business-server";
import { fetchSiteSettings } from "@/lib/cms";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { buildListingsCategoryPath } from "@/lib/listings-url";
import { titleCase } from "@/lib/browse-slug";
import { getCategoryByIdServer, getCategoryBySlug } from "@/lib/api/category-server";
import {
  fetchSubCategoriesForCategoryServer,
  getSubCategoryByIdServer,
  getSubCategoryBySlug,
} from "@/lib/api/subcategory-server";
import { buildTrustStats, fetchPlatformStats } from "@/lib/platform-stats";
import type { Business } from "@/types";

const DEFAULT_HERO_TITLE =
  "Find Trusted Suppliers, Manufacturers & Services Across India";

async function resolveCategoryParams(
  params: Record<string, string | string[] | undefined>
) {
  const categorySlug =
    (typeof params.categorySlug === "string" ? params.categorySlug : undefined) ||
    (typeof params.category === "string" ? params.category : Array.isArray(params.category) ? params.category[0] : undefined);

  if (!params.categoryId && categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    if (category) {
      return {
        ...params,
        categoryId: category._id,
        categorySlug: category.slug || categorySlug,
        categoryName: category.name,
        categoryMetaTitle: category.metaTitle || "",
        categoryMetaDescription: category.metaDescription || "",
        categoryIsProductLed: String(isCategoryProductLed(category)),
      };
    }
  }

  const categoryId =
    typeof params.categoryId === "string"
      ? params.categoryId
      : Array.isArray(params.categoryId)
        ? params.categoryId[0]
        : undefined;

  if (categoryId && !params.categoryName) {
    const category = await getCategoryByIdServer(categoryId);
    if (category) {
      return {
        ...params,
        categorySlug: category.slug,
        categoryName: category.name,
        categoryMetaTitle: category.metaTitle || "",
        categoryMetaDescription: category.metaDescription || "",
        categoryIsProductLed: String(isCategoryProductLed(category)),
      };
    }
  }

  return params;
}

async function resolveSubCategoryParams(
  params: Record<string, string | string[] | undefined>
) {
  const subCategorySlug =
    (typeof params.subCategorySlug === "string" ? params.subCategorySlug : undefined) ||
    (typeof params.subcategory === "string"
      ? params.subcategory
      : Array.isArray(params.subcategory)
        ? params.subcategory[0]
        : undefined);

  const categoryId =
    typeof params.categoryId === "string"
      ? params.categoryId
      : Array.isArray(params.categoryId)
        ? params.categoryId[0]
        : undefined;

  if (!params.subCategoryId && subCategorySlug) {
    const subCategory = await getSubCategoryBySlug(subCategorySlug, categoryId);
    if (subCategory) {
      const subCategoryCategoryId =
        typeof subCategory.category === "object"
          ? subCategory.category?._id
          : subCategory.category;

      return {
        ...params,
        subCategoryId: subCategory._id,
        subCategorySlug: subCategory.slug || subCategorySlug,
        subCategoryName: subCategory.name,
        categoryId: categoryId || subCategoryCategoryId || params.categoryId,
      };
    }
  }

  const subCategoryId =
    typeof params.subCategoryId === "string"
      ? params.subCategoryId
      : Array.isArray(params.subCategoryId)
        ? params.subCategoryId[0]
        : undefined;

  if (subCategoryId && !params.subCategoryName) {
    const subCategory = await getSubCategoryByIdServer(subCategoryId);
    if (subCategory) {
      return {
        ...params,
        subCategorySlug: subCategory.slug,
        subCategoryName: subCategory.name,
      };
    }
  }

  return params;
}

export function buildListingsHeroProps(
  filters: ReturnType<typeof buildListingsSearchParams>,
  seo: ReturnType<typeof buildListingsSeo>,
  uiBreadcrumbs: Array<{ label: string; href?: string }>
) {
  const hasActiveFilters = Boolean(
    filters.keyword ||
      filters.city ||
      filters.nearMe ||
      filters.categoryId ||
      filters.categorySlug ||
      filters.subCategoryId ||
      filters.subCategorySlug ||
      filters.isVerified ||
      filters.isFeatured ||
      filters.acceptsBulkOrders ||
      filters.marketplaceType ||
      filters.sellerIntent
  );

  return {
    pageTitle: hasActiveFilters ? seo.h1 : DEFAULT_HERO_TITLE,
    pageSubtitle: seo.subtitle,
    categoryName: filters.categoryName || undefined,
    breadcrumbs: uiBreadcrumbs,
    compact: Boolean(filters.nearMe && filters.viewMode === "map"),
    isFiltered: hasActiveFilters,
    trustStats: [] as Array<{ value: string; label: string; icon?: string }>,
  };
}

export async function loadListingsPageData(
  params: Record<string, string | string[] | undefined>
) {
  const resolvedParams = await resolveSubCategoryParams(
    await resolveCategoryParams(params)
  );
  const settings = await fetchSiteSettings();
  const siteName = settings?.siteName || SITE_NAME;
  const onPage = settings?.seo?.onPage;
  const seo = buildListingsSeo(resolvedParams, onPage, siteName);
  const filters = buildListingsSearchParams(resolvedParams);

  const [platformStats, trendingTerms] = await Promise.all([
    fetchPlatformStats(),
    getTrendingSearchesServer(8),
  ]);
  const trustStats = buildTrustStats(settings?.homepage?.trustStats, platformStats);
  const popularSearches = settings?.homepage?.popularSearches?.length
    ? settings.homepage.popularSearches
    : trendingTerms;

  let initialBusinesses: Business[] = [];
  let serverPrefetched = false;
  let initialTotal = 0;
  let initialTotalPages = 1;

  const subcategories =
    filters.categoryId && !filters.nearMe
      ? await fetchSubCategoriesForCategoryServer(filters.categoryId)
      : [];

  if (!filters.nearMe) {
    const result = await searchBusinessesServerWithMeta({
      keyword: filters.keyword,
      city: filters.city,
      categoryId: filters.categoryId,
      subCategoryId: filters.subCategoryId,
      sort: filters.sort,
      isVerified: filters.isVerified,
      isFeatured: filters.isFeatured,
      acceptsBulkOrders: filters.acceptsBulkOrders,
      marketplaceType: filters.marketplaceType,
      sellerIntent: filters.sellerIntent,
      page: filters.page,
      limit: 12,
    });
    initialBusinesses = result.businesses;
    initialTotal = result.total;
    initialTotalPages = result.totalPages;
    serverPrefetched = initialBusinesses.length > 0;
  }

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: "Listings", url: `${SITE_URL}/listings` },
  ];

  if (filters.nearMe) {
    breadcrumbItems.push({ name: "Near Me", url: `${SITE_URL}/listings/near-me` });
    if (filters.viewMode === "map") {
      breadcrumbItems.push({ name: seo.h1, url: seo.canonical });
    }
  } else if (filters.city && filters.categorySlug) {
    breadcrumbItems.push({ name: seo.h1, url: seo.canonical });
  } else if (filters.city && !filters.keyword) {
    breadcrumbItems.push({ name: seo.h1, url: seo.canonical });
  } else if (filters.categorySlug && filters.subCategorySlug) {
    breadcrumbItems.push({
      name: filters.categoryName || titleCase(filters.categorySlug),
      url: `${SITE_URL}${buildListingsCategoryPath(filters.categorySlug)}`,
    });
    breadcrumbItems.push({ name: seo.h1, url: seo.canonical });
  } else if (filters.categorySlug && !filters.city && !filters.keyword) {
    breadcrumbItems.push({
      name: seo.h1,
      url: `${SITE_URL}${buildListingsCategoryPath(filters.categorySlug)}`,
    });
  } else if (filters.keyword || filters.city || filters.categorySlug || filters.roleSlug) {
    breadcrumbItems.push({ name: seo.h1, url: seo.canonical });
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);

  const itemListJsonLd =
    onPage?.schema?.enableItemList !== false && initialBusinesses.length > 0
      ? buildItemListJsonLd(initialBusinesses, seo.h1, seo.canonical)
      : null;

  const collectionPageJsonLd =
    onPage?.schema?.enableCollectionPage !== false
      ? buildCollectionPageJsonLd(seo.h1, seo.description, seo.canonical)
      : null;

  const uiBreadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Listings", href: "/listings" },
    ...(filters.nearMe
      ? [
          { label: "Near Me", href: "/listings/near-me" },
          ...(filters.viewMode === "map" ? [{ label: "Map view" }] : []),
        ]
      : filters.subCategorySlug && filters.categorySlug
        ? [
            {
              label: filters.categoryName || titleCase(filters.categorySlug),
              href: buildListingsCategoryPath(filters.categorySlug),
            },
            { label: filters.subCategoryName || titleCase(filters.subCategorySlug) },
          ]
        : filters.city || filters.keyword || filters.categorySlug || filters.roleSlug
          ? [{ label: seo.h1 }]
          : []),
  ];

  const hero = {
    ...buildListingsHeroProps(filters, seo, uiBreadcrumbs),
    trustStats,
  };

  return {
    seo,
    filters,
    hero,
    initialBusinesses,
    serverPrefetched,
    initialTotal,
    initialTotalPages,
    onPage,
    breadcrumbJsonLd,
    itemListJsonLd,
    collectionPageJsonLd,
    uiBreadcrumbs,
    cityLabel: filters.city || undefined,
    popularSearches,
    topCities: platformStats?.topCities || [],
    subcategories,
  };
}
