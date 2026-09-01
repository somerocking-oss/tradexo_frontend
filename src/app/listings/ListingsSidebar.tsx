"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ChevronRight,
  Factory,
  HardHat,
  MapPin,
  Package,
  Shirt,
  Store,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";
import { buildListingsUrl, categoryToSlug } from "@/lib/listings-url";
import { formatStatCount } from "@/lib/platform-stats";
import type { LucideIcon } from "lucide-react";
import type { Category } from "@/types";

function resolveIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("manufact")) return Factory;
  if (n.includes("wholesal")) return Warehouse;
  if (n.includes("distrib")) return Truck;
  if (n.includes("service")) return Wrench;
  if (n.includes("textile")) return Shirt;
  if (n.includes("packag")) return Package;
  if (n.includes("construct")) return HardHat;
  return Store;
}

function formatCategoryCount(cat: Category): string | undefined {
  if (cat.businessCount && cat.businessCount > 0) {
    return formatStatCount(cat.businessCount);
  }
  if (cat.subCategoryCount && cat.subCategoryCount > 0) {
    return `${cat.subCategoryCount} types`;
  }
  return undefined;
}

export function ListingsSidebar({
  categories = [],
  topCities = [],
  activeCategoryId,
  activeCity,
  onCategorySelect,
  onCitySelect,
}: {
  categories?: Category[];
  topCities?: Array<{ city: string; slug: string; count: number }>;
  activeCategoryId?: string;
  activeCity?: string;
  onCategorySelect?: (id: string) => void;
  onCitySelect?: (city: string) => void;
}) {
  const categoryItems = categories.slice(0, 20).map((cat) => ({
    name: cat.name,
    href: buildListingsUrl({ categorySlug: categoryToSlug(cat) }),
    icon: resolveIcon(cat.name),
    count: formatCategoryCount(cat),
    id: cat._id,
    emoji: cat.icon,
  }));

  const categoryListRef = useRef<HTMLUListElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);

  // scrollIntoView() walks every scrollable ancestor (including the page),
  // which produces inconsistent results inside this sticky sidebar — so the
  // scroll offset for the active item is computed and applied directly.
  useEffect(() => {
    const list = categoryListRef.current;
    const item = activeItemRef.current;
    if (!list || !item) return;
    const itemBottom = item.offsetTop + item.offsetHeight;
    if (itemBottom > list.clientHeight) {
      list.scrollTop = itemBottom - list.clientHeight;
    } else if (item.offsetTop < list.scrollTop) {
      list.scrollTop = item.offsetTop;
    }
  }, [activeCategoryId, categoryItems.length]);

  return (
    <aside className="space-y-5">
      {categoryItems.length > 0 ? (
      <div className="rounded-2xl border border-neutral-400 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-[#111]">Browse by Category</h2>
        <ul ref={categoryListRef} className="mt-3 max-h-80 space-y-0.5 overflow-y-auto pr-1">
          {categoryItems.map((item) => {
            const active = activeCategoryId && item.id === activeCategoryId;
            const content = (
              <>
                <span className="flex min-w-0 items-center gap-2.5">
                  {item.emoji ? (
                    <span className="shrink-0 text-base" aria-hidden>{item.emoji}</span>
                  ) : (
                    <item.icon className="h-4 w-4 shrink-0 text-[#ff6c00]" aria-hidden />
                  )}
                  <span className="truncate text-sm text-[#333]">{item.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {item.count ? (
                    <span className="text-xs font-medium text-[#999]">{item.count}</span>
                  ) : null}
                  <ChevronRight className="h-3.5 w-3.5 text-[#ccc]" aria-hidden />
                </span>
              </>
            );

            if (onCategorySelect && item.id) {
              return (
                <li key={item.id} ref={active ? activeItemRef : undefined}>
                  <button
                    type="button"
                    onClick={() => onCategorySelect(String(item.id))}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition hover:bg-[#EAF2FB] ${
                      active ? "bg-[#EAF2FB] font-semibold text-[#0B3B6F]" : ""
                    }`}
                  >
                    {content}
                  </button>
                </li>
              );
            }

            return (
              <li key={item.id} ref={active ? activeItemRef : undefined}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-2 py-2 transition hover:bg-[#EAF2FB] ${
                    active ? "bg-[#EAF2FB] font-semibold text-[#0B3B6F]" : ""
                  }`}
                >
                  {content}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href="/categories"
          className="mt-3 block w-full rounded-lg border border-neutral-400 py-2 text-center text-xs font-semibold text-[#ff6c00] transition hover:bg-[#f0f0f0]"
        >
          View All Categories
        </Link>
      </div>
      ) : null}

      {topCities.length > 0 ? (
      <div className="rounded-2xl border border-neutral-400 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#111]">
          <MapPin className="h-4 w-4 text-[#ff6c00]" aria-hidden />
          Top Cities
        </h2>
        <ul className="mt-3 space-y-0.5">
          {topCities.map((city) => {
            const active = activeCity?.toLowerCase() === city.city.toLowerCase();
            const countLabel = city.count > 0 ? formatStatCount(city.count) : undefined;
            if (onCitySelect) {
              return (
                <li key={city.slug}>
                  <button
                    type="button"
                    onClick={() => onCitySelect(city.city)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition hover:bg-[#EAF2FB] ${
                      active ? "bg-[#EAF2FB] font-semibold text-[#ff6c00]" : "text-[#333]"
                    }`}
                  >
                    <span>{city.city}</span>
                    {countLabel ? <span className="text-xs text-[#999]">{countLabel}</span> : null}
                  </button>
                </li>
              );
            }
            return (
              <li key={city.slug}>
                <Link
                  href={buildListingsUrl({ city: city.city })}
                  className={`flex items-center justify-between rounded-lg px-2 py-2 text-sm transition hover:bg-[#EAF2FB] ${
                    active ? "bg-[#EAF2FB] font-semibold text-[#ff6c00]" : "text-[#333]"
                  }`}
                >
                  <span>{city.city}</span>
                  {countLabel ? <span className="text-xs text-[#999]">{countLabel}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href="/browse"
          className="mt-3 block w-full rounded-lg border border-neutral-400 py-2 text-center text-xs font-semibold text-[#ff6c00] transition hover:bg-[#f0f0f0]"
        >
          View All Cities
        </Link>
      </div>
      ) : null}
    </aside>
  );
}
