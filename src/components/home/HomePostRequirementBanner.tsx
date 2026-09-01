"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const BENEFITS = ["Free to Post", "Multiple Quotes", "Verified Suppliers"];

export function HomePostRequirementBanner() {
  return (
    <section className="bg-[#FFF4EE] px-3 py-8 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-8xl">
        {/* Card with orange left accent */}
        <div className="relative overflow-hidden rounded-2xl border border-[#FFD9C0] bg-white shadow-[0_2px_12px_rgba(255,108,0,0.08)]">
          {/* Left accent stripe */}
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#FF6C00]" aria-hidden />

          <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7 lg:px-10">
            <div className="flex items-start gap-4 pl-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF6C00] text-white shadow-md shadow-[#FF6C00]/30">
                <FileText className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#171717] sm:text-xl">
                  Post Your Requirement
                </h2>
                <p className="mt-0.5 text-sm text-[#525252]">
                  Receive multiple quotes from verified suppliers — for free.
                </p>
                <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                  {BENEFITS.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 pl-3 sm:items-end sm:pl-0">
              <Button
                href="/post-requirement"
                size="lg"
                className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[#FF6C00] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#FF6C00]/25 transition-all hover:bg-[#E85800] hover:shadow-[#FF6C00]/35 active:scale-[0.98]"
              >
                Post Requirement <ArrowRight className="h-4 w-4" />
              </Button>
              <Link
                href="/profile/requirements"
                className="text-xs font-medium text-[#737373] hover:text-[#FF6C00]"
              >
                Track existing requirements →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
