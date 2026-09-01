"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { HOME_IMAGES } from "@/lib/home-images";
import { TrustStatsBar } from "@/components/common/TrustStatsBar";
import type { DisplayStat } from "@/lib/platform-stats";

const PERKS = ["Free Business Listing", "WhatsApp & Call Leads", "Google Friendly Profile"];

const FLOATING = [
  { icon: TrendingUp, label: "Get More Leads", color: "bg-orange-50 text-orange-600" },
  { icon: ShieldCheck, label: "Build Trust", color: "bg-blue-50 text-blue-600" },
  { icon: Zap, label: "Grow Business", color: "bg-green-50 text-green-600" },
];

export function RegisterBusinessHero({
  businessCountLabel,
  trustStats = [],
}: {
  businessCountLabel?: string | null;
  trustStats?: DisplayStat[];
}) {
  const featureCards = trustStats.slice(0, 4).map((stat) => ({
    icon:
      stat.icon === "Shield"
        ? ShieldCheck
        : stat.icon === "TrendingUp"
          ? TrendingUp
          : stat.icon === "Zap"
            ? Zap
            : stat.icon === "Clock"
              ? Clock
              : stat.icon === "Building2"
                ? Building2
                : Users,
    value: stat.value,
    label: stat.label,
  }));

  return (
    <div className="relative overflow-hidden border-b border-neutral-400 bg-gradient-to-br from-[#f0f0f0] via-white to-[#f8fafc]">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#ff6c00]/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#ff6c00]/8 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1 text-xs text-[#888]">
          <Link href="/" className="transition hover:text-[#ff6c00]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          <span className="font-medium text-[#555]">Register Business</span>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#111] sm:text-4xl lg:text-[2.75rem]">
              Register Your Business
              <br />
              <span className="text-[#ff6c00]">&amp; Grow with Tradexo</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#666]">
              {businessCountLabel ? (
                <>
                  Join{" "}
                  <strong className="font-semibold text-[#333]">{businessCountLabel} businesses</strong>{" "}
                  already getting quality leads.
                </>
              ) : (
                "Join businesses already getting quality leads on Tradexo."
              )}{" "}
              Create your free profile in minutes and start receiving buyer enquiries today.
            </p>

            {featureCards.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {featureCards.map(({ icon: Icon, value, label }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-neutral-400 bg-white px-3 py-3 text-center shadow-sm"
                  >
                    <Icon className="mx-auto h-5 w-5 text-[#ff6c00]" aria-hidden />
                    <p className="mt-1.5 text-base font-bold text-[#111]">{value}</p>
                    <p className="text-[10px] leading-tight text-[#888] sm:text-[11px]">{label}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <ul className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5">
              {PERKS.map((perk) => (
                <li
                  key={perk}
                  className="flex items-center gap-2 text-sm font-medium text-[#333]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
              <Image
                src={HOME_IMAGES.registerSeller}
                alt="Business owner receiving leads on Tradexo"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 90vw, 45vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            <div className="absolute -right-2 top-4 hidden flex-col gap-2 sm:flex lg:-right-4">
              {FLOATING.map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 rounded-xl border border-white/80 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-sm ${color}`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterTrustStatsBar({ stats = [] }: { stats?: DisplayStat[] }) {
  return <TrustStatsBar stats={stats} variant="inline" />;
}
