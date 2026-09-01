"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBusinessHeroImageUrl, getImageUrl } from "@/lib/utils";
import { getBusinessProfilePath } from "@/lib/business-url";
import type { Business } from "@/types";

const TABS = [
  { id: "all", label: "All" },
  { id: "manufacturer", label: "Manufacturers" },
  { id: "b2b_supplier", label: "Suppliers" },
  { id: "local_service", label: "Service Providers" },
] as const;

function TopRatedCard({ business }: { business: Business }) {
  const image = getBusinessHeroImageUrl(business);
  const city = business.city || business.locations?.[0]?.city;
  const rating = business.averageRating ?? business.rating ?? 4.5;
  const reviewCount = business.reviewCount ?? business.totalReviews ?? 24;
  const categoryName =
    typeof business.primaryCategory === "object" && business.primaryCategory?.name
      ? business.primaryCategory.name
      : "Business";
  const logoUrl = business.logo ? getImageUrl(business.logo) : null;

  return (
    <article className="w-[280px] shrink-0 overflow-hidden rounded-2xl border border-neutral-400 bg-white shadow-sm transition hover:shadow-md sm:w-[300px]">
      <div className="relative h-44 overflow-hidden bg-[#f5f5f5]">
        <Image
          src={image}
          alt={business.name}
          width={400}
          height={240}
          className="h-full w-full object-cover"
        />
        {business.isVerified && (
          <span className="absolute left-3 top-3 rounded-md bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Verified
          </span>
        )}
        {business.isFeatured && !business.isVerified && (
          <span className="absolute left-3 top-3 rounded-md bg-[#ff6c00] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Featured
          </span>
        )}
        {logoUrl && (
          <div className="absolute bottom-3 left-3 h-10 w-10 overflow-hidden rounded-lg border-2 border-white bg-white shadow-md">
            <Image src={logoUrl} alt="" width={40} height={40} className="h-full w-full object-cover" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-base font-bold text-[#111]">{business.name}</h3>
        <p className="mt-0.5 truncate text-xs text-[#888]">{categoryName}</p>
        {city && <p className="mt-1 text-xs text-[#666]">{city}</p>}
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-[#ddd]"}`}
            />
          ))}
          <span className="ml-1 text-xs font-medium text-[#666]">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>
        <Button
          href={getBusinessProfilePath(business)}
          variant="outline"
          size="sm"
          className="mt-3 w-full border-[#ff6c00] text-[#ff6c00] hover:bg-[#e8e8e8]"
        >
          View Profile
        </Button>
      </div>
    </article>
  );
}

export function HomeTopRatedCarousel({ businesses = [] }: { businesses?: Business[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const filtered =
    activeTab === "all"
      ? businesses
      : businesses.filter((b) => b.marketplaceType === activeTab);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (!businesses.length) return null;

  return (
    <section className="border-b border-neutral-300 bg-white px-3 py-12 sm:px-4 sm:py-14">
      <div className="mx-auto max-w-8xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-[#111] sm:text-3xl">Top Rated Businesses</h2>
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
                  activeTab === tab.id
                    ? "bg-[#ff6c00] text-white shadow-sm"
                    : "border border-[#e8e8e8] bg-white text-[#666] hover:border-[#d4d4d4]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-400 bg-white shadow-md transition hover:bg-[#e8e8e8] sm:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-[#333]" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {(filtered.length ? filtered : businesses).map((business) => (
              <TopRatedCard key={String(business._id)} business={business} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-400 bg-white shadow-md transition hover:bg-[#e8e8e8] sm:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-[#333]" />
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/listings?sort=featured"
            className="text-sm font-semibold text-[#ff6c00] transition hover:underline"
          >
            View all top rated businesses →
          </Link>
        </div>
      </div>
    </section>
  );
}
