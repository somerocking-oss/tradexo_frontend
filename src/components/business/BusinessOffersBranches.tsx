"use client";

import { useEffect, useState } from "react";
import { MapPin, Tag } from "lucide-react";
import { extractBranchList, getBusinessBranches, type BusinessBranch } from "@/lib/api/branches";
import { extractOfferList, getBusinessOffers, type BusinessOffer } from "@/lib/api/offers";

export function BusinessOffersBranches({ businessId }: { businessId: string }) {
  const [offers, setOffers] = useState<BusinessOffer[]>([]);
  const [branches, setBranches] = useState<BusinessBranch[]>([]);

  useEffect(() => {
    Promise.all([getBusinessOffers(businessId), getBusinessBranches(businessId)]).then(
      ([offersRes, branchesRes]) => {
        if (offersRes.success && offersRes.data) setOffers(extractOfferList(offersRes.data));
        if (branchesRes.success && branchesRes.data) setBranches(extractBranchList(branchesRes.data));
      }
    );
  }, [businessId]);

  if (!offers.length && !branches.length) return null;

  return (
    <div className="space-y-8">
      {offers.length > 0 && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Tag className="h-5 w-5 text-emerald-600" /> Active Offers
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {offers.map((offer) => (
              <div key={offer._id} className="rounded-xl border border-emerald-100 bg-white p-4">
                <p className="font-semibold text-slate-900">{offer.title}</p>
                {offer.discount && (
                  <p className="mt-1 text-sm font-medium text-emerald-700">{String(offer.discount)}</p>
                )}
                {offer.description && (
                  <p className="mt-2 text-sm text-slate-600">{offer.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {branches.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MapPin className="h-5 w-5 text-[#ff6c00]" /> Other Locations
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {branches.map((branch) => (
              <div key={branch._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{branch.name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {[branch.area, branch.city].filter(Boolean).join(", ")}
                </p>
                {branch.mobile && <p className="mt-1 text-sm text-slate-500">{branch.mobile}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
