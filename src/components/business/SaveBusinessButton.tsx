"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedBusinesses } from "@/hooks/useSavedBusinesses";

export function SaveBusinessButton({
  businessId,
  className,
}: {
  businessId: string;
  className?: string;
}) {
  const { isSaved, toggle } = useSavedBusinesses();
  const saved = isSaved(businessId);

  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await toggle(businessId);
      }}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/90 shadow-sm transition hover:scale-105",
        saved ? "border-rose-200 text-rose-500" : "border-slate-200 text-slate-400 hover:text-rose-400",
        className
      )}
      aria-label={saved ? "Remove from saved" : "Save business"}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-rose-500")} />
    </button>
  );
}
