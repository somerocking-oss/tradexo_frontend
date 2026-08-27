import { fetchSitemapBusinessChunk, fetchSitemapCorePages } from "@/lib/cms";
import {
  STATIC_SITEMAP_ROUTES,
  mapPathToSitemapUrl,
  getStateSitemapEntries,
  getCityCategorySitemapEntries,
  getCityCategorySubCategorySitemapEntries,
  getCategorySitemapEntries,
  getProductSitemapEntries,
  getFlatCategoryCitySitemapEntries,
  getFlatSubCategoryCitySitemapEntries,
} from "@/lib/sitemap-entries";
import { buildUrlSet, SITEMAP_XML_HEADERS } from "@/lib/sitemap-xml";

export const revalidate = 3600;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const chunkId = Number(id);

  if (!Number.isFinite(chunkId) || chunkId < 0) {
    return new Response("Invalid sitemap id", { status: 400 });
  }

  if (chunkId === 0) {
    const [
      cmsPages,
      stateEntries,
      cityCategoryEntries,
      cityCategorySubCategoryEntries,
      categoryEntries,
      productEntries,
      flatCategoryCityEntries,
      flatSubCategoryCityEntries,
    ] = await Promise.all([
      fetchSitemapCorePages(),
      getStateSitemapEntries(),
      getCityCategorySitemapEntries(),
      getCityCategorySubCategorySitemapEntries(),
      getCategorySitemapEntries(),
      getProductSitemapEntries(),
      getFlatCategoryCitySitemapEntries(),
      getFlatSubCategoryCitySitemapEntries(),
    ]);
    const urls = [
      ...STATIC_SITEMAP_ROUTES,
      ...stateEntries,
      ...cityCategoryEntries,
      ...cityCategorySubCategoryEntries,
      ...categoryEntries,
      ...productEntries,
      ...flatCategoryCityEntries,
      ...flatSubCategoryCityEntries,
      ...cmsPages.map(mapPathToSitemapUrl),
    ];
    return new Response(buildUrlSet(urls), { headers: SITEMAP_XML_HEADERS });
  }

  const businessPages = await fetchSitemapBusinessChunk(chunkId);
  return new Response(buildUrlSet(businessPages.map(mapPathToSitemapUrl)), {
    headers: SITEMAP_XML_HEADERS,
  });
}
