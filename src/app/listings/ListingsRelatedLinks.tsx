"use client";

import Link from "next/link";
import { MapPin, Tag } from "lucide-react";
import { buildListingsUrl, categoryToSlug } from "@/lib/listings-url";
import type { Category } from "@/types";
import type { PlatformStats } from "@/lib/platform-stats";

/** "Related Categories" / "Nearby Cities" interlinking block, shown at the
 *  bottom of filtered listing pages so crawlers and users can hop to
 *  adjacent category/city pages that don't otherwise appear in the results. */
export function ListingsRelatedLinks({
  categories = [],
  currentCategoryId,
  currentCategorySlug,
  currentCategoryName,
  currentCity,
  topCities = [],
}: {
  categories?: Category[];
  currentCategoryId?: string;
  currentCategorySlug?: string;
  currentCategoryName?: string;
  currentCity?: string;
  topCities?: PlatformStats["topCities"];
}) {
  const relatedCategories = categories
    .filter((c) => c._id !== currentCategoryId)
    .slice(0, 6);

  const resolvedCategoryName =
    currentCategoryName ||
    categories.find((c) => c._id === currentCategoryId || categoryToSlug(c) === currentCategorySlug)?.name;

  const nearbyCities = (topCities || [])
    .filter((c) => c.city.toLowerCase() !== (currentCity || "").toLowerCase())
    .slice(0, 6);

  if (!relatedCategories.length && !nearbyCities.length) return null;

  return (
    <div className="mx-auto mt-8 max-w-8xl space-y-5 px-3 sm:px-4">
      {relatedCategories.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <Tag className="h-3.5 w-3.5 text-[#FF6C00]" aria-hidden />
            You may also be interested in
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedCategories.map((cat) => (
              <Link
                key={cat._id}
                href={
                  currentCity
                    ? buildListingsUrl({ city: currentCity, categorySlug: categoryToSlug(cat) })
                    : buildListingsUrl({ categorySlug: categoryToSlug(cat) })
                }
                className="rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-sm text-neutral-700 transition-colors hover:border-[#FF6C00]/40 hover:bg-[#FFF3E8] hover:text-[#FF6C00]"
              >
                {cat.name}
                {currentCity ? ` in ${currentCity}` : ""}
              </Link>
            ))}
          </div>
        </div>
      )}

      {nearbyCities.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <MapPin className="h-3.5 w-3.5 text-[#FF6C00]" aria-hidden />
            {resolvedCategoryName ? `Find ${resolvedCategoryName} in nearby cities` : "Nearby cities"}
          </p>
          <div className="flex flex-wrap gap-2">
            {nearbyCities.map((c) => (
              <Link
                key={c.slug}
                href={
                  currentCategorySlug
                    ? buildListingsUrl({ city: c.city, categorySlug: currentCategorySlug })
                    : buildListingsUrl({ city: c.city })
                }
                className="rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-sm text-neutral-700 transition-colors hover:border-[#FF6C00]/40 hover:bg-[#FFF3E8] hover:text-[#FF6C00]"
              >
                {resolvedCategoryName || "Suppliers"} in {c.city}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
