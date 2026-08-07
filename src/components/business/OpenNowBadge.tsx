"use client";

import { useEffect, useState } from "react";
import { getOpenStatusLabel } from "@/lib/business-hours";
import { Badge } from "@/components/ui/badge";
import type { Business } from "@/types";

export function OpenNowBadge({ business }: { business: Business }) {
  const [status, setStatus] = useState<"open" | "closed" | "unknown" | null>(null);

  useEffect(() => {
    setStatus(getOpenStatusLabel(business));
  }, [business]);

  if (!status || status === "unknown") return null;

  if (status === "open") {
    return (
      <Badge variant="success" className="gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Open Now
      </Badge>
    );
  }

  return <Badge variant="outline" className="text-slate-500">Closed</Badge>;
}
