"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { BusinessGrid } from "@/components/business/BusinessCard";
import { LeadModal } from "@/components/business/LeadModal";
import { Button } from "@/components/ui/button";
import { extractBusinessList, getBusinesses } from "@/lib/api/business";
import type { LatestListingsSection } from "@/lib/cms";
import type { Business } from "@/types";

const DEFAULT_SECTION: LatestListingsSection = {
  eyebrow: "New on Tradexo",
  title: "Latest Business Listings",
  subtitle: "Recently registered suppliers & service providers",
  buttonText: "View All",
  buttonHref: "/listings?sort=newest",
};

export function HomeLatestListings({
  section,
  initialBusinesses,
}: {
  section?: LatestListingsSection;
  initialBusinesses?: Business[];
}) {
  const [leadBusiness, setLeadBusiness] = useState<Business | null>(null);
  const data = {
    eyebrow: section?.eyebrow || DEFAULT_SECTION.eyebrow,
    title: section?.title || DEFAULT_SECTION.title,
    subtitle: section?.subtitle || DEFAULT_SECTION.subtitle,
    buttonText: section?.buttonText || DEFAULT_SECTION.buttonText,
    buttonHref: section?.buttonHref || DEFAULT_SECTION.buttonHref,
  };

  const hasInitialData = Boolean(initialBusinesses?.length);

  const { data: businesses = initialBusinesses || [], isLoading } = useQuery({
    queryKey: ["latest-businesses"],
    queryFn: async () => {
      const res = await getBusinesses({ limit: 12, sort: "newest" });
      return extractBusinessList(res.data);
    },
    initialData: hasInitialData ? initialBusinesses : undefined,
    enabled: !hasInitialData,
    staleTime: 60_000,
  });

  return (
    <section className="home-section-muted px-3 py-12 sm:px-4 sm:py-14">
      <div className="mx-auto max-w-8xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="home-eyebrow">{data.eyebrow}</span>
            <h2 className="home-section-title">{data.title}</h2>
            <p className="home-section-subtitle">{data.subtitle}</p>
          </div>
          <Button href={data.buttonHref || "/listings?sort=newest"} variant="outline" size="sm">
            {data.buttonText} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <BusinessGrid
          businesses={businesses}
          loading={!hasInitialData && isLoading}
          onLead={setLeadBusiness}
          viewMode="list"
          tracking={{ source: "homepage" }}
        />
      </div>
      <LeadModal business={leadBusiness} open={!!leadBusiness} onClose={() => setLeadBusiness(null)} />
    </section>
  );
}
