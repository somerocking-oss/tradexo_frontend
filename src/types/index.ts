export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items?: T[];
  businesses?: T[];
  data?: T[];
  pagination?: PaginatedMeta;
  meta?: PaginatedMeta;
  total?: number;
}

export interface Role {
  _id: string;
  name: string;
  slug: string;
}

export interface User {
  _id: string;
  name?: string;
  mobile: string;
  email?: string;
  username?: string;
  bio?: string;
  profileImage?: string;
  isVerified?: boolean;
  status?: string;
  role?: Role | null;
}

export interface AuthPayload {
  accessToken: string;
  user: User;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  icon?: string;
  color?: string;
  image?: string;
  description?: string;
  shortDescription?: string;
  marketplaceVertical?: "local_service" | "b2b_product" | "supplier" | "hybrid";
  buyerIntent?: "hire" | "buy" | "quote" | "discover";
  supportsRfq?: boolean;
  supportsLocalSearch?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  showOnHomepage?: boolean;
  showInMenu?: boolean;
  businessCount?: number;
  subCategoryCount?: number;
  sortOrder?: number;
  keywords?: string[];
}

export interface SubCategory {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  icon?: string;
  category?: string | { _id: string; name?: string; slug?: string };
  isFeatured?: boolean;
  isTrending?: boolean;
  businessCount?: number;
  sortOrder?: number;
  keywords?: string[];
}

export interface BusinessImage {
  _id?: string;
  url?: string;
  secureUrl?: string;
  type?: "logo" | "banner" | "gallery" | "menu" | "document";
  alt?: string;
}

export interface BusinessContact {
  _id?: string;
  contactPerson?: string;
  mobile: string;
  alternateMobile?: string;
  whatsapp?: string;
  landline?: string;
  tollFree?: string;
  email?: string;
  website?: string;
  isPrimary?: boolean;
  isVerified?: boolean;
}

export type BusinessDocumentType =
  | "gst"
  | "pan"
  | "license"
  | "menu"
  | "certificate"
  | "identity"
  | "other";

export interface BusinessDocument {
  _id: string;
  name: string;
  url?: string;
  secureUrl?: string;
  type?: BusinessDocumentType;
  format?: string;
  isVerified?: boolean;
  rejectedReason?: string;
  createdAt?: string;
}

export type CatalogItemType = "product" | "service";

export type CatalogPriceType =
  | "fixed"
  | "starting"
  | "hourly"
  | "per_unit"
  | "on_request";

export interface BusinessCatalogItem {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  itemType: CatalogItemType;
  price?: number;
  priceType?: CatalogPriceType;
  unit?: string;
  minimumOrderQuantity?: number;
  brand?: string;
  inStock?: boolean;
  order?: number;
  images?: Array<{ url?: string; public_id?: string }>;
  videos?: Array<{ url?: string; public_id?: string }>;
  specifications?: Array<{ name?: string; value?: string }>;
  metaTitle?: string;
  metaDescription?: string;
  totalViews?: number;
}

export interface ProfileCompletionSection {
  key: string;
  label: string;
  weight: number;
  earned: number;
  percent: number;
}

export interface ProfileCompletion {
  percent: number;
  sections: ProfileCompletionSection[];
}

export interface BusinessFaq {
  _id: string;
  question: string;
  answer: string;
  order?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface Business {
  _id: string;
  name: string;
  slug?: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  contactPerson?: string;
  address?: string;
  building?: string;
  landmark?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  coordSource?: string;
  locations?: Array<{
    city?: string;
    area?: string;
    state?: string;
    pincode?: string;
    location?: { coordinates?: [number, number] };
  }>;
  phone?: string;
  mobile?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  timing?: Record<string, unknown>;
  timings?: Array<{
    day?: string;
    isClosed?: boolean;
    is24Hours?: boolean;
    slots?: { open?: string; close?: string }[];
  }>;
  productKeywords?: string[];
  serviceKeywords?: string[];
  banner?: string | BusinessImage;
  /** Primary logo image for the business (url or image object) */
  logo?: string | BusinessImage;
  images?: Array<string | BusinessImage>;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  /** Total reviews count (alternate field used in some APIs) */
  totalReviews?: number;
  isVerified?: boolean;
  verificationLevel?: "none" | "basic" | "trusted" | "premium" | string;
  isFeatured?: boolean;
  featuredUntil?: string;
  isSponsored?: boolean;
  status?: string;
  marketplaceType?: string;
  sellerIntent?: string;
  supplyCapacity?: {
    minimumOrderQuantity?: number;
    unit?: string;
    monthlyCapacity?: number;
    leadTimeDays?: number;
  };
  categoryId?: string;
  primaryCategory?: Category | string;
  categories?: Category[];
  ownerId?: string;
  createdAt?: string;
  profileCompletionPercent?: number;
  profileCompletion?: ProfileCompletion;
  annualTurnover?: number;
  turnoverCurrency?: string;
  turnoverYear?: number;
  establishmentYear?: number | string;
  avgResponseHours?: number | null;
  responseRate?: number | null;
  quoteResponseTimeHours?: number;
  categoryRank?: number | null;
  categoryPeerCount?: number | null;
  categoryAvgResponseHours?: number | null;
  categoryAvgResponseRate?: number | null;
  categoryBenchmarkUpdatedAt?: string | null;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  webhookEnabled?: boolean;
  lastWebhookStatus?: "success" | "failed" | null;
  lastWebhookAttemptAt?: string | null;
  notifyViaWhatsApp?: boolean;
  gstin?: string;
  gstVerified?: boolean;
  gstVerificationStatus?: "unverified" | "format_valid" | "verified" | "invalid";
  gstLegalName?: string;
  subscriptionPlan?: "free" | "basic" | "premium" | "gold" | "enterprise" | string;
  /** @deprecated never set by the backend — derive premium status from subscriptionPlan instead */
  isPremium?: boolean;
  contacts?: BusinessContact[];
  documents?: BusinessDocument[];
  catalog?: BusinessCatalogItem[];
  services?: BusinessCatalogItem[];
  faqs?: BusinessFaq[];
}

export type BusinessKycProfile = Business;

export interface RfqLineItem {
  productName: string;
  categoryId?: string | { _id?: string; name?: string };
  quantity?: number;
  unit?: string;
  specifications?: string;
}

export interface Lead {
  _id: string;
  businessId: string | { _id?: string; name?: string; city?: string };
  userId?: string;
  name?: string;
  customerName?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  message?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  business?: Business;
  isRfqOpportunity?: boolean;
  isAssignedByAdmin?: boolean;
  isUnlocked?: boolean;
  unlockBusinessId?: string;
  isContactMasked?: boolean;
  productName?: string;
  deliveryCity?: string;
  quantity?: number;
  unit?: string;
  items?: RfqLineItem[];
  matchedSupplierCount?: number;
  quoteCount?: number;
  notes?: LeadNote[];
  qualityScore?: number;
  exclusivity?: "shared" | "exclusive";
  exclusiveClaimedBy?: string | { _id?: string; name?: string };
  exclusiveClaimedAt?: string;
}

export interface LeadNote {
  message?: string;
  createdAt?: string;
  metadata?: {
    isQuote?: boolean;
    businessId?: string;
    businessName?: string;
    unitPrice?: number;
    moq?: number;
    deliveryDays?: number;
    priceUnit?: string;
    message?: string;
  };
}

export interface LeadQuote {
  message?: string;
  quotedAt?: string;
  supplierName?: string;
  unitPrice?: number;
  moq?: number;
  deliveryDays?: number;
  priceUnit?: string;
  noteMessage?: string;
  businessId?: string;
  buyerResponse?: "accepted" | "rejected" | string;
  respondedAt?: string;
  business?: Business;
}

export interface BuyerRfq extends Lead {
  quoteCount?: number;
}

export interface BuyerRfqDetail extends BuyerRfq {
  quotes?: LeadQuote[];
}

export interface Review {
  _id: string;
  businessId: string;
  userId?: string;
  rating: number;
  comment?: string;
  userName?: string;
  createdAt?: string;
}

export interface SearchSuggestion {
  type: string;
  label: string;
  value: string;
  id?: string;
}

export interface BusinessSearchParams {
  keyword?: string;
  categoryId?: string;
  subCategoryId?: string;
  city?: string;
  area?: string;
  state?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  radius?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  marketplaceType?: string;
  sellerIntent?: string;
  acceptsBulkOrders?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}
