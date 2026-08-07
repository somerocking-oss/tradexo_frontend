import type { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { getStatesServer } from "@/lib/api/business-server";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Browse Verified Suppliers by State | ${SITE_NAME}`;
  const description =
    "Find verified suppliers, manufacturers and service providers across every state in India.";
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/directory` },
  };
}

export default async function DirectoryPage() {
  const states = await getStatesServer();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Browse by State", url: `${SITE_URL}/directory` },
  ]);

  return (
    <MainLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Browse Suppliers by State
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-base">
          Find verified suppliers, manufacturers and service providers across India, organized by state.
        </p>

        {states.length === 0 ? (
          <p className="mt-10 text-sm text-neutral-500">No states available yet.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {states.map((s) => (
              <Link
                key={s.slug}
                href={`/directory/${s.slug}`}
                className="group flex flex-col rounded-xl border border-neutral-300 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#FF6C00]/40 hover:shadow-md"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900 group-hover:text-[#FF6C00]">
                  <svg className="h-4 w-4 shrink-0 text-[#FF6C00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {s.state}
                </span>
                <span className="mt-1 text-xs text-neutral-500">
                  {s.count.toLocaleString("en-IN")} suppliers · {s.cityCount} cities
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
