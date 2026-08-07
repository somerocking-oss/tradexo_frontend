import {
  Globe2,
  Headphones,
  Shield,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { DisplayStat } from "@/lib/platform-stats";

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  TrendingUp,
  Zap,
  Headphones,
  Shield,
  Globe2,
};

function resolveIcon(name?: string): LucideIcon {
  if (!name) return Users;
  return ICON_MAP[name] || Users;
}

type TrustStatsBarProps = {
  stats: DisplayStat[];
  variant?: "grid" | "inline" | "compact";
  className?: string;
};

export function TrustStatsBar({
  stats,
  variant = "grid",
  className = "",
}: TrustStatsBarProps) {
  if (!stats.length) return null;

  if (variant === "inline") {
    return (
      <div className={`border-b border-[#E5E5E5] bg-white ${className}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-3.5 sm:px-6">
          {stats.map(({ icon, value, label }) => {
            const Icon = resolveIcon(icon);
            return (
              <div key={label} className="flex items-center gap-2 text-xs font-medium text-[#555] sm:text-sm">
                <Icon className="h-4 w-4 shrink-0 text-[#888]" aria-hidden />
                <span>
                  <span className="font-bold text-[#111]">{value}</span> {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`}>
        {stats.map(({ icon, value, label }) => {
          const Icon = resolveIcon(icon);
          return (
            <div key={label} className="flex items-center gap-2 text-xs text-[#555] sm:text-sm">
              <Icon className="h-4 w-4 shrink-0 text-[#ff6c00]" aria-hidden />
              <span className="font-medium">
                {value} {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`border-b border-[#E5E5E5] bg-white ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 divide-x divide-[#F5F5F5] sm:grid-cols-4">
          {stats.slice(0, 4).map(({ icon, value, label }) => {
            const Icon = resolveIcon(icon);
            return (
              <div
                key={label}
                className="flex items-center justify-center gap-3 px-4 py-4 sm:px-6 sm:py-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F0F0F0]">
                  <Icon className="h-4 w-4 text-[#FF6C00]" aria-hidden />
                </span>
                <div>
                  <p className="text-base font-bold leading-none text-[#171717]">{value}</p>
                  <p className="mt-0.5 text-xs font-medium text-[#737373]">{label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
