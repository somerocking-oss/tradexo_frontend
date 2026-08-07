"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Phone, ShoppingCart, Sparkles } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn, getWhatsAppUrl } from "@/lib/utils";
import { titleCase } from "@/lib/browse-slug";

const actionClass =
  "inline-flex h-auto min-h-11 w-full items-center justify-start gap-2 rounded-lg px-4 py-3 text-sm font-medium transition";

export function SeoLandingActions({
  keyword,
  city,
  supportPhone,
}: {
  keyword: string;
  city: string;
  supportPhone?: string;
}) {
  const router = useRouter();
  const keywordLabel = titleCase(keyword);
  const cityLabel = titleCase(city);
  const rfqUrl = `/post-requirement?product=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`;
  const inquiryUrl = `/post-requirement?product=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}&intent=inquiry`;
  const waMessage = `Hi, I am looking for ${keywordLabel} in ${cityLabel}. Please share best quotes on Tradexo.`;
  const whatsappUrl = getWhatsAppUrl(supportPhone, waMessage);
  const callHref = supportPhone ? `tel:${supportPhone.replace(/\D/g, "")}` : null;

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Button
        className="h-auto min-h-11 justify-start gap-2 bg-[#ff6c00] px-4 py-3 hover:bg-[#e86200]"
        onClick={() => router.push(rfqUrl)}
      >
        <Sparkles className="h-4 w-4 shrink-0" />
        Get Best Quote
      </Button>

      <Button
        variant="outline"
        className="h-auto min-h-11 justify-start gap-2 border-neutral-300 bg-white px-4 py-3"
        onClick={() => router.push(inquiryUrl)}
      >
        <FileText className="h-4 w-4 shrink-0" />
        Send Inquiry
      </Button>

      {whatsappUrl ? (
        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            actionClass,
            "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          )}
        >
          <FaWhatsapp className="h-4 w-4 shrink-0" />
          WhatsApp Inquiry
        </Link>
      ) : (
        <Button
          variant="outline"
          className="h-auto min-h-11 justify-start gap-2 px-4 py-3"
          onClick={() => router.push(inquiryUrl)}
        >
          <FaWhatsapp className="h-4 w-4 shrink-0" />
          WhatsApp Inquiry
        </Button>
      )}

      {callHref ? (
        <Link
          href={callHref}
          className={cn(
            actionClass,
            "border border-neutral-300 bg-white text-neutral-900 hover:border-[#ff6c00] hover:bg-[#e8e8e8] hover:text-[#ff6c00]"
          )}
        >
          <Phone className="h-4 w-4 shrink-0" />
          Call Now
        </Link>
      ) : (
        <Button
          variant="outline"
          className="h-auto min-h-11 justify-start gap-2 px-4 py-3"
          disabled
        >
          <Phone className="h-4 w-4 shrink-0" />
          Call Now
        </Button>
      )}

      <Button
        variant="outline"
        className="h-auto min-h-11 justify-start gap-2 border-neutral-900 bg-neutral-900 px-4 py-3 text-white hover:bg-black"
        onClick={() => router.push(rfqUrl)}
      >
        <ShoppingCart className="h-4 w-4 shrink-0" />
        Buy Requirement
      </Button>
    </div>
  );
}
