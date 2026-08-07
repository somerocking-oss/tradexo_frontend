"use client";

import type { BusinessRegistrationDraft } from "@/lib/business-registration";
import { Input } from "@/components/ui/input";
import { Phone, Mail, Globe, PhoneCall } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface Props {
  draft: BusinessRegistrationDraft;
  onChange: (patch: Partial<BusinessRegistrationDraft>) => void;
}

/* Reusable labelled field wrapper */
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

/* Input with a leading icon adornment */
function IconInput({
  icon,
  prefix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  prefix?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {prefix}
      <div className="relative flex-1">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={
            "h-10 w-full rounded-lg border border-neutral-300 bg-white text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400" +
            (icon ? " pl-9 pr-3" : " px-3")
          }
        />
      </div>
    </div>
  );
}

export function StepContact({ draft, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Mobile */}
        <FieldGroup label="Mobile" required>
          <div className="flex items-center gap-2">
            {/* Country code badge */}
            <span className="flex h-10 shrink-0 items-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 text-sm font-medium text-neutral-600">
              +91
            </span>
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Phone className="h-4 w-4" />
              </span>
              <Input
                placeholder="10-digit mobile"
                maxLength={10}
                inputMode="numeric"
                value={draft.mobile}
                onChange={(e) =>
                  onChange({ mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
                className="h-10 w-full rounded-lg border border-neutral-300 pl-9 pr-3 text-sm transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
              />
            </div>
          </div>
        </FieldGroup>

        {/* Phone (landline) */}
        <FieldGroup label="Phone (landline)" optional>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <PhoneCall className="h-4 w-4" />
            </span>
            <Input
              placeholder="Optional"
              value={draft.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="h-10 w-full rounded-lg border border-neutral-300 pl-9 pr-3 text-sm transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
            />
          </div>
        </FieldGroup>

        {/* WhatsApp */}
        <FieldGroup label="WhatsApp" optional>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <FaWhatsapp className="h-4 w-4" />
            </span>
            <Input
              placeholder="Same as mobile if blank"
              maxLength={10}
              inputMode="numeric"
              value={draft.whatsapp}
              onChange={(e) =>
                onChange({ whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
              className="h-10 w-full rounded-lg border border-neutral-300 pl-9 pr-3 text-sm transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
            />
          </div>
        </FieldGroup>

        {/* Email */}
        <FieldGroup label="Email" optional>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <Mail className="h-4 w-4" />
            </span>
            <Input
              type="email"
              placeholder="business@email.com"
              value={draft.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="h-10 w-full rounded-lg border border-neutral-300 pl-9 pr-3 text-sm transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
            />
          </div>
        </FieldGroup>

        {/* Website — full width */}
        <div className="sm:col-span-2">
          <FieldGroup label="Website" optional>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Globe className="h-4 w-4" />
              </span>
              <Input
                placeholder="https://yourwebsite.com"
                value={draft.website}
                onChange={(e) => onChange({ website: e.target.value })}
                className="h-10 w-full rounded-lg border border-neutral-300 pl-9 pr-3 text-sm transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
              />
            </div>
          </FieldGroup>
        </div>
      </div>

      {/* Helper note */}
      <p className="rounded-lg border border-[#E5E5E5] bg-[#F0F0F0] px-4 py-3 text-sm text-[#E86200]">
        Your mobile number will be verified and used for buyer enquiries. Add WhatsApp
        to allow one-tap messaging.
      </p>
    </div>
  );
}
