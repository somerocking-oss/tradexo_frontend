"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAiSettings, suggestLeadReplyWithAi } from "@/lib/api/ai";
import { getSuggestedQuote } from "@/lib/api/lead";
import type { Business, Lead } from "@/types";

interface QuoteReplyModalProps {
  lead: Lead | null;
  businesses: Business[];
  defaultBusinessId?: string;
  onClose: () => void;
  onSubmit: (payload: {
    businessId: string;
    unitPrice: number;
    moq?: number;
    deliveryDays?: number;
    priceUnit?: string;
    message?: string;
  }) => Promise<void>;
}

export function QuoteReplyModal({
  lead,
  businesses,
  defaultBusinessId,
  onClose,
  onSubmit,
}: QuoteReplyModalProps) {
  const [businessId, setBusinessId] = useState(defaultBusinessId || "");
  const [unitPrice, setUnitPrice] = useState("");
  const [moq, setMoq] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [priceUnit, setPriceUnit] = useState("piece");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestedFrom, setSuggestedFrom] = useState("");

  useEffect(() => {
    getAiSettings()
      .then((settings) => setAiAvailable(settings.enabled && settings.features.leadReply))
      .catch(() => setAiAvailable(false));
  }, []);

  // Auto Quotation Engine — prefill from the seller's own priced product
  // catalog when this lead/business pair opens. Purely a starting point;
  // nothing is sent until the seller reviews and submits.
  useEffect(() => {
    setSuggestedFrom("");
    if (!lead?._id || !businessId) return;
    getSuggestedQuote(lead._id, businessId)
      .then((res) => {
        if (res.success && res.data) {
          setUnitPrice(String(res.data.unitPrice));
          if (res.data.moq) setMoq(String(res.data.moq));
          if (res.data.priceUnit) setPriceUnit(res.data.priceUnit);
          setSuggestedFrom(res.data.productName);
        }
      })
      .catch(() => {});
  }, [lead?._id, businessId]);

  const handleAiSuggest = async () => {
    if (!lead) return;
    setAiLoading(true);
    try {
      const res = await suggestLeadReplyWithAi({
        title: lead.productName || "Inquiry",
        message: lead.message,
        buyerName: lead.name || lead.customerName,
      });
      if (res.success && res.data?.reply) {
        setMessage(res.data.reply);
      }
    } catch {
      // Silent fail — seller can still type manually
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      setError("Select your business");
      return;
    }
    if (!unitPrice || Number(unitPrice) < 0) {
      setError("Enter a valid unit price");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit({
        businessId,
        unitPrice: Number(unitPrice),
        moq: moq ? Number(moq) : undefined,
        deliveryDays: deliveryDays ? Number(deliveryDays) : undefined,
        priceUnit,
        message: message.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to send quote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!lead} onClose={() => !loading && onClose()} title="Send Quote to Buyer">
      {lead && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="rounded-xl bg-[#e8e8e8] px-3 py-2 text-sm text-[#cc5500]">
            Quoting for: <strong>{lead.productName || lead.message || "Buyer requirement"}</strong>
            {lead.quantity ? ` · ${lead.quantity} ${lead.unit || ""}` : ""}
          </p>

          {suggestedFrom && (
            <p className="flex items-center gap-1.5 rounded-xl bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              Auto-filled from your product &quot;{suggestedFrom}&quot; — review before sending
            </p>
          )}

          {businesses.length === 0 ? (
            <p className="text-sm text-amber-700">
              No business found.{" "}
              <Link href="/register-business" className="font-semibold underline">
                Register a business
              </Link>{" "}
              first.
            </p>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Your business</label>
              <select
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#ff6c00]"
              >
                <option value="">Choose business...</option>
                {businesses.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Unit price (₹) *</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="499"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Per</label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-[#ff6c00]"
              >
                <option value="piece">Piece</option>
                <option value="kg">Kg</option>
                <option value="ton">Ton</option>
                <option value="box">Box</option>
                <option value="set">Set</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">MOQ</label>
              <Input
                type="number"
                min={1}
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
                placeholder="100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Delivery (days)</label>
              <Input
                type="number"
                min={1}
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                placeholder="7"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Message to buyer</label>
              {aiAvailable && (
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" /> {aiLoading ? "Thinking…" : "Suggest with AI"}
                </button>
              )}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#ff6c00]"
              placeholder="Payment terms, brand, warranty, bulk discount..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" loading={loading} disabled={businesses.length === 0}>
            Send Quote to Buyer
          </Button>
        </form>
      )}
    </Modal>
  );
}
