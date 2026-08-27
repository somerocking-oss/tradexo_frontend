"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { getBusinessById } from "@/lib/api/business";
import { getBusinessHeroImageUrl, formatPhone } from "@/lib/utils";
import type { Business } from "@/types";
import { getBusinessProfilePath } from "@/lib/business-url";
import {
  X,
  MapPin,
  Phone,
  Globe,
  Star,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowRight,
  Building2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StarRating({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={[
            "h-3.5 w-3.5",
            i < full
              ? "fill-amber-400 text-amber-400"
              : half && i === full
              ? "fill-amber-200 text-amber-400"
              : "fill-neutral-200 text-neutral-200",
          ].join(" ")}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-neutral-700">
        {value.toFixed(1)}
      </span>
    </span>
  );
}

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
      <CheckCircle2 className="h-4 w-4" />
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm text-neutral-400">
      <XCircle className="h-4 w-4" />
      No
    </span>
  );
}

function CellValue({ label, business }: { label: string; business: Business }) {
  switch (label) {
    case "rating": {
      const r =
        business.averageRating ?? business.rating ?? 0;
      return r > 0 ? (
        <StarRating value={r} />
      ) : (
        <span className="text-sm text-neutral-400">No ratings yet</span>
      );
    }
    case "reviews": {
      const count =
        business.reviewCount ?? business.totalReviews ?? 0;
      return (
        <span className="text-sm font-medium text-neutral-700">
          {count.toLocaleString()} review{count !== 1 ? "s" : ""}
        </span>
      );
    }
    case "location": {
      const loc = [business.city, business.state].filter(Boolean).join(", ");
      return loc ? (
        <span className="inline-flex items-center gap-1 text-sm text-neutral-700">
          <MapPin className="h-3.5 w-3.5 text-[#FF6C00]" />
          {loc}
        </span>
      ) : (
        <span className="text-sm text-neutral-400">—</span>
      );
    }
    case "phone": {
      const phone = formatPhone(business.mobile ?? business.phone);
      return phone ? (
        <span className="inline-flex items-center gap-1 text-sm text-neutral-700">
          <Phone className="h-3.5 w-3.5 text-neutral-400" />
          {phone}
        </span>
      ) : (
        <span className="text-sm text-neutral-400">—</span>
      );
    }
    case "website":
      return business.website ? (
        <a
          href={
            business.website.startsWith("http")
              ? business.website
              : `https://${business.website}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#FF6C00] hover:text-[#E86200] transition-colors"
        >
          <Globe className="h-3.5 w-3.5" />
          Visit site
        </a>
      ) : (
        <span className="text-sm text-neutral-400">—</span>
      );
    case "verified":
      return <BoolCell value={!!business.isVerified} />;
    case "featured":
      return <BoolCell value={!!business.isFeatured} />;
    case "category": {
      const cat =
        typeof business.primaryCategory === "object"
          ? business.primaryCategory?.name
          : business.primaryCategory;
      return cat ? (
        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700">
          {cat}
        </span>
      ) : (
        <span className="text-sm text-neutral-400">—</span>
      );
    }
    case "moq": {
      const moq = business.supplyCapacity?.minimumOrderQuantity;
      const unit = business.supplyCapacity?.unit ?? "";
      return moq != null ? (
        <span className="text-sm font-medium text-neutral-700">
          {moq.toLocaleString()} {unit}
        </span>
      ) : (
        <span className="text-sm text-neutral-400">—</span>
      );
    }
    case "lead_time": {
      const days = business.supplyCapacity?.leadTimeDays;
      return days != null ? (
        <span className="text-sm font-medium text-neutral-700">
          {days} day{days !== 1 ? "s" : ""}
        </span>
      ) : (
        <span className="text-sm text-neutral-400">—</span>
      );
    }
    case "monthly_capacity": {
      const cap = business.supplyCapacity?.monthlyCapacity;
      const unit = business.supplyCapacity?.unit ?? "";
      return cap != null ? (
        <span className="text-sm font-medium text-neutral-700">
          {cap.toLocaleString()} {unit}
        </span>
      ) : (
        <span className="text-sm text-neutral-400">—</span>
      );
    }
    case "turnover": {
      const amt = business.annualTurnover;
      const currency = business.turnoverCurrency ?? "INR";
      const year = business.turnoverYear;
      if (!amt) return <span className="text-sm text-neutral-400">—</span>;
      const formatted =
        amt >= 10_000_000
          ? `${(amt / 10_000_000).toFixed(1)} Cr`
          : amt >= 100_000
          ? `${(amt / 100_000).toFixed(1)} L`
          : amt.toLocaleString();
      return (
        <span className="text-sm font-medium text-neutral-700">
          {currency} {formatted}
          {year ? ` (${year})` : ""}
        </span>
      );
    }
    case "profile_completion": {
      const pct = business.profileCompletionPercent ?? 0;
      return (
        <span className="flex items-center gap-2">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
            <span
              className="block h-full rounded-full bg-[#FF6C00]"
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="text-xs font-semibold text-neutral-700">
            {pct}%
          </span>
        </span>
      );
    }
    default:
      return <span className="text-sm text-neutral-400">—</span>;
  }
}

// ---------------------------------------------------------------------------
// Row definitions
// ---------------------------------------------------------------------------

interface CompareRow {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

const COMPARE_ROWS: CompareRow[] = [
  { key: "location", label: "Location", icon: <MapPin className="h-4 w-4" /> },
  { key: "category", label: "Category", icon: <Layers className="h-4 w-4" /> },
  { key: "rating", label: "Rating", icon: <Star className="h-4 w-4" /> },
  { key: "reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
  { key: "verified", label: "Verified", icon: <ShieldCheck className="h-4 w-4" /> },
  { key: "featured", label: "Featured", icon: <Sparkles className="h-4 w-4" /> },
  { key: "phone", label: "Phone", icon: <Phone className="h-4 w-4" /> },
  { key: "website", label: "Website", icon: <Globe className="h-4 w-4" /> },
  { key: "moq", label: "Min. Order Qty", icon: <Building2 className="h-4 w-4" /> },
  { key: "lead_time", label: "Lead Time", icon: <Building2 className="h-4 w-4" /> },
  { key: "monthly_capacity", label: "Monthly Capacity", icon: <Building2 className="h-4 w-4" /> },
  { key: "turnover", label: "Annual Turnover", icon: <Building2 className="h-4 w-4" /> },
  { key: "profile_completion", label: "Profile Completion", icon: <Building2 className="h-4 w-4" /> },
];

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
      <div className="h-36 bg-neutral-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded-md bg-neutral-100" />
        <div className="h-3 w-1/2 rounded-md bg-neutral-100" />
        <div className="h-3 w-2/3 rounded-md bg-neutral-100" />
      </div>
    </div>
  );
}

function SkeletonPage({ colCount }: { colCount: number }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* top bar skeleton */}
      <div className="mb-8 animate-pulse rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          {Array.from({ length: colCount }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-neutral-100" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-neutral-100" />
                <div className="h-2.5 w-16 rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* table skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: colCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F0F0F0]">
        <Layers className="h-10 w-10 text-[#FF6C00]" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-900">
        Compare Businesses
      </h1>
      <p className="mt-3 max-w-sm text-base text-neutral-600">
        Select 2–3 businesses from listings to see them side by side. Compare
        ratings, location, capacity and more.
      </p>
      <Link
        href="/listings"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#FF6C00] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E86200] active:scale-[0.98]"
      >
        Browse Listings
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-neutral-900">
        Failed to load comparison
      </h2>
      <p className="mt-2 text-sm text-neutral-600">
        Something went wrong while fetching business data. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00]"
      >
        Try again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Business card in top bar
// ---------------------------------------------------------------------------

function TopBarCard({
  business,
  onRemove,
}: {
  business: Business;
  onRemove: (id: string) => void;
}) {
  const heroSrc = getBusinessHeroImageUrl(business);
  return (
    <div className="group relative flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3 transition-all hover:border-[#FF6C00]/20 hover:shadow-sm">
      {/* thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={heroSrc}
          alt={business.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-900">
          {business.name}
        </p>
        {(business.city || business.state) && (
          <p className="truncate text-xs text-neutral-500">
            {[business.city, business.state].filter(Boolean).join(", ")}
          </p>
        )}
        {business.isVerified && (
          <span className="mt-0.5 inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        )}
      </div>
      {/* remove */}
      <button
        onClick={() => onRemove(business._id)}
        aria-label={`Remove ${business.name} from comparison`}
        className="ml-1 shrink-0 rounded-md p-1 text-neutral-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main compare content
// ---------------------------------------------------------------------------

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const ids = useMemo(
    () => idsParam.split(",").filter(Boolean).slice(0, 3),
    [idsParam]
  );

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!ids.length) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);

    Promise.all(
      ids.map(async (id) => {
        const res = await getBusinessById(id);
        return (res as { data?: Business })?.data || null;
      })
    )
      .then((results) =>
        setBusinesses(results.filter(Boolean) as Business[])
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [ids, fetchKey]);

  const handleRemove = useCallback(
    (id: string) => {
      const remaining = ids.filter((i) => i !== id);
      if (remaining.length === 0) {
        router.push("/compare");
      } else {
        router.push(`/compare?ids=${remaining.join(",")}`);
      }
    },
    [ids, router]
  );

  const handleRetry = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  // Empty state — no ids in URL
  if (!ids.length) {
    return <EmptyState />;
  }

  // Loading skeleton
  if (loading) {
    return <SkeletonPage colCount={ids.length} />;
  }

  // Error state
  if (error) {
    return <ErrorState onRetry={handleRetry} />;
  }

  // No results fetched despite having ids (all 404 etc.)
  if (!businesses.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-100">
          <Building2 className="h-10 w-10 text-neutral-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">
          Businesses not found
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          The selected businesses could not be loaded. They may have been
          removed or the links may be expired.
        </p>
        <Link
          href="/listings"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FF6C00] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E86200]"
        >
          Browse Listings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const colCount = businesses.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Compare Businesses
        </h1>
        <p className="mt-1.5 text-base text-neutral-600">
          Side-by-side view of{" "}
          <span className="font-semibold text-neutral-800">
            {colCount} supplier{colCount !== 1 ? "s" : ""}
          </span>
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Fixed top bar — compared businesses                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-8 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Comparing
          </span>
          {colCount < 3 && (
            <Link
              href="/listings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6C00] hover:text-[#E86200] transition-colors"
            >
              + Add another
            </Link>
          )}
        </div>
        <div
          className={[
            "grid gap-3",
            colCount === 1
              ? "grid-cols-1 sm:grid-cols-1"
              : colCount === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-3",
          ].join(" ")}
        >
          {businesses.map((b) => (
            <TopBarCard key={b._id} business={b} onRemove={handleRemove} />
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Comparison table (sticky first column)                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="overflow-x-auto rounded-xl border border-neutral-100 bg-white shadow-sm">
        <table className="min-w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-44 sm:w-52" />
            {businesses.map((b) => (
              <col key={b._id} />
            ))}
          </colgroup>

          {/* Business header row */}
          <thead>
            <tr className="border-b border-neutral-100">
              {/* sticky corner */}
              <th className="sticky left-0 z-10 bg-neutral-50 px-5 py-4 text-left">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Feature
                </span>
              </th>
              {businesses.map((b) => {
                const heroSrc = getBusinessHeroImageUrl(b);
                return (
                  <th
                    key={b._id}
                    className="px-5 py-4 text-left align-top"
                  >
                    {/* hero image */}
                    <div className="relative mb-3 h-28 overflow-hidden rounded-lg bg-neutral-100">
                      <Image
                        src={heroSrc}
                        alt={b.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm font-bold text-neutral-900 leading-snug">
                      {b.name}
                    </p>
                    {(b.city || b.state) && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {[b.city, b.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {b.isVerified && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                      {b.isFeatured && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {COMPARE_ROWS.map((row, rowIndex) => (
              <tr
                key={row.key}
                className={[
                  "border-b border-neutral-50 transition-colors",
                  rowIndex % 2 === 0 ? "bg-white" : "bg-neutral-50/50",
                ].join(" ")}
              >
                {/* Sticky feature label column */}
                <td
                  className={[
                    "sticky left-0 z-10 px-5 py-3.5",
                    rowIndex % 2 === 0 ? "bg-white" : "bg-neutral-50",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
                    {row.label}
                  </span>
                </td>
                {/* Value cells */}
                {businesses.map((b) => (
                  <td key={b._id} className="px-5 py-3.5 align-middle">
                    <CellValue label={row.key} business={b} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          {/* CTA footer row */}
          <tfoot>
            <tr className="border-t border-neutral-100 bg-neutral-50/50">
              <td className="sticky left-0 z-10 bg-neutral-50 px-5 py-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Actions
                </span>
              </td>
              {businesses.map((b) => (
                <td key={b._id} className="px-5 py-4">
                  <div className="flex flex-col gap-2">
                    <Link
                      href={getBusinessProfilePath(b)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FF6C00] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E86200] active:scale-[0.98]"
                    >
                      View Profile
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleRemove(b._id)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-red-300 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add more prompt if fewer than 3 */}
      {colCount < 3 && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white py-10 text-center transition-colors hover:border-[#FF6C00]/40">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0F0F0]">
            <Building2 className="h-6 w-6 text-[#FF6C00]" />
          </div>
          <p className="text-sm font-semibold text-neutral-800">
            Add{" "}
            {colCount === 1 ? "1 or 2 more" : "1 more"} business
            {colCount === 1 ? "es" : ""} to compare
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            You can compare up to 3 businesses side by side.
          </p>
          <Link
            href="/listings"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00]"
          >
            Browse Listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page entry point
// ---------------------------------------------------------------------------

export default function ComparePage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-neutral-200">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <SkeletonPage colCount={2} />
            </div>
          }
        >
          <CompareContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}
