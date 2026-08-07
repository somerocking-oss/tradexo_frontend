import { fetchSitemapCorePages, fetchSitemapStats } from "@/lib/cms";
import {
  STATIC_SITEMAP_ROUTES,
  mapPathToSitemapUrl,
  getStateSitemapEntries,
  getCityCategorySitemapEntries,
  getCityCategorySubCategorySitemapEntries,
  getCategorySitemapEntries,
  getProductSitemapEntries,
} from "@/lib/sitemap-entries";
import { buildSitemapIndex, buildUrlSet, SITEMAP_XML_HEADERS } from "@/lib/sitemap-xml";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export async function GET() {
  const stats = await fetchSitemapStats();
  const now = new Date().toISOString();
  const childSitemaps = [{ loc: `${SITE_URL}/sitemap/0`, lastmod: now }];

  for (let chunk = 1; chunk <= stats.businessChunks; chunk += 1) {
    childSitemaps.push({
      loc: `${SITE_URL}/sitemap/${chunk}`,
      lastmod: now,
    });
  }

  if (childSitemaps.length > 1) {
    return new Response(buildSitemapIndex(childSitemaps), {
      headers: SITEMAP_XML_HEADERS,
    });
  }

  const [cmsPages, stateEntries, cityCategoryEntries, cityCategorySubCategoryEntries, categoryEntries, productEntries] = await Promise.all([
    fetchSitemapCorePages(),
    getStateSitemapEntries(),
    getCityCategorySitemapEntries(),
    getCityCategorySubCategorySitemapEntries(),
    getCategorySitemapEntries(),
    getProductSitemapEntries(),
  ]);
  const urls = [
    ...STATIC_SITEMAP_ROUTES,
    ...stateEntries,
    ...cityCategoryEntries,
    ...cityCategorySubCategoryEntries,
    ...categoryEntries,
    ...productEntries,
    ...cmsPages.map(mapPathToSitemapUrl),
  ];
  return new Response(buildUrlSet(urls), { headers: SITEMAP_XML_HEADERS });
}
