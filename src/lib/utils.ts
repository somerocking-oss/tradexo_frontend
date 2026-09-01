import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_URL } from "@/lib/api-url";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BUSINESS_PLACEHOLDER = "/images/business-placeholder.svg";

type ImageSource =
  | string
  | null
  | undefined
  | {
      url?: string | null;
      secureUrl?: string | null;
      path?: string | null;
      src?: string | null;
      type?: string | null;
    };

function extractImagePath(source: ImageSource): string | null {
  if (!source) return null;

  if (typeof source === "string") {
    const trimmed = source.trim();
    return trimmed || null;
  }

  if (typeof source === "object") {
    const candidate = source.url || source.secureUrl || source.path || source.src;
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      return trimmed || null;
    }
  }

  return null;
}

export function getImageUrl(source?: ImageSource): string {
  const path = extractImagePath(source);
  if (!path) {
    return BUSINESS_PLACEHOLDER;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getBusinessHeroImage(business: {
  banner?: ImageSource;
  images?: ImageSource[];
}): ImageSource {
  if (business.banner) return business.banner;

  const images = business.images || [];
  const banner = images.find(
    (img) => typeof img === "object" && img !== null && img.type === "banner"
  );

  return banner || images[0];
}

// Stable, verified Unsplash photos (business/office/industrial) used when a
// business has no banner or uploaded images of its own.
const UNSPLASH_BUSINESS_FALLBACKS = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80&auto=format&fit=crop",
];

function hashStringToIndex(input: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % mod;
}

/** Resolves a business's hero/banner image, falling back to a stable
 *  Unsplash photo (picked per-business, not random on every render) when
 *  the business has no banner or images of its own. */
export function getBusinessHeroImageUrl(business: {
  banner?: ImageSource;
  images?: ImageSource[];
  _id?: string;
  name?: string;
}): string {
  const path = extractImagePath(getBusinessHeroImage(business));
  if (path) return getImageUrl(path);

  const seed = String(business._id || business.name || "business");
  return UNSPLASH_BUSINESS_FALLBACKS[
    hashStringToIndex(seed, UNSPLASH_BUSINESS_FALLBACKS.length)
  ];
}

export function formatPhone(phone?: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

export function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function getWhatsAppUrl(phone?: string, message?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return null;
  const base = `https://wa.me/91${digits}`;
  if (message) return `${base}?text=${encodeURIComponent(message)}`;
  return base;
}

export function getBusinessWhatsAppPhone(business: {
  whatsapp?: string;
  mobile?: string;
  phone?: string;
}): string | undefined {
  return business.whatsapp || business.mobile || business.phone;
}

export function buildRfqWhatsAppMessage(
  lead: { name?: string; productName?: string; quantity?: number; unit?: string },
  businessName?: string
): string {
  const supplier = businessName || "a verified supplier on Tradexo";
  const product = lead.productName || "your requirement";
  const qty =
    lead.quantity != null
      ? ` (${lead.quantity}${lead.unit ? ` ${lead.unit}` : ""})`
      : "";
  return `Hi ${lead.name || "there"}, I'm ${supplier}. I'm responding to your RFQ for "${product}"${qty}. Let me share our best quote and delivery timeline.`;
}
