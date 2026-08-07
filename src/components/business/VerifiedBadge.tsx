"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_LABELS: Record<string, string> = {
  basic: "Verified",
  trusted: "Trusted",
  premium: "TrustSEAL Verified",
};

interface VerifiedBadgeProps {
  isVerified?: boolean;
  verificationLevel?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

const LEVEL_CLASSNAMES: Record<string, string> = {
  basic: "border-sky-200 bg-sky-50 text-sky-700",
  trusted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  premium: "border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800",
};

export function VerifiedBadge({
  isVerified,
  verificationLevel,
  size = "sm",
  showIcon = true,
  className,
}: VerifiedBadgeProps) {
  if (!isVerified) return null;

  const level = verificationLevel && verificationLevel !== "none" ? verificationLevel : "basic";
  const label = LEVEL_LABELS[level] || "Verified";
  const levelClassName = LEVEL_CLASSNAMES[level] || LEVEL_CLASSNAMES.basic;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        levelClassName,
        size === "md" && "px-2.5 py-1 text-xs",
        className
      )}
    >
      {showIcon && <ShieldCheck className="mr-1 h-3 w-3" />}
      {label}
    </span>
  );
}

export function VerificationStatusBanner({
  isVerified,
  verificationLevel,
  profileCompletionPercent,
}: {
  isVerified?: boolean;
  verificationLevel?: string;
  profileCompletionPercent?: number;
}) {
  if (isVerified) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-900">
            Business verified by Tradexo
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            Your listing shows the verified badge to buyers
            {verificationLevel && verificationLevel !== "none"
              ? ` (${LEVEL_LABELS[verificationLevel] || "Verified"})`
              : ""}
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-semibold text-amber-900">Not verified yet</p>
        <p className="mt-1 text-sm text-amber-800">
          Complete KYC and upload GST/PAN documents. Admin will review and grant the
          verified badge
          {typeof profileCompletionPercent === "number"
            ? ` (profile score: ${profileCompletionPercent}%)`
            : ""}
          .
        </p>
      </div>
    </div>
  );
}
