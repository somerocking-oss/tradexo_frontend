"use client";

import { useEffect } from "react";
import { trackProfileView } from "@/lib/analytics/track";

function isInternalProfileReferrer() {
  if (typeof document === "undefined" || typeof window === "undefined") return false;
  const ref = document.referrer;
  if (!ref || !ref.startsWith(window.location.origin)) return false;

  try {
    const path = new URL(ref).pathname;
    return (
      path === "/" ||
      path.startsWith("/listings") ||
      path.startsWith("/browse") ||
      path.startsWith("/business")
    );
  } catch {
    return false;
  }
}

export function BusinessPageAnalytics({
  businessId,
  city,
}: {
  businessId: string;
  city?: string;
}) {
  useEffect(() => {
    if (isInternalProfileReferrer()) return;
    trackProfileView(businessId, { source: "seo", city });
  }, [businessId, city]);

  return null;
}
