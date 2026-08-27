import type { Metadata } from "next";
import { getRolePageMetadata, RolePageContent } from "@/app/listings/renderRolePage";
import { getBusinessRoleBySlug } from "@/lib/listings-url";

export const revalidate = 60;

const ROLE = getBusinessRoleBySlug("manufacturers")!;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  return getRolePageMetadata(sp, ROLE);
}

export default async function ManufacturersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <RolePageContent sp={sp} role={ROLE} page={1} />;
}
