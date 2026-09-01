import { Building2, Package, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/business/VerifiedBadge";
import type { Business } from "@/types";

const PROVIDER_LABELS: Record<string, { label: string; icon: typeof Wrench }> = {
  services: { label: "Service", icon: Wrench },
  products: { label: "Product", icon: Package },
  services_and_products: { label: "Service + Product", icon: Building2 },
};

const PREMIUM_PLANS = ["premium", "gold", "enterprise"];

/** Shared verified/featured/premium/role badge row — keeps BusinessCard,
 * ListingsBusinessRow, and the product card visually consistent. */
export function BusinessBadges({
  business,
  showProvider = false,
  className = "",
}: {
  business: Business;
  showProvider?: boolean;
  className?: string;
}) {
  const provider = business.sellerIntent ? PROVIDER_LABELS[business.sellerIntent] : null;
  const isPremiumPlan = PREMIUM_PLANS.includes(business.subscriptionPlan || "");

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <VerifiedBadge isVerified={business.isVerified} verificationLevel={business.verificationLevel} />
      {business.isFeatured && <Badge variant="premium">Featured</Badge>}
      {isPremiumPlan && <Badge variant="premium">Premium</Badge>}
      {showProvider && provider && (
        <Badge variant="outline" className="gap-1 border-white/40 bg-white/90 text-slate-700">
          <provider.icon className="h-3 w-3" aria-hidden />
          {provider.label}
        </Badge>
      )}
    </div>
  );
}
