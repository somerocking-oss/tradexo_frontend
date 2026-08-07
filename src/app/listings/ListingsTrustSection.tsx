"use client";

import {
  BadgeCheck,
  Headphones,
  Lock,
  MessageCircle,
  Tag,
  TrendingUp,
} from "lucide-react";

const ITEMS = [
  { icon: BadgeCheck, title: "Verified Businesses", desc: "Every listing verified for trust", color: "bg-green-100 text-green-600" },
  { icon: TrendingUp, title: "Quality Leads", desc: "Genuine buyer enquiries daily", color: "bg-orange-100 text-orange-600" },
  { icon: Tag, title: "Best Price Guarantee", desc: "Compare quotes from multiple suppliers", color: "bg-purple-100 text-purple-600" },
  { icon: MessageCircle, title: "Easy Communication", desc: "Call, WhatsApp or chat instantly", color: "bg-blue-100 text-blue-600" },
  { icon: Lock, title: "100% Safe & Secure", desc: "Your data is always protected", color: "bg-teal-100 text-teal-600" },
];

export function ListingsTrustSection() {
  return (
    <section className="border-t border-neutral-400 bg-neutral-200 px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-center text-xl font-bold text-[#111] sm:text-2xl">
          Why Businesses Trust Tradexo
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-3 text-sm font-bold text-[#111]">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#888]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
