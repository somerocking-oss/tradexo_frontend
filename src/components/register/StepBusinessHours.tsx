"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WEEKDAYS,
  type BusinessRegistrationDraft,
  type DayKey,
  type DaySchedule,
} from "@/lib/business-registration";

interface Props {
  draft: BusinessRegistrationDraft;
  onChange: (patch: Partial<BusinessRegistrationDraft>) => void;
}

function TimeInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#ff6c00] disabled:bg-slate-100"
      />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#ff6c00]"
      />
      <div>
        <span className="font-medium text-slate-900">{label}</span>
        {description && <p className="mt-0.5 text-sm text-slate-600">{description}</p>}
      </div>
    </label>
  );
}

export function StepBusinessHours({ draft, onChange }: Props) {
  const updateDay = (day: DayKey, patch: Partial<DaySchedule>) => {
    onChange({
      weeklySchedule: {
        ...draft.weeklySchedule,
        [day]: { ...draft.weeklySchedule[day], ...patch },
      },
    });
  };

  const applyToAllDays = (open: string, close: string) => {
    const next = { ...draft.weeklySchedule };
    WEEKDAYS.forEach(({ key }) => {
      next[key] = {
        ...next[key],
        open,
        close,
        isClosed: false,
        is24Hours: false,
      };
    });
    onChange({ weeklySchedule: next, defaultOpen: open, defaultClose: close });
  };

  return (
    <div className="space-y-6">
      <Toggle
        checked={draft.open24Hours}
        onChange={(open24Hours) => onChange({ open24Hours })}
        label="Open 24 hours"
        description="Business is available round the clock, all days"
      />

      {!draft.open24Hours && (
        <>
          <Toggle
            checked={draft.sameForAllDays}
            onChange={(sameForAllDays) => onChange({ sameForAllDays })}
            label="Same timing for all days"
            description="Use one schedule for Monday through Sunday"
          />

          {draft.sameForAllDays ? (
            <div className="rounded-2xl border border-[#e8e8e8] bg-[#e8e8e8]/50 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#e86200]">
                <Clock className="h-4 w-4" />
                Daily schedule (Mon – Sun)
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TimeInput
                  label="Opens at"
                  value={draft.defaultOpen}
                  onChange={(defaultOpen) => {
                    onChange({ defaultOpen });
                    applyToAllDays(defaultOpen, draft.defaultClose);
                  }}
                />
                <TimeInput
                  label="Closes at"
                  value={draft.defaultClose}
                  onChange={(defaultClose) => {
                    onChange({ defaultClose });
                    applyToAllDays(draft.defaultOpen, defaultClose);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Set hours for each day</p>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {WEEKDAYS.map(({ key, label, short }, index) => {
                  const day = draft.weeklySchedule[key];
                  return (
                    <div
                      key={key}
                      className={cn(
                        "grid grid-cols-[4rem_1fr] items-center gap-3 px-4 py-3 sm:grid-cols-[6rem_1fr_auto]",
                        index > 0 && "border-t border-slate-100"
                      )}
                    >
                      <span className="text-sm font-semibold text-slate-800">
                        <span className="sm:hidden">{short}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </span>

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={day.isClosed}
                            onChange={(e) =>
                              updateDay(key, { isClosed: e.target.checked, is24Hours: false })
                            }
                          />
                          Closed
                        </label>
                        {!day.isClosed && (
                          <label className="flex items-center gap-1.5 text-xs text-slate-600">
                            <input
                              type="checkbox"
                              checked={day.is24Hours}
                              onChange={(e) =>
                                updateDay(key, { is24Hours: e.target.checked })
                              }
                            />
                            24 hrs
                          </label>
                        )}
                      </div>

                      {!day.isClosed && !day.is24Hours && (
                        <div className="col-span-2 flex gap-2 sm:col-span-1">
                          <input
                            type="time"
                            value={day.open}
                            onChange={(e) => updateDay(key, { open: e.target.value })}
                            className="h-9 flex-1 rounded-lg border border-slate-300 px-2 text-xs"
                          />
                          <span className="self-center text-slate-400">–</span>
                          <input
                            type="time"
                            value={day.close}
                            onChange={(e) => updateDay(key, { close: e.target.value })}
                            className="h-9 flex-1 rounded-lg border border-slate-300 px-2 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex items-start gap-2 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Buyers see your hours on your listing. Service businesses benefit most from accurate
          timings; product suppliers can still set office hours for inquiries.
        </p>
      </div>
    </div>
  );
}
