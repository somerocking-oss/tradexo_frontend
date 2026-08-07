import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { PlansPageClient } from "./PlansPageClient";
import { PlansHero } from "./PlansHero";
import { plansHeroFromSettings } from "./plans-utils";
import { fetchSiteSettings } from "@/lib/cms";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const plans = settings?.seo?.onPage?.plans;
  const title = plans?.metaTitle || "Premium Plans";
  const description =
    plans?.metaDescription ||
    "Choose a Tradexo plan to boost visibility, get more leads, and grow your business.";
  const ogImage = settings?.seo?.ogImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/plans` },
    openGraph: {
      title: `${title} | ${settings?.siteName || SITE_NAME}`,
      description,
      url: `${SITE_URL}/plans`,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PlansPage() {
  const settings = await fetchSiteSettings();
  const hero = plansHeroFromSettings(settings?.pricing);
  const stats = settings?.footer?.stats?.length
    ? settings.footer.stats.slice(0, 3)
    : undefined;

  return (
    <MainLayout>
      <PlansHero title={hero.title} subtitle={hero.subtitle} stats={stats} />
      <PlansPageClient initialTitle={hero.title} initialSubtitle={hero.subtitle} />
    </MainLayout>
  );
}
