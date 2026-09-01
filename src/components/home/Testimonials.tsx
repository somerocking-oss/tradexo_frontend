"use client";

import { Star } from "lucide-react";
import type { TestimonialsSection } from "@/lib/cms";

const DEFAULT_TESTIMONIALS: TestimonialsSection = {
  eyebrow: "Success Stories",
  title: "Trusted by Businesses Across India",
  items: [
    {
      name: "Rajesh Kumar",
      role: "Manufacturer, Delhi NCR",
      quote:
        "We started getting 15–20 genuine B2B enquiries every week after completing our KYC and catalogue. Much better than cold calling.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Wholesale Trader, Mumbai",
      quote:
        "The seller portal makes it easy to track leads — new, contacted, converted. Our team responds within hours now.",
      rating: 5,
    },
    {
      name: "Amit Patel",
      role: "Buyer, Ahmedabad",
      quote:
        "Found 3 verified suppliers for packaging material in one search. Got quotes the same day. Saved weeks of sourcing.",
      rating: 5,
    },
  ],
};

export function Testimonials({ section }: { section?: TestimonialsSection }) {
  const config = {
    eyebrow: section?.eyebrow || DEFAULT_TESTIMONIALS.eyebrow,
    title: section?.title || DEFAULT_TESTIMONIALS.title,
    items: section?.items?.length ? section.items : DEFAULT_TESTIMONIALS.items!,
  };

  return (
    <section className="home-section-muted px-3 py-16 sm:px-4">
      <div className="mx-auto max-w-8xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="home-eyebrow mx-auto before:hidden sm:before:inline-block">{config.eyebrow}</span>
          <h2 className="home-section-title mt-1">{config.title}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {config.items.map((item) => (
            <blockquote
              key={`${item.name}-${item.role}`}
              className="home-card p-6"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: item.rating || 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-slate-700">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-4 border-t border-slate-100 pt-4">
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
