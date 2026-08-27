"use client";

import Image from "next/image";
import { MapPin, Phone, MessageCircle, FileText } from "lucide-react";
import { PRODUCT_ROLES, type BusinessRegistrationDraft } from "@/lib/business-registration";
import type { Category } from "@/types";

interface Props {
  draft: BusinessRegistrationDraft;
  categories: Category[];
  banner: File | null;
}

/** A read-only rendering of how the listing will look once published — the
 *  last checkpoint before the actual createBusiness() call fires (see
 *  RegisterBusinessForm's "Publish Listing" action). Built from in-memory
 *  draft state, not a real Business record, so it can't reuse the live
 *  profile-page components (those expect a persisted _id/slug). */
export function StepPreview({ draft, categories, banner }: Props) {
  const categoryName = categories.find((c) => c._id === draft.primaryCategory)?.name;
  const productRoleLabel = PRODUCT_ROLES.find((r) => r.value === draft.productRole)?.label;
  const locationLabel = [draft.area, draft.city, draft.state].filter(Boolean).join(", ");

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        This is how your listing will look once published. Buyers will be able to call, WhatsApp,
        or request a quote directly from this page.
      </p>

      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative h-40 w-full bg-slate-100 sm:h-52">
          {banner ? (
            <Image src={URL.createObjectURL(banner)} alt="" fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No banner photo added
            </div>
          )}
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{draft.name || "Your Business Name"}</h3>
            <p className="mt-1 text-sm text-slate-600">
              {[categoryName, productRoleLabel].filter(Boolean).join(" · ") || "Category not selected"}
            </p>
            {locationLabel && (
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#ff6c00]" />
                {locationLabel}
              </p>
            )}
          </div>

          {draft.shortDescription && (
            <p className="text-sm leading-relaxed text-slate-700">{draft.shortDescription}</p>
          )}

          {draft.description && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">About</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {draft.description}
              </p>
            </div>
          )}

          {draft.products.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Products & Services ({draft.products.length})
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {draft.products.slice(0, 6).map((product, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {product.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <Phone className="h-3.5 w-3.5" /> Call
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              <FileText className="h-3.5 w-3.5" /> Get Quote
            </span>
            <span className="ml-auto self-center text-xs text-slate-400">Live after publish</span>
          </div>
        </div>
      </div>
    </div>
  );
}
