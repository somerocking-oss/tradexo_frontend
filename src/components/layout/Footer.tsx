import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import {
  Store,
  MapPin,
  BadgeCheck,
  TrendingUp,
  Star,
  Users,
  Zap,
  Globe2,
  ShieldCheck,
  Handshake,
  Headphones,
  Rocket,
  CreditCard,
  Lock,
  Send,
  type LucideIcon,
} from "lucide-react";
import { TradexoLogo } from "@/components/brand/TradexoLogo";
import { DEFAULT_SITE_LOGO } from "@/lib/brand";
import { SITE_NAME } from "@/lib/constants";
import type { FooterSettings } from "@/lib/cms";
import type { DisplayStat } from "@/lib/platform-stats";
import { buildListingsUrl, buildListingsCityPath, categoryToSlug } from "@/lib/listings-url";
import type { Category } from "@/types";

const STAT_ICON_MAP: Record<string, LucideIcon> = { Users, TrendingUp, Zap, Globe2, Star, BadgeCheck };

function resolveStatIcon(stat: { label?: string; icon?: string }): LucideIcon {
  const label = (stat.label || "").toLowerCase();
  if (/business|listing|suppl|vendor/.test(label)) return Store;
  if (/cit(y|ies)/.test(label)) return MapPin;
  if (/verif|trust/.test(label)) return BadgeCheck;
  if (/rating|review/.test(label)) return Star;
  return STAT_ICON_MAP[stat.icon || ""] || Users;
}

const TRUST_BADGES: Array<{ title: string; description: string; Icon: LucideIcon }> = [
  { title: "Safe & Secure", description: "Your data is protected with top security", Icon: ShieldCheck },
  { title: "Trusted Network", description: "Connect with verified businesses", Icon: Handshake },
  { title: "24/7 Support", description: "We're here to help you anytime", Icon: Headphones },
  { title: "Grow Faster", description: "Get more visibility & quality leads", Icon: Rocket },
];

const DEFAULT_FOOTER: FooterSettings = {
  tagline: "India's premium B2B business discovery platform.",
  description:
    "Connect with verified suppliers, manufacturers, and distributors across India.",
  legalText:
    "A Brand of The Webcorners. Owned & Operated by Mohit Kumar Tyagi. All Rights Reserved.",
  stats: [],
  sections: [
    {
      title: "Discover",
      links: [
        { href: "/products", label: "Products Marketplace" },
        { href: "/listings", label: "All Businesses" },
        { href: "/browse", label: "Browse by City" },
        { href: "/listings?isFeatured=true", label: "Featured Businesses" },
        { href: "/listings?isVerified=true", label: "Verified Suppliers" },
        { href: "/plans", label: "Premium Plans" },
      ],
    },
    {
      title: "For Business",
      links: [
        { href: "/register-business", label: "Register Business" },
        { href: "/page/advertise", label: "Advertise" },
        { href: "/dashboard", label: "Vendor Dashboard" },
        { href: "/post-requirement", label: "Post Requirement" },
        { href: "/page/about-us", label: "About Us" },
        { href: "/blog", label: "Blog" },
      ],
    },
    {
      title: "Support",
      links: [
        { href: "/support", label: "Help Center" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/infringement", label: "Report Issue" },
        { href: "/site-map", label: "Sitemap" },
      ],
    },
    {
      title: "Top Categories",
      links: [
        { href: "/categories", label: "All Categories" },
      ],
    },
    {
      title: "Popular Cities",
      links: [
        { href: "/browse", label: "All Cities" },
      ],
    },
  ],
  sitemapLabel: "Sitemap",
  sitemapHref: "/site-map",
};

/* ── Social icons ──────────────────────────────── */
function IconX() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconGooglePlay() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3.18 23.75c.3.17.64.25.99.25.36 0 .73-.09 1.05-.28l12.18-7.03-2.76-2.76L3.18 23.75zM.08 1.1A1.5 1.5 0 000 1.72v20.56c0 .22.03.43.08.63l12.07-12.07L.08 1.1zM20.44 10.1l-2.84-1.64-3.1 3.1 3.1 3.1 2.87-1.65c.82-.47.82-1.44-.03-1.91zM4.22.53C3.9.34 3.53.25 3.17.25c-.35 0-.69.08-.99.25l11.46 11.46 2.76-2.76L4.22.53z" />
    </svg>
  );
}

function IconApple() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

const SOCIAL_ICON_MAP: Record<string, { label: string; Icon: () => ReactElement; bg: string }> = {
  x: { label: "Follow on X (Twitter)", Icon: IconX, bg: "bg-black" },
  twitter: { label: "Follow on X (Twitter)", Icon: IconX, bg: "bg-black" },
  linkedin: { label: "Connect on LinkedIn", Icon: IconLinkedIn, bg: "bg-[#0A66C2]" },
  instagram: {
    label: "Follow on Instagram",
    Icon: IconInstagram,
    bg: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
  },
  facebook: { label: "Follow on Facebook", Icon: IconFacebook, bg: "bg-[#1877F2]" },
  youtube: { label: "Subscribe on YouTube", Icon: IconYouTube, bg: "bg-[#FF0000]" },
};

export function Footer({
  footer,
  siteName = SITE_NAME,
  siteLogo,
  stats = [],
  topCategories = [],
  topCities = [],
}: {
  footer?: FooterSettings;
  siteName?: string;
  siteLogo?: string;
  stats?: DisplayStat[];
  topCategories?: Category[];
  topCities?: Array<{ city: string; slug: string; count: number }>;
}) {
  const footerLogo = footer?.logo || siteLogo;
  const hasCustomLogo = !!footerLogo && footerLogo !== DEFAULT_SITE_LOGO;
  const baseSections = footer?.sections?.length ? footer.sections : DEFAULT_FOOTER.sections!;

  // Real, always-live category/city links — swapped in for the "Top
  // Categories" / "Popular Cities" sections — replaces them by title if the
  // CMS happens to define one (e.g. the old generic-keyword-search default),
  // otherwise appended so real deep links always show regardless of how the
  // CMS footer is configured.
  const dynamicCategoryLinks = topCategories.slice(0, 14).map((cat) => ({
    href: buildListingsUrl({ categorySlug: categoryToSlug(cat) }),
    label: cat.name,
  }));
  const dynamicCityLinks = topCities.slice(0, 14).map((c) => ({
    href: buildListingsCityPath(c.city),
    label: c.city,
  }));

  const hasCategorySection = baseSections.some((s) => s.title === "Top Categories");
  const hasCitySection = baseSections.some((s) => s.title === "Popular Cities");

  const sections = [
    ...baseSections.map((section) => {
      if (section.title === "Top Categories" && dynamicCategoryLinks.length) {
        return { ...section, links: [...dynamicCategoryLinks, { href: "/categories", label: "All Categories" }] };
      }
      if (section.title === "Popular Cities" && dynamicCityLinks.length) {
        return { ...section, links: [...dynamicCityLinks, { href: "/browse", label: "All Cities" }] };
      }
      return section;
    }),
    ...(!hasCategorySection && dynamicCategoryLinks.length
      ? [{ title: "Top Categories", links: [...dynamicCategoryLinks, { href: "/categories", label: "All Categories" }] }]
      : []),
    ...(!hasCitySection && dynamicCityLinks.length
      ? [{ title: "Popular Cities", links: [...dynamicCityLinks, { href: "/browse", label: "All Cities" }] }]
      : []),
  ];

  // The category/city directories can run to a dozen-plus links each — pulled
  // out of the standard nav grid into their own wide, multi-column block
  // below so they read as an IndiaMart-style dense sitemap instead of one
  // very tall single-file column squeezed into a 1fr grid track.
  const standardSections = sections.filter(
    (s) => s.title !== "Top Categories" && s.title !== "Popular Cities"
  );
  const directorySections = sections.filter(
    (s) => s.title === "Top Categories" || s.title === "Popular Cities"
  );

  const data = {
    tagline: footer?.tagline || DEFAULT_FOOTER.tagline,
    description: footer?.description || DEFAULT_FOOTER.description,
    legalText: footer?.legalText || DEFAULT_FOOTER.legalText,
    stats: stats.length ? stats : footer?.stats?.length ? footer.stats : DEFAULT_FOOTER.stats!,
    sections: standardSections,
    directorySections,
    sitemapLabel: footer?.sitemapLabel || DEFAULT_FOOTER.sitemapLabel,
    sitemapHref: footer?.sitemapHref || DEFAULT_FOOTER.sitemapHref,
  };

  const socialLinks = (footer?.socialLinks || [])
    .filter((item) => item.href?.trim() && SOCIAL_ICON_MAP[item.platform?.toLowerCase() || ""])
    .map((item) => ({
      href: item.href!,
      ...SOCIAL_ICON_MAP[item.platform!.toLowerCase()],
      label: item.label || SOCIAL_ICON_MAP[item.platform!.toLowerCase()].label,
    }));

  const appLinks = [
    { label: "Get it on", platform: "Google Play", Icon: IconGooglePlay, href: footer?.appLinks?.googlePlay },
    { label: "Download on the", platform: "App Store", Icon: IconApple, href: footer?.appLinks?.appStore },
  ].filter((item) => item.href?.trim());

  const newsletterEnabled = !!footer?.newsletter?.enabled && !!footer?.newsletter?.actionUrl?.trim();

  return (
    <footer className="relative bg-[#0F1E3D] text-[#B7C3DD] overflow-hidden">

      {/* Subtle radial glow behind brand area */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6C00]/5 blur-[120px]"
      />

      {/* Orange top accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FF6C00]/50 to-transparent" />

      {/* ══════════════════════════════════════
          App download strip
      ══════════════════════════════════════ */}
      {appLinks.length > 0 ? (
      <div className="border-b border-white/[0.06] px-3 py-4 sm:px-4 lg:px-8">
        <div className="mx-auto flex max-w-8xl flex-wrap items-center justify-end gap-2.5">
          <span className="hidden text-xs text-neutral-600 lg:block">Download&nbsp;App:</span>
          {appLinks.map(({ label, platform, Icon, href }) => (
            <a
              key={platform}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} ${platform}`}
              className="group inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-neutral-400 transition-all hover:border-[#FF6C00]/30 hover:bg-white/[0.08] hover:text-white"
            >
              <Icon />
              <span>
                <span className="block text-[9px] font-normal leading-none text-neutral-600 group-hover:text-neutral-400 transition-colors">
                  {label}
                </span>
                <span className="text-xs font-semibold leading-tight">{platform}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      ) : null}

      {/* ══════════════════════════════════════
          Main grid
      ══════════════════════════════════════ */}
      <div className="relative mx-auto max-w-8xl px-3 py-10 sm:px-4 lg:px-8">
        <div
          className={`grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 ${
            newsletterEnabled ? "lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]" : "lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
          }`}
        >

          {/* ── Brand column ── */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            {hasCustomLogo ? (
              <Link href="/" className="inline-flex shrink-0 items-center">
                <Image
                  src={footerLogo!}
                  alt={`${siteName} logo`}
                  width={180}
                  height={54}
                  className="h-12 w-auto object-contain"
                />
              </Link>
            ) : (
              <TradexoLogo variant="dark" size="lg" href="/" />
            )}
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
              {data.description}
            </p>

            {/* Stats */}
            {data.stats.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-4">
                {data.stats.map((stat, i) => {
                  const Icon = resolveStatIcon(stat);
                  return (
                    <div key={`${stat.label}-${i}`} className="flex flex-col items-start gap-1.5">
                      <Icon className="size-5 text-[#FF6C00]" aria-hidden />
                      <p className="text-xl font-bold leading-none text-white">{stat.value}</p>
                      <p className="text-xs text-neutral-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Social links */}
            {socialLinks.length > 0 ? (
            <div className="mt-5">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-neutral-600">
                Follow us
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map(({ href, label, Icon, bg }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:scale-105 ${bg}`}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
            ) : null}

            {/* India badge */}
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
              <span className="text-sm leading-none" aria-label="Indian flag">🇮🇳</span>
              <span className="text-xs font-medium text-neutral-500">Proudly made in India</span>
            </div>
          </div>

          {/* ── Nav sections ── */}
          {data.sections.map((section) => (
            <div key={section.title}>
              <div className="mb-3.5 flex items-center gap-2">
                <span className="h-1 w-3 shrink-0 rounded-full bg-[#FF6C00]" aria-hidden />
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  {section.title}
                </h4>
              </div>
              <ul className="space-y-2.5">
                {(section.links || []).map((link) => (
                  <li key={`${section.title}-${link.href}`}>
                    <Link
                      href={link.href || "#"}
                      className="group inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-white"
                    >
                      <span className="h-px w-0 rounded-full bg-[#FF6C00] transition-all duration-200 group-hover:w-3" aria-hidden />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ── Newsletter column ── */}
          {newsletterEnabled && (
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="mb-3.5 flex items-center gap-2">
                <span className="h-1 w-3 shrink-0 rounded-full bg-[#FF6C00]" aria-hidden />
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Newsletter</h4>
              </div>
              <p className="text-sm text-neutral-500">
                Subscribe to get updates on new businesses, tips &amp; offers.
              </p>
              <form
                className="mt-3 flex gap-2"
                action={footer!.newsletter!.actionUrl}
                method="post"
                aria-label="Footer newsletter subscription"
              >
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-sm text-white outline-none placeholder:text-neutral-600 transition-colors focus:border-[#FF6C00]/60 focus:bg-white/[0.08] focus:ring-0"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF6C00] text-white transition-all hover:bg-[#e85c00] active:scale-[0.97]"
                >
                  <Send className="size-4" aria-hidden />
                </button>
              </form>
              <p className="mt-2.5 flex items-center gap-1.5 text-xs text-neutral-600">
                <Lock className="size-3" aria-hidden />
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>

        {/* ── Category / city directory + trust badges — one unified card ── */}
        {(data.directorySections.length > 0 || TRUST_BADGES.length > 0) && (
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            {data.directorySections.length > 0 && (
              <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
                {data.directorySections.map((section) => (
                  <div key={section.title}>
                    <div className="mb-3.5 flex items-center gap-2">
                      <span className="h-1 w-3 shrink-0 rounded-full bg-[#FF6C00]" aria-hidden />
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                        {section.title}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-2">
                      {(section.links || []).map((link) => (
                        <Link
                          key={`${section.title}-${link.href}`}
                          href={link.href || "#"}
                          className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-neutral-500 transition-colors hover:border-[#FF6C00]/40 hover:text-white"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Trust badges ── */}
            <div
              className={`grid grid-cols-2 gap-3 lg:grid-cols-4 ${
                data.directorySections.length > 0 ? "mt-8 border-t border-white/[0.06] pt-6" : ""
              }`}
            >
              {TRUST_BADGES.map(({ title, description, Icon }) => (
                <div
                  key={title}
                  className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#FF6C00]/20 bg-[#FF6C00]/10 text-[#ff6c00]">
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Payments & certification badges ── */}
        <div className="mt-8 flex flex-col gap-6 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500">Secure Payments</p>
            <div className="flex flex-wrap items-center gap-2">
              {["Razorpay", "VISA", "Mastercard", "UPI"].map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-neutral-400"
                >
                  <CreditCard className="size-3.5 text-neutral-500" aria-hidden />
                  {name}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 sm:text-right">
              Verified &amp; Certified
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-neutral-400">
                <Lock className="size-3.5 text-emerald-500" aria-hidden />
                SSL Secure Connection
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-neutral-400">
                <ShieldCheck className="size-3.5 text-emerald-500" aria-hidden />
                GDPR Protected
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-medium text-neutral-500">{siteName}</span>. {data.legalText}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
            <Link href="/privacy" className="text-xs text-neutral-600 transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <span className="h-3 w-px bg-neutral-800" aria-hidden />
            <Link href="/terms" className="text-xs text-neutral-600 transition-colors hover:text-white">
              Terms
            </Link>
            <span className="h-3 w-px bg-neutral-800" aria-hidden />
            <Link
              href={data.sitemapHref || "/site-map"}
              className="text-xs text-neutral-600 transition-colors hover:text-white"
            >
              {data.sitemapLabel}
            </Link>
            <span className="hidden h-3 w-px bg-neutral-800 sm:block" aria-hidden />
            <span className="hidden text-xs text-neutral-600 sm:block">
              {siteName} &mdash; Markets near you
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
