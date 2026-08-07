import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { buildListingsUrl, parseListingsCityParam } from "@/lib/listings-url";
import { getParam } from "@/lib/seo";
import { getCategoryBySlug } from "@/lib/api/category-server";
import { getSubCategoryBySlug } from "@/lib/api/subcategory-server";
import {
  getListingsCityCategorySubMetadata,
  ListingsCityCategorySubPageContent,
} from "./renderListingsCityCategorySubPage";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ city: string; categorySlug: string; subSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { city: citySlug, categorySlug, subSlug } = await params;
  const sp = await searchParams;
  const city = parseListingsCityParam(citySlug);

  // Bare numeric segment — legacy/shorthand page number, not a subcategory slug.
  if (/^\d+$/.test(subSlug)) {
    const pageNum = Number(subSlug);
    redirect(
      buildListingsUrl({
        city,
        categorySlug,
        page: pageNum > 1 ? pageNum : undefined,
      })
    );
  }

  return getListingsCityCategorySubMetadata(sp, city, categorySlug, subSlug);
}

export default async function ListingsCityCategorySubCategoryPage({ params, searchParams }: PageProps) {
  const { city: citySlug, categorySlug, subSlug } = await params;
  const sp = await searchParams;
  const city = parseListingsCityParam(citySlug);

  // Bare numeric segment — legacy/shorthand page number, not a subcategory slug.
  if (/^\d+$/.test(subSlug)) {
    const pageNum = Number(subSlug);
    redirect(
      buildListingsUrl({
        city,
        categorySlug,
        page: pageNum > 1 ? pageNum : undefined,
      })
    );
  }

  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const resolvedCategorySlug = category.slug || categorySlug;
  const subCategory = await getSubCategoryBySlug(subSlug, category._id);

  if (!subCategory) {
    notFound();
  }

  const resolvedSubCategorySlug = subCategory.slug || subSlug;

  if (
    getParam(sp, "subCategoryId") === subCategory._id ||
    getParam(sp, "subcategory") === resolvedSubCategorySlug
  ) {
    redirect(
      buildListingsUrl({
        city,
        categorySlug: resolvedCategorySlug,
        subCategorySlug: resolvedSubCategorySlug,
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
        categorySlug: resolvedCategorySlug,
        subCategorySlug: resolvedSubCategorySlug,
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

  return (
    <ListingsCityCategorySubPageContent
      sp={sp}
      city={city}
      categorySlug={categorySlug}
      subSlug={subSlug}
      page={1}
    />
  );
}
