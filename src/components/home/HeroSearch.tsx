"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LocateFixed, LayoutGrid, MapPin, Search } from "lucide-react";
import { CityInput } from "@/components/search/CityInput";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { useUserCity } from "@/hooks/useUserCity";
import { buildListingsUrl, categoryToSlug } from "@/lib/listings-url";
import type { Category } from "@/types";

export function HeroSearch({
  accent = "brand",
  layout = "default",
  categories = [],
}: {
  accent?: "brand" | "dark";
  layout?: "default" | "hero" | "jd" | "marketplace" | "b2b" | "wireframe";
  categories?: Category[];
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const { city, setCity, detecting, wasAutoDetected, detectError, detectCity } = useUserCity({ autoDetect: false });
  const [localCity, setLocalCity] = useState("");

  useEffect(() => {
    if (city && !localCity) setLocalCity(city);
  }, [city, localCity]);

  const goSearch = () => {
    if (localCity.trim()) setCity(localCity);
    const selectedCategory = categories.find((c) => c._id === categoryId);
    router.push(
      buildListingsUrl({
        keyword: keyword.trim(),
        city: localCity.trim(),
        categorySlug: selectedCategory ? categoryToSlug(selectedCategory) : undefined,
        categoryId: !selectedCategory && categoryId ? categoryId : undefined,
      })
    );
  };

  const goNearMe = () => {
    router.push(
      buildListingsUrl({
        keyword: keyword.trim() || undefined,
        nearMe: true,
        viewMode: "map",
      })
    );
  };

  const isJd = layout === "jd";
  const isMarketplace = layout === "marketplace";
  const isB2b = layout === "b2b";
  const isWireframe = layout === "wireframe";

  const form = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        goSearch();
      }}
      className={
        isWireframe
          ? "home-wire-search flex w-full flex-col overflow-hidden rounded-xl border-2 border-neutral-200 bg-white shadow-[0_4px_6px_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.06)] transition-shadow duration-200 ease-out focus-within:border-[#FF6C00] focus-within:shadow-[0_4px_14px_rgba(255,108,0,0.18)] sm:flex-row sm:items-stretch"
          : isB2b
          ? "flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_4px_6px_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.06)] transition-shadow duration-200 ease-out focus-within:border-[#FF6C00]/60 focus-within:shadow-[0_4px_14px_rgba(255,108,0,0.15)] sm:flex-row sm:items-stretch"
          : isMarketplace
          ? "flex w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_10px_15px_rgba(0,0,0,0.1),_0_4px_6px_rgba(0,0,0,0.05)] transition-shadow duration-200 ease-out focus-within:border-[#FF6C00]/60 focus-within:shadow-[0_10px_20px_rgba(255,108,0,0.12)] sm:flex-row sm:items-stretch"
          : isJd
            ? "jd-search-bar flex w-full flex-col overflow-hidden rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.07)] sm:flex-row sm:items-stretch"
            : accent === "dark"
              ? "flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-shadow duration-200 focus-within:shadow-[0_4px_6px_rgba(0,0,0,0.07)] sm:flex-row sm:items-stretch"
              : "jd-search-bar flex w-full flex-col overflow-hidden rounded-xl sm:flex-row sm:items-stretch"
      }
    >
      {isWireframe ? (
        <>
          {/* Category selector */}
          <div className="relative flex min-w-0 items-center border-b border-neutral-100 sm:w-[140px] sm:shrink-0 sm:border-b-0 sm:border-r lg:w-[160px]">
            <LayoutGrid
              className="pointer-events-none absolute left-3.5 h-4 w-4 text-neutral-400"
              aria-hidden
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              aria-label="Category"
              className="h-12 w-full cursor-pointer appearance-none border-0 bg-transparent pl-10 pr-7 text-sm font-medium text-neutral-700 outline-none sm:h-14"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-neutral-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Keyword autocomplete */}
          <div className="min-w-0 flex-1 border-b border-neutral-100 sm:border-b-0 sm:border-r">
            <SearchAutocomplete
              keyword={keyword}
              onKeywordChange={setKeyword}
              city={localCity}
              onSubmit={goSearch}
              inputClassName="h-12 border-0 pl-11 text-sm shadow-none bg-transparent placeholder:text-neutral-400 sm:h-14 sm:text-base"
              placeholder="Search for products, companies..."
            />
          </div>

          {/* City input */}
          <div className="flex min-w-0 items-center border-b border-neutral-100 sm:w-[128px] sm:shrink-0 sm:border-b-0 sm:border-r lg:w-[148px]">
            <CityInput
              value={localCity}
              onChange={setLocalCity}
              onDetect={async () => {
                const detected = await detectCity();
                if (detected) setLocalCity(detected);
              }}
              detecting={detecting}
              wasAutoDetected={wasAutoDetected}
              inputClassName="h-12 border-0 pl-10 pr-3 text-sm font-medium shadow-none bg-transparent placeholder:text-neutral-400 sm:h-14"
              showDetectButton={false}
              placeholder="All India"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex h-12 items-center justify-center gap-2 rounded-b-[10px] bg-[#FF6C00] px-5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,108,0,0.25)] transition-all duration-200 ease-out hover:bg-[#E86200] hover:shadow-[0_4px_18px_rgba(255,108,0,0.35)] active:scale-[0.98] sm:h-14 sm:min-w-[108px] sm:rounded-b-none sm:rounded-r-[10px] sm:text-base"
          >
            <Search className="h-5 w-5 shrink-0" aria-hidden />
            Search
          </button>
        </>
      ) : isB2b ? (
        <>
          {/* Category selector */}
          <div className="relative flex min-w-0 items-center border-b border-neutral-100 sm:w-[155px] sm:shrink-0 sm:border-b-0 sm:border-r lg:w-[175px]">
            <LayoutGrid
              className="pointer-events-none absolute left-3.5 h-4 w-4 text-neutral-400"
              aria-hidden
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              aria-label="Category"
              className="h-14 w-full cursor-pointer appearance-none border-0 bg-transparent pl-10 pr-7 text-sm font-medium text-neutral-700 outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-neutral-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Keyword autocomplete */}
          <div className="min-w-0 flex-1 border-b border-neutral-100 sm:border-b-0 sm:border-r">
            <SearchAutocomplete
              keyword={keyword}
              onKeywordChange={setKeyword}
              city={localCity}
              onSubmit={goSearch}
              inputClassName="h-14 border-0 pl-11 text-base shadow-none bg-transparent placeholder:text-neutral-400"
              placeholder="Search for products, companies..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex h-14 items-center justify-center gap-2 rounded-b-[10px] bg-neutral-900 px-6 text-base font-semibold text-white transition-all duration-200 ease-out hover:bg-neutral-800 active:scale-[0.98] sm:min-w-[120px] sm:rounded-b-none sm:rounded-r-[10px]"
          >
            <Search className="h-5 w-5 shrink-0" aria-hidden />
            Search
          </button>
        </>
      ) : isJd ? (
        <>
          {/* City input */}
          <div className="flex min-w-0 items-center border-b border-neutral-100 sm:w-[200px] sm:shrink-0 sm:border-b-0 sm:border-r lg:w-[220px]">
            <div className="relative min-w-0 flex-1">
              <CityInput
                value={localCity}
                onChange={setLocalCity}
                onDetect={async () => {
                  const detected = await detectCity();
                  if (detected) setLocalCity(detected);
                }}
                detecting={detecting}
                wasAutoDetected={wasAutoDetected}
                inputClassName="h-14 border-0 pl-10 pr-2 text-base font-medium shadow-none bg-transparent placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Keyword autocomplete */}
          <div className="min-w-0 flex-1 border-b border-neutral-100 sm:border-b-0 sm:border-r">
            <SearchAutocomplete
              keyword={keyword}
              onKeywordChange={setKeyword}
              city={localCity}
              onSubmit={goSearch}
              inputClassName="h-14 border-0 pl-11 text-base shadow-none bg-transparent placeholder:text-neutral-400"
              placeholder="Search manufacturers, suppliers, distributors..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="jd-search-btn flex items-center justify-center px-6 py-4 transition-opacity duration-200 hover:opacity-90 active:scale-[0.98] sm:min-w-[80px] lg:min-w-[88px]"
            aria-label="Search"
          >
            <Search className="h-6 w-6 shrink-0" aria-hidden />
          </button>
        </>
      ) : isMarketplace ? (
        <>
          {/* City input */}
          <div className="flex min-w-0 items-center border-b border-neutral-100 sm:w-[190px] sm:shrink-0 sm:border-b-0 sm:border-r lg:w-[210px]">
            <CityInput
              value={localCity}
              onChange={setLocalCity}
              onDetect={async () => {
                const detected = await detectCity();
                if (detected) setLocalCity(detected);
              }}
              detecting={detecting}
              wasAutoDetected={wasAutoDetected}
              inputClassName="h-[58px] border-0 pl-10 pr-2 text-base font-medium shadow-none bg-transparent placeholder:text-neutral-400"
            />
          </div>

          {/* Keyword autocomplete */}
          <div className="min-w-0 flex-1 border-b border-neutral-100 sm:border-b-0 sm:border-r">
            <SearchAutocomplete
              keyword={keyword}
              onKeywordChange={setKeyword}
              city={localCity}
              onSubmit={goSearch}
              inputClassName="h-[58px] border-0 pl-11 text-base shadow-none bg-transparent placeholder:text-neutral-400"
              placeholder="Search manufacturers, suppliers, distributors..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex h-[58px] items-center justify-center gap-2 rounded-b-[14px] bg-neutral-900 px-6 text-base font-semibold text-white transition-all duration-200 ease-out hover:bg-neutral-800 active:scale-[0.98] sm:min-w-[130px] sm:rounded-b-none sm:rounded-r-[14px]"
          >
            <Search className="h-5 w-5 shrink-0" aria-hidden />
            Search
          </button>
        </>
      ) : (
        /* default / hero layout */
        <>
          {/* Keyword autocomplete */}
          <div className="min-w-0 flex-[2] border-b border-neutral-100 sm:border-b-0 sm:border-r">
            <SearchAutocomplete
              keyword={keyword}
              onKeywordChange={setKeyword}
              city={localCity}
              onSubmit={goSearch}
              inputClassName="h-14 border-0 pl-11 text-base shadow-none bg-transparent placeholder:text-neutral-400"
              placeholder="Search manufacturers, suppliers, distributors..."
            />
          </div>

          {/* City input */}
          <div className="flex min-w-0 flex-1 items-center border-b border-neutral-100 sm:border-b-0 sm:border-r">
            <span className="hidden shrink-0 pl-4 text-sm font-medium text-neutral-400 sm:block">
              in
            </span>
            <div className="relative min-w-0 flex-1">
              <CityInput
                value={localCity}
                onChange={setLocalCity}
                onDetect={async () => {
                  const detected = await detectCity();
                  if (detected) setLocalCity(detected);
                }}
                detecting={detecting}
                wasAutoDetected={wasAutoDetected}
                inputClassName="h-14 border-0 pl-9 pr-2 text-base shadow-none bg-transparent placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={
              accent === "dark"
                ? "flex items-center justify-center gap-2 rounded-b-xl bg-neutral-900 px-6 py-4 text-base font-semibold text-white transition-all duration-200 ease-out hover:bg-neutral-800 active:scale-[0.98] sm:min-w-[120px] sm:rounded-b-none sm:rounded-r-xl lg:min-w-[140px]"
                : "jd-search-btn flex items-center justify-center gap-2 px-6 py-4 text-base transition-opacity duration-200 hover:opacity-90 active:scale-[0.98] sm:min-w-[120px] lg:min-w-[140px]"
            }
          >
            <Search className="h-5 w-5 shrink-0" aria-hidden />
            Search
          </button>
        </>
      )}
    </form>
  );

  const actions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={goNearMe}
        className={
          isMarketplace
            ? "inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors duration-200 ease-out hover:text-neutral-800"
            : isB2b
              ? "inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors duration-200 ease-out hover:text-[#FF6C00]"
              : isJd
              ? "inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 transition-colors duration-200 ease-out hover:text-[#FF6C00]"
              : "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out hover:bg-neutral-50 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)]"
        }
      >
        <LocateFixed className="h-4 w-4 shrink-0" aria-hidden />
        Near Me
      </button>

      {isMarketplace || isB2b ? (
        <span className="text-neutral-300" aria-hidden>·</span>
      ) : isJd ? (
        <span className="text-neutral-300" aria-hidden>|</span>
      ) : (
        <span className="hidden text-neutral-300 sm:inline" aria-hidden>|</span>
      )}

      <button
        type="button"
        onClick={async () => {
          const detected = await detectCity();
          if (detected) setLocalCity(detected);
        }}
        disabled={detecting}
        className={
          isMarketplace || isB2b
            ? "inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors duration-200 ease-out hover:text-[#FF6C00] disabled:opacity-50"
            : isJd
              ? "inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6C00] transition-colors duration-200 ease-out hover:text-[#E86200] disabled:opacity-50"
              : "inline-flex items-center gap-2 rounded-full border-2 border-[#FF6C00] bg-[#F0F0F0] px-4 py-2 text-sm font-semibold text-[#E86200] shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out hover:border-[#E86200] hover:bg-[#E5E5E5] disabled:opacity-50"
        }
      >
        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        {detecting ? "Detecting city..." : "Detect my city"}
      </button>
    </div>
  );

  if (layout === "hero") {
    return (
      <div className="w-full space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white p-1.5 shadow-[0_20px_25px_rgba(0,0,0,0.1),_0_10px_10px_rgba(0,0,0,0.04)] sm:p-2">
          {form}
        </div>
        {actions}
        {detectError ? (
          <p className="text-center text-sm font-medium text-red-400">{detectError}</p>
        ) : null}
      </div>
    );
  }

  if (layout === "wireframe") {
    return (
      <div className="w-full">
        {form}
        {detectError ? (
          <p className="mt-2 text-sm font-medium text-red-600">{detectError}</p>
        ) : null}
      </div>
    );
  }

  if (layout === "b2b") {
    return (
      <div className="w-full space-y-3">
        {form}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">{actions}</div>
        {detectError ? (
          <p className="text-sm font-medium text-red-600">{detectError}</p>
        ) : null}
      </div>
    );
  }

  if (layout === "marketplace") {
    return (
      <div className="w-full space-y-3">
        {form}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">{actions}</div>
        {detectError ? (
          <p className="text-center text-sm font-medium text-red-600">{detectError}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {form}
      {actions}
      {detectError ? (
        <p className={`text-sm font-medium ${isJd ? "text-red-600" : "text-center text-red-600"}`}>
          {detectError}
        </p>
      ) : null}
    </div>
  );
}
