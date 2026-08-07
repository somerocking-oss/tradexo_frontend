"use client";

import { useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { verifyBusinessGstin } from "@/lib/api/kyc";
import type { BusinessKycProfile } from "@/types";

interface KycGstinSectionProps {
  businessId: string;
  profile: BusinessKycProfile;
  onVerified: (profile: BusinessKycProfile) => void;
}

export function KycGstinSection({ businessId, profile, onVerified }: KycGstinSectionProps) {
  const [gstin, setGstin] = useState(profile.gstin || "");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async () => {
    if (!gstin.trim()) {
      setError("Enter your GSTIN to verify");
      return;
    }
    setVerifying(true);
    setError("");
    setSuccess("");
    try {
      const res = await verifyBusinessGstin(businessId, gstin.trim());
      if (res.success && res.data) {
        onVerified(res.data);
        setSuccess(res.message || "GSTIN saved");
      } else {
        setError(res.message || "GSTIN verification failed");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "GSTIN verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const statusBadge = () => {
    if (profile.gstVerificationStatus === "verified") {
      return <Badge variant="success">Verified</Badge>;
    }
    if (profile.gstVerificationStatus === "format_valid") {
      return <Badge variant="warning">Format Valid — Pending Live Check</Badge>;
    }
    if (profile.gstVerificationStatus === "invalid") {
      return <Badge variant="outline">Invalid</Badge>;
    }
    return null;
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
        <ShieldCheck className="h-5 w-5 text-violet-600" />
        GST Verification
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Add your GSTIN to unlock a verified badge on your public profile — buyers trust verified suppliers more.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-slate-600">GSTIN</label>
          <Input
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="e.g. 27AAPFU0939F1ZV"
            maxLength={15}
          />
        </div>
        <Button type="button" loading={verifying} onClick={handleVerify}>
          <BadgeCheck className="h-4 w-4" /> Verify GSTIN
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {statusBadge()}
        {profile.gstLegalName && (
          <span className="text-sm text-slate-600">Registered as: {profile.gstLegalName}</span>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && !error && <p className="mt-3 text-sm text-emerald-700">{success}</p>}
    </section>
  );
}
