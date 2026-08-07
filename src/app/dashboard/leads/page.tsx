"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Lock,
  MessageSquare,
  Phone,
  Search,
  Send,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { QuoteReplyModal } from "@/components/dashboard/QuoteReplyModal";
import { UnlockLeadModal } from "@/components/dashboard/UnlockLeadModal";
import { RfqItemsTable } from "@/components/buyer/RfqItemsTable";
import { useAuth } from "@/context/AuthContext";
import { extractBusinessList, getMyBusinesses } from "@/lib/api/business";
import {
  createLeadUnlockOrder,
  extractLeadList,
  getLeadBusinessName,
  getMyLeads,
  submitLeadQuote,
  unlockLead,
  updateLeadStatus,
} from "@/lib/api/lead";
import { loadRazorpayScript, verifyPayment } from "@/lib/api/payment";
import { getActiveSubscription } from "@/lib/api/subscription";
import { getWallet } from "@/lib/api/wallet";
import { buildRfqWhatsAppMessage, getWhatsAppUrl } from "@/lib/utils";
import { exportLeadsToCsv } from "@/lib/export-csv";
import type { Business, Lead } from "@/types";

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-amber-100 text-amber-800" },
  { value: "viewed", label: "Viewed", color: "bg-[#e8e8e8] text-[#e86200]" },
  { value: "contacted", label: "Contacted", color: "bg-violet-100 text-violet-800" },
  { value: "qualified", label: "Qualified", color: "bg-indigo-100 text-indigo-800" },
  { value: "quoted", label: "Quoted", color: "bg-cyan-100 text-cyan-800" },
  { value: "converted", label: "Converted", color: "bg-emerald-100 text-emerald-800" },
  { value: "closed", label: "Closed", color: "bg-slate-100 text-slate-700" },
];

function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function canContactLead(lead: Lead) {
  return !lead.isRfqOpportunity || lead.isUnlocked;
}

function getResponsibleBusiness(lead: Lead, businesses: Business[]) {
  const businessId =
    typeof lead.businessId === "string"
      ? lead.businessId
      : (lead.businessId as { _id?: string })?._id;
  if (businessId) {
    return businesses.find((b) => String(b._id) === String(businessId));
  }
  if (lead.exclusivity === "exclusive" && lead.isUnlocked && lead.unlockBusinessId) {
    return businesses.find((b) => String(b._id) === String(lead.unlockBusinessId));
  }
  return undefined;
}

function getSlaBadge(lead: Lead, businesses: Business[]) {
  if (!["new", "viewed"].includes(lead.status || "new")) return null;
  const business = getResponsibleBusiness(lead, businesses);
  if (!business || !lead.createdAt) return null;

  const slaHours = business.quoteResponseTimeHours || 24;
  const elapsedHours = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
  const hoursLeft = slaHours - elapsedHours;

  if (hoursLeft <= 0) {
    return { label: "Response overdue", overdue: true };
  }
  return { label: `Respond within ${Math.ceil(hoursLeft)}h`, overdue: false };
}

export default function LeadsInboxPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "direct" | "rfq">("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<Lead | null>(null);
  const [quoteTarget, setQuoteTarget] = useState<Lead | null>(null);
  const [sortByQuality, setSortByQuality] = useState(false);

  const loadCredits = async (businessList: Business[]) => {
    if (!businessList.length) {
      setCreditsLeft(null);
      setWalletBalance(null);
      return;
    }
    const businessId = String(businessList[0]._id);
    const [subRes, walletRes] = await Promise.all([
      getActiveSubscription(businessId),
      getWallet(businessId),
    ]);
    if (subRes.success && subRes.data?.usage) {
      setCreditsLeft(subRes.data.usage.leadsLeft ?? null);
    }
    if (walletRes.success && walletRes.data) {
      setWalletBalance(walletRes.data.balance ?? null);
    }
  };

  const loadLeads = useCallback(() => {
    setLoading(true);
    Promise.all([getMyLeads(), getMyBusinesses()])
      .then(([leadsRes, bizRes]) => {
        if (leadsRes.success && leadsRes.data) {
          setLeads(extractLeadList(leadsRes.data));
        }
        if (bizRes.success && bizRes.data) {
          const list = extractBusinessList(bizRes.data);
          setBusinesses(list);
          loadCredits(list);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const filtered = leads.filter((lead) => {
    const matchesStatus = filter === "all" || lead.status === filter;
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "rfq" && lead.isRfqOpportunity) ||
      (typeFilter === "direct" && !lead.isRfqOpportunity);
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      lead.name?.toLowerCase().includes(term) ||
      lead.mobile?.includes(search) ||
      getLeadBusinessName(lead).toLowerCase().includes(term) ||
      lead.message?.toLowerCase().includes(term) ||
      lead.productName?.toLowerCase().includes(term) ||
      lead.deliveryCity?.toLowerCase().includes(term);
    return matchesStatus && matchesType && matchesSearch;
  });

  if (sortByQuality) {
    filtered.sort((a, b) => (b.qualityScore ?? -1) - (a.qualityScore ?? -1));
  }

  const hasQualityScores = leads.some((l) => l.qualityScore != null);

  const newCount = leads.filter((l) => l.status === "new").length;
  const rfqCount = leads.filter((l) => l.isRfqOpportunity).length;
  const lockedRfqCount = leads.filter((l) => l.isRfqOpportunity && !l.isUnlocked).length;

  const handleStatusChange = async (leadId: string, status: string) => {
    setUpdating(leadId);
    try {
      const res = await updateLeadStatus(leadId, status);
      if (res.success && res.data) {
        setLeads((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, status } : l))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleUnlockWithCredit = async (businessId: string) => {
    if (!unlockTarget) return;
    const res = await unlockLead(unlockTarget._id, businessId, "subscription");
    if (!res.success || !res.data) {
      throw new Error(res.message || "Unlock failed");
    }

    applyUnlockedLead(unlockTarget, res.data.lead, businessId);
    if (res.data.creditsLeft != null) setCreditsLeft(res.data.creditsLeft);
  };

  const handleUnlockWithWallet = async (businessId: string) => {
    if (!unlockTarget) return;
    const res = await unlockLead(unlockTarget._id, businessId, "wallet");
    if (!res.success || !res.data) {
      throw new Error(res.message || "Wallet unlock failed");
    }

    applyUnlockedLead(unlockTarget, res.data.lead, businessId);
    if (res.data.walletBalance != null) setWalletBalance(res.data.walletBalance);
  };

  const handlePayAndUnlock = async (businessId: string) => {
    if (!unlockTarget) return;

    const orderRes = await createLeadUnlockOrder(unlockTarget._id, businessId);
    if (!orderRes.success || !orderRes.data) {
      throw new Error(orderRes.message || "Could not create payment order");
    }

    const { order, keyId, paymentsEnabled } = orderRes.data;
    if (!paymentsEnabled || !keyId) {
      throw new Error(
        "Online payments not configured. Add Razorpay keys to backend .env"
      );
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error("Failed to load Razorpay checkout");
    }

    await new Promise<void>((resolve, reject) => {
      const rzp = new window.Razorpay!({
        key: keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Tradexo",
        description: `Unlock RFQ lead — ${unlockTarget.productName || "Buyer requirement"}`,
        order_id: order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.mobile || "",
        },
        theme: { color: "#059669" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verifyRes.success) {
              reject(new Error(verifyRes.message || "Payment verification failed"));
              return;
            }

            const unlocked =
              verifyRes.data?.leadUnlock?.lead ||
              verifyRes.data?.leadUnlock;
            applyUnlockedLead(
              unlockTarget,
              (unlocked as Lead) || unlockTarget,
              businessId
            );
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      });
      rzp.open();
    });
  };

  const applyUnlockedLead = (existing: Lead, unlocked: Lead, businessId: string) => {
    const fullLead = normalizeUnlockedLead(existing, unlocked, businessId);
    setLeads((prev) =>
      prev.map((l) => (l._id === existing._id ? fullLead : l))
    );
  };

  const handleQuoteSubmit = async (payload: {
    businessId: string;
    unitPrice: number;
    moq?: number;
    deliveryDays?: number;
    priceUnit?: string;
    message?: string;
  }) => {
    if (!quoteTarget) return;
    const res = await submitLeadQuote(quoteTarget._id, payload);
    if (!res.success) {
      throw new Error(res.message || "Quote failed");
    }
    setLeads((prev) =>
      prev.map((l) =>
        l._id === quoteTarget._id ? { ...l, status: "quoted" } : l
      )
    );
  };

  const handleWhatsApp = async (lead: Lead) => {
    if (!canContactLead(lead)) {
      setUnlockTarget(lead);
      return;
    }

    const business =
      businesses.find((b) => String(b._id) === String(lead.unlockBusinessId)) ||
      businesses[0];
    const msg = buildRfqWhatsAppMessage(lead, business?.name);
    const url = getWhatsAppUrl(lead.mobile, msg);
    if (!url) return;

    await handleStatusChange(lead._id, "contacted");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="px-4 lg:px-0">
      <UnlockLeadModal
        lead={unlockTarget}
        businesses={businesses}
        creditsLeft={creditsLeft ?? undefined}
        walletBalance={walletBalance ?? undefined}
        onClose={() => setUnlockTarget(null)}
        onUnlockWithCredit={handleUnlockWithCredit}
        onUnlockWithWallet={handleUnlockWithWallet}
        onPayAndUnlock={handlePayAndUnlock}
      />

      <QuoteReplyModal
        lead={quoteTarget}
        businesses={businesses}
        defaultBusinessId={quoteTarget?.unlockBusinessId || businesses[0]?._id}
        onClose={() => setQuoteTarget(null)}
        onSubmit={handleQuoteSubmit}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Leads Inbox</h1>
          <p className="mt-1 text-slate-600">
            Direct enquiries + open RFQ opportunities — unlock, quote & WhatsApp buyers
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {leads.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportLeadsToCsv(filtered.length ? filtered : leads)}
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          )}
          {creditsLeft != null && (
            <Badge variant="outline" className="w-fit px-3 py-1 text-sm">
              {creditsLeft} lead credits left
            </Badge>
          )}
          {walletBalance != null && (
            <Badge variant="outline" className="w-fit px-3 py-1 text-sm">
              Wallet ₹{walletBalance}
            </Badge>
          )}
          {newCount > 0 && (
            <Badge variant="warning" className="w-fit px-3 py-1 text-sm">
              {newCount} new lead{newCount > 1 ? "s" : ""}
            </Badge>
          )}
          {lockedRfqCount > 0 && (
            <Badge variant="premium" className="w-fit px-3 py-1 text-sm">
              {lockedRfqCount} locked RFQ{lockedRfqCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      {lockedRfqCount > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/50">
          <CardBody className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-900">
              <Lock className="mr-1 inline h-4 w-4" />
              {lockedRfqCount} RFQ lead{lockedRfqCount > 1 ? "s" : ""} waiting — unlock to see buyer contact & send quote
            </p>
            <Button href="/plans" size="sm" variant="outline">
              Get More Credits
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: leads.length, icon: MessageSquare },
          { label: "New", value: newCount, icon: Clock },
          { label: "RFQ Matches", value: rfqCount, icon: FileText },
          { label: "Converted", value: leads.filter((l) => l.status === "converted").length, icon: CheckCircle2 },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center gap-3 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8e8e8] text-[#ff6c00]">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "direct", "rfq"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                typeFilter === t
                  ? "bg-amber-500 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t === "rfq" ? "RFQ Open" : t}
            </button>
          ))}
          {hasQualityScores && (
            <button
              type="button"
              onClick={() => setSortByQuality((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                sortByQuality
                  ? "bg-violet-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Best Quality First
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, product, city..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "new", "viewed", "contacted", "quoted", "converted"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                  filter === s
                    ? "bg-[#ff6c00] text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <UserCheck className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="font-semibold text-slate-700">No leads yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Complete your profile and catalogue to attract more buyers.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const statusMeta = STATUS_OPTIONS.find((s) => s.value === lead.status) || STATUS_OPTIONS[0];
            const isRfq = !!lead.isRfqOpportunity;
            const locked = isRfq && !lead.isUnlocked;
            const contactable = canContactLead(lead);
            const isExclusive = lead.exclusivity === "exclusive";
            const claimedByOther = isExclusive && !!lead.exclusiveClaimedBy && !lead.isUnlocked;
            const slaBadge = getSlaBadge(lead, businesses);

            return (
              <Card
                key={lead._id}
                className={`card-hover overflow-hidden ${isRfq ? "border-amber-200 ring-1 ring-amber-100" : ""}`}
              >
                <CardBody className="p-0">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {isRfq && lead.productName ? lead.productName : lead.name}
                        </h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta.color}`}>
                          {statusMeta.label}
                        </span>
                        {isRfq && (
                          <Badge variant="premium" className="text-xs">
                            {lead.type === "bulk_order" ? "Bulk RFQ" : "RFQ"}{" "}
                            {locked ? "· Locked" : "· Unlocked"}
                          </Badge>
                        )}
                        {lead.isAssignedByAdmin && (
                          <Badge variant="success" className="text-xs">
                            Assigned to you
                          </Badge>
                        )}
                        {isExclusive && (
                          <Badge variant="warning" className="text-xs">
                            {claimedByOther ? "Exclusive · Claimed by another supplier" : "Exclusive"}
                          </Badge>
                        )}
                        {slaBadge && (
                          <Badge
                            variant={slaBadge.overdue ? "danger" : "outline"}
                            className="text-xs"
                          >
                            {slaBadge.label}
                          </Badge>
                        )}
                        {lead.type && !isRfq && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {lead.type.replace(/_/g, " ")}
                          </Badge>
                        )}
                        {lead.qualityScore != null && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                              lead.qualityScore >= 70
                                ? "bg-emerald-100 text-emerald-700"
                                : lead.qualityScore >= 40
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Sparkles className="h-3 w-3" /> {lead.qualityScore}/100
                          </span>
                        )}
                      </div>
                      {isRfq ? (
                        <p className="mt-0.5 text-sm text-slate-600">
                          Buyer: <strong>{lead.name}</strong>
                          {lead.deliveryCity && <> · Delivery: {lead.deliveryCity}</>}
                          {lead.items && lead.items.length > 1 ? (
                            <> · {lead.items.length} products</>
                          ) : lead.quantity != null ? (
                            <> · Qty: {lead.quantity}{lead.unit ? ` ${lead.unit}` : ""}</>
                          ) : null}
                        </p>
                      ) : (
                        getLeadBusinessName(lead) && (
                          <p className="mt-0.5 text-sm font-medium text-[#e86200]">
                            For: {getLeadBusinessName(lead)}
                          </p>
                        )
                      )}
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {locked ? (
                            <span className="text-amber-700">{lead.mobile} — unlock to view</span>
                          ) : (
                            lead.mobile
                          )}
                        </span>
                        {!locked && lead.email && <span>{lead.email}</span>}
                        <span className="text-slate-400">{formatDate(lead.createdAt)}</span>
                      </div>
                      {lead.message && (
                        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                          {lead.message}
                        </p>
                      )}
                      {lead.items && lead.items.length > 1 && (
                        <div className="mt-3">
                          <RfqItemsTable items={lead.items} compact />
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:min-w-[140px]">
                      {locked && claimedByOther && (
                        <Button size="sm" className="w-full" variant="outline" disabled>
                          <Lock className="h-3.5 w-3.5" /> Claimed by another supplier
                        </Button>
                      )}

                      {locked && !claimedByOther && (
                        <Button
                          size="sm"
                          className="w-full bg-amber-500 hover:bg-amber-600"
                          onClick={() => setUnlockTarget(lead)}
                        >
                          <Lock className="h-3.5 w-3.5" /> Unlock Lead
                        </Button>
                      )}

                      {!locked && lead.status === "new" && (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={updating === lead._id}
                          onClick={() => handleStatusChange(lead._id, "viewed")}
                        >
                          Mark Viewed
                        </Button>
                      )}

                      {contactable && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setQuoteTarget(lead)}
                          >
                            <Send className="h-3.5 w-3.5" /> Send Quote
                          </Button>

                          {lead.mobile && (
                            <>
                              <a href={`tel:${lead.mobile}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full border-emerald-200 text-emerald-700"
                                  onClick={() => handleStatusChange(lead._id, "contacted")}
                                >
                                  <Phone className="h-3.5 w-3.5" /> {isRfq ? "Call Buyer" : "Call"}
                                </Button>
                              </a>

                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full border-green-200 text-green-700"
                                onClick={() => handleWhatsApp(lead)}
                              >
                                WhatsApp
                              </Button>
                            </>
                          )}
                        </>
                      )}

                      {!locked && ["new", "viewed"].includes(lead.status || "new") && (
                        <Button
                          size="sm"
                          loading={updating === lead._id}
                          onClick={() => handleStatusChange(lead._id, "contacted")}
                        >
                          Mark Contacted
                        </Button>
                      )}

                      <select
                        value={lead.status || "new"}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        disabled={updating === lead._id}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-[#ff6c00]"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function normalizeUnlockedLead(existing: Lead, unlocked: Lead, businessId?: string): Lead {
  return {
    ...existing,
    ...unlocked,
    name: unlocked.customerName || existing.name,
    mobile: unlocked.phone || unlocked.mobile || existing.mobile,
    phone: unlocked.phone || existing.phone,
    email: unlocked.email || existing.email,
    isUnlocked: true,
    isContactMasked: false,
    unlockBusinessId: businessId || existing.unlockBusinessId,
  };
}
