import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { getStatesServer, getCitiesByStateServer } from "@/lib/api/business-server";
import { buildListingsCityPath } from "@/lib/listings-url";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ state: string }>;
};

async function resolveState(slug: string) {
  const states = await getStatesServer();
  return states.find((s) => s.slug === slug.toLowerCase()) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = await resolveState(stateSlug);
  if (!state) return { title: "State Not Found" };

  const title = `Suppliers & Manufacturers in ${state.state} | ${SITE_NAME}`;
  const description = `Find ${state.count.toLocaleString("en-IN")}+ verified suppliers, manufacturers and service providers across ${state.cityCount} cities in ${state.state}.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/directory/${state.slug}` },
  };
}

export default async function StateDirectoryPage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const state = await resolveState(stateSlug);

  if (!state) {
    notFound();
  }

  const cities = await getCitiesByStateServer(state.state);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Browse by State", url: `${SITE_URL}/directory` },
    { name: state.state, url: `${SITE_URL}/directory/${state.slug}` },
  ]);

  return (
    <MainLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-neutral-400">
          <Link href="/directory" className="hover:text-[#FF6C00]">Browse by State</Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-600">{state.state}</span>
        </nav>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Suppliers & Manufacturers in {state.state}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-base">
          {state.count.toLocaleString("en-IN")}+ verified suppliers across {state.cityCount} cities in {state.state}.
        </p>

        {cities.length === 0 ? (
          <p className="mt-10 text-sm text-neutral-500">No cities available yet.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={buildListingsCityPath(c.city)}
                className="group flex flex-col rounded-xl border border-neutral-300 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#FF6C00]/40 hover:shadow-md"
              >
                <span className="text-sm font-semibold text-neutral-900 group-hover:text-[#FF6C00]">
                  {c.city}
                </span>
                <span className="mt-1 text-xs text-neutral-500">
                  {c.count.toLocaleString("en-IN")} suppliers
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
