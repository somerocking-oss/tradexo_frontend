"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Package } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { getProductPath } from "@/lib/product-url";
import type { MarketplaceProduct } from "@/lib/api/products";

export function HomeTrendingProducts({ products = [] }: { products?: MarketplaceProduct[] }) {
  if (!products.length) return null;

  return (
    <section className="border-b border-neutral-300 bg-white px-3 py-12 sm:px-4 sm:py-14" aria-labelledby="trending-products-heading">
      <div className="mx-auto max-w-8xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#A3A3A3]">
              <Flame className="h-3.5 w-3.5 text-[#FF6C00]" aria-hidden />
              Most Viewed This Week
            </p>
            <h2 id="trending-products-heading" className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
              Trending Products
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#737373] sm:text-base">
              Popular products buyers are sourcing right now.
            </p>
          </div>
          <Link
            href="/products"
            className="group hidden shrink-0 items-center gap-1.5 rounded-lg border border-[#D4D4D4] px-4 py-2 text-sm font-semibold text-[#525252] transition-all duration-200 ease-out hover:border-[#FF6C00] hover:text-[#FF6C00] sm:flex"
          >
            Browse all products
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const imageUrl = product.images?.[0]?.url;
            return (
              <Link
                key={product._id}
                href={getProductPath(product)}
                className="group flex flex-col overflow-hidden rounded-xl border border-neutral-400 bg-neutral-100 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#FF6C00]/40 hover:shadow-md"
              >
                <div className="relative h-32 w-full bg-neutral-200 sm:h-36">
                  {imageUrl ? (
                    <Image
                      src={getImageUrl(imageUrl)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 200px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-8 w-8 text-neutral-400" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-xs font-semibold text-[#262626] group-hover:text-[#FF6C00] sm:text-sm">
                    {product.name}
                  </h3>
                  {product.price ? (
                    <p className="mt-1 text-xs font-bold text-[#FF6C00] sm:text-sm">
                      ₹{product.price.toLocaleString("en-IN")}
                      {product.unit ? ` / ${product.unit}` : ""}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs font-medium text-neutral-500">Price on Request</p>
                  )}
                  {product.business?.name ? (
                    <p className="mt-1 truncate text-[11px] text-neutral-500">{product.business.name}</p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
