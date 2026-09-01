"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Hotel,
  MessageSquare,
  Scale,
  Search,
  Truck,
  TrendingUp,
} from "lucide-react";
import type { HowItWorksSection } from "@/lib/cms";

const DEFAULT_STEPS = [
  { step: "01", icon: Search, title: "Search", desc: "Find products & suppliers by city or category" },
  { step: "02", icon: MessageSquare, title: "Compare", desc: "Review quotes, ratings & profiles" },
  { step: "03", icon: BadgeCheck, title: "Connect", desc: "Call, chat or send a direct RFQ" },
  { step: "04", icon: TrendingUp, title: "Grow", desc: "Close deals and scale your business" },
];

const TOP_SERVICES = [
  { label: "Packers & Movers", href: "/listings?keyword=packers", icon: Truck },
  { label: "Hotel & Restaurant", href: "/listings?keyword=restaurant", icon: Hotel },
  { label: "Travel Services", href: "/listings?keyword=travel", icon: Briefcase },
  { label: "Legal Services", href: "/listings?keyword=legal", icon: Scale },
];

export function HomeWorksAndServices({ section }: { section?: HowItWorksSection }) {
  const steps = section?.items?.length
    ? section.items.slice(0, 4).map((item, i) => ({
        step: item.step || String(i + 1).padStart(2, "0"),
        icon: Search,
        title: item.title || "",
        desc: item.description || "",
      }))
    : DEFAULT_STEPS;

  return (
    <section className="relative overflow-hidden bg-[#0F1E3D] px-3 py-14 sm:px-4 sm:py-16">
      {/* Top accent */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #FF6C00 30%, #FF6C00 70%, transparent 100%)",
          opacity: 0.35,
        }}
        aria-hidden
      />
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-8xl gap-10 lg:grid-cols-2 lg:gap-14">

        {/* Left — compact numbered steps */}
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FF6C00]/25 bg-[#FF6C00]/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6C00]" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6C00]">
              Platform Process
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Simple 4-Step Process
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8E8E93]">
            From discovery to deal — everything in one place.
          </p>

          <div className="mt-8 space-y-5">
            {steps.map(({ step, icon: Icon, title, desc }, index) => (
              <div key={`${step}-${title}`} className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FF6C00]/15 text-xs font-black text-[#FF6C00] ring-1 ring-[#FF6C00]/20">
                  {step || String(index + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#8E8E93]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — service category cards */}
        <div>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#2A4470] bg-[#16294D] px-3 py-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#B7C3DD]">
                  Browse
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Top Services</h2>
            </div>
            <Link
              href="/listings?sellerIntent=services"
              className="mb-1 inline-flex items-center gap-1 text-sm font-semibold text-[#FF6C00] transition hover:underline"
            >
              View All <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TOP_SERVICES.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col items-center rounded-xl border border-[#1F3A63] bg-[#16294D] p-5 text-center transition-all duration-200 hover:border-[#FF6C00]/40 hover:bg-[#1B3158]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6C00]/15 text-[#FF6C00] transition-colors duration-200 group-hover:bg-[#FF6C00]/22">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="mt-3 text-sm font-semibold text-[#E5E5E7] group-hover:text-white">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
