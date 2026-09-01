import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { buildListingsUrl, categoryToSlug } from "@/lib/listings-url";
import { fetchAllCategoriesAllPages } from "@/lib/api/category-server";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { resolveIcon } from "@/lib/categoryIcons";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `All Categories | ${SITE_NAME}`,
  description:
    "Browse all business categories — from Agriculture & Farming to Electronics, Textiles, Construction and more. Find verified suppliers, manufacturers, and service providers across India.",
  alternates: { canonical: `${SITE_URL}/categories` },
};

export default async function CategoriesPage() {
  const categories = await fetchAllCategoriesAllPages();

  const alphabetGroups: Record<string, typeof categories> = {};
  for (const cat of categories) {
    const letter = cat.name.charAt(0).toUpperCase();
    if (!alphabetGroups[letter]) alphabetGroups[letter] = [];
    alphabetGroups[letter].push(cat);
  }
  const letters = Object.keys(alphabetGroups).sort();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "All Categories", url: `${SITE_URL}/categories` },
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All Business Categories",
    url: `${SITE_URL}/categories`,
    numberOfItems: categories.length,
    itemListElement: categories.slice(0, 200).map((cat, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cat.name,
      url: `${SITE_URL}${buildListingsUrl({ categorySlug: categoryToSlug(cat) })}`,
    })),
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {/* Hero */}
      <div className="border-b border-neutral-200 bg-gradient-to-b from-neutral-100 to-white">
        <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#FF6C00]">
            Business Directory
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            All Categories
          </h1>
          <p className="mt-3 max-w-2xl text-base text-neutral-600">
            Browse{" "}
            <strong className="font-semibold text-neutral-900">
              {categories.length}+ categories
            </strong>{" "}
            and find verified suppliers, manufacturers, wholesalers, and service providers across India.
          </p>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
            <Link href="/" className="hover:text-[#FF6C00]">Home</Link>
            <span>/</span>
            <span className="text-neutral-800 font-medium">All Categories</span>
          </nav>
        </div>
      </div>

      {/* Category grid */}
      <div className="bg-neutral-50 py-10 sm:py-14">
        <div className="mx-auto max-w-8xl px-3 sm:px-4">
          {categories.length === 0 ? (
            <p className="py-20 text-center text-neutral-500">No categories found.</p>
          ) : (
            <div className="space-y-12">
              {letters.map((letter) => (
                <section key={letter} id={`letter-${letter}`}>
                  <h2 className="mb-4 text-lg font-bold text-neutral-400 tracking-widest border-b border-neutral-200 pb-2">
                    {letter}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
                    {alphabetGroups[letter].map((cat) => {
                      const slug = categoryToSlug(cat);
                      const href = buildListingsUrl({ categorySlug: slug });
                      const count =
                        cat.businessCount && cat.businessCount > 0
                          ? cat.businessCount >= 1000
                            ? `${Math.floor(cat.businessCount / 100) / 10}K+ businesses`
                            : `${cat.businessCount}+ businesses`
                          : cat.subCategoryCount
                            ? `${cat.subCategoryCount} sub-categories`
                            : null;

                      const Icon = resolveIcon(cat.name);

                      return (
                        <Link
                          key={cat._id}
                          href={href}
                          className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:border-[#FF6C00]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30"
                        >
                          {/* Icon */}
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-all duration-200 group-hover:bg-[#FF6C00] group-hover:text-white group-hover:shadow-[0_4px_14px_rgba(255,108,0,0.30)]">
                            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                          </span>

                          {/* Name */}
                          <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-800 group-hover:text-[#FF6C00] sm:text-[0.9375rem]">
                            {cat.name}
                          </h3>

                          {/* Count */}
                          {count ? (
                            <p className="mt-1 text-xs font-medium text-neutral-400">
                              {count}
                            </p>
                          ) : null}

                          {/* Hover underline accent */}
                          <span
                            className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-[#FF6C00] transition-all duration-200 group-hover:w-10"
                            aria-hidden
                          />
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Back to listings CTA */}
          <div className="mt-14 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF6C00] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e86200] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]"
            >
              Browse All Listings
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-[#FF6C00] hover:text-[#FF6C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6C00]/30"
            >
              Browse by City
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
