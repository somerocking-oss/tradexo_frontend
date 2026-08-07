"use client";

import Link from "next/link";
import { Building2, FileText, LocateFixed, Search, type LucideIcon } from "lucide-react";

const ACTIONS: { label: string; hint: string; href: string; icon: LucideIcon }[] = [
  {
    label: "Browse Suppliers",
    hint: "Search by category & city",
    href: "/listings",
    icon: Search,
  },
  {
    label: "Post RFQ",
    hint: "Get quotes from sellers",
    href: "/post-requirement",
    icon: FileText,
  },
  {
    label: "Near Me",
    hint: "Map-based discovery",
    href: "/listings/near-me/map",
    icon: LocateFixed,
  },
  {
    label: "Free Listing",
    hint: "List your business",
    href: "/register-business",
    icon: Building2,
  },
];

export function HomeQuickActions() {
  return (
    <section className="border-b border-neutral-400 bg-white py-5 sm:py-6">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:gap-4 sm:px-6">
        {ACTIONS.map(({ label, hint, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="home-quick-action group flex items-center gap-3 rounded-xl border border-neutral-400 bg-[#fafafa] p-3.5 sm:p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white transition group-hover:bg-[#ff6c00]">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-neutral-900">{label}</span>
              <span className="mt-0.5 block truncate text-[11px] text-neutral-500">{hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
