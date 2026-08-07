"use client";

import { useEffect, useRef } from "react";
import { trackListingImpression } from "@/lib/analytics/impressions";
import type { TrackingContext } from "@/lib/analytics/track";

export function useBusinessImpression(
  businessId: string,
  tracking?: TrackingContext,
  rankPosition?: number
) {
  const ref = useRef<HTMLElement | null>(null);
  const source = tracking?.source;
  const keyword = tracking?.keyword;
  const city = tracking?.city;

  useEffect(() => {
    const node = ref.current;
    if (!node || !businessId) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        trackListingImpression(
          {
            businessId,
            rankPosition,
            source,
            keyword,
            city,
          },
          tracking
        );
        observer.disconnect();
      },
      { threshold: 0.55, rootMargin: "0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [businessId, source, keyword, city, rankPosition, tracking]);

  return ref;
}
