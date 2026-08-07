import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { fetchCmsPage } from "@/lib/cms";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";

function renderBody(body?: string) {
  if (!body) {
    return <p className="text-slate-600">This page is coming soon.</p>;
  }

  if (body.includes("<") && body.includes(">")) {
    return (
      <div
        className="cms-content space-y-4 text-slate-700 leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-3"
        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(body) }}
      />
    );
  }

  return <p className="whitespace-pre-line text-slate-700 leading-relaxed">{body}</p>;
}

export async function CmsPageView({
  slug,
  showBrowseLink = true,
}: {
  slug: string;
  showBrowseLink?: boolean;
}) {
  const page = await fetchCmsPage(slug);

  return (
    <MainLayout>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {page?.title || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </h1>
        <div className="mt-6">{renderBody(page?.body)}</div>
        {!page && showBrowseLink && (
          <Link href="/listings" className="mt-8 inline-block text-[#ff6c00] hover:underline">
            Browse Listings →
          </Link>
        )}
      </article>
    </MainLayout>
  );
}
