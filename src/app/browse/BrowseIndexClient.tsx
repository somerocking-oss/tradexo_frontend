"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  MapPin,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { fetchSeoLandingPages } from "@/lib/api/seo-landing";
import { SEO_LANDING_CITIES } from "@/lib/seo-cities";
import { buildListingsCityPath } from "@/lib/listings-url";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const KEYWORD_ICONS: Record<string, string> = {
  manufacturers: "🏭",
  suppliers: "📦",
  wholesalers: "🏪",
  hotels: "🏨",
  doctors: "🩺",
  "packers and movers": "🚛",
  "logistics companies": "🚚",
  "real estate": "🏠",
  exporters: "✈️",
  importers: "🌐",
  distributors: "🔄",
  dealers: "🤝",
  consultants: "💼",
  contractors: "🔧",
  services: "⚙️",
};

function getKeywordIcon(keyword: string): string {
  const lower = keyword.toLowerCase();
  for (const [key, icon] of Object.entries(KEYWORD_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "🏢";
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-100 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-neutral-100" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-3/4 rounded bg-neutral-100" />
          <div className="h-3 w-1/2 rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

export function BrowseIndexClient() {
  const [links, setLinks] = useState<
    Array<{ city: string; keyword: string; href: string; label: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  useEffect(() => {
    fetchSeoLandingPages({ limit: 60 })
      .then(({ pages }) => {
        if (pages.length) {
          setLinks(
            pages.map((page) => ({
              city: page.city,
              keyword: page.keyword,
              label: page.title,
              href: page.path,
            }))
          );
        }
      })
      .catch(() => {
        setLinks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredLinks = useMemo(() => {
    let result = links;

    if (activeCity) {
      result = result.filter(
        (l) => l.city.toLowerCase() === activeCity.toLowerCase()
      );
    }

    if (activeLetter) {
      result = result.filter((l) =>
        l.keyword.toUpperCase().startsWith(activeLetter)
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.label.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.keyword.toLowerCase().includes(q)
      );
    }

    return result;
  }, [links, search, activeLetter, activeCity]);

  const availableLetters = useMemo(() => {
    const set = new Set(
      links.map((l) => l.keyword[0]?.toUpperCase()).filter(Boolean)
    );
    return ALPHABET.filter((l) => set.has(l));
  }, [links]);

  const popularCities = SEO_LANDING_CITIES.slice(0, 16);

  const hasFilters = !!(activeLetter || activeCity || search.trim());

  return (
    <div className="space-y-10">
      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories, cities, or keywords…"
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-10 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5 text-neutral-500">
          <TrendingUp className="h-4 w-4 text-[#FF6C00]" />
          <span>
            <strong className="font-semibold text-neutral-900">
              {links.length || "1,000+"}
            </strong>{" "}
            SEO landing pages
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-neutral-500">
          <MapPin className="h-4 w-4 text-[#FF6C00]" />
          <span>
            <strong className="font-semibold text-neutral-900">
              {SEO_LANDING_CITIES.length}
            </strong>{" "}
            Indian cities
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-neutral-500">
          <Building2 className="h-4 w-4 text-[#FF6C00]" />
          <span>
            <strong className="font-semibold text-neutral-900">
              Verified
            </strong>{" "}
            B2B suppliers &amp; services
          </span>
        </span>
      </div>

      {/* City filter chips */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            Filter by City
          </h2>
          {activeCity && (
            <button
              type="button"
              onClick={() => setActiveCity(null)}
              className="flex items-center gap-1 text-xs font-medium text-[#FF6C00] hover:text-[#E86200]"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {popularCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() =>
                setActiveCity(activeCity === city ? null : city)
              }
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                activeCity === city
                  ? "bg-[#FF6C00] text-white shadow-sm"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-[#FF6C00]/40 hover:bg-[#F0F0F0] hover:text-[#FF6C00]"
              }`}
            >
              <MapPin className="h-3 w-3" />
              {city}
            </button>
          ))}
        </div>
      </section>

      {/* A–Z letter jump navigation */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            Browse A–Z
          </h2>
          {activeLetter && (
            <button
              type="button"
              onClick={() => setActiveLetter(null)}
              className="flex items-center gap-1 text-xs font-medium text-[#FF6C00] hover:text-[#E86200]"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALPHABET.map((letter) => {
            const isAvailable = availableLetters.includes(letter);
            const isActive = activeLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                disabled={!isAvailable && !loading}
                onClick={() =>
                  isAvailable
                    ? setActiveLetter(isActive ? null : letter)
                    : undefined
                }
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? "bg-[#FF6C00] text-white shadow-sm"
                    : isAvailable
                      ? "border border-neutral-200 bg-white text-neutral-700 hover:border-[#FF6C00]/40 hover:bg-[#F0F0F0] hover:text-[#FF6C00]"
                      : "cursor-default border border-neutral-100 bg-neutral-50 text-neutral-300"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </section>

      {/* Results section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {activeCity
                ? `${activeCity} Listings`
                : activeLetter
                  ? `Category: ${activeLetter}…`
                  : search
                    ? "Search Results"
                    : "All Listings"}
            </h2>
            {!loading && (
              <p className="mt-0.5 text-sm text-neutral-500">
                {filteredLinks.length} listing
                {filteredLinks.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveLetter(null);
                setActiveCity(null);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <p className="font-semibold text-neutral-900">No listings found</p>
            <p className="mt-1 text-sm text-neutral-500">
              Try adjusting your search or filters.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveLetter(null);
                  setActiveCity(null);
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#FF6C00] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E86200] active:scale-[0.98]"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6C00]/20 hover:shadow-md"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0F0F0] text-lg transition-colors group-hover:bg-[#E5E5E5]">
                  {getKeywordIcon(link.keyword)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-neutral-900 group-hover:text-[#FF6C00] transition-colors">
                    {link.label}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {link.city}
                  </span>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-[#FF6C00]" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Cities directory */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-neutral-900">
            All Cities Directory
          </h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            {SEO_LANDING_CITIES.length} cities across India
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {SEO_LANDING_CITIES.map((city) => (
            <Link
              key={city}
              href={buildListingsCityPath(city)}
              className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-white px-3 py-2.5 text-left text-sm font-medium text-neutral-700 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#FF6C00]/20 hover:bg-[#F0F0F0] hover:text-[#FF6C00] hover:shadow-md"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#FF6C00]" />
              <span className="truncate">{city}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
