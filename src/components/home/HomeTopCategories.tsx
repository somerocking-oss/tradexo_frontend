"use client";

import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import type { Category } from "@/types";
import { buildListingsUrl, categoryToSlug } from "@/lib/listings-url";

export function HomeTopCategories({
  categories,
  title = "Explore Top Categories",
  viewAllHref = "/categories",
}: {
  categories: Category[];
  title?: string;
  viewAllHref?: string;
}) {
  const items = categories.slice(0, 9);

  if (!items.length) return null;

  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">{title}</h2>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#ff6c00] hover:underline"
          >
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {items.map((cat) => (
            <Link
              key={cat._id}
              href={buildListingsUrl({ categorySlug: categoryToSlug(cat) })}
              className="group flex flex-col items-center rounded-xl border border-neutral-400 bg-[#fafafa] p-4 text-center transition hover:border-[#ff6c00]/40 hover:bg-[#f0f0f0] hover:shadow-md"
            >
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-[#ff6c00]/20 bg-white text-xl font-bold text-[#ff6c00] shadow-sm transition group-hover:bg-[#e8e8e8]">
                {cat.icon || cat.name.charAt(0)}
              </span>
              <span className="line-clamp-2 text-xs font-semibold leading-snug text-neutral-800 group-hover:text-[#ff6c00] sm:text-sm">
                {cat.name}
              </span>
            </Link>
          ))}
          <Link
            href={viewAllHref}
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#ff6c00]/40 bg-[#f0f0f0] p-4 text-center transition hover:border-[#ff6c00] hover:bg-[#e8e8e8]"
          >
            <LayoutGrid className="h-8 w-8 text-[#ff6c00]" aria-hidden />
            <span className="mt-2 text-xs font-bold text-[#ff6c00] sm:text-sm">View All Categories</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
