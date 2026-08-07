"use client";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  LocateFixed,
  Phone,
  Search,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import type { BuyerSellerHubSection, HubButton, HubSide } from "@/lib/cms";

const ICON_MAP: Record<string, LucideIcon> = {
  Search,
  Building2,
  ArrowRight,
  LocateFixed,
  FileText,
  Wallet,
  ShieldCheck,
  Phone,
};

const DEFAULT_SECTION: BuyerSellerHubSection = {
  title: "One Platform. Two Superpowers.",
  subtitle: `${SITE_NAME} — local services + B2B sourcing in one place`,
  buyer: {
    badge: "For Buyers",
    badgeIcon: "Search",
    title: "Find & Compare Suppliers",
    description:
      "Search by city & category. Call, WhatsApp, or get quotes instantly — all in one place.",
    bulletPoints: [
      "Verified businesses with ratings & reviews",
      "Direct Call + WhatsApp on every listing",
      "Post open RFQ — multiple suppliers respond",
      "MOQ, catalogue & turnover on B2B profiles",
    ],
    buttons: [
      { label: "Search Businesses", href: "/listings", variant: "default", icon: "ArrowRight" },
      {
        label: "Near Me Map",
        href: "/listings/near-me/map",
        variant: "outline-sky",
        icon: "LocateFixed",
      },
      {
        label: "Post Requirement",
        href: "/post-requirement",
        variant: "outline-amber",
        icon: "FileText",
      },
      { label: "My Quotes Inbox", href: "/profile/requirements", variant: "outline-sky", icon: "" },
    ],
  },
  seller: {
    badge: "For Sellers",
    badgeIcon: "Building2",
    title: "Get Leads. Grow Revenue.",
    description:
      "Free listing, KYC verification, lead inbox & analytics — reach more buyers across India.",
    bulletPoints: [
      "Free business listing in minutes",
      "Leads inbox with status tracking",
      "Profile score & KYC for higher ranking",
      "Premium plans for featured visibility",
    ],
    buttons: [
      {
        label: "List Business Free",
        href: "/register-business",
        variant: "emerald",
        icon: "ArrowRight",
      },
      { label: "Leads Inbox", href: "/dashboard/leads", variant: "outline-emerald", icon: "" },
      { label: "Wallet", href: "/dashboard/wallet", variant: "outline-emerald", icon: "Wallet" },
      { label: "Seller Portal", href: "/dashboard", variant: "outline-emerald", icon: "" },
    ],
  },
};

function resolveIcon(name?: string): LucideIcon | null {
  if (!name) return null;
  return ICON_MAP[name] || null;
}

function HubButtonLink({ button, theme }: { button: HubButton; theme: "buyer" | "seller" }) {
  const Icon = resolveIcon(button.icon);
  const variant = button.variant || "default";
  const href = button.href || "#";

  const isPrimary = variant === "default" || variant === "emerald";

  let btnClass = "";
  if (variant === "emerald") {
    btnClass = "bg-[#16A34A] hover:bg-[#15803D] text-white shadow-[0_2px_8px_rgba(22,163,74,0.25)] hover:shadow-[0_4px_14px_rgba(22,163,74,0.30)]";
  } else if (variant === "default") {
    btnClass = "bg-[#FF6C00] hover:bg-[#E86200] text-white shadow-[0_2px_8px_rgba(255,108,0,0.25)] hover:shadow-[0_4px_14px_rgba(255,108,0,0.30)]";
  } else if (variant === "outline-sky") {
    btnClass = "border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] hover:border-[#93C5FD]";
  } else if (variant === "outline-amber") {
    btnClass = "border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF3C7] hover:border-[#FCD34D]";
  } else if (variant === "outline-emerald") {
    btnClass = "border border-[#BBF7D0] bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7] hover:border-[#86EFAC]";
  }

  return (
    <Button
      href={href}
      variant={isPrimary ? "primary" : "outline"}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${btnClass}`}
    >
      {Icon && !isPrimary ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
      {button.label}
      {Icon && isPrimary ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
    </Button>
  );
}

function HubSidePanel({
  data,
  theme,
}: {
  data: HubSide;
  theme: "buyer" | "seller";
}) {
  const BadgeIcon = resolveIcon(data.badgeIcon) || (theme === "buyer" ? Search : Building2);
  const BulletIcon = theme === "buyer" ? ShieldCheck : CheckCircle2;

  const isBuyer = theme === "buyer";

  const accentColor = isBuyer ? "#2563EB" : "#16A34A";
  const badgeBg = isBuyer ? "bg-[#2563EB]" : "bg-[#16A34A]";
  const borderColor = isBuyer ? "border-[#BFDBFE]" : "border-[#BBF7D0]";
  const bgGradient = isBuyer
    ? "from-[#EFF6FF] to-white"
    : "from-[#F0FDF4] to-white";
  const bulletColor = isBuyer ? "text-[#2563EB]" : "text-[#16A34A]";
  const accentBarClass = isBuyer ? "bg-[#2563EB]" : "bg-[#16A34A]";

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-xl border-2 ${borderColor} bg-gradient-to-br ${bgGradient} p-6 shadow-sm transition-all duration-200 hover:shadow-md sm:p-8`}
    >
      {/* Top accent bar */}
      <div className={`absolute left-0 right-0 top-0 h-0.5 ${accentBarClass}`} aria-hidden />

      {/* Badge */}
      <div
        className={`mb-5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white ${badgeBg}`}
      >
        <BadgeIcon className="h-3.5 w-3.5" aria-hidden />
        {data.badge}
      </div>

      <h3 className="text-xl font-bold text-[#171717] sm:text-2xl">{data.title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-[#525252]">{data.description}</p>

      <ul className="mt-5 space-y-2.5 text-sm text-[#404040]" role="list">
        {(data.bulletPoints || []).map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <BulletIcon
              className={`mt-0.5 h-4 w-4 shrink-0 ${bulletColor}`}
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap gap-2.5">
        {(data.buttons || [])
          .filter((btn) => btn.label?.trim())
          .map((btn, index) => (
            <HubButtonLink key={`${btn.label}-${index}`} button={btn} theme={theme} />
          ))}
      </div>
    </div>
  );
}

export function BuyerSellerHub({ section }: { section?: BuyerSellerHubSection }) {
  const data = {
    title: section?.title || DEFAULT_SECTION.title,
    subtitle: section?.subtitle || DEFAULT_SECTION.subtitle,
    buyer: { ...DEFAULT_SECTION.buyer!, ...section?.buyer },
    seller: { ...DEFAULT_SECTION.seller!, ...section?.seller },
  };

  if (section?.buyer?.bulletPoints?.length) {
    data.buyer.bulletPoints = section.buyer.bulletPoints;
  }
  if (section?.seller?.bulletPoints?.length) {
    data.seller.bulletPoints = section.seller.bulletPoints;
  }
  if (section?.buyer?.buttons?.length) {
    data.buyer.buttons = section.buyer.buttons;
  }
  if (section?.seller?.buttons?.length) {
    data.seller.buttons = section.seller.buttons;
  }

  return (
    <section
      className="bg-[#F4F6F9] px-4 py-12 sm:px-6 sm:py-14"
      aria-labelledby="hub-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4D4D4] bg-[#F0F0F0] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6C00]" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6C00]">
              Platform
            </span>
          </div>
          <h2
            id="hub-heading"
            className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl"
          >
            {data.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-[#737373]">
            {data.subtitle}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <HubSidePanel data={data.buyer} theme="buyer" />
          <HubSidePanel data={data.seller} theme="seller" />
        </div>
      </div>
    </section>
  );
}
