import type { Metadata } from "next";
import { buildCmsMetadata, fetchCmsPage } from "@/lib/cms";
import { CmsPageView } from "@/components/cms/CmsPageView";

export async function buildStaticPageMetadata(
  slug: string,
  fallback: { title: string; description?: string }
): Promise<Metadata> {
  const page = await fetchCmsPage(slug);
  return buildCmsMetadata(page, fallback);
}

interface StaticCmsPageProps {
  slug: string;
  fallbackTitle: string;
  fallbackDescription?: string;
}

export function createStaticCmsPage({
  slug,
  fallbackTitle,
  fallbackDescription,
}: StaticCmsPageProps) {
  async function generateMetadata(): Promise<Metadata> {
    return buildStaticPageMetadata(slug, {
      title: fallbackTitle,
      description: fallbackDescription,
    });
  }

  function Page() {
    return <CmsPageView slug={slug} />;
  }

  return { generateMetadata, Page };
}
