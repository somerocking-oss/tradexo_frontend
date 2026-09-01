"use client";

import { Building2, Globe2, Package, ShieldCheck, Users } from "lucide-react";

const STATS = [
  { value: "2M+", label: "Businesses", icon: Building2 },
  { value: "50M+", label: "Products & Services", icon: Package },
  { value: "10M+", label: "Verified Suppliers", icon: ShieldCheck },
  { value: "5M+", label: "Buyers & Customers", icon: Users },
  { value: "All India", label: "Coverage", icon: Globe2 },
];

export function HomeStatsBar() {
  return (
    <section className="border-y border-neutral-400 bg-white py-4">
      <div className="mx-auto flex max-w-8xl flex-wrap items-center justify-center gap-6 px-3 sm:justify-between sm:gap-4 sm:px-4">
        {STATS.map(({ value, label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2 text-center sm:text-left">
            <Icon className="h-5 w-5 shrink-0 text-[#ff6c00]" aria-hidden />
            <div>
              <p className="text-sm font-bold text-neutral-900">{value}</p>
              <p className="text-[11px] text-neutral-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
