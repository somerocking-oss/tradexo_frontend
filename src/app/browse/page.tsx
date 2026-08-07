import { MainLayout } from "@/components/layout/MainLayout";
import { BrowseIndexClient } from "@/app/browse/BrowseIndexClient";
import { BrowseHeroStats } from "@/app/browse/BrowseHeroStats";
import { fetchSeoLandingPages } from "@/lib/api/seo-landing";
import { fetchPlatformStats } from "@/lib/platform-stats";
import { SITE_NAME } from "@/lib/constants";
import { SEO_LANDING_CITIES } from "@/lib/seo-cities";

export const revalidate = 3600;

export const metadata = {
  title: `Browse by City & Category | ${SITE_NAME}`,
  description: "Explore local businesses and B2B suppliers by city and category across India.",
};

export default async function BrowseIndexPage() {
  const [{ pagination }, platformStats] = await Promise.all([
    fetchSeoLandingPages({ limit: 1 }),
    fetchPlatformStats(),
  ]);

  const landingCount = pagination.total;
  const cityCount = platformStats?.cityCount || SEO_LANDING_CITIES.length;

  return (
    <MainLayout>
      <div className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-[#f0f0f0] via-white to-[#f8fafc]">
        <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-[#ff6c00]/5 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#FF6C00]">
                B2B Marketplace Directory
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Browse by City &amp; Category
              </h1>
              <p className="mt-3 max-w-lg text-base text-neutral-600">
                {landingCount > 0 ? (
                  <>
                    <strong className="font-semibold text-neutral-900">
                      {landingCount.toLocaleString("en-IN")}+ landing pages
                    </strong>{" "}
                    across{" "}
                    <strong className="font-semibold text-neutral-900">
                      {cityCount.toLocaleString("en-IN")} Indian cities
                    </strong>{" "}
                    — manufacturers, services, hotels, doctors, and more.
                  </>
                ) : (
                  <>
                    Explore businesses across{" "}
                    <strong className="font-semibold text-neutral-900">
                      {cityCount.toLocaleString("en-IN")} Indian cities
                    </strong>{" "}
                    — manufacturers, services, and more.
                  </>
                )}
              </p>
            </div>

            <BrowseHeroStats landingCount={landingCount} cityCount={cityCount} />
          </div>
        </div>
      </div>

      <div className="bg-[#F4F6F8]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <BrowseIndexClient />
        </div>
      </div>
    </MainLayout>
  );
}
