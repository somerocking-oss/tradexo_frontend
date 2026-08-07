import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Primitive — all other skeletons build on this
// ---------------------------------------------------------------------------

/**
 * Base skeleton block. Pass a `className` with explicit width/height to size it.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded bg-neutral-100", className)}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonText — mimics one or more lines of text
// ---------------------------------------------------------------------------

export interface SkeletonTextProps {
  /** Number of text lines to render. */
  lines?: number;
  /** Extra class on the wrapper. */
  className?: string;
  /** Last line is shorter by default to look natural; set false to disable. */
  shortLastLine?: boolean;
}

/**
 * Renders stacked skeleton lines that mimic a paragraph.
 *
 * @example
 * <SkeletonText lines={3} />
 */
export function SkeletonText({
  lines = 1,
  className,
  shortLastLine = true,
}: SkeletonTextProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 rounded",
            // Last line is ≈ 2/3 width to look like natural text wrap
            i === lines - 1 && lines > 1 && shortLastLine ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkeletonBlock — generic rectangular placeholder (images, charts, maps…)
// ---------------------------------------------------------------------------

export interface SkeletonBlockProps {
  className?: string;
}

/**
 * Rectangular skeleton for images, banners, video thumbnails, etc.
 *
 * @example
 * <SkeletonBlock className="h-48 w-full rounded-xl" />
 */
export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <Skeleton className={cn("rounded-xl", className)} />;
}

// ---------------------------------------------------------------------------
// SkeletonAvatar — circle for user/business avatars
// ---------------------------------------------------------------------------

type AvatarSize = "sm" | "md" | "lg" | "xl";

const avatarSizes: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export interface SkeletonAvatarProps {
  size?: AvatarSize;
  className?: string;
}

/**
 * Circular skeleton for avatars.
 *
 * @example
 * <SkeletonAvatar size="md" />
 */
export function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
  return (
    <Skeleton
      className={cn("shrink-0 rounded-full", avatarSizes[size], className)}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonCard — pre-composed card-shaped loading state
// ---------------------------------------------------------------------------

export interface SkeletonCardProps {
  /** Show an image/banner block at the top (default true). */
  image?: boolean;
  className?: string;
}

/**
 * A card-shaped skeleton for list/grid loading states.
 *
 * @example
 * {isLoading && Array.from({length: 6}).map((_, i) => <SkeletonCard key={i} />)}
 */
export function SkeletonCard({ image = true, className }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm",
        className
      )}
    >
      {image && <Skeleton className="h-44 w-full rounded-none" />}

      <div className="space-y-3 p-5">
        {/* Title line */}
        <Skeleton className="h-5 w-3/4" />

        {/* Subtitle / meta row */}
        <div className="flex items-center gap-2">
          <SkeletonAvatar size="sm" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Body text */}
        <SkeletonText lines={2} />

        {/* Action / footer row */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Re-export legacy BusinessCardSkeleton so existing imports don't break
// ---------------------------------------------------------------------------

/**
 * @deprecated Use <SkeletonCard /> instead.
 */
export function BusinessCardSkeleton() {
  return <SkeletonCard image />;
}
