"use client";

import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "slide-up";
};

export function Reveal({ children, className, delay = 0, variant = "slide-up" }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        inView
          ? "translate-y-0 opacity-100"
          : variant === "slide-up"
            ? "translate-y-3 opacity-0"
            : "opacity-0",
        className
      )}
      style={inView ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
