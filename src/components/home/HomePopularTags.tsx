"use client";

import Link from "next/link";
import {
  Car,
  Dog,
  GraduationCap,
  Heart,
  Home,
  Scissors,
  Sparkles,
  Stethoscope,
  Store,
  Utensils,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category } from "@/types";
import { buildListingsUrl, categoryToSlug } from "@/lib/listings-url";

function resolveTagIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("pet")) return Dog;
  if (n.includes("auto") || n.includes("car")) return Car;
  if (n.includes("beauty") || n.includes("salon")) return Scissors;
  if (n.includes("health") || n.includes("doctor")) return Stethoscope;
  if (n.includes("food") || n.includes("restaurant")) return Utensils;
  if (n.includes("home")) return Home;
  if (n.includes("wedding")) return Heart;
  if (n.includes("education") || n.includes("tuition")) return GraduationCap;
  return Store;
}

export function HomePopularTags({
  categories = [],
  title = "Top Categories",
}: {
  categories?: Category[];
  title?: string;
}) {
  const tags = categories.slice(0, 12).map((c) => ({
    label: c.name,
    href: buildListingsUrl({ categorySlug: categoryToSlug(c) }),
    icon: resolveTagIcon(c.name),
  }));

  if (!tags.length) return null;

  return (
    <section className="border-b border-neutral-400 bg-neutral-200 px-3 py-8 sm:px-4">
      <div className="mx-auto max-w-8xl">
        <h2 className="text-lg font-bold text-[#111] sm:text-xl">{title}</h2>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {tags.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-medium text-[#444] shadow-sm transition hover:border-[#d4d4d4] hover:text-[#ff6c00] sm:text-sm"
            >
              <Icon className="h-4 w-4 text-[#ff6c00]" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeTrendingLinks({ terms = [] }: { terms?: string[] }) {
  if (!terms.length) return null;

  return (
    <div className="mx-auto max-w-8xl px-3 pb-8 sm:px-4">
      <h3 className="mb-3 text-sm font-bold text-[#111]">Trending Searches</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {terms.slice(0, 8).map((term) => (
          <Link
            key={term}
            href={buildListingsUrl({ keyword: term })}
            className="text-sm text-[#666] transition hover:text-[#ff6c00] hover:underline"
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}
