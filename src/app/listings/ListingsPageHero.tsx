"use client";

import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  FileText,
  Headphones,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type Breadcrumb = { label: string; href?: string };

type TrustStatItem = { value: string; label: string; icon?: string };

const QUICK_ACTIONS = [
  { icon: FileText, label: "Post Requirement", href: "/post-requirement" },
  { icon: TrendingUp, label: "List Your Business", href: "/register-business" },
  { icon: BadgeCheck, label: "Verified Only", href: "/listings?isVerified=true" },
];

function resolveStatIcon(iconName?: string) {
  return iconName === "TrendingUp"
    ? TrendingUp
    : iconName === "Zap"
      ? Zap
      : iconName === "Headphones"
        ? Headphones
        : Users;
}

export function ListingsPageHero({
  pageTitle,
  pageSubtitle,
  breadcrumbs = [],
  compact = false,
  isFiltered = false,
  trustStats = [],
}: {
  pageTitle: string;
  pageSubtitle?: string;
  breadcrumbs?: Breadcrumb[];
  compact?: boolean;
  isFiltered?: boolean;
  trustStats?: TrustStatItem[];
}) {
  if (compact) {
    return (
      <div className="border-b border-neutral-400 bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-[#888]">
              {breadcrumbs.map((item, i) => (
                <span key={`${item.label}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-[#ff6c00]">{item.label}</Link>
                  ) : (
                    <span className="font-medium text-[#555]">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-xl font-bold text-[#111] sm:text-2xl">{pageTitle}</h1>
        </div>
      </div>
    );
  }

  if (isFiltered) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0B3B6F] via-[#0A3159] to-[#08284A]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff6c00]/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-white/5 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-white/60">
              {breadcrumbs.map((item, i) => (
                <span key={`${item.label}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-white">{item.label}</Link>
                  ) : (
                    <span className="font-medium text-white/85">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <h1 className="max-w-3xl text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
            {pageTitle}
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            {pageSubtitle ||
              "Discover verified businesses, compare quotes and grow your business faster."}
          </p>

          {trustStats.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {trustStats.slice(0, 4).map(({ icon: iconName, value, label }) => {
                const Icon = resolveStatIcon(iconName);
                return (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm sm:text-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#ff8533]" aria-hidden />
                    {value} {label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border-b border-neutral-400 bg-gradient-to-br from-[#f0f0f0] via-white to-[#f8fafc]">
      <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-[#ff6c00]/5 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-[#888]">
            {breadcrumbs.map((item, i) => (
              <span key={`${item.label}-${i}`} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />}
                {item.href ? (
                  <Link href={item.href} className="hover:text-[#ff6c00]">{item.label}</Link>
                ) : (
                  <span className="font-medium text-[#555]">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-[#111] sm:text-3xl lg:text-4xl">
              {pageTitle.includes("Across India") ? (
                <>
                  {pageTitle.split("Across India")[0]}
                  <span className="text-[#ff6c00]">Across India</span>
                  {pageTitle.split("Across India")[1]}
                </>
              ) : (
                pageTitle
              )}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#666] sm:text-base">
              {pageSubtitle ||
                "Discover verified businesses, compare quotes and grow your business faster."}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {QUICK_ACTIONS.map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3.5 py-2 text-xs font-semibold text-[#333] shadow-sm transition hover:border-[#ff6c00] hover:text-[#ff6c00] sm:text-sm"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[#ff6c00]" aria-hidden />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Live marketplace stat panel — replaces the generic stock photo */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3B6F] via-[#0A3159] to-[#08284A] p-6 shadow-xl sm:p-7">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ff6c00]/15 blur-2xl"
                aria-hidden
              />
              <div className="relative mb-5 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  Live on Tradexo
                </span>
              </div>

              {trustStats.length > 0 ? (
                <div className="relative grid grid-cols-2 gap-4">
                  {trustStats.slice(0, 4).map(({ icon: iconName, value, label }) => {
                    const Icon = resolveStatIcon(iconName);
                    return (
                      <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                        <Icon className="mb-2 h-4 w-4 text-[#ff8533]" aria-hidden />
                        <p className="text-xl font-extrabold text-white sm:text-2xl">{value}</p>
                        <p className="mt-0.5 text-xs text-white/65">{label}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="relative flex items-center gap-2 text-sm text-white/70">
                  <ShieldCheck className="h-4 w-4 text-[#ff8533]" aria-hidden />
                  Verified suppliers, manufacturers &amp; service providers across India.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
