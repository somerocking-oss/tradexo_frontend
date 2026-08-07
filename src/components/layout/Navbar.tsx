"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronDown, MapPin, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { buttonClassName } from "@/components/ui/button-utils";
import { NavbarAuth } from "@/components/layout/NavbarAuth";
import { TradexoLogo } from "@/components/brand/TradexoLogo";
import { DEFAULT_SITE_LOGO } from "@/lib/brand";
import { SITE_NAME } from "@/lib/constants";
import type { NavigationSettings } from "@/lib/cms";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { extractBusinessList, getMyBusinesses } from "@/lib/api/business";
import { fetchSubCategoriesForCategory } from "@/lib/api/subcategory";
import { subCategoryToSlug } from "@/lib/api/subcategory-server";
import { buildListingsCategoryPath, categoryToSlug } from "@/lib/listings-url";
import type { Category, SubCategory } from "@/types";

/* ─── SSR-safe auth gate ──────────────────────────────────────────────────── */

function NavbarAuthGate() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="hidden h-9 w-[4.5rem] md:block" aria-hidden />;
  }

  return <NavbarAuth />;
}

/* ─── Default CMS fallback ────────────────────────────────────────────────── */

const DEFAULT_NAV: NavigationSettings = {
  links: [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/listings", label: "Companies" },
    { href: "/listings?sellerIntent=services", label: "Services" },
    { href: "/browse", label: "Categories" },
    { href: "/listings", label: "Deals" },
  ],
  ctaRfq: { label: "Post RFQ", href: "/post-requirement", enabled: true },
  ctaListBusiness: { label: "List Your Business", href: "/register-business", enabled: true },
};

function isNavActive(pathname: string, href?: string) {
  if (!href || href === "#") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ─── Category mega-menu ──────────────────────────────────────────────────── */

function CategoryMegaMenu({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(categories[0] || null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const subCacheRef = useRef<Map<string, SubCategory[]>>(new Map());
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open || !activeCategory?._id) return;
    const cached = subCacheRef.current.get(activeCategory._id);
    if (cached) {
      setSubCategories(cached);
      return;
    }
    let cancelled = false;
    setLoadingSubs(true);
    fetchSubCategoriesForCategory(activeCategory._id).then((subs) => {
      if (cancelled) return;
      subCacheRef.current.set(activeCategory._id, subs);
      setSubCategories(subs);
      setLoadingSubs(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, activeCategory]);

  if (!categories.length) return null;

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href="/categories"
        onFocus={() => setOpen(true)}
        className={cn(
          "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/40",
          "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
        )}
      >
        Categories
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 opacity-50 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </Link>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 flex w-[560px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
        >
          {/* Category list */}
          <div className="max-h-[420px] w-56 shrink-0 overflow-y-auto border-r border-neutral-100 bg-neutral-50/60 py-2">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={buildListingsCategoryPath(categoryToSlug(cat))}
                onMouseEnter={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                  activeCategory?._id === cat._id
                    ? "bg-white font-semibold text-[#FF6C00]"
                    : "text-neutral-600 hover:bg-white hover:text-neutral-900"
                )}
              >
                {cat.icon && <span aria-hidden>{cat.icon}</span>}
                <span className="line-clamp-1">{cat.name}</span>
              </Link>
            ))}
            <Link
              href="/categories"
              className="mt-1 block px-4 py-2 text-sm font-semibold text-[#FF6C00] hover:underline"
            >
              View All Categories →
            </Link>
          </div>

          {/* Subcategories of the hovered/active category */}
          <div className="min-h-[240px] flex-1 p-4">
            {loadingSubs ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                ))}
              </div>
            ) : subCategories.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {subCategories.slice(0, 16).map((sub) => (
                  <Link
                    key={sub._id}
                    href={
                      activeCategory
                        ? buildListingsCategoryPath(categoryToSlug(activeCategory), subCategoryToSlug(sub))
                        : "/categories"
                    }
                    className="truncate rounded px-1.5 py-1 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-[#FF6C00]"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No subcategories yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Navbar ──────────────────────────────────────────────────────────────── */

export function Navbar({
  navigation,
  siteName = SITE_NAME,
  siteLogo,
  topCategories = [],
}: {
  navigation?: NavigationSettings;
  siteName?: string;
  siteLogo?: string;
  topCategories?: Category[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const [hasBusiness, setHasBusiness] = useState(false);

  const isDashboard = pathname.startsWith("/dashboard");
  const hasCustomLogo = !!siteLogo && siteLogo !== DEFAULT_SITE_LOGO;

  const navLinks = navigation?.links?.length ? navigation.links : DEFAULT_NAV.links!;
  const listBusinessCta = { ...DEFAULT_NAV.ctaListBusiness, ...navigation?.ctaListBusiness };
  const ctaListBusiness = hasBusiness
    ? { ...listBusinessCta, label: "My Businesses", href: "/dashboard" }
    : listBusinessCta;

  /* If the user already owns a listed business, swap the "List Your
     Business" CTA for "My Businesses" pointing at their seller dashboard. */
  useEffect(() => {
    if (!isAuthenticated) {
      setHasBusiness(false);
      return;
    }
    let cancelled = false;
    getMyBusinesses().then((res) => {
      if (!cancelled && res.success && res.data) {
        setHasBusiness(extractBusinessList(res.data).length > 0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (isDashboard) return null;

  return (
    <>
      {/* ── Desktop / Tablet header ───────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full",
          "bg-white/95 backdrop-blur-sm",
          "border-b border-neutral-200",
          "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.05)]"
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">

          {/* Logo */}
          <Link
            href="/"
            prefetch
            className="flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/40 focus-visible:ring-offset-2 rounded-md"
            aria-label={`${siteName} — home`}
          >
            {hasCustomLogo ? (
              <Image
                src={siteLogo!}
                alt={`${siteName} logo`}
                width={160}
                height={48}
                className="h-10 w-auto object-contain sm:h-11"
                priority
              />
            ) : (
              <TradexoLogo size="nav" variant="light" />
            )}
          </Link>

          {/* Desktop nav links */}
          <nav
            className="hidden items-center gap-0.5 lg:flex xl:gap-1"
            aria-label="Main navigation"
          >
            <CategoryMegaMenu categories={topCategories} />
            {navLinks.map((link) => {
              const active = isNavActive(pathname, link.href);
              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href || "#"}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium",
                    "transition-all duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/40",
                    active
                      ? "bg-neutral-100 font-semibold text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right-side actions */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">

            {/* Location pill — desktop */}
            <span
              className={cn(
                "hidden items-center gap-1.5 rounded-full",
                "border border-neutral-200 bg-neutral-50",
                "px-2.5 py-1 text-xs font-medium text-neutral-600",
                "xl:inline-flex"
              )}
            >
              <MapPin className="h-3.5 w-3.5 text-[#FF6C00]" aria-hidden />
              All India
            </span>

            {/* List Business CTA */}
            {ctaListBusiness.enabled !== false && (
              <Link
                href={ctaListBusiness.href || "/register-business"}
                className={cn(
                  "hidden sm:inline-flex",
                  buttonClassName({
                    variant: "primary",
                    size: "sm",
                    className: cn(
                      "bg-[#FF6C00] hover:bg-[#E86200]",
                      "border border-[#FF6C00] hover:border-[#E86200]",
                      "shadow-[0_4px_14px_rgba(255,108,0,0.25)]",
                      "transition-all duration-200 ease-out",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/40 focus-visible:ring-offset-2"
                    ),
                  })
                )}
              >
                {hasBusiness && <Building2 className="h-3.5 w-3.5" aria-hidden />}
                <span className="hidden lg:inline">
                  {ctaListBusiness.label || "List Your Business"}
                </span>
                <span className="lg:hidden">{hasBusiness ? "My Businesses" : "List Business"}</span>
              </Link>
            )}

            {/* Auth — SSR-safe */}
            <NavbarAuthGate />

            {/* Mobile hamburger */}
            <button
              type="button"
              className={cn(
                "rounded-md p-2 lg:hidden",
                "text-neutral-700",
                "transition-colors duration-200 ease-out",
                "hover:bg-neutral-100 hover:text-neutral-900",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/40",
                "active:bg-neutral-200"
              )}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile full-screen overlay ────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-sm lg:hidden",
          "transition-opacity duration-300 ease-out",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden
        onClick={() => setMobileOpen(false)}
      />

      {/* Slide-in panel */}
      <div
        id="mobile-nav"
        ref={mobileMenuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm lg:hidden",
          "flex flex-col",
          "bg-white",
          "shadow-[−20px_0_40px_rgba(0,0,0,0.12)]",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Panel header */}
        <div className="flex h-14 items-center justify-between border-b border-neutral-100 px-4">
          <Link
            href="/"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/40 rounded"
            onClick={() => setMobileOpen(false)}
          >
            {hasCustomLogo ? (
              <Image
                src={siteLogo!}
                alt={`${siteName} logo`}
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <TradexoLogo size="nav" className="h-9 w-auto" />
            )}
          </Link>
          <button
            type="button"
            className={cn(
              "rounded-md p-2",
              "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
              "transition-colors duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/40"
            )}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-1 flex-col gap-0 overflow-y-auto px-4 py-4">

          {/* Location row */}
          <div className="mb-3 flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2.5">
            <MapPin className="h-4 w-4 text-[#FF6C00]" aria-hidden />
            <span className="text-sm font-medium text-neutral-600">All India</span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
            <Link
              href="/categories"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium",
                "transition-colors duration-150 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/40",
                isNavActive(pathname, "/categories")
                  ? "bg-[#F0F0F0] font-semibold text-[#FF6C00]"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              onClick={() => setMobileOpen(false)}
            >
              Categories
            </Link>
            {navLinks.map((link) => {
              const active = isNavActive(pathname, link.href);
              return (
                <Link
                  key={`mobile-${link.href}-${link.label}`}
                  href={link.href || "#"}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium",
                    "transition-colors duration-150 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/40",
                    active
                      ? "bg-[#F0F0F0] font-semibold text-[#FF6C00]"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FF6C00]" aria-hidden />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-3 border-t border-neutral-100" role="separator" />

          {/* CTA buttons */}
          <div className="flex flex-col gap-2">
            {ctaListBusiness.enabled !== false && (
              <Button
                href={ctaListBusiness.href || "/register-business"}
                variant="primary"
                className={cn(
                  "w-full justify-center",
                  "bg-[#FF6C00] hover:bg-[#E86200]",
                  "shadow-[0_4px_14px_rgba(255,108,0,0.20)]"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {ctaListBusiness.label || "List Your Business"}
              </Button>
            )}
            <Button
              href="/login"
              variant="outline"
              className="w-full justify-center"
              onClick={() => setMobileOpen(false)}
            >
              Login / Sign Up
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
