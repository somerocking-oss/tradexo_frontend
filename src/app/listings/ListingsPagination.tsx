"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ListingsPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const safeTotalPages =
    Number.isFinite(totalPages) && totalPages > 0 ? Math.floor(totalPages) : 1;
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  if (safeTotalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (safeTotalPages <= 7) {
    for (let i = 1; i <= safeTotalPages; i += 1) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", safeTotalPages);
  }

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      <button
        type="button"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-400 bg-white text-[#666] transition hover:border-[#ff6c00] disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-[#999]">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "flex h-9 min-w-[36px] items-center justify-center rounded-lg border px-2 text-sm font-medium transition",
              safePage === p
                ? "border-[#ff6c00] bg-[#ff6c00] text-white"
                : "border-neutral-400 bg-white text-[#666] hover:border-[#d4d4d4]"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={safePage >= safeTotalPages}
        onClick={() => onPageChange(safePage + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-400 bg-white text-[#666] transition hover:border-[#ff6c00] disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
