"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  Inbox,
  Pencil,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SellerAnalytics } from "@/components/dashboard/SellerAnalytics";
import { SellerEngagementStats } from "@/components/dashboard/SellerEngagementStats";
import { MarketInsightCard } from "@/components/dashboard/MarketInsightCard";
import { FeatureBoostCard } from "@/components/dashboard/FeatureBoostCard";
import { VerifiedBadge } from "@/components/business/VerifiedBadge";
import { exportAnalyticsSummary } from "@/lib/export-csv";
import { extractBusinessList, getMyBusinesses } from "@/lib/api/business";
import { extractLeadList, getLeadBusinessName, getMyLeads } from "@/lib/api/lead";
import type { Business, Lead } from "@/types";
import { getBusinessProfilePath } from "@/lib/business-url";

function getBusinessKey(business: Business, index: number) {
  return String(business._id || business.slug || `${business.name}-${business.city}-${index}`);
}
function getLeadKey(lead: Lead, index: number) {
  return String(lead._id || `${lead.mobile}-${lead.name}-${index}`);
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-12 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      </CardBody>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="px-4 lg:px-0" role="status" aria-busy="true" aria-label="Loading dashboard">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardBody>
              <div className="mb-4 h-5 w-32 animate-pulse rounded bg-slate-100" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const justUpdated   = searchParams.get("updated") === "1";
  const [showSuccess, setShowSuccess] = useState(justRegistered);
  const [showUpdated, setShowUpdated] = useState(justUpdated);

  const {
    data: businesses = [],
    isLoading: bizLoading,
    refetch: refetchBiz,
  } = useQuery({
    queryKey: ["my-businesses"],
    queryFn: async () => {
      const res = await getMyBusinesses();
      return res.success && res.data ? extractBusinessList(res.data) : [];
    },
    staleTime: 60_000,
  });

  const { data: leads = [], isLoading: leadLoading } = useQuery({
    queryKey: ["my-leads"],
    queryFn: async () => {
      const res = await getMyLeads();
      return res.success && res.data ? extractLeadList(res.data) : [];
    },
    staleTime: 60_000,
  });

  if (bizLoading || leadLoading) return <DashboardSkeleton />;

  const newLeads = leads.filter((l) => l.status === "new").length;

  const stats = [
    { label: "My Businesses",   value: businesses.length,                             icon: Building2, color: "text-[#ff6c00] bg-[#e8e8e8]" },
    { label: "Total Leads",     value: leads.length,                                  icon: Inbox,     color: "text-emerald-600 bg-emerald-50" },
    { label: "New Leads",       value: newLeads,                                      icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
    { label: "Active Listings", value: businesses.filter((b) => b.status === "active").length, icon: BarChart3, color: "text-violet-600 bg-violet-50" },
  ];

  return (
    <div className="px-4 lg:px-0">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Seller Overview</h1>
          <p className="mt-1 text-slate-600">Manage listings, track leads and grow your business</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {leads.length > 0 && (
            <Button variant="outline" onClick={() => exportAnalyticsSummary(leads, businesses)}>
              <Download className="h-4 w-4" /> Export Analytics
            </Button>
          )}
          <Button href="/register-business">Add Business</Button>
        </div>
      </div>

      {showUpdated && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-[#d4d4d4] bg-[#e8e8e8] p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6c00]" aria-hidden />
          <div className="flex-1">
            <p className="font-semibold text-[#cc5500]">Business updated successfully!</p>
            <p className="mt-1 text-sm text-[#e86200]">Your listing changes are now saved.</p>
          </div>
          <button type="button" onClick={() => setShowUpdated(false)} aria-label="Dismiss" className="text-[#ff6c00] hover:text-[#e86200]">✕</button>
        </div>
      )}

      {showSuccess && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <div className="flex-1">
            <p className="font-semibold text-emerald-900">Business registered successfully!</p>
            <p className="mt-1 text-sm text-emerald-800">
              Your listing is submitted for admin review. It will appear in public search after verification.
              Complete KYC to speed up approval and get more leads.
            </p>
          </div>
          <button type="button" onClick={() => setShowSuccess(false)} aria-label="Dismiss" className="text-emerald-600 hover:text-emerald-800">✕</button>
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardBody className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`} aria-hidden>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <SellerEngagementStats />

      <MarketInsightCard businesses={businesses} />

      <SellerAnalytics leads={leads} businesses={businesses} />

      {businesses.length > 0 && (
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          {businesses.slice(0, 2).map((business, index) => (
            <FeatureBoostCard
              key={getBusinessKey(business, index)}
              business={business}
              onBoosted={async () => {
                await refetchBiz();
              }}
            />
          ))}
        </div>
      )}

      {newLeads > 0 && (
        <Link
          href="/dashboard/leads"
          className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500 to-[#ff6c00] px-5 py-4 text-white shadow-lg shadow-amber-200 transition hover:shadow-xl"
        >
          <div className="flex items-center gap-3">
            <Inbox className="h-6 w-6" aria-hidden />
            <div>
              <p className="font-semibold">{newLeads} new lead{newLeads > 1 ? "s" : ""} waiting</p>
              <p className="text-sm text-amber-100">Respond quickly to convert more buyers</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Building2 className="h-5 w-5 text-[#ff6c00]" aria-hidden /> My Businesses
            </h2>
            {businesses.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500">No businesses yet.</p>
                <Button href="/register-business" className="mt-4">Register Your First Business</Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {businesses.map((b, index) => (
                  <li key={getBusinessKey(b, index)} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={getBusinessProfilePath(b)} className="font-semibold text-[#e86200] hover:underline">
                          {b.name}
                        </Link>
                        <p className="text-xs text-slate-500">{b.city}</p>
                        {typeof b.profileCompletionPercent === "number" && (
                          <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                              <span>Profile Score</span>
                              <span className="font-semibold text-[#e86200]">{b.profileCompletionPercent}%</span>
                            </div>
                            <div
                              className="h-2 overflow-hidden rounded-full bg-slate-100"
                              role="progressbar"
                              aria-valuenow={b.profileCompletionPercent}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`Profile completion: ${b.profileCompletionPercent}%`}
                            >
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#ff6c00] to-[#f0f0f0]"
                                style={{ width: `${b.profileCompletionPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={b.status === "active" ? "success" : "warning"}>
                          {b.status || "pending"}
                        </Badge>
                        <VerifiedBadge isVerified={b.isVerified} verificationLevel={b.verificationLevel} />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button href={`/dashboard/business/${b._id}/edit`} size="sm">
                        <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                      </Button>
                      <Button href={`/dashboard/business/${b._id}/kyc`} size="sm" variant="outline">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> KYC
                      </Button>
                      <Button href={getBusinessProfilePath(b)} size="sm" variant="ghost">
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden /> View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Users className="h-5 w-5 text-emerald-600" aria-hidden /> Recent Leads
              </h2>
              {leads.length > 0 && (
                <Link href="/dashboard/leads" className="text-sm font-medium text-[#ff6c00] hover:underline">
                  View all
                </Link>
              )}
            </div>
            {leads.length === 0 ? (
              <p className="text-sm text-slate-500">No leads received yet. Complete your profile to attract buyers.</p>
            ) : (
              <ul className="space-y-3">
                {leads.slice(0, 6).map((lead, index) => (
                  <li key={getLeadKey(lead, index)} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{lead.name}</p>
                        <p className="text-sm text-slate-600">{lead.mobile}</p>
                        {getLeadBusinessName(lead) && (
                          <p className="text-xs text-[#e86200]">{getLeadBusinessName(lead)}</p>
                        )}
                        {lead.message && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{lead.message}</p>
                        )}
                      </div>
                      <Badge variant="outline">{lead.status || "new"}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
