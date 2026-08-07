"use client";

import { useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { TestimonialsSection } from "@/lib/cms";

const AVATAR_COLORS = [
  { bg: "bg-[#E5E5E5]", text: "text-[#C2410C]" },
  { bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]" },
  { bg: "bg-[#DCFCE7]", text: "text-[#166534]" },
  { bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]" },
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colorIndex = name.length % AVATAR_COLORS.length;
  const { bg, text } = AVATAR_COLORS[colorIndex];
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ring-white ${bg} ${text}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function HomeTestimonialsCarousel({ section }: { section?: TestimonialsSection }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const regionId = useId();
  const [activeIndex, setActiveIndex] = useState(0);

  const items = section?.items?.filter((item) => item.quote && item.name) || [];
  if (!items.length) return null;

  const config = {
    title: section?.title || "What Our Users Say",
    items,
  };
  const total = config.items.length;

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, total - 1));
    setActiveIndex(clamped);
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[clamped] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return (
    <section
      className="bg-[#F5F5F5] px-4 py-14 sm:px-6 sm:py-16"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto mb-8 max-w-xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-[#F0F0F0] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6C00]" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6C00]">
              Testimonials
            </span>
          </div>
          <h2
            id="testimonials-heading"
            className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl"
          >
            {config.title}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[1.0625rem] leading-relaxed text-[#737373]">
            Thousands of businesses trust Tradexo to find suppliers and grow revenue.
          </p>
        </div>

        <div className="relative">
          {/* Previous button */}
          <button
            type="button"
            onClick={() => scrollTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous testimonial"
            className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E5E5] bg-white shadow-md transition-all duration-200 ease-out hover:border-[#FF6C00]/40 hover:bg-[#F0F0F0] hover:text-[#FF6C00] disabled:cursor-not-allowed disabled:opacity-30 sm:-left-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            id={regionId}
            role="region"
            aria-label="Customer testimonials"
            aria-live="polite"
            className="flex gap-5 overflow-x-auto px-1 pb-3"
            style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
          >
            {config.items.map((item, i) => (
              <blockquote
                key={`${item.name}-${item.role}`}
                aria-hidden={i !== activeIndex}
                style={{ scrollSnapAlign: "start" }}
                className="w-[300px] shrink-0 rounded-xl border border-[#E5E5E5] bg-white p-7 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#FF6C00]/20 hover:shadow-md sm:w-[360px]"
              >
                {/* Quote icon + stars row */}
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className="flex gap-0.5"
                    aria-label={`${item.rating ?? 5} out of 5 stars`}
                  >
                    {Array.from({ length: item.rating ?? 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        aria-hidden
                      />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-[#E5E5E5]" aria-hidden />
                </div>

                {/* Quote text */}
                <p className="text-sm leading-relaxed text-[#525252]">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Author footer */}
                <footer className="mt-6 flex items-center gap-3 border-t border-[#F5F5F5] pt-5">
                  <Avatar name={item.name ?? ""} />
                  <div>
                    <p className="text-sm font-semibold text-[#171717]">{item.name}</p>
                    <p className="mt-0.5 text-xs font-medium text-[#A3A3A3]">{item.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>

          {/* Next button */}
          <button
            type="button"
            onClick={() => scrollTo(activeIndex + 1)}
            disabled={activeIndex >= total - 1}
            aria-label="Next testimonial"
            className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E5E5] bg-white shadow-md transition-all duration-200 ease-out hover:border-[#FF6C00]/40 hover:bg-[#F0F0F0] hover:text-[#FF6C00] disabled:cursor-not-allowed disabled:opacity-30 sm:-right-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Dot indicators */}
        <div
          className="mt-8 flex justify-center gap-2"
          role="tablist"
          aria-label="Testimonial navigation"
        >
          {config.items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to testimonial from ${item.name ?? "user"}`}
              onClick={() => scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30 ${
                i === activeIndex
                  ? "w-6 bg-[#FF6C00]"
                  : "w-2 bg-[#E5E5E5] hover:bg-[#A3A3A3]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
