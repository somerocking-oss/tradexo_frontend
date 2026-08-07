"use client";

import { cn } from "@/lib/utils";
import type { BusinessRegistrationDraft, ProductRole } from "@/lib/business-registration";
import {
  Factory,
  Info,
  Store,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  draft: BusinessRegistrationDraft;
  onChange: (patch: Partial<BusinessRegistrationDraft>) => void;
}

type BusinessTypeId = "manufacturer" | "wholesaler" | "distributor" | "retailer" | "service";

const BUSINESS_TYPES: {
  id: BusinessTypeId;
  label: string;
  description: string;
  tag?: string;
  icon: LucideIcon;
  providerType: "product" | "service";
  productRole: ProductRole | "";
}[] = [
  {
    id: "manufacturer",
    label: "Manufacturer",
    description: "Produce goods at scale",
    tag: "Most Popular",
    icon: Factory,
    providerType: "product",
    productRole: "manufacturer",
  },
  {
    id: "wholesaler",
    label: "Wholesaler",
    description: "Sell in bulk to dealers",
    icon: Warehouse,
    providerType: "product",
    productRole: "wholesaler",
  },
  {
    id: "distributor",
    label: "Distributor",
    description: "Distribute brands regionally",
    icon: Truck,
    providerType: "product",
    productRole: "distributor",
  },
  {
    id: "retailer",
    label: "Retailer",
    description: "Sell directly to customers",
    icon: Store,
    providerType: "product",
    productRole: "b2b_supplier",
  },
  {
    id: "service",
    label: "Service Provider",
    description: "Offer local or professional services",
    icon: Wrench,
    providerType: "service",
    productRole: "",
  },
];

function getSelectedId(draft: BusinessRegistrationDraft): BusinessTypeId | null {
  if (draft.providerType === "service") return "service";
  if (draft.providerType === "product") {
    const match = BUSINESS_TYPES.find(
      (t) => t.providerType === "product" && t.productRole === draft.productRole
    );
    return match?.id ?? null;
  }
  return null;
}

export function StepBusinessType({ draft, onChange }: Props) {
  const selected = getSelectedId(draft);

  const selectType = (type: (typeof BUSINESS_TYPES)[number]) => {
    if (type.providerType === "service") {
      onChange({
        providerType: "service",
        productRole: "",
        minimumOrderQuantity: "",
      });
      return;
    }
    onChange({
      providerType: "product",
      productRole: type.productRole as ProductRole,
    });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[#666]">
        Choose whether you sell products or offer services
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {BUSINESS_TYPES.map((type) => {
          const active = selected === type.id;
          const Icon = type.icon;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => selectType(type)}
              className={cn(
                "group relative flex flex-col items-center rounded-2xl border-2 px-3 py-5 text-center transition-all duration-200",
                active
                  ? "border-[#ff6c00] bg-[#f0f0f0] shadow-md shadow-[#ff6c00]/10"
                  : "border-[#e8e8e8] bg-white hover:border-[#d4d4d4] hover:shadow-sm"
              )}
            >
              {type.tag && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#ff6c00] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  {type.tag}
                </span>
              )}

              {active && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6c00] text-[10px] font-bold text-white">
                  ✓
                </span>
              )}

              <span
                className={cn(
                  "mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                  active
                    ? "bg-[#ff6c00] text-white"
                    : "bg-[#e8e8e8] text-[#ff6c00] group-hover:bg-[#ffe8d4]"
                )}
              >
                <Icon className="h-7 w-7" strokeWidth={1.75} />
              </span>

              <h3 className="text-sm font-bold text-[#111]">{type.label}</h3>
              <p className="mt-1 text-[11px] leading-snug text-[#888]">{type.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
        <p className="text-sm text-blue-800">
          <strong>Not sure?</strong> You can change this anytime later.
        </p>
      </div>
    </div>
  );
}
