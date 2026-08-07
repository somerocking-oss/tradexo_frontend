"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileScoreCard } from "@/components/kyc/ProfileScoreCard";
import { VerificationStatusBanner } from "@/components/business/VerifiedBadge";
import { KycContactsSection } from "@/components/kyc/KycContactsSection";
import { KycPrimaryContactSection, type PrimaryContactState } from "@/components/kyc/KycPrimaryContactSection";
import { KycGstinSection } from "@/components/kyc/KycGstinSection";
import { KycTurnoverSection } from "@/components/kyc/KycTurnoverSection";
import { KycCatalogSection } from "@/components/kyc/KycCatalogSection";
import { KycDocumentsSection } from "@/components/kyc/KycDocumentsSection";
import { useAuth } from "@/context/AuthContext";
import { getBusinessKyc, updateBusinessKyc } from "@/lib/api/kyc";
import type { BusinessCatalogItem, BusinessContact, BusinessKycProfile } from "@/types";

function cleanCatalogItems(items: BusinessCatalogItem[]) {
  return items
    .filter((item) => item.name.trim())
    .map((item, index) => ({
      name: item.name.trim(),
      description: item.description?.trim() || undefined,
      itemType: item.itemType,
      price: item.price,
      priceType: item.priceType || "on_request",
      unit: item.unit?.trim() || undefined,
      minimumOrderQuantity: item.minimumOrderQuantity,
      brand: item.brand?.trim() || undefined,
      inStock: item.inStock !== false,
      order: index + 1,
      images: (item.images || []).filter((img) => img.url),
    }));
}

export default function BusinessKycPage() {
  const params = useParams<{ id: string }>();
  const { loading } = useAuth();
  const businessId = params.id;

  const [profile, setProfile] = useState<BusinessKycProfile | null>(null);
  const [primaryContact, setPrimaryContact] = useState<PrimaryContactState>({});
  const [contacts, setContacts] = useState<BusinessContact[]>([]);
  const [annualTurnover, setAnnualTurnover] = useState<number | undefined>();
  const [turnoverCurrency, setTurnoverCurrency] = useState("INR");
  const [turnoverYear, setTurnoverYear] = useState<number | undefined>();
  const [catalog, setCatalog] = useState<BusinessCatalogItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTurnover, setSavingTurnover] = useState(false);
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    const res = await getBusinessKyc(businessId);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Unable to load KYC profile");
    }

    const data = res.data;
    setProfile(data);
    setPrimaryContact({
      contactPerson: data.contactPerson,
      mobile: data.mobile,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      website: data.website,
    });
    setContacts((data.contacts || []).filter((contact) => !contact.isPrimary));
    setAnnualTurnover(data.annualTurnover);
    setTurnoverCurrency(data.turnoverCurrency || "INR");
    setTurnoverYear(data.turnoverYear);
    setCatalog(data.services || data.catalog || []);
    return data;
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;

    loadProfile()
      .catch((err: Error) => setError(err.message || "Failed to load KYC profile"))
      .finally(() => setFetching(false));
  }, [businessId, loadProfile]);

  const applyProfileResponse = (data: BusinessKycProfile) => {
    setProfile(data);
    setPrimaryContact({
      contactPerson: data.contactPerson,
      mobile: data.mobile,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      website: data.website,
    });
    setContacts((data.contacts || []).filter((contact) => !contact.isPrimary));
    setAnnualTurnover(data.annualTurnover);
    setTurnoverCurrency(data.turnoverCurrency || "INR");
    setTurnoverYear(data.turnoverYear);
    setCatalog(data.services || data.catalog || []);
  };

  const handleSaveTurnover = async () => {
    if (!annualTurnover) {
      setError("Please select a turnover range before saving.");
      return;
    }

    setSavingTurnover(true);
    setError("");
    setMessage("");

    try {
      const res = await updateBusinessKyc(businessId, {
        annualTurnover,
        turnoverCurrency,
        turnoverYear,
      });
      if (!res.success || !res.data) {
        setError(res.message || "Failed to save turnover");
        return;
      }
      applyProfileResponse(res.data);
      setMessage("Turnover updated successfully.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to save turnover");
    } finally {
      setSavingTurnover(false);
    }
  };

  const handleSaveCatalog = async () => {
    const invalidItem = catalog.find((item) => item.name.trim() && !item.itemType);
    if (invalidItem) {
      setError("Each catalogue item needs a type (product or service).");
      return;
    }

    setSavingCatalog(true);
    setError("");
    setMessage("");

    try {
      const res = await updateBusinessKyc(businessId, {
        catalog: cleanCatalogItems(catalog),
      });
      if (!res.success || !res.data) {
        setError(res.message || "Failed to save catalogue");
        return;
      }
      applyProfileResponse(res.data);
      setMessage("Catalogue updated successfully.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to save catalogue");
    } finally {
      setSavingCatalog(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    if (!primaryContact.contactPerson?.trim() || !/^\d{10}$/.test((primaryContact.mobile || "").replace(/\D/g, "").slice(-10))) {
      setError("Primary contact person and valid 10-digit mobile are required.");
      setSaving(false);
      return;
    }

    const invalidContact = contacts.find(
      (contact) =>
        (contact.contactPerson?.trim() || contact.mobile?.trim()) &&
        (!contact.contactPerson?.trim() || !/^\d{10}$/.test(contact.mobile.replace(/\D/g, "").slice(-10)))
    );

    if (invalidContact) {
      setError("Each contact needs a name and valid 10-digit mobile number.");
      setSaving(false);
      return;
    }

    const cleanedContacts = contacts
      .filter((contact) => contact.contactPerson?.trim() && contact.mobile?.trim())
      .map((contact) => ({
        contactPerson: contact.contactPerson?.trim(),
        mobile: contact.mobile.replace(/\D/g, "").slice(-10),
        alternateMobile: contact.alternateMobile?.trim() || undefined,
        whatsapp: contact.whatsapp?.trim() || undefined,
        landline: contact.landline?.trim() || undefined,
        email: contact.email?.trim() || undefined,
        website: contact.website?.trim() || undefined,
        isPrimary: false,
      }));

    try {
      const res = await updateBusinessKyc(businessId, {
        contactPerson: primaryContact.contactPerson?.trim(),
        mobile: (primaryContact.mobile || "").replace(/\D/g, "").slice(-10),
        phone: primaryContact.phone?.trim() || undefined,
        whatsapp: primaryContact.whatsapp?.trim() || undefined,
        email: primaryContact.email?.trim() || undefined,
        website: primaryContact.website?.trim() || undefined,
        contacts: cleanedContacts,
        annualTurnover,
        turnoverCurrency,
        turnoverYear,
        catalog: cleanCatalogItems(catalog),
      });

      if (!res.success || !res.data) {
        setError(res.message || "Failed to update KYC profile");
        return;
      }

      applyProfileResponse(res.data);
      setMessage("KYC profile updated successfully. Your profile score has been refreshed.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to update KYC profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="py-20 text-center text-slate-500">Loading KYC profile...</div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center">
          <p className="text-red-600">{error || "Business not found"}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[#e86200] hover:underline">
            Back to dashboard
          </Link>
        </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-r from-[#ff6c00] to-[#ff8533] px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/dashboard/business/${businessId}/edit`}
            className="mb-3 mr-4 inline-flex items-center gap-1 text-sm text-[#e8e8e8] hover:text-white"
          >
            <Pencil className="h-4 w-4" /> Edit All Business Info
          </Link>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-1 text-sm text-[#e8e8e8] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold sm:text-3xl">KYC & Profile Update</h1>
          <p className="mt-1 text-[#e8e8e8]">
            {profile.name}
            {profile.city ? ` · ${profile.city}` : ""}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <VerificationStatusBanner
          isVerified={profile.isVerified}
          verificationLevel={profile.verificationLevel}
          profileCompletionPercent={profile.profileCompletionPercent}
        />

        <ProfileScoreCard completion={profile.profileCompletion} />

        <KycGstinSection businessId={businessId} profile={profile} onVerified={setProfile} />

        <KycPrimaryContactSection value={primaryContact} onChange={(patch) => setPrimaryContact((prev) => ({ ...prev, ...patch }))} />

        <KycContactsSection contacts={contacts} onChange={setContacts} />

        <KycTurnoverSection
          annualTurnover={annualTurnover}
          turnoverCurrency={turnoverCurrency}
          turnoverYear={turnoverYear}
          onChange={(patch) => {
            if (patch.annualTurnover !== undefined) setAnnualTurnover(patch.annualTurnover);
            if (patch.turnoverCurrency !== undefined) setTurnoverCurrency(patch.turnoverCurrency);
            if (patch.turnoverYear !== undefined) setTurnoverYear(patch.turnoverYear);
          }}
          onSave={handleSaveTurnover}
          saving={savingTurnover}
        />

        <KycCatalogSection
          businessId={businessId}
          items={catalog}
          defaultItemType={profile.sellerIntent === "products" ? "product" : "service"}
          onChange={setCatalog}
          onSave={handleSaveCatalog}
          saving={savingCatalog}
        />

        <KycDocumentsSection
          businessId={businessId}
          documents={profile.documents || []}
          onRefresh={async () => {
            const data = await loadProfile();
            setProfile(data);
          }}
        />

        {message && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
        )}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <Button type="button" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" /> Save KYC Updates
          </Button>
        </div>
      </div>
    </>
  );
}
