"use client";

import { Building2, MapPin, TrendingUp } from "lucide-react";

export function BrowseHeroStats({
  landingCount,
  cityCount,
}: {
  landingCount: number;
  cityCount: number;
}) {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3B6F] via-[#0A3159] to-[#08284A] p-6 shadow-xl sm:p-7">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ff6c00]/15 blur-2xl"
          aria-hidden
        />
        <div className="relative grid grid-cols-3 gap-4 text-center sm:text-left">
          <div>
            <TrendingUp className="mx-auto h-4 w-4 text-[#ff8533] sm:mx-0" aria-hidden />
            <p className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
              {(landingCount || 1000).toLocaleString("en-IN")}+
            </p>
            <p className="mt-0.5 text-xs text-white/65">Landing Pages</p>
          </div>
          <div>
            <MapPin className="mx-auto h-4 w-4 text-[#ff8533] sm:mx-0" aria-hidden />
            <p className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
              {cityCount.toLocaleString("en-IN")}
            </p>
            <p className="mt-0.5 text-xs text-white/65">Indian Cities</p>
          </div>
          <div>
            <Building2 className="mx-auto h-4 w-4 text-[#ff8533] sm:mx-0" aria-hidden />
            <p className="mt-2 text-xl font-extrabold text-white sm:text-2xl">Verified</p>
            <p className="mt-0.5 text-xs text-white/65">Suppliers &amp; Services</p>
          </div>
        </div>
      </div>
    </div>
  );
}
