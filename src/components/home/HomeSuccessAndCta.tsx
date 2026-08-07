"use client";

import { ArrowRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/Reveal";
import type { TestimonialsSection } from "@/lib/cms";

const AVATAR_COLORS = [
  { bg: "bg-[#E5E5E5]", text: "text-[#C2410C]" },
  { bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]" },
  { bg: "bg-[#DCFCE7]", text: "text-[#166534]" },
];

function Avatar({ name, index }: { name: string; index: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const { bg, text } = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${bg} ${text}`} aria-hidden>
      {initials}
    </span>
  );
}

export function HomeSuccessAndCta({
  section,
  businessCountLabel,
}: {
  section?: TestimonialsSection;
  businessCountLabel?: string | null;
}) {
  const items = (section?.items?.filter((item) => item.quote && item.name) || []).slice(0, 3);

  return (
    <section className="bg-[#F5F5F5] px-4 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_340px]">
        {/* Success Stories */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            Success Stories
          </h2>
          {items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {items.map((item, i) => (
                <Reveal key={`${item.name}-${i}`} delay={i * 90}>
                  <blockquote className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#FF6C00]/20 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5" aria-label={`${item.rating ?? 5} out of 5 stars`}>
                        {Array.from({ length: item.rating ?? 5 }).map((_, j) => (
                          <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                        ))}
                      </div>
                      <Quote className="h-6 w-6 text-neutral-200" aria-hidden />
                    </div>
                    <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-neutral-600">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <footer className="mt-4 flex items-center gap-2.5 border-t border-neutral-100 pt-4">
                      <Avatar name={item.name ?? ""} index={i} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900">{item.name}</p>
                        <p className="truncate text-xs text-neutral-400">{item.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-neutral-300 bg-white py-12 text-center text-sm text-neutral-500">
              No success stories yet.
            </p>
          )}
        </div>

        {/* Grow Your Business CTA */}
        <Reveal delay={120} className="flex flex-col justify-between rounded-2xl bg-[#0F1E3D] p-6 text-white shadow-sm transition-shadow duration-300 ease-out hover:shadow-[0_12px_32px_rgba(255,108,0,0.15)]">
          <div>
            <h3 className="text-lg font-bold leading-snug">Grow Your Business With Tradexo</h3>
            <ul className="mt-4 space-y-2 text-sm text-[#D7DEEC]">
              {["Get more visibility", "Receive quality leads", "Increase your sales"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FF6C00]/20 text-[#FF6C00]">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <Button
              href="/register-business"
              className="w-full justify-center gap-1.5 bg-[#FF6C00] text-white hover:bg-[#E86200]"
            >
              Register Your Business
            </Button>
            <a
              href="/plans"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-[#B7C3DD] hover:text-white"
            >
              View Pricing Plans <ArrowRight className="h-3 w-3" aria-hidden />
            </a>
            {businessCountLabel && (
              <p className="mt-3 text-center text-[11px] text-[#7C8FB3]">
                Join {businessCountLabel}+ businesses already on Tradexo
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
