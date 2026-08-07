import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getListingsRootMetadata, ListingsRootPageContent } from "../../renderListingsRootPage";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ pageNum: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePageNum(pageNum: string) {
  if (!/^\d+$/.test(pageNum)) return null;
  return Number(pageNum);
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { pageNum } = await params;
  const sp = await searchParams;
  const page = parsePageNum(pageNum) || 1;
  return getListingsRootMetadata({ ...sp, page: String(page) });
}

export default async function ListingsRootPaginatedPage({ params, searchParams }: PageProps) {
  const { pageNum } = await params;
  const sp = await searchParams;
  const page = parsePageNum(pageNum);

  if (page === null || page < 1) {
    notFound();
  }
  if (page === 1) {
    redirect("/listings");
  }

  return <ListingsRootPageContent params={sp} page={page} />;
}
