import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";

// Signed-in user's own hub — no public content of its own, keep out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
