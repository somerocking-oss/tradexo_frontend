import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  fetchSiteSettings,
  fetchSitemapPages,
  getPagePublicPath,
} from "@/lib/cms";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  return {
    title: "Sitemap",
    description:
      settings?.footer?.description ||
      "Browse all pages on Tradexo.",
  };
}

const CORE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "All Listings" },
  { href: "/browse", label: "Browse by City & Category" },
  { href: "/directory", label: "Browse by State" },
  { href: "/post-requirement", label: "Post Requirement" },
  { href: "/plans", label: "Premium Plans" },
  { href: "/register-business", label: "Register Business" },
  { href: "/login", label: "Login" },
  { href: "/profile", label: "My Profile" },
  { href: "/dashboard", label: "Vendor Dashboard" },
];

function titleFromPath(path: string) {
  const slug = path.replace(/^\//, "").replace(/^page\//, "");
  return slug
    .split(/[-_/]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function SitemapPage() {
  const [settings, cmsPages] = await Promise.all([
    fetchSiteSettings(),
    fetchSitemapPages(),
  ]);

  const footerLinks =
    settings?.footer?.sections?.flatMap((section) => section.links || []) || [];

  const cmsLinks = cmsPages.map((page) => ({
    href: page.path.startsWith("/") ? page.path : getPagePublicPath(page.path.replace(/^\//, "")),
    label: titleFromPath(page.path),
  }));

  const merged = [...CORE_LINKS];
  const seen = new Set(CORE_LINKS.map((l) => l.href));

  for (const link of [...footerLinks, ...cmsLinks]) {
    if (!link.href || seen.has(link.href)) continue;
    seen.add(link.href);
    merged.push({ href: link.href, label: link.label || titleFromPath(link.href) });
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">Sitemap</h1>
        <p className="mt-2 text-slate-600">
          {settings?.footer?.description ||
            "All public pages on Tradexo — updated from CMS."}
        </p>
        <ul className="mt-8 grid gap-2 sm:grid-cols-2">
          {merged.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-[#e86200] hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </MainLayout>
  );
}
