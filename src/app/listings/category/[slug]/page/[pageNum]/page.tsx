import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getListingsCategoryMetadata, ListingsCategoryPageContent } from "../../renderListingsCategoryPage";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string; pageNum: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePageNum(pageNum: string) {
  if (!/^\d+$/.test(pageNum)) return null;
  return Number(pageNum);
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug, pageNum } = await params;
  const sp = await searchParams;
  const page = parsePageNum(pageNum) || 1;
  return getListingsCategoryMetadata({ ...sp, page: String(page) }, slug);
}

export default async function ListingsCategoryPaginatedPage({ params, searchParams }: PageProps) {
  const { slug, pageNum } = await params;
  const sp = await searchParams;
  const page = parsePageNum(pageNum);

  if (page === null || page < 1) {
    notFound();
  }
  if (page === 1) {
    redirect(`/listings/category/${slug}`);
  }

  return <ListingsCategoryPageContent sp={sp} slug={slug} page={page} />;
}
