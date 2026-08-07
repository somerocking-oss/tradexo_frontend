"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeSectionVariant = "overlap" | "white" | "soft" | "muted" | "dark";

const VARIANT_CLASS: Record<HomeSectionVariant, string> = {
  overlap: "home-section-overlap py-8 sm:py-10",
  white: "bg-white py-12 sm:py-14",
  soft: "home-section-soft py-12 sm:py-14",
  muted: "home-section-muted py-12 sm:py-14",
  dark: "home-section-dark py-12 sm:py-14",
};

type HomeSectionProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
  variant?: HomeSectionVariant;
};

export function HomeSection({
  children,
  className,
  innerClassName,
  id,
  variant = "white",
}: HomeSectionProps) {
  return (
    <section id={id} className={cn("px-4 sm:px-6", VARIANT_CLASS[variant], className)}>
      <div className={cn("mx-auto max-w-7xl", innerClassName)}>{children}</div>
    </section>
  );
}

type HomeSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  centered?: boolean;
  className?: string;
  dark?: boolean;
};

export function HomeSectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  centered = false,
  className,
  dark = false,
}: HomeSectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:mb-8",
        action ? "sm:flex-row sm:items-end sm:justify-between" : "",
        centered ? "mx-auto max-w-2xl text-center sm:items-center" : "",
        className
      )}
    >
      <div className={centered ? "mx-auto" : ""}>
        {eyebrow ? (
          <span className={cn("home-eyebrow", dark && "text-[#ffb366] before:bg-[#ffb366]")}>
            {eyebrow}
          </span>
        ) : null}
        <h2 className={cn("home-section-title", dark && "text-white")}>{title}</h2>
        {subtitle ? (
          <p className={cn("home-section-subtitle", dark && "text-neutral-300")}>{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        <Button
          href={action.href}
          variant="outline"
          size="sm"
          className={cn(
            "shrink-0 border-neutral-300",
            centered ? "mx-auto sm:mx-0" : "hidden sm:inline-flex",
            dark && "border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white"
          )}
        >
          {action.label} <ArrowRight className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
