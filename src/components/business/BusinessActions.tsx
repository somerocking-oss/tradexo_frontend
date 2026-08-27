"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadModal } from "@/components/business/LeadModal";
import { BusinessChatButton } from "@/components/business/BusinessChatButton";
import { WhatsAppButton } from "@/components/business/WhatsAppButton";
import { TrackedCallLink } from "@/components/business/TrackedCallLink";
import { SaveBusinessButton } from "@/components/business/SaveBusinessButton";
import { ShareBusinessButton } from "@/components/business/ShareBusinessButton";
import { getBusinessWhatsAppPhone } from "@/lib/utils";
import type { Business } from "@/types";

export function BusinessActions({ business }: { business: Business }) {
  const [leadOpen, setLeadOpen] = useState(false);
  const phone = business.mobile || business.phone;
  const whatsappPhone = getBusinessWhatsAppPhone(business);
  const businessId = String(business._id);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {phone && (
          <TrackedCallLink
            businessId={businessId}
            phone={phone}
            source="seo"
            city={business.city}
            variant="call"
            size="md"
          />
        )}
        <Button variant="outline" onClick={() => setLeadOpen(true)}>
          <MessageSquare className="h-4 w-4" /> Get Bulk Quotes
        </Button>
        <BusinessChatButton businessId={businessId} businessName={business.name} ownerId={business.ownerId} />
        {whatsappPhone && (
          <WhatsAppButton
            phone={whatsappPhone}
            businessName={business.name}
            businessId={businessId}
            source="seo"
            city={business.city}
          />
        )}
        <ShareBusinessButton
          businessId={businessId}
          businessSlug={business.slug}
          businessName={business.name}
          city={business.city}
        />
        <SaveBusinessButton
          businessId={businessId}
          className="!h-10 !w-10 !rounded-xl !border-slate-200"
        />
      </div>
      <LeadModal business={business} open={leadOpen} onClose={() => setLeadOpen(false)} />
    </>
  );
}
