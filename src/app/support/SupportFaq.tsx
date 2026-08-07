"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "How do I register my business for free?",
    a: "Go to Register Business, complete the step-by-step form with your name, category, city, and contact details. Your listing goes live after review — usually within 24–48 hours.",
  },
  {
    q: "How do I receive leads from buyers?",
    a: "Complete your profile and KYC, keep phone/WhatsApp updated, and respond quickly to enquiries from your seller dashboard. Premium plans offer more visibility and lead alerts.",
  },
  {
    q: "How do I post a buying requirement (RFQ)?",
    a: "Use Post Requirement to describe what you need, your city, and contact details. Verified suppliers in your area will send quotes — track them in My Requirements under your profile.",
  },
  {
    q: "I forgot my login or can't access my account",
    a: "Login uses OTP on your registered mobile number. If you changed numbers, email our support team with your business name and old mobile for verification.",
  },
  {
    q: "How do payments and premium plans work?",
    a: "View Plans for pricing. Payments are processed securely; invoices appear in Dashboard → Billing. Contact support for billing disputes or refund queries.",
  },
  {
    q: "How do I report wrong or duplicate listings?",
    a: "Use the report option on a business page or email support with the listing URL. For copyright/trademark issues, see our Infringement Policy.",
  },
] as const;

export function SupportFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
      {FAQ_ITEMS.map(({ q, a }, i) => {
        const open = openIndex === i;
        return (
          <div key={q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className={cn(
                "flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors sm:py-5",
                open ? "bg-[#F0F0F0]" : "hover:bg-neutral-50"
              )}
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-neutral-900 sm:text-base">{q}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  open ? "rotate-180 text-[#FF6C00]" : "text-neutral-400"
                )}
                aria-hidden
              />
            </button>
            {open && (
              <div className="border-t border-neutral-100 bg-[#FFFBF7] px-5 pb-5 pt-3 text-sm leading-relaxed text-neutral-600">
                {a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
