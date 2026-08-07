"use client";

import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { useCompareBusinesses } from "@/hooks/useCompareBusinesses";

export function CompareBar() {
  const { ids, hydrated, remove, clear } = useCompareBusinesses();

  if (!hydrated || ids.length < 2) return null;

  return (
    <div className="fixed bottom-[4.5rem] left-3 right-3 z-40 md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-600 px-4 py-3 text-white shadow-lg">
        <div className="flex items-center gap-2 text-sm font-medium">
          <GitCompare className="h-4 w-4" />
          {ids.length} selected for compare
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/compare?ids=${ids.join(",")}`}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-violet-700"
          >
            Compare
          </Link>
          <button
            type="button"
            onClick={clear}
            className="rounded-lg p-1 hover:bg-white/15"
            aria-label="Clear compare list"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap gap-1 px-1">
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => remove(id)}
            className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] text-violet-700"
          >
            {id.slice(-6)} ×
          </button>
        ))}
      </div>
    </div>
  );
}
