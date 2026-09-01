"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Camera,
  ChevronRight,
  Copy,
  Gift,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { extractBusinessList, getMyBusinesses } from "@/lib/api/business";
import { apiPut } from "@/lib/api/client";
import { getReferralStats } from "@/lib/api/referral";
import { getUserDisplayName } from "@/lib/user";
import { formatPhone } from "@/lib/utils";
import { ProfileAccountNav, ProfileSellerCta } from "./ProfileAccountNav";
import { ProfilePageLoading } from "./ProfilePageLoading";
import type { Business } from "@/types";

const ACTION_CARDS = [
  {
    href: "/post-requirement",
    icon: ShoppingBag,
    label: "Post Requirement",
    hint: "Get free quotes",
    iconBg: "bg-[#E5E5E5]",
    iconColor: "text-[#FF6C00]",
  },
  {
    href: "/listings",
    icon: Search,
    label: "Browse Listings",
    hint: "Find suppliers",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    href: "/profile/saved",
    icon: Heart,
    label: "Saved",
    hint: "Bookmarked businesses",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    href: "/profile/messages",
    icon: MessageCircle,
    label: "Messages",
    hint: "Seller chats",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
] as const;

function getProfileComplete(user: { name?: string | null; email?: string | null; mobile?: string }) {
  let score = 0;
  if (user.mobile?.trim()) score += 40;
  if (user.name?.trim()) score += 35;
  if (user.email?.trim()) score += 25;
  return score;
}

export default function ProfileHubView() {
  const { user, isAuthenticated, loading, updateUser, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [referral, setReferral] = useState<{
    referralCode: string;
    signups: number;
    creditsEarned: number;
    shareUrl: string;
    rewardAmount: number;
  } | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyBusinesses().then((res) => {
      if (res.success && res.data) setBusinesses(extractBusinessList(res.data));
    });
    getReferralStats().then((res) => {
      if (res.success && res.data) setReferral(res.data);
    });
  }, [isAuthenticated]);

  const profileComplete = useMemo(
    () => (user ? getProfileComplete(user) : 0),
    [user]
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    if (!user) return;

    try {
      const res = await apiPut<{ name?: string; email?: string }>("/users/profile", { name, email });
      if (res.success) {
        setMessage("Profile updated successfully");
        if (res.data && typeof res.data === "object") {
          updateUser({ ...user, ...res.data });
        } else {
          await refreshUser();
        }
      }
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const copyReferral = async () => {
    if (!referral?.shareUrl) return;
    await navigator.clipboard.writeText(referral.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user) {
    return <ProfilePageLoading />;
  }

  const initials = (user.name || user.mobile || "U")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const displayName = getUserDisplayName(user);

  return (
    <div className="min-h-screen bg-neutral-50" data-profile-version="2026-v3">

      {/* ── Hero band ── */}
      <div className="border-b border-neutral-100 bg-white px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-8xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1 text-xs text-neutral-400">
            <Link href="/" className="transition-colors hover:text-[#FF6C00]">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            <span className="font-medium text-neutral-600">My Account</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Identity */}
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#FF6C00] text-2xl font-bold text-white shadow-lg shadow-[#FF6C00]/20">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#E5E5E5] px-2.5 py-0.5 text-xs font-semibold text-[#FF6C00]">
                    Buyer &amp; Seller Hub
                  </span>
                  {user.role?.slug && (
                    <Badge variant="outline" className="capitalize">
                      {user.role.slug.replace(/-/g, " ")}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  {displayName}
                </h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#FF6C00]" />
                    {formatPhone(user.mobile) || user.mobile}
                  </span>
                  {user.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[#FF6C00]" />
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats + logout */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-neutral-100 bg-white px-5 py-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-neutral-900">{businesses.length}</p>
                <p className="mt-0.5 text-xs font-medium text-neutral-400">Businesses</p>
              </div>
              <div className="rounded-xl border border-[#D4D4D4] bg-white px-5 py-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-[#FF6C00]">{profileComplete}%</p>
                <p className="mt-0.5 text-xs font-medium text-neutral-400">Complete</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="gap-2 border-neutral-200 text-neutral-600 hover:border-red-200 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Profile completion bar */}
          {profileComplete < 100 && (
            <div className="mt-6 rounded-xl border border-[#D4D4D4] bg-[#F0F0F0] p-4">
              <div className="mb-2.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-neutral-700">Complete your profile</span>
                <span className="font-bold text-[#FF6C00]">{profileComplete}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#D4D4D4]">
                <div
                  className="h-full rounded-full bg-[#FF6C00] transition-all duration-500"
                  style={{ width: `${profileComplete}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile nav strip ── */}
      <div className="sticky top-0 z-20 border-b border-neutral-100 bg-white px-4 py-2.5 shadow-sm lg:hidden">
        <ProfileAccountNav compact />
      </div>

      {/* ── Quick action strip ── */}
      <div className="border-b border-neutral-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto grid max-w-8xl grid-cols-2 gap-3 sm:grid-cols-4">
          {ACTION_CARDS.map(({ href, icon: Icon, label, hint, iconBg, iconColor }) => (
            <Link key={href} href={href} className="group">
              <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 transition-all duration-200 hover:border-[#FF6C00]/20 hover:bg-white hover:shadow-md hover:-translate-y-0.5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900">{label}</p>
                  <p className="truncate text-xs text-neutral-400">{hint}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">

          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Avatar card */}
              <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF6C00] text-xl font-bold text-white shadow-md shadow-[#FF6C00]/20">
                      {initials}
                    </div>
                    <button
                      type="button"
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-neutral-100 text-neutral-500 transition-colors hover:bg-[#E5E5E5] hover:text-[#FF6C00]"
                      title="Upload photo"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{displayName}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {formatPhone(user.mobile) || user.mobile}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <div className="rounded-xl border border-neutral-100 bg-white p-3 shadow-sm">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Account
                </p>
                <ProfileAccountNav />
              </div>

              <ProfileSellerCta />
            </div>
          </aside>

          {/* ── Content column ── */}
          <div className="space-y-6">

            {/* ── Edit profile card ── */}
            <div className="rounded-xl border border-neutral-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-neutral-100 px-6 py-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E5E5E5] text-[#FF6C00]">
                  <Settings className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">Personal Details</h2>
                  <p className="text-sm text-neutral-400">Name, email &amp; verified mobile</p>
                </div>
              </div>

              <div className="p-6">
                {/* Photo upload area */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF6C00] text-xl font-bold text-white shadow-sm">
                      {initials}
                    </div>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 px-6 py-4 transition-colors hover:border-[#FF6C00]/40 hover:bg-[#F0F0F0]">
                      <Camera className="h-5 w-5 text-neutral-400" />
                      <span className="text-xs font-medium text-neutral-500">Upload photo</span>
                      <span className="text-xs text-neutral-400">PNG, JPG up to 2 MB</span>
                      <input type="file" accept="image/*" className="sr-only" />
                    </label>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Full Name
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="h-10 rounded-lg border-neutral-300 text-sm focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="h-10 rounded-lg border-neutral-300 text-sm focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                      Mobile (verified)
                    </label>
                    <div className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-600">
                      <Phone className="h-4 w-4 shrink-0 text-[#FF6C00]" />
                      <span className="flex-1">{user.mobile}</span>
                      <Badge variant="success" className="shrink-0">Verified</Badge>
                    </div>
                  </div>

                  {message && (
                    <div
                      className={`rounded-lg px-4 py-2.5 text-sm font-medium ${
                        message.includes("success")
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={saving}
                    className="bg-[#FF6C00] font-semibold text-white shadow-sm hover:bg-[#E86200] active:scale-[0.98]"
                  >
                    Save Changes
                  </Button>
                </form>
              </div>
            </div>

            {/* ── Refer & Earn card ── */}
            <div className="overflow-hidden rounded-xl border border-[#D4D4D4] bg-white shadow-sm">
              <div className="grid sm:grid-cols-[1fr_auto]">
                <div className="bg-gradient-to-br from-[#F0F0F0] to-white p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6C00] text-white shadow-sm">
                      <Gift className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-neutral-900">Refer &amp; Earn</h2>
                      <p className="mt-0.5 text-sm text-neutral-500">
                        Earn ₹{referral?.rewardAmount || 50} per business signup
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-neutral-100 bg-white p-3 text-center shadow-sm">
                      <p className="text-base font-bold text-[#FF6C00]">
                        {referral?.referralCode || "—"}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-neutral-400">Code</p>
                    </div>
                    <div className="rounded-xl border border-neutral-100 bg-white p-3 text-center shadow-sm">
                      <p className="text-base font-bold text-neutral-900">{referral?.signups || 0}</p>
                      <p className="mt-0.5 text-xs font-medium text-neutral-400">Signups</p>
                    </div>
                    <div className="rounded-xl border border-neutral-100 bg-white p-3 text-center shadow-sm">
                      <p className="text-base font-bold text-neutral-900">
                        ₹{referral?.creditsEarned || 0}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-neutral-400">Earned</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center border-t border-[#D4D4D4] bg-white p-5 sm:border-l sm:border-t-0">
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-neutral-200 text-neutral-700 hover:border-[#FF6C00] hover:text-[#FF6C00] sm:w-auto"
                    onClick={copyReferral}
                    disabled={!referral?.shareUrl}
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy link"}
                  </Button>
                </div>
              </div>
            </div>

            {/* ── My Businesses card ── */}
            <div className="rounded-xl border border-neutral-100 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E5E5E5] text-[#FF6C00]">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">My Businesses</h2>
                    <p className="text-sm text-neutral-400">Listings you manage</p>
                  </div>
                </div>
                <Button
                  href="/register-business"
                  size="sm"
                  className="shrink-0 bg-[#FF6C00] text-sm font-semibold text-white shadow-sm hover:bg-[#E86200] active:scale-[0.98]"
                >
                  <Building2 className="h-4 w-4" />
                  Add Business
                </Button>
              </div>

              <div className="p-6">
                {businesses.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
                    <Building2 className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                    <p className="text-base font-semibold text-neutral-700">No businesses yet</p>
                    <p className="mt-1 text-sm text-neutral-400">
                      List free and start getting calls &amp; WhatsApp leads
                    </p>
                    <Button
                      href="/register-business"
                      className="mt-5 bg-[#FF6C00] font-semibold text-white hover:bg-[#E86200]"
                    >
                      Register your business
                    </Button>
                  </div>
                ) : (
                  <ul className="divide-y divide-neutral-50 overflow-hidden rounded-xl border border-neutral-100">
                    {businesses.map((b) => (
                      <li key={b._id}>
                        <Link
                          href={`/dashboard/business/${b._id}/edit`}
                          className="flex items-center justify-between gap-3 px-4 py-4 transition-colors duration-150 hover:bg-[#F0F0F0]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5E5E5] text-[#FF6C00]">
                              <Building2 className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-neutral-900">{b.name}</p>
                              {b.city && (
                                <p className="flex items-center gap-1 truncate text-xs text-neutral-400">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  {b.city}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge
                              variant={b.isVerified ? "success" : "outline"}
                              className="capitalize"
                            >
                              {b.status || "active"}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-neutral-300" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {businesses.length > 0 && (
                  <Link
                    href="/dashboard"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6C00] transition-colors hover:text-[#E86200]"
                  >
                    Open seller dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile: seller CTA */}
            <div className="lg:hidden">
              <ProfileSellerCta />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
