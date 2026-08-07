"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  GitCompare,
  Home,
  LayoutDashboard,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { NavLink } from "@/lib/cms";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Search,
  FileText,
  Building2,
  LayoutDashboard,
  GitCompare,
};

const DEFAULT_ITEMS: NavLink[] = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/listings", label: "Search", icon: "Search" },
  { href: "/post-requirement", label: "RFQ", icon: "FileText" },
  { href: "/compare", label: "Compare", icon: "GitCompare" },
  { href: "/dashboard", label: "Seller", icon: "LayoutDashboard" },
];

export function MobileBottomBar({ items }: { items?: NavLink[] }) {
  const pathname = usePathname();
  const navItems = items?.length ? items : DEFAULT_ITEMS;

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/business/") ||
    pathname.startsWith("/product/")
  )
    return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white md:hidden"
      style={{
        boxShadow: "0 -1px 0 0 #E5E5E5, 0 -4px 12px rgba(0,0,0,0.06)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {navItems.map((item) => {
          const Icon = (item.icon && ICON_MAP[item.icon]) || Home;
          const href = item.href || "/";
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={`${href}-${item.label}`}
              href={href}
              className={cn(
                "relative flex min-w-[4rem] flex-1 flex-col items-center gap-0.5 px-1 pb-2 pt-1",
                "transition-all duration-200 ease-out",
                "active:scale-95",
                "select-none outline-none focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30 focus-visible:ring-offset-0 rounded-lg",
                active ? "text-[#FF6C00]" : "text-[#A3A3A3]"
              )}
            >
              {/* Active indicator dot */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full transition-all duration-200 ease-out",
                  active
                    ? "bg-[#FF6C00] opacity-100 scale-x-100"
                    : "bg-transparent opacity-0 scale-x-0"
                )}
              />

              {/* Icon wrapper */}
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ease-out",
                  active
                    ? "bg-[#F0F0F0] text-[#FF6C00]"
                    : "bg-transparent text-[#A3A3A3]"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200 ease-out",
                    active ? "stroke-[2.25]" : "stroke-[1.75]"
                  )}
                  aria-hidden="true"
                />
              </span>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-semibold leading-none tracking-wide transition-colors duration-200 ease-out",
                  active ? "text-[#FF6C00]" : "text-[#A3A3A3]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
