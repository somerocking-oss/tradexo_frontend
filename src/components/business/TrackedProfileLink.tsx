"use client";

import Link from "next/link";
import { trackProfileClick, type ClickSource, type TrackingContext } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

export function TrackedProfileLink({
  businessId,
  href,
  className,
  children,
  tracking,
}: {
  businessId: string;
  href: string;
  className?: string;
  children: React.ReactNode;
  tracking?: TrackingContext;
}) {
  const handleClick = () => {
    trackProfileClick(businessId, {
      source: (tracking?.source || "listing") as ClickSource,
      keyword: tracking?.keyword,
      city: tracking?.city,
    });
  };

  return (
    <Link href={href} onClick={handleClick} className={cn(className)}>
      {children}
    </Link>
  );
}
