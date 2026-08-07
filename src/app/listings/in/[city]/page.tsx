import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildListingsUrl, parseListingsCityParam } from "@/lib/listings-url";
import { getParam } from "@/lib/seo";
import { getListingsCityMetadata, ListingsCityPageContent } from "./renderListingsCityPage";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const sp = await searchParams;
  const city = parseListingsCityParam(citySlug);
  return getListingsCityMetadata(sp, city);
}

export default async function ListingsCityPage({ params, searchParams }: PageProps) {
  const { city: citySlug } = await params;
  const sp = await searchParams;
  const city = parseListingsCityParam(citySlug);

  // Redirect legacy ?category= query param → SEO-friendly path /listings/in/city/category
  const categorySlugParam = getParam(sp, "category") || getParam(sp, "categorySlug");
  if (categorySlugParam) {
    redirect(
      buildListingsUrl({
        city,
        categorySlug: categorySlugParam,
        subCategorySlug: getParam(sp, "subcategory") || undefined,
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

  // Legacy ?page= query — redirect to path-based /listings/in/{city}/page/{N}.
  const legacyPage = getParam(sp, "page");
  if (legacyPage) {
    redirect(
      buildListingsUrl({
        city,
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

  return <ListingsCityPageContent sp={sp} city={city} page={1} />;
}
