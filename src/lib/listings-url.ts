import { buildBrowseSlug, slugToCity, titleCase } from "@/lib/browse-slug";
import { getParam } from "@/lib/seo";

export const LISTINGS_NEAR_ME_BASE = "/listings/near-me";
export const DEFAULT_NEAR_ME_RADIUS_KM = 25;
export const NEAR_ME_RADIUS_OPTIONS = [5, 10, 25, 50] as const;

export function cityToSlug(city: string) {
  return city.trim().toLowerCase().replace(/\s+/g, "-");
}

export function buildListingsCityPath(city: string) {
  return `/listings/in/${cityToSlug(city)}`;
}

export function buildListingsCategoryPath(categorySlug: string, subCategorySlug?: string) {
  const base = `/listings/category/${categorySlug.trim().toLowerCase()}`;
  if (subCategorySlug?.trim()) {
    return `${base}/${subCategorySlug.trim().toLowerCase()}`;
  }
  return base;
}

export function buildListingsCityCategoryPath(
  city: string,
  categorySlug: string,
  subCategorySlug?: string
) {
  const base = `/listings/in/${cityToSlug(city)}/${categorySlug.trim().toLowerCase()}`;
  if (subCategorySlug?.trim()) {
    return `${base}/${subCategorySlug.trim().toLowerCase()}`;
  }
  return base;
}

/**
 * Strips a trailing `/page/{N}` pagination segment before path parsing —
 * without this, parsers that treat every trailing segment as
 * category/subcategory would misread "page" itself as a category slug (or
 * swallow the page number as a bogus subcategory slug).
 */
function stripPagePathSuffix(pathname: string) {
  return pathname.replace(/\/page\/\d+\/?$/, "");
}

export function isListingsCityCategoryPath(pathname: string) {
  return /^\/listings\/in\/[^/]+\/[^/]/.test(stripPagePathSuffix(pathname));
}

export function parseListingsCityCategoryPath(pathname: string) {
  const match = stripPagePathSuffix(pathname).match(
    /^\/listings\/in\/([^/]+)\/([^/]+)(?:\/([^/?]+))?/
  );
  if (!match) return { citySlug: "", categorySlug: "", subCategorySlug: "" };
  return {
    citySlug: match[1] || "",
    categorySlug: match[2] || "",
    subCategorySlug: match[3] || "",
  };
}

export function parseListingsCategoryPath(pathname: string) {
  const match = stripPagePathSuffix(pathname).match(
    /^\/listings\/category\/([^/]+)(?:\/([^/?]+))?/
  );
  if (!match) return { categorySlug: "", subCategorySlug: "" };
  return {
    categorySlug: match[1] || "",
    subCategorySlug: match[2] || "",
  };
}

export function isListingsCategoryPath(pathname: string) {
  return pathname.startsWith("/listings/category/");
}

export function categoryToSlug(category: { slug?: string; name: string }) {
  if (category.slug?.trim()) return category.slug.trim().toLowerCase();
  return category.name.trim().toLowerCase().replace(/\s+/g, "-");
}

export type ListingsUrlOptions = {
  keyword?: string;
  city?: string;
  categoryId?: string;
  categorySlug?: string;
  subCategoryId?: string;
  subCategorySlug?: string;
  sort?: string;
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
  bulkOnly?: boolean;
  marketplaceType?: string;
  sellerIntent?: string;
  nearMe?: boolean;
  radiusKm?: number;
  viewMode?: "grid" | "list" | "map";
  page?: number;
};

const COMPLEX_FILTER_KEYS = [
  "nearMe",
  "categoryId",
  "category",
  "subCategoryId",
  "subcategory",
  "subCategory",
  "sort",
  "isVerified",
  "isFeatured",
  "acceptsBulkOrders",
  "marketplaceType",
  "sellerIntent",
  "view",
  "radiusKm",
] as const;

export function isListingsNearMePath(pathname: string) {
  return pathname === LISTINGS_NEAR_ME_BASE || pathname.startsWith(`${LISTINGS_NEAR_ME_BASE}/`);
}

/** Parse `/listings/near-me`, `/listings/near-me/map`, `/listings/near-me/within-5km/map`. */
export function parseNearMeSegments(segments?: string[]) {
  let viewMode: "list" | "map" = "list";
  let radiusKm = DEFAULT_NEAR_ME_RADIUS_KM;

  if (!segments?.length) {
    return { viewMode, radiusKm };
  }

  const parts = [...segments];

  if (parts[parts.length - 1] === "map") {
    viewMode = "map";
    parts.pop();
  }

  if (parts.length === 1 && parts[0].startsWith("within-") && parts[0].endsWith("km")) {
    const parsed = Number.parseInt(parts[0].slice("within-".length, -"km".length), 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      radiusKm = parsed;
    }
  }

  return { viewMode, radiusKm };
}

export function buildListingsNearMePath(options: {
  viewMode?: "grid" | "list" | "map";
  radiusKm?: number;
}) {
  const radius = options.radiusKm ?? DEFAULT_NEAR_ME_RADIUS_KM;
  let path = LISTINGS_NEAR_ME_BASE;

  if (radius !== DEFAULT_NEAR_ME_RADIUS_KM) {
    path += `/within-${radius}km`;
  }

  if (options.viewMode === "map") {
    path += "/map";
  }

  return path;
}

export function hasComplexListingsFilters(
  params: Record<string, string | string[] | undefined>
) {
  return COMPLEX_FILTER_KEYS.some((key) => {
    const value = getParam(params, key);
    if (!value) return false;
    if (key === "sort" && (value === "priority" || value === "distance")) return false;
    if (key === "radiusKm" && value === String(DEFAULT_NEAR_ME_RADIUS_KM)) return false;
    return true;
  });
}

type SearchParamsLike = {
  get(name: string): string | null;
};

/** True when URL has filters but no city/keyword — e.g. `/listings?isVerified=true`. */
export function isFilterOnlyListingsQuery(params: SearchParamsLike) {
  const hasCityOrKeyword =
    params.get("city") || params.get("keyword") || params.get("q");
  if (hasCityOrKeyword) return false;
  if (params.get("nearMe") === "true") return false;

  return COMPLEX_FILTER_KEYS.some((key) => {
    const value = params.get(key);
    if (!value) return false;
    if (key === "sort" && value === "priority") return false;
    if (key === "nearMe") return false;
    return true;
  });
}

export function currentListingsHref(pathname: string, searchParams: SearchParamsLike) {
  const qs =
    "toString" in searchParams && typeof searchParams.toString === "function"
      ? searchParams.toString()
      : "";
  return qs ? `${pathname}?${qs}` : pathname;
}

export function listingsUrlsEqual(a: string, b: string) {
  const parse = (href: string) => {
    const [pathname, qs = ""] = href.split("?");
    const params = new URLSearchParams(qs);
    const entries = [...params.entries()].sort(([aKey], [bKey]) => aKey.localeCompare(bKey));
    return { pathname, query: entries.map(([k, v]) => `${k}=${v}`).join("&") };
  };

  const left = parse(a);
  const right = parse(b);
  return left.pathname === right.pathname && left.query === right.query;
}

function appendSharedFilterParams(params: URLSearchParams, options: ListingsUrlOptions) {
  const {
    categoryId,
    categorySlug,
    subCategoryId,
    subCategorySlug,
    verifiedOnly,
    featuredOnly,
    bulkOnly,
    marketplaceType,
    sellerIntent,
    page,
  } = options;

  if (categoryId) params.set("categoryId", categoryId);
  else if (categorySlug) params.set("category", categorySlug);
  if (subCategoryId) params.set("subCategoryId", subCategoryId);
  else if (subCategorySlug) params.set("subcategory", subCategorySlug);
  if (verifiedOnly) params.set("isVerified", "true");
  if (featuredOnly) params.set("isFeatured", "true");
  if (bulkOnly) params.set("acceptsBulkOrders", "true");
  if (marketplaceType) params.set("marketplaceType", marketplaceType);
  if (sellerIntent) params.set("sellerIntent", sellerIntent);
  if (page && page > 1) params.set("page", String(page));
}

function appendFilterParams(params: URLSearchParams, options: ListingsUrlOptions) {
  const { sort = "priority", nearMe, radiusKm, viewMode } = options;

  appendSharedFilterParams(params, options);

  if (sort !== "priority") params.set("sort", sort);
  if (nearMe) {
    params.set("nearMe", "true");
    params.set("radiusKm", String(radiusKm ?? DEFAULT_NEAR_ME_RADIUS_KM));
  }
  if (viewMode === "map") params.set("view", "map");
}

function appendNearMeQueryParams(params: URLSearchParams, options: ListingsUrlOptions) {
  appendSharedFilterParams(params, options);
}

function listingsOptionsFromParams(
  params: Record<string, string | string[] | undefined>
): ListingsUrlOptions {
  return {
    keyword: getParam(params, "keyword") || getParam(params, "q") || undefined,
    city: getParam(params, "city") || undefined,
    categoryId: getParam(params, "categoryId") || undefined,
    categorySlug: getParam(params, "category") || getParam(params, "categorySlug") || undefined,
    subCategoryId: getParam(params, "subCategoryId") || undefined,
    subCategorySlug:
      getParam(params, "subcategory") ||
      getParam(params, "subCategorySlug") ||
      getParam(params, "subCategory") ||
      undefined,
    sort: getParam(params, "sort") || undefined,
    verifiedOnly: getParam(params, "isVerified") === "true",
    featuredOnly: getParam(params, "isFeatured") === "true",
    bulkOnly: getParam(params, "acceptsBulkOrders") === "true",
    marketplaceType: getParam(params, "marketplaceType") || undefined,
    sellerIntent: getParam(params, "sellerIntent") || undefined,
    nearMe: getParam(params, "nearMe") === "true",
    radiusKm: Number(getParam(params, "radiusKm") || String(DEFAULT_NEAR_ME_RADIUS_KM)),
    viewMode: getParam(params, "view") === "map" ? "map" : "list",
    page: Number(getParam(params, "page") || "1"),
  };
}

/** Appends `/page/{N}` for page > 1 — page 1 always stays on the bare path. */
function appendPagePathSuffix(pathname: string, page?: number) {
  return page && page > 1 ? `${pathname}/page/${page}` : pathname;
}

/** Build SEO-friendly listings URL — path for city/keyword/category/near-me, query for filters. */
export function buildListingsUrl(options: ListingsUrlOptions): string {
  const keyword = options.keyword?.trim() || "";
  const city = options.city?.trim() || "";
  const categorySlug = options.categorySlug?.trim().toLowerCase() || "";
  const subCategorySlug = options.subCategorySlug?.trim().toLowerCase() || "";
  const params = new URLSearchParams();
  let pathname = "/listings";

  if (options.nearMe) {
    pathname = buildListingsNearMePath({
      viewMode: options.viewMode,
      radiusKm: options.radiusKm,
    });
    if (keyword) params.set("keyword", keyword);
    appendNearMeQueryParams(params, {
      ...options,
      categoryId: categorySlug ? undefined : options.categoryId,
      categorySlug: categorySlug || undefined,
    });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  if (city && categorySlug) {
    pathname = buildListingsCityCategoryPath(city, categorySlug, subCategorySlug || undefined);
    pathname = appendPagePathSuffix(pathname, options.page);
    if (keyword) params.set("keyword", keyword);
    appendFilterParams(params, {
      ...options,
      categoryId: undefined,
      categorySlug: undefined,
      subCategoryId: undefined,
      subCategorySlug: undefined,
      page: undefined,
    });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  if (city) {
    pathname = buildListingsCityPath(city);
    pathname = appendPagePathSuffix(pathname, options.page);
    if (keyword) params.set("keyword", keyword);
    appendFilterParams(params, {
      ...options,
      categoryId: categorySlug ? undefined : options.categoryId,
      categorySlug: undefined,
      page: undefined,
    });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  if (keyword) {
    pathname = `/browse/${buildBrowseSlug(keyword, "")}`;
    appendFilterParams(params, {
      ...options,
      categoryId: categorySlug ? undefined : options.categoryId,
      categorySlug: categorySlug || undefined,
    });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  if (categorySlug) {
    pathname = buildListingsCategoryPath(categorySlug, subCategorySlug || undefined);
    pathname = appendPagePathSuffix(pathname, options.page);
    appendFilterParams(params, {
      ...options,
      categoryId: undefined,
      categorySlug: undefined,
      subCategoryId: undefined,
      subCategorySlug: undefined,
      page: undefined,
    });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  pathname = appendPagePathSuffix(pathname, options.page);
  appendFilterParams(params, { ...options, page: undefined });
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function buildListingsCanonical(options: {
  keyword?: string;
  city?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  nearMe?: boolean;
  viewMode?: "grid" | "list" | "map";
  radiusKm?: number;
  page?: number;
}) {
  return buildListingsUrl({
    keyword: options.keyword,
    city: options.city,
    categorySlug: options.categorySlug,
    subCategorySlug: options.subCategorySlug,
    nearMe: options.nearMe,
    viewMode: options.viewMode,
    radiusKm: options.radiusKm,
    page: options.page,
  });
}

/** Redirect legacy query URLs to SEO-friendly paths. */
export function getListingsSeoRedirect(
  params: Record<string, string | string[] | undefined>
): string | null {
  const nearMe = getParam(params, "nearMe") === "true";
  if (nearMe) {
    const options = listingsOptionsFromParams(params);
    return buildListingsUrl({ ...options, nearMe: true, sort: "distance" });
  }

  const keyword = getParam(params, "keyword") || getParam(params, "q");
  const city = getParam(params, "city");
  const categorySlug = getParam(params, "category") || getParam(params, "categorySlug");
  const subCategorySlug = getParam(params, "subcategory") || getParam(params, "subCategorySlug");
  const page = Number(getParam(params, "page") || "1");

  if (!city && !keyword) {
    // Nothing to redirect for a clean path unless there's a legacy ?page=
    // to convert to the path-based form (e.g. bare /listings?page=3, or
    // /listings?category=x&page=3).
    if (page > 1) {
      return buildListingsUrl({
        categorySlug: categorySlug || undefined,
        subCategorySlug: subCategorySlug || undefined,
        sort: getParam(params, "sort") || undefined,
        verifiedOnly: getParam(params, "isVerified") === "true",
        featuredOnly: getParam(params, "isFeatured") === "true",
        bulkOnly: getParam(params, "acceptsBulkOrders") === "true",
        marketplaceType: getParam(params, "marketplaceType") || undefined,
        sellerIntent: getParam(params, "sellerIntent") || undefined,
        page,
      });
    }
    return null;
  }

  // city + category slug → clean path /listings/in/city/category
  if (city && categorySlug) {
    return buildListingsUrl({
      city,
      categorySlug,
      subCategorySlug: subCategorySlug || undefined,
      sort: getParam(params, "sort") || undefined,
      verifiedOnly: getParam(params, "isVerified") === "true",
      featuredOnly: getParam(params, "isFeatured") === "true",
      bulkOnly: getParam(params, "acceptsBulkOrders") === "true",
      marketplaceType: getParam(params, "marketplaceType") || undefined,
      sellerIntent: getParam(params, "sellerIntent") || undefined,
      page,
    });
  }

  const complex = hasComplexListingsFilters(params);

  if (keyword && city && !complex) {
    return buildListingsUrl({ keyword, city, page });
  }

  if (city && !keyword && !complex) {
    return buildListingsUrl({ city, page });
  }

  if (keyword && !city && !complex) {
    return buildListingsUrl({ keyword, page });
  }

  if (city && complex) {
    const redirectParams = new URLSearchParams();
    COMPLEX_FILTER_KEYS.forEach((key) => {
      const value = getParam(params, key);
      if (!value) return;
      if (key === "sort" && value === "priority") return;
      if (key === "nearMe") return;
      if (key === "category" || key === "categoryId") return; // handled above
      redirectParams.set(key, value);
    });
    if (keyword) redirectParams.set("keyword", keyword);
    if (page > 1) redirectParams.set("page", String(page));
    const qs = redirectParams.toString();
    const path = buildListingsCityPath(city);
    return qs ? `${path}?${qs}` : path;
  }

  return null;
}

export function parseListingsCityParam(citySlug: string) {
  return slugToCity(citySlug);
}

export function listingsCityLabel(city: string) {
  return titleCase(city);
}

export function nearMeRadiusLabel(radiusKm: number) {
  return `${radiusKm} km`;
}
