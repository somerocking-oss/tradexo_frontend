"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CityInput } from "@/components/search/CityInput";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { buildListingsUrl } from "@/lib/listings-url";
import { useUserCity } from "@/hooks/useUserCity";

interface HeaderSearchProps {
  compact?: boolean;
  className?: string;
}

export function HeaderSearch({ compact, className }: HeaderSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const { city, setCity, detecting, detectCity } = useUserCity({ autoDetect: false });
  const [localCity, setLocalCity] = useState("");

  useEffect(() => {
    if (city && !localCity) setLocalCity(city);
  }, [city, localCity]);

  const goSearch = () => {
    if (localCity.trim()) setCity(localCity);
    router.push(
      buildListingsUrl({
        keyword: keyword.trim(),
        city: localCity.trim(),
      })
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        goSearch();
      }}
      className={cn(
        "jd-search-bar flex items-center gap-0 overflow-hidden",
        compact ? "flex-1" : "w-full max-w-2xl",
        className
      )}
    >
      <SearchAutocomplete
        keyword={keyword}
        onKeywordChange={setKeyword}
        city={localCity}
        onSubmit={goSearch}
        showIcon
        inputClassName="h-10 border-0 pl-9 shadow-none bg-transparent"
        placeholder={compact ? "Search businesses, services..." : "What are you looking for?"}
      />
      <div className="hidden h-8 w-px bg-slate-300 sm:block" />
      <div className="relative hidden sm:block sm:w-36 lg:w-44">
        <CityInput
          value={localCity}
          onChange={setLocalCity}
          onDetect={async () => {
            const detected = await detectCity();
            if (detected) setLocalCity(detected);
          }}
          detecting={detecting}
          showDetectButton={!compact}
          inputClassName="h-10 border-0 shadow-none bg-transparent"
        />
      </div>
      <button type="submit" className="jd-search-btn flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm">
        <Search className="h-4 w-4" />
        {compact ? "Search" : "Search"}
      </button>
    </form>
  );
}
