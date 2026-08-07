"use client";

import Link from "next/link";
import { Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/business/VerifiedBadge";
import { getBusinessProfilePath } from "@/lib/business-url";
import type { PublicRequirement } from "@/lib/api/lead-server";
import type { Business } from "@/types";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? "s" : ""} ago`;
}

function formatResponseTime(hours?: number | null) {
  if (hours == null || hours <= 0) return null;
  if (hours < 1) return "Responds within an hour";
  if (hours <= 24) return `Responds within ${Math.round(hours)}h`;
  return `Responds within ${Math.round(hours / 24)}d`;
}

export function HomeRequirementsSuppliers({
  requirements = [],
  suppliers = [],
}: {
  requirements?: PublicRequirement[];
  suppliers?: Business[];
}) {
  if (!requirements.length && !suppliers.length) return null;

  return (
    <section className="border-b border-sky-200 bg-sky-50 px-4 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        {/* Recent Buy Requirements */}
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
              Recent Buy Requirements
            </h2>
            <Link href="/post-requirement" className="text-xs font-semibold text-[#FF6C00] hover:underline sm:text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-2.5">
            {requirements.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-400 bg-white p-3.5 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900">{req.productName}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                    {req.city && (
                      <>
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                        {req.city}
                        <span aria-hidden>·</span>
                      </>
                    )}
                    <Clock className="h-3 w-3 shrink-0" aria-hidden />
                    {timeAgo(req.createdAt)}
                  </p>
                </div>
                <Button href="/register-business" size="sm" className="shrink-0 bg-[#FF6C00] text-white hover:bg-[#E86200]">
                  Send Quote
                </Button>
              </div>
            ))}
            {requirements.length === 0 && (
              <p className="rounded-xl border border-dashed border-neutral-400 bg-white py-8 text-center text-sm text-neutral-500">
                No requirements posted yet.
              </p>
            )}
          </div>
        </div>

        {/* Featured Verified Suppliers */}
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
              Featured Verified Suppliers
            </h2>
            <Link href="/listings?isVerified=true" className="text-xs font-semibold text-[#FF6C00] hover:underline sm:text-sm">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {suppliers.slice(0, 4).map((business) => {
              const rating = business.averageRating ?? business.rating ?? 0;
              const responseLabel = formatResponseTime(business.avgResponseHours);
              return (
                <div
                  key={String(business._id)}
                  className="rounded-xl border border-neutral-400 bg-white p-3.5 shadow-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold text-neutral-900">{business.name}</p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <VerifiedBadge isVerified={business.isVerified} verificationLevel={business.verificationLevel} />
                    {business.gstVerified && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        GST Verified
                      </span>
                    )}
                  </div>
                  {business.city && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                      {business.city}
                    </p>
                  )}
                  {rating > 0 && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-neutral-700">
                      <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
                      {rating.toFixed(1)}
                    </p>
                  )}
                  {responseLabel && (
                    <p className="mt-1 text-[11px] font-medium text-emerald-600">{responseLabel}</p>
                  )}
                  <Button
                    href={getBusinessProfilePath(business)}
                    size="sm"
                    variant="outline"
                    className="mt-2.5 w-full"
                  >
                    View Profile
                  </Button>
                </div>
              );
            })}
            {suppliers.length === 0 && (
              <p className="col-span-full rounded-xl border border-dashed border-neutral-400 bg-white py-8 text-center text-sm text-neutral-500">
                No featured suppliers yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
