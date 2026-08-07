"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Search, X } from "lucide-react";
import { BusinessGrid } from "@/components/business/BusinessCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useSavedBusinesses } from "@/hooks/useSavedBusinesses";
import { getFavorites } from "@/lib/api/favorite";
import type { Business } from "@/types";

function SavedSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-xl bg-neutral-100" />
      ))}
    </div>
  );
}

export default function SavedBusinessesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { syncing } = useSavedBusinesses();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile/saved");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSaved = async () => {
      setLoading(true);
      try {
        const res = await getFavorites();
        if (res.success && Array.isArray(res.data)) {
          const items = res.data
            .map((item) => {
              const business = item.businessId;
              return typeof business === "object" && business?._id ? business : null;
            })
            .filter(Boolean) as Business[];
          setBusinesses(items);
        } else {
          setBusinesses([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, [isAuthenticated, syncing]);

  useEffect(() => {
    const handler = () => {
      if (isAuthenticated) {
        getFavorites().then((res) => {
          if (res.success && Array.isArray(res.data)) {
            const items = res.data
              .map((item) => {
                const business = item.businessId;
                return typeof business === "object" && business?._id ? business : null;
              })
              .filter(Boolean) as Business[];
            setBusinesses(items);
          }
        });
      }
    };
    window.addEventListener("saved-businesses-change", handler);
    return () => window.removeEventListener("saved-businesses-change", handler);
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50">
                <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Saved Businesses
              </h1>
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              Your wishlist — suppliers &amp; services you bookmarked
            </p>
          </div>
          <Button
            href="/listings"
            variant="outline"
            className="shrink-0 gap-2 border-neutral-200 text-neutral-700 hover:border-[#FF6C00] hover:text-[#FF6C00]"
          >
            <Search className="h-4 w-4" />
            Browse More
          </Button>
        </div>

        {/* Loading state */}
        {loading || syncing ? (
          <SavedSkeleton />
        ) : businesses.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-neutral-100 bg-white py-20 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <Heart className="h-7 w-7 text-rose-300" />
            </div>
            <p className="text-base font-semibold text-neutral-700">No saved businesses yet</p>
            <p className="mt-1.5 text-sm text-neutral-400">
              Tap the heart icon on any listing to save it here.
            </p>
            <Button
              href="/listings"
              className="mt-6 bg-[#FF6C00] font-semibold text-white hover:bg-[#E86200]"
            >
              Explore Listings
            </Button>
          </div>
        ) : (
          /* Results */
          <>
            <p className="mb-4 text-sm font-medium text-neutral-500">
              {businesses.length} saved business{businesses.length !== 1 ? "es" : ""}
            </p>
            <BusinessGrid businesses={businesses} viewMode="grid" />
          </>
        )}
      </div>
    </div>
  );
}
