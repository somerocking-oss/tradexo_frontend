"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, Headphones, MessageCircle, Search } from "lucide-react";

export function SupportHero({ title = "Help Center" }: { title?: string }) {
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Search is currently UI-only; extend with router push when search route exists
  }

  return (
    <div className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-br from-[#F0F0F0] via-[#E5E5E5]/40 to-white px-4 py-14 sm:px-6 sm:py-20">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#FF6C00]/6 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-[#FF6C00]/4 blur-2xl"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="transition-colors hover:text-[#FF6C00]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          <span className="font-medium text-neutral-600">Support</span>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5E5E5] px-3 py-1 text-xs font-semibold text-[#FF6C00]">
            <Headphones className="h-3.5 w-3.5" aria-hidden />
            We&apos;re here to help
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Mon–Sat, 10 AM – 7 PM IST
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          Get help with listings, leads, RFQs, payments, and your account. Browse quick answers
          below or reach our team directly.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mt-8 flex max-w-lg items-center gap-2">
          <label htmlFor="support-search" className="sr-only">
            Search help articles
          </label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden
            />
            <input
              id="support-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles…"
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-lg bg-[#FF6C00] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E86200] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/50 focus-visible:ring-offset-2"
          >
            Search
          </button>
        </form>

        {/* Quick actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/post-requirement"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF6C00] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E86200] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/50 focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Post a requirement
          </Link>
          <Link
            href="/register-business"
            className="inline-flex items-center gap-2 rounded-lg border border-[#FF6C00] bg-white px-4 py-2.5 text-sm font-semibold text-[#FF6C00] transition-colors hover:bg-[#F0F0F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/50 focus-visible:ring-offset-2"
          >
            List your business
          </Link>
        </div>
      </div>
    </div>
  );
}
