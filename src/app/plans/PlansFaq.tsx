"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "How do I upgrade my business?",
    a: "Choose a plan, sign in, select the business you want to upgrade, and pay securely via Razorpay. Your plan activates immediately after successful payment.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, debit/credit cards, net banking, and wallets through Razorpay — India's trusted payment gateway.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade to a higher plan anytime. The new benefits apply as soon as payment is confirmed.",
  },
  {
    q: "What happens when my plan expires?",
    a: "Your listing stays live on the free tier. Premium badges and boosted placement pause until you renew.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — register your business for free and start receiving leads. Premium plans add visibility, analytics, and priority ranking.",
  },
  {
    q: "Do I need a registered business first?",
    a: "Yes. Create your free business listing, then return here to upgrade the profile you want to promote.",
  },
] as const;

export function PlansFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {FAQ_ITEMS.map(({ q, a }, index) => {
        const open = openIndex === index;
        const isLast = index === FAQ_ITEMS.length - 1;

        return (
          <div
            key={q}
            className={cn(
              "transition-colors duration-150",
              !isLast && "border-b border-neutral-100",
              open && "bg-[#F0F0F0]"
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-150 hover:bg-[#F0F0F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF6C00]/30"
              aria-expanded={open}
            >
              <span
                className={cn(
                  "text-sm font-semibold transition-colors duration-150 sm:text-base",
                  open ? "text-[#FF6C00]" : "text-neutral-900"
                )}
              >
                {q}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 transition-all duration-300",
                  open ? "rotate-180 text-[#FF6C00]" : "text-neutral-400"
                )}
                aria-hidden
              />
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <p className="px-6 pb-5 text-sm leading-relaxed text-neutral-600">{a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
