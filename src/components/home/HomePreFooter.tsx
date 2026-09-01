import { SITE_NAME } from "@/lib/constants";

export function HomePreFooter() {
  return (
    <section
      className="relative overflow-hidden px-3 py-8 sm:px-4 sm:py-10"
      style={{
        background:
          "linear-gradient(160deg, #0B1120 0%, #0F172A 35%, #1A2540 65%, #0F172A 100%)",
      }}
      aria-labelledby="prefooter-heading"
    >
      {/* Fine dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />
      {/* Orange top accent */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #FF6C00 25%, #FF8C38 50%, #FF6C00 75%, transparent 100%)",
          opacity: 0.6,
        }}
        aria-hidden
      />
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #FF6C00 0%, transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-60 w-60 rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #38BDF8 0%, transparent 70%)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl text-center">

        {/* Badge */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FF6C00]/25 bg-[#FF6C00]/10 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF6C00]" aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF6C00]">
            Stay Connected
          </span>
        </div>

        <h2
          id="prefooter-heading"
          className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          Never Miss a Business Opportunity
        </h2>
        <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-[#94A3B8]">
          Weekly supplier updates, buyer alerts &amp; market trends — straight to your inbox.
        </p>

        {/* Newsletter form */}
        <form
          className="mt-5 flex flex-col gap-2 sm:flex-row"
          action="#"
          method="post"
          aria-label="Newsletter subscription"
        >
          <label htmlFor="prefooter-email" className="sr-only">
            Email address
          </label>
          <input
            id="prefooter-email"
            type="email"
            name="email"
            placeholder="Enter your business email"
            autoComplete="email"
            className="h-11 min-w-0 flex-1 rounded-xl border border-[#283550] bg-[#152032] px-4 text-sm text-white outline-none placeholder:text-[#3D5470] transition-colors duration-200 focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-xl bg-[#FF6C00] px-6 text-sm font-semibold text-white shadow-lg shadow-[#FF6C00]/25 transition-all duration-200 ease-out hover:bg-[#E85800] hover:shadow-[#FF6C00]/35 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/50"
          >
            Subscribe Free
          </button>
        </form>
        <p className="mt-2.5 text-xs text-[#3D5470]">
          No spam, ever. Join 10,000+ businesses already subscribed.
        </p>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#1E3050]" aria-hidden />
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#3D5470]">
            Also Available On
          </span>
          <div className="h-px flex-1 bg-[#1E3050]" aria-hidden />
        </div>

        {/* App buttons + India badge — centered row */}
        <div className="flex flex-wrap items-center justify-center gap-3">

          {/* Google Play */}
          <button
            type="button"
            className="group inline-flex items-center gap-3 rounded-xl border border-[#1E3050] bg-[#0D1B2E] px-4 py-2.5 transition-all duration-200 hover:border-[#FF6C00]/35 hover:bg-[#121F33]"
            aria-label="Download on Google Play"
          >
            <svg className="h-5 w-5 shrink-0 text-[#64748B] transition-colors group-hover:text-[#94A3B8]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3.18 23.75c.3.17.64.25.99.25.36 0 .73-.09 1.05-.28l12.18-7.03-2.76-2.76L3.18 23.75zM.08 1.1A1.5 1.5 0 000 1.72v20.56c0 .22.03.43.08.63l12.07-12.07L.08 1.1zM20.44 10.1l-2.84-1.64-3.1 3.1 3.1 3.1 2.87-1.65c.82-.47.82-1.44-.03-1.91zM4.22.53C3.9.34 3.53.25 3.17.25c-.35 0-.69.08-.99.25l11.46 11.46 2.76-2.76L4.22.53z" />
            </svg>
            <span>
              <span className="block text-[9px] font-normal leading-none text-[#3D5470]">Get it on</span>
              <span className="text-[13px] font-semibold leading-snug text-white">Google Play</span>
            </span>
          </button>

          {/* App Store */}
          <button
            type="button"
            className="group inline-flex items-center gap-3 rounded-xl border border-[#1E3050] bg-[#0D1B2E] px-4 py-2.5 transition-all duration-200 hover:border-[#FF6C00]/35 hover:bg-[#121F33]"
            aria-label="Download on the App Store"
          >
            <svg className="h-5 w-5 shrink-0 text-[#64748B] transition-colors group-hover:text-[#94A3B8]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span>
              <span className="block text-[9px] font-normal leading-none text-[#3D5470]">Download on the</span>
              <span className="text-[13px] font-semibold leading-snug text-white">App Store</span>
            </span>
          </button>

          {/* India badge */}
          <div className="hidden h-8 w-px bg-[#1E3050] sm:block" aria-hidden />
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1E3050] bg-[#0D1B2E] px-3.5 py-2">
            <span className="text-sm" aria-label="Indian flag">🇮🇳</span>
            <span className="text-xs font-medium text-[#64748B]">Made in India</span>
          </div>
        </div>

      </div>
    </section>
  );
}
