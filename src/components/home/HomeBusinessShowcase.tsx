import Link from "next/link";
import Image from "next/image";
import { getBusinessHeroImageUrl } from "@/lib/utils";
import { getBusinessProfilePath } from "@/lib/business-url";
import type { FeaturedSection, LatestListingsSection } from "@/lib/cms";
import type { Business } from "@/types";

const DEFAULT_LATEST: LatestListingsSection = {
  eyebrow: "Discover",
  title: "Business Listings",
  subtitle: "Recently registered suppliers & top-rated businesses",
  buttonText: "View All",
  buttonHref: "/listings?sort=newest",
};

const DEFAULT_FEATURED: FeaturedSection = {
  title: "Featured & Top Businesses",
  subtitle: "Premium and highly rated listings",
};

function ShowcaseBusinessCard({ business }: { business: Business }) {
  const image = getBusinessHeroImageUrl(business);
  const city = business.city || business.locations?.[0]?.city;
  const categoryName =
    typeof business.primaryCategory === "object" && business.primaryCategory?.name
      ? business.primaryCategory.name
      : null;

  return (
    <Link
      href={getBusinessProfilePath(business)}
      className="group overflow-hidden rounded-xl border border-neutral-400 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#ff6c00]/30 hover:shadow-md"
    >
      <div className="relative h-40 overflow-hidden bg-neutral-100">
        <Image
          src={image}
          alt={business.name}
          width={400}
          height={240}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {business.isVerified ? (
          <span className="absolute left-2 top-2 rounded-md bg-[#ff6c00] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Verified
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-bold text-neutral-900 group-hover:text-[#ff6c00]">
          {business.name}
        </h3>
        {categoryName ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{categoryName}</p>
        ) : null}
        {city ? <p className="mt-1 text-xs text-neutral-600">{city}</p> : null}
      </div>
    </Link>
  );
}

function BusinessGrid({
  businesses,
  viewMode = "grid",
}: {
  businesses: Business[];
  viewMode?: "grid" | "list";
}) {
  if (!businesses.length) {
    return (
      <p className="rounded-xl border border-dashed border-[#ddd] bg-white px-4 py-10 text-center text-sm text-neutral-500">
        No listings available yet.
      </p>
    );
  }

  return (
    <div
      className={
        viewMode === "list"
          ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      {businesses.map((business) => (
        <ShowcaseBusinessCard key={String(business._id)} business={business} />
      ))}
    </div>
  );
}

export function HomeBusinessShowcase({
  latestSection,
  featuredSection,
  initialLatest = [],
  initialFeatured = [],
}: {
  latestSection?: LatestListingsSection;
  featuredSection?: FeaturedSection;
  initialLatest?: Business[];
  initialFeatured?: Business[];
}) {
  const latestMeta = {
    eyebrow: latestSection?.eyebrow || DEFAULT_LATEST.eyebrow,
    title: latestSection?.title || DEFAULT_LATEST.title,
    subtitle: latestSection?.subtitle || DEFAULT_LATEST.subtitle,
    buttonHref: latestSection?.buttonHref || "/listings?sort=newest",
    buttonText: latestSection?.buttonText || "View All",
  };

  const featuredMeta = {
    subtitle: featuredSection?.subtitle || DEFAULT_FEATURED.subtitle,
  };

  if (!initialLatest.length && !initialFeatured.length) return null;

  return (
    <section className="home-section-muted px-3 py-12 sm:px-4 sm:py-14">
      <div className="home-showcase-tabs mx-auto max-w-8xl">
        <input
          type="radio"
          name="home-showcase-tab"
          id="home-showcase-latest"
          defaultChecked
          className="sr-only"
        />
        <input type="radio" name="home-showcase-tab" id="home-showcase-featured" className="sr-only" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <span className="home-eyebrow">{latestMeta.eyebrow}</span>
            <h2 className="home-section-title">{latestMeta.title}</h2>
            <p className="home-section-subtitle home-showcase-subtitle-latest">{latestMeta.subtitle}</p>
            <p className="home-section-subtitle home-showcase-subtitle-featured">{featuredMeta.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="home-showcase-tab-labels inline-flex rounded-xl border border-[#e5e7eb] bg-white p-1 shadow-sm">
              <label htmlFor="home-showcase-latest">Latest</label>
              <label htmlFor="home-showcase-featured">Featured</label>
            </div>
            <Link href={latestMeta.buttonHref} className="home-showcase-view-latest home-showcase-view-btn">
              {latestMeta.buttonText}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/listings?sort=featured" className="home-showcase-view-featured home-showcase-view-btn">
              View All
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="home-showcase-panels">
          <div className="home-showcase-panel-latest">
            <BusinessGrid businesses={initialLatest} viewMode="list" />
          </div>
          <div className="home-showcase-panel-featured">
            <BusinessGrid businesses={initialFeatured} viewMode="grid" />
          </div>
        </div>
      </div>
    </section>
  );
}
