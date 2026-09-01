import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { BusinessActions } from "@/components/business/BusinessActions";
import { OpenNowBadge } from "@/components/business/OpenNowBadge";
import { VerifiedBadge } from "@/components/business/VerifiedBadge";
import { getImageUrl, getBusinessHeroImageUrl } from "@/lib/utils";
import { buildListingsUrl, categoryToSlug } from "@/lib/listings-url";
import type { Business, Category } from "@/types";

function resolveCategory(business: Business): Category | null {
  const cat = business.primaryCategory;
  if (!cat || typeof cat === "string") return null;
  return cat;
}

function formatMarketplaceType(value?: string) {
  if (!value) return null;
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function BusinessProfileHero({ business }: { business: Business }) {
  const rating = business.averageRating ?? business.rating ?? 0;
  const heroImage = getBusinessHeroImageUrl(business);
  const logoImage =
    business.images?.find((img) => typeof img === "object" && img.type === "logo") ||
    business.images?.[0];
  const category = resolveCategory(business);
  const marketplaceLabel = formatMarketplaceType(business.marketplaceType);
  const heroBanner = business.images?.find(
    (img) => typeof img === "object" && img.type === "banner"
  );
  const heroAlt =
    (typeof heroBanner === "object" && heroBanner?.alt) ||
    `${business.name}${category ? ` — ${category.name}` : ""}${business.city ? ` in ${business.city}` : ""}`;
  const isPremiumPlan = ["premium", "gold", "enterprise"].includes(business.subscriptionPlan || "");

  const stats = [
    business.establishmentYear
      ? { label: "Established", value: String(business.establishmentYear) }
      : null,
    business.avgResponseHours != null
      ? {
          label: "Response Time",
          value:
            business.avgResponseHours < 1
              ? "< 1 hour"
              : business.avgResponseHours <= 24
                ? `~${Math.round(business.avgResponseHours)}h`
                : `~${Math.round(business.avgResponseHours / 24)}d`,
        }
      : null,
    business.responseRate != null
      ? { label: "Response Rate", value: `${business.responseRate}%` }
      : null,
    business.sellerIntent === "products" && business.supplyCapacity?.minimumOrderQuantity
      ? {
          label: "MOQ",
          value: `${business.supplyCapacity.minimumOrderQuantity} ${business.supplyCapacity.unit || "units"}`,
        }
      : null,
    business.annualTurnover
      ? {
          label: "Turnover",
          value: `₹${Number(business.annualTurnover).toLocaleString("en-IN")}`,
        }
      : null,
    marketplaceLabel ? { label: "Type", value: marketplaceLabel } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section className="border-b border-neutral-400 bg-[#fafafa]">
      {/* Cover */}
      <div className="relative h-44 bg-gradient-to-br from-[#f0f0f0] via-[#f8fafc] to-[#eef2ff] sm:h-52 md:h-60">
        <Image
          src={heroImage}
          alt={heroAlt}
          fill
          className="object-cover opacity-90"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-8xl px-3 sm:px-4">
        <div className="-mt-14 relative z-10 pb-6 sm:-mt-16">
          <div className="rounded-2xl border border-neutral-400 bg-white p-5 shadow-lg sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4 sm:gap-5">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md sm:h-24 sm:w-24">
                  <Image
                    src={getImageUrl(typeof logoImage === "string" ? logoImage : logoImage?.url)}
                    alt={(typeof logoImage === "object" && logoImage?.alt) || `${business.name} logo`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <VerifiedBadge
                      isVerified={business.isVerified}
                      verificationLevel={business.verificationLevel}
                      size="md"
                    />
                    {business.gstVerified && <Badge variant="success">GST Verified</Badge>}
                    {business.isFeatured && <Badge variant="premium">Featured</Badge>}
                    {isPremiumPlan && <Badge variant="premium">Premium</Badge>}
                    {marketplaceLabel && (
                      <Badge variant="outline" className="capitalize">
                        {marketplaceLabel}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl font-extrabold leading-tight text-[#111] sm:text-3xl">
                    {business.name}
                  </h1>

                  {business.title && (
                    <p className="mt-1 text-base text-[#666] sm:text-lg">{business.title}</p>
                  )}

                  {category && (
                    <Link
                      href={buildListingsUrl({ categorySlug: categoryToSlug(category) })}
                      className="mt-2 inline-block text-sm font-medium text-[#ff6600] hover:underline"
                    >
                      {category.name}
                    </Link>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#666]">
                    <OpenNowBadge business={business} />
                    {rating > 0 && (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <span className="text-amber-400">★</span>
                        {rating.toFixed(1)}
                        <span className="font-normal text-[#888]">
                          ({business.reviewCount || 0} reviews)
                        </span>
                      </span>
                    )}
                    {(business.area || business.city) && (
                      <span className="inline-flex items-start gap-1">
                        <span className="text-[#ff6600]" aria-hidden>
                          📍
                        </span>
                        {[business.area, business.city, business.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 lg:pt-1">
                <BusinessActions business={business} />
              </div>
            </div>

            {stats.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#f0f0f0] pt-5 sm:grid-cols-4">
                {stats.map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5 text-center sm:px-4"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#999]">
                      {label}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[#222] sm:text-base">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
