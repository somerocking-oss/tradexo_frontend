import Image from "next/image";
import Link from "next/link";
import { getBusinessHeroImageUrl } from "@/lib/utils";
import { getBusinessProfilePath } from "@/lib/business-url";
import { buildListingsCategoryPath, categoryToSlug } from "@/lib/listings-url";
import { resolveIcon } from "@/lib/categoryIcons";
import type { CategorySampleSection } from "@/lib/api/business-server";

/** IndiaMart-style "Explore by Industry" — a category heading followed by a
 * row of real business thumbnails, repeated per category. */
export function HomeIndustrySections({ sections = [] }: { sections?: CategorySampleSection[] }) {
  if (!sections.length) return null;

  return (
    <section className="border-b border-neutral-300 bg-white px-3 py-10 sm:px-4" aria-labelledby="explore-industry-heading">
      <div className="mx-auto max-w-8xl">
        <div className="mb-6">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#A3A3A3]">
            Business Directory
          </p>
          <h2 id="explore-industry-heading" className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
            Explore by Industry
          </h2>
        </div>

        <div className="divide-y divide-neutral-200">
          {sections.map(({ category, businesses }) => {
            const Icon = resolveIcon(category.name);
            return (
            <div key={category._id} className="py-6 first:pt-0 last:pb-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-1.5 text-base font-bold text-[#262626] sm:text-lg">
                  <Icon className="h-4 w-4 text-[#FF6C00]" strokeWidth={1.75} aria-hidden />
                  {category.name}
                </h3>
                <Link
                  href={buildListingsCategoryPath(categoryToSlug(category))}
                  className="shrink-0 text-xs font-semibold text-[#FF6C00] hover:underline sm:text-sm"
                >
                  View all &rarr;
                </Link>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible md:grid-cols-6">
                {businesses.map((business) => (
                  <Link
                    key={business._id}
                    href={getBusinessProfilePath(business)}
                    className="group w-24 shrink-0 sm:w-auto"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 transition-colors duration-150 group-hover:border-[#FF6C00]/50">
                      <Image
                        src={getBusinessHeroImageUrl(business)}
                        alt={business.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 96px, 150px"
                      />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-center text-[11px] font-medium text-[#525252] group-hover:text-[#FF6C00] sm:text-xs">
                      {business.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
