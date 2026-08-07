import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { buildCmsMetadata, fetchCmsPage, fetchSiteSettings } from "@/lib/cms";
import { SITE_NAME } from "@/lib/constants";
import { AboutHero } from "./AboutHero";
import { AboutContent } from "./AboutContent";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage("about-us");
  return buildCmsMetadata(page, {
    title: `About ${SITE_NAME}`,
    description: `Learn about ${SITE_NAME} — India's B2B and local business discovery platform.`,
  });
}

export default async function AboutUsPage() {
  const [page, settings] = await Promise.all([
    fetchCmsPage("about-us"),
    fetchSiteSettings(),
  ]);

  const siteName = settings?.siteName || SITE_NAME;

  return (
    <MainLayout>
      <AboutHero title={page?.title || `About ${siteName}`} siteName={siteName} />
      <AboutContent page={page} settings={settings} />
    </MainLayout>
  );
}
