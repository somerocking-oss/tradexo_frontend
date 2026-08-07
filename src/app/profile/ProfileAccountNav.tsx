"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  Heart,
  LayoutDashboard,
  MessageCircle,
  PlusCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  icon: typeof User;
  exact?: boolean;
}> = [
  { href: "/profile", label: "My Profile", icon: User, exact: true },
  { href: "/profile/saved", label: "Saved Businesses", icon: Heart },
  { href: "/profile/requirements", label: "My Requirements", icon: FileText },
  { href: "/profile/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard", label: "Seller Dashboard", icon: LayoutDashboard },
  { href: "/register-business", label: "List a Business", icon: PlusCircle },
];

export function ProfileAccountNav({ compact }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account navigation"
      className={cn(compact ? "flex gap-1 overflow-x-auto pb-1" : "space-y-0.5")}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 text-sm font-medium transition-colors duration-150",
              compact
                ? "shrink-0 whitespace-nowrap rounded-lg px-3 py-2"
                : "rounded-lg px-3 py-2.5",
              active
                ? "border-l-2 border-[#FF6C00] bg-[#FF6C00]/5 text-[#FF6C00]"
                : "border-l-2 border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                active ? "text-[#FF6C00]" : "text-neutral-400"
              )}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ProfileSellerCta() {
  return (
    <div className="rounded-xl border border-[#D4D4D4] bg-gradient-to-br from-[#F0F0F0] to-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF6C00] text-white shadow-sm">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Grow as a seller</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            List your business free and start receiving calls, WhatsApp leads &amp; RFQs.
          </p>
          <Link
            href="/register-business"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#FF6C00] transition-colors hover:text-[#E86200]"
          >
            Register now →
          </Link>
        </div>
      </div>
    </div>
  );
}
