"use client";

import Link from "next/link";
import Image from "next/image";
import { getBusinessProfilePath } from "@/lib/business-url";
import type { Business } from "@/types";

export function HomeTrustedBrands({ businesses = [] }: { businesses?: Business[] }) {
  const featured = businesses
    .filter((b) => b.name)
    .slice(0, 10)
    .map((business) => {
      const logo =
        typeof business.logo === "string"
          ? business.logo
          : business.logo?.url || undefined;
      return { business, logo };
    });
  if (!featured.length) return null;

  return (
    <section
      className="bg-white px-3 py-14 sm:px-4 sm:py-16"
      aria-labelledby="trusted-brands-heading"
    >
      <div className="mx-auto max-w-8xl">
        {/* Section header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E8E8E8] bg-[#F5F5F5] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6C00]" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6C00]">
              Trusted Platform
            </span>
          </div>
          <h2
            id="trusted-brands-heading"
            className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl"
          >
            Verified Businesses on the Platform
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#737373]">
            Join thousands of verified suppliers, manufacturers, and service providers
            growing their business every day.
          </p>
        </div>

        {/* Brand cards */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {featured.map(({ business, logo }) => (
            <Link
              key={String(business._id)}
              href={getBusinessProfilePath(business)}
              className="group flex h-14 min-w-[120px] max-w-[200px] items-center justify-center gap-2.5 rounded-xl border border-[#EBEBEB] bg-white px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#FF6C00]/30 hover:shadow-[0_6px_16px_rgba(0,0,0,0.09)]"
            >
              {logo ? (
                <Image
                  src={logo}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 rounded object-cover"
                />
              ) : null}
              <span className="truncate text-sm font-semibold text-[#525252] transition-colors duration-200 group-hover:text-[#171717]">
                {business.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom divider with gradient */}
        <div
          className="mx-auto mt-12 h-px max-w-xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #E5E5E5 30%, #E5E5E5 70%, transparent 100%)",
          }}
          aria-hidden
        />
      </div>
    </section>
  );
}
