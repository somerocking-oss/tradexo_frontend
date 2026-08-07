"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2, Search, Building2, Milestone, Map, Navigation } from "lucide-react";
import type { BusinessRegistrationDraft } from "@/lib/business-registration";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LocationPinPicker = dynamic(
  () => import("@/components/map/LocationPinPicker").then((mod) => mod.LocationPinPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 animate-pulse items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-sm text-neutral-500">
        <div className="flex flex-col items-center gap-2">
          <Map className="h-6 w-6 text-neutral-400" />
          <span>Loading map&hellip;</span>
        </div>
      </div>
    ),
  }
);

interface Props {
  draft: BusinessRegistrationDraft;
  onChange: (patch: Partial<BusinessRegistrationDraft>) => void;
}

/* Labelled field wrapper */
function FieldGroup({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-900">
        {label}
        {required && <span className="ml-0.5 text-[#DC2626]"> *</span>}
        {optional && (
          <span className="ml-1 font-normal text-neutral-400">(optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}

/* Shared styled input class */
const inputCls =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20";

const iconInputCls =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20";

export function StepLocation({ draft, onChange }: Props) {
  const [pinLoading, setPinLoading] = useState(false);

  const lookupPincode = async () => {
    if (!/^\d{6}$/.test(draft.pincode)) return;
    setPinLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${draft.pincode}`);
      const data = await res.json();
      const office = data?.[0]?.PostOffice?.[0];
      if (office) {
        onChange({
          area: office.Name || draft.area,
          city: office.District || draft.city,
          state: office.State || draft.state,
        });
      }
    } catch {
      // ignore lookup failures
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Map picker */}
      <LocationPinPicker
        latitude={draft.latitude}
        longitude={draft.longitude}
        city={draft.city}
        onChange={({ latitude, longitude }) =>
          onChange({
            latitude: String(latitude),
            longitude: String(longitude),
          })
        }
      />

      {/* GPS info tip */}
      <div className="flex items-start gap-3 rounded-xl border border-[#E5E5E5] bg-[#F0F0F0] px-4 py-3">
        <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6C00]" />
        <p className="text-sm text-[#E86200]">
          Accurate GPS pin helps your listing appear on the map and in
          &ldquo;Near Me&rdquo; search results.
        </p>
      </div>

      <div className="space-y-5">
        {/* Pincode + lookup */}
        <FieldGroup label="Pincode" optional>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <MapPin className="h-4 w-4" />
              </span>
              <Input
                placeholder="6-digit pincode"
                maxLength={6}
                inputMode="numeric"
                value={draft.pincode}
                onChange={(e) =>
                  onChange({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                }
                className={iconInputCls}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={lookupPincode}
              disabled={pinLoading || draft.pincode.length !== 6}
              className="h-10 shrink-0 rounded-lg border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pinLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="mr-1.5 h-4 w-4" />
                  Lookup
                </>
              )}
            </Button>
          </div>
        </FieldGroup>

        {/* Full address */}
        <FieldGroup label="Full Address" required>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <MapPin className="h-4 w-4" />
            </span>
            <Input
              placeholder="Shop no., street, building"
              value={draft.address}
              onChange={(e) => onChange({ address: e.target.value })}
              className={iconInputCls}
            />
          </div>
        </FieldGroup>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Building / Shop */}
          <FieldGroup label="Building / Shop" optional>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Building2 className="h-4 w-4" />
              </span>
              <Input
                placeholder="Optional"
                value={draft.building}
                onChange={(e) => onChange({ building: e.target.value })}
                className={iconInputCls}
              />
            </div>
          </FieldGroup>

          {/* Landmark */}
          <FieldGroup label="Landmark" optional>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Milestone className="h-4 w-4" />
              </span>
              <Input
                placeholder="Near metro, mall, etc."
                value={draft.landmark}
                onChange={(e) => onChange({ landmark: e.target.value })}
                className={iconInputCls}
              />
            </div>
          </FieldGroup>

          {/* Area / Locality */}
          <FieldGroup label="Area / Locality" required>
            <Input
              placeholder="Sector, colony, area"
              value={draft.area}
              onChange={(e) => onChange({ area: e.target.value })}
              className={inputCls}
            />
          </FieldGroup>

          {/* City */}
          <FieldGroup label="City" required>
            <Input
              placeholder="City"
              value={draft.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className={inputCls}
            />
          </FieldGroup>

          {/* State — full width */}
          <div className="sm:col-span-2">
            <FieldGroup label="State" optional>
              <Input
                placeholder="State"
                value={draft.state}
                onChange={(e) => onChange({ state: e.target.value })}
                className={inputCls}
              />
            </FieldGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
