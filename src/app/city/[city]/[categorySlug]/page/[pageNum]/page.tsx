import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { parseListingsCityParam } from "@/lib/listings-url";
import {
  getListingsCityCategoryMetadata,
  ListingsCityCategoryPageContent,
} from "../../renderListingsCityCategoryPage";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ city: string; categorySlug: string; pageNum: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePageNum(pageNum: string) {
  if (!/^\d+$/.test(pageNum)) return null;
  return Number(pageNum);
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { city: citySlug, categorySlug, pageNum } = await params;
  const sp = await searchParams;
  const city = parseListingsCityParam(citySlug);
  const page = parsePageNum(pageNum) || 1;
  return getListingsCityCategoryMetadata({ ...sp, page: String(page) }, city, categorySlug);
}

export default async function ListingsCityCategoryPaginatedPage({ params, searchParams }: PageProps) {
  const { city: citySlug, categorySlug, pageNum } = await params;
  const sp = await searchParams;
  const city = parseListingsCityParam(citySlug);
  const page = parsePageNum(pageNum);

  if (page === null || page < 1) {
    notFound();
  }
  if (page === 1) {
    redirect(`/city/${citySlug}/${categorySlug}`);
  }

  return (
    <ListingsCityCategoryPageContent sp={sp} city={city} categorySlug={categorySlug} page={page} />
  );
}
