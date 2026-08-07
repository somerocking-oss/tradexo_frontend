"use client";

import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PrimaryContactState {
  contactPerson?: string;
  mobile?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}

interface KycPrimaryContactSectionProps {
  value: PrimaryContactState;
  onChange: (patch: PrimaryContactState) => void;
}

export function KycPrimaryContactSection({ value, onChange }: KycPrimaryContactSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
        <Phone className="h-5 w-5 text-[#ff6c00]" />
        Primary Contact
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Main contact shown on your public listing and used for lead notifications.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-600">Contact Person *</span>
          <Input
            value={value.contactPerson || ""}
            onChange={(e) => onChange({ contactPerson: e.target.value })}
            placeholder="Owner / manager name"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Mobile *</span>
          <Input
            value={value.mobile || ""}
            maxLength={10}
            onChange={(e) =>
              onChange({ mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
            }
            placeholder="10-digit mobile"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Landline</span>
          <Input
            value={value.phone || ""}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="Optional"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">WhatsApp</span>
          <Input
            value={value.whatsapp || ""}
            maxLength={10}
            onChange={(e) =>
              onChange({ whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Email</span>
          <Input
            type="email"
            value={value.email || ""}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-600">Website</span>
          <Input
            value={value.website || ""}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="https://"
          />
        </label>
      </div>
    </section>
  );
}

export type { PrimaryContactState };
