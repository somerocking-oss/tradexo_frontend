"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { BusinessFaq } from "@/types";

export function BusinessFAQSection({
  businessName,
  faqs,
}: {
  businessName: string;
  faqs: BusinessFaq[];
}) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?._id || null);

  if (!faqs.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Frequently Asked Questions</h2>
      <p className="mb-4 text-sm text-slate-600">
        Common questions about {businessName}
      </p>
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
        {faqs.map((faq) => {
          const isOpen = openId === faq._id;
          return (
            <div key={faq._id}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq._id)}
                className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left hover:bg-slate-50"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-slate-900">{faq.question}</span>
                <ChevronDown
                  className={`mt-0.5 h-5 w-5 shrink-0 text-slate-500 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
