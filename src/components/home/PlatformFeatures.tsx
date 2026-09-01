"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Inbox,
  LocateFixed,
  MapPin,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeatureItem, FeaturesSection } from "@/lib/cms";

const ICON_MAP: Record<string, LucideIcon> = {
  LocateFixed,
  FileText,
  ShieldCheck,
  MapPin,
  Inbox,
  Wallet,
  Star,
  Users,
  TrendingUp,
  Zap,
};

const DEFAULT_FEATURES: FeaturesSection = {
  title: "Everything Built In",
  subtitle: "Local discovery + B2B sourcing — one platform, ready to use",
  items: [
    {
      title: "Near Me + Map Search",
      description: "Map-based search. Find suppliers around your GPS location with radius filter.",
      href: "/listings/near-me/map",
      cta: "Open Map Search",
      icon: "LocateFixed",
      color: "from-[#ff6c00] to-[#ff8533]",
    },
    {
      title: "Compare Supplier Quotes",
      description: "Buyer quotes inbox — compare price, MOQ & delivery side-by-side.",
      href: "/profile/requirements",
      cta: "My Quotes Inbox",
      icon: "FileText",
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Product Catalogue + Bulk Quotes",
      description: "Browse seller products with MOQ & price. One-click quote on each item.",
      href: "/listings?sellerIntent=products",
      cta: "Browse Products",
      icon: "ShieldCheck",
      color: "from-violet-500 to-purple-600",
    },
    {
      title: "Reviews & Ratings",
      description: "Read and write reviews on business profiles. Build trust with verified feedback.",
      href: "/listings",
      cta: "Find Businesses",
      icon: "MapPin",
      color: "from-rose-500 to-pink-600",
    },
    {
      title: "Seller Leads + Wallet",
      description: "Seller leads inbox. Unlock RFQ contacts with wallet credits or pay ₹49 per lead.",
      href: "/dashboard/leads",
      cta: "Open Leads Inbox",
      icon: "Inbox",
      color: "from-emerald-500 to-teal-600",
    },
  ],
  highlightCard: {
    title: "Wallet Top-up",
    description: "Add balance to unlock buyer contacts instantly — Razorpay secure checkout.",
    href: "/dashboard/wallet",
    cta: "Open Wallet",
  },
};

function getIcon(name?: string) {
  return ICON_MAP[name || "FileText"] || FileText;
}

export function PlatformFeatures({ section }: { section?: FeaturesSection }) {
  const config = {
    title: section?.title || DEFAULT_FEATURES.title,
    subtitle: section?.subtitle || DEFAULT_FEATURES.subtitle,
    items: section?.items?.length ? section.items : DEFAULT_FEATURES.items!,
    highlightCard: section?.highlightCard || DEFAULT_FEATURES.highlightCard,
  };

  return (
    <section className="home-section-muted px-3 py-14 sm:px-4">
      <div className="mx-auto max-w-8xl">
        <div className="mb-10 text-center">
          <span className="home-eyebrow mx-auto before:hidden sm:before:inline-block">Features</span>
          <h2 className="home-section-title">{config.title}</h2>
          <p className="home-section-subtitle mx-auto mt-1 max-w-2xl">{config.subtitle}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {config.items.map((feature: FeatureItem) => {
            const Icon = getIcon(feature.icon);
            return (
              <Link
                key={`${feature.title}-${feature.href}`}
                href={feature.href || "#"}
                className="home-card group flex flex-col p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-neutral-900 group-hover:text-[#ff6c00]">{feature.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{feature.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neutral-700 group-hover:text-black">
                  {feature.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}

          {config.highlightCard?.title && (
            <div className="home-card flex flex-col border-dashed border-[#ff6c00]/30 bg-[#f0f0f0]/50 p-6 sm:col-span-2 lg:col-span-1">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff6c00] text-white">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{config.highlightCard.title}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-600">{config.highlightCard.description}</p>
              {config.highlightCard.href && (
                <Button
                  href={config.highlightCard.href}
                  size="sm"
                  variant="outline"
                  className="mt-4 w-full border-[#d4d4d4] bg-white"
                >
                  {config.highlightCard.cta || "Learn More"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
