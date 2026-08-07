"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { extractBusinessList, getMyBusinesses } from "@/lib/api/business";
import { loadRazorpayScript, verifyPayment } from "@/lib/api/payment";
import { createWalletTopupOrder, getWallet, type WalletInfo } from "@/lib/api/wallet";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Business } from "@/types";

const TOPUP_PRESETS = [200, 500, 1000, 2000];

export default function WalletPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getMyBusinesses().then((res) => {
      if (res.success && res.data) {
        const list = extractBusinessList(res.data);
        setBusinesses(list);
        if (list.length === 1) setBusinessId(String(list[0]._id));
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!businessId) {
      setWallet(null);
      return;
    }
    getWallet(businessId).then((res) => {
      if (res.success && res.data) setWallet(res.data);
    });
  }, [businessId]);

  const runTopup = async (amount: number) => {
    if (!businessId) {
      setError("Select a business first");
      return;
    }

    setTopupLoading(amount);
    setError("");
    setMessage("");

    try {
      const orderRes = await createWalletTopupOrder(businessId, amount);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || "Could not create top-up order");
      }

      const { order, keyId, paymentsEnabled } = orderRes.data;
      if (!paymentsEnabled || !keyId) {
        throw new Error("Razorpay not configured on backend");
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Failed to load Razorpay");
      }

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Tradexo Wallet",
          description: `Wallet top-up ₹${amount}`,
          order_id: order.id,
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.mobile || "",
          },
          theme: { color: "#0284c7" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await verifyPayment(response);
              if (!verifyRes.success) {
                reject(new Error(verifyRes.message || "Verification failed"));
                return;
              }
              const balance = verifyRes.data?.walletCredit?.balance;
              setMessage(`Wallet topped up! New balance: ₹${balance ?? amount}`);
              const walletRes = await getWallet(businessId);
              if (walletRes.success && walletRes.data) setWallet(walletRes.data);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        });
        rzp.open();
      });
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Top-up failed";
      setError(msg);
    } finally {
      setTopupLoading(null);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading wallet...</div>;
  }

  return (
    <div className="px-4 lg:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Business Wallet</h1>
        <p className="mt-1 text-slate-600">
          Top up wallet to unlock RFQ leads instantly — pay-as-you-go
        </p>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-slate-600">
            Register a business first to use wallet.
          </CardBody>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardBody className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Business</label>
                <select
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#ff6c00]"
                >
                  <option value="">Select business...</option>
                  {businesses.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {wallet && (
                <div className="rounded-2xl bg-gradient-to-br from-[#ff6c00] to-[#ff8533] p-6 text-white">
                  <p className="text-sm text-[#e8e8e8]">Available balance</p>
                  <p className="mt-1 text-4xl font-bold">₹{wallet.balance}</p>
                  <p className="mt-2 text-sm text-[#e8e8e8]">
                    Unlock 1 RFQ lead = ₹{wallet.unlockPrice}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="mb-6">
            <CardBody>
              <h2 className="mb-4 font-semibold text-slate-900">Quick Top-up</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TOPUP_PRESETS.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    loading={topupLoading === amount}
                    disabled={!businessId || !!topupLoading}
                    onClick={() => runTopup(amount)}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Input
                  type="number"
                  min={100}
                  placeholder="Custom amount (min ₹100)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
                <Button
                  loading={topupLoading === Number(customAmount)}
                  disabled={!businessId || !customAmount || Number(customAmount) < 100 || !!topupLoading}
                  onClick={() => runTopup(Number(customAmount))}
                >
                  Add
                </Button>
              </div>

              {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
