import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { buildCmsMetadata, fetchCmsPage, fetchSiteSettings } from "@/lib/cms";
import { AdvertiseHero } from "./AdvertiseHero";
import { AdvertiseContent } from "./AdvertiseContent";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage("advertise");
  return buildCmsMetadata(page, {
    title: "Advertise on Tradexo",
    description: "Promote your business with featured listings, banners, and city-level sponsorships.",
  });
}

export default async function AdvertisePage() {
  const [page, settings] = await Promise.all([
    fetchCmsPage("advertise"),
    fetchSiteSettings(),
  ]);

  return (
    <MainLayout>
      <AdvertiseHero title={page?.title || "Advertise on Tradexo"} />
      <AdvertiseContent page={page} settings={settings} />
    </MainLayout>
  );
}
