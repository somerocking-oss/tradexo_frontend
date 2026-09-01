"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100" role="status" aria-busy="true" aria-label="Loading seller portal">
        {/* Header skeleton */}
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-3 sm:px-4">
            <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="mx-auto flex max-w-[1400px] gap-6 px-6 py-6">
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-9 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-white shadow-sm border border-slate-200" />
              ))}
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-white shadow-sm border border-slate-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
