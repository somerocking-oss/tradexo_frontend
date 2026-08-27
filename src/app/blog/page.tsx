import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { fetchBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo";

const BLOG_DESCRIPTION =
  "Insights on B2B sourcing, local business discovery, and growing your business on Tradexo.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}): Promise<Metadata> {
  const { page, category } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (currentPage > 1) query.set("page", String(currentPage));
  const qs = query.toString();

  return {
    title: category ? `${category} — Blog` : "Blog",
    description: BLOG_DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/blog${qs ? `?${qs}` : ""}` },
    robots: currentPage > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { page, category } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { posts, pagination } = await fetchBlogPosts({ page: currentPage, category });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
  ]);
  const collectionJsonLd = buildCollectionPageJsonLd("Tradexo Blog", BLOG_DESCRIPTION, `${SITE_URL}/blog`);

  return (
    <MainLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#ff6c00]">Insights</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {category ? category : "From the Tradexo Blog"}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            {category
              ? `Articles filed under ${category}.`
              : "Guides and updates on B2B sourcing, local business growth, and getting the most out of Tradexo."}
          </p>
          {category && (
            <Link href="/blog" className="mt-2 inline-block text-sm font-medium text-[#ff6c00] hover:underline">
              ← View all posts
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No blog posts published yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                {post.coverImage ? (
                  <div className="relative aspect-[3/2] w-full bg-slate-100">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/2] w-full bg-gradient-to-br from-[#ff6c00]/10 to-slate-100" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#ff6c00]">
                    {post.category}
                  </span>
                  <h2 className="mt-2 flex-1 text-lg font-semibold leading-snug text-slate-900 group-hover:text-[#ff6c00]">
                    {post.title}
                  </h2>
                  {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((num) => {
              const pageQuery = new URLSearchParams();
              if (category) pageQuery.set("category", category);
              if (num > 1) pageQuery.set("page", String(num));
              const qs = pageQuery.toString();
              return (
              <Link
                key={num}
                href={qs ? `/blog?${qs}` : "/blog"}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                  num === pagination.page
                    ? "bg-[#ff6c00] text-white"
                    : "border border-slate-200 text-slate-600 hover:border-[#ff6c00] hover:text-[#ff6c00]"
                }`}
              >
                {num}
              </Link>
              );
            })}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
