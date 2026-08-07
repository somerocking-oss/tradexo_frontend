"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { REGISTRATION_STEPS } from "@/lib/business-registration";

type StepItem = { id: number; title: string; short: string };

export function RegistrationStepper({
  currentStep,
  steps = REGISTRATION_STEPS as unknown as StepItem[],
  layout = "horizontal",
}: {
  currentStep: number;
  steps?: StepItem[];
  layout?: "horizontal" | "vertical";
}) {
  if (layout === "vertical") {
    return (
      <ol className="relative space-y-0">
        {steps.map((step, index) => {
          const visualNum = index + 1;
          const done = currentStep > visualNum;
          const active = currentStep === visualNum;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
              {/* Connector line */}
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[17px] top-9 h-[calc(100%-4px)] w-0.5 transition-colors duration-300",
                    done ? "bg-[#FF6C00]" : "bg-neutral-200"
                  )}
                  aria-hidden
                />
              )}

              {/* Step circle */}
              <div
                className={cn(
                  "relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200",
                  done &&
                    "border-[#FF6C00] bg-[#FF6C00] text-white shadow-sm shadow-[#FF6C00]/25",
                  active &&
                    !done &&
                    "border-[#FF6C00] bg-[#FF6C00] text-white shadow-md shadow-[#FF6C00]/30",
                  !done && !active && "border-neutral-200 bg-white text-neutral-400"
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <span>{visualNum}</span>
                )}
              </div>

              {/* Label */}
              <div className={cn("min-w-0 pt-1.5", !active && !done && "opacity-50")}>
                <p
                  className={cn(
                    "text-sm font-semibold leading-tight transition-colors",
                    active ? "text-[#FF6C00]" : done ? "text-neutral-900" : "text-neutral-400"
                  )}
                >
                  {step.title}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  /* Horizontal layout */
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const visualNum = index + 1;
          const done = currentStep > visualNum;
          const active = currentStep === visualNum;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex flex-1 items-center last:flex-none">
              {/* Circle */}
              <div
                className={cn(
                  "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 sm:h-9 sm:w-9",
                  done &&
                    "border-[#FF6C00] bg-[#FF6C00] text-white shadow-sm shadow-[#FF6C00]/25",
                  active &&
                    !done &&
                    "border-[#FF6C00] bg-[#FF6C00] text-white shadow-md shadow-[#FF6C00]/30",
                  !done && !active && "border-neutral-200 bg-white text-neutral-400"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <span>{visualNum}</span>
                )}
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="mx-1 h-0.5 flex-1 overflow-hidden rounded-full bg-neutral-200 sm:mx-1.5">
                  <div
                    className={cn(
                      "h-full rounded-full bg-[#FF6C00] transition-all duration-500",
                      done ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current step label */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        <span className="text-sm font-semibold text-neutral-900">
          {steps[currentStep - 1]?.title}
        </span>
        <span className="text-sm text-neutral-400">
          &middot; Step {currentStep} of {steps.length}
        </span>
      </div>
    </div>
  );
}
