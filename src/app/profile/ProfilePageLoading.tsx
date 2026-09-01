export function ProfilePageLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero skeleton */}
      <div className="border-b border-neutral-100 bg-white px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-8xl animate-pulse">
          <div className="mb-5 h-3 w-32 rounded-full bg-neutral-200" />
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-neutral-200" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-5 w-28 rounded-full bg-neutral-200" />
              <div className="h-8 w-52 rounded-lg bg-neutral-200" />
              <div className="h-4 w-40 rounded-full bg-neutral-100" />
            </div>
            <div className="hidden gap-3 sm:flex">
              <div className="h-16 w-28 rounded-xl bg-neutral-100" />
              <div className="h-16 w-28 rounded-xl bg-neutral-100" />
            </div>
          </div>
          {/* Progress bar skeleton */}
          <div className="mt-6 h-14 rounded-xl bg-neutral-100" />
        </div>
      </div>

      {/* Mobile nav skeleton */}
      <div className="border-b border-neutral-100 bg-white px-4 py-3 lg:hidden">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-24 shrink-0 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>

      {/* Quick action strip skeleton */}
      <div className="border-b border-neutral-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto grid max-w-8xl grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      </div>

      {/* Body skeleton */}
      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
          {/* Sidebar */}
          <div className="hidden animate-pulse space-y-3 lg:block">
            <div className="h-72 rounded-xl bg-neutral-100" />
            <div className="h-32 rounded-xl bg-neutral-100" />
          </div>
          {/* Content */}
          <div className="space-y-4">
            <div className="h-72 animate-pulse rounded-xl bg-neutral-100" />
            <div className="h-44 animate-pulse rounded-xl bg-neutral-100" />
            <div className="h-56 animate-pulse rounded-xl bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
