"use client";

import {
  BadgeCheck,
  FileText,
  Globe2,
  Phone,
  ShieldCheck,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const ITEMS: { label: string; icon: LucideIcon }[] = [
  { label: "Verified & Trusted Businesses", icon: BadgeCheck },
  { label: "Get Multiple Quotations", icon: FileText },
  { label: "Direct Contact with Suppliers", icon: Phone },
  { label: "High Quality Leads", icon: Star },
  { label: "Nationwide Reach", icon: Globe2 },
  { label: "Secure & Reliable Platform", icon: ShieldCheck },
];

export function HomeTrustFeatures() {
  return (
    <section className="border-b border-[#1F3A63] bg-[#0F1E3D] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-center text-xl font-bold tracking-tight text-white sm:text-2xl">
          Why Choose Tradexo?
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {ITEMS.map(({ label, icon: Icon }, index) => (
            <Reveal key={label} delay={index * 70}>
              <div className="group flex flex-col items-center gap-2.5 text-center">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-white/15 to-white/5 text-[#FF8C42] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-[#FF6C00]/40 group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(255,108,0,0.25)]">
                  <span className="absolute inset-0 rounded-full bg-[#FF6C00] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-30" aria-hidden />
                  <Icon className="relative h-5 w-5" aria-hidden />
                </span>
                <span className="text-xs font-semibold text-[#D7DEEC] transition-colors duration-200 group-hover:text-white sm:text-sm">
                  {label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
