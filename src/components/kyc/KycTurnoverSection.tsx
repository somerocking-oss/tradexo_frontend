"use client";

import { IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TURNOVER_RANGES, formatTurnoverLabel } from "@/lib/api/kyc";

interface KycTurnoverSectionProps {
  annualTurnover?: number;
  turnoverCurrency?: string;
  turnoverYear?: number;
  onChange: (patch: {
    annualTurnover?: number;
    turnoverCurrency?: string;
    turnoverYear?: number;
  }) => void;
  onSave?: () => void;
  saving?: boolean;
}

export function KycTurnoverSection({
  annualTurnover,
  turnoverCurrency = "INR",
  turnoverYear,
  onChange,
  onSave,
  saving,
}: KycTurnoverSectionProps) {
  const currentYear = new Date().getFullYear();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
            Business Turnover
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Select your annual turnover range and financial year. This improves B2B trust and profile score.
          </p>
          {annualTurnover ? (
            <p className="mt-2 text-sm font-medium text-emerald-700">
              Current: {formatTurnoverLabel(annualTurnover)}
              {turnoverYear ? ` · FY ${turnoverYear}` : ""}
            </p>
          ) : (
            <p className="mt-2 text-sm text-amber-700">Turnover not set yet</p>
          )}
        </div>
        {onSave && (
          <Button type="button" size="sm" onClick={onSave} loading={saving}>
            Save Turnover
          </Button>
        )}
      </div>

      <div className="rounded-xl bg-[#e8e8e8] px-4 py-3 text-sm text-[#cc5500]">
        <strong>How to update:</strong> Choose a turnover range below → set financial year → click{" "}
        <strong>Save Turnover</strong>.
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-600">Annual Turnover Range *</span>
          <select
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
            value={annualTurnover || ""}
            onChange={(e) =>
              onChange({ annualTurnover: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Select turnover range</option>
            {TURNOVER_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Exact Amount (optional)</span>
          <Input
            type="number"
            min={0}
            value={annualTurnover || ""}
            onChange={(e) =>
              onChange({ annualTurnover: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="Custom amount in INR"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Financial Year</span>
          <Input
            type="number"
            min={2000}
            max={currentYear}
            value={turnoverYear || currentYear}
            onChange={(e) =>
              onChange({ turnoverYear: e.target.value ? Number(e.target.value) : currentYear })
            }
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Currency</span>
          <select
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
            value={turnoverCurrency}
            onChange={(e) => onChange({ turnoverCurrency: e.target.value })}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
          </select>
        </label>
      </div>
    </section>
  );
}
