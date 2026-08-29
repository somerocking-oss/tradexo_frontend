import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowsePageClient } from "./BrowsePageClient";
import { parseBrowseSlug } from "@/lib/browse-slug";
import { searchBusinessesServer } from "@/lib/api/business-server";
import {
  buildBreadcrumbJsonLd,
  buildBrowseSeo,
  buildItemListJsonLd,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";
import { fetchSiteSettings } from "@/lib/cms";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const priority = [
    "manufacturers-in-delhi",
    "manufacturers-in-mumbai",
    "packers-and-movers-in-noida",
    "doctors-in-patna",
    "hotels-in-jaipur",
    "wholesalers-in-delhi",
    "suppliers-in-bangalore",
    "logistics-companies-in-hyderabad",
  ];
  return priority.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { keyword, city } = parseBrowseSlug(slug);
  const [settings, initialBusinesses] = await Promise.all([
    fetchSiteSettings(),
    searchBusinessesServer({
      keyword: keyword || undefined,
      city: city || undefined,
      sort: "priority",
      limit: 24,
      page: 1,
    }),
  ]);
  const browseSeo = buildBrowseSeo(
    keyword,
    city,
    settings?.seo?.onPage,
    settings?.siteName || SITE_NAME,
    initialBusinesses.length
  );
  const ogImage = settings?.seo?.ogImage || DEFAULT_OG_IMAGE;
  const fullTitle = `${browseSeo.title} | ${settings?.siteName || SITE_NAME}`;

  return {
    title: browseSeo.title,
    description: browseSeo.description,
    alternates: { canonical: `${SITE_URL}/browse/${slug}` },
    robots: browseSeo.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: fullTitle,
      description: browseSeo.description,
      url: `${SITE_URL}/browse/${slug}`,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: browseSeo.description,
      images: [ogImage],
    },
  };
}

export default async function BrowsePage({ params }: PageProps) {
  const { slug } = await params;
  const { keyword, city } = parseBrowseSlug(slug);

  const settings = await fetchSiteSettings();
  const onPage = settings?.seo?.onPage;
  const browseSeo = buildBrowseSeo(
    keyword,
    city,
    onPage,
    settings?.siteName || SITE_NAME
  );
  const pageTitle = browseSeo.h1;
  const pageUrl = `${SITE_URL}/browse/${slug}`;

  const initialBusinesses = await searchBusinessesServer({
    keyword: keyword || undefined,
    city: city || undefined,
    sort: "priority",
    limit: 24,
    page: 1,
  });

  const supportPhone =
    settings?.footer?.supportPhone ||
    settings?.footer?.phone ||
    settings?.contactPhone ||
    "";

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Browse", url: `${SITE_URL}/browse` },
    { name: pageTitle, url: pageUrl },
  ]);

  const itemListJsonLd =
    onPage?.schema?.enableItemList !== false && initialBusinesses.length > 0
      ? buildItemListJsonLd(initialBusinesses, pageTitle, pageUrl)
      : null;

  return (
    <>
      {onPage?.schema?.enableBreadcrumbs !== false && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <BrowsePageClient
          keyword={keyword}
          city={city}
          pageTitle={pageTitle}
          pageDescription={browseSeo.description}
          supportPhone={supportPhone}
          initialBusinesses={initialBusinesses}
          serverPrefetched={initialBusinesses.length > 0}
        />
      </Suspense>
    </>
  );
}
