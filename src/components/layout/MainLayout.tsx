import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { Navbar } from "@/components/layout/Navbar";
import { fetchSiteSettings } from "@/lib/cms";
import { resolveSiteLogo, resolveSiteName } from "@/lib/brand";
import { SITE_NAME } from "@/lib/constants";
import { buildFooterStats, fetchPlatformStats } from "@/lib/platform-stats";
import { getTopCategoriesForHome } from "@/lib/api/category-server";

export async function MainLayout({ children }: { children: React.ReactNode }) {
  const [settings, platformStats, topCategories] = await Promise.all([
    fetchSiteSettings(),
    fetchPlatformStats(),
    getTopCategoriesForHome(16),
  ]);
  const siteName = resolveSiteName(settings?.siteName || SITE_NAME);
  const siteLogo = resolveSiteLogo(settings?.siteLogo);
  const footerStats = buildFooterStats(settings?.footer?.stats, platformStats);

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6F8]">
      <SiteAnalytics settings={settings} />
      <PageViewTracker />
      <Navbar
        navigation={settings?.navigation}
        siteName={siteName}
        siteLogo={siteLogo}
        topCategories={topCategories}
      />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer
        footer={settings?.footer}
        siteName={siteName}
        siteLogo={siteLogo}
        stats={footerStats}
        topCategories={topCategories}
        topCities={platformStats?.topCities}
      />
      <MobileBottomBar items={settings?.navigation?.mobileBottomBar} />
    </div>
  );
}
