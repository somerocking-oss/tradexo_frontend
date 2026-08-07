import type { PricingSettings } from "@/lib/cms";

export function plansHeroFromSettings(pricing?: PricingSettings) {
  return {
    title: pricing?.pageTitle || "Premium Plans for Growing Businesses",
    subtitle:
      pricing?.pageSubtitle ||
      "Get featured visibility, priority ranking, lead insights, and tools to convert more enquiries — upgrade in minutes.",
  };
}
