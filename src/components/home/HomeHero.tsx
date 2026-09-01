"use client";

import { useState } from "react";
import Link from "next/link";
import { HeroSearch } from "@/components/home/HeroSearch";
import { Reveal } from "@/components/ui/Reveal";
import { buildListingsUrl } from "@/lib/listings-url";
import { SITE_NAME } from "@/lib/constants";
import {
  ArrowRight,
  BadgeCheck,
  Box,
  FileText,
  Headphones,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type { Category } from "@/types";

const FLOW_NODES = [
  { label: "Buyer", icon: Users, position: "top-0 left-0" },
  { label: "RFQ / Leads", icon: FileText, position: "top-0 left-1/2 -translate-x-1/2" },
  { label: "Supplier", icon: BadgeCheck, position: "top-0 right-0" },
  { label: "Products", icon: Box, position: "bottom-0 left-0" },
  { label: "Verified Businesses", icon: ShieldCheck, position: "bottom-0 right-0" },
];

type HomeHeroProps = {
  badgeText?: string;
  title?: React.ReactNode;
  subtitle?: string;
  categories?: Category[];
  popularSearches?: string[];
  verifiedCountLabel?: string | null;
  buyLabel?: string;
  sellLabel?: string;
  sellPitchTitle?: string;
  sellPitchSubtitle?: string;
  sellCtaLabel?: string;
  sellCtaHref?: string;
  sellBadgeText?: string;
};

export function HomeHero({
  badgeText,
  title,
  subtitle,
  categories = [],
  popularSearches = [],
  verifiedCountLabel,
  buyLabel = "I want to Buy",
  sellLabel = "I want to Sell",
  sellPitchTitle = "1.2L+ buyers search Tradexo every month — is your business listed?",
  sellPitchSubtitle = "Create a free verified profile and start receiving leads in minutes.",
  sellCtaLabel = "List Your Business Free",
  sellCtaHref = "/register-business",
  sellBadgeText = "Free forever · No credit card",
}: HomeHeroProps) {
  const [intent, setIntent] = useState<"buy" | "sell">("buy");

  return (
    <section
      className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-[#FFF7ED] via-white to-[#EFF6FF]"
      aria-label="Hero"
    >
      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#FF6C00]/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-[#FF6C00]/[0.04] blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-8xl px-3 py-10 sm:px-4 sm:py-12 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Left column — copy + search */}
          <div className="min-w-0">
            {/* Badge chip */}
            {badgeText ? (
              <Reveal>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFD9B0] bg-white px-4 py-1.5 shadow-sm">
                  <span
                    className="relative flex h-2 w-2"
                    aria-hidden
                  >
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF6C00] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF6C00]" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#E86200]">
                    {badgeText}
                  </span>
                </div>
              </Reveal>
            ) : null}

            {/* Heading */}
            <Reveal delay={60}>
              <h1 className="text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-neutral-900 sm:text-[3rem] lg:text-[3.125rem]">
                {title ?? (
                  <>
                    India&apos;s Trusted
                    <br className="hidden sm:block" />
                    {" "}
                    <span className="text-[#FF6C00]">B2B Marketplace</span>
                  </>
                )}
              </h1>
            </Reveal>

            {/* Subtitle */}
            <Reveal delay={120}>
              <p className="mt-4 max-w-lg text-[1.0625rem] leading-relaxed text-neutral-600 sm:text-lg">
                {subtitle ??
                  `Find verified manufacturers, suppliers & service providers. Compare quotations, connect directly and grow on ${SITE_NAME}.`}
              </p>
            </Reveal>

            {/* Buy / Sell intent toggle — sliding pill background */}
            <Reveal delay={180}>
              <div className="relative mt-6 inline-flex w-full max-w-sm rounded-full border border-neutral-200 bg-white p-1 shadow-sm sm:w-auto">
                <span
                  className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#FF6C00] shadow-sm transition-transform duration-300 ease-out"
                  style={{ transform: intent === "sell" ? "translateX(calc(100% + 4px))" : "translateX(0)" }}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => setIntent("buy")}
                  className={`relative z-10 flex-1 whitespace-nowrap rounded-full px-3 py-2 text-center text-sm font-semibold transition-colors duration-200 sm:px-5 ${
                    intent === "buy" ? "text-white" : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {buyLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setIntent("sell")}
                  className={`relative z-10 flex-1 whitespace-nowrap rounded-full px-3 py-2 text-center text-sm font-semibold transition-colors duration-200 sm:px-5 ${
                    intent === "sell" ? "text-white" : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {sellLabel}
                </button>
              </div>
            </Reveal>

            {/* Search bar (Buy) or seller CTA (Sell) — Reveal key={intent} replays
                the fade/slide-in whenever the toggle switches branches */}
            {intent === "buy" ? (
              <Reveal key="buy" variant="fade" className="mt-4 max-w-2xl">
                <div className="overflow-hidden rounded-xl border-2 border-neutral-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200 focus-within:border-[#FF6C00] focus-within:shadow-[0_4px_24px_rgba(255,108,0,0.12)]">
                  <HeroSearch layout="wireframe" categories={categories} />
                </div>
              </Reveal>
            ) : (
              <Reveal key="sell" variant="fade" className="mt-4 max-w-2xl rounded-xl border-2 border-[#FF6C00]/25 bg-[#FFF3E8] p-5">
                <p className="text-base font-bold text-neutral-900">
                  {sellPitchTitle}
                </p>
                <p className="mt-1.5 text-sm text-neutral-600">
                  {sellPitchSubtitle}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href={sellCtaHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6C00] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,108,0,0.3)] transition-all duration-200 ease-out hover:bg-[#E86200] active:scale-[0.98]"
                  >
                    {sellCtaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  {sellBadgeText ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#FF6C00]" aria-hidden />
                    {sellBadgeText}
                  </span>
                  ) : null}
                </div>
              </Reveal>
            )}

            {/* Popular searches */}
            {intent === "buy" && popularSearches.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Popular:
                </span>
                {popularSearches.slice(0, 6).map((term) => (
                  <Link
                    key={term}
                    href={buildListingsUrl({ keyword: term })}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm transition-all duration-200 ease-out hover:border-[#FF6C00]/50 hover:bg-[#FFF3E8] hover:text-[#E86200] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile-only trust strip — the buyer/supplier illustration is
                lg-only, so mobile gets a compact equivalent instead of nothing */}
            {verifiedCountLabel ? (
              <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm lg:hidden">
                <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
                </span>
                <span className="text-xs font-semibold text-neutral-700">{verifiedCountLabel}</span>
                <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#FF6C00]" aria-hidden />
                  Buyer ↔ Supplier network
                </span>
              </div>
            ) : null}
          </div>

          {/* Right column — buyer → supplier flow illustration */}
          <Reveal
            variant="fade"
            delay={220}
            className="relative mx-auto hidden aspect-[4/3] w-full max-w-xl lg:flex lg:max-w-none lg:items-center lg:justify-center"
          >
            {/* Connector lines */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 440 330"
              fill="none"
              aria-hidden
            >
              <path d="M75 50 L165 50 L220 115" stroke="#FF6C00" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.55" />
              <path d="M365 50 L275 50 L220 115" stroke="#FF6C00" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.55" />
              <path d="M220 175 L110 270" stroke="#FF6C00" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.55" />
              <path d="M220 175 L330 270" stroke="#FF6C00" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.55" />
            </svg>

            {/* Center brand card */}
            <div className="relative z-10 flex h-32 w-52 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.10)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_48px_rgba(0,0,0,0.14)]">
              <span className="text-xl font-extrabold tracking-tight text-neutral-900">
                Trade<span className="text-[#FF6C00]">XO</span>
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                B2B Marketplace
              </span>
            </div>

            {/* Flow nodes */}
            {FLOW_NODES.map(({ label, icon: Icon, position }, index) => (
              <div
                key={label}
                className={`absolute z-10 flex flex-col items-center gap-2 ${position}`}
              >
                <span
                  className="animate-float flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-lg transition-transform duration-300 ease-out hover:scale-110 hover:shadow-xl"
                  style={{ animationDelay: `${index * 0.4}s` }}
                >
                  <Icon className="h-6 w-6 text-[#FF6C00]" aria-hidden />
                </span>
                <span className="whitespace-nowrap rounded-md bg-white/80 px-1.5 text-xs font-semibold text-neutral-700">{label}</span>
              </div>
            ))}

            {verifiedCountLabel ? (
              <div className="absolute -bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                <span className="relative flex h-2.5 w-2.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
                </span>
                <span className="text-xs font-semibold text-[#404040]">
                  {verifiedCountLabel}
                </span>
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function HomeHeroStatsBar({
  stats = [],
}: {
  stats?: Array<{ value: string; label: string; icon?: string }>;
}) {
  if (!stats.length) return null;

  return (
    <div className="border-b border-[#1F3A63] bg-[#0F1E3D]">
      <div className="mx-auto max-w-8xl px-3 sm:px-4">
        <div className="grid grid-cols-2 divide-x divide-[#1F3A63] sm:grid-cols-5">
          {stats.slice(0, 4).map(({ icon: iconName, value, label }) => {
            const Icon =
              iconName === "TrendingUp"
                ? TrendingUp
                : iconName === "Zap"
                  ? Zap
                  : iconName === "Headphones"
                    ? Headphones
                    : Users;
            return (
              <div
                key={label}
                className="flex items-center justify-center gap-3 px-3 py-4 sm:px-4 sm:py-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-[#FF6C00]" aria-hidden />
                </span>
                <div>
                  <p className="text-base font-bold leading-none text-white">{value}</p>
                  <p className="mt-0.5 text-xs font-medium text-[#B7C3DD]">{label}</p>
                </div>
              </div>
            );
          })}
          <div className="col-span-2 flex items-center justify-center gap-3 px-3 py-4 sm:col-span-1 sm:px-4 sm:py-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck className="h-4 w-4 text-[#FF6C00]" aria-hidden />
            </span>
            <div>
              <p className="text-base font-bold leading-none text-white">GST</p>
              <p className="mt-0.5 text-xs font-medium text-[#B7C3DD]">Verified Businesses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
