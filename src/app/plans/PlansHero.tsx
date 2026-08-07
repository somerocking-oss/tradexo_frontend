"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Crown, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import type { PricingSettings } from "@/lib/cms";

interface PlansHeroProps {
  title?: string;
  subtitle?: string;
  stats?: Array<{ value?: string; label?: string }>;
}

export function PlansHero({
  title = "Simple, Transparent Pricing",
  subtitle = "Get featured visibility, priority ranking, lead insights, and tools to convert more enquiries — upgrade in minutes.",
  stats = [
    { value: "3×", label: "More profile views" },
    { value: "Top", label: "Search placement" },
    { value: "Secure", label: "Razorpay checkout" },
  ],
}: PlansHeroProps) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="relative overflow-hidden border-b border-neutral-100 bg-white px-4 py-16 sm:px-6 sm:py-20">
      {/* Subtle radial gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,108,0,0.06),transparent)]"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1 text-xs text-neutral-400">
          <Link href="/" className="transition-colors hover:text-[#FF6C00]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          <span className="font-medium text-neutral-600">Plans &amp; Pricing</span>
        </nav>

        {/* Pill badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-semibold text-[#FF6C00]">
            <Crown className="h-3.5 w-3.5" aria-hidden />
            Featured visibility
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            More leads &amp; calls
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#16A34A]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Secure payments
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-600">{subtitle}</p>

        {/* Billing toggle */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                billing === "monthly"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                billing === "annual"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Annual
              <span className="rounded-full bg-[#FF6C00] px-2 py-0.5 text-xs font-bold text-white">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-100 bg-neutral-50 px-5 py-4 text-center transition-all duration-200 hover:border-[#FF6C00]/20 hover:shadow-sm"
            >
              <p className="text-2xl font-bold text-[#FF6C00]">{value}</p>
              <p className="mt-0.5 text-xs font-medium text-neutral-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="mt-6 flex items-center gap-2 text-xs text-neutral-400">
          <Zap className="h-3.5 w-3.5 text-[#FF6C00]" aria-hidden />
          Start free — upgrade anytime from your seller dashboard
        </p>
      </div>
    </div>
  );
}

export function plansHeroFromSettings(pricing?: PricingSettings) {
  return {
    title: pricing?.pageTitle || "Simple, Transparent Pricing",
    subtitle:
      pricing?.pageSubtitle ||
      "Get featured visibility, priority ranking, lead insights, and tools to convert more enquiries — upgrade in minutes.",
  };
}
