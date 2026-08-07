"use client";

import {
  BadgeCheck,
  Headphones,
  Megaphone,
  Search,
  TrendingUp,
} from "lucide-react";

const BENEFITS = [
  { icon: TrendingUp, label: "Get Daily Leads", color: "bg-orange-100 text-orange-600" },
  { icon: Search, label: "Rank on Google", color: "bg-blue-100 text-blue-600" },
  { icon: BadgeCheck, label: "Verified Business Badge", color: "bg-green-100 text-green-600" },
  { icon: Megaphone, label: "Premium Promotion", color: "bg-purple-100 text-purple-600" },
  { icon: Headphones, label: "24×7 Support", color: "bg-teal-100 text-teal-600" },
];

export function RegisterBenefitsPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-400 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#111]">Why Join Tradexo?</h3>
        <ul className="mt-4 space-y-3.5">
          {BENEFITS.map(({ icon: Icon, label, color }) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-sm font-medium text-[#333]">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm font-bold text-green-800">100% Free Forever</p>
        <p className="mt-1 text-xs text-green-700">No hidden charges. No commission.</p>
      </div>
    </div>
  );
}

export function RegisterBottomStatsBar({ registeredToday = 0 }: { registeredToday?: number }) {
  if (registeredToday <= 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-neutral-400 bg-white px-4 py-3.5 shadow-sm sm:px-6">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-[#666] sm:text-sm">
        <span>
          <strong className="font-bold text-[#111]">{registeredToday.toLocaleString("en-IN")}</strong>{" "}
          businesses registered today
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden>🔒</span>
          Secure &amp; Safe — Your data is protected
        </span>
      </div>
    </div>
  );
}
