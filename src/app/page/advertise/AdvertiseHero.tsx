"use client";

import Link from "next/link";
import { ChevronRight, Megaphone, Target, TrendingUp } from "lucide-react";

export function AdvertiseHero({ title = "Advertise on Tradexo" }: { title?: string }) {
  return (
    <div className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-br from-[#F0F0F0] via-[#E5E5E5]/40 to-white px-4 py-14 sm:px-6 sm:py-20">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#FF6C00]/6 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 left-1/3 h-56 w-56 rounded-full bg-[#FF6C00]/4 blur-2xl"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="transition-colors hover:text-[#FF6C00]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          <span className="font-medium text-neutral-600">Advertise</span>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5E5E5] px-3 py-1 text-xs font-semibold text-[#FF6C00]">
            <Megaphone className="h-3.5 w-3.5" aria-hidden />
            Promote your business
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Target className="h-3.5 w-3.5" aria-hidden />
            Reach ready-to-buy customers
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            More leads &amp; visibility
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          Put your brand in front of buyers searching for products and services every day. Featured
          listings, category sponsorships, city promotions, and banner placements — built for local
          and B2B growth.
        </p>

        {/* Quick stats */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:max-w-lg">
          {[
            { value: "1L+", label: "Monthly searches" },
            { value: "400+", label: "Cities covered" },
            { value: "High", label: "Buyer intent traffic" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-100 bg-white px-5 py-4 text-center shadow-sm"
            >
              <p className="text-2xl font-extrabold tracking-tight text-[#FF6C00]">{value}</p>
              <p className="mt-0.5 text-xs font-medium text-neutral-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
