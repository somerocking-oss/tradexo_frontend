"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, MessageSquare, Phone } from "lucide-react";
import { LeadModal } from "@/components/business/LeadModal";
import { WhatsAppIconLink } from "@/components/business/WhatsAppButton";
import { TrackedCallLink } from "@/components/business/TrackedCallLink";
import { getBusinessWhatsAppPhone } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { Business } from "@/types";

const CIRCLE_BTN =
  "flex h-12 w-12 items-center justify-center rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-transform duration-150 hover:-translate-y-0.5";

/** Desktop-only floating call/WhatsApp/quote buttons, IndiaMart-style —
 * mobile already has StickyBusinessContact/StickyProductContact. */
export function FloatingContactButtons({
  business,
  initialMessage,
  breakpoint = "md",
}: {
  business: Business;
  initialMessage?: string;
  breakpoint?: "md" | "lg";
}) {
  const [leadOpen, setLeadOpen] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  const phone = business.mobile || business.phone;
  const whatsappPhone = getBusinessWhatsAppPhone(business);
  const businessId = String(business._id);

  if (!phone && !whatsappPhone) return null;

  const visibility = breakpoint === "lg" ? "hidden lg:flex" : "hidden md:flex";

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-40 ${visibility} flex-col items-end gap-3`}>
        {!authLoading && whatsappPhone && (isAuthenticated ? (
          <WhatsAppIconLink
            phone={whatsappPhone}
            businessName={business.name}
            businessId={businessId}
            source="direct"
            city={business.city}
            className={`${CIRCLE_BTN} border-0 bg-emerald-500 text-white hover:bg-emerald-600`}
          />
        ) : (
          <Link
            href={loginHref}
            title="Login to chat on WhatsApp"
            className={`${CIRCLE_BTN} bg-emerald-500 text-white hover:bg-emerald-600`}
          >
            <Lock className="h-4 w-4" />
          </Link>
        ))}

        <button
          type="button"
          title="Get Best Price"
          onClick={() => setLeadOpen(true)}
          className={`${CIRCLE_BTN} bg-[#FF6C00] text-white hover:bg-[#E86200]`}
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        {!authLoading && phone && (isAuthenticated ? (
          <TrackedCallLink businessId={businessId} phone={phone} source="direct" city={business.city}>
            <span title="Call" className={`${CIRCLE_BTN} bg-[#0B3B6F] text-white hover:bg-[#0A3159]`}>
              <Phone className="h-4 w-4" />
            </span>
          </TrackedCallLink>
        ) : (
          <Link href={loginHref} title="Login to call" className={`${CIRCLE_BTN} bg-[#0B3B6F] text-white hover:bg-[#0A3159]`}>
            <Lock className="h-4 w-4" />
          </Link>
        ))}
      </div>

      <LeadModal
        business={business}
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        initialMessage={initialMessage}
      />
    </>
  );
}
