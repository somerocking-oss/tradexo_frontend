"use client";

import {
  Globe,
  Headphones,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { WhyChooseUsSection } from "@/lib/cms";

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Zap,
  Globe,
  Headphones,
};

const DEFAULT_SECTION: WhyChooseUsSection = {
  eyebrow: "Why Tradexo",
  title: "Built for Buyers & Sellers — For the Modern Web",
  subtitle:
    "Whether you're a buyer looking for the best supplier or a business owner wanting more leads — our platform connects both sides with trust and speed.",
  bulletPoints: [
    "Free business listing",
    "Direct call & WhatsApp",
    "B2B catalogue & MOQ",
    "Premium visibility plans",
  ],
  items: [
    {
      icon: "Shield",
      title: "Verified Business Profiles",
      description: "KYC documents, GST/PAN verification and profile score for trusted listings.",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: "Zap",
      title: "Instant Lead Delivery",
      description: "Buyers send quote requests; sellers get real-time notifications in their inbox.",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: "Globe",
      title: "Pan-India Coverage",
      description: "Discover businesses across 400+ cities — from local plumbers to B2B manufacturers.",
      color: "bg-[#e8e8e8] text-[#ff6c00]",
    },
    {
      icon: "Headphones",
      title: "Dedicated Seller Portal",
      description: "Manage listings, KYC, catalogue, leads and profile score from one dashboard.",
      color: "bg-violet-50 text-violet-600",
    },
  ],
};

function resolveIcon(name?: string): LucideIcon {
  return (name && ICON_MAP[name]) || Shield;
}

export function WhyChooseUs({ section }: { section?: WhyChooseUsSection }) {
  const data = {
    eyebrow: section?.eyebrow || DEFAULT_SECTION.eyebrow,
    title: section?.title || DEFAULT_SECTION.title,
    subtitle: section?.subtitle || DEFAULT_SECTION.subtitle,
    bulletPoints: section?.bulletPoints?.length
      ? section.bulletPoints
      : DEFAULT_SECTION.bulletPoints!,
    items: section?.items?.length ? section.items : DEFAULT_SECTION.items!,
  };

  return (
    <section className="home-section-soft px-3 py-16 sm:px-4">
      <div className="mx-auto max-w-8xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <span className="home-eyebrow">{data.eyebrow}</span>
            <h2 className="home-section-title mt-1">{data.title}</h2>
            <p className="home-section-subtitle mt-3 text-base sm:text-lg">{data.subtitle}</p>
            <ul className="mt-6 space-y-3">
              {data.bulletPoints.map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {data.items.map((feature, index) => {
              const Icon = resolveIcon(feature.icon);
              const color = feature.color || "bg-neutral-100 text-neutral-800";
              return (
                <div
                  key={`${feature.title}-${index}`}
                  className="home-card p-5"
                >
                  <div
                    className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
