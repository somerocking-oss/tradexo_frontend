"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { buildListingsCityPath } from "@/lib/listings-url";

export interface TopCity {
  city: string;
  slug: string;
  count: number;
}

function formatCount(count: number) {
  if (count >= 1000) return `${Math.floor(count / 100) / 10}K+`;
  return `${count}+`;
}

export function HomeTopCities({ cities = [] }: { cities?: TopCity[] }) {
  if (!cities.length) return null;

  return (
    <section className="border-b border-neutral-300 bg-white px-4 py-12 sm:px-6 sm:py-14" aria-labelledby="top-cities-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A3A3A3]">
            Pan-India Coverage
          </p>
          <h2 id="top-cities-heading" className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
            Top Cities
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[#737373] sm:text-base">
            Find verified suppliers and manufacturers in your city.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cities.map((c, index) => (
            <Reveal key={c.slug} delay={Math.min(index, 6) * 50}>
              <Link
                href={buildListingsCityPath(c.city)}
                className="group flex flex-col items-center rounded-xl border border-neutral-400 bg-white p-4 text-center shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#FF6C00]/40 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-200 text-neutral-600 transition-all duration-200 ease-out group-hover:bg-[#FF6C00] group-hover:text-white">
                  <Building2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-2.5 text-sm font-semibold text-[#262626]">{c.city}</h3>
                <p className="mt-0.5 text-xs font-medium text-[#FF6C00]">{formatCount(c.count)} suppliers</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
