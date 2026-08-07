"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { buttonClassName } from "@/components/ui/button";
import { getUserDisplayName } from "@/lib/user";

export function NavbarAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return <div className="hidden h-9 w-[4.5rem] md:block" aria-hidden />;
  }

  if (isAuthenticated) {
    return (
      <div className="relative hidden md:block">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 rounded-md border border-[#e0e0e0] bg-white px-3 py-2 text-sm font-medium text-[#333] transition hover:border-[#ff6c00] hover:text-[#ff6c00]"
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="max-w-[120px] truncate">{getUserDisplayName(user)}</span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </button>
        {menuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default bg-transparent"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <Link
                href="/profile/saved"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                <Heart className="h-4 w-4" /> Saved
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" /> Seller Portal
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className={buttonClassName({
        variant: "ghost",
        size: "sm",
        className: "hidden font-semibold text-neutral-800 md:inline-flex hover:text-[#ff6c00]",
      })}
    >
      <User className="h-4 w-4" />
      Login / Sign Up
    </Link>
  );
}
