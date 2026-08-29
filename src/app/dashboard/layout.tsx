import type { Metadata } from "next";
import { DashboardLayoutClient } from "./DashboardLayoutClient";

// Auth-gated seller portal — no public content of its own, keep out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
