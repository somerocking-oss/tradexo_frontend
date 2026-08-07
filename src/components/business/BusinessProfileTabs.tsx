"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ProfileTab {
  id: string;
  label: string;
}

/**
 * IndiaMart-style in-page jump nav for long supplier/product profile pages —
 * content stays a single scrolling page, this just adds a sticky bar of
 * anchors with scrollspy highlighting. Not sticky on mobile: stacking it
 * under the header's mobile search row would need pixel-fragile offset math
 * for one extra bar of screen real estate on small viewports.
 */
export function BusinessProfileTabs({ tabs }: { tabs: ProfileTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);

  useEffect(() => {
    const sections = tabs
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tabs]);

  const scrollToTab = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = window.innerWidth >= 768 ? 104 : 64;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const navRef = useRef<HTMLDivElement>(null);

  if (tabs.length === 0) return null;

  return (
    <div
      ref={navRef}
      className="static border-b border-neutral-300 bg-white shadow-sm md:sticky md:top-14 md:z-20"
    >
      <nav
        className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6"
        aria-label="Profile section navigation"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => scrollToTab(tab.id)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              activeId === tab.id
                ? "border-[#FF6C00] text-[#FF6C00]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            )}
            aria-current={activeId === tab.id ? "true" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
