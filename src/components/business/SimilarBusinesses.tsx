"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/business/VerifiedBadge";
import { TrackedProfileLink } from "@/components/business/TrackedProfileLink";
import { SaveBusinessButton } from "@/components/business/SaveBusinessButton";
import { buildListingsCityPath } from "@/lib/listings-url";
import { getSimilarBusinesses } from "@/lib/api/business";
import { getBusinessHeroImageUrl, truncate } from "@/lib/utils";
import type { Business } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  local_service: "Local Service",
  b2b_supplier: "Supplier",
  manufacturer: "Manufacturer",
  wholesaler: "Wholesaler",
  distributor: "Distributor",
};

function SimilarCard({ business }: { business: Business }) {
  const heroUrl = getBusinessHeroImageUrl(business);
  const rating = business.averageRating ?? business.rating ?? 0;
  const categoryName =
    typeof business.primaryCategory === "object" && business.primaryCategory?.name
      ? business.primaryCategory.name
      : null;
  const roleLabel = business.marketplaceType ? ROLE_LABELS[business.marketplaceType] : null;
  const city = business.city || business.area;
  const businessId = String(business._id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff6c00]/30 hover:shadow-md">
      {/* Image area */}
      <TrackedProfileLink
        businessId={businessId}
        href={`/business/${businessId}`}
        tracking={{ source: "listing" }}
        className="relative block h-40 shrink-0 overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200"
      >
        <Image
          src={heroUrl}
          alt={business.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:640px) 50vw, 33vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <VerifiedBadge isVerified={business.isVerified} verificationLevel={business.verificationLevel} />
          {business.isFeatured && (
            <span className="rounded-md bg-[#ff6c00] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
              Featured
            </span>
          )}
        </div>

        {/* Save button */}
        <div className="absolute right-2.5 top-2.5">
          <SaveBusinessButton businessId={businessId} />
        </div>

        {/* Category bottom label */}
        {categoryName && (
          <span className="absolute bottom-2 left-2.5 rounded-lg bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {categoryName}
          </span>
        )}
      </TrackedProfileLink>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <TrackedProfileLink
            businessId={businessId}
            href={`/business/${businessId}`}
            tracking={{ source: "listing" }}
          >
            <h3 className="truncate text-sm font-bold text-neutral-800 transition-colors group-hover:text-[#ff6c00]">
              {business.name}
            </h3>
          </TrackedProfileLink>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {city && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <MapPin className="h-3 w-3 shrink-0 text-[#ff6c00]" />
                {city}
              </span>
            )}
            {roleLabel && (
              <span className="text-xs font-medium text-neutral-400">{roleLabel}</span>
            )}
          </div>

          {rating > 0 && (
            <div className="mt-1.5 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-amber-700">{rating.toFixed(1)}</span>
              {(business.reviewCount ?? 0) > 0 && (
                <span className="text-xs text-neutral-400">({business.reviewCount})</span>
              )}
            </div>
          )}

          {business.shortDescription && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
              {truncate(business.shortDescription, 80)}
            </p>
          )}
        </div>

        <Button
          href={`/business/${businessId}`}
          variant="outline"
          size="sm"
          className="mt-auto w-full border-[#ff6c00]/30 text-[#ff6c00] hover:bg-[#ff6c00] hover:text-white"
        >
          View Profile
        </Button>
      </div>
    </article>
  );
}

function SimilarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="h-40 animate-pulse bg-neutral-100" />
      <div className="space-y-2.5 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-3 w-1/2 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-lg bg-neutral-100" />
        <div className="mt-2 h-8 animate-pulse rounded-lg bg-neutral-100" />
      </div>
    </div>
  );
}

interface SimilarBusinessesProps {
  businessId: string;
  city?: string;
}

export function SimilarBusinesses({ businessId, city }: SimilarBusinessesProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSimilarBusinesses(businessId, 6)
      .then((res) => {
        if (res.success && res.data) {
          setBusinesses(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (!loading && businesses.length === 0) return null;

  return (
    <section className="mt-10 border-t border-neutral-200 pt-10">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Similar Suppliers{city ? ` in ${city}` : ""}
          </h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            Compare verified businesses in the same category
          </p>
        </div>
        {city && (
          <Button
            href={buildListingsCityPath(city)}
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SimilarCardSkeleton key={i} />)
          : businesses.slice(0, 6).map((b) => <SimilarCard key={b._id} business={b} />)}
      </div>
    </section>
  );
}
