"use client";

import type { BusinessRegistrationDraft } from "@/lib/business-registration";
import { SITE_NAME } from "@/lib/constants";
import type { Category } from "@/types";

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function RegistrationSeoPreview({
  draft,
  categories = [],
}: {
  draft: BusinessRegistrationDraft;
  categories?: Category[];
}) {
  const name = draft.name?.trim();
  const city = draft.city?.trim();
  const category = categories.find((item) => item._id === draft.primaryCategory)?.name;

  if (!name && !city && !category) return null;

  const title = city
    ? `${name || category || "Business"} in ${titleCase(city)}`
    : name || category || "Your Business";

  const description = [
    name ? `${name}` : "Your business",
    category ? ` — ${category}` : "",
    city ? ` in ${titleCase(city)}` : "",
    `. Find contact details, reviews and get quotes on ${SITE_NAME}.`,
  ].join("");

  return (
    <div className="rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[#ff6c00]">
        Google search preview
      </p>
      <p className="mt-3 truncate text-base font-normal text-[#1a0dab] sm:text-lg">
        {title} | {SITE_NAME}
      </p>
      <p className="text-xs text-[#006621] sm:text-sm">tradexo.com/business/your-listing</p>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#545454]">{description}</p>
      <p className="mt-2.5 text-[11px] text-[#999]">
        Title {title.length}/60 · Description {Math.min(description.length, 160)}/160
      </p>
    </div>
  );
}
