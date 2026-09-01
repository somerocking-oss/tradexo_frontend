import type { Metadata } from "next";
import { resolveSiteName, resolveSiteLogo } from "@/lib/brand";
import { MainLayout } from "@/components/layout/MainLayout";
import { HomeHero, HomeHeroStatsBar } from "@/components/home/HomeHero";
import { HomeExploreCategories } from "@/components/home/HomeExploreCategories";
import { HomeTrendingLinks } from "@/components/home/HomePopularTags";
import { HomeListingsCarousel } from "@/components/home/HomeListingsCarousel";
import { HomeListBusinessPromo } from "@/components/home/HomeListBusinessPromo";
import { BuyerSellerHub } from "@/components/home/BuyerSellerHub";
import { HomeWorksAndServices } from "@/components/home/HomeWorksAndServices";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HomeSuccessAndCta } from "@/components/home/HomeSuccessAndCta";
import { HomeTrustedBrands } from "@/components/home/HomeTrustedBrands";
import { Button } from "@/components/ui/button";
import { fetchSiteSettings } from "@/lib/cms";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { buildOrganizationJsonLd, buildWebSiteJsonLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import {
  getFeaturedBusinessesServer,
  getLatestBusinessesServer,
  getTrendingSearchesServer,
  getCategorySampleBusinessesServer,
} from "@/lib/api/business-server";
import { getTopCategoriesCount, getTopCategoriesForHome } from "@/lib/api/category-server";
import {
  buildTrustStats,
  fetchPlatformStats,
  formatStatCount,
} from "@/lib/platform-stats";
import { HomeQuickActions } from "@/components/home/HomeQuickActions";
import { HomeTrustFeatures } from "@/components/home/HomeTrustFeatures";
import { HomePostRequirementBanner } from "@/components/home/HomePostRequirementBanner";
import { DynamicTopRatedCarousel, DynamicNewsletterBar } from "@/components/home/HomeDynamicSections";
import { HomeTopCities } from "@/components/home/HomeTopCities";
import { HomeRequirementsSuppliers } from "@/components/home/HomeRequirementsSuppliers";
import { getLatestRequirementsServer } from "@/lib/api/lead-server";
import { HomeTrendingProducts } from "@/components/home/HomeTrendingProducts";
import { HomeIndustrySections } from "@/components/home/HomeIndustrySections";
import { getTrendingProductsServer } from "@/lib/api/products-server";
import { HomeIndustrySolutions } from "@/components/home/HomeIndustrySolutions";
import { fetchAllCategoriesAllPages } from "@/lib/api/category-server";
import { Reveal } from "@/components/ui/Reveal";

import type { Category } from "@/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const seo = settings?.seo;
  const title = seo?.metaTitle || `${SITE_NAME} — Premium B2B Business Platform`;
  const description =
    seo?.metaDescription ||
    settings?.siteDescription ||
    "India's high-class B2B platform to discover verified suppliers, send RFQs, compare quotes, and grow your business.";

  return {
    title,
    description,
    keywords: seo?.keywords,
    openGraph: {
      title,
      description,
      url: seo?.canonicalUrl || SITE_URL,
      images: seo?.ogImage ? [seo.ogImage] : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: seo?.twitterHandle,
      images: seo?.ogImage ? [seo.ogImage] : [DEFAULT_OG_IMAGE],
    },
    alternates: { canonical: seo?.canonicalUrl || SITE_URL },
    robots:
      seo?.robotsIndex === false
        ? { index: false, follow: seo?.robotsFollow !== false }
        : { index: true, follow: seo?.robotsFollow !== false },
  };
}

async function getHomeCategories(): Promise<Category[]> {
  return getTopCategoriesForHome(12);
}

export default async function HomePage() {
  const [categories, categoryTotal, settings, latestBusinesses, featuredBusinesses, trendingTerms, platformStats, latestRequirements, trendingProducts, allCategories, industrySections] =
    await Promise.all([
      getHomeCategories(),
      getTopCategoriesCount(),
      fetchSiteSettings(),
      getLatestBusinessesServer(12),
      getFeaturedBusinessesServer(12),
      getTrendingSearchesServer(8),
      fetchPlatformStats(),
      getLatestRequirementsServer(8),
      getTrendingProductsServer(8),
      fetchAllCategoriesAllPages(),
      getCategorySampleBusinessesServer(6, 16),
    ]);

  const homepage = settings?.homepage;
  const siteName = resolveSiteName(settings?.siteName);
  const schema = settings?.seo?.onPage?.schema;
  const trustStats = buildTrustStats(homepage?.trustStats, platformStats);
  const popularSearches = homepage?.popularSearches?.length
    ? homepage.popularSearches
    : trendingTerms;
  const useApiTrending = homepage?.trendingSection?.useApi !== false;
  const trendingDisplayTerms = useApiTrending
    ? trendingTerms.length
      ? trendingTerms
      : homepage?.trendingSection?.terms || []
    : homepage?.trendingSection?.terms || [];
  const categoriesSection = homepage?.categoriesSection;
  const verifiedCountLabel =
    platformStats && platformStats.verifiedCount > 0
      ? `${formatStatCount(platformStats.verifiedCount)} Verified Businesses`
      : platformStats && platformStats.businessCount > 0
        ? `${formatStatCount(platformStats.businessCount)} Businesses Listed`
        : null;
  const businessCountLabel =
    platformStats && platformStats.businessCount > 0
      ? formatStatCount(platformStats.businessCount)
      : null;
  const websiteJsonLd = buildWebSiteJsonLd(siteName);
  const logoPath = resolveSiteLogo(settings?.siteLogo);
  const organizationJsonLd = buildOrganizationJsonLd(siteName, settings?.siteUrl, {
    logo: logoPath ? (logoPath.startsWith("http") ? logoPath : `${SITE_URL}${logoPath}`) : undefined,
    contactEmail: settings?.contactEmail,
    contactPhone: settings?.contactPhone,
    sameAs: (settings?.footer?.socialLinks || [])
      .map((s) => s.href)
      .filter((href): href is string => !!href?.trim()),
  });

  return (
    <MainLayout>
      {schema?.enableWebSite !== false && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      )}
      {schema?.enableOrganization !== false && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      )}

      <HomeHero
        badgeText={homepage?.badgeText}
        subtitle={homepage?.heroSubtitle}
        categories={categories}
        popularSearches={popularSearches}
        verifiedCountLabel={verifiedCountLabel}
        buyLabel={homepage?.heroBuyLabel}
        sellLabel={homepage?.heroSellLabel}
        sellPitchTitle={homepage?.heroSellPitchTitle}
        sellPitchSubtitle={homepage?.heroSellPitchSubtitle}
        sellCtaLabel={homepage?.heroSellCtaLabel}
        sellCtaHref={homepage?.heroSellCtaHref}
        sellBadgeText={homepage?.heroSellBadgeText}
      />

      <HomeQuickActions />

      <HomeHeroStatsBar stats={trustStats} />

      <Reveal variant="fade">
        <HomeExploreCategories
          categories={categories}
          viewAllHref={categoriesSection?.buttonHref || "/categories"}
          totalCategoryCount={categoryTotal || platformStats?.categoryCount || categories.length}
          title={categoriesSection?.title || "Top Categories"}
          subtitle={categoriesSection?.subtitle}
        />
      </Reveal>

      {trendingDisplayTerms.length > 0 ? (
        <section className="border-b border-neutral-300 bg-white py-3">
          <HomeTrendingLinks terms={trendingDisplayTerms} />
        </section>
      ) : null}

      <Reveal variant="fade">
        <HomeTrendingProducts products={trendingProducts} />
      </Reveal>

      {/* Not wrapped in <Reveal> — this section stacks many category rows and
          can be taller than any viewport, so a scroll-triggered reveal keyed
          to 15% of its *total* area may never cross threshold, leaving real
          content stuck invisible at opacity-0 while still taking up space. */}
      <HomeIndustrySections sections={industrySections} />

      <Reveal variant="fade">
        <HomeRequirementsSuppliers requirements={latestRequirements} suppliers={featuredBusinesses} />
      </Reveal>

      <Reveal variant="fade">
        <HomeTrustFeatures />
      </Reveal>

      <Reveal variant="fade">
        <HomeTopCities cities={platformStats?.topCities} />
      </Reveal>

      <Reveal variant="fade">
        <HomeListingsCarousel latest={latestBusinesses} featured={featuredBusinesses} />
      </Reveal>

      <Reveal variant="fade">
        <DynamicTopRatedCarousel businesses={featuredBusinesses} />
      </Reveal>

      <Reveal variant="fade">
        <HomeListBusinessPromo stats={trustStats} businessCountLabel={businessCountLabel} />
      </Reveal>

      <Reveal variant="fade">
        <HomeIndustrySolutions categories={allCategories} />
      </Reveal>

      <Reveal variant="fade">
        <HomePostRequirementBanner />
      </Reveal>

      <Reveal variant="fade">
        <BuyerSellerHub section={homepage?.buyerSellerHubSection} />
      </Reveal>

      <Reveal variant="fade">
        <HomeWorksAndServices section={homepage?.howItWorksSection} />
      </Reveal>

      <Reveal variant="fade">
        <HowItWorks section={homepage?.howItWorksSection} />
      </Reveal>

      <Reveal variant="fade">
        <HomeSuccessAndCta section={homepage?.testimonialsSection} businessCountLabel={businessCountLabel} />
      </Reveal>

      <DynamicNewsletterBar />

      <Reveal variant="fade">
        <HomeTrustedBrands businesses={featuredBusinesses} />
      </Reveal>

      {/* Final CTA — split layout with benefit cards */}
      <Reveal variant="fade">
      <section
        className="relative overflow-hidden px-3 py-8 sm:px-4 sm:py-10"
        aria-labelledby="cta-band-heading"
        style={{
          background: "linear-gradient(135deg, #FF6C00 0%, #E85800 45%, #C94400 100%)",
        }}
      >
        {/* Subtle mesh */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
          aria-hidden
        />
        {/* Top-right ambient */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-[0.18]"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 65%)" }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-8xl">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">

            {/* ── Left: headline + CTAs ── */}
            <div>
              <div className="mb-3 flex items-center gap-2.5">
                <div className="h-px w-6 bg-white/50" aria-hidden />
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/75">
                  Start for Free · No Credit Card
                </span>
              </div>

              <h2
                id="cta-band-heading"
                className="text-2xl font-bold tracking-tight text-white sm:text-[1.85rem] sm:leading-tight"
              >
                {homepage?.ctaTitle || `Grow Your Business with ${siteName}`}
              </h2>
              <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-white/78">
                {homepage?.ctaSubtitle ||
                  "Get discovered by buyers nationwide — RFQ inbox, verified profile, premium visibility plans."}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  href="/register-business"
                  size="lg"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#C44A00] shadow-xl shadow-black/15 transition-all duration-200 ease-out hover:bg-[#F5F5F5] hover:shadow-black/25 active:scale-[0.98]"
                >
                  List Your Business Free
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </Button>
                <Button
                  href="/plans"
                  size="lg"
                  variant="outline"
                  className="inline-flex items-center rounded-xl border-2 border-white/45 bg-transparent px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 ease-out hover:border-white/75 hover:bg-white/12 hover:text-white"
                >
                  View Plans
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
                {["Free to list", "Live in minutes", "Pan India coverage"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-white/65">
                    <svg className="h-3 w-3 shrink-0 text-white/80" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/>
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: glassmorphism benefit cards ── */}
            <div className="space-y-2.5">
              {[
                {
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                  ),
                  title: "Free Business Listing",
                  desc: "Create your verified profile and go live in minutes",
                },
                {
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  ),
                  title: "Verified Buyer Leads",
                  desc: "Receive direct enquiries from serious buyers across India",
                },
                {
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
                      <polyline points="16,7 22,7 22,13"/>
                    </svg>
                  ),
                  title: "Premium Visibility",
                  desc: "Top placement in search results with our premium plans",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 backdrop-blur-sm transition-colors duration-200 hover:bg-white/15"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/65">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
      </Reveal>

    </MainLayout>
  );
}
