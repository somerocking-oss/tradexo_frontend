import Image from "next/image";
import { MessageSquare, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/utils";
import { getBusinessProfilePath } from "@/lib/business-url";
import Link from "next/link";
import type { MarketplaceProduct } from "@/lib/api/products";
import type { Business } from "@/types";

const PRICE_TYPE_LABELS: Record<string, string> = {
  fixed: "Fixed",
  starting: "Starting from",
  per_unit: "Per unit",
  hourly: "Per hour",
  on_request: "On request",
};

function formatPrice(product: MarketplaceProduct) {
  if (product.priceType === "on_request" || !product.price) return "Price on Request";
  const suffix = product.priceType && product.priceType !== "fixed"
    ? ` (${PRICE_TYPE_LABELS[product.priceType] || product.priceType})`
    : "";
  return `₹${product.price.toLocaleString("en-IN")}${product.unit ? `/${product.unit}` : ""}${suffix}`;
}

function lowestPriceId(products: MarketplaceProduct[]) {
  const priced = products.filter((p) => p.price && p.priceType !== "on_request");
  if (!priced.length) return null;
  return priced.reduce((min, p) => (p.price! < min.price! ? p : min), priced[0])._id;
}

export function ProductCompareTable({
  products,
  onContactSupplier,
}: {
  products: MarketplaceProduct[];
  onContactSupplier: (product: MarketplaceProduct) => void;
}) {
  const bestId = lowestPriceId(products);
  const specNames = Array.from(
    new Set(
      products.flatMap((p) => (p.specifications || []).map((s) => s.name).filter(Boolean) as string[])
    )
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <tbody className="divide-y divide-slate-100">
          {/* Image + name row */}
          <tr>
            <td className="w-32 px-3 py-3 text-xs font-semibold uppercase text-slate-400">Product</td>
            {products.map((product) => (
              <td key={product._id} className="min-w-[180px] px-3 py-3 align-top">
                <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-lg bg-slate-100">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={getImageUrl(product.images[0].url)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <p className="font-semibold text-slate-900">{product.name}</p>
              </td>
            ))}
          </tr>

          {/* Brand */}
          <tr>
            <td className="px-3 py-3 text-xs font-semibold uppercase text-slate-400">Brand</td>
            {products.map((product) => (
              <td key={product._id} className="px-3 py-3 text-slate-700">
                {product.brand || "—"}
              </td>
            ))}
          </tr>

          {/* Price */}
          <tr>
            <td className="px-3 py-3 text-xs font-semibold uppercase text-slate-400">Price</td>
            {products.map((product) => (
              <td key={product._id} className="px-3 py-3">
                <span
                  className={
                    product._id === bestId
                      ? "font-bold text-emerald-700"
                      : "font-semibold text-slate-800"
                  }
                >
                  {formatPrice(product)}
                </span>
                {product._id === bestId && (
                  <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    Best price
                  </span>
                )}
              </td>
            ))}
          </tr>

          {/* MOQ */}
          <tr>
            <td className="px-3 py-3 text-xs font-semibold uppercase text-slate-400">MOQ</td>
            {products.map((product) => (
              <td key={product._id} className="px-3 py-3 text-slate-700">
                {product.minimumOrderQuantity != null
                  ? `${product.minimumOrderQuantity}${product.unit ? ` ${product.unit}` : ""}`
                  : "—"}
              </td>
            ))}
          </tr>

          {/* Supplier */}
          <tr>
            <td className="px-3 py-3 text-xs font-semibold uppercase text-slate-400">Supplier</td>
            {products.map((product) => {
              const business = product.business;
              const path = business ? getBusinessProfilePath(business as unknown as Business) : null;
              return (
                <td key={product._id} className="px-3 py-3">
                  {business ? (
                    <>
                      {path ? (
                        <Link href={path} className="font-medium text-slate-700 hover:text-[#FF6C00] hover:underline">
                          {business.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-slate-700">{business.name}</span>
                      )}
                      {business.isVerified && (
                        <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Verified
                        </span>
                      )}
                      {business.city && <p className="text-xs text-slate-400">{business.city}</p>}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              );
            })}
          </tr>

          {/* Specifications */}
          {specNames.map((specName) => (
            <tr key={specName}>
              <td className="px-3 py-3 text-xs font-semibold uppercase text-slate-400">{specName}</td>
              {products.map((product) => {
                const spec = product.specifications?.find((s) => s.name === specName);
                return (
                  <td key={product._id} className="px-3 py-3 text-slate-700">
                    {spec?.value || "—"}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* CTA */}
          <tr>
            <td className="px-3 py-3" />
            {products.map((product) => (
              <td key={product._id} className="px-3 py-3">
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={() => onContactSupplier(product)}
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Contact Supplier
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
