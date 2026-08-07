"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCallClick, type ClickSource } from "@/lib/analytics/track";
import { connectTelephonyCall, getTelephonyConfig } from "@/lib/api/telephony";
import { cn } from "@/lib/utils";

type TrackedCallLinkProps = {
  businessId: string;
  phone: string;
  source?: ClickSource;
  city?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "call";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  iconOnly?: boolean;
  children?: React.ReactNode;
};

let telephonyConfigCache: { enabled: boolean } | null = null;

async function tryVirtualConnect(
  businessId: string,
  phone: string,
  source: ClickSource,
  city?: string,
  buyerPhone?: string
) {
  await connectTelephonyCall({
    businessId,
    source,
    city,
    buyerPhone,
  });
  window.alert("You will receive a call shortly to connect you with the seller.");
}

export function TrackedCallLink({
  businessId,
  phone,
  source = "listing",
  city,
  className,
  variant = "call",
  size = "md",
  showLabel = true,
  iconOnly = false,
  children,
}: TrackedCallLinkProps) {
  const [virtualCallEnabled, setVirtualCallEnabled] = useState(
    telephonyConfigCache?.enabled ?? false
  );

  useEffect(() => {
    if (telephonyConfigCache) {
      setVirtualCallEnabled(telephonyConfigCache.enabled);
      return;
    }

    getTelephonyConfig()
      .then((cfg) => {
        telephonyConfigCache = cfg;
        setVirtualCallEnabled(cfg.enabled);
      })
      .catch(() => {
        telephonyConfigCache = { enabled: false };
      });
  }, []);

  const handleClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    trackCallClick(businessId, { phone, source, city });

    if (!virtualCallEnabled) return;

    event.preventDefault();

    try {
      await tryVirtualConnect(businessId, phone, source, city);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not start virtual call";

      if (message.toLowerCase().includes("phone")) {
        const buyerPhone = window.prompt("Enter your mobile number to receive a call:");
        if (!buyerPhone) {
          window.location.href = `tel:${phone}`;
          return;
        }

        try {
          await tryVirtualConnect(businessId, phone, source, city, buyerPhone);
        } catch {
          window.location.href = `tel:${phone}`;
        }
        return;
      }

      window.location.href = `tel:${phone}`;
    }
  };

  if (children) {
    return (
      <a href={`tel:${phone}`} onClick={handleClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <a href={`tel:${phone}`} onClick={handleClick} className={cn(iconOnly ? "shrink-0" : "flex-1", className)}>
      <Button type="button" variant={variant} size={size} className={cn(iconOnly && "px-3", !iconOnly && "w-full")}>
        <Phone className="h-4 w-4 shrink-0" />
        {showLabel && !iconOnly ? " Call" : null}
      </Button>
    </a>
  );
}
