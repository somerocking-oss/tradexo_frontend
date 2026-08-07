"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const HIDDEN_PATHS = ["/dashboard", "/post-requirement", "/login", "/register"];

type PostRfqStickyTabProps = {
  href?: string;
  label?: string;
  enabled?: boolean;
};

export function PostRfqStickyTab({
  href = "/post-requirement",
  label = "Post RFQ",
  enabled = true,
}: PostRfqStickyTabProps) {
  const pathname = usePathname();

  if (!enabled) return null;
  if (HIDDEN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return null;
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "post-rfq-sticky group fixed right-0 top-[42%] z-30 hidden -translate-y-1/2 md:flex",
        "flex-col items-center rounded-l-2xl border border-[#ff8533] border-r-0",
        "bg-gradient-to-b from-[#ff8533] to-[#ff6c00] px-2.5 py-4 text-white",
        "shadow-[-8px_4px_28px_rgba(255,108,0,0.45)]",
        "transition-transform duration-200 hover:-translate-x-1.5",
        "hover:shadow-[-12px_6px_32px_rgba(255,108,0,0.55)]"
      )}
    >
      <span className="post-rfq-sticky-ring pointer-events-none absolute inset-0 rounded-l-2xl" aria-hidden />
      <FileText className="relative h-5 w-5 shrink-0" aria-hidden />
      <span
        className="relative mt-2 text-[11px] font-bold uppercase leading-tight tracking-wide"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        {label}
      </span>
    </Link>
  );
}
