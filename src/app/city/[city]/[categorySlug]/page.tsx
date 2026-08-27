import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildListingsUrl, parseListingsCityParam } from "@/lib/listings-url";
import { getParam } from "@/lib/seo";
import {
  getListingsCityCategoryMetadata,
  ListingsCityCategoryPageContent,
} from "./renderListingsCityCategoryPage";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ city: string; categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { city: citySlug, categorySlug } = await params;
  const sp = await searchParams;
  const city = parseListingsCityParam(citySlug);
  return getListingsCityCategoryMetadata(sp, city, categorySlug);
}

export default async function ListingsCityCategoryPage({ params, searchParams }: PageProps) {
  const { city: citySlug, categorySlug } = await params;
  const sp = await searchParams;
  const city = parseListingsCityParam(citySlug);

  // Redirect if subcategory was passed as query param → clean path
  const subCategoryQuery = getParam(sp, "subcategory");
  if (subCategoryQuery) {
    redirect(
      buildListingsUrl({
        city,
        categorySlug,
        subCategorySlug: subCategoryQuery,
        sort: getParam(sp, "sort") || undefined,
        verifiedOnly: getParam(sp, "isVerified") === "true",
        featuredOnly: getParam(sp, "isFeatured") === "true",
        bulkOnly: getParam(sp, "acceptsBulkOrders") === "true",
        marketplaceType: getParam(sp, "marketplaceType") || undefined,
        sellerIntent: getParam(sp, "sellerIntent") || undefined,
        page: Number(getParam(sp, "page") || "1"),
      })
    );
  }

  // Legacy ?page= query — redirect to path-based .../page/{N}.
  const legacyPage = getParam(sp, "page");
  if (legacyPage) {
    redirect(
      buildListingsUrl({
        city,
        categorySlug,
        sort: getParam(sp, "sort") || undefined,
        verifiedOnly: getParam(sp, "isVerified") === "true",
        featuredOnly: getParam(sp, "isFeatured") === "true",
        bulkOnly: getParam(sp, "acceptsBulkOrders") === "true",
        marketplaceType: getParam(sp, "marketplaceType") || undefined,
        sellerIntent: getParam(sp, "sellerIntent") || undefined,
        page: Number(legacyPage) > 1 ? Number(legacyPage) : undefined,
      })
    );
  }

  return <ListingsCityCategoryPageContent sp={sp} city={city} categorySlug={categorySlug} page={1} />;
}
