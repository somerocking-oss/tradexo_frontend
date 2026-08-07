"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildListingsCategoryPath, buildListingsCityCategoryPath } from "@/lib/listings-url";
import { subCategoryToSlug } from "@/lib/api/subcategory-server";
import type { SubCategory } from "@/types";

export function ListingsSubcategoryBar({
  categorySlug,
  city,
  subcategories,
  activeSubCategorySlug,
}: {
  categorySlug: string;
  city?: string;
  subcategories: SubCategory[];
  activeSubCategorySlug?: string;
}) {
  if (!subcategories.length) return null;

  const active = activeSubCategorySlug?.toLowerCase();

  const buildHref = (subSlug?: string) =>
    city
      ? buildListingsCityCategoryPath(city, categorySlug, subSlug)
      : buildListingsCategoryPath(categorySlug, subSlug);

  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Browse by type
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={buildHref()}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
              !active
                ? "border-[#FF6C00] bg-[#FF6C00] text-white shadow-sm"
                : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-[#FF6C00]/40 hover:text-[#FF6C00]"
            )}
          >
            All
          </Link>
          {subcategories.map((sub) => {
            const slug = subCategoryToSlug(sub);
            const isActive = active === slug;
            return (
              <Link
                key={sub._id}
                href={buildHref(slug)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                  isActive
                    ? "border-[#FF6C00] bg-[#FF6C00] text-white shadow-sm"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-[#FF6C00]/40 hover:text-[#FF6C00]"
                )}
              >
                {sub.icon ? (
                  <span aria-hidden>{sub.icon}</span>
                ) : null}
                {sub.name}
                {sub.businessCount != null && sub.businessCount > 0 ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
                    )}
                  >
                    {sub.businessCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
