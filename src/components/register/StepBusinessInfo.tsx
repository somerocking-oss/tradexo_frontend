"use client";

import type { BusinessRegistrationDraft } from "@/lib/business-registration";
import { MOQ_UNITS } from "@/lib/business-registration";
import { CategorySubcategoryFields } from "@/components/categories/CategorySubcategoryFields";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types";
import { PackageOpen } from "lucide-react";

interface Props {
  draft: BusinessRegistrationDraft;
  categories: Category[];
  onChange: (patch: Partial<BusinessRegistrationDraft>) => void;
}

export function StepBusinessInfo({ draft, categories, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-neutral-900">
            Business Name <span className="text-[#DC2626]">*</span>
          </label>
          <Input
            placeholder="e.g. Sharma Electricals"
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-900">
            Contact Person <span className="text-[#DC2626]">*</span>
          </label>
          <Input
            placeholder="Owner / manager name"
            value={draft.contactPerson}
            onChange={(e) => onChange({ contactPerson: e.target.value })}
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-900">
            Year Established{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <Input
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            placeholder="e.g. 2015"
            value={draft.establishmentYear}
            onChange={(e) => onChange({ establishmentYear: e.target.value })}
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
          />
        </div>

        <div className="sm:col-span-2">
          <CategorySubcategoryFields
            categories={categories}
            categoryId={draft.primaryCategory}
            subCategoryId={draft.primarySubCategory}
            onCategoryChange={(primaryCategory) => onChange({ primaryCategory, primarySubCategory: "" })}
            onSubCategoryChange={(primarySubCategory) => onChange({ primarySubCategory })}
          />
        </div>
      </div>

      {draft.providerType === "product" && (
        <div className="rounded-xl border border-[#E5E5E5] bg-[#F0F0F0] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FF6C00]/10">
              <PackageOpen className="h-5 w-5 text-[#FF6C00]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-neutral-900">
                Minimum Order Quantity (MOQ)
              </h3>
              <p className="mt-0.5 text-sm text-neutral-600">
                What is the minimum order you accept per buyer inquiry?
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-900">
                Minimum Quantity <span className="text-[#DC2626]">*</span>
              </label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 100"
                value={draft.minimumOrderQuantity}
                onChange={(e) => onChange({ minimumOrderQuantity: e.target.value })}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-900">
                Unit <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <select
                  value={draft.moqUnit}
                  onChange={(e) => onChange({ moqUnit: e.target.value })}
                  className="h-10 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 pr-8 text-sm text-neutral-900 transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
                >
                  {MOQ_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
