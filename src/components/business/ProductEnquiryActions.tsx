"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadModal } from "@/components/business/LeadModal";
import { TrackedCallLink } from "@/components/business/TrackedCallLink";
import { WhatsAppButton } from "@/components/business/WhatsAppButton";
import { getBusinessWhatsAppPhone } from "@/lib/utils";
import type { Business } from "@/types";
import type { MarketplaceProduct } from "@/lib/api/products";

export function ProductEnquiryActions({ product }: { product: MarketplaceProduct }) {
  const [leadOpen, setLeadOpen] = useState(false);
  const business = product.business as unknown as Business | undefined;
  const phone = business?.mobile || business?.phone;
  const whatsappPhone = business ? getBusinessWhatsAppPhone(business) : undefined;
  const businessId = business?._id ? String(business._id) : "";

  const initialMessage = `Hi, I'm interested in "${product.name}"${
    product.minimumOrderQuantity
      ? ` (MOQ: ${product.minimumOrderQuantity}${product.unit ? ` ${product.unit}` : ""})`
      : ""
  }. Please share availability and pricing.`;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="gap-1.5 bg-[#FF6C00] text-white hover:bg-[#E86200]"
          onClick={() => setLeadOpen(true)}
        >
          <MessageSquare className="h-4 w-4" /> Get Best Price
        </Button>
        {phone && businessId && (
          <TrackedCallLink businessId={businessId} phone={phone} source="direct" city={business?.city} variant="outline" />
        )}
        {whatsappPhone && (
          <WhatsAppButton phone={whatsappPhone} businessName={business?.name} businessId={businessId} source="direct" city={business?.city} />
        )}
      </div>

      <LeadModal
        business={business ?? null}
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        initialMessage={initialMessage}
      />
    </>
  );
}
