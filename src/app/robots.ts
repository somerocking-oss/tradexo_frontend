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
      disallow: [
        ...new Set([
          "/dashboard",
          "/profile",
          "/login",
          "/api",
          ...(seo?.disallowPaths || []),
        ]),
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
