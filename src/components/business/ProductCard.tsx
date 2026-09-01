import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/utils";
import { getBusinessProfilePath } from "@/lib/business-url";
import { getProductPath } from "@/lib/product-url";
import type { MarketplaceProduct } from "@/lib/api/products";
import type { Business } from "@/types";

const PRICE_TYPE_LABELS: Record<string, string> = {
  fixed: "Fixed",
  starting: "Starting from",
  per_unit: "Per unit",
  hourly: "Per hour",
  on_request: "On request",
};

export function ProductCard({
  product,
  onQuote,
  compareChecked,
  onToggleCompare,
}: {
  product: MarketplaceProduct;
  onQuote: () => void;
  compareChecked: boolean;
  onToggleCompare: () => void;
}) {
  const imageUrl = product.images?.[0]?.url;
  const business = product.business;
  const businessPath = business ? getBusinessProfilePath(business as unknown as Business) : null;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-[#FF6C00]/40 hover:shadow-md">
      {/* Product image */}
      <Link href={getProductPath(product)} className="relative block h-40 w-full bg-neutral-100">
        {imageUrl ? (
          <Image
            src={getImageUrl(imageUrl)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 300px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-10 w-10 text-neutral-300" />
          </div>
        )}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          <Badge variant={product.itemType === "service" ? "info" : "outline"} className="text-[10px]">
            {product.itemType === "service" ? "Service" : "Product"}
          </Badge>
          {product.inStock === false && (
            <Badge variant="warning" className="text-[10px]">Out of stock</Badge>
          )}
        </div>
      </Link>

      <label
        className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-lg bg-white/95 px-2 py-1 text-[11px] font-medium text-neutral-600 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={compareChecked}
          onChange={onToggleCompare}
          className="h-3.5 w-3.5 rounded border-neutral-300"
        />
        Compare
      </label>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={getProductPath(product)}>
          <h3 className="font-semibold text-neutral-900 line-clamp-2 leading-snug hover:text-[#FF6C00]">{product.name}</h3>
        </Link>

        {product.brand && (
          <p className="mt-0.5 text-xs text-neutral-500">Brand: {product.brand}</p>
        )}

        {/* Price */}
        <div className="mt-2">
          {product.priceType === "on_request" || !product.price ? (
            <p className="text-sm font-semibold text-neutral-500">Price on Request</p>
          ) : (
            <p className="text-sm font-bold text-[#FF6C00]">
              ₹{product.price.toLocaleString("en-IN")}
              {product.unit ? ` / ${product.unit}` : ""}
              {product.priceType && product.priceType !== "fixed" && (
                <span className="ml-1 text-xs font-normal text-neutral-400">
                  ({PRICE_TYPE_LABELS[product.priceType] || product.priceType})
                </span>
              )}
            </p>
          )}
          {product.itemType !== "service" && product.minimumOrderQuantity != null && (
            <p className="text-xs text-neutral-400">
              MOQ: {product.minimumOrderQuantity} {product.unit || "units"}
            </p>
          )}
        </div>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs text-neutral-500">{product.description}</p>
        )}

        {/* Supplier info */}
        {business && (
          <div className="mt-3 rounded-lg bg-neutral-50 px-3 py-2">
            <div className="flex items-center gap-1.5">
              {businessPath ? (
                <Link
                  href={businessPath}
                  className="text-xs font-semibold text-neutral-700 hover:text-[#FF6C00] hover:underline line-clamp-1"
                >
                  {business.name}
                </Link>
              ) : (
                <span className="text-xs font-semibold text-neutral-700 line-clamp-1">
                  {business.name}
                </span>
              )}
              {business.isVerified && (
                <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                  Verified
                </span>
              )}
            </div>
            {business.city && (
              <p className="text-[10px] text-neutral-400">{business.city}{business.state ? `, ${business.state}` : ""}</p>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <Button
          type="button"
          size="sm"
          variant="primary"
          className="w-full"
          onClick={onQuote}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Get Best Price
        </Button>
      </div>
    </div>
  );
}
