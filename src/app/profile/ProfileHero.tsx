"use client";

import Link from "next/link";
import { ChevronRight, Mail, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPhone } from "@/lib/utils";
import { getUserDisplayName } from "@/lib/user";

interface ProfileHeroProps {
  initials: string;
  name?: string | null;
  mobile?: string;
  email?: string | null;
  roleSlug?: string;
  businessCount?: number;
  profileComplete?: number;
}

export function ProfileHero({
  initials,
  name,
  mobile,
  email,
  roleSlug,
  businessCount = 0,
  profileComplete = 0,
}: ProfileHeroProps) {
  const displayName = getUserDisplayName({ name: name ?? undefined, mobile });

  return (
    <div className="border-b border-neutral-100 bg-white px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-8xl">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1 text-xs text-neutral-400">
          <Link href="/" className="transition-colors hover:text-[#FF6C00]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          <span className="font-medium text-neutral-600">My Account</span>
        </nav>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-start gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FF6C00] text-xl font-bold text-white shadow-md shadow-[#FF6C00]/20 sm:h-20 sm:w-20 sm:text-2xl">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#E5E5E5] px-2.5 py-0.5 text-xs font-semibold text-[#FF6C00]">
                  Buyer &amp; Seller Hub
                </span>
                {roleSlug && (
                  <Badge variant="outline" className="capitalize">
                    {roleSlug.replace(/-/g, " ")}
                  </Badge>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                {displayName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                {mobile && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#FF6C00]" />
                    {formatPhone(mobile) || mobile}
                  </span>
                )}
                {email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[#FF6C00]" />
                    {email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 sm:justify-end">
            <div className="min-w-[100px] rounded-xl border border-neutral-100 bg-white px-4 py-3 text-center shadow-sm">
              <p className="text-xl font-bold text-neutral-900">{businessCount}</p>
              <p className="mt-0.5 text-xs font-medium text-neutral-400">Businesses</p>
            </div>
            <div className="min-w-[100px] rounded-xl border border-[#D4D4D4] bg-white px-4 py-3 text-center shadow-sm">
              <p className="text-xl font-bold text-[#FF6C00]">{profileComplete}%</p>
              <p className="mt-0.5 text-xs font-medium text-neutral-400">Complete</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {profileComplete < 100 && (
          <div className="mt-6 rounded-xl border border-[#D4D4D4] bg-[#F0F0F0] p-4">
            <div className="mb-2.5 flex items-center justify-between gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-neutral-700">
                <ShieldCheck className="h-4 w-4 text-[#FF6C00]" />
                Complete your profile for better trust
              </span>
              <span className="font-bold text-[#FF6C00]">{profileComplete}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#D4D4D4]">
              <div
                className="h-full rounded-full bg-[#FF6C00] transition-all duration-500"
                style={{ width: `${profileComplete}%` }}
              />
            </div>
            {!name?.trim() && (
              <p className="mt-2 text-xs text-neutral-500">
                Add your full name to improve your account visibility.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProfileHeroSkeleton() {
  return (
    <div className="border-b border-neutral-100 bg-white px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-8xl animate-pulse">
        <div className="mb-5 h-3 w-32 rounded-full bg-neutral-200" />
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-2xl bg-neutral-200" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-28 rounded-full bg-neutral-200" />
            <div className="h-8 w-52 rounded-lg bg-neutral-200" />
            <div className="h-4 w-40 rounded-full bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
