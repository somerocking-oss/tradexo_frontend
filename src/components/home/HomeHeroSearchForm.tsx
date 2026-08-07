import type { Category } from "@/types";

export function HomeHeroSearchForm({ categories = [] }: { categories?: Category[] }) {
  return (
    <form
      action="/listings"
      method="get"
      className="home-wire-search flex w-full flex-col overflow-hidden rounded-xl border-2 border-neutral-200 bg-white shadow-[0_4px_6px_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.06)] transition-shadow duration-200 focus-within:border-[#FF6C00] focus-within:shadow-[0_4px_14px_rgba(255,108,0,0.18)] sm:flex-row sm:items-stretch"
    >
      {/* Category selector */}
      <div className="relative flex min-w-0 items-center border-b border-neutral-100 sm:w-[140px] sm:shrink-0 sm:border-b-0 sm:border-r lg:w-[160px]">
        <svg
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <select
          name="categoryId"
          defaultValue=""
          aria-label="Category"
          className="h-12 w-full cursor-pointer appearance-none border-0 bg-transparent pl-10 pr-6 text-sm font-medium text-neutral-700 outline-none transition-colors placeholder:text-neutral-400 sm:h-14"
        >
          <option value="">All Categories</option>
          {categories.slice(0, 24).map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {/* Custom dropdown chevron */}
        <svg
          className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* Keyword input */}
      <div className="relative min-w-0 flex-1 border-b border-neutral-100 sm:border-b-0 sm:border-r">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 sm:left-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          name="keyword"
          placeholder="Search for products, companies..."
          className="h-12 w-full border-0 bg-transparent pl-10 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 sm:h-14 sm:pl-11 sm:text-base"
        />
      </div>

      {/* City input */}
      <div className="relative flex min-w-0 items-center border-b border-neutral-100 sm:w-[128px] sm:shrink-0 sm:border-b-0 sm:border-r lg:w-[148px]">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <input
          type="text"
          name="city"
          placeholder="All India"
          className="h-12 w-full border-0 bg-transparent pl-10 pr-3 text-sm font-medium text-neutral-700 outline-none placeholder:text-neutral-400 sm:h-14"
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="flex h-12 items-center justify-center gap-2 rounded-b-[10px] bg-[#FF6C00] px-5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,108,0,0.25)] transition-all duration-200 ease-out hover:bg-[#E86200] hover:shadow-[0_4px_18px_rgba(255,108,0,0.35)] active:scale-[0.98] sm:h-14 sm:min-w-[108px] sm:rounded-b-none sm:rounded-r-[10px] sm:text-base"
      >
        <svg
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Search
      </button>
    </form>
  );
}
