"use client";

import { GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompareBusinesses } from "@/hooks/useCompareBusinesses";

export function CompareBusinessButton({
  businessId,
  className,
}: {
  businessId: string;
  className?: string;
}) {
  const { isCompared, toggle, hydrated } = useCompareBusinesses();
  if (!hydrated) return null;

  const active = isCompared(businessId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const result = toggle(businessId);
        if (result.full) {
          window.alert("You can compare up to 3 businesses at a time.");
        }
      }}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/90 shadow-sm transition hover:scale-105",
        active
          ? "border-violet-300 text-violet-600"
          : "border-slate-200 text-slate-400 hover:text-violet-500",
        className
      )}
      aria-label={active ? "Remove from compare" : "Add to compare"}
      title={active ? "Remove from compare" : "Compare"}
    >
      <GitCompare className="h-4 w-4" />
    </button>
  );
}
