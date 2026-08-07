"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Building2, Calendar, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SaveBusinessButton } from "@/components/business/SaveBusinessButton";
import { TrackedCallLink } from "@/components/business/TrackedCallLink";
import { TrackedProfileLink } from "@/components/business/TrackedProfileLink";
import { WhatsAppButton } from "@/components/business/WhatsAppButton";
import { VerifiedBadge } from "@/components/business/VerifiedBadge";
import { useBusinessImpression } from "@/hooks/useBusinessImpression";
import { useAuth } from "@/context/AuthContext";
import { createLead } from "@/lib/api/lead";
import { trackLeadSubmit } from "@/lib/analytics/track";
import { fetchBusinessPreviewItems, type BusinessPreviewItem } from "@/lib/api/products";
import {
  getBusinessHeroImageUrl,
  getBusinessWhatsAppPhone,
  getImageUrl,
  truncate,
} from "@/lib/utils";
import { getBusinessProfilePath } from "@/lib/business-url";
import type { TrackingContext } from "@/lib/analytics/track";
import type { Business } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  local_service: "Local Service",
  b2b_supplier: "Supplier",
  manufacturer: "Manufacturer",
  wholesaler: "Wholesaler",
  distributor: "Distributor",
};

function formatResponseTime(hours?: number | null) {
  if (hours == null || hours <= 0) return null;
  if (hours < 1) return "Responds within an hour";
  if (hours <= 24) return `Responds in ~${Math.round(hours)}h`;
  return `Responds in ~${Math.round(hours / 24)}d`;
}

function yearsInBusiness(business: Business) {
  const year =
    (business as Business & { establishmentYear?: number | string }).establishmentYear ||
    (business.createdAt ? new Date(business.createdAt).getFullYear() : null);
  if (!year) return null;
  const y = Number(year);
  if (Number.isNaN(y) || y > new Date().getFullYear()) return null;
  const diff = new Date().getFullYear() - y;
  return diff > 0 ? `${diff}+ yrs` : "New";
}

/** IndiaMart-style inline "Send Enquiry" box — expands on the card itself
 * instead of a modal, reusing the same createLead() call LeadModal makes. */
function InlineEnquiryBox({ business }: { business: Business }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await createLead({
        businessId: business._id,
        customerName: name,
        phone: mobile,
        message,
        type: "quote_request",
      });
      if (res.success) {
        trackLeadSubmit(String(business._id), { source: "listing", city: business.city, leadType: "quote_request" });
        setSuccess(true);
      } else {
        setError(res.message || "Failed to submit inquiry");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to submit inquiry");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        ✓ Enquiry sent — {business.name} will contact you on {mobile} shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-xl border border-neutral-300 bg-[#fafafa] p-3">
      <div className="grid grid-cols-2 gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="h-9 bg-white text-sm" />
        <Input
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="Mobile number"
          required
          maxLength={10}
          className="h-9 bg-white text-sm"
        />
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder={`Describe what you need from ${business.name}...`}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#ff6c00]/10"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button type="submit" size="sm" className="w-full bg-[#ff6c00] hover:bg-[#e86200]" loading={loading}>
        Send Enquiry
      </Button>
    </form>
  );
}

export function ListingsBusinessRow({
  business,
  onLead,
  tracking,
  rankPosition,
  previewItems,
}: {
  business: Business;
  onLead?: (b: Business) => void;
  tracking?: TrackingContext;
  rankPosition?: number;
  previewItems?: BusinessPreviewItem[];
}) {
  const rating = business.averageRating ?? business.rating ?? 0;
  const reviewCount = business.reviewCount ?? 0;
  const phone = business.mobile || business.phone;
  const whatsappPhone = getBusinessWhatsAppPhone(business);
  const image = getBusinessHeroImageUrl(business);
  const logoUrl = business.logo ? getImageUrl(business.logo) : null;
  const categoryName =
    typeof business.primaryCategory === "object" && business.primaryCategory?.name
      ? business.primaryCategory.name
      : null;
  const roleLabel = business.marketplaceType ? ROLE_LABELS[business.marketplaceType] : null;
  const businessId = String(business._id);
  const impressionRef = useBusinessImpression(businessId, tracking, rankPosition);
  const years = yearsInBusiness(business);
  const responseTimeLabel = formatResponseTime(business.avgResponseHours);
  const city = business.city || business.locations?.[0]?.city;

  const tags = [roleLabel, business.isVerified && "ISO Certified"].filter(Boolean) as string[];
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  return (
    <article
      ref={impressionRef}
      className="relative rounded-2xl border border-neutral-400 bg-white p-4 shadow-sm transition hover:border-[#d4d4d4] hover:shadow-md sm:p-5"
    >
      <div className="absolute right-4 top-4">
        <SaveBusinessButton businessId={businessId} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Logo */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-400 bg-[#fafafa] sm:h-24 sm:w-24">
          {logoUrl ? (
            <Image src={logoUrl} alt={business.name} width={96} height={96} className="h-full w-full object-cover" />
          ) : (
            <Image src={image} alt={business.name} width={96} height={96} className="h-full w-full object-cover" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 pr-8 sm:pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <TrackedProfileLink
              businessId={businessId}
              href={getBusinessProfilePath(business)}
              tracking={tracking}
              className="text-lg font-bold text-[#111] hover:text-[#ff6c00]"
            >
              {business.name}
            </TrackedProfileLink>
            <VerifiedBadge isVerified={business.isVerified} verificationLevel={business.verificationLevel} />
            {business.isFeatured && (
              <span className="rounded-md bg-[#ff6c00] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Featured
              </span>
            )}
            {["premium", "gold", "enterprise"].includes(business.subscriptionPlan || "") && (
              <span className="rounded-md bg-gradient-to-r from-[#E86200] to-[#FF6C00] px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                Premium
              </span>
            )}
          </div>

          {rating > 0 && (
            <div className="mt-1 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-[#ddd]"}`}
                />
              ))}
              <span className="ml-1 text-xs font-medium text-[#666]">
                {rating.toFixed(1)} ({reviewCount || "New"})
              </span>
            </div>
          )}

          {categoryName && (
            <p className="mt-1 text-sm font-semibold text-[#ff6c00]">{categoryName}</p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#888]">
            {city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#ff6c00]" aria-hidden />
                {city}
              </span>
            )}
            {years && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                {years} in business
              </span>
            )}
            {responseTimeLabel && (
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {responseTimeLabel}
              </span>
            )}
          </div>

          {business.shortDescription && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#666]">
              {truncate(business.shortDescription, 160)}
            </p>
          )}

          {(tags.length > 0 || (previewItems && previewItems.length > 0)) && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-neutral-400 bg-[#fafafa] px-2 py-0.5 text-[10px] font-medium text-[#666]"
                >
                  {tag}
                </span>
              ))}
              {previewItems?.map((item) => (
                <span
                  key={item.name}
                  className="rounded-md border border-[#ff6c00]/25 bg-[#fff5ee] px-2 py-0.5 text-[10px] font-medium text-[#c2410c]"
                >
                  {item.name}
                </span>
              ))}
            </div>
          )}

          {enquiryOpen && <InlineEnquiryBox business={business} />}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:w-36 sm:flex-col">
          <Button
            href={getBusinessProfilePath(business)}
            variant="outline"
            size="sm"
            className="flex-1 sm:w-full"
          >
            View Profile
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 bg-[#ff6c00] hover:bg-[#e86200] sm:w-full"
            onClick={() => setEnquiryOpen((v) => !v)}
          >
            {enquiryOpen ? "Close" : "Get Bulk Quotes"}
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
              className="flex-1 sm:w-full"
            />
          )}
          {phone ? (
            <TrackedCallLink
              businessId={businessId}
              phone={phone}
              source={tracking?.source || "listing"}
              city={tracking?.city || business.city}
              size="sm"
              variant="outline"
              className="flex-1 sm:w-full"
              showLabel
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ListingsBusinessList({
  businesses,
  loading,
  onLead,
  tracking,
}: {
  businesses: Business[];
  loading?: boolean;
  onLead?: (b: Business) => void;
  tracking?: TrackingContext;
}) {
  const [previewMap, setPreviewMap] = useState<Record<string, BusinessPreviewItem[]>>({});
  const businessIdsKey = businesses.map((b) => String(b._id)).join(",");

  useEffect(() => {
    if (!businessIdsKey) {
      setPreviewMap({});
      return;
    }
    let cancelled = false;
    fetchBusinessPreviewItems(businessIdsKey.split(",")).then((map) => {
      if (!cancelled) setPreviewMap(map);
    });
    return () => {
      cancelled = true;
    };
  }, [businessIdsKey]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-[#eee]" />
        ))}
      </div>
    );
  }

  if (!businesses.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#ddd] bg-white py-16 text-center">
        <Building2 className="mx-auto mb-3 h-12 w-12 text-[#ccc]" />
        <p className="font-semibold text-[#333]">No businesses found</p>
        <p className="mt-1 text-sm text-[#888]">Try adjusting your filters or search terms.</p>
        <Button href="/register-business" className="mt-4">
          List Your Business
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {businesses.map((b, index) => (
        <ListingsBusinessRow
          key={b._id}
          business={b}
          onLead={onLead}
          tracking={tracking}
          rankPosition={index + 1}
          previewItems={previewMap[String(b._id)]}
        />
      ))}
    </div>
  );
}
