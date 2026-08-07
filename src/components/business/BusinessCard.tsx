"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  MessageCircle,
  Package,
  Star,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBusinessWhatsAppPhone, formatPhone, truncate, getBusinessHeroImageUrl } from "@/lib/utils";
import { formatDistanceKm } from "@/lib/geo";
import { WhatsAppButton, WhatsAppIconLink } from "@/components/business/WhatsAppButton";
import { TrackedCallLink } from "@/components/business/TrackedCallLink";
import { TrackedProfileLink } from "@/components/business/TrackedProfileLink";
import { SaveBusinessButton } from "@/components/business/SaveBusinessButton";
import { CompareBusinessButton } from "@/components/business/CompareBusinessButton";
import { OpenNowBadge } from "@/components/business/OpenNowBadge";
import { VerifiedBadge } from "@/components/business/VerifiedBadge";
import type { Business } from "@/types";
import type { TrackingContext } from "@/lib/analytics/track";
import { useBusinessImpression } from "@/hooks/useBusinessImpression";

const PROVIDER_LABELS: Record<string, { label: string; icon: typeof Wrench }> = {
  services: { label: "Service", icon: Wrench },
  products: { label: "Product", icon: Package },
  services_and_products: { label: "Service + Product", icon: Building2 },
};

const ROLE_LABELS: Record<string, string> = {
  local_service: "Local Service",
  b2b_supplier: "Supplier",
  manufacturer: "Manufacturer",
  wholesaler: "Wholesaler",
  distributor: "Distributor",
};

interface BusinessCardProps {
  business: Business;
  onLead?: (business: Business) => void;
  compact?: boolean;
  tracking?: TrackingContext;
  rankPosition?: number;
}

export function BusinessCard({ business, onLead, compact, tracking, rankPosition }: BusinessCardProps) {
  const rating = business.averageRating ?? business.rating ?? 0;
  const image = getBusinessHeroImageUrl(business);
  const phone = business.mobile || business.phone;
  const whatsappPhone = getBusinessWhatsAppPhone(business);
  const provider = business.sellerIntent ? PROVIDER_LABELS[business.sellerIntent] : null;
  const roleLabel = business.marketplaceType ? ROLE_LABELS[business.marketplaceType] : null;
  const categoryName =
    typeof business.primaryCategory === "object" && business.primaryCategory?.name
      ? business.primaryCategory.name
      : null;
  const catalogCount = (business.services || business.catalog || []).length;
  const businessId = String(business._id);
  const impressionRef = useBusinessImpression(businessId, tracking, rankPosition);

  return (
    <article
      ref={impressionRef}
      className="ec-list-row group relative overflow-hidden transition duration-200 hover:-translate-y-0.5"
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-[#ff6c00] opacity-0 transition group-hover:opacity-100" />

      <TrackedProfileLink
        businessId={businessId}
        href={`/business/${business._id}`}
        tracking={tracking}
        className="block"
      >
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <Image
            src={image}
            alt={business.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute right-3 top-3 z-10 flex gap-2">
            <CompareBusinessButton businessId={String(business._id)} />
            <SaveBusinessButton businessId={String(business._id)} />
          </div>
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <VerifiedBadge
              isVerified={business.isVerified}
              verificationLevel={business.verificationLevel}
            />
            {business.isFeatured && <Badge variant="premium">Featured</Badge>}
            {provider && (
              <Badge variant="outline" className="border-white/40 bg-white/90 text-slate-700">
                <provider.icon className="mr-1 h-3 w-3" />
                {provider.label}
              </Badge>
            )}
          </div>
          {categoryName && (
            <span className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {categoryName}
            </span>
          )}
        </div>
      </TrackedProfileLink>

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <TrackedProfileLink businessId={businessId} href={`/business/${business._id}`} tracking={tracking}>
              <h3 className="truncate text-lg font-bold text-[#37474f] group-hover:text-[#111]">
                {business.name}
              </h3>
            </TrackedProfileLink>
            {roleLabel && business.sellerIntent === "products" && (
              <p className="mt-0.5 text-xs font-medium text-amber-700">{roleLabel}</p>
            )}
            <div className="mt-1">
              <OpenNowBadge business={business} />
            </div>
            {catalogCount > 0 && (
              <p className="mt-0.5 text-xs text-violet-600">{catalogCount} catalogue items</p>
            )}
          </div>
          {rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {!compact && business.shortDescription && (
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            {truncate(business.shortDescription, 100)}
          </p>
        )}

        {(business.area || business.city || business.distanceKm != null) && (
          <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-[#ff6c00]" />
              {[business.area, business.city].filter(Boolean).join(", ") || "Nearby"}
            </span>
            {business.distanceKm != null && (
              <span className="rounded-full bg-[#e8e8e8] px-2 py-0.5 text-xs font-semibold text-[#111]">
                {formatDistanceKm(business.distanceKm)}
              </span>
            )}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {phone ? (
            <TrackedCallLink
              businessId={businessId}
              phone={phone}
              source={tracking?.source || "listing"}
              city={tracking?.city || business.city}
              size="sm"
              variant="call"
              className="col-span-2"
            />
          ) : (
            <TrackedProfileLink businessId={businessId} href={`/business/${business._id}`} tracking={tracking} className="col-span-2">
              <Button size="sm" variant="call" className="w-full">View Profile</Button>
            </TrackedProfileLink>
          )}
          <div className="col-span-1 flex gap-1">
            <Button size="sm" variant="outline" className="flex-1 px-2" onClick={() => onLead?.(business)}>
              <MessageCircle className="h-4 w-4" />
            </Button>
            {whatsappPhone && (
              <WhatsAppIconLink
                phone={whatsappPhone}
                businessName={business.name}
                businessId={businessId}
                source={tracking?.source || "listing"}
                city={tracking?.city || business.city}
              />
            )}
          </div>
        </div>
        {phone && (
          <p className="mt-2 text-center text-xs text-slate-400">{formatPhone(phone)}</p>
        )}
      </div>
    </article>
  );
}

export function BusinessListRow({
  business,
  onLead,
  tracking,
  rankPosition,
}: {
  business: Business;
  onLead?: (b: Business) => void;
  tracking?: TrackingContext;
  rankPosition?: number;
}) {
  const rating = business.averageRating ?? business.rating ?? 0;
  const phone = business.mobile || business.phone;
  const whatsappPhone = getBusinessWhatsAppPhone(business);
  const categoryName =
    typeof business.primaryCategory === "object" && business.primaryCategory?.name
      ? business.primaryCategory.name
      : null;
  const roleLabel = business.marketplaceType
    ? ROLE_LABELS[business.marketplaceType]
    : null;
  const businessId = String(business._id);
  const impressionRef = useBusinessImpression(businessId, tracking, rankPosition);

  return (
    <article
      ref={impressionRef}
      className="ec-list-row group flex flex-col gap-4 p-4 transition sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <TrackedProfileLink
            businessId={businessId}
            href={`/business/${business._id}`}
            tracking={tracking}
            className="text-lg font-bold text-[#37474f] hover:text-[#111]"
          >
            {business.name}
          </TrackedProfileLink>
          <VerifiedBadge
            isVerified={business.isVerified}
            verificationLevel={business.verificationLevel}
          />
          {business.isFeatured && <Badge variant="premium">Featured</Badge>}
          {roleLabel && (
            <Badge variant="outline" className="text-xs">
              {roleLabel}
            </Badge>
          )}
        </div>
        {categoryName && <p className="mt-0.5 text-xs font-medium text-[#ff6c00]">{categoryName}</p>}
        {business.shortDescription && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
            {truncate(business.shortDescription, 140)}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          {(business.area || business.city || business.distanceKm != null) && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#ff6c00]" />
              {[business.area, business.city].filter(Boolean).join(", ") || "Nearby"}
              {business.distanceKm != null && (
                <span className="ml-1 rounded-full bg-[#e8e8e8] px-2 py-0.5 text-xs font-semibold text-[#111]">
                  {formatDistanceKm(business.distanceKm)}
                </span>
              )}
            </span>
          )}
          {rating > 0 && (
            <span className="flex items-center gap-1 font-medium text-amber-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
          )}
          {phone && <span>{formatPhone(phone)}</span>}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:w-36">
        {phone ? (
          <TrackedCallLink
            businessId={businessId}
            phone={phone}
            source={tracking?.source || "listing"}
            city={tracking?.city || business.city}
            size="sm"
            variant="call"
            className="flex-1 sm:w-full"
          />
        ) : (
          <TrackedProfileLink businessId={businessId} href={`/business/${business._id}`} tracking={tracking} className="flex-1 sm:w-full">
            <Button size="sm" variant="outline" className="w-full">View</Button>
          </TrackedProfileLink>
        )}
        <Button size="sm" variant="outline" className="flex-1 sm:w-full" onClick={() => onLead?.(business)}>
          <MessageCircle className="h-4 w-4" /> Quote
        </Button>
        {whatsappPhone && (
          <WhatsAppButton
            phone={whatsappPhone}
            businessName={business.name}
            businessId={businessId}
            source={tracking?.source || "listing"}
            city={tracking?.city || business.city}
            size="sm"
            fullWidth
          />
        )}
      </div>
    </article>
  );
}

export function BusinessGrid({
  businesses,
  loading,
  onLead,
  viewMode = "grid",
  tracking,
  rankOffset = 0,
}: {
  businesses: Business[];
  loading?: boolean;
  onLead?: (b: Business) => void;
  viewMode?: "grid" | "list";
  tracking?: TrackingContext;
  rankOffset?: number;
}) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[420px] animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (!businesses.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center shadow-inner">
        <Building2 className="mx-auto mb-4 h-14 w-14 text-slate-300" />
        <p className="text-lg font-semibold text-slate-700">No businesses found yet</p>
        <p className="mt-2 text-sm text-slate-500">Be the first to list your business!</p>
        <Button href="/register-business" className="mt-6">
          Register Free
        </Button>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {businesses.map((b, index) => (
          <BusinessListRow
            key={b._id}
            business={b}
            onLead={onLead}
            tracking={tracking}
            rankPosition={rankOffset + index + 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {businesses.map((b, index) => (
        <BusinessCard
          key={b._id}
          business={b}
          onLead={onLead}
          tracking={tracking}
          rankPosition={rankOffset + index + 1}
        />
      ))}
    </div>
  );
}
