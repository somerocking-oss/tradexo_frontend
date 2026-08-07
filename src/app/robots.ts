import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { fetchSiteSettings } from "@/lib/cms";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await fetchSiteSettings();
  const seo = settings?.seo;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: seo?.disallowPaths?.length
        ? [...new Set([...seo.disallowPaths, "/login"])]
        : ["/dashboard", "/profile", "/login"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
