import { TrendingUp, TrendingDown, Minus, Award } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import type { Business } from "@/types";

function ComparisonRow({
  label,
  mine,
  peer,
  format,
  lowerIsBetter,
}: {
  label: string;
  mine: number;
  peer: number;
  format: (v: number) => string;
  lowerIsBetter?: boolean;
}) {
  const diff = mine - peer;
  const isBetter = lowerIsBetter ? diff < 0 : diff > 0;
  const isEqual = Math.abs(diff) < 0.05;
  const Icon = isEqual ? Minus : isBetter ? TrendingUp : TrendingDown;
  const colorClass = isEqual
    ? "text-slate-500"
    : isBetter
      ? "text-emerald-600"
      : "text-amber-600";

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-500">You: {format(mine)} · Category avg: {format(peer)}</p>
      </div>
      <span className={`flex items-center gap-1 text-xs font-semibold ${colorClass}`}>
        <Icon className="h-3.5 w-3.5" />
        {isEqual ? "On par" : isBetter ? "Better" : "Below avg"}
      </span>
    </div>
  );
}

function formatHours(hours: number) {
  if (hours < 1) return "< 1h";
  if (hours <= 24) return `~${Math.round(hours)}h`;
  return `~${Math.round(hours / 24)}d`;
}

function formatPercent(v: number) {
  return `${Math.round(v)}%`;
}

export function MarketInsightCard({ businesses }: { businesses: Business[] }) {
  const eligible = businesses.filter((b) => (b.categoryPeerCount || 0) >= 3);

  if (!eligible.length) return null;

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Market Insights</h2>
        <p className="text-sm text-slate-500">How you compare against category peers in your city</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {eligible.map((business) => (
          <Card key={business._id}>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    #{business.categoryRank} of {business.categoryPeerCount}
                  </p>
                  <p className="text-sm text-slate-600">
                    {business.name} — ranked in {business.city || "your city"}
                  </p>
                </div>
              </div>

              <div className="mt-3 divide-y divide-slate-100">
                {business.avgResponseHours != null && business.categoryAvgResponseHours != null && (
                  <ComparisonRow
                    label="Response Time"
                    mine={business.avgResponseHours}
                    peer={business.categoryAvgResponseHours}
                    format={formatHours}
                    lowerIsBetter
                  />
                )}
                {business.responseRate != null && business.categoryAvgResponseRate != null && (
                  <ComparisonRow
                    label="Response Rate"
                    mine={business.responseRate}
                    peer={business.categoryAvgResponseRate}
                    format={formatPercent}
                  />
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
