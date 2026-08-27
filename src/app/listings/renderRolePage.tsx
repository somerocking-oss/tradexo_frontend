import type { Metadata } from "next";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ListingsPageClient } from "./ListingsPageClient";
import { ListingsPageHero } from "./ListingsPageHero";
import { loadListingsPageData } from "./loadListingsPage";
import { buildListingsSeo, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getRoleBusinessCount } from "@/lib/api/business-server";
import { fetchSiteSettings } from "@/lib/cms";
import { SITE_NAME } from "@/lib/constants";
import type { BusinessRole } from "@/lib/listings-url";

type Params = Record<string, string | string[] | undefined>;

export async function getRolePageMetadata(
  sp: Params,
  role: BusinessRole,
  city?: string
): Promise<Metadata> {
  // Unlike category pages (always deep enough nationwide), role pages are
  // gated even without a city — marketplaceType is sparsely populated today
  // (most businesses default to "local_service"), so /suppliers and
  // /wholesalers can genuinely have near-zero real content right now.
  const businessCount = await getRoleBusinessCount({ city, marketplaceType: role.marketplaceType });

  const merged = {
    ...sp,
    city,
    marketplaceType: role.marketplaceType,
    roleSlug: role.slug,
    roleLabel: role.label,
    roleBusinessCount: String(businessCount),
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

export async function RolePageContent({
  sp,
  role,
  city,
  page,
}: {
  sp: Params;
  role: BusinessRole;
  city?: string;
  page: number;
}) {
  const merged = {
    ...sp,
    city,
    marketplaceType: role.marketplaceType,
    roleSlug: role.slug,
    roleLabel: role.label,
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
      {data.collectionPageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data.collectionPageJsonLd) }}
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
          pathMarketplaceType={role.marketplaceType}
          pathPage={page > 1 ? page : undefined}
          initialSubcategories={data.subcategories}
          initialPopularSearches={data.popularSearches}
          topCities={data.topCities}
        />
      </Suspense>
    </MainLayout>
  );
}
