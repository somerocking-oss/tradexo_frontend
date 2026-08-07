"use client";

import { CheckCircle2 } from "lucide-react";
import { RegistrationStepper } from "@/components/register/RegistrationStepper";
type StepItem = { id: number; title: string; short: string };

function CircularProgress({ percent }: { percent: number }) {
  const size = 80;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ff6c00"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold text-[#ff6c00]">{percent}%</span>
        <span className="text-[9px] font-medium text-[#999]">Completed</span>
      </div>
    </div>
  );
}

export function RegisterProgressPanel({
  step,
  progressPct,
  visibleSteps,
}: {
  step: number;
  progressPct: number;
  visibleSteps: StepItem[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-400 bg-white p-5 shadow-sm">
      <p className="text-center text-sm font-bold text-[#111]">Your Progress</p>
      <div className="my-4">
        <CircularProgress percent={progressPct} />
      </div>
      <RegistrationStepper currentStep={step} steps={visibleSteps} layout="vertical" />
      <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-neutral-400 pt-4 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        Auto Saved
      </div>
    </div>
  );
}
