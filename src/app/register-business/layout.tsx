import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { fetchSiteSettings } from "@/lib/cms";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const register = settings?.seo?.onPage?.registerBusiness;
  const title = register?.metaTitle || "Register Your Business on Tradexo";
  const description =
    register?.metaDescription ||
    "List your business for free on Tradexo. Reach buyers, get leads, and grow your B2B or local business across India.";
  const ogImage = settings?.seo?.ogImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/register-business` },
    openGraph: {
      title: `${title} | ${settings?.siteName || SITE_NAME}`,
      description,
      url: `${SITE_URL}/register-business`,
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

export default function RegisterBusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
