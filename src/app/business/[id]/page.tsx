import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { BusinessProfileHero } from "@/components/business/BusinessProfileHero";
import { BusinessProfileTabs, type ProfileTab } from "@/components/business/BusinessProfileTabs";
import { BusinessCatalogSection } from "@/components/business/BusinessCatalogSection";
import { StickyBusinessContact } from "@/components/business/StickyBusinessContact";
import { BusinessReviews } from "@/components/business/BusinessReviews";
import { SimilarBusinesses } from "@/components/business/SimilarBusinesses";
import { BusinessFAQSection } from "@/components/business/BusinessFAQSection";
import { BusinessContactLinks } from "@/components/business/BusinessContactLinks";
import { BusinessOffersBranches } from "@/components/business/BusinessOffersBranches";
import { BusinessPageAnalytics } from "@/components/business/BusinessPageAnalytics";
import { getImageUrl, getBusinessHeroImageUrl } from "@/lib/utils";
import { getBusinessByIdServer } from "@/lib/api/business-server";
import { getBusinessProfilePath } from "@/lib/business-url";
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd, buildOpeningHoursJsonLd, isBusinessSeoComplete } from "@/lib/seo";
import { fetchSiteSettings } from "@/lib/cms";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { buildListingsCategoryPath, buildListingsCityCategoryPath, buildListingsCityPath, categoryToSlug } from "@/lib/listings-url";
import type { Business, BusinessCatalogItem } from "@/types";

export const revalidate = 300;

const Clock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

function sectionCard(title: string, children: ReactNode) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-400 bg-white shadow-sm">
      <div className="border-b border-[#f5f5f5] bg-[#fafafa] px-5 py-3.5 sm:px-6">
        <h2 className="text-base font-bold text-[#111] sm:text-lg">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const business = await getBusinessByIdServer(id);
  if (!business) return { title: "Business Not Found" };

  const profilePath = getBusinessProfilePath(business);

  const seo = (business as Business & { seo?: Record<string, unknown> }).seo as
    | {
        metaTitle?: string;
        metaDescription?: string;
        ogImage?: string;
        ogTitle?: string;
        ogDescription?: string;
        noIndex?: boolean;
        noFollow?: boolean;
        canonicalUrl?: string;
      }
    | undefined;

  const citySuffix = business.city ? ` in ${business.city}` : "";
  const categoryName =
    business.primaryCategory && typeof business.primaryCategory === "object"
      ? business.primaryCategory.name
      : undefined;
  const categoryCityLabel = categoryName
    ? `${categoryName}${citySuffix}`
    : business.city
      ? `Business in ${business.city}`
      : undefined;
  const title =
    seo?.metaTitle ||
    (categoryCityLabel
      ? `${business.name} | ${categoryCityLabel}`
      : `${business.name} - Contact Number, Address, Price Quotes`);
  const realSummary = business.shortDescription || business.description?.slice(0, 120);
  const categoryArticle = /^[aeiou]/i.test(categoryName || "verified") ? "an" : "a";
  const description =
    seo?.metaDescription ||
    (realSummary
      ? `${realSummary} `
      : `Explore ${business.name}, ${categoryArticle} ${categoryName || "verified"} business${citySuffix}. `) +
      `View services, products, location and contact details on ${SITE_NAME}.`;

  const seoComplete = isBusinessSeoComplete(business);
  const noIndex = seo?.noIndex || !seoComplete;

  return {
    title,
    description,
    alternates: { canonical: seo?.canonicalUrl ?? `${SITE_URL}${profilePath}` },
    robots:
      noIndex || seo?.noFollow
        ? { index: !noIndex, follow: !seo?.noFollow }
        : undefined,
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: `${SITE_URL}${profilePath}`,
      images: [seo?.ogImage ? getImageUrl(seo.ogImage) : getBusinessHeroImageUrl(business)],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: [seo?.ogImage ? getImageUrl(seo.ogImage) : getBusinessHeroImageUrl(business)],
    },
  };
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [business, settings] = await Promise.all([
    getBusinessByIdServer(id),
    fetchSiteSettings(),
  ]);
  if (!business) notFound();

  // Canonicalize legacy ID-based URLs to the SEO-friendly slug once one exists.
  if (business.slug && id !== business.slug) {
    permanentRedirect(getBusinessProfilePath(business));
  }

  const rating = business.averageRating ?? business.rating ?? 0;
  const image = getBusinessHeroImageUrl(business);
  const whatsapp = business.whatsapp || business.mobile || business.phone;
  const catalogItems = (business.services || business.catalog || []) as BusinessCatalogItem[];
  const profilePath = getBusinessProfilePath(business);
  const businessUrl = `${SITE_URL}${profilePath}`;
  const faqs = (business.faqs || [])
    .filter((faq) => faq.question?.trim() && faq.answer?.trim())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const enableFaqSchema = settings?.seo?.onPage?.schema?.enableFaqPage !== false;
  const faqJsonLd = enableFaqSchema ? buildFaqPageJsonLd(faqs) : null;
  const primaryCategory =
    business.primaryCategory && typeof business.primaryCategory === "object"
      ? business.primaryCategory
      : null;
  const categoryCrumbPath = primaryCategory
    ? business.city
      ? buildListingsCityCategoryPath(business.city, categoryToSlug(primaryCategory))
      : buildListingsCategoryPath(categoryToSlug(primaryCategory))
    : undefined;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Listings", url: `${SITE_URL}/listings` },
    ...(business.city
      ? [{ name: business.city, url: `${SITE_URL}${buildListingsCityPath(business.city)}` }]
      : []),
    ...(primaryCategory && categoryCrumbPath
      ? [{ name: primaryCategory.name, url: `${SITE_URL}${categoryCrumbPath}` }]
      : []),
    { name: business.name, url: businessUrl },
  ]);

  const keywords = [
    ...(business.productKeywords || []),
    ...(business.serviceKeywords || []),
  ].filter(Boolean);

  const hasOverview = !!(business.shortDescription || business.description || keywords.length);
  const tabs: ProfileTab[] = [
    ...(hasOverview ? [{ id: "overview", label: "Company Info" }] : []),
    ...(catalogItems.length > 0 ? [{ id: "products", label: "Products & Services" }] : []),
    { id: "reviews", label: "Reviews" },
    { id: "similar", label: "Similar Businesses" },
  ];

  return (
    <MainLayout>
      <BusinessPageAnalytics businessId={String(business._id)} city={business.city} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-neutral-200 pb-20 md:pb-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="border-b border-neutral-400 bg-white px-4 py-2.5 text-xs text-[#888] sm:px-6"
        >
          <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-1">
            <li><Link href="/" className="hover:text-[#ff6600]">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/listings" className="hover:text-[#ff6600]">Listings</Link></li>
            {business.city && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={buildListingsCityPath(business.city)} className="hover:text-[#ff6600]">
                    {business.city}
                  </Link>
                </li>
              </>
            )}
            {primaryCategory && categoryCrumbPath && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={categoryCrumbPath} className="hover:text-[#ff6600]">
                    {primaryCategory.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li className="font-medium text-[#444]">{business.name}</li>
          </ol>
        </nav>

        <BusinessProfileHero business={business} />

        <BusinessProfileTabs tabs={tabs} />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {hasOverview && (
                <div id="overview" className="space-y-6 scroll-mt-28">
                  {business.shortDescription &&
                    sectionCard(
                      "Overview",
                      <p className="leading-relaxed text-[#555]">{business.shortDescription}</p>
                    )}

                  {business.description &&
                    sectionCard(
                      "About the Business",
                      <p className="whitespace-pre-line leading-relaxed text-[#555]">
                        {business.description}
                      </p>
                    )}

                  {keywords.length > 0 &&
                    sectionCard(
                      "Business Categories & Keywords",
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[#d4d4d4] bg-[#f0f0f0] px-3 py-1 text-xs font-medium text-[#c2410c]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {catalogItems.length > 0 && (
                <div id="products" className="scroll-mt-28">
                  <BusinessCatalogSection business={business} items={catalogItems} />
                </div>
              )}

              <BusinessOffersBranches businessId={String(business._id)} />

              {faqs.length > 0 && (
                <BusinessFAQSection businessName={business.name} faqs={faqs} />
              )}

              <div id="reviews" className="scroll-mt-28">
                <BusinessReviews businessId={business._id} />
              </div>

              <div id="similar" className="scroll-mt-28">
                <SimilarBusinesses businessId={String(business._id)} city={business.city} />
              </div>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-[#ff6600]/20 bg-gradient-to-br from-[#f0f0f0] to-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-[#111]">Contact Information</h2>
                <p className="mt-1 text-sm text-[#666]">
                  Call, WhatsApp or send a quote request directly.
                </p>
                <div className="mt-4">
                  <BusinessContactLinks
                    businessId={String(business._id)}
                    phone={business.phone}
                    mobile={business.mobile}
                    whatsapp={whatsapp}
                    website={business.website}
                    email={business.email}
                    address={business.address}
                    latitude={business.latitude}
                    longitude={business.longitude}
                    city={business.city}
                  />
                </div>
              </div>

              {business.timing &&
                sectionCard(
                  "Business Hours",
                  <p className="flex items-start gap-2 text-sm leading-relaxed text-[#555]">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6600]" />
                    {typeof business.timing === "string"
                      ? business.timing
                      : (business.timing as { summary?: string }).summary ||
                        ((business.timing as { open24Hours?: boolean }).open24Hours
                          ? "Open 24 hours"
                          : "See contact for hours")}
                  </p>
                )}

              {business.address && (
                <div className="overflow-hidden rounded-2xl border border-neutral-400 bg-white shadow-sm">
                  <div className="border-b border-[#f5f5f5] bg-[#fafafa] px-5 py-3.5">
                    <h3 className="text-base font-bold text-[#111]">Location</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-[#555]">
                      {[business.address, business.area, business.city, business.state, business.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {business.latitude && business.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${business.latitude},${business.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-[#ff6600] hover:underline"
                      >
                        Open in Google Maps →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {business.images && business.images.length > 1 && (
                <div className="overflow-hidden rounded-2xl border border-neutral-400 bg-white shadow-sm">
                  <div className="border-b border-[#f5f5f5] bg-[#fafafa] px-5 py-3.5">
                    <h3 className="text-base font-bold text-[#111]">Gallery</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {business.images.slice(0, 6).map((img, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-[#f5f5f5]">
                        <Image
                          src={getImageUrl(img)}
                          alt={(typeof img === "object" && img?.alt) || `${business.name} photo ${i + 1}`}
                          fill
                          className="object-cover transition hover:scale-105"
                          sizes="180px"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      <StickyBusinessContact business={business} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": businessUrl,
            name: business.name,
            description: business.shortDescription || business.description?.slice(0, 300),
            url: businessUrl,
            image,
            address: {
              "@type": "PostalAddress",
              addressLocality: business.city,
              addressRegion: business.state,
              postalCode: business.pincode,
              streetAddress: business.address,
              addressCountry: "IN",
            },
            telephone: business.phone || business.mobile,
            ...(business.website ? { sameAs: [business.website] } : {}),
            ...(business.latitude && business.longitude
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: business.latitude,
                    longitude: business.longitude,
                  },
                }
              : {}),
            openingHoursSpecification: buildOpeningHoursJsonLd(business),
            aggregateRating: rating
              ? {
                  "@type": "AggregateRating",
                  ratingValue: rating,
                  reviewCount: business.reviewCount || 0,
                }
              : undefined,
          }),
        }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
    </MainLayout>
  );
}
