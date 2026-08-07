import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { buildStaticPageMetadata } from "@/components/cms/staticCmsPage";
import { fetchCmsPage, fetchSiteSettings } from "@/lib/cms";
import { SupportHero } from "./SupportHero";
import { SupportContent } from "./SupportContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("support", {
    title: "Help Center & Support",
    description: "Get help with Tradexo listings, leads, RFQs, payments, and account issues.",
  });
}

export default async function SupportPage() {
  const [page, settings] = await Promise.all([fetchCmsPage("support"), fetchSiteSettings()]);

  return (
    <MainLayout>
      <SupportHero title={page?.title || "Help Center"} />
      <SupportContent page={page} settings={settings} />
    </MainLayout>
  );
}
