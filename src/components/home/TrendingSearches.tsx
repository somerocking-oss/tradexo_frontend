"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { buildListingsUrl } from "@/lib/listings-url";
import { SITE_NAME } from "@/lib/constants";
import type { TrendingSection } from "@/lib/cms";

const FALLBACK_TERMS = [
  "Packaging manufacturers",
  "Industrial suppliers",
  "Steel distributors",
  "Logistics partners",
  "CA & compliance firms",
  "Textile wholesale",
];

export function TrendingSearches({
  section,
  terms,
}: {
  section?: TrendingSection;
  terms?: string[];
}) {
  const label = section?.label || `Trending on ${SITE_NAME}`;
  const displayTerms = (
    terms?.length ? terms : section?.terms?.length ? section.terms : FALLBACK_TERMS
  ).slice(0, 8);

  if (!displayTerms.length) return null;

  return (
    <section className="border-b border-neutral-200 bg-[#f8f9fb] py-7">
      <div className="mx-auto max-w-8xl px-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e8e8] text-[#ff6c00]">
              <TrendingUp className="h-4 w-4" />
            </span>
            {label}
          </span>
          {displayTerms.map((term) => (
            <Link key={term} href={buildListingsUrl({ keyword: term })} className="home-chip">
              {term}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
