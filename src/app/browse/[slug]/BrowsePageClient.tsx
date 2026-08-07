"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Home,
  LayoutGrid,
  List,
  LocateFixed,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { BusinessGrid } from "@/components/business/BusinessCard";
import { LeadModal } from "@/components/business/LeadModal";
import { SeoLandingActions } from "@/components/seo/SeoLandingActions";
import { Button } from "@/components/ui/button";
import { extractBusinessList, searchBusinesses } from "@/lib/api/business";
import { titleCase } from "@/lib/browse-slug";
import { buildListingsUrl } from "@/lib/listings-url";
import type { Business } from "@/types";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function getKeywordIcon(keyword: string): string {
  const lower = keyword.toLowerCase();
  const map: [string, string][] = [
    ["manufacturer", "🏭"],
    ["supplier", "📦"],
    ["wholesaler", "🏪"],
    ["hotel", "🏨"],
    ["doctor", "🩺"],
    ["packer", "🚛"],
    ["logistics", "🚚"],
    ["real estate", "🏠"],
    ["exporter", "✈️"],
    ["importer", "🌐"],
    ["distributor", "🔄"],
    ["dealer", "🤝"],
    ["consultant", "💼"],
    ["contractor", "🔧"],
  ];
  for (const [key, icon] of map) {
    if (lower.includes(key)) return icon;
  }
  return "🏢";
}

/* ─── skeleton ─────────────────────────────────────────────────────────────── */

function BusinessCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 rounded-xl bg-neutral-100" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/5 rounded bg-neutral-100" />
          <div className="h-3 w-2/5 rounded bg-neutral-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-neutral-100" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 flex-1 rounded-lg bg-neutral-100" />
        <div className="h-8 flex-1 rounded-lg bg-neutral-100" />
      </div>
    </div>
  );
}

/* ─── sub-category chip suggestions ───────────────────────────────────────── */

const SUB_CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  manufacturers: [
    "Steel Manufacturers",
    "Plastic Manufacturers",
    "Textile Manufacturers",
    "Chemical Manufacturers",
    "Food Manufacturers",
    "Furniture Manufacturers",
  ],
  suppliers: [
    "Raw Material Suppliers",
    "Industrial Suppliers",
    "Agricultural Suppliers",
    "Electronics Suppliers",
    "Building Material Suppliers",
  ],
  wholesalers: [
    "Clothing Wholesalers",
    "Electronics Wholesalers",
    "Food Wholesalers",
    "Pharmaceutical Wholesalers",
  ],
  hotels: ["Budget Hotels", "Luxury Hotels", "Business Hotels", "Resorts"],
  doctors: [
    "General Physicians",
    "Dentists",
    "Orthopedic Doctors",
    "Cardiologists",
    "Gynecologists",
  ],
};

function getSubCategories(keyword: string): string[] {
  const lower = keyword.toLowerCase();
  for (const [key, subs] of Object.entries(SUB_CATEGORY_SUGGESTIONS)) {
    if (lower.includes(key)) return subs;
  }
  return [];
}

/* ─── main component ───────────────────────────────────────────────────────── */

export function BrowsePageClient({
  keyword,
  city,
  pageTitle,
  pageDescription,
  supportPhone,
  initialBusinesses = [],
  serverPrefetched = false,
}: {
  keyword: string;
  city: string;
  pageTitle?: string;
  pageDescription?: string;
  supportPhone?: string;
  initialBusinesses?: Business[];
  serverPrefetched?: boolean;
}) {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [loading, setLoading] = useState(!serverPrefetched);
  const [error, setError] = useState(false);
  const [leadBusiness, setLeadBusiness] = useState<Business | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await searchBusinesses({
        keyword: keyword || undefined,
        city: city || undefined,
        sort: "priority",
        limit: 24,
        page: 1,
      });
      setBusinesses(extractBusinessList(res.data));
    } catch {
      setError(true);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, city]);

  useEffect(() => {
    if (serverPrefetched && initialBusinesses.length) return;
    fetchListings();
  }, [fetchListings, serverPrefetched, initialBusinesses.length]);

  const title =
    pageTitle ||
    (city
      ? `${titleCase(keyword)} in ${titleCase(city)}`
      : titleCase(keyword));

  const keywordTitle = titleCase(keyword);
  const cityTitle = city ? titleCase(city) : "";
  const icon = getKeywordIcon(keyword);
  const subCategories = getSubCategories(keyword);

  return (
    <>
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-neutral-100 bg-white"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-[#FF6C00]"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 text-neutral-300" />
          <Link
            href="/browse"
            className="text-xs text-neutral-500 transition-colors hover:text-[#FF6C00]"
          >
            Browse
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 text-neutral-300" />
          <span className="truncate text-xs font-semibold text-neutral-900">
            {title}
          </span>
        </div>
      </nav>

      {/* ── Hero section ───────────────────────────────────────────────────── */}
      <section className="border-b border-neutral-100 bg-gradient-to-b from-[#F0F0F0] to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Icon bubble */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#E5E5E5] bg-white text-3xl shadow-sm sm:h-20 sm:w-20 sm:text-4xl">
              {icon}
            </div>

            {/* Text content */}
            <div className="flex-1">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#FF6C00]">
                Verified suppliers &amp; local businesses
              </p>
              <h1 className="text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl lg:text-4xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
                {pageDescription ||
                  `Compare verified ${keywordTitle} in ${cityTitle || "India"}. Get best quotes, send inquiries, and connect with trusted suppliers instantly.`}
              </p>

              {/* Stat chips */}
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm">
                  <Building2 className="h-3.5 w-3.5 text-[#FF6C00]" />
                  {loading ? (
                    <span className="inline-block h-3 w-12 animate-pulse rounded bg-neutral-100" />
                  ) : (
                    `${businesses.length}+ Verified Businesses`
                  )}
                </div>
                {cityTitle && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm">
                    <MapPin className="h-3.5 w-3.5 text-[#FF6C00]" />
                    {cityTitle}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA action bar */}
          <div className="mt-6 border-t border-[#E5E5E5] pt-6">
            <SeoLandingActions
              keyword={keyword}
              city={city}
              supportPhone={supportPhone}
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-neutral-300 text-neutral-700 hover:border-[#FF6C00] hover:text-[#FF6C00]"
                onClick={() =>
                  router.push(
                    buildListingsUrl({ keyword, nearMe: true, viewMode: "map" })
                  )
                }
              >
                <LocateFixed className="h-4 w-4" />
                Near Me Map
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-neutral-300 text-neutral-700 hover:border-[#FF6C00] hover:text-[#FF6C00]"
                onClick={() => router.push(buildListingsUrl({ keyword, city }))}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sub-category chips ─────────────────────────────────────────────── */}
      {subCategories.length > 0 && (
        <section className="border-b border-neutral-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Related
              </span>
              {subCategories.map((sub) => (
                <Link
                  key={sub}
                  href={`/browse/${sub.toLowerCase().replace(/\s+/g, "-")}${city ? `-in-${city.toLowerCase().replace(/\s+/g, "-")}` : ""}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-all duration-150 hover:border-[#FF6C00]/30 hover:bg-[#F0F0F0] hover:text-[#FF6C00]"
                >
                  {sub}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="bg-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {loading ? (
                  <span className="inline-block h-4 w-40 animate-pulse rounded bg-neutral-200" />
                ) : error ? (
                  "Could not load listings"
                ) : (
                  `${businesses.length} verified business${businesses.length !== 1 ? "es" : ""} found`
                )}
              </p>
              {!loading && !error && businesses.length > 0 && (
                <p className="mt-0.5 text-xs text-neutral-500">
                  Sorted by priority · Verified suppliers only
                </p>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-[#FF6C00] text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#FF6C00] text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Skeleton loading */}
          {loading && (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-4"
              }
            >
              {Array.from({ length: 6 }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <BusinessCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="rounded-xl border border-dashed border-[#D4D4D4] bg-[#F0F0F0] px-6 py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E5E5]">
                <RefreshCw className="h-5 w-5 text-[#FF6C00]" />
              </div>
              <p className="font-semibold text-neutral-900">
                Could not load listings
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                There was a problem fetching results. Please try again.
              </p>
              <button
                type="button"
                onClick={fetchListings}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#FF6C00] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E86200] active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Business grid */}
          {!loading && !error && (
            <BusinessGrid
              businesses={businesses}
              loading={false}
              onLead={setLeadBusiness}
              viewMode={viewMode}
              tracking={{
                source: "seo_landing",
                keyword: keyword || undefined,
                city: city || undefined,
              }}
            />
          )}

          {/* Empty state */}
          {!loading && !error && businesses.length === 0 && (
            <div className="mt-2 rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F0F0] text-3xl">
                {icon}
              </div>
              <p className="text-base font-bold text-neutral-900">
                No verified listings yet in this category
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600">
                Post your buying requirement and suppliers will respond with
                competitive quotes.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/post-requirement?product=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FF6C00] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E86200] active:scale-[0.98]"
                >
                  Post Buying Requirement
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-neutral-300 text-neutral-700 hover:border-[#FF6C00] hover:text-[#FF6C00]"
                  onClick={() =>
                    router.push(buildListingsUrl({ keyword, city }))
                  }
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Explore All Listings
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <LeadModal
        business={leadBusiness}
        open={!!leadBusiness}
        onClose={() => setLeadBusiness(null)}
      />
    </>
  );
}
