"use client";

import Link from "next/link";
import { ChevronRight, Globe, Heart, Users } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export function AboutHero({
  title = `About ${SITE_NAME}`,
  siteName = SITE_NAME,
}: {
  title?: string;
  siteName?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-br from-[#F0F0F0] via-[#E5E5E5]/40 to-white px-4 py-14 sm:px-6 sm:py-20">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#FF6C00]/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#FF6C00]/5 blur-2xl"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="transition-colors hover:text-[#FF6C00]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          <span className="font-medium text-neutral-600">About Us</span>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5E5E5] px-3 py-1 text-xs font-semibold text-[#FF6C00]">
            <Globe className="h-3.5 w-3.5" aria-hidden />
            India&apos;s B2B discovery platform
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <Users className="h-3.5 w-3.5" aria-hidden />
            Buyers &amp; sellers together
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
            <Heart className="h-3.5 w-3.5" aria-hidden />
            Built for trust
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          {siteName} connects buyers with verified local businesses, B2B suppliers, manufacturers,
          and service providers across India — making discovery simple, trustworthy, and
          lead-driven.
        </p>
      </div>
    </div>
  );
}
