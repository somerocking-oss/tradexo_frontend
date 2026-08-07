"use client";

import { HelpCircle } from "lucide-react";
import { buildCategoryFaqs, buildFaqPageJsonLd } from "@/lib/seo";

/** Visible FAQ accordion + FAQPage JSON-LD for category/category+city listing
 *  pages. Google requires the FAQ text to be genuinely visible on the page
 *  (not just in structured data) to qualify for the rich-result treatment. */
export function ListingsCategoryFaq({
  categoryLabel,
  cityLabel,
}: {
  categoryLabel?: string;
  cityLabel?: string;
}) {
  if (!categoryLabel) return null;

  const faqs = buildCategoryFaqs(categoryLabel, cityLabel);
  const faqJsonLd = buildFaqPageJsonLd(faqs);

  return (
    <div className="mx-auto mt-5 max-w-7xl px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <HelpCircle className="h-3.5 w-3.5 text-[#FF6C00]" aria-hidden />
          Frequently Asked Questions
        </p>
        <div className="divide-y divide-neutral-100">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-3 first:pt-0 last:pb-0">
              <summary className="cursor-pointer list-none text-sm font-semibold text-neutral-800 marker:content-none group-open:text-[#FF6C00]">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
