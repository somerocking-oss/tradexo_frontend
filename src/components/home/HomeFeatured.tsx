"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BusinessGrid } from "@/components/business/BusinessCard";
import { LeadModal } from "@/components/business/LeadModal";
import { extractBusinessList, getBusinesses } from "@/lib/api/business";
import type { FeaturedSection } from "@/lib/cms";
import type { Business } from "@/types";

const DEFAULT_SECTION: FeaturedSection = {
  title: "Featured & Top Businesses",
  subtitle: "Premium and highly rated listings",
};

export function HomeFeatured({
  section,
  initialBusinesses,
}: {
  section?: FeaturedSection;
  initialBusinesses?: Business[];
}) {
  const [leadBusiness, setLeadBusiness] = useState<Business | null>(null);
  const title = section?.title || DEFAULT_SECTION.title;
  const subtitle = section?.subtitle || DEFAULT_SECTION.subtitle;
  const hasInitialData = Boolean(initialBusinesses?.length);

  const { data: businesses = initialBusinesses || [], isLoading } = useQuery({
    queryKey: ["featured-businesses"],
    queryFn: async () => {
      const featured = await getBusinesses({ isFeatured: true, limit: 8, sort: "featured" });
      const list = extractBusinessList(featured.data);
      if (list.length > 0) return list;
      const latest = await getBusinesses({ limit: 8, sort: "popular" });
      return extractBusinessList(latest.data);
    },
    initialData: hasInitialData ? initialBusinesses : undefined,
    enabled: !hasInitialData,
    staleTime: 60_000,
  });

  if (!isLoading && businesses.length === 0) return null;

  return (
    <section className="bg-white px-3 py-12 sm:px-4 sm:py-14">
      <div className="mx-auto max-w-8xl">
        <span className="home-eyebrow">Featured</span>
        <h2 className="home-section-title">{title}</h2>
        <p className="home-section-subtitle mb-6">{subtitle}</p>
        <BusinessGrid
          businesses={businesses}
          loading={!hasInitialData && isLoading}
          onLead={setLeadBusiness}
          tracking={{ source: "homepage" }}
        />
      </div>
      <LeadModal business={leadBusiness} open={!!leadBusiness} onClose={() => setLeadBusiness(null)} />
    </section>
  );
}
