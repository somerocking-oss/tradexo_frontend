import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * When true the card gains hover lift + brand-tinted border so it feels
   * interactive/clickable (use for listing cards, feature cards, etc.).
   */
  hover?: boolean;
};

/**
 * Surface container. Compose with CardHeader, CardBody, CardFooter.
 *
 * @example
 * <Card hover onClick={...}>
 *   <CardHeader><CardTitle>Title</CardTitle></CardHeader>
 *   <CardBody>content</CardBody>
 * </Card>
 */
export function Card({ className, hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        // Base surface
        "bg-white rounded-xl border border-neutral-100 shadow-sm",
        // Hover variant — lift + orange-tinted border
        hover && [
          "cursor-pointer transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-md hover:border-[#FF6C00]/20",
        ],
        className
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// CardHeader
// ---------------------------------------------------------------------------

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-neutral-100 px-6 py-4",
        className
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// CardTitle
// ---------------------------------------------------------------------------

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-neutral-900 leading-snug", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// CardDescription
// ---------------------------------------------------------------------------

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-neutral-500 leading-relaxed", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// CardBody  (main content area — has default padding)
// ---------------------------------------------------------------------------

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// CardFooter
// ---------------------------------------------------------------------------

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center border-t border-neutral-100 px-6 py-4",
        className
      )}
      {...props}
    />
  );
}
