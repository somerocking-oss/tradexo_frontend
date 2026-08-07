import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Post Requirement — Get Free Quotes",
  description:
    "Post your buying requirement and get quotes from verified local suppliers. No login required.",
};

export default function PostRequirementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
