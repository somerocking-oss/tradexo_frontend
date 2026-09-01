"use client";

import {
  Shield,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { TrustStat } from "@/lib/cms";

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Shield,
  TrendingUp,
  Zap,
};

const DEFAULT_STATS: TrustStat[] = [
  { value: "10,000+", label: "Business Listings", icon: "Users" },
  { value: "Verified", label: "Trusted Badges", icon: "Shield" },
  { value: "50,000+", label: "Leads Generated", icon: "TrendingUp" },
  { value: "400+", label: "Cities Covered", icon: "Zap" },
];

const FALLBACK_ICONS = [Users, Shield, TrendingUp, Zap];

function resolveIcon(name?: string, index = 0): LucideIcon {
  if (name && ICON_MAP[name]) return ICON_MAP[name];
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

export function TrustBar({ stats }: { stats?: TrustStat[] }) {
  const items = stats?.length ? stats : DEFAULT_STATS;

  return (
    <section className="home-section-dark border-y border-black/20 py-8">
      <div className="mx-auto grid max-w-8xl grid-cols-2 gap-6 px-3 sm:grid-cols-4 sm:gap-8 sm:px-4">
        {items.map((item, index) => {
          const Icon = resolveIcon(item.icon, index);
          return (
            <div key={`${item.label}-${index}`} className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#ffb366] ring-1 ring-white/10">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-white sm:text-2xl">{item.value}</p>
                <p className="text-xs text-neutral-400 sm:text-sm">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
