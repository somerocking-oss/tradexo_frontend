"use client";

import { Phone, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBusinessWhatsAppPhone, getWhatsAppUrl } from "@/lib/utils";
import { QuoteActions } from "@/components/buyer/QuoteActions";
import type { LeadQuote } from "@/types";

interface QuoteCompareTableProps {
  quotes: LeadQuote[];
  productName?: string;
  respondingId?: string | null;
  onAccept?: (businessId: string) => void;
  onReject?: (businessId: string) => void;
}

function formatPrice(price?: number, unit?: string) {
  if (price == null) return "On request";
  return `₹${price.toLocaleString("en-IN")}${unit ? ` / ${unit}` : ""}`;
}

export function QuoteCompareTable({
  quotes,
  productName,
  respondingId,
  onAccept,
  onReject,
}: QuoteCompareTableProps) {
  const priced = quotes.filter((q) => q.unitPrice != null && q.unitPrice > 0);
  const lowestPrice =
    priced.length > 0 ? Math.min(...priced.map((q) => q.unitPrice as number)) : null;

  const sorted = [...quotes].sort((a, b) => {
    const pa = a.unitPrice ?? Infinity;
    const pb = b.unitPrice ?? Infinity;
    return pa - pb;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="font-semibold text-slate-900">Compare Quotes</h3>
        <p className="text-xs text-slate-500">Side-by-side — lowest price highlighted</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">MOQ</th>
              <th className="px-4 py-3 font-medium">Delivery</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((quote, index) => {
              const isBest =
                lowestPrice != null &&
                quote.unitPrice != null &&
                quote.unitPrice === lowestPrice;
              const phone =
                quote.business?.mobile ||
                quote.business?.phone ||
                quote.business?.whatsapp;
              const waUrl = getWhatsAppUrl(
                getBusinessWhatsAppPhone(quote.business || {}),
                `Hi ${quote.supplierName}, comparing quotes for "${productName || "my requirement"}" on Tradexo. Let's finalize.`
              );

              return (
                <tr
                  key={`${quote.businessId}-${index}`}
                  className={`border-b border-slate-50 last:border-0 ${isBest ? "bg-emerald-50/60" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{quote.supplierName || "Supplier"}</span>
                      {isBest && (
                        <Badge variant="success" className="gap-0.5 text-[10px]">
                          <Trophy className="h-3 w-3" /> Best
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#e86200]">
                    {formatPrice(quote.unitPrice, quote.priceUnit)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {quote.moq != null ? quote.moq : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {quote.deliveryDays != null ? `${quote.deliveryDays} days` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{quote.business?.city || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {quote.businessId && (
                        <Button
                          href={`/business/${quote.businessId}`}
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                        >
                          View
                        </Button>
                      )}
                      {phone && (
                        <a href={`tel:${phone}`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            <Phone className="h-3 w-3" />
                          </Button>
                        </a>
                      )}
                      {waUrl && (
                        <a href={waUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="h-8 bg-green-600 text-xs hover:bg-green-700">
                            WA
                          </Button>
                        </a>
                      )}
                      <QuoteActions
                        businessId={quote.businessId}
                        buyerResponse={quote.buyerResponse}
                        loading={respondingId === quote.businessId}
                        onAccept={() => quote.businessId && onAccept?.(quote.businessId)}
                        onReject={() => quote.businessId && onReject?.(quote.businessId)}
                        compact
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
