"use client";

import {
  BadgeCheck,
  ChevronRight,
  Headphones,
  MessageSquare,
  Search,
  TrendingUp,
} from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: BadgeCheck,
    title: "Verified Businesses",
    desc: "Every listing goes through verification for trust & safety",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: TrendingUp,
    title: "Quality Leads",
    desc: "Get genuine buyer enquiries via call, WhatsApp & RFQ",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: TrendingUp,
    title: "Grow Faster",
    desc: "Rank higher on Google and get discovered by more buyers",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Headphones,
    title: "24×7 Support",
    desc: "Dedicated support team to help you at every step",
    color: "bg-purple-100 text-purple-600",
  },
];

const HOW_STEPS = [
  { step: "01", title: "Search or Post", desc: "Find businesses or post your buying requirement", icon: Search },
  { step: "02", title: "Get Bulk Quotes", desc: "Receive multiple wholesale quotes from verified suppliers", icon: MessageSquare },
  { step: "03", title: "Compare & Choose", desc: "Compare prices, ratings and choose the best", icon: BadgeCheck },
  { step: "04", title: "Grow Business", desc: "Complete deals and grow your business network", icon: TrendingUp },
];

export function HomeTrustHowItWorks() {
  return (
    <section className="bg-white px-3 py-12 sm:px-4 sm:py-14">
      <div className="mx-auto grid max-w-8xl gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Why Trust */}
        <div>
          <h2 className="text-2xl font-bold text-[#111] sm:text-3xl">
            Why Businesses Trust Tradexo?
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#111]">{title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#888]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="rounded-2xl border border-neutral-400 bg-neutral-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#111] sm:text-3xl">How It Works</h2>
          <div className="mt-8 space-y-4">
            {HOW_STEPS.map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} className="flex items-start gap-4">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6c00] text-sm font-bold text-white">
                    {step}
                  </span>
                  {i < HOW_STEPS.length - 1 && (
                    <span className="mt-1 h-6 w-0.5 bg-[#d4d4d4]" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[#ff6c00]" />
                    <h3 className="text-sm font-bold text-[#111]">{title}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-[#888]">{desc}</p>
                </div>
                {i < HOW_STEPS.length - 1 && (
                  <ChevronRight className="mt-2 hidden h-4 w-4 shrink-0 text-[#ddd] lg:block" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
