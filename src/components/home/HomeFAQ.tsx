"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Is listing my business on Tradexo free?",
    answer:
      "Yes. You can create a free business profile, list products, and start receiving leads at no cost. Paid plans unlock more leads, featured placement and verification badges.",
  },
  {
    question: "How do RFQs (buy requirements) work?",
    answer:
      "Buyers post their requirement (product, quantity, city) once. Matching suppliers in that category and city are notified instantly and can respond with a quote — no need to search and contact suppliers one by one.",
  },
  {
    question: "Is GST verification required to sell on Tradexo?",
    answer:
      "GST verification isn't mandatory to create a profile, but verified businesses get a trust badge, rank higher in search, and convert more enquiries into leads.",
  },
  {
    question: "How fast do I get leads after listing my business?",
    answer:
      "Most businesses start appearing in relevant city/category searches within minutes of going live. Lead volume depends on category demand, profile completeness and your plan.",
  },
  {
    question: "Can I respond to buyer requirements directly?",
    answer:
      "Yes. Once registered, you can view matched buy requirements in your dashboard and send a quote directly — no extra cost for viewing matched RFQs on paid plans.",
  },
  {
    question: "What happens if I get a spam or fraudulent lead?",
    answer:
      "Every lead is screened for duplicates and fraud signals. You can also flag a lead as spam from your dashboard, and verified spam leads are excluded from your billing.",
  },
];

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-14" aria-labelledby="faq-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A3A3A3]">
            Got Questions?
          </p>
          <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-neutral-300 rounded-2xl border border-neutral-400 bg-neutral-100">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-[#262626] sm:text-base">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#737373] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-[#525252]">{faq.answer}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
