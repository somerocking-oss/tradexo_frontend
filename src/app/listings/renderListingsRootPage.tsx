import type { Metadata } from "next";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ListingsPageClient } from "./ListingsPageClient";
import { ListingsPageHero } from "./ListingsPageHero";
import { loadListingsPageData } from "./loadListingsPage";
import { buildListingsSeo, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { fetchSiteSettings } from "@/lib/cms";
import { SITE_NAME } from "@/lib/constants";

type Params = Record<string, string | string[] | undefined>;

export async function getListingsRootMetadata(params: Params): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const seo = buildListingsSeo(params, settings?.seo?.onPage, settings?.siteName || SITE_NAME);
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

export async function ListingsRootPageContent({
  params,
  page,
}: {
  params: Params;
  page: number;
}) {
  const data = await loadListingsPageData({ ...params, page: String(page) });

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
            Loading listings...
          </div>
        }
      >
        <ListingsPageClient
          initialBusinesses={data.initialBusinesses}
          serverPrefetched={data.serverPrefetched}
          initialTotal={data.initialTotal}
          initialTotalPages={data.initialTotalPages}
          initialPopularSearches={data.popularSearches}
          topCities={data.topCities}
          pathPage={page > 1 ? page : undefined}
        />
      </Suspense>
    </MainLayout>
  );
}
