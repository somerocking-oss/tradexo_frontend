"use client";

import { Mail } from "lucide-react";

export function HomeNewsletterBar() {
  return (
    <section className="relative overflow-hidden bg-[#0F1E3D] px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-full w-1/3 bg-gradient-to-l from-[#ff6c00]/20 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex items-center gap-4 text-center md:text-left">
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ff6c00]/20 text-[#ff6c00] sm:flex">
            <Mail className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Stay Updated with Latest Business Opportunities
            </h2>
            <p className="mt-1 text-sm text-[#B7C3DD]">
              Get weekly leads, industry news and supplier updates in your inbox.
            </p>
          </div>
        </div>

        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            className="min-w-0 flex-1 rounded-lg border border-[#2A4470] bg-[#16294D] px-4 py-3 text-sm text-white placeholder:text-[#7C8FB3] outline-none focus:border-[#ff6c00]"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-[#ff6c00] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e86200]"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
