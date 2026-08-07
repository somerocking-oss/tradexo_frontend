"use client";

import { useEffect, useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getActiveSubscription, type ActiveSubscription } from "@/lib/api/subscription";

export function LeadCreditsCard({ businessId }: { businessId: string }) {
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getActiveSubscription(businessId)
      .then((res) => {
        if (res.success && res.data) setSubscription(res.data);
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (!subscription) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardBody className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">No active plan — upgrade to start receiving leads.</p>
          <Button href="/plans" size="sm">View Plans</Button>
        </CardBody>
      </Card>
    );
  }

  const maxLeads = subscription.limits?.maxLeads ?? 0;
  const leadsUsed = subscription.usage?.leadsUsed ?? 0;
  const leadsLeft = subscription.usage?.leadsLeft ?? 0;
  const isUnlimited = maxLeads === -1;
  const usedPercent = isUnlimited || maxLeads <= 0 ? 0 : Math.min(100, Math.round((leadsUsed / maxLeads) * 100));
  const isLow = !isUnlimited && maxLeads > 0 && leadsLeft <= Math.max(1, Math.round(maxLeads * 0.1));
  const renewalDate = subscription.endDate
    ? new Date(subscription.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <Card className={isLow ? "border-amber-300" : undefined}>
      <CardBody className="py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8e8e8] text-[#ff6c00]">
              <Zap className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {subscription.planName || subscription.plan || "Plan"} — Lead Credits
              </p>
              {renewalDate && (
                <p className="text-xs text-slate-500">Renews on {renewalDate}</p>
              )}
            </div>
          </div>
          <Button href="/plans" size="sm" variant={isLow ? "primary" : "outline"} className="gap-1.5 shrink-0">
            <Sparkles className="h-3.5 w-3.5" /> Get More
          </Button>
        </div>

        {isUnlimited ? (
          <p className="mt-4 text-sm font-semibold text-emerald-700">Unlimited leads on this plan</p>
        ) : (
          <>
            <div className="mt-4 flex items-baseline justify-between text-sm">
              <span className="font-bold text-slate-900">{leadsLeft} credits left</span>
              <span className="text-slate-500">{leadsUsed} / {maxLeads} used this cycle</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${isLow ? "bg-amber-500" : "bg-[#ff6c00]"}`}
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            {isLow && (
              <p className="mt-2 text-xs font-medium text-amber-700">
                Running low — upgrade or top up to keep receiving leads without interruption.
              </p>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
