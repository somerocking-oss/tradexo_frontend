"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  createFeatureBoostOrder,
  loadRazorpayScript,
  verifyPayment,
} from "@/lib/api/payment";
import type { Business } from "@/types";

interface FeatureBoostCardProps {
  business: Business;
  onBoosted?: () => void;
}

export function FeatureBoostCard({ business, onBoosted }: FeatureBoostCardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isFeatured = business.isFeatured;
  const featuredUntil = business.featuredUntil
    ? new Date(business.featuredUntil).toLocaleDateString("en-IN")
    : null;

  const handleBoost = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const orderRes = await createFeatureBoostOrder(String(business._id));
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || "Could not create boost order");
      }

      const data = orderRes.data;
      if (!data.paymentsEnabled || !data.keyId) {
        throw new Error("Payments not configured. Add Razorpay keys to enable boost.");
      }

      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        throw new Error("Could not load payment gateway");
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Tradexo",
        description: `Featured Boost — ${data.days} days`,
        order_id: data.order.id,
        prefill: {
          name: user?.name || "",
          contact: user?.mobile || "",
          email: user?.email || "",
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await verifyPayment(response);
          if (verifyRes.success) {
            setMessage(`Featured boost active for ${data.days} days! Your listing ranks higher now.`);
            onBoosted?.();
          } else {
            setError(verifyRes.message || "Payment verification failed");
          }
        },
      });

      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Boost failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900">Featured Listing Boost</h3>
            {isFeatured && <Badge variant="premium">Featured</Badge>}
          </div>
          <p className="text-sm text-slate-600">
            Get top visibility in search & listings for 7 days — premium featured placement.
          </p>
          {featuredUntil && (
            <p className="mt-1 text-xs text-amber-800">Featured until {featuredUntil}</p>
          )}
          <p className="mt-2 text-lg font-bold text-amber-800">₹299 / 7 days</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button
            onClick={handleBoost}
            loading={loading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <TrendingUp className="h-4 w-4" /> Boost Now
          </Button>
          <Link href="/plans" className="text-center text-xs text-[#ff6c00] hover:underline">
            Or upgrade plan
          </Link>
        </div>
      </div>
      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
