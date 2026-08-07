export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Tradexo";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tradexo.in";
export const API_BASE = "/api/v1";

export const MARKETPLACE_TYPES = [
  { value: "local_service", label: "Local Service" },
  { value: "b2b_supplier", label: "B2B Supplier" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "distributor", label: "Distributor" },
  { value: "hybrid", label: "Hybrid" },
] as const;

export const SELLER_INTENT_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "services", label: "Services Only" },
  { value: "products", label: "Products / B2B" },
  { value: "services_and_products", label: "Services + Products" },
] as const;

export const B2B_ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "manufacturer", label: "Manufacturers" },
  { value: "wholesaler", label: "Wholesalers" },
  { value: "distributor", label: "Distributors" },
  { value: "b2b_supplier", label: "B2B Suppliers" },
  { value: "local_service", label: "Local Services" },
] as const;

export const SORT_OPTIONS = [
  { value: "priority", label: "Recommended" },
  { value: "distance", label: "Nearest first" },
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
] as const;

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "month",
    popular: false,
    features: ["Basic listing", "5 leads/month", "Standard visibility"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 999,
    period: "month",
    popular: true,
    features: ["Featured badge", "50 leads/month", "Priority ranking", "Analytics"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 4999,
    period: "month",
    popular: false,
    features: ["Top placement", "Unlimited leads", "Dedicated support", "Multi-branch"],
  },
] as const;
