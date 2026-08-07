"use client";

import {
  BadgeCheck,
  MessageSquare,
  Search,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { HowItWorksSection } from "@/lib/cms";

const ICON_MAP: Record<string, LucideIcon> = {
  Search,
  MessageSquare,
  BadgeCheck,
  TrendingUp,
};

const DEFAULT_SECTION: HowItWorksSection = {
  eyebrow: "How it works",
  title: "From Search to Sale in 4 Steps",
  subtitle:
    "A complete B2B + local discovery flow — built for buyers and sellers across India.",
  items: [
    {
      step: "01",
      icon: "Search",
      title: "Search & Discover",
      description:
        "Find verified suppliers, manufacturers, wholesalers and local service providers by category, city or keyword.",
    },
    {
      step: "02",
      icon: "MessageSquare",
      title: "Compare & Connect",
      description:
        "View ratings, MOQ, catalogue, turnover and contact details. Call directly or send a quote request instantly.",
    },
    {
      step: "03",
      icon: "BadgeCheck",
      title: "Get Verified Leads",
      description:
        "Businesses receive qualified buyer enquiries in their seller portal. Track status from new to converted.",
    },
    {
      step: "04",
      icon: "TrendingUp",
      title: "Grow Your Business",
      description:
        "Complete KYC, upload catalogue and boost profile score to rank higher and receive more leads.",
    },
  ],
};

function resolveIcon(name?: string): LucideIcon {
  return (name && ICON_MAP[name]) || Search;
}

export function HowItWorks({ section }: { section?: HowItWorksSection }) {
  const data = {
    eyebrow: section?.eyebrow || DEFAULT_SECTION.eyebrow,
    title: section?.title || DEFAULT_SECTION.title,
    subtitle: section?.subtitle || DEFAULT_SECTION.subtitle,
    items: section?.items?.length ? section.items : DEFAULT_SECTION.items!,
  };

  return (
    <section
      className="bg-white px-4 py-14 sm:px-6 sm:py-16"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-[#F0F0F0] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6C00]" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6C00]">
              {data.eyebrow}
            </span>
          </div>
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl"
          >
            {data.title}
          </h2>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-[#737373]">
            {data.subtitle}
          </p>
        </div>

        {/* Timeline steps */}
        <div className="relative">
          {/* Connecting dotted line — desktop only */}
          <div
            className="absolute left-0 right-0 top-[44px] hidden h-px lg:block"
            aria-hidden
          >
            <div className="mx-auto max-w-5xl">
              <div
                className="mx-[calc(12.5%-20px)] h-px"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, #D4D4D4 0px, #D4D4D4 6px, transparent 6px, transparent 14px)",
                }}
              />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {data.items.map((item, index) => {
              const Icon = resolveIcon(item.icon);
              const step = item.step || String(index + 1).padStart(2, "0");
              const isLast = index === data.items.length - 1;

              return (
                <div
                  key={`${step}-${item.title}-${index}`}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Step icon block */}
                  <div className="relative mb-4 flex flex-col items-center">
                    <div className="relative z-10 flex h-[88px] w-[88px] flex-col items-center justify-center">
                      {/* Hover glow ring */}
                      <div
                        className="absolute inset-0 rounded-full bg-[#FF6C00]/0 transition-all duration-300 group-hover:bg-[#FF6C00]/8 group-hover:scale-110"
                        aria-hidden
                      />
                      {/* Step number badge */}
                      <span className="absolute -right-1 -top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6C00] text-[9px] font-black tracking-tight text-white shadow-sm ring-2 ring-white">
                        {step}
                      </span>
                      {/* Icon container */}
                      <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-[#E8E8E8] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.07)] transition-all duration-200 group-hover:border-[#FF6C00]/40 group-hover:shadow-[0_4px_16px_rgba(255,108,0,0.16)]">
                        <Icon
                          className="h-6 w-6 text-[#404040] transition-colors duration-200 group-hover:text-[#FF6C00]"
                          aria-hidden
                        />
                      </div>
                    </div>

                    {/* Vertical connector for mobile/tablet (between steps) */}
                    {!isLast && (
                      <div
                        className="absolute left-1/2 top-full mt-0 h-10 w-px -translate-x-1/2 lg:hidden"
                        aria-hidden
                        style={{
                          background:
                            "repeating-linear-gradient(180deg, #D4D4D4 0px, #D4D4D4 4px, transparent 4px, transparent 8px)",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col items-center">
                    <h3 className="text-base font-semibold leading-snug text-[#171717]">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-[#737373]">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
