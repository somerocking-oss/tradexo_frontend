"use client";

import Link from "next/link";
import {
  Cpu,
  Factory,
  HardHat,
  Sprout,
  ShipWheel,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { buildListingsUrl, categoryToSlug } from "@/lib/listings-url";
import type { Category } from "@/types";

interface Industry {
  label: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
}

const INDUSTRIES: Industry[] = [
  {
    label: "Manufacturing & Industrial",
    description: "Machinery, raw materials, industrial equipment",
    icon: Factory,
    keywords: ["manufactur", "industrial", "machinery"],
  },
  {
    label: "IT & Software Services",
    description: "Software, web dev, cloud, cybersecurity",
    icon: Cpu,
    keywords: ["it ", "software", "technology", "tech"],
  },
  {
    label: "Agriculture & Food",
    description: "Farm equipment, food processing, agro products",
    icon: Sprout,
    keywords: ["agri", "food", "farm"],
  },
  {
    label: "Construction & Real Estate",
    description: "Building materials, construction equipment",
    icon: HardHat,
    keywords: ["construction", "real estate", "building"],
  },
  {
    label: "Export & Trading",
    description: "Import-export, wholesale, trading houses",
    icon: ShipWheel,
    keywords: ["export", "import", "trading", "wholesale"],
  },
  {
    label: "Healthcare & Pharma",
    description: "Medical equipment, pharma, healthcare supplies",
    icon: Stethoscope,
    keywords: ["health", "pharma", "medical"],
  },
];

function findMatchingCategory(categories: Category[], keywords: string[]): Category | null {
  const lowerKeywords = keywords.map((k) => k.toLowerCase());
  return (
    categories.find((c) => {
      const haystack = [c.name, ...(c.keywords || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return lowerKeywords.some((k) => haystack.includes(k));
    }) || null
  );
}

export function HomeIndustrySolutions({ categories = [] }: { categories?: Category[] }) {
  const tiles = INDUSTRIES.map((industry) => {
    const match = findMatchingCategory(categories, industry.keywords);
    if (!match) return null;
    return {
      ...industry,
      href: buildListingsUrl({ categorySlug: categoryToSlug(match) }),
    };
  }).filter((t): t is Industry & { href: string } => t !== null);

  if (!tiles.length) return null;

  return (
    <section className="bg-neutral-200 px-3 py-12 sm:px-4 sm:py-14" aria-labelledby="industry-solutions-heading">
      <div className="mx-auto max-w-8xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A3A3A3]">
            Industry Solutions
          </p>
          <h2 id="industry-solutions-heading" className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
            Solutions by Industry
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[#737373] sm:text-base">
            Find verified suppliers tailored to your industry.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map(({ label, description, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="group flex flex-col items-center rounded-xl border border-neutral-400 bg-white p-4 text-center shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#FF6C00]/40 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-200 text-neutral-600 transition-all duration-200 ease-out group-hover:bg-[#FF6C00] group-hover:text-white">
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-2.5 text-sm font-semibold text-[#262626]">{label}</h3>
              <p className="mt-1 text-xs text-[#A3A3A3]">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
