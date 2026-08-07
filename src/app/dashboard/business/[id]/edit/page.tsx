"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { RegistrationStepper } from "@/components/register/RegistrationStepper";
import { StepBusinessType } from "@/components/register/StepBusinessType";
import { StepBusinessInfo } from "@/components/register/StepBusinessInfo";
import { StepLocation } from "@/components/register/StepLocation";
import { StepContact } from "@/components/register/StepContact";
import { StepBusinessHours } from "@/components/register/StepBusinessHours";
import { StepAbout } from "@/components/register/StepAbout";
import { StepMedia } from "@/components/register/StepMedia";
import { ProductsManager } from "@/components/dashboard/ProductsManager";
import { useAuth } from "@/context/AuthContext";
import { fetchAllCategories, filterCategoriesForProvider } from "@/lib/api/category";
import { updateBusinessWithFiles } from "@/lib/api/business";
import { getBusinessKyc } from "@/lib/api/kyc";
import {
  buildRegistrationFormData,
  businessToDraft,
  emptyDraft,
  extractExistingBannerUrl,
  extractExistingGalleryImages,
  validateStep,
  REGISTRATION_STEPS,
  type BusinessRegistrationDraft,
  type ExistingGalleryImage,
} from "@/lib/business-registration";
import type { Category } from "@/types";

const STEP_HINTS: Record<number, string> = {
  1: "Business type aur seller role",
  2: "Business name, category aur basic details",
  3: "City, address aur map location",
  4: "Phone, WhatsApp aur email",
  5: "Customers kab reach kar sakte hain",
  6: "Description, tags aur SEO summary",
  7: "Apne products manage karo — price, image, brand sab update karo",
  8: "Logo, banner aur gallery photos",
};

export default function EditBusinessPage() {
  const params = useParams<{ id: string }>();
  const businessId = params.id;
  const router = useRouter();
  const { loading } = useAuth();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<BusinessRegistrationDraft>(emptyDraft);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banner, setBanner] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
  const [existingGallery, setExistingGallery] = useState<ExistingGalleryImage[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Product providers get a dedicated Products step (step 7)
  const visibleSteps = useMemo((): Array<{ id: number; title: string; short: string }> => {
    if (draft.providerType === "product") {
      return [...REGISTRATION_STEPS];
    }
    return REGISTRATION_STEPS.filter((s) => s.id !== 7);
  }, [draft.providerType]);

  const TOTAL_STEPS = visibleSteps.length;
  const currentStepId = visibleSteps[step - 1]?.id ?? 1;
  const currentStepMeta = REGISTRATION_STEPS.find((s) => s.id === currentStepId);

  useEffect(() => {
    if (!businessId) return;

    Promise.all([
      getBusinessKyc(businessId),
      fetchAllCategories(),
    ])
      .then(([bizRes, categoryList]) => {
        if (!bizRes.success || !bizRes.data) {
          throw new Error(bizRes.message || "Unable to load business");
        }

        const business = bizRes.data;
        setBusinessName(business.name || "Business");
        setDraft(businessToDraft(business));
        setExistingBannerUrl(extractExistingBannerUrl(business));
        setExistingGallery(extractExistingGalleryImages(business));
        setCategories(categoryList);
      })
      .catch((err: Error) => setError(err.message || "Failed to load business"))
      .finally(() => setFetching(false));
  }, [businessId]);

  const patchDraft = useCallback((patch: Partial<BusinessRegistrationDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setError("");
  }, []);

  const registrationCategories = useMemo(
    () => filterCategoriesForProvider(categories, draft.providerType),
    [categories, draft.providerType]
  );

  // When switching from product to service, skip back if on Products step
  useEffect(() => {
    if (draft.providerType !== "product" && currentStepId === 7) {
      setStep((s) => Math.max(s - 1, 1));
    }
  }, [draft.providerType, currentStepId]);

  const goNext = () => {
    // Products step (id:7) in edit mode has no validation — just continue
    if (currentStepId !== 7) {
      const err = validateStep(currentStepId, draft);
      if (err) {
        setError(err);
        return;
      }
    }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    for (const vs of visibleSteps) {
      if (vs.id === 7) continue; // Products managed independently via API
      const err = validateStep(vs.id, draft);
      if (err) {
        setError(err);
        setStep(visibleSteps.findIndex((s) => s.id === vs.id) + 1);
        return;
      }
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const fd = buildRegistrationFormData(draft, { banner, images });
      const res = await updateBusinessWithFiles(businessId, fd);
      if (res.success) {
        setMessage("Business updated successfully!");
        setTimeout(() => router.push("/dashboard?updated=1"), 800);
      } else {
        setError(res.message || "Update failed");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Update failed. Please check all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="py-20 text-center text-slate-500">Loading business details...</div>
    );
  }

  if (error && !draft.name) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-[#e86200] hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isProductsStep = currentStepId === 7;

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-r from-[#ff6c00] to-[#ff6c00] px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-1 text-sm text-indigo-100 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <Pencil className="h-7 w-7" /> Update Business
          </h1>
          <p className="mt-1 text-orange-100">
            {businessName} · Step-by-step profile edit
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <RegistrationStepper currentStep={step} steps={visibleSteps} />

        <Card className="mt-6">
          <div className="border-b border-neutral-100 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#ff6c00]">
              Step {step} of {TOTAL_STEPS}
            </p>
            <h2 className="mt-0.5 text-xl font-bold text-neutral-900">{currentStepMeta?.title}</h2>
            <p className="mt-0.5 text-sm text-neutral-500">{STEP_HINTS[currentStepId]}</p>
          </div>

          <CardBody>
            {currentStepId === 1 && <StepBusinessType draft={draft} onChange={patchDraft} />}
            {currentStepId === 2 && (
              <StepBusinessInfo draft={draft} categories={registrationCategories} onChange={patchDraft} />
            )}
            {currentStepId === 3 && <StepLocation draft={draft} onChange={patchDraft} />}
            {currentStepId === 4 && <StepContact draft={draft} onChange={patchDraft} />}
            {currentStepId === 5 && <StepBusinessHours draft={draft} onChange={patchDraft} />}
            {currentStepId === 6 && <StepAbout draft={draft} onChange={patchDraft} />}
            {currentStepId === 7 && (
              <ProductsManager businessId={businessId} />
            )}
            {currentStepId === 8 && (
              <StepMedia
                draft={draft}
                categories={categories}
                banner={banner}
                images={images}
                onBannerChange={setBanner}
                onImagesChange={setImages}
                existingBannerUrl={existingBannerUrl}
                existingGallery={existingGallery}
                mode="edit"
              />
            )}

            {message && (
              <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
            )}
            {error && (
              <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <Button type="button" variant="ghost" onClick={goBack} disabled={step === 1 || submitting}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              <div className="flex gap-2">
                <Button
                  href={`/dashboard/business/${businessId}/kyc`}
                  type="button"
                  variant="outline"
                  disabled={submitting}
                >
                  KYC & Documents
                </Button>

                <Button
                  href={`/dashboard/business/${businessId}/integrations`}
                  type="button"
                  variant="outline"
                  disabled={submitting}
                >
                  CRM Webhook
                </Button>

                {isProductsStep ? (
                  /* Products step — no "Save Changes" needed, changes are live via API */
                  <Button type="button" onClick={goNext}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : step < TOTAL_STEPS ? (
                  <Button type="button" onClick={goNext}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} loading={submitting}>
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
