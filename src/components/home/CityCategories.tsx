"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import { CITY_CATEGORY_SUGGESTIONS, POPULAR_CITIES } from "@/lib/cities";
import { buildBrowseSlug } from "@/lib/browse-slug";
import { buildListingsCityPath } from "@/lib/listings-url";
import { matchPopularCity } from "@/lib/user-city";
import { cn } from "@/lib/utils";
import { useUserCity } from "@/hooks/useUserCity";
import type { CityCategoriesSection } from "@/lib/cms";

const DEFAULT_SECTION: CityCategoriesSection = {
  eyebrow: "Explore by City",
  title: "Popular Categories Near You",
  subtitleDefault: "Select a city to browse trending business categories",
  subtitleDetected: "Showing categories for {city}",
  detectButtonText: "Detect my city",
  allInCityLinkText: "All in {city} →",
  cities: [...POPULAR_CITIES],
};

function applyCityTemplate(text: string, city: string) {
  return text.replace(/\{city\}/g, city);
}

function renderDetectedSubtitle(template: string, city: string) {
  const parts = template.split("{city}");
  if (parts.length === 1) return applyCityTemplate(template, city);
  return (
    <>
      {parts[0]}
      <strong className="text-[#e86200]">{city}</strong>
      {parts.slice(1).join("")}
    </>
  );
}

export function CityCategories({ section }: { section?: CityCategoriesSection }) {
  const config = {
    eyebrow: section?.eyebrow || DEFAULT_SECTION.eyebrow,
    title: section?.title || DEFAULT_SECTION.title,
    subtitleDefault: section?.subtitleDefault || DEFAULT_SECTION.subtitleDefault,
    subtitleDetected: section?.subtitleDetected || DEFAULT_SECTION.subtitleDetected,
    detectButtonText: section?.detectButtonText || DEFAULT_SECTION.detectButtonText,
    allInCityLinkText: section?.allInCityLinkText || DEFAULT_SECTION.allInCityLinkText,
  };

  const cities = useMemo(
    () => (section?.cities?.length ? section.cities : DEFAULT_SECTION.cities!),
    [section?.cities]
  );

  const { city: detectedCity, detecting, detectCity, wasAutoDetected } = useUserCity({ autoDetect: false });
  const [activeCity, setActiveCity] = useState<string>(cities[0] || "Mumbai");

  useEffect(() => {
    if (cities.length && !cities.includes(activeCity)) {
      setActiveCity(cities[0]);
    }
  }, [cities, activeCity]);

  useEffect(() => {
    if (detectedCity) {
      const matched = matchPopularCity(detectedCity) || detectedCity;
      if (cities.includes(matched)) {
        setActiveCity(matched);
      }
    }
  }, [detectedCity, cities]);

  const suggestions = useMemo(() => {
    const cmsGroup = section?.categoryGroups?.find((group) => group.city === activeCity);
    if (cmsGroup?.items?.length) {
      return cmsGroup.items.filter((item) => item.label?.trim() && item.keyword?.trim()) as Array<{
        label: string;
        keyword: string;
      }>;
    }
    return CITY_CATEGORY_SUGGESTIONS[activeCity] || [];
  }, [section?.categoryGroups, activeCity]);

  return (
    <section className="bg-white px-3 py-16 sm:px-4">
      <div className="mx-auto max-w-8xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="home-eyebrow">{config.eyebrow}</span>
            <h2 className="home-section-title mt-1">{config.title}</h2>
            <p className="home-section-subtitle mt-2">
              {wasAutoDetected && detectedCity
                ? renderDetectedSubtitle(config.subtitleDetected || "", detectedCity)
                : config.subtitleDefault}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={detectCity}
              disabled={detecting}
              className="flex items-center gap-1.5 rounded-full border border-[#d4d4d4] bg-[#e8e8e8] px-3 py-1.5 text-xs font-medium text-[#e86200] transition hover:bg-[#e8e8e8] disabled:opacity-50"
            >
              <Navigation className={cn("h-3.5 w-3.5", detecting && "animate-pulse")} />
              {detecting ? "Detecting..." : config.detectButtonText}
            </button>
            <Link
              href={buildListingsCityPath(activeCity)}
              className="text-sm font-semibold text-[#ff6c00] hover:underline"
            >
              {applyCityTemplate(config.allInCityLinkText || "", activeCity)}
            </Link>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setActiveCity(city)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition",
                activeCity === city
                  ? "bg-black text-white shadow-md"
                  : "home-chip hover:border-black hover:bg-neutral-50 hover:text-black"
              )}
            >
              <MapPin className="h-3.5 w-3.5" />
              {city}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((item) => (
            <Link
              key={item.label}
              href={`/browse/${buildBrowseSlug(item.keyword, activeCity)}`}
              className="home-card group flex items-center justify-between px-5 py-4"
            >
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-[#e86200]">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500">in {activeCity}</p>
              </div>
              <span className="rounded-full bg-[#e8e8e8] px-3 py-1 text-xs font-medium text-[#e86200] opacity-0 transition group-hover:opacity-100">
                Search →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
