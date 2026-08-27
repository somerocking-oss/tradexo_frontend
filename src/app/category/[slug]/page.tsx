import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { buildListingsUrl } from "@/lib/listings-url";
import { getParam } from "@/lib/seo";
import { getCategoryBySlug } from "@/lib/api/category-server";
import { getListingsCategoryMetadata, ListingsCategoryPageContent } from "./renderListingsCategoryPage";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  return getListingsCategoryMetadata(sp, slug);
}

export default async function ListingsCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categorySlug = category.slug || slug;

  if (getParam(sp, "categoryId") === category._id) {
    const redirectUrl = buildListingsUrl({
      categorySlug,
      subCategorySlug: getParam(sp, "subcategory") || undefined,
      sort: getParam(sp, "sort") || undefined,
      verifiedOnly: getParam(sp, "isVerified") === "true",
      featuredOnly: getParam(sp, "isFeatured") === "true",
      bulkOnly: getParam(sp, "acceptsBulkOrders") === "true",
      marketplaceType: getParam(sp, "marketplaceType") || undefined,
      sellerIntent: getParam(sp, "sellerIntent") || undefined,
      page: Number(getParam(sp, "page") || "1"),
    });
    redirect(redirectUrl);
  }

  const subcategoryQuery = getParam(sp, "subcategory");
  if (subcategoryQuery) {
    redirect(
      buildListingsUrl({
        categorySlug,
        subCategorySlug: subcategoryQuery,
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

  return <ListingsCategoryPageContent sp={sp} slug={slug} page={1} />;
}
