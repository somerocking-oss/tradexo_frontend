"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBusinessHeroImageUrl, getImageUrl } from "@/lib/utils";
import { getBusinessProfilePath } from "@/lib/business-url";
import type { Business } from "@/types";

function CardSkeleton() {
  return (
    <div className="w-[260px] shrink-0 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white sm:w-[280px]">
      <div className="h-36 w-full animate-pulse bg-[#F5F5F5]" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#F5F5F5]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#F5F5F5]" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-[#F5F5F5]" />
        <div className="mt-3 h-8 w-full animate-pulse rounded-lg bg-[#F5F5F5]" />
      </div>
    </div>
  );
}

function ListingCard({ business }: { business: Business }) {
  const image = getBusinessHeroImageUrl(business);
  const city = business.city || business.locations?.[0]?.city;
  const rating = business.averageRating ?? business.rating ?? 0;
  const categoryName =
    typeof business.primaryCategory === "object" && business.primaryCategory?.name
      ? business.primaryCategory.name
      : "Business";
  const logoUrl = (business as Business & { logo?: string }).logo
    ? getImageUrl((business as Business & { logo?: string }).logo!)
    : null;

  return (
    <article className="group w-[260px] shrink-0 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#FF6C00]/20 hover:shadow-md sm:w-[280px]">
      {/* Card image area */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#F5F5F5]">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={business.name}
            width={120}
            height={120}
            className="max-h-20 w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <Image
            src={image}
            alt={business.name}
            width={280}
            height={160}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        )}

        {/* Gradient scrim on hover for top badges legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />

        {/* Verified badge */}
        {business.isVerified && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#16A34A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
            Verified
          </span>
        )}

        {/* Category pill */}
        <span className="absolute right-3 top-3 rounded-full bg-white/92 px-2.5 py-0.5 text-[10px] font-semibold text-[#525252] shadow-sm backdrop-blur-sm">
          {categoryName}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="truncate text-sm font-bold text-[#171717] group-hover:text-[#FF6C00] transition-colors duration-200">
          {business.name}
        </h3>

        {city && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-[#737373]">
            <MapPin className="h-3 w-3 shrink-0 text-[#A3A3A3]" aria-hidden />
            {city}
          </p>
        )}

        {rating > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-[#E5E5E5] text-[#E5E5E5]"
                  }`}
                  aria-hidden
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-[#525252]">{rating.toFixed(1)}</span>
          </div>
        )}

        <Button
          href={getBusinessProfilePath(business)}
          variant="outline"
          size="sm"
          className="mt-4 w-full rounded-lg border-[#D4D4D4] text-[#525252] transition-all duration-200 ease-out hover:border-[#FF6C00] hover:bg-[#F0F0F0] hover:text-[#FF6C00]"
        >
          View Profile
        </Button>
      </div>
    </article>
  );
}

export function HomeListingsCarousel({
  latest = [],
  featured = [],
}: {
  latest?: Business[];
  featured?: Business[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"latest" | "featured">("latest");
  const [activeIndex, setActiveIndex] = useState(0);

  const businesses = tab === "latest" ? latest : featured;
  const display = businesses.length ? businesses : latest.length ? latest : featured;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -296 : 296, behavior: "smooth" });
  };

  // Mobile-only scroll-progress dots: cards are 260px + 16px gap below `sm`.
  const MOBILE_CARD_STEP = 276;
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / MOBILE_CARD_STEP);
    setActiveIndex(Math.max(0, Math.min(idx, display.length - 1)));
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
    setActiveIndex(0);
  }, [tab]);

  return (
    <section className="border-b border-sky-200 bg-sky-50 px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="listings-heading">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#E86200]">
              Discover Suppliers
            </p>
            <h2
              id="listings-heading"
              className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl"
            >
              Business Listings
            </h2>
          </div>

          {/* Controls: animated tab bar + view all */}
          <div className="flex items-center gap-3">
            {/* Tab switcher with animated indicator */}
            <div
              className="relative flex items-center rounded-lg border border-sky-200 bg-white p-1"
              role="tablist"
              aria-label="Listing type"
            >
              {/* Sliding indicator */}
              <div
                className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-md bg-[#FF6C00] shadow-sm transition-transform duration-200 ease-out"
                style={{
                  transform: tab === "featured" ? "translateX(calc(100% + 0px))" : "translateX(0)",
                }}
                aria-hidden
              />
              <button
                type="button"
                role="tab"
                aria-selected={tab === "latest"}
                onClick={() => setTab("latest")}
                className={`relative z-10 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 sm:px-4 sm:text-sm ${
                  tab === "latest" ? "text-white" : "text-[#737373] hover:text-[#171717]"
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "featured"}
                onClick={() => setTab("featured")}
                className={`relative z-10 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 sm:px-4 sm:text-sm ${
                  tab === "featured" ? "text-white" : "text-[#737373] hover:text-[#171717]"
                }`}
              >
                Featured
              </button>
            </div>

            <Link
              href="/listings"
              className="group hidden items-center gap-1.5 rounded-lg border border-sky-300 px-4 py-2 text-sm font-semibold text-[#525252] transition-all duration-200 ease-out hover:border-[#FF6C00] hover:text-[#FF6C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30 sm:flex"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left scroll button */}
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E5E5] bg-white shadow-md transition-all duration-200 ease-out hover:border-[#FF6C00]/40 hover:text-[#FF6C00] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30 sm:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          {/* Scrollable track */}
          {display.length > 0 ? (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto pb-3 pt-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
            >
              {display.map((b) => (
                <div key={String(b._id)} style={{ scrollSnapAlign: "start" }}>
                  <ListingCard business={b} />
                </div>
              ))}
            </div>
          ) : (
            /* Skeleton loading state */
            <div className="flex gap-4 overflow-hidden pb-3 pt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Edge fade — hints there's more to swipe on mobile, where the
              prev/next arrow buttons above are hidden */}
          {display.length > 1 && (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-sky-50 to-transparent sm:hidden"
              aria-hidden
            />
          )}

          {/* Right scroll button */}
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E5E5] bg-white shadow-md transition-all duration-200 ease-out hover:border-[#FF6C00]/40 hover:text-[#FF6C00] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30 sm:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Scroll-progress dots — mobile only, mirrors the desktop arrows */}
        {display.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 sm:hidden" aria-hidden>
            {display.slice(0, 8).map((b, i) => (
              <span
                key={String(b._id)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-5 bg-[#FF6C00]" : "w-1.5 bg-[#D4D4D4]"
                }`}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {display.length === 0 && (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-sky-200 bg-white py-16 text-center">
            <p className="text-sm font-medium text-[#737373]">No listings available right now.</p>
            <Link
              href="/listings"
              className="mt-3 text-sm font-semibold text-[#FF6C00] hover:underline"
            >
              Browse all listings →
            </Link>
          </div>
        )}

        {/* Mobile view-all */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/listings"
            className="group flex items-center gap-1.5 rounded-lg border border-sky-300 px-4 py-2.5 text-sm font-semibold text-[#525252] transition-all duration-200 ease-out hover:border-[#FF6C00] hover:text-[#FF6C00]"
          >
            View All Listings
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
