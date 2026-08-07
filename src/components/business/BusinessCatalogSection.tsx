"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, MessageSquare, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeadModal } from "@/components/business/LeadModal";
import { formatCatalogPrice } from "@/lib/api/kyc";
import { getImageUrl } from "@/lib/utils";
import { API_BASE } from "@/lib/constants";
import type { Business, BusinessCatalogItem } from "@/types";

interface BusinessCatalogSectionProps {
  business: Business;
  items: BusinessCatalogItem[];
}

export function BusinessCatalogSection({ business, items }: BusinessCatalogSectionProps) {
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadMessage, setLeadMessage] = useState("");

  const openQuote = (item: BusinessCatalogItem) => {
    const moq =
      item.minimumOrderQuantity != null
        ? ` MOQ: ${item.minimumOrderQuantity}${item.unit ? ` ${item.unit}` : ""}.`
        : "";
    setLeadMessage(
      `Hi, I'm interested in "${item.name}" listed on Tradexo.${moq} Please share price and availability.`
    );
    setLeadOpen(true);
  };

  const products = items.filter((i) => i.itemType === "product");
  const services = items.filter((i) => i.itemType !== "product");

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Products & Services Catalogue</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{items.length} items</Badge>
            {business._id && (
              <a
                href={`${API_BASE}/businesses/${business._id}/catalog-pdf`}
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-[#ff6c00] hover:text-[#ff6c00]"
              >
                <Download className="h-3.5 w-3.5" /> Download Catalog (PDF)
              </a>
            )}
          </div>
        </div>

        {products.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Package className="h-4 w-4" /> Products
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {products.map((item, index) => (
                <CatalogCard key={item._id || `p-${index}`} item={item} onQuote={() => openQuote(item)} />
              ))}
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Services</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((item, index) => (
                <CatalogCard key={item._id || `s-${index}`} item={item} onQuote={() => openQuote(item)} />
              ))}
            </div>
          </div>
        )}
      </section>

      <LeadModal
        business={business}
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        initialMessage={leadMessage}
      />
    </>
  );
}

function CatalogCard({ item, onQuote }: { item: BusinessCatalogItem; onQuote: () => void }) {
  const imageUrl = item.images?.[0]?.url;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white transition hover:border-[#d4d4d4] hover:shadow-sm">
      {imageUrl && (
        <div className="relative h-36 w-full bg-slate-100">
          <Image
            src={getImageUrl(imageUrl)}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 300px"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-slate-900">{item.name}</h4>
            {item.brand && <p className="text-xs text-slate-500">Brand: {item.brand}</p>}
          </div>
          <p className="shrink-0 font-semibold text-[#e86200]">{formatCatalogPrice(item)}</p>
        </div>

        {item.description && (
          <p className="line-clamp-2 text-sm text-slate-600">{item.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {item.itemType === "product" && item.minimumOrderQuantity != null && (
            <span>MOQ: {item.minimumOrderQuantity} {item.unit || "units"}</span>
          )}
          {item.inStock === false && (
            <Badge variant="warning" className="text-[10px]">Out of stock</Badge>
          )}
          {item.inStock !== false && item.itemType === "product" && (
            <Badge variant="success" className="text-[10px]">In stock</Badge>
          )}
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mx-4 mb-4 mt-3 w-[calc(100%-2rem)] border-[#d4d4d4] text-[#e86200] hover:bg-[#EAF2FB]"
        onClick={onQuote}
      >
        <MessageSquare className="h-3.5 w-3.5" /> Get Bulk Quote
      </Button>
    </div>
  );
}
