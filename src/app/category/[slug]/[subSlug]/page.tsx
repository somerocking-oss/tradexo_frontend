import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { buildListingsUrl } from "@/lib/listings-url";
import { getParam } from "@/lib/seo";
import { getCategoryBySlug } from "@/lib/api/category-server";
import { getSubCategoryBySlug } from "@/lib/api/subcategory-server";
import {
  getListingsCategorySubMetadata,
  ListingsCategorySubPageContent,
} from "./renderListingsCategorySubPage";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string; subSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug, subSlug } = await params;
  const sp = await searchParams;

  // Bare numeric segment — legacy/shorthand page number, not a subcategory slug.
  if (/^\d+$/.test(subSlug)) {
    const pageNum = Number(subSlug);
    redirect(
      buildListingsUrl({
        categorySlug: slug,
        page: pageNum > 1 ? pageNum : undefined,
      })
    );
  }

  return getListingsCategorySubMetadata(sp, slug, subSlug);
}

export default async function ListingsSubCategoryPage({ params, searchParams }: PageProps) {
  const { slug, subSlug } = await params;
  const sp = await searchParams;

  // Bare numeric segment — legacy/shorthand page number, not a subcategory slug.
  if (/^\d+$/.test(subSlug)) {
    const pageNum = Number(subSlug);
    redirect(
      buildListingsUrl({
        categorySlug: slug,
        page: pageNum > 1 ? pageNum : undefined,
      })
    );
  }

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categorySlug = category.slug || slug;
  const subCategory = await getSubCategoryBySlug(subSlug, category._id);

  if (!subCategory) {
    notFound();
  }

  const subCategorySlug = subCategory.slug || subSlug;

  if (
    getParam(sp, "subCategoryId") === subCategory._id ||
    getParam(sp, "subcategory") === subCategorySlug
  ) {
    redirect(
      buildListingsUrl({
        categorySlug,
        subCategorySlug,
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
        subCategorySlug,
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

  return <ListingsCategorySubPageContent sp={sp} slug={slug} subSlug={subSlug} page={1} />;
}
