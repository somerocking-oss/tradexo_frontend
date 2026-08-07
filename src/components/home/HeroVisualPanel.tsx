"use client";

import Image from "next/image";
import {
  BadgeCheck,
  Box,
  Lock,
  TrendingUp,
  Users,
  UserCheck,
} from "lucide-react";
import { HOME_IMAGES } from "@/lib/home-images";
import type { Category } from "@/types";

const STAT_PILLS = [
  { label: "Suppliers", value: "10,000+", icon: Users, color: "text-neutral-900" },
  { label: "Listings", value: "1M+", icon: Box, color: "text-emerald-600" },
  { label: "Buyers", value: "100K+", icon: UserCheck, color: "text-[#ff6c00]" },
];

type HeroVisualPanelProps = {
  categories?: Category[];
};

export function HeroVisualPanel({ categories: _categories = [] }: HeroVisualPanelProps) {
  return (
    <div className="hero-visual-panel relative mx-auto w-full max-w-[560px] lg:max-w-none">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#f8fafc] via-white to-[#f0f0f0]" aria-hidden />
      <div
        className="absolute inset-0 rounded-3xl opacity-[0.35] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${HOME_IMAGES.indiaNetwork}')` }}
        aria-hidden
      />

      <div className="relative rounded-3xl border border-[#e8e8e8] bg-white/60 p-4 shadow-xl shadow-neutral-200/50 backdrop-blur-sm sm:p-5">
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {STAT_PILLS.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="flex min-w-[96px] flex-1 items-center gap-2 rounded-xl border border-white bg-neutral-950/95 px-3 py-2 shadow-sm"
            >
              <Icon className={`h-4 w-4 shrink-0 ${color}`} aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-bold leading-none text-neutral-900">{value}</p>
                <p className="mt-0.5 truncate text-[10px] text-neutral-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-neutral-400 bg-gradient-to-b from-white to-[#fafafa]">
          <Image
            src={HOME_IMAGES.hero}
            alt="Connect with verified B2B suppliers across India"
            width={800}
            height={520}
            className="h-[180px] w-full object-cover object-center sm:h-[220px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
        </div>

        <div className="absolute -right-1 top-[38%] hidden w-[148px] rounded-xl border border-neutral-400 bg-white p-3 shadow-lg lg:block xl:-right-3">
          <p className="text-[10px] font-semibold text-neutral-500">Business Growth</p>
          <p className="mt-1 text-xs text-neutral-600">Leads Received</p>
          <p className="text-lg font-bold text-neutral-900">12,540</p>
          <p className="mt-0.5 text-[10px] font-semibold text-emerald-600">+18.6%</p>
          <div className="mt-2 flex h-8 items-end gap-0.5">
            {[35, 50, 42, 68, 58, 82, 75].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm bg-[#ff6c00]/80"
                style={{ height: `${h}%` }}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <div className="absolute -right-1 bottom-8 hidden w-[148px] rounded-xl border border-neutral-400 bg-white p-3 shadow-lg lg:block xl:-right-3">
          {[
            { icon: BadgeCheck, label: "Verified Suppliers" },
            { icon: TrendingUp, label: "Genuine Leads" },
            { icon: Lock, label: "Safe & Secure" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 py-1">
              <Icon className="h-3.5 w-3.5 shrink-0 text-[#ff6c00]" aria-hidden />
              <span className="text-[10px] font-medium text-neutral-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
