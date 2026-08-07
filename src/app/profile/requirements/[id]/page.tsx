"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, RefreshCw } from "lucide-react";
import { QuoteCompareTable } from "@/components/buyer/QuoteCompareTable";
import { RfqItemsTable } from "@/components/buyer/RfqItemsTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { QuoteActions } from "@/components/buyer/QuoteActions";
import { useAuth } from "@/context/AuthContext";
import { getBuyerRfqDetail, respondToQuote } from "@/lib/api/lead";
import { getBusinessWhatsAppPhone, getWhatsAppUrl } from "@/lib/utils";
import type { BuyerRfqDetail } from "@/types";

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

export default function RequirementDetailPage() {
  const params = useParams();
  const id = String(params.id || "");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [detail, setDetail] = useState<BuyerRfqDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const loadDetail = useCallback(async (silent = false) => {
    if (!id) return;
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getBuyerRfqDetail(id);
      if (res.success && res.data) {
        setDetail(res.data);
        setLastUpdated(new Date());
        setError("");
      } else {
        setError(res.message || "Could not load requirement");
      }
    } catch {
      setError("Could not load requirement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/profile/requirements/${id}`);
    }
  }, [authLoading, isAuthenticated, router, id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    loadDetail();
  }, [isAuthenticated, id, loadDetail]);

  const handleQuoteResponse = async (businessId: string, action: "accept" | "reject") => {
    setRespondingId(businessId);
    try {
      const res = await respondToQuote(id, { businessId, action });
      if (res.success && res.data) {
        setDetail(res.data);
        setLastUpdated(new Date());
      }
    } finally {
      setRespondingId(null);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const timer = setInterval(() => loadDetail(true), 30000);
    return () => clearInterval(timer);
  }, [isAuthenticated, id, loadDetail]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading quotes...</div>;
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-red-600">{error || "Requirement not found"}</p>
        <Button href="/profile/requirements" className="mt-4" variant="outline">
          Back to requirements
        </Button>
      </div>
    );
  }

  const quoteCount = detail.quotes?.length || 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/profile/requirements"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-[#ff6c00] hover:text-[#e86200]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Requirements
        </Link>

        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {detail.productName || "Buying requirement"}
              </h1>
              {detail.type === "bulk_order" && (
                <Badge variant="premium">Bulk Order</Badge>
              )}
              <Badge variant="outline" className="capitalize">{detail.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
              {detail.deliveryCity && <span>Delivery: {detail.deliveryCity}</span>}
              {detail.quantity != null && !detail.items?.length && (
                <span>Qty: {detail.quantity}{detail.unit ? ` ${detail.unit}` : ""}</span>
              )}
              <span>Posted {formatDate(detail.createdAt)}</span>
            </div>
            {detail.items && detail.items.length > 1 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-slate-700">
                  {detail.items.length} products in this bulk order
                </p>
                <RfqItemsTable items={detail.items} />
              </div>
            )}
            {detail.message && (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {detail.message}
              </p>
            )}
          </CardBody>
        </Card>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Supplier Quotes ({quoteCount})
          </h2>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-slate-400">
                Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadDetail(true)}
              loading={refreshing}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </div>

        {!detail.quotes?.length ? (
          <Card>
            <CardBody className="py-12 text-center text-slate-500">
              No quotes yet. Verified suppliers will respond soon on your mobile.
              <p className="mt-2 text-xs">This page auto-refreshes every 30 seconds.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-6">
            {quoteCount >= 2 && (
              <QuoteCompareTable
                quotes={detail.quotes}
                productName={detail.productName}
                respondingId={respondingId}
                onAccept={(businessId) => handleQuoteResponse(businessId, "accept")}
                onReject={(businessId) => handleQuoteResponse(businessId, "reject")}
              />
            )}

            <div className="space-y-4">
              {detail.quotes.map((quote, index) => {
                const phone =
                  quote.business?.mobile ||
                  quote.business?.phone ||
                  quote.business?.whatsapp;
                const waUrl = getWhatsAppUrl(
                  getBusinessWhatsAppPhone(quote.business || {}),
                  `Hi ${quote.supplierName}, I received your quote on Tradexo for "${detail.productName}". Let's discuss.`
                );

                return (
                  <Card key={`${quote.businessId}-${index}`} className="border-[#e8e8e8]">
                    <CardBody>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{quote.supplierName}</h3>
                          {quote.business?.city && (
                            <p className="text-sm text-slate-500">{quote.business.city}</p>
                          )}
                          <div className="mt-3 grid gap-1 text-sm text-slate-700">
                            {quote.unitPrice != null && (
                              <p>
                                <strong>Price:</strong> ₹{quote.unitPrice.toLocaleString("en-IN")}
                                {quote.priceUnit ? ` / ${quote.priceUnit}` : ""}
                              </p>
                            )}
                            {quote.moq != null && <p><strong>MOQ:</strong> {quote.moq}</p>}
                            {quote.deliveryDays != null && (
                              <p><strong>Delivery:</strong> {quote.deliveryDays} days</p>
                            )}
                            {quote.noteMessage && <p className="text-slate-600">{quote.noteMessage}</p>}
                          </div>
                          <p className="mt-2 text-xs text-slate-400">{formatDate(quote.quotedAt)}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {quote.businessId && (
                            <Button
                              href={`/business/${quote.businessId}`}
                              size="sm"
                              variant="outline"
                            >
                              View Supplier
                            </Button>
                          )}
                          {phone && (
                            <a href={`tel:${phone}`}>
                              <Button size="sm" variant="outline">
                                <Phone className="h-3.5 w-3.5" /> Call
                              </Button>
                            </a>
                          )}
                          {waUrl && (
                            <a href={waUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                WhatsApp
                              </Button>
                            </a>
                          )}
                          <QuoteActions
                            businessId={quote.businessId}
                            buyerResponse={quote.buyerResponse}
                            loading={respondingId === quote.businessId}
                            onAccept={() =>
                              quote.businessId && handleQuoteResponse(quote.businessId, "accept")
                            }
                            onReject={() =>
                              quote.businessId && handleQuoteResponse(quote.businessId, "reject")
                            }
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
  );
}
