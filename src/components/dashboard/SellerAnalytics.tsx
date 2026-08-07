"use client";

import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { exportLeadsToCsv } from "@/lib/export-csv";
import type { Business, Lead } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  new: "#f59e0b",
  viewed: "#0284c7",
  contacted: "#8b5cf6",
  qualified: "#6366f1",
  quoted: "#06b6d4",
  converted: "#059669",
  closed: "#64748b",
};

function groupLeadsByStatus(leads: Lead[]) {
  const counts: Record<string, number> = {};
  for (const lead of leads) {
    const status = lead.status || "new";
    counts[status] = (counts[status] || 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: STATUS_COLORS[name] || "#94a3b8",
  }));
}

function groupLeadsByWeek(leads: Lead[]) {
  const weeks: Record<string, number> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    weeks[key] = 0;
  }

  for (const lead of leads) {
    if (!lead.createdAt) continue;
    const d = new Date(lead.createdAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 35) continue;
    const weekIndex = Math.floor(diffDays / 7);
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - weekIndex * 7);
    const key = weekDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (key in weeks) weeks[key] += 1;
  }

  return Object.entries(weeks).map(([week, leads]) => ({ week, leads }));
}

function avgProfileScore(businesses: Business[]) {
  const scores = businesses
    .map((b) => b.profileCompletionPercent)
    .filter((s): s is number => typeof s === "number");
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function SellerAnalytics({
  leads,
  businesses,
}: {
  leads: Lead[];
  businesses: Business[];
}) {
  const statusData = groupLeadsByStatus(leads);
  const weeklyData = groupLeadsByWeek(leads);
  const conversionRate =
    leads.length > 0
      ? Math.round((leads.filter((l) => l.status === "converted").length / leads.length) * 100)
      : 0;
  const profileAvg = avgProfileScore(businesses);

  if (!leads.length && !businesses.length) return null;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Analytics</h2>
        {leads.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => exportLeadsToCsv(leads)}>
            <Download className="h-3.5 w-3.5" /> Export Leads CSV
          </Button>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardBody>
          <h3 className="mb-1 font-semibold text-slate-900">Lead Trend (Last 6 Weeks)</h3>
          <p className="mb-4 text-xs text-slate-500">Enquiries received over time</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="leads" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h3 className="mb-1 font-semibold text-slate-900">Lead Pipeline</h3>
          <p className="mb-2 text-xs text-slate-500">Status breakdown</p>
          {statusData.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No leads yet</p>
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {statusData.map((s) => (
                  <span key={s.name} className="flex items-center gap-1 text-xs text-slate-600">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.fill }} />
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="text-center">
          <p className="text-sm text-slate-500">Conversion Rate</p>
          <p className="mt-1 text-4xl font-bold text-emerald-600">{conversionRate}%</p>
          <p className="mt-1 text-xs text-slate-400">Leads marked converted</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="text-center">
          <p className="text-sm text-slate-500">Avg Profile Score</p>
          <p className="mt-1 text-4xl font-bold text-[#ff6c00]">{profileAvg}%</p>
          <p className="mt-1 text-xs text-slate-400">Across {businesses.length} listing(s)</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="text-center">
          <p className="text-sm text-slate-500">Active Listings</p>
          <p className="mt-1 text-4xl font-bold text-violet-600">
            {businesses.filter((b) => b.status === "active").length}
          </p>
          <p className="mt-1 text-xs text-slate-400">of {businesses.length} total</p>
        </CardBody>
      </Card>
      </div>
    </div>
  );
}
