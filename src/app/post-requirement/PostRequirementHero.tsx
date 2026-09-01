"use client";

import { FileText, CheckCircle } from "lucide-react";

const STEPS = [
  { label: "Fill requirement", hint: "Describe what you need" },
  { label: "Get quotes", hint: "Suppliers respond within 24h" },
  { label: "Compare & choose", hint: "Pick the best deal" },
];

export function PostRequirementHero() {
  return (
    <div className="border-b border-neutral-100 bg-white px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-8xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-semibold text-[#FF6C00]">
            <FileText className="h-3.5 w-3.5" aria-hidden />
            Post RFQ
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#16A34A]">
            <CheckCircle className="h-3.5 w-3.5" aria-hidden />
            No login required
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Post Your Buying Requirement
        </h1>
        <p className="mt-3 max-w-2xl text-base text-neutral-600">
          Tell us what you need — verified suppliers in your city will send free quotes via call or WhatsApp.
        </p>

        <div className="mt-8 flex flex-wrap gap-6 sm:gap-10">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF6C00] text-sm font-bold text-white shadow-sm">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-800">{step.label}</p>
                <p className="text-xs text-neutral-400">{step.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
