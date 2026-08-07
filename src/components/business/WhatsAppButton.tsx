"use client";

import { FaWhatsapp } from "react-icons/fa";
import { cn, getWhatsAppUrl } from "@/lib/utils";
import { trackWhatsAppClick, type ClickSource } from "@/lib/analytics/track";
import { createLead } from "@/lib/api/lead";
import { useAuth } from "@/context/AuthContext";

interface WhatsAppButtonProps {
  phone?: string;
  businessName?: string;
  businessId?: string;
  source?: ClickSource;
  city?: string;
  className?: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
}

export function WhatsAppButton({
  phone,
  businessName,
  businessId,
  source = "listing",
  city,
  className,
  size = "md",
  fullWidth,
}: WhatsAppButtonProps) {
  const { user } = useAuth();
  const message = businessName
    ? `Hi, I found ${businessName} on Tradexo. I'm interested in your products/services.`
    : "Hi, I found your business on Tradexo. I'm interested in your products/services.";

  const url = getWhatsAppUrl(phone, message);
  if (!url) return null;

  const sizeClass =
    size === "sm"
      ? "h-9 px-3 text-xs gap-1.5"
      : "h-10 px-4 text-sm gap-2";

  const handleClick = () => {
    if (businessId) {
      trackWhatsAppClick(businessId, { source, city });

      // Capture as a real lead when we know who clicked (logged-in buyers) —
      // anonymous clicks still only get analytics tracking, since we have no
      // buyer phone to create a meaningful Lead record from.
      if (user?.mobile) {
        createLead({
          businessId,
          customerName: user.name || "WhatsApp Enquiry",
          phone: user.mobile,
          type: "whatsapp",
          message: `Contacted ${businessName || "business"} via WhatsApp`,
        }).catch(() => {});
      }
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 font-medium text-emerald-700 transition hover:bg-emerald-100 hover:shadow-sm",
        sizeClass,
        fullWidth && "w-full",
        className
      )}
    >
      <FaWhatsapp className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      WhatsApp
    </a>
  );
}

/** Icon-only WhatsApp for compact card layouts */
export function WhatsAppIconLink({
  phone,
  businessName,
  businessId,
  source = "listing",
  city,
  className,
}: {
  phone?: string;
  businessName?: string;
  businessId?: string;
  source?: ClickSource;
  city?: string;
  className?: string;
}) {
  const { user } = useAuth();
  const message = businessName
    ? `Hi, I found ${businessName} on Tradexo.`
    : "Hi, I found your business on Tradexo.";

  const url = getWhatsAppUrl(phone, message);
  if (!url) return null;

  const handleClick = () => {
    if (businessId) {
      trackWhatsAppClick(businessId, { source, city });

      if (user?.mobile) {
        createLead({
          businessId,
          customerName: user.name || "WhatsApp Enquiry",
          phone: user.mobile,
          type: "whatsapp",
          message: `Contacted ${businessName || "business"} via WhatsApp`,
        }).catch(() => {});
      }
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat on WhatsApp"
      onClick={handleClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100",
        className
      )}
    >
      <FaWhatsapp className="h-4 w-4" />
    </a>
  );
}
