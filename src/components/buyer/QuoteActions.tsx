"use client";

import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QuoteActionsProps {
  businessId?: string;
  buyerResponse?: "accepted" | "rejected" | string;
  loading?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  compact?: boolean;
}

export function QuoteActions({
  businessId,
  buyerResponse,
  loading,
  onAccept,
  onReject,
  compact,
}: QuoteActionsProps) {
  if (!businessId) return null;

  if (buyerResponse === "accepted") {
    return <Badge variant="success">Accepted</Badge>;
  }

  if (buyerResponse === "rejected") {
    return <Badge variant="outline" className="text-slate-500">Declined</Badge>;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-3"}`}>
      <Button
        size="sm"
        loading={loading}
        onClick={onAccept}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Check className="h-3.5 w-3.5" /> Accept
      </Button>
      <Button size="sm" variant="outline" loading={loading} onClick={onReject}>
        <X className="h-3.5 w-3.5" /> Decline
      </Button>
    </div>
  );
}
