"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Lock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { TrackedCallLink } from "@/components/business/TrackedCallLink";
import {
  buildMapsDirectionUrl,
  trackDirectionClick,
  trackWebsiteClick,
  trackWhatsAppClick,
} from "@/lib/analytics/track";
import { formatPhone } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

function maskPhone(num: string) {
  const digits = num.replace(/\D/g, "").slice(-10);
  return `+91 ${digits.slice(0, 5)} XXXXX`;
}

export function BusinessContactLinks({
  businessId,
  phone,
  mobile,
  whatsapp,
  website,
  email,
  address,
  latitude,
  longitude,
  city,
}: {
  businessId: string;
  phone?: string;
  mobile?: string;
  whatsapp?: string;
  website?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
}) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  const directionUrl = buildMapsDirectionUrl({ address, city, latitude, longitude });

  const handleWhatsAppClick = () => {
    trackWhatsAppClick(businessId, { source: "seo", city });
  };

  const handleWebsiteClick = () => {
    trackWebsiteClick(businessId, { source: "seo", city });
  };

  const handleDirectionClick = () => {
    trackDirectionClick(businessId, { source: "seo", city });
  };

  const websiteHref = website
    ? website.startsWith("http")
      ? website
      : `https://${website}`
    : null;

  const hasPhone = !!(phone || mobile || whatsapp);

  return (
    <ul className="space-y-3 text-sm">
      {/* ── Phone / Mobile ── */}
      {hasPhone && !isAuthenticated && !authLoading && (
        <li>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
            <span className="flex items-center gap-2 font-medium text-neutral-500">
              <Phone className="h-4 w-4 text-[#e86200]" />
              {maskPhone(phone || mobile || whatsapp || "")}
            </span>
            <Link
              href={loginHref}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#FF6C00] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#e86200]"
            >
              <Lock className="h-3 w-3" />
              Login to view
            </Link>
          </div>
        </li>
      )}
      {authLoading && hasPhone && (
        <li>
          <div className="h-10 animate-pulse rounded-lg bg-neutral-100" />
        </li>
      )}
      {isAuthenticated && phone && (
        <li>
          <TrackedCallLink
            businessId={businessId}
            phone={phone}
            source="seo"
            city={city}
            className="flex items-center gap-2 text-[#e86200] hover:underline"
          >
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" /> {formatPhone(phone)}
            </span>
          </TrackedCallLink>
        </li>
      )}
      {isAuthenticated && mobile && mobile !== phone && (
        <li>
          <TrackedCallLink
            businessId={businessId}
            phone={mobile}
            source="seo"
            city={city}
            className="flex items-center gap-2 text-[#e86200] hover:underline"
          >
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" /> {formatPhone(mobile)}
            </span>
          </TrackedCallLink>
        </li>
      )}
      {isAuthenticated && whatsapp && (
        <li>
          <a
            href={`https://wa.me/91${whatsapp.replace(/\D/g, "").slice(-10)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="flex items-center gap-2 text-emerald-700 hover:underline"
          >
            <FaWhatsapp className="h-4 w-4" /> WhatsApp
          </a>
        </li>
      )}
      {!isAuthenticated && !authLoading && whatsapp && (
        <li>
          <Link
            href={loginHref}
            className="flex items-center gap-2 text-emerald-700 hover:underline"
          >
            <FaWhatsapp className="h-4 w-4" /> Login to WhatsApp
          </Link>
        </li>
      )}
      {email && (
        <li>
          <a href={`mailto:${email}`} className="flex items-center gap-2 text-[#e86200] hover:underline">
            <Mail className="h-4 w-4" /> {email}
          </a>
        </li>
      )}
      {websiteHref && (
        <li>
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWebsiteClick}
            className="flex items-center gap-2 text-[#e86200] hover:underline"
          >
            <Globe className="h-4 w-4" /> Website
          </a>
        </li>
      )}
      {directionUrl && (
        <li>
          <a
            href={directionUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDirectionClick}
            className="flex items-center gap-2 text-[#e86200] hover:underline"
          >
            <Navigation className="h-4 w-4" /> Get Directions
          </a>
        </li>
      )}
      {(address || city) && !directionUrl && (
        <li className="flex items-start gap-2 text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          {[address, city].filter(Boolean).join(", ")}
        </li>
      )}
    </ul>
  );
}
