import { cache } from "react";
import { SITE_URL } from "./constants";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
const FETCH_TIMEOUT_MS = 8000;

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: boolean;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  viewCount?: number;
  previousPost?: { title: string; slug: string } | null;
  nextPost?: { title: string; slug: string } | null;
}

export interface BlogPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const fetchBlogPosts = cache(async (params: { page?: number; category?: string } = {}): Promise<{
  posts: BlogPost[];
  pagination: BlogPagination;
}> => {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.category) search.set("category", params.category);

  try {
    const res = await fetch(`${API}/api/v1/blog?${search.toString()}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return { posts: [], pagination: { total: 0, page: 1, limit: 12, pages: 1 } };
    const json = await res.json();
    return {
      posts: json.data?.posts || [],
      pagination: json.data?.pagination || { total: 0, page: 1, limit: 12, pages: 1 },
    };
  } catch {
    return { posts: [], pagination: { total: 0, page: 1, limit: 12, pages: 1 } };
  }
});

export const fetchBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  try {
    const res = await fetch(`${API}/api/v1/blog/${slug}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
});

export function estimateReadTime(html?: string) {
  if (!html) return 1;
  const words = html
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatViewCount(count?: number) {
  const n = count || 0;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

export function formatBlogDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export interface TocItem {
  id: string;
  text: string;
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Pulls out <h2> headings from already-sanitized content HTML and stamps
 *  each with an `id` so a table of contents can deep-link into the article. */
export function extractHeadingsAndInjectIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();

  const withIds = html.replace(/<h2>([\s\S]*?)<\/h2>/gi, (match, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text) return match;

    let id = slugifyHeading(text) || "section";
    const count = seen.get(id) || 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;

    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  return { html: withIds, toc };
}

export function buildBlogPostMetadata(post: BlogPost | null, slug: string) {
  const title = post?.metaTitle || post?.title || "Blog";
  const description = post?.metaDescription || post?.excerpt || "Insights from Tradexo.";
  const canonical = `${SITE_URL}/blog/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: post?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article" as const,
      publishedTime: post?.publishedAt || undefined,
      modifiedTime: post?.updatedAt || undefined,
      section: post?.category || undefined,
      images: post?.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: post?.coverImage ? [post.coverImage] : undefined,
    },
  };
}
