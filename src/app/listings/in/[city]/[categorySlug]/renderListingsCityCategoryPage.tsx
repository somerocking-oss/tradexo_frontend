import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ListingsPageClient } from "../../../ListingsPageClient";
import { ListingsPageHero } from "../../../ListingsPageHero";
import { loadListingsPageData } from "../../../loadListingsPage";
import { buildListingsSeo, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getCategoryBySlug } from "@/lib/api/category-server";
import { fetchSiteSettings } from "@/lib/cms";
import { SITE_NAME } from "@/lib/constants";

type Params = Record<string, string | string[] | undefined>;

export async function getListingsCityCategoryMetadata(
  sp: Params,
  city: string,
  categorySlug: string
): Promise<Metadata> {
  const category = await getCategoryBySlug(categorySlug);
  const merged = {
    ...sp,
    city,
    categoryId: category?._id,
    categorySlug: category?.slug || categorySlug,
    categoryName: category?.name,
  };
  const settings = await fetchSiteSettings();
  const seo = buildListingsSeo(merged, settings?.seo?.onPage, settings?.siteName || SITE_NAME);
  const ogImage = settings?.seo?.ogImage || DEFAULT_OG_IMAGE;

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: seo.noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
  };
}

export async function ListingsCityCategoryPageContent({
  sp,
  city,
  categorySlug,
  page,
}: {
  sp: Params;
  city: string;
  categorySlug: string;
  page: number;
}) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  const resolvedCategorySlug = category.slug || categorySlug;

  const merged = {
    ...sp,
    city,
    categoryId: category._id,
    categorySlug: resolvedCategorySlug,
    categoryName: category.name,
    page: String(page),
  };

  const data = await loadListingsPageData(merged);

  return (
    <MainLayout>
      {data.onPage?.schema?.enableBreadcrumbs !== false && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data.breadcrumbJsonLd) }}
        />
      )}
      {data.itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data.itemListJsonLd) }}
        />
      )}
      <ListingsPageHero {...data.hero} />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-500 sm:px-6">
            Loading listings…
          </div>
        }
      >
        <ListingsPageClient
          initialBusinesses={data.initialBusinesses}
          serverPrefetched={data.serverPrefetched}
          initialTotal={data.initialTotal}
          initialTotalPages={data.initialTotalPages}
          pathCity={city}
          pathCategoryId={category._id}
          pathCategorySlug={resolvedCategorySlug}
          pathPage={page > 1 ? page : undefined}
          initialSubcategories={data.subcategories}
          initialPopularSearches={data.popularSearches}
          topCities={data.topCities}
        />
      </Suspense>
    </MainLayout>
  );
}
