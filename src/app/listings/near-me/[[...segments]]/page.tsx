import type { Metadata } from "next";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ListingsPageClient } from "../../ListingsPageClient";
import { ListingsPageHero } from "../../ListingsPageHero";
import { loadListingsPageData } from "../../loadListingsPage";
import { buildListingsSeo, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { fetchSiteSettings } from "@/lib/cms";
import { SITE_NAME } from "@/lib/constants";
import { parseNearMeSegments } from "@/lib/listings-url";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function mergeNearMeParams(
  segments: string[] | undefined,
  sp: Record<string, string | string[] | undefined>
) {
  const { viewMode, radiusKm } = parseNearMeSegments(segments);
  return {
    ...sp,
    nearMe: "true",
    sort: "distance",
    radiusKm: String(radiusKm),
    ...(viewMode === "map" ? { view: "map" } : {}),
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { segments } = await params;
  const sp = await searchParams;
  const merged = mergeNearMeParams(segments, sp);
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

export default async function ListingsNearMePage({ params, searchParams }: PageProps) {
  const { segments } = await params;
  const sp = await searchParams;
  const { viewMode, radiusKm } = parseNearMeSegments(segments);
  const merged = mergeNearMeParams(segments, sp);
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
      {data.collectionPageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data.collectionPageJsonLd) }}
        />
      )}
      <ListingsPageHero {...data.hero} />
      <Suspense
        fallback={
          <div className="mx-auto max-w-8xl px-4 py-20 text-center text-slate-500 sm:px-6">
            Loading listings...
          </div>
        }
      >
        <ListingsPageClient
          initialBusinesses={data.initialBusinesses}
          serverPrefetched={data.serverPrefetched}
          initialTotal={data.initialTotal}
          initialTotalPages={data.initialTotalPages}
          pathNearMe
          pathViewMode={viewMode}
          pathRadiusKm={radiusKm}
        />
      </Suspense>
    </MainLayout>
  );
}
