"use client";

import { useEffect, useState, type ComponentType } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Eye,
  MessageCircle,
  Phone,
  Search,
  Share2,
  Globe,
  Navigation,
  BarChart2,
  Clock,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Card, CardBody } from "@/components/ui/card";
import { getMyEngagementStats, type SellerEngagementData } from "@/lib/api/analytics";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  suffix,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
  suffix?: string;
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">
            {value}
            {suffix || null}
          </p>
          <p className="text-sm text-slate-600">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export function SellerEngagementStats() {
  const [data, setData] = useState<SellerEngagementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEngagementStats(30)
      .then((res) => {
        if (res.success && res.data) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Loading engagement stats...
      </div>
    );
  }

  if (!data) return null;

  const { totals, byBusiness, daily } = data;
  const hasActivity =
    totals.profileViews +
      totals.calls +
      totals.whatsapp +
      totals.leads +
      totals.searchAppearances +
      totals.impressions >
    0;

  if (!hasActivity) return null;

  const responseHours = totals.avgResponseHours;
  const responseTimeLabel =
    responseHours == null
      ? null
      : responseHours < 1
        ? "< 1 hour"
        : responseHours <= 24
          ? `~${Math.round(responseHours)}h`
          : `~${Math.round(responseHours / 24)}d`;

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Listing Engagement</h2>
        <p className="text-sm text-slate-500">Last {data.days} days — views, calls & WhatsApp from real visitors</p>
      </div>

      {(responseTimeLabel || totals.responseRate != null) && (
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          {responseTimeLabel && (
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{responseTimeLabel}</p>
                  <p className="text-sm text-slate-600">Average Response Time — shown to buyers on your listing</p>
                </div>
              </CardBody>
            </Card>
          )}
          {totals.responseRate != null && (
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{totals.responseRate}%</p>
                  <p className="text-sm text-slate-600">Queries Answered — % of leads you&apos;ve responded to</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Listing Impressions" value={totals.impressions} icon={BarChart2} color="text-fuchsia-600 bg-fuchsia-50" />
        <StatCard label="Profile Views" value={totals.profileViews} icon={Eye} color="text-[#ff6c00] bg-[#e8e8e8]" />
        <StatCard label="Click-through Rate" value={totals.ctr} icon={BarChart2} color="text-[#ff6c00] bg-[#e8e8e8]" suffix="%" />
        <StatCard label="Call Clicks" value={totals.calls} icon={Phone} color="text-emerald-600 bg-emerald-50" />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="WhatsApp" value={totals.whatsapp} icon={FaWhatsapp} color="text-green-600 bg-green-50" />
        <StatCard label="Search Appearances" value={totals.searchAppearances} icon={Search} color="text-violet-600 bg-violet-50" />
        <StatCard label="Website Clicks" value={totals.website} icon={Globe} color="text-[#ff6c00] bg-[#e8e8e8]" />
        <StatCard label="Leads Received" value={totals.leads} icon={MessageCircle} color="text-orange-600 bg-orange-50" />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Directions" value={totals.directions} icon={Navigation} color="text-[#ff6c00] bg-[#e8e8e8]" />
        <StatCard label="Shares" value={totals.shares} icon={Share2} color="text-amber-600 bg-amber-50" />
        <StatCard label="Call Intents Logged" value={totals.callIntents} icon={Phone} color="text-slate-600 bg-slate-50" />
      </div>

      {daily.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <h3 className="mb-1 font-semibold text-slate-900">Daily Clicks</h3>
            <p className="mb-4 text-xs text-slate-500">All interaction clicks over time</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    stroke="#94a3b8"
                    tickFormatter={(value) => String(value).slice(5)}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="clicks" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      )}

      {byBusiness.length > 1 && (
        <Card>
          <CardBody>
            <h3 className="mb-4 font-semibold text-slate-900">Per Business Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="pb-2 pr-4">Business</th>
                    <th className="pb-2 pr-4">Views</th>
                    <th className="pb-2 pr-4">Impressions</th>
                    <th className="pb-2 pr-4">CTR</th>
                    <th className="pb-2 pr-4">Calls</th>
                    <th className="pb-2 pr-4">WhatsApp</th>
                    <th className="pb-2">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {byBusiness.map((row) => (
                    <tr key={String(row.businessId)} className="border-t border-slate-100">
                      <td className="py-2 pr-4 font-medium">{row.name}</td>
                      <td className="py-2 pr-4">{row.profileViews}</td>
                      <td className="py-2 pr-4">{row.impressions ?? 0}</td>
                      <td className="py-2 pr-4">{row.ctr ?? 0}%</td>
                      <td className="py-2 pr-4">{row.calls}</td>
                      <td className="py-2 pr-4">{row.whatsapp}</td>
                      <td className="py-2">{row.leads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
