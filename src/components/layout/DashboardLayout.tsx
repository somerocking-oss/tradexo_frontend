"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronRight,
  ExternalLink,
  Gift,
  GitBranch,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  PlusCircle,
  Receipt,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SITE_NAME } from "@/lib/constants";
import { getUserDisplayName } from "@/lib/user";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/dashboard/NotificationBell";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/leads", label: "Leads Inbox", icon: Inbox },
  { href: "/dashboard/catalog", label: "Catalog", icon: Package },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/offers", label: "Offers", icon: Gift },
  { href: "/dashboard/branches", label: "Branches", icon: GitBranch },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/billing", label: "Billing", icon: Receipt },
  { href: "/register-business", label: "Add Business", icon: PlusCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#0B3B6F]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6c00] text-white">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="hidden sm:inline">{SITE_NAME}</span>
            </Link>
            <ChevronRight className="hidden h-4 w-4 text-[#ddd] sm:block" />
            <span className="hidden text-sm font-semibold text-[#ff6c00] sm:inline">Seller Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              href="/"
              variant="ghost"
              size="sm"
              className="hidden text-white/90 hover:bg-white/10 hover:text-white sm:block"
            >
              <ExternalLink className="h-4 w-4" /> View Site
            </Button>
            <span className="hidden text-sm text-white/80 md:inline">
              {getUserDisplayName(user)}
            </span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-0 lg:gap-6 lg:px-6 lg:py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Seller Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive(item.href, item.exact)
                      ? "bg-[#e8e8e8] text-[#ff6c00] ring-1 ring-[#ffe8d6]"
                      : "text-[#666] hover:bg-[#fafafa] hover:text-[#111]"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 rounded-xl border border-[#d4d4d4] bg-[#f0f0f0] p-4">
              <ShieldCheck className="mb-2 h-5 w-5 text-[#ff6c00]" aria-hidden />
              <p className="text-sm font-semibold text-[#cc5500]">Boost Profile Score</p>
              <p className="mt-1 text-xs text-[#888]">
                Complete KYC & catalogue to rank higher in search.
              </p>
              <a href="/dashboard" className="mt-3 block text-xs font-semibold text-[#ff6c00] hover:underline">
                View tips →
              </a>
            </div>
          </div>
        </aside>

        <nav
          aria-label="Seller navigation"
          className="flex w-full gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href, item.exact) ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isActive(item.href, item.exact)
                  ? "bg-[#ff6c00] text-white"
                  : "bg-[#f5f5f5] text-[#666] hover:bg-[#ffe8d6] hover:text-[#ff6c00]"
              )}
            >
              <item.icon className="h-3.5 w-3.5" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0 flex-1 pb-10 pt-4 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
