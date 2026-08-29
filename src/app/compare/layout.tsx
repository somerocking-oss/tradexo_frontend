import type { Metadata } from "next";

// Compare pages are built entirely from a user-picked, unbounded set of
// business ids in the query string — an infinite space of near-duplicate
// URLs with no canonical form, so keep them out of the index entirely
// rather than trying to canonicalize or noindex-per-combination.
export const metadata: Metadata = {
  title: "Compare Businesses",
  robots: { index: false, follow: true },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
