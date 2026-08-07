"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, MessageSquare, Phone } from "lucide-react";
import { LeadModal } from "@/components/business/LeadModal";
import { WhatsAppButton } from "@/components/business/WhatsAppButton";
import { TrackedCallLink } from "@/components/business/TrackedCallLink";
import { Button } from "@/components/ui/button";
import { getBusinessWhatsAppPhone } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { Business } from "@/types";

export function StickyBusinessContact({ business }: { business: Business }) {
  const [leadOpen, setLeadOpen] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  const phone = business.mobile || business.phone;
  const whatsappPhone = getBusinessWhatsAppPhone(business);
  const businessId = String(business._id);

  if (!phone && !whatsappPhone) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[#ff6c00] bg-white px-3 py-2.5 shadow-[0_-4px_20px_rgb(26_35_126_/_0.12)] md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2 pb-[env(safe-area-inset-bottom)]">

          {/* Phone — gated by login */}
          {authLoading && (
            <div className="h-9 flex-1 animate-pulse rounded-lg bg-neutral-100" />
          )}
          {!authLoading && isAuthenticated && phone && (
            <TrackedCallLink
              businessId={businessId}
              phone={phone}
              source="seo"
              city={business.city}
              size="sm"
              variant="call"
              className="min-w-0 flex-1"
            />
          )}
          {!authLoading && !isAuthenticated && (phone || whatsappPhone) && (
            <Link
              href={loginHref}
              className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#FF6C00] px-3 py-2 text-sm font-semibold text-white"
            >
              <Lock className="h-4 w-4 shrink-0" />
              <Phone className="h-4 w-4 shrink-0" />
              Login to Call
            </Link>
          )}

          <Button
            className="min-w-0 shrink-0"
            size="sm"
            variant="outline"
            onClick={() => setLeadOpen(true)}
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            Quote
          </Button>

          {/* WhatsApp — gated by login */}
          {!authLoading && isAuthenticated && whatsappPhone && (
            <WhatsAppButton
              phone={whatsappPhone}
              businessName={business.name}
              businessId={businessId}
              source="seo"
              city={business.city}
              size="sm"
              className="shrink-0 px-3"
            />
          )}
        </div>
      </div>
      <LeadModal business={business} open={leadOpen} onClose={() => setLeadOpen(false)} />
    </>
  );
}
