import Link from "next/link";
import type { Category } from "@/types";
import { buildListingsUrl, categoryToSlug } from "@/lib/listings-url";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 md:gap-3">
      {categories.slice(0, 12).map((cat) => (
        <Link
          key={cat._id}
          href={buildListingsUrl({ categorySlug: categoryToSlug(cat) })}
          className="home-card group flex flex-col items-center p-3 text-center transition hover:-translate-y-0.5 sm:p-3.5"
        >
          <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-400 bg-[#fafafa] text-lg font-bold text-neutral-800 transition group-hover:border-[#ff6c00]/40 group-hover:bg-[#f0f0f0] group-hover:text-[#ff6c00] sm:h-[52px] sm:w-[52px]">
            {cat.icon || cat.name.charAt(0)}
          </span>
          <span className="line-clamp-2 text-[11px] font-semibold leading-snug text-neutral-800 group-hover:text-[#ff6c00] sm:text-xs">
            {cat.name}
          </span>
          {cat.businessCount != null && cat.businessCount > 0 && (
            <span className="mt-0.5 text-[10px] text-neutral-500">{cat.businessCount}+ listings</span>
          )}
        </Link>
      ))}
    </div>
  );
}
