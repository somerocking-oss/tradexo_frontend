import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Eye,
  BadgeCheck,
  CheckCircle2,
  Store,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ShareButtons } from "@/components/blog/ShareButtons";
import {
  fetchBlogPostBySlug,
  fetchBlogPosts,
  buildBlogPostMetadata,
  estimateReadTime,
  formatBlogDate,
  formatViewCount,
  extractHeadingsAndInjectIds,
  type BlogPost,
} from "@/lib/blog";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";
import { enhanceContentBlocks } from "@/lib/blog-content";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { buttonClassName } from "@/components/ui/button-utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const ABOUT_CHECKLIST = ["Free Business Listing", "Verified Businesses", "Wider Reach", "More Business Opportunities"];

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  return buildBlogPostMetadata(post, slug);
}

async function getRelatedPosts(post: BlogPost) {
  const primary = await fetchBlogPosts({ category: post.category });
  const seen = new Set([post._id]);
  const related: BlogPost[] = [];

  for (const candidate of primary.posts) {
    if (seen.has(candidate._id)) continue;
    seen.add(candidate._id);
    related.push(candidate);
    if (related.length === 3) return related;
  }

  const fallback = await fetchBlogPosts({});
  for (const candidate of fallback.posts) {
    if (seen.has(candidate._id)) continue;
    seen.add(candidate._id);
    related.push(candidate);
    if (related.length === 3) break;
  }

  return related;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) notFound();

  const postUrl = `${SITE_URL}/blog/${slug}`;
  const readMinutes = estimateReadTime(post.content);
  const publishedLabel = formatBlogDate(post.publishedAt || post.createdAt);
  const { html: contentHtml, toc } = extractHeadingsAndInjectIds(
    enhanceContentBlocks(sanitizeCmsHtml(post.content || ""))
  );
  const relatedPosts = await getRelatedPosts(post);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    ...(post.category ? [{ name: post.category, url: `${SITE_URL}/blog?category=${encodeURIComponent(post.category)}` }] : []),
    { name: post.title, url: postUrl },
  ]);
  const articleJsonLd = buildArticleJsonLd({
    title: post.title,
    description: post.excerpt,
    url: postUrl,
    image: post.coverImage,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    category: post.category,
  });

  return (
    <MainLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#ff6c00]">
            Home
          </Link>
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          <Link href="/blog" className="hover:text-[#ff6c00]">
            Blog
          </Link>
          {post.category && (
            <>
              <ChevronRight className="size-3.5 shrink-0" aria-hidden />
              <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-[#ff6c00]">
                {post.category}
              </Link>
            </>
          )}
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate text-slate-400">{post.title}</span>
        </nav>

        {/* Hero */}
        <div className="mt-5 overflow-hidden rounded-3xl shadow-lg lg:grid lg:grid-cols-2">
          <div className="flex flex-col justify-center bg-slate-900 p-8 sm:p-10 lg:p-12">
            {post.category && (
              <span className="inline-block w-fit rounded-full bg-[#FF6C00] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {post.category}
              </span>
            )}
            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl">{post.title}</h1>
            {post.excerpt && <p className="mt-4 text-base text-slate-300">{post.excerpt}</p>}
          </div>

          {post.coverImage ? (
            <div className="relative h-64 w-full bg-slate-800 lg:h-auto">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          ) : (
            <div className="h-64 w-full bg-gradient-to-br from-[#ff6c00]/20 to-slate-800 lg:h-auto" />
          )}
        </div>

        {/* Byline */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 font-medium text-slate-700">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#FF6C00] text-xs font-bold text-white">
                XO
              </span>
              By {SITE_NAME} Team
              <BadgeCheck className="size-4 text-[#0A66C2]" aria-hidden />
            </span>
            {publishedLabel && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                {publishedLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4" aria-hidden />
              {readMinutes} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4" aria-hidden />
              {formatViewCount(post.viewCount)} views
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Share:</span>
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,48rem)_1fr]">
          <article className="min-w-0">
            {contentHtml ? (
              <div
                className={[
                  "space-y-2.5 text-[1.0125rem] leading-normal text-slate-700",
                  "[&_h2]:mt-7 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-slate-900",
                  "[&_h3]:mt-6 [&_h3]:scroll-mt-24 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900",
                  "[&_h4]:mt-5 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-slate-900",
                  "[&_p]:mt-2.5",
                  "[&_ul]:mt-2.5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ul]:marker:text-[#ff6c00]",
                  "[&_ol]:mt-2.5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_ol]:marker:text-[#ff6c00] [&_ol]:marker:font-semibold",
                  "[&_li]:leading-normal",
                  "[&_strong]:font-semibold [&_strong]:text-slate-900",
                  "[&_a]:font-medium [&_a]:text-[#ff6c00] [&_a]:underline [&_a]:decoration-[#ff6c00]/30 [&_a]:underline-offset-2 hover:[&_a]:decoration-[#ff6c00]",
                  "[&_blockquote]:mt-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#ff6c00]/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600",
                ].join(" ")}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <p className="text-slate-600">{post.excerpt}</p>
            )}

            {/* CTA banner */}
            <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-[#FF6C00]/20 bg-[#FFF7ED] p-6 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#FF6C00]/10 text-[#ff6c00]">
                  <Store className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="font-bold text-slate-900">Ready to Grow Your Business Online?</p>
                  <p className="text-sm text-slate-600">
                    List your business on {SITE_NAME} and connect with thousands of buyers across India.
                  </p>
                </div>
              </div>
              <Link
                href="/register-business"
                className={buttonClassName({ variant: "primary", className: "w-full shrink-0 sm:w-auto" })}
              >
                List Your Business FREE
              </Link>
            </div>
          </article>

          <aside className="lg:sticky lg:top-24 lg:h-fit lg:max-w-xs lg:self-start">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="font-bold text-slate-900">About {SITE_NAME}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {SITE_NAME} is India&apos;s trusted B2B marketplace connecting businesses, wholesalers,
                  manufacturers and suppliers with buyers across the country.
                </p>
                <ul className="mt-4 space-y-2">
                  {ABOUT_CHECKLIST.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="size-4 shrink-0 text-[#ff6c00]" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register-business"
                  className={buttonClassName({ variant: "primary", className: "mt-4 w-full" })}
                >
                  List Your Business FREE
                </Link>
              </div>

              {toc.length >= 3 && (
                <nav className="rounded-2xl border border-slate-200 bg-white p-5" aria-label="Table of contents">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">In this article</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`} className="line-clamp-2 text-slate-600 hover:text-[#ff6c00]">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {relatedPosts.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Related Posts</p>
                  <ul className="mt-3 space-y-4">
                    {relatedPosts.map((related) => (
                      <li key={related._id}>
                        <Link href={`/blog/${related.slug}`} className="group flex items-start gap-3">
                          <div className="relative aspect-[3/2] w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {related.coverImage ? (
                              <Image
                                src={related.coverImage}
                                alt={related.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-[#ff6c00]/10 to-slate-100" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-[#ff6c00]">
                              {related.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {formatBlogDate(related.publishedAt || related.createdAt)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/blog"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#ff6c00] hover:underline"
                  >
                    View All Posts <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tags</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Previous / Next */}
        {(post.previousPost || post.nextPost) && (
          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 py-8 sm:grid-cols-2">
            {post.previousPost ? (
              <Link
                href={`/blog/${post.previousPost.slug}`}
                className={buttonClassName({ variant: "outline", className: "w-full justify-start" })}
              >
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{post.previousPost.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {post.nextPost && (
              <Link
                href={`/blog/${post.nextPost.slug}`}
                className={buttonClassName({ variant: "outline", className: "w-full justify-end sm:col-start-2" })}
              >
                <span className="truncate">{post.nextPost.title}</span>
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
