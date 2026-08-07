"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Lock, Wallet } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { Business, Lead } from "@/types";

const PAY_PER_LEAD_PRICE = 49;

interface UnlockLeadModalProps {
  lead: Lead | null;
  businesses: Business[];
  creditsLeft?: number;
  walletBalance?: number;
  onClose: () => void;
  onUnlockWithCredit: (businessId: string) => Promise<void>;
  onUnlockWithWallet: (businessId: string) => Promise<void>;
  onPayAndUnlock: (businessId: string) => Promise<void>;
}

export function UnlockLeadModal({
  lead,
  businesses,
  creditsLeft,
  walletBalance,
  onClose,
  onUnlockWithCredit,
  onUnlockWithWallet,
  onPayAndUnlock,
}: UnlockLeadModalProps) {
  const [businessId, setBusinessId] = useState("");
  const [loading, setLoading] = useState<"credit" | "wallet" | "pay" | null>(null);
  const [error, setError] = useState("");

  const hasCredits = creditsLeft == null || creditsLeft > 0;
  const canUseWallet = (walletBalance ?? 0) >= PAY_PER_LEAD_PRICE;

  const runAction = async (mode: "credit" | "wallet" | "pay") => {
    if (!businessId) {
      setError("Select a business to unlock with");
      return;
    }

    setLoading(mode);
    setError("");
    try {
      if (mode === "credit") await onUnlockWithCredit(businessId);
      else if (mode === "wallet") await onUnlockWithWallet(businessId);
      else await onPayAndUnlock(businessId);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Could not unlock lead");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Modal
      open={!!lead}
      onClose={() => !loading && onClose()}
      title="Unlock RFQ Lead"
    >
      {lead && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <Lock className="h-4 w-4" /> Unlock lead contact
            </div>
            <p>
              View buyer phone & email for <strong>{lead.productName || "this RFQ"}</strong>.
            </p>
            <div className="mt-2 space-y-1 text-sm">
              {creditsLeft != null && <p>Plan credits: <strong>{creditsLeft}</strong></p>}
              {walletBalance != null && <p>Wallet balance: <strong>₹{walletBalance}</strong></p>}
            </div>
          </div>

          {businesses.length === 0 ? (
            <p className="text-sm text-slate-600">Register a business first to unlock leads.</p>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Unlock using business
              </label>
              <select
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#ff6c00]"
              >
                <option value="">Choose business...</option>
                {businesses.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} {b.city ? `(${b.city})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              loading={loading === "credit"}
              disabled={businesses.length === 0 || !hasCredits || !!loading}
              onClick={() => runAction("credit")}
            >
              <Lock className="h-4 w-4" /> Use 1 Plan Credit
            </Button>

            <Button
              className="w-full bg-violet-600 hover:bg-violet-700"
              loading={loading === "wallet"}
              disabled={businesses.length === 0 || !canUseWallet || !!loading}
              onClick={() => runAction("wallet")}
            >
              <Wallet className="h-4 w-4" /> Pay from Wallet (₹{PAY_PER_LEAD_PRICE})
            </Button>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              loading={loading === "pay"}
              disabled={businesses.length === 0 || !!loading}
              onClick={() => runAction("pay")}
            >
              <CreditCard className="h-4 w-4" /> Pay ₹{PAY_PER_LEAD_PRICE} via Razorpay
            </Button>

            {!canUseWallet && (
              <Link href="/dashboard/wallet" className="text-center text-sm text-violet-600 hover:underline">
                Top up wallet →
              </Link>
            )}

            <Link href="/plans" className="text-center text-sm text-[#ff6c00] hover:underline">
              Need more credits? Upgrade plan →
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
