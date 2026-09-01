"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import type { BusinessCatalogItem } from "@/types";

export function ProductImageGallery({
  images,
  productName,
}: {
  images?: BusinessCatalogItem["images"];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const list = images?.filter((img) => img?.url) || [];
  const active = list[activeIndex] || list[0];

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 sm:aspect-[16/9]">
        {active?.url ? (
          <Image
            key={active.url}
            src={getImageUrl(active.url)}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 700px"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-300">No image available</div>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={img.url || i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show image ${i + 1} of ${list.length}`}
              aria-current={i === activeIndex}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-neutral-100 transition ${
                i === activeIndex
                  ? "border-[#FF6C00]"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={getImageUrl(img.url)} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
