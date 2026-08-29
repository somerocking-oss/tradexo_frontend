import type { Metadata } from "next";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductsPageClient } from "./ProductsPageClient";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Products & Services Marketplace | ${SITE_NAME}`,
  description: "Browse products and services from verified manufacturers, wholesalers, distributors and service providers. Get quotes directly.",
  alternates: { canonical: `${SITE_URL}/products` },
  openGraph: {
    title: `Products & Services Marketplace | ${SITE_NAME}`,
    description: "Browse products and services from verified manufacturers, wholesalers, distributors and service providers.",
  },
};

export default function ProductsPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="py-20 text-center text-neutral-500">Loading products…</div>}>
        <ProductsPageClient />
      </Suspense>
    </MainLayout>
  );
}
