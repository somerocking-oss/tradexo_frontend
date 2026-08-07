"use client";

import dynamic from "next/dynamic";
import type { Business } from "@/types";

const TopRatedCarousel = dynamic(
  () => import("./HomeTopRatedCarousel").then((m) => ({ default: m.HomeTopRatedCarousel })),
  { ssr: false, loading: () => null }
);

const NewsletterBar = dynamic(
  () => import("./HomeNewsletterBar").then((m) => ({ default: m.HomeNewsletterBar })),
  { ssr: false, loading: () => null }
);

export function DynamicTopRatedCarousel({ businesses }: { businesses: Business[] }) {
  return <TopRatedCarousel businesses={businesses} />;
}

export function DynamicNewsletterBar() {
  return <NewsletterBar />;
}
