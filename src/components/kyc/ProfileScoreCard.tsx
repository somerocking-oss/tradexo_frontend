"use client";

import type { ProfileCompletion } from "@/types";

interface ProfileScoreCardProps {
  completion?: ProfileCompletion;
}

export function ProfileScoreCard({ completion }: ProfileScoreCardProps) {
  const percent = completion?.percent ?? 0;
  const sections = completion?.sections ?? [];

  const ringStyle = {
    background: `conic-gradient(#0ea5e9 ${percent * 3.6}deg, #e2e8f0 0deg)`,
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-2" style={ringStyle}>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
            <span className="text-3xl font-bold text-[#e86200]">{percent}%</span>
            <span className="text-xs text-slate-500">Profile Score</span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <h2 className="text-lg font-semibold text-slate-900">KYC & Profile Completion</h2>
          <p className="mt-1 text-sm text-slate-600">
            Complete your profile to improve trust, visibility, and lead quality.
          </p>

          <div className="mt-5 space-y-3">
            {sections.map((section) => (
              <div key={section.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{section.label}</span>
                  <span className="text-slate-500">
                    {section.earned}/{section.weight}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ff6c00] to-[#f0f0f0]0 transition-all"
                    style={{ width: `${section.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
