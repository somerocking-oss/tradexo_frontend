"use client";

import Link from "next/link";
import { ClipboardList, MapPin } from "lucide-react";
import type { PublicRequirement } from "@/lib/api/lead-server";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const TYPE_LABEL: Record<string, string> = {
  rfq: "RFQ",
  quote_request: "Quote Request",
  bulk_order: "Bulk Order",
};

export function HomeLatestRequirements({ requirements = [] }: { requirements?: PublicRequirement[] }) {
  if (!requirements.length) return null;

  return (
    <section className="bg-white px-3 py-12 sm:px-4 sm:py-14" aria-labelledby="latest-requirements-heading">
      <div className="mx-auto max-w-8xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A3A3A3]">
              Live Buyer Demand
            </p>
            <h2 id="latest-requirements-heading" className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
              Latest Buy Requirements
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#737373] sm:text-base">
              Real buyers are posting requirements right now — respond before your competitors do.
            </p>
          </div>
          <Link
            href="/register-business"
            className="group hidden shrink-0 items-center gap-1.5 rounded-lg border border-[#D4D4D4] px-4 py-2 text-sm font-semibold text-[#525252] transition-all duration-200 ease-out hover:border-[#FF6C00] hover:text-[#FF6C00] sm:flex"
          >
            List your business to respond
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="flex flex-col rounded-xl border border-neutral-400 bg-neutral-100 p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#FF6C00]/40 hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3E8] px-2.5 py-0.5 text-[11px] font-semibold text-[#E86200]">
                  <ClipboardList className="h-3 w-3" aria-hidden />
                  {TYPE_LABEL[req.type] || "Requirement"}
                </span>
                <span className="text-[11px] text-[#A3A3A3]">{timeAgo(req.createdAt)}</span>
              </div>

              <h3 className="line-clamp-2 text-sm font-semibold text-[#262626]">{req.productName}</h3>

              {req.quantity ? (
                <p className="mt-1 text-xs text-[#525252]">
                  Qty: <span className="font-medium">{req.quantity}{req.unit ? ` ${req.unit}` : ""}</span>
                </p>
              ) : null}

              {req.city ? (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-[#737373]">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {req.city}{req.state ? `, ${req.state}` : ""}
                </p>
              ) : null}

              <Link
                href="/register-business"
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#FF6C00]"
              >
                Sign in to Respond
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-7 flex justify-center sm:hidden">
          <Link
            href="/register-business"
            className="rounded-lg border border-[#D4D4D4] px-4 py-2.5 text-sm font-semibold text-[#525252] hover:border-[#FF6C00] hover:text-[#FF6C00]"
          >
            List your business to respond
          </Link>
        </div>
      </div>
    </section>
  );
}
