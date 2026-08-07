"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/constants";
import { trackShareClick } from "@/lib/analytics/track";
import { getWhatsAppUrl } from "@/lib/utils";

export function ShareBusinessButton({
  businessId,
  businessName,
  city,
}: {
  businessId: string;
  businessName: string;
  city?: string;
}) {
  const url = `${SITE_URL}/business/${businessId}`;
  const text = `Check out ${businessName}${city ? ` in ${city}` : ""} on Tradexo: ${url}`;

  const handleShare = async () => {
    trackShareClick(businessId, { source: "seo", city });

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: businessName, text, url });
        return;
      } catch {
        // user cancelled or unsupported
      }
    }

    const whatsapp = getWhatsAppUrl(undefined, text);
    if (whatsapp) {
      window.open(whatsapp, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      window.alert("Link copied to clipboard!");
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleShare}>
      <Share2 className="h-4 w-4" /> Share
    </Button>
  );
}
