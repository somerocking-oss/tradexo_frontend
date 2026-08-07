import type { Business } from "@/types";

export function getBusinessProfilePath(
  business: Pick<Business, "_id" | "slug"> | { _id: string; slug?: string }
) {
  const slug = business.slug?.trim();
  if (slug) return `/business/${slug}`;
  return `/business/${business._id}`;
}

/** @deprecated use getBusinessProfilePath */
export const buildBusinessUrl = getBusinessProfilePath;
