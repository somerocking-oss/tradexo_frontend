import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBusinessRoleBySlug,
  parseFlatSuppliersSlug,
  parseListingsCityParam,
  parseRoleCitySlug,
} from "@/lib/listings-url";
import { getCategoryBySlug, getCategoryByIdServer } from "@/lib/api/category-server";
import { getSubCategoryBySlug } from "@/lib/api/subcategory-server";
import {
  getListingsCityCategoryMetadata,
  ListingsCityCategoryPageContent,
} from "@/app/city/[city]/[categorySlug]/renderListingsCityCategoryPage";
import {
  getListingsCityCategorySubMetadata,
  ListingsCityCategorySubPageContent,
} from "@/app/city/[city]/[categorySlug]/[subSlug]/renderListingsCityCategorySubPage";
import { getRolePageMetadata, RolePageContent } from "@/app/listings/renderRolePage";
import type { SubCategory } from "@/types";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ flatSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ResolvedSubject =
  | { type: "category"; categorySlug: string }
  | { type: "subCategory"; categorySlug: string; subCategorySlug: string };

/** `{category-slug}-suppliers-in-{city}` first, then falls back to treating
 *  the subject as a subcategory slug — subcategory slugs aren't globally
 *  unique across categories the way category slugs are, so this also
 *  resolves the subcategory's parent category. */
async function resolveFlatSubject(subjectSlug: string): Promise<ResolvedSubject | null> {
  const category = await getCategoryBySlug(subjectSlug);
  if (category) {
    return { type: "category", categorySlug: category.slug || subjectSlug };
  }

  const subCategory: SubCategory | null = await getSubCategoryBySlug(subjectSlug);
  if (!subCategory) return null;

  const parentCategory =
    subCategory.category && typeof subCategory.category === "object"
      ? subCategory.category
      : typeof subCategory.category === "string"
        ? await getCategoryByIdServer(subCategory.category)
        : null;

  if (!parentCategory?.slug) return null;

  return {
    type: "subCategory",
    categorySlug: parentCategory.slug,
    subCategorySlug: subCategory.slug || subjectSlug,
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { flatSlug } = await params;
  const sp = await searchParams;

  const roleParsed = parseRoleCitySlug(flatSlug);
  if (roleParsed) {
    const role = getBusinessRoleBySlug(roleParsed.roleSlug);
    if (!role) return { title: "Not Found" };
    return getRolePageMetadata(sp, role, parseListingsCityParam(roleParsed.citySlug));
  }

  const parsed = parseFlatSuppliersSlug(flatSlug);
  if (!parsed) return { title: "Not Found" };

  const city = parseListingsCityParam(parsed.citySlug);
  const resolved = await resolveFlatSubject(parsed.subjectSlug);
  if (!resolved) return { title: "Not Found" };

  if (resolved.type === "category") {
    return getListingsCityCategoryMetadata(sp, city, resolved.categorySlug);
  }
  return getListingsCityCategorySubMetadata(sp, city, resolved.categorySlug, resolved.subCategorySlug);
}

export default async function FlatSuppliersInCityPage({ params, searchParams }: PageProps) {
  const { flatSlug } = await params;
  const sp = await searchParams;

  const roleParsed = parseRoleCitySlug(flatSlug);
  if (roleParsed) {
    const role = getBusinessRoleBySlug(roleParsed.roleSlug);
    if (!role) notFound();
    return (
      <RolePageContent sp={sp} role={role} city={parseListingsCityParam(roleParsed.citySlug)} page={1} />
    );
  }

  const parsed = parseFlatSuppliersSlug(flatSlug);
  if (!parsed) notFound();

  const city = parseListingsCityParam(parsed.citySlug);
  const resolved = await resolveFlatSubject(parsed.subjectSlug);
  if (!resolved) notFound();

  if (resolved.type === "category") {
    return (
      <ListingsCityCategoryPageContent sp={sp} city={city} categorySlug={resolved.categorySlug} page={1} />
    );
  }

  return (
    <ListingsCityCategorySubPageContent
      sp={sp}
      city={city}
      categorySlug={resolved.categorySlug}
      subSlug={resolved.subCategorySlug}
      page={1}
    />
  );
}
