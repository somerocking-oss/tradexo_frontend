import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getListingsCategorySubMetadata,
  ListingsCategorySubPageContent,
} from "../../renderListingsCategorySubPage";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string; subSlug: string; pageNum: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePageNum(pageNum: string) {
  if (!/^\d+$/.test(pageNum)) return null;
  return Number(pageNum);
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug, subSlug, pageNum } = await params;
  const sp = await searchParams;
  const page = parsePageNum(pageNum) || 1;
  return getListingsCategorySubMetadata({ ...sp, page: String(page) }, slug, subSlug);
}

export default async function ListingsCategorySubPaginatedPage({ params, searchParams }: PageProps) {
  const { slug, subSlug, pageNum } = await params;
  const sp = await searchParams;
  const page = parsePageNum(pageNum);

  if (page === null || page < 1) {
    notFound();
  }
  if (page === 1) {
    redirect(`/category/${slug}/${subSlug}`);
  }

  return <ListingsCategorySubPageContent sp={sp} slug={slug} subSlug={subSlug} page={page} />;
}
