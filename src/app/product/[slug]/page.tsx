import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { BusinessProfileTabs, type ProfileTab } from "@/components/business/BusinessProfileTabs";
import { ProductEnquiryActions } from "@/components/business/ProductEnquiryActions";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { StickyProductContact } from "@/components/business/StickyProductContact";
import { FloatingContactButtons } from "@/components/business/FloatingContactButtons";
import { getProductBySlugServer } from "@/lib/api/products-server";
import { getProductPath } from "@/lib/product-url";
import { getBusinessProfilePath } from "@/lib/business-url";
import { buildListingsCityPath, buildListingsCategoryPath } from "@/lib/listings-url";
import { getImageUrl } from "@/lib/utils";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import type { Business } from "@/types";

export const revalidate = 300;

const PRICE_TYPE_LABELS: Record<string, string> = {
  fixed: "Fixed",
  starting: "Starting from",
  per_unit: "Per unit",
  hourly: "Per hour",
  on_request: "On request",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlugServer(slug);
  if (!data) return { title: "Product Not Found" };

  const { product } = data;
  const business = product.business as unknown as Business | undefined;
  const title =
    product.metaTitle ||
    `${product.name}${business?.city ? ` in ${business.city}` : ""} | Best Price & Suppliers`;
  const description =
    product.metaDescription ||
    product.description?.slice(0, 160) ||
    `Buy ${product.name} from verified suppliers. Compare prices, MOQ and get instant quotes.`;
  const ogImage = product.images?.[0]?.url ? getImageUrl(product.images[0].url) : undefined;

  return {
    title,
    description,
    openGraph: { title, description, images: ogImage ? [ogImage] : undefined },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: { canonical: `${SITE_URL}${getProductPath(product)}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductBySlugServer(slug);
  if (!data) notFound();

  const { product, similar } = data;
  const business = product.business as unknown as Business | undefined;
  const category = product.category;
  const productUrl = `${SITE_URL}${getProductPath(product)}`;

  const hasSpecs = Array.isArray(product.specifications) && product.specifications.length > 0;
  const tabs: ProfileTab[] = [
    { id: "overview", label: "Overview" },
    ...(hasSpecs ? [{ id: "specifications", label: "Specifications" }] : []),
    ...(similar.length > 0
      ? [{ id: "similar", label: product.itemType === "service" ? "Similar Services" : "Similar Products" }]
      : []),
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Products", url: `${SITE_URL}/products` },
    ...(category?.slug ? [{ name: category.name || category.slug, url: `${SITE_URL}${buildListingsCategoryPath(category.slug)}` }] : []),
    { name: product.name, url: productUrl },
  ]);

  const productJsonLd = buildProductJsonLd({
    name: product.name,
    description: product.description,
    images: product.images,
    brand: product.brand,
    price: product.price,
    businessName: business?.name,
    url: productUrl,
    inStock: product.inStock,
    sku: product._id,
  });

  return (
    <MainLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <BusinessProfileTabs tabs={tabs} />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ── Left: gallery + details ── */}
          <div id="overview" className="scroll-mt-28">
            <ProductImageGallery images={product.images} productName={product.name} />

            <div className="mt-5 flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  product.itemType === "service"
                    ? "bg-[#DBEAFE] text-[#2563EB]"
                    : "border border-neutral-300 bg-white text-neutral-600"
                }`}
              >
                {product.itemType === "service" ? "Service" : "Product"}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{product.name}</h1>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
              {product.brand && <span>Brand: <strong className="text-neutral-900">{product.brand}</strong></span>}
              {category?.slug && (
                <Link href={buildListingsCategoryPath(category.slug)} className="text-[#FF6C00] hover:underline">
                  {category.name}
                </Link>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-baseline gap-2">
              {product.priceType === "on_request" || !product.price ? (
                <span className="text-xl font-bold text-neutral-700">Price on Request</span>
              ) : (
                <span className="text-2xl font-bold text-[#FF6C00]">
                  ₹{product.price.toLocaleString("en-IN")}
                  {product.unit ? ` / ${product.unit}` : ""}
                </span>
              )}
              {product.priceType && product.priceType !== "fixed" && product.priceType !== "on_request" && (
                <span className="text-sm text-neutral-400">({PRICE_TYPE_LABELS[product.priceType]})</span>
              )}
            </div>

            {product.itemType !== "service" && product.minimumOrderQuantity != null && (
              <p className="mt-1 text-sm text-neutral-500">
                MOQ: <strong className="text-neutral-700">{product.minimumOrderQuantity} {product.unit || "units"}</strong>
              </p>
            )}

            {product.description && (
              <div className="mt-6">
                <h2 className="text-lg font-bold text-neutral-900">Description</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">{product.description}</p>
              </div>
            )}

            {Array.isArray(product.videos) && product.videos.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-bold text-neutral-900">Product Videos</h2>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {product.videos.map((video) => (
                    <video
                      key={video.public_id}
                      controls
                      preload="metadata"
                      className="aspect-video w-full rounded-xl border border-neutral-300 bg-black"
                    >
                      <source src={video.url} />
                    </video>
                  ))}
                </div>
              </div>
            )}

            {hasSpecs && (
              <div id="specifications" className="mt-6 scroll-mt-28">
                <h2 className="text-lg font-bold text-neutral-900">Specifications</h2>
                <dl className="mt-2 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
                  {product.specifications!.map((spec, i) => (
                    <div key={i} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                      <dt className="text-neutral-500">{spec.name}</dt>
                      <dd className="font-medium text-neutral-900">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Mobile sticky enquiry bar — spacer keeps content clear of the fixed bar */}
            <div className="h-16 lg:hidden" aria-hidden />
            <StickyProductContact product={product} />
            {business && (
              <FloatingContactButtons
                business={business}
                initialMessage={`Hi, I'm interested in "${product.name}"${
                  product.minimumOrderQuantity
                    ? ` (MOQ: ${product.minimumOrderQuantity}${product.unit ? ` ${product.unit}` : ""})`
                    : ""
                }. Please share availability and pricing.`}
                breakpoint="lg"
              />
            )}

            {/* Similar products */}
            {similar.length > 0 && (
              <div id="similar" className="mt-10 scroll-mt-28">
                <h2 className="text-lg font-bold text-neutral-900">
                  Similar {product.itemType === "service" ? "Services" : "Products"}
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {similar.map((p) => (
                    <Link
                      key={p._id}
                      href={getProductPath(p)}
                      className="rounded-xl border border-neutral-200 bg-white p-3 transition hover:border-[#FF6C00]/40 hover:shadow-sm"
                    >
                      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
                        {p.images?.[0]?.url && (
                          <Image src={getImageUrl(p.images[0].url)} alt={p.name} fill className="object-cover" sizes="150px" />
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs font-medium text-neutral-800">{p.name}</p>
                      {p.priceType !== "on_request" && p.price ? (
                        <p className="mt-0.5 text-xs font-bold text-[#FF6C00]">
                          ₹{p.price.toLocaleString("en-IN")}{p.unit ? ` / ${p.unit}` : ""}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-neutral-400">Price on Request</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: supplier card (sticky on desktop) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-20 rounded-2xl border border-neutral-300 bg-white p-5 shadow-sm">
              {business && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    {product.itemType === "service" ? "Offered by" : "Sold by"}
                  </p>
                  <Link href={getBusinessProfilePath(business)} className="mt-1 block text-lg font-bold text-neutral-900 hover:text-[#FF6C00]">
                    {business.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                    {business.city && (
                      <Link href={buildListingsCityPath(business.city)} className="hover:text-[#FF6C00]">
                        {business.city}{business.state ? `, ${business.state}` : ""}
                      </Link>
                    )}
                    {business.isVerified && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Verified</span>
                    )}
                  </div>
                  <div className="mt-4">
                    <ProductEnquiryActions product={product} />
                  </div>

                  {(business.logo || business.averageRating || business.rating || business.establishmentYear || business.shortDescription || business.description) && (
                    <div className="mt-5 border-t border-neutral-200 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">About the company</p>
                      <div className="mt-2 flex items-center gap-3">
                        {business.logo && (
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                            <Image src={getImageUrl(business.logo)} alt={business.name} fill className="object-contain" sizes="44px" />
                          </div>
                        )}
                        <div className="min-w-0">
                          {(business.averageRating || business.rating) ? (
                            <p className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                              ★ {(business.averageRating ?? business.rating)!.toFixed(1)}
                            </p>
                          ) : null}
                          {business.establishmentYear && (
                            <p className="text-xs text-neutral-500">Est. {business.establishmentYear}</p>
                          )}
                        </div>
                      </div>
                      {(business.shortDescription || business.description) && (
                        <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-neutral-500">
                          {business.shortDescription || business.description}
                        </p>
                      )}
                      <Link
                        href={getBusinessProfilePath(business)}
                        className="mt-2 inline-block text-xs font-semibold text-[#FF6C00] hover:underline"
                      >
                        View full profile →
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
