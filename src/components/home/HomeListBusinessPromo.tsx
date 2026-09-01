"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe2, Package, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HOME_IMAGES } from "@/lib/home-images";
import { SITE_NAME } from "@/lib/constants";
import type { DisplayStat } from "@/lib/platform-stats";
import type { LucideIcon } from "lucide-react";

const STAT_ICONS: Record<string, LucideIcon> = {
  TrendingUp,
  Zap,
  Globe2,
  Package,
  Users,
};

function statIcon(name?: string): LucideIcon {
  return (name && STAT_ICONS[name]) || Users;
}

const BENEFITS = [
  "Free business listing — live in minutes",
  "Receive verified buyer enquiries directly",
  "Premium plans for top search placement",
];

export function HomeListBusinessPromo({
  stats = [],
  businessCountLabel,
}: {
  stats?: DisplayStat[];
  businessCountLabel?: string | null;
}) {
  return (
    <section
      className="relative overflow-hidden border-y border-sky-200 bg-sky-50 px-3 py-14 sm:px-4 sm:py-16"
      aria-labelledby="promo-heading"
    >
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white opacity-60" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white opacity-40" />
      </div>

      <div className="relative mx-auto max-w-8xl">
        {/* Split layout */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: text content */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6C00]" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6C00]">
                For Businesses
              </span>
            </div>

            <h2
              id="promo-heading"
              className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[2.625rem] lg:leading-[1.12]"
            >
              List Your Business &amp;{" "}
              <span className="text-[#FF6C00]">Grow Across India</span>
            </h2>

            <p className="mt-4 text-[1.0625rem] leading-relaxed text-[#525252]">
              Join {SITE_NAME}
              {businessCountLabel ? (
                <>
                  {" "}with{" "}
                  <strong className="font-semibold text-[#333]">{businessCountLabel} businesses</strong>
                </>
              ) : null}{" "}
              to reach buyers nationwide. Free listing, verified profile, RFQ inbox,
              and premium visibility plans to grow your revenue.
            </p>

            {/* Feature bullets */}
            <ul className="mt-7 space-y-3.5" role="list">
              {BENEFITS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#404040]">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6C00]"
                    aria-hidden
                  />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                href="/register-business"
                size="lg"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#FF6C00] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(255,108,0,0.28)] transition-all duration-200 ease-out hover:bg-[#E86200] hover:shadow-[0_4px_20px_rgba(255,108,0,0.38)] active:scale-[0.98]"
              >
                List Your Business Free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden />
              </Button>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#525252] transition-colors duration-200 ease-out hover:text-[#FF6C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30 rounded"
              >
                View pricing plans
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Right: image with decorative frame */}
          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            {/* Decorative frame */}
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-sky-100 to-white opacity-70" aria-hidden />
            {/* Subtle grid pattern */}
            <div
              className="absolute -inset-3 rounded-3xl opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(#FF6C00 1px, transparent 1px), linear-gradient(90deg, #FF6C00 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl border border-[#E5E5E5] shadow-[0_20px_40px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.05)]">
              <Image
                src={HOME_IMAGES.sellerLeads}
                alt="Grow your business with Tradexo"
                width={640}
                height={480}
                className="h-auto w-full object-cover"
              />
              {stats.length > 0 ? (
              <div className="absolute bottom-4 left-4 rounded-xl border border-white/20 bg-white/96 px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.10)] backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A3A3A3]">Live on platform</p>
                <p className="mt-0.5 text-lg font-bold text-[#171717]">
                  {stats[0]?.value}{" "}
                  <span className="text-sm font-medium text-[#525252]">{stats[0]?.label?.toLowerCase()}</span>
                </p>
              </div>
              ) : null}
            </div>
          </div>
        </div>

        {stats.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.slice(0, 4).map(({ icon: iconName, value, label }) => {
            const Icon = statIcon(iconName);
            return (
            <div
              key={label}
              className="flex flex-col items-center gap-2.5 rounded-xl border border-[#F0F0F0] bg-[#FAFAFA] px-4 py-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#FF6C00]/20 hover:bg-white sm:flex-row sm:gap-3 sm:px-5 sm:text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF6C00]/10 text-[#FF6C00]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xl font-bold tracking-tight text-[#171717]">{value}</p>
                <p className="mt-0.5 text-[11px] font-medium text-[#737373]">{label}</p>
              </div>
            </div>
            );
          })}
        </div>
        ) : null}
      </div>
    </section>
  );
}
