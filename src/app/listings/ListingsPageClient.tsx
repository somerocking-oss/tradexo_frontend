"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  Filter,
  LayoutGrid,
  List,
  LocateFixed,
  Map,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { resolveIcon } from "@/lib/categoryIcons";
import { BusinessGrid } from "@/components/business/BusinessCard";
import { LeadModal } from "@/components/business/LeadModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useUserCity } from "@/hooks/useUserCity";
import { useUserLocation } from "@/hooks/useUserLocation";
import { extractBusinessList, extractPagination, searchBusinesses } from "@/lib/api/business";
import { trackSearchEvent } from "@/lib/analytics/track";
import { fetchAllCategories } from "@/lib/api/category";
import { getAiSettings, interpretSearchWithAi } from "@/lib/api/ai";
import { fetchSubCategoriesForCategory } from "@/lib/api/subcategory";
import { subCategoryToSlug } from "@/lib/api/subcategory-server";
import { B2B_ROLE_OPTIONS, SELLER_INTENT_OPTIONS, SORT_OPTIONS } from "@/lib/constants";
import {
  buildListingsUrl,
  categoryToSlug,
  currentListingsHref,
  DEFAULT_NEAR_ME_RADIUS_KM,
  isFilterOnlyListingsQuery,
  isListingsCategoryPath,
  parseListingsCategoryPath,
  isListingsCityCategoryPath,
  parseListingsCityCategoryPath,
  isListingsNearMePath,
  listingsUrlsEqual,
  NEAR_ME_RADIUS_OPTIONS,
} from "@/lib/listings-url";
import { cn } from "@/lib/utils";
import { ListingsSidebar } from "./ListingsSidebar";
import { ListingsSubcategoryBar } from "./ListingsSubcategoryBar";
import { ListingsBusinessList } from "./ListingsBusinessRow";
import { ListingsTrustSection } from "./ListingsTrustSection";
import { ListingsPagination } from "./ListingsPagination";
import { ListingsRelatedLinks } from "./ListingsRelatedLinks";
import { ListingsCategoryFaq } from "./ListingsCategoryFaq";
import type { Business, Category, SubCategory } from "@/types";
import type { PlatformStats } from "@/lib/platform-stats";

const ListingsMap = dynamic(
  () => import("@/components/map/ListingsMap").then((mod) => mod.ListingsMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 text-sm font-medium">
        Loading map…
      </div>
    ),
  }
);

export function ListingsPageClient({
  initialBusinesses = [],
  serverPrefetched = false,
  initialTotal,
  initialTotalPages,
  pathCity,
  pathNearMe,
  pathViewMode,
  pathRadiusKm,
  pathCategoryId,
  pathCategorySlug,
  pathSubCategoryId,
  pathSubCategorySlug,
  pathMarketplaceType,
  pathPage,
  initialSubcategories = [],
  initialPopularSearches = [],
  topCities = [],
}: {
  initialBusinesses?: Business[];
  serverPrefetched?: boolean;
  initialTotal?: number;
  initialTotalPages?: number;
  pathCity?: string;
  pathNearMe?: boolean;
  pathViewMode?: "list" | "map";
  pathRadiusKm?: number;
  pathCategoryId?: string;
  pathCategorySlug?: string;
  pathSubCategoryId?: string;
  pathSubCategorySlug?: string;
  pathMarketplaceType?: string;
  pathPage?: number;
  initialSubcategories?: SubCategory[];
  initialPopularSearches?: string[];
  topCities?: PlatformStats["topCities"];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initialNearMe = pathNearMe ?? searchParams.get("nearMe") === "true";

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || searchParams.get("q") || "");
  const [city, setCity] = useState(pathCity || searchParams.get("city") || "");
  const [categoryId, setCategoryId] = useState(pathCategoryId || searchParams.get("categoryId") || "");
  const [subCategoryId, setSubCategoryId] = useState(
    pathSubCategoryId || searchParams.get("subCategoryId") || ""
  );
  const [subcategories, setSubcategories] = useState<SubCategory[]>(initialSubcategories);
  const [sort, setSort] = useState(
    initialNearMe ? searchParams.get("sort") || "distance" : searchParams.get("sort") || "priority"
  );
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("isVerified") === "true");
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("isFeatured") === "true");
  const [bulkOnly, setBulkOnly] = useState(searchParams.get("acceptsBulkOrders") === "true");
  const [marketplaceType, setMarketplaceType] = useState(
    pathMarketplaceType || searchParams.get("marketplaceType") || ""
  );
  const [sellerIntent, setSellerIntent] = useState(searchParams.get("sellerIntent") || "");
  const [page, setPage] = useState(pathPage || Number(searchParams.get("page")) || 1);
  const [nearMe, setNearMe] = useState(initialNearMe);
  const [radiusKm, setRadiusKm] = useState(
    pathRadiusKm ?? (Number(searchParams.get("radiusKm")) || DEFAULT_NEAR_ME_RADIUS_KM)
  );
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!serverPrefetched);
  const skipInitialFetchRef = useRef(serverPrefetched);
  const isFirstRunRef = useRef(true);
  // goToPage() calls router.replace() to sync ?page= into the URL, which
  // changes the searchParams identity and would otherwise re-trigger the
  // filter-sync effect below (it depends on searchParams) — bouncing the
  // page back to 1. This flag lets goToPage skip that one re-entrant run.
  const skipNextFilterEffectRef = useRef(false);
  // Tracks the filter values the effect last acted on. React Strict Mode
  // (dev only) re-runs effects a second time on mount with identical deps,
  // and route-level remounts (e.g. deep-linking straight to a /page/N URL)
  // can do the same — without this, that duplicate run looks identical to a
  // real filter change and wrongly resets pagination back to page 1.
  const lastFilterKeyRef = useRef<string | null>(null);
  const [totalResults, setTotalResults] = useState(initialTotal ?? initialBusinesses.length);
  const [totalPages, setTotalPages] = useState(Math.max(1, initialTotalPages ?? 1));
  const [leadBusiness, setLeadBusiness] = useState<Business | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const popularSearches = initialPopularSearches;
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">(
    pathViewMode ?? (searchParams.get("view") === "map" ? "map" : "list")
  );
  const [aiSearchAvailable, setAiSearchAvailable] = useState(false);
  const [aiInterpreting, setAiInterpreting] = useState(false);

  useEffect(() => {
    getAiSettings()
      .then((settings) => setAiSearchAvailable(settings.enabled && settings.features.smartSearch))
      .catch(() => setAiSearchAvailable(false));
  }, []);

  const { city: detectedCity, setCity: saveUserCity } = useUserCity({ autoDetect: false });
  const { coords, loading: locating, error: locationError, isApproximate, detectLocation, detectPreciseLocation, clearLocation } = useUserLocation();

  const debouncedKeyword = useDebounce(keyword);
  const effectiveCity = nearMe ? "" : (city.trim() || pathCity || "").trim();

  const activeCategory =
    categoryId
      ? categories.find((c) => c._id === categoryId) ||
        (pathCategoryId === categoryId && pathCategorySlug
          ? { _id: pathCategoryId, slug: pathCategorySlug, name: "" }
          : undefined)
      : undefined;

  const activeCategorySlug = activeCategory
    ? activeCategory.slug || categoryToSlug(activeCategory)
    : pathCategorySlug ||
      parseListingsCategoryPath(pathname).categorySlug ||
      parseListingsCityCategoryPath(pathname).categorySlug ||
      undefined;

  const matchedCategory =
    activeCategory || categories.find((c) => categoryToSlug(c) === (pathCategorySlug || activeCategorySlug));

  const resolvedCategoryLabel = matchedCategory?.name || undefined;

  const resolvedCategoryDescription =
    matchedCategory?.description || matchedCategory?.shortDescription || undefined;

  const activeSubCategory =
    subCategoryId
      ? subcategories.find((s) => s._id === subCategoryId) ||
        (pathSubCategoryId === subCategoryId && pathSubCategorySlug
          ? { _id: pathSubCategoryId, slug: pathSubCategorySlug, name: "" }
          : undefined)
      : undefined;

  const activeSubCategorySlug =
    activeSubCategory?.slug ||
    (activeSubCategory ? subCategoryToSlug(activeSubCategory) : undefined) ||
    pathSubCategorySlug ||
    parseListingsCategoryPath(pathname).subCategorySlug ||
    parseListingsCityCategoryPath(pathname).subCategorySlug ||
    undefined;

  const showSubcategoryBar = Boolean(
    (pathCategorySlug || isListingsCategoryPath(pathname)) && subcategories.length > 0
  );

  const listingsUrlOptions = useCallback(
    (pageNum: number) => ({
      keyword: debouncedKeyword,
      city: nearMe ? undefined : effectiveCity || undefined,
      categorySlug: categoryId ? activeCategorySlug : undefined,
      categoryId: categoryId && !activeCategorySlug ? categoryId : undefined,
      subCategorySlug: subCategoryId ? activeSubCategorySlug : undefined,
      subCategoryId: subCategoryId && !activeSubCategorySlug ? subCategoryId : undefined,
      sort,
      verifiedOnly,
      featuredOnly,
      bulkOnly,
      marketplaceType,
      sellerIntent,
      nearMe,
      radiusKm,
      viewMode,
      page: pageNum,
    }),
    [
      debouncedKeyword,
      effectiveCity,
      categoryId,
      subCategoryId,
      activeCategorySlug,
      activeSubCategorySlug,
      sort,
      verifiedOnly,
      featuredOnly,
      bulkOnly,
      marketplaceType,
      sellerIntent,
      nearMe,
      radiusKm,
      viewMode,
    ]
  );

  const listingTracking = {
    source: debouncedKeyword.trim() ? ("search" as const) : ("listing" as const),
    keyword: debouncedKeyword.trim() || undefined,
    city: effectiveCity || undefined,
  };

  const mapTracking = {
    source: "map" as const,
    keyword: debouncedKeyword.trim() || undefined,
    city: effectiveCity || undefined,
  };

  useEffect(() => {
    if (pathCity || pathNearMe || pathCategoryId || isListingsNearMePath(pathname) || isListingsCategoryPath(pathname) || isListingsCityCategoryPath(pathname)) return;
    const urlCity = searchParams.get("city") || "";
    if (urlCity) return;
    if (isFilterOnlyListingsQuery(searchParams)) return;
    if (detectedCity && !city && !nearMe) setCity(detectedCity);
  }, [detectedCity, searchParams, city, nearMe, pathCity, pathNearMe, pathCategoryId, pathname]);

  useEffect(() => {
    if (city.trim() && !nearMe) saveUserCity(city);
  }, [city, nearMe, saveUserCity]);

  useEffect(() => {
    if (initialSubcategories.length) return;
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    fetchSubCategoriesForCategory(categoryId).then(setSubcategories);
  }, [categoryId, initialSubcategories.length]);

  useEffect(() => {
    const subCategorySlugParam = searchParams.get("subcategory");
    if (!subCategorySlugParam || subCategoryId || !subcategories.length) return;
    const match = subcategories.find(
      (s) => subCategoryToSlug(s) === subCategorySlugParam.toLowerCase()
    );
    if (match) setSubCategoryId(match._id);
  }, [searchParams, subcategories, subCategoryId]);

  useEffect(() => {
    if (pathSubCategoryId) return;
    if (!isListingsCategoryPath(pathname) && !isListingsCityCategoryPath(pathname)) return;
    const { subCategorySlug } = isListingsCategoryPath(pathname)
      ? parseListingsCategoryPath(pathname)
      : parseListingsCityCategoryPath(pathname);
    if (!subCategorySlug) {
      setSubCategoryId("");
      return;
    }
    const match = subcategories.find(
      (s) => subCategoryToSlug(s) === subCategorySlug.toLowerCase()
    );
    if (match) setSubCategoryId(match._id);
  }, [pathname, subcategories, pathSubCategoryId]);

  useEffect(() => {
    fetchAllCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const categorySlugParam = searchParams.get("category");
    if (!categorySlugParam || categoryId || !categories.length) return;
    const match = categories.find((c) => categoryToSlug(c) === categorySlugParam.toLowerCase());
    if (match) setCategoryId(match._id);
  }, [searchParams, categories, categoryId]);

  useEffect(() => {
    if (nearMe && !coords && !locating) detectLocation();
  }, [nearMe, coords, locating, detectLocation]);

  useEffect(() => {
    if (nearMe && sort === "priority") setSort("distance");
  }, [nearMe, sort]);

  const fetchListings = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const res = await searchBusinesses({
          keyword: debouncedKeyword || undefined,
          city: nearMe ? undefined : effectiveCity || undefined,
          categoryId: categoryId || undefined,
          subCategoryId: subCategoryId || undefined,
          sort,
          lat: nearMe && coords ? coords.lat : undefined,
          lng: nearMe && coords ? coords.lng : undefined,
          radiusKm: nearMe ? radiusKm : undefined,
          isVerified: verifiedOnly || undefined,
          isFeatured: featuredOnly || undefined,
          marketplaceType: marketplaceType || undefined,
          sellerIntent: sellerIntent || undefined,
          acceptsBulkOrders: bulkOnly || undefined,
          page: pageNum,
          limit: viewMode === "map" ? 50 : 12,
        });
        const list = extractBusinessList(res.data);
        const pagination = extractPagination(res.data);
        setBusinesses(list);
        if (pagination) {
          setTotalResults(pagination.total);
          setTotalPages(Math.max(1, pagination.totalPages));
        } else {
          setTotalResults(list.length);
          setTotalPages(list.length >= 12 ? pageNum + 1 : pageNum);
        }
        if (pageNum === 1 && debouncedKeyword.trim()) {
          trackSearchEvent(debouncedKeyword.trim(), effectiveCity || undefined);
        }
      } catch {
        setBusinesses([]);
        setTotalResults(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedKeyword,
      effectiveCity,
      categoryId,
      subCategoryId,
      sort,
      verifiedOnly,
      featuredOnly,
      bulkOnly,
      marketplaceType,
      sellerIntent,
      nearMe,
      coords,
      radiusKm,
      viewMode,
    ]
  );

  useEffect(() => {
    if (nearMe && !coords) return;

    const filterKey = JSON.stringify([
      debouncedKeyword,
      effectiveCity,
      categoryId,
      sort,
      verifiedOnly,
      featuredOnly,
      bulkOnly,
      marketplaceType,
      sellerIntent,
      nearMe,
      coords?.lat,
      coords?.lng,
      radiusKm,
      viewMode,
    ]);

    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      lastFilterKeyRef.current = filterKey;
      if (skipInitialFetchRef.current) {
        skipInitialFetchRef.current = false;
        return;
      }
      // No server-prefetched data for this mount — either the SSR fetch
      // was skipped for a page >1 (deep link / refresh on ?page=2+), or it
      // returned zero results. Fetch whatever page the URL/state already
      // says, instead of forcing page 1 and silently stripping ?page= off
      // the URL.
      fetchListings(page);
      return;
    }

    if (skipNextFilterEffectRef.current) {
      skipNextFilterEffectRef.current = false;
      lastFilterKeyRef.current = filterKey;
      return;
    }

    // Duplicate re-run with unchanged filters (React Strict Mode's dev-only
    // double-invoke on mount, or a route remount from deep-linking to a
    // /page/N URL) — not a real filter change, so don't stomp on the page
    // the URL/state already reflects.
    if (lastFilterKeyRef.current === filterKey) {
      return;
    }
    lastFilterKeyRef.current = filterKey;

    setPage(1);
    fetchListings(1);

    const url = buildListingsUrl(listingsUrlOptions(1));
    const currentUrl = currentListingsHref(pathname, searchParams);
    if (!listingsUrlsEqual(url, currentUrl)) {
      router.replace(url, { scroll: false });
    }
    // `page` intentionally excluded from deps below — it's only read inside
    // the first-run branch above. Adding it would re-run this effect on
    // every goToPage() call (after isFirstRunRef is already false), falling
    // through to the "reset to page 1" branch and undoing pagination.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedKeyword,
    effectiveCity,
    categoryId,
    sort,
    verifiedOnly,
    featuredOnly,
    bulkOnly,
    marketplaceType,
    sellerIntent,
    nearMe,
    coords,
    radiusKm,
    viewMode,
    fetchListings,
    listingsUrlOptions,
    router,
    pathname,
    searchParams,
  ]);

  const goToPage = (p: number) => {
    setPage(p);
    fetchListings(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const url = buildListingsUrl(listingsUrlOptions(p));
    skipNextFilterEffectRef.current = true;
    router.replace(url, { scroll: false });
  };

  const handleAiSearch = async () => {
    if (!keyword.trim()) return;
    setAiInterpreting(true);
    try {
      const res = await interpretSearchWithAi(keyword.trim());
      if (res.success && res.data) {
        const result = res.data;
        if (result.keyword) setKeyword(result.keyword);
        if (result.city) setCity(result.city);
        if (result.category) {
          const match = categories.find(
            (c) => c.name.toLowerCase() === result.category!.toLowerCase()
          );
          if (match) setCategoryId(match._id);
        }
        if (result.nearMe) {
          await handleNearMe();
        }
      }
    } catch {
      // Silent fail — user can still search normally
    } finally {
      setAiInterpreting(false);
      setPage(1);
      fetchListings(1);
    }
  };

  const handleNearMe = async () => {
    const location = await detectLocation();
    if (location) {
      setNearMe(true);
      setSort("distance");
      setViewMode("map");
    }
  };

  const clearNearMe = () => {
    setNearMe(false);
    clearLocation();
    if (sort === "distance") setSort("priority");
  };

  const resultsLabel = loading
    ? "Searching…"
    : `${totalResults.toLocaleString("en-IN")} result${totalResults !== 1 ? "s" : ""} found`;

  return (
    <>
      {/* ── Sticky search + primary filters (single bar under navbar) ── */}
      <div className="sticky top-14 z-30 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-8xl px-4 py-3 sm:px-6 lg:pr-16">

          {/* Search form */}
          <form
            aria-label="Search businesses"
            className="flex flex-col overflow-hidden rounded-xl border-2 border-neutral-200 bg-white transition-colors focus-within:border-[#FF6C00] shadow-sm sm:flex-row sm:items-stretch"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchListings(1);
            }}
          >
            {/* Keyword field */}
            <div className="relative flex flex-1 items-center border-b border-neutral-200 sm:border-b-0 sm:border-r">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-neutral-400" aria-hidden />
              <label htmlFor="listings-keyword" className="sr-only">What are you looking for?</label>
              <Input
                id="listings-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="What are you looking for?"
                className="h-12 border-0 pl-11 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-none focus-visible:ring-0"
              />
            </div>

            {/* City field */}
            <div className="flex flex-1 items-center border-b border-neutral-200 sm:border-b-0 sm:border-r">
              <label htmlFor="listings-city" className="sr-only">City</label>
              <Input
                id="listings-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                disabled={nearMe}
                className="h-12 border-0 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-none focus-visible:ring-0 disabled:opacity-50"
              />
            </div>

            {/* AI-powered search */}
            {aiSearchAvailable && (
              <button
                type="button"
                onClick={handleAiSearch}
                disabled={aiInterpreting || !keyword.trim()}
                title="Describe what you need in plain language and let AI find the right filters"
                className="flex h-12 items-center justify-center gap-1.5 border-t border-neutral-200 bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50 sm:border-t-0 sm:border-l"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {aiInterpreting ? "Thinking…" : "AI Search"}
              </button>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-none bg-[#FF6C00] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#E86200] sm:min-w-[130px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00] focus-visible:ring-offset-1"
            >
              <Search className="h-4 w-4" aria-hidden />
              Search
            </button>
          </form>

          {/* Filter row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">

            {/* Near Me pill */}
            <button
              type="button"
              onClick={nearMe ? clearNearMe : handleNearMe}
              disabled={locating}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30",
                nearMe
                  ? "border-[#FF6C00] bg-[#FF6C00] text-white shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-[#FF6C00] hover:text-[#FF6C00]",
                locating && "opacity-60 cursor-not-allowed"
              )}
            >
              {nearMe ? <X className="h-3.5 w-3.5" aria-hidden /> : <LocateFixed className="h-3.5 w-3.5" aria-hidden />}
              {locating ? "Locating…" : nearMe ? "Near Me ON" : "Near Me"}
            </button>

            {/* Category select */}
            <div className="relative">
              <label htmlFor="listings-category" className="sr-only">Category</label>
              <select
                id="listings-category"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId("");
                }}
                className="h-9 appearance-none rounded-full border border-neutral-200 bg-white pl-3 pr-8 text-xs font-medium text-neutral-700 outline-none transition-colors hover:border-[#FF6C00] focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" aria-hidden />
            </div>

            {/* Sort select */}
            <div className="relative">
              <label htmlFor="listings-sort" className="sr-only">Sort by</label>
              <select
                id="listings-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 appearance-none rounded-full border border-neutral-200 bg-white pl-3 pr-8 text-xs font-medium text-neutral-700 outline-none transition-colors hover:border-[#FF6C00] focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20 cursor-pointer"
              >
                {SORT_OPTIONS.filter((o) => o.value !== "distance" || nearMe).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" aria-hidden />
            </div>

            {/* Supplier type — hidden on mobile */}
            <div className="relative hidden sm:block">
              <label htmlFor="listings-role" className="sr-only">Supplier type</label>
              <select
                id="listings-role"
                value={marketplaceType}
                onChange={(e) => setMarketplaceType(e.target.value)}
                className="h-9 appearance-none rounded-full border border-neutral-200 bg-white pl-3 pr-8 text-xs font-medium text-neutral-700 outline-none transition-colors hover:border-[#FF6C00] focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20 cursor-pointer"
              >
                {B2B_ROLE_OPTIONS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" aria-hidden />
            </div>

            {/* Mobile: open filters panel */}
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30",
                filtersOpen
                  ? "border-[#FF6C00] bg-[#F0F0F0] text-[#FF6C00]"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              )}
            >
              <Filter className="h-3.5 w-3.5" aria-hidden />
              Filters
            </button>

            {/* View mode toggle */}
            <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-[#FF6C00] text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-700"
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-[#FF6C00] text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-700"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  viewMode === "map"
                    ? "bg-[#FF6C00] text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-700"
                )}
                aria-label="Map view"
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Secondary filters (scroll away — avoids double sticky header) ── */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-8xl px-4 pb-4 pt-3 sm:px-6 lg:pr-16">

          {/* Popular searches */}
          {popularSearches.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setKeyword(term)}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-[#FF6C00]/40 hover:bg-[#F0F0F0] hover:text-[#FF6C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/20"
              >
                {term}
              </button>
            ))}
            <Link
              href="/browse"
              className="ml-auto shrink-0 text-xs font-semibold text-[#FF6C00] hover:underline"
            >
              View All
            </Link>
          </div>
          ) : null}

          {/* Expanded filter panel */}
          <div className={cn("mt-3 flex flex-wrap items-center gap-3", filtersOpen ? "flex" : "hidden lg:flex")}>

            {/* Verified only pill-checkbox */}
            <label className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors select-none",
              verifiedOnly
                ? "border-[#FF6C00] bg-[#F0F0F0] text-[#FF6C00]"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            )}>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="sr-only"
              />
              <span className={cn(
                "flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors",
                verifiedOnly ? "border-[#FF6C00] bg-[#FF6C00]" : "border-neutral-300"
              )}>
                {verifiedOnly && (
                  <svg className="h-2 w-2 text-white" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              Verified Only
            </label>

            {/* Featured only pill-checkbox */}
            <label className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors select-none",
              featuredOnly
                ? "border-[#FF6C00] bg-[#F0F0F0] text-[#FF6C00]"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            )}>
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="sr-only"
              />
              <span className={cn(
                "flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors",
                featuredOnly ? "border-[#FF6C00] bg-[#FF6C00]" : "border-neutral-300"
              )}>
                {featuredOnly && (
                  <svg className="h-2 w-2 text-white" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              Featured Only
            </label>

            {/* Bulk only pill-checkbox */}
            <label className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors select-none",
              bulkOnly
                ? "border-[#FF6C00] bg-[#F0F0F0] text-[#FF6C00]"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            )}>
              <input
                type="checkbox"
                checked={bulkOnly}
                onChange={(e) => setBulkOnly(e.target.checked)}
                className="sr-only"
              />
              <span className={cn(
                "flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors",
                bulkOnly ? "border-[#FF6C00] bg-[#FF6C00]" : "border-neutral-300"
              )}>
                {bulkOnly && (
                  <svg className="h-2 w-2 text-white" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              Bulk / B2B Orders
            </label>

            {/* More filters toggle */}
            <button
              type="button"
              onClick={() => setMoreFiltersOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 transition-colors hover:text-[#FF6C00] focus-visible:outline-none"
            >
              More Filters
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", moreFiltersOpen && "rotate-180")} />
            </button>

            {/* More filters: seller intent */}
            {moreFiltersOpen && (
              <div className="relative">
                <label htmlFor="listings-seller-intent" className="sr-only">Seller type</label>
                <select
                  id="listings-seller-intent"
                  value={sellerIntent}
                  onChange={(e) => setSellerIntent(e.target.value)}
                  className="h-9 appearance-none rounded-full border border-neutral-200 bg-white pl-3 pr-8 text-xs font-medium text-neutral-700 outline-none transition-colors hover:border-[#FF6C00] focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20 cursor-pointer"
                >
                  {SELLER_INTENT_OPTIONS.map((o) => (
                    <option key={o.value || "all"} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" aria-hidden />
              </div>
            )}

            {/* Near me radius pills */}
            {nearMe && (
              <div className="flex flex-wrap items-center gap-1.5">
                {NEAR_ME_RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadiusKm(r)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/20",
                      radiusKm === r
                        ? "border-[#FF6C00] bg-[#F0F0F0] text-[#FF6C00]"
                        : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300"
                    )}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            )}

            {/* Location error */}
            {locationError && nearMe && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">{locationError}</span>
            )}

            {/* GPS precision upgrade */}
            {nearMe && coords && isApproximate && (
              <button
                type="button"
                disabled={locating}
                onClick={detectPreciseLocation}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/20"
              >
                <LocateFixed className="h-3.5 w-3.5" aria-hidden />
                {locating ? "Locating…" : "Use exact GPS"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showSubcategoryBar && (
        <ListingsSubcategoryBar
          categorySlug={pathCategorySlug || activeCategorySlug || ""}
          city={nearMe ? undefined : effectiveCity || undefined}
          subcategories={subcategories}
          activeSubCategorySlug={subCategoryId ? activeSubCategorySlug : undefined}
        />
      )}

      {/* ── Main content ── */}
      <div className="bg-neutral-50 min-h-screen">
        <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 sm:py-8 lg:pr-16">
          {resolvedCategoryDescription && (
            <div className="mb-6 rounded-2xl border border-neutral-400 bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start lg:grid-cols-[auto_1fr_auto]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FB]">
                  {(() => {
                    const CategoryIcon = resolveIcon(resolvedCategoryLabel || "");
                    return <CategoryIcon className="h-6 w-6 text-[#0B3B6F]" aria-hidden />;
                  })()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[#111]">
                    The {resolvedCategoryLabel || "Category"} category
                  </h2>
                  <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-neutral-600">
                    {resolvedCategoryDescription}
                  </p>
                </div>
                <ul className="grid shrink-0 grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2 sm:pl-16 lg:col-span-1 lg:grid-cols-1 lg:pl-0">
                  {[
                    "Verified & Trusted Businesses",
                    "Instant Quotes & Easy Contact",
                    "Compare & Choose Best Providers",
                    "100% Safe & Secure",
                  ].map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-[#333]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">

            {/* Sidebar — desktop only */}
            <div className="hidden lg:block">
              <div className="sticky top-[11.5rem]">
                <ListingsSidebar
                  categories={categories}
                  topCities={topCities}
                  activeCategoryId={categoryId}
                  activeCity={effectiveCity}
                  onCategorySelect={setCategoryId}
                  onCitySelect={setCity}
                />
              </div>
            </div>

            {/* Results column */}
            <div>

              {/* Results header */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p
                  className="text-sm font-medium text-neutral-500"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-40 animate-pulse rounded bg-neutral-200" />
                  ) : (
                    <>
                      <span className="font-bold text-neutral-900">{totalResults.toLocaleString("en-IN")}</span>
                      {" "}result{totalResults !== 1 ? "s" : ""}
                      {nearMe
                        ? <span className="text-neutral-400"> within <span className="text-neutral-600 font-semibold">{radiusKm} km</span></span>
                        : effectiveCity
                          ? <span className="text-neutral-400"> in <span className="text-neutral-600 font-semibold">{effectiveCity}</span></span>
                          : " found"}
                    </>
                  )}
                </p>
              </div>

              {/* Near Me — waiting for GPS */}
              {nearMe && !coords ? (
                <div className="rounded-xl border border-[#E5E5E5] bg-[#F0F0F0] px-6 py-14 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5E5E5]">
                    <LocateFixed className="h-7 w-7 text-[#FF6C00]" aria-hidden />
                  </div>
                  <p className="text-base font-semibold text-neutral-900">Finding businesses near you</p>
                  <p className="mt-1 text-sm text-neutral-500">Allow location access to see results closest to you.</p>
                  <button
                    type="button"
                    onClick={handleNearMe}
                    disabled={locating}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#FF6C00] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E86200] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]"
                  >
                    <LocateFixed className="h-4 w-4" aria-hidden />
                    {locating ? "Detecting…" : "Detect Location"}
                  </button>
                </div>

              ) : viewMode === "map" ? (
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
                    <ListingsMap
                      businesses={businesses}
                      userLat={nearMe ? coords?.lat : undefined}
                      userLng={nearMe ? coords?.lng : undefined}
                      radiusKm={nearMe ? radiusKm : undefined}
                      height={480}
                      tracking={mapTracking}
                    />
                  </div>
                  <ListingsBusinessList
                    businesses={businesses.slice(0, 6)}
                    loading={loading}
                    onLead={setLeadBusiness}
                    tracking={listingTracking}
                  />
                </div>

              ) : viewMode === "grid" ? (
                <>
                  <BusinessGrid
                    businesses={businesses}
                    loading={loading}
                    onLead={setLeadBusiness}
                    viewMode="grid"
                    tracking={listingTracking}
                  />
                  <ListingsPagination page={page} totalPages={totalPages} onPageChange={goToPage} />
                </>

              ) : (
                <>
                  <ListingsBusinessList
                    businesses={businesses}
                    loading={loading}
                    onLead={setLeadBusiness}
                    tracking={listingTracking}
                  />
                  <ListingsPagination page={page} totalPages={totalPages} onPageChange={goToPage} />
                </>
              )}
            </div>
          </div>

          {/* Mobile category / city links */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:hidden">
            <Link
              href="/categories"
              className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#FF6C00] shadow-sm transition-colors hover:border-[#FF6C00]/40 hover:bg-[#F0F0F0]"
            >
              Browse All Categories
            </Link>
            <Link
              href="/browse"
              className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#FF6C00] shadow-sm transition-colors hover:border-[#FF6C00]/40 hover:bg-[#F0F0F0]"
            >
              Browse by City
            </Link>
          </div>
        </div>
      </div>

      {(effectiveCity || activeCategorySlug) && (
        <>
          <ListingsCategoryFaq categoryLabel={resolvedCategoryLabel} cityLabel={effectiveCity || undefined} />
          <ListingsRelatedLinks
            categories={categories}
            currentCategoryId={categoryId || undefined}
            currentCategorySlug={pathCategorySlug || activeCategorySlug || undefined}
            currentCategoryName={resolvedCategoryLabel}
            currentCity={effectiveCity || undefined}
            topCities={topCities}
          />
        </>
      )}

      <ListingsTrustSection />
      <LeadModal business={leadBusiness} open={!!leadBusiness} onClose={() => setLeadBusiness(null)} />
    </>
  );
}
