"use client";

import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Factory,
  Grid3X3,
  HardHat,
  Package,
  Shirt,
  Store,
  Truck,
  UtensilsCrossed,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category } from "@/types";
import { buildListingsUrl, categoryToSlug } from "@/lib/listings-url";

const ICON_MAP: Record<string, LucideIcon> = {
  manufacturer: Factory,
  manufacturers: Factory,
  wholesaler: Warehouse,
  wholesalers: Warehouse,
  distributor: Truck,
  distributors: Truck,
  electronics: Cpu,
  textile: Shirt,
  textiles: Shirt,
  packaging: Package,
  construction: HardHat,
  food: UtensilsCrossed,
  retail: Store,
  service: Wrench,
};

function resolveIcon(name: string): LucideIcon {
  const key = name.toLowerCase();
  for (const [k, icon] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return icon;
  }
  return Store;
}

function formatCount(count?: number) {
  if (!count || count <= 0) return null;
  if (count >= 1000) return `${Math.floor(count / 100) / 10}K+`;
  return `${count}+`;
}

export function HomeExploreCategories({
  categories = [],
  viewAllHref = "/categories",
  totalCategoryCount = 0,
  title = "Top Categories",
  subtitle,
}: {
  categories?: Category[];
  viewAllHref?: string;
  totalCategoryCount?: number;
  title?: string;
  subtitle?: string;
}) {
  const items =
    categories.length > 0
      ? categories.slice(0, 12).map((cat) => ({
          name: cat.name,
          count: formatCount(cat.businessCount) || (cat.subCategoryCount ? `${cat.subCategoryCount} types` : null),
          href: buildListingsUrl({ categorySlug: categoryToSlug(cat) }),
          icon: cat.icon ? null : resolveIcon(cat.name),
          emoji: cat.icon,
        }))
      : [];

  if (!items.length) return null;

  return (
    <section className="border-b border-sky-200 bg-sky-50 px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="categories-heading">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#E86200]">
              Shop by Category
            </p>
            <h2
              id="categories-heading"
              className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 max-w-xl text-sm text-[#525252] sm:text-base">{subtitle}</p>
            ) : (
              <p className="mt-2 max-w-xl text-sm text-[#525252] sm:text-base">
                Browse top industries and find verified suppliers across India.
              </p>
            )}
          </div>
          <Link
            href={viewAllHref}
            className="group hidden shrink-0 items-center gap-1.5 rounded-lg border border-sky-300 px-4 py-2 text-sm font-semibold text-[#525252] transition-all duration-200 ease-out hover:border-[#FF6C00] hover:text-[#FF6C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30 sm:flex"
          >
            View all categories
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2.5 md:grid-cols-5 lg:grid-cols-6 lg:gap-3">
          {items.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-[#525252]">No categories available yet.</p>
          ) : (
            items.map(({ name, count, href, icon: Icon, emoji }) => (
            <Link
              key={name}
              href={href}
              className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-neutral-400 bg-neutral-100 p-4 text-center shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#FF6C00]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30 sm:p-3.5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-200 text-neutral-600 transition-all duration-200 ease-out group-hover:bg-[#FF6C00] group-hover:text-white group-hover:shadow-[0_4px_14px_rgba(255,108,0,0.30)] sm:h-11 sm:w-11">
                {emoji ? (
                  <span className="text-xl sm:text-lg" aria-hidden>{emoji}</span>
                ) : Icon ? (
                  <Icon className="h-6 w-6 sm:h-5 sm:w-5" strokeWidth={1.75} aria-hidden />
                ) : null}
              </span>

              <h3 className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-[#262626]">{name}</h3>

              <p className="mt-0.5 text-[10px] font-medium text-[#A3A3A3]">
                {count ? (
                  <span className="font-semibold text-[#FF6C00]">{count}</span>
                ) : null}
              </p>

              <span
                className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-[#FF6C00] transition-all duration-200 ease-out group-hover:w-8"
                aria-hidden
              />
            </Link>
            ))
          )}

          {totalCategoryCount > items.length ? (
          <Link
            href={viewAllHref}
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-500 bg-neutral-300 p-3 text-center transition-all duration-200 ease-out hover:border-[#FF6C00] hover:bg-neutral-400 hover:shadow-[0_4px_14px_rgba(255,108,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30 sm:p-3.5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-[#FF6C00] shadow-sm transition-all duration-200 ease-out group-hover:shadow-[0_4px_14px_rgba(255,108,0,0.22)] sm:h-11 sm:w-11">
              <Grid3X3 className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-2 text-[11px] font-semibold text-[#FF6C00] sm:text-xs">
              {totalCategoryCount}+ Categories
            </h3>
            <p className="mt-0.5 text-[10px] font-medium text-[#A3A3A3]">Browse all industries</p>
          </Link>
          ) : null}
        </div>

        {/* Mobile view-all link */}
        <div className="mt-7 flex justify-center sm:hidden">
          <Link
            href={viewAllHref}
            className="group flex items-center gap-1.5 rounded-lg border border-sky-300 px-4 py-2.5 text-sm font-semibold text-[#525252] transition-all duration-200 ease-out hover:border-[#FF6C00] hover:text-[#FF6C00]"
          >
            View all categories
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
