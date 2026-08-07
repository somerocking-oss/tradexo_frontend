import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getListingsSeoRedirect, buildListingsUrl } from "@/lib/listings-url";
import { getParam } from "@/lib/seo";
import { getCategoryByIdServer } from "@/lib/api/category-server";
import { getListingsRootMetadata, ListingsRootPageContent } from "./renderListingsRootPage";

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return getListingsRootMetadata(params);
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const categoryId = getParam(params, "categoryId");
  if (categoryId && !getParam(params, "city") && !getParam(params, "keyword") && !getParam(params, "q") && getParam(params, "nearMe") !== "true") {
    const category = await getCategoryByIdServer(categoryId);
    if (category?.slug) {
      redirect(
        buildListingsUrl({
          categorySlug: category.slug,
          sort: getParam(params, "sort") || undefined,
          verifiedOnly: getParam(params, "isVerified") === "true",
          featuredOnly: getParam(params, "isFeatured") === "true",
          bulkOnly: getParam(params, "acceptsBulkOrders") === "true",
          marketplaceType: getParam(params, "marketplaceType") || undefined,
          sellerIntent: getParam(params, "sellerIntent") || undefined,
          page: Number(getParam(params, "page") || "1"),
        })
      );
    }
  }

  // Handles legacy ?page= too — getListingsSeoRedirect now converts any
  // page>1 query param to the path-based /page/{N} form.
  const seoRedirect = getListingsSeoRedirect(params);
  if (seoRedirect) {
    redirect(seoRedirect);
  }

  return <ListingsRootPageContent params={params} page={1} />;
}
