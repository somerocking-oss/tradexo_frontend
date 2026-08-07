"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BusinessContact } from "@/types";

interface KycContactsSectionProps {
  contacts: BusinessContact[];
  onChange: (contacts: BusinessContact[]) => void;
}

export function KycContactsSection({ contacts, onChange }: KycContactsSectionProps) {
  const updateContact = (index: number, patch: Partial<BusinessContact>) => {
    onChange(
      contacts.map((contact, i) => (i === index ? { ...contact, ...patch } : contact))
    );
  };

  const addContact = () => {
    onChange([
      ...contacts,
      {
        contactPerson: "",
        mobile: "",
        alternateMobile: "",
        whatsapp: "",
        landline: "",
        email: "",
        website: "",
        isPrimary: false,
      },
    ]);
  };

  const removeContact = (index: number) => {
    onChange(contacts.filter((_, i) => i !== index));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Users className="h-5 w-5 text-[#ff6c00]" />
            Other Contacts
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Add alternate contact persons for calls, WhatsApp, or email follow-ups.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addContact}>
          <Plus className="h-4 w-4" /> Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No additional contacts added yet.
        </p>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <div key={contact._id || index} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-medium text-slate-800">Contact {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Contact Person *</span>
                  <Input
                    value={contact.contactPerson || ""}
                    onChange={(e) => updateContact(index, { contactPerson: e.target.value })}
                    placeholder="Name"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Mobile *</span>
                  <Input
                    value={contact.mobile || ""}
                    onChange={(e) => updateContact(index, { mobile: e.target.value })}
                    placeholder="10-digit mobile"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Alternate Mobile</span>
                  <Input
                    value={contact.alternateMobile || ""}
                    onChange={(e) => updateContact(index, { alternateMobile: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">WhatsApp</span>
                  <Input
                    value={contact.whatsapp || ""}
                    onChange={(e) => updateContact(index, { whatsapp: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Landline</span>
                  <Input
                    value={contact.landline || ""}
                    onChange={(e) => updateContact(index, { landline: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Email</span>
                  <Input
                    type="email"
                    value={contact.email || ""}
                    onChange={(e) => updateContact(index, { email: e.target.value })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
