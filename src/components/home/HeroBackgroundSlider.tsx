"use client";

import { useCallback, useEffect, useState } from "react";
import type { HeroSlideConfig } from "@/lib/home-images";
import { DEFAULT_HERO_SLIDER_INTERVAL_MS } from "@/lib/home-images";
import { cn } from "@/lib/utils";

type HeroBackgroundSliderProps = {
  slides: HeroSlideConfig[];
  intervalMs?: number;
};

export function HeroBackgroundSlider({
  slides,
  intervalMs = DEFAULT_HERO_SLIDER_INTERVAL_MS,
}: HeroBackgroundSliderProps) {
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

  if (!total) return null;

  return (
    <div
      className="absolute inset-0"
      aria-hidden
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
          className={cn(
            "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1200ms] ease-in-out",
            index === active ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url('${slide.src}')` }}
        />
      ))}

      {/* Light overlay — search readable, image visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/18 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#ff6c00]/8" />

      {total > 1 && (
        <div className="absolute inset-x-0 bottom-8 z-[1] flex items-center justify-center gap-2 sm:bottom-10">
          {slides.map((slide, index) => (
            <button
              key={`dot-${slide.src}-${index}`}
              type="button"
              aria-label={`Show slide ${index + 1}: ${slide.alt || "Hero slide"}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => goTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === active
                  ? "w-7 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
