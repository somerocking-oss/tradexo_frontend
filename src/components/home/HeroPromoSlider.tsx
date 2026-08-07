"use client";

import { useCallback, useEffect, useState } from "react";
import type { HeroSlideConfig } from "@/lib/home-images";
import { DEFAULT_HERO_SLIDER_INTERVAL_MS } from "@/lib/home-images";
import { cn } from "@/lib/utils";

type HeroPromoSliderProps = {
  slides: HeroSlideConfig[];
  intervalMs?: number;
  className?: string;
  framed?: boolean;
};

export function HeroPromoSlider({
  slides,
  intervalMs = DEFAULT_HERO_SLIDER_INTERVAL_MS,
  className,
  framed = false,
}: HeroPromoSliderProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (!total) return;
      setActive((index + total) % total);
    },
    [total]
  );

  const next = useCallback(() => {
    goTo(active + 1);
  }, [active, goTo]);

  useEffect(() => {
    setActive(0);
  }, [slides]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;
    const timer = window.setInterval(next, intervalMs);
    return () => window.clearInterval(timer);
  }, [next, paused, total, intervalMs]);

  const shellClass = cn(
    "relative overflow-hidden bg-neutral-900",
    framed
      ? "rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/15"
      : "rounded-xl shadow-sm ring-1 ring-[#e8e8e8] bg-neutral-200",
    className
  );

  if (!total) {
    return (
      <div className={cn(shellClass, "flex items-center justify-center")}>
        <p className="text-sm font-medium text-white/90">Tradexo — Premium B2B Platform</p>
      </div>
    );
  }

  return (
    <div
      className={shellClass}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
          className={cn(
            "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1000ms] ease-in-out",
            index === active ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url('${slide.src}')` }}
          role="img"
          aria-label={slide.alt || `Promo slide ${index + 1}`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

      {slides[active]?.alt ? (
        <div className="absolute bottom-9 left-4 right-4 sm:bottom-10 sm:left-5">
          <p className="max-w-sm text-sm font-semibold text-white/95 drop-shadow sm:text-base">
            {slides[active].alt}
          </p>
        </div>
      ) : null}

      {total > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={`dot-${slide.src}-${index}`}
              type="button"
              aria-label={`Slide ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => goTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === active ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
