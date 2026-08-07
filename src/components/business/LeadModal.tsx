"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createLead } from "@/lib/api/lead";
import { trackLeadSubmit } from "@/lib/analytics/track";
import { useAuth } from "@/context/AuthContext";
import type { Business } from "@/types";

interface LeadModalProps {
  business: Business | null;
  open: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export function LeadModal({ business, open, onClose, initialMessage = "" }: LeadModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setMessage(initialMessage);
      if (user?.name) setName(user.name);
      if (user?.mobile) setMobile(user.mobile);
      if (user?.email) setEmail(user.email);
    }
  }, [open, initialMessage, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setLoading(true);
    setError("");
    try {
      const res = await createLead({
        businessId: business._id,
        customerName: name,
        phone: mobile,
        email,
        message,
        type: "quote_request",
      });
      if (res.success) {
        trackLeadSubmit(String(business._id), {
          source: "seo",
          city: business.city,
          leadType: "quote_request",
        });
        setSuccess(true);
        localStorage.removeItem("pendingLead");
      } else {
        setError(res.message || "Failed to submit inquiry");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to submit inquiry");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={`Get Bulk Quotes — ${business?.name || ""}`}>
      {success ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✓
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Inquiry Sent!</h3>
          <p className="mt-2 text-sm text-slate-600">
            The business will contact you shortly on {mobile}.
          </p>
          <Button className="mt-6 w-full" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="rounded-lg bg-[#e8e8e8] px-3 py-2 text-xs text-[#e86200]">
            No login needed — submit your enquiry and get a call back.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Your Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mobile</label>
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
              maxLength={10}
              placeholder="10-digit mobile"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email (optional)</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Requirement</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
              placeholder="Describe what you're looking for..."
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Send Inquiry
          </Button>
        </form>
      )}
    </Modal>
  );
}
