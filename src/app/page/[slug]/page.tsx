import type { Metadata } from "next";
import { buildCmsMetadata, fetchCmsPage } from "@/lib/cms";
import { CmsPageView } from "@/components/cms/CmsPageView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchCmsPage(slug);
  return buildCmsMetadata(page, {
    title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    description: "Tradexo information page",
  });
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CmsPageView slug={slug} />;
}
