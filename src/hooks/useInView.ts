"use client";

import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  threshold?: number;
  rootMargin?: string;
};

export function useInView<T extends HTMLElement = HTMLDivElement>({
  // A ratio-of-total-area threshold (the old default was 0.15) becomes
  // unreliable — or outright unreachable — for elements taller than the
  // viewport, since the visible fraction of their *total* area can never
  // reach 15%. Firing on the first visible pixel instead works correctly
  // regardless of how tall the target is.
  threshold = 0,
  rootMargin = "0px 0px -40px 0px",
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
}
