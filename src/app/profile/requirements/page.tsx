"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, FileText, MessageSquare, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getBuyerRfqs } from "@/lib/api/lead";
import type { BuyerRfq } from "@/types";

function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusVariant(status?: string): "success" | "warning" | "danger" | "outline" {
  if (!status) return "outline";
  const s = status.toLowerCase();
  if (s === "active" || s === "open" || s === "new") return "success";
  if (s === "closed" || s === "fulfilled") return "outline";
  if (s === "expired") return "warning";
  return "outline";
}

function RequirementsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100" />
      ))}
    </div>
  );
}

export default function MyRequirementsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rfqs, setRfqs] = useState<BuyerRfq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile/requirements");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getBuyerRfqs()
      .then((res) => {
        if (res.success && res.data) {
          setRfqs(Array.isArray(res.data) ? res.data : []);
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setInterval(() => {
      getBuyerRfqs().then((res) => {
        if (res.success && res.data) {
          setRfqs(Array.isArray(res.data) ? res.data : []);
        }
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E5E5E5]">
                <FileText className="h-5 w-5 text-[#FF6C00]" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                My Requirements
              </h1>
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              Buyer quotes inbox — track RFQs and quotes from suppliers
            </p>
          </div>
          <Button
            href="/post-requirement"
            className="shrink-0 gap-2 bg-[#FF6C00] font-semibold text-white shadow-sm hover:bg-[#E86200] active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            Post New RFQ
          </Button>
        </div>

        {/* Loading */}
        {loading ? (
          <RequirementsSkeleton />
        ) : rfqs.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-neutral-100 bg-white py-20 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5E5E5]">
              <FileText className="h-7 w-7 text-[#FF6C00]" />
            </div>
            <p className="text-base font-semibold text-neutral-700">No requirements posted yet</p>
            <p className="mt-1.5 text-sm text-neutral-400">
              Post what you need and receive quotes from verified suppliers.
            </p>
            <Button
              href="/post-requirement"
              className="mt-6 bg-[#FF6C00] font-semibold text-white hover:bg-[#E86200]"
            >
              Post Your First Requirement
            </Button>
          </div>
        ) : (
          /* List */
          <>
            <p className="mb-4 text-sm font-medium text-neutral-500">
              {rfqs.length} requirement{rfqs.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-3">
              {rfqs.map((rfq) => (
                <Link key={rfq._id} href={`/profile/requirements/${rfq._id}`}>
                  <div className="group flex flex-col gap-3 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#FF6C00]/20 hover:shadow-md hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-neutral-900">
                          {rfq.productName || "Buying requirement"}
                        </h2>
                        {rfq.type === "bulk_order" && (
                          <Badge variant="premium">Bulk</Badge>
                        )}
                        <Badge variant={getStatusVariant(rfq.status)} className="capitalize">
                          {rfq.status || "New"}
                        </Badge>
                        {(rfq.quoteCount ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                            <MessageSquare className="h-3 w-3" />
                            {rfq.quoteCount} quote{rfq.quoteCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                        {rfq.deliveryCity && (
                          <span>Delivery: {rfq.deliveryCity}</span>
                        )}
                        {rfq.items && rfq.items.length > 1 ? (
                          <span>{rfq.items.length} products</span>
                        ) : rfq.quantity != null ? (
                          <span>
                            Qty: {rfq.quantity}
                            {rfq.unit ? ` ${rfq.unit}` : ""}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(rfq.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#FF6C00] transition-colors group-hover:text-[#E86200]">
                      View quotes
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
