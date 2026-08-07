"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { RegistrationSeoPreview } from "@/components/register/RegistrationSeoPreview";
import { StepBusinessType } from "@/components/register/StepBusinessType";
import { StepBusinessInfo } from "@/components/register/StepBusinessInfo";
import { StepLocation } from "@/components/register/StepLocation";
import { StepContact } from "@/components/register/StepContact";
import { StepBusinessHours } from "@/components/register/StepBusinessHours";
import { StepAbout } from "@/components/register/StepAbout";
import { StepProducts } from "@/components/register/StepProducts";
import { StepMedia } from "@/components/register/StepMedia";
import { useAuth } from "@/context/AuthContext";
import { fetchAllCategories, filterCategoriesForProvider } from "@/lib/api/category";
import { createBusiness, checkDuplicateBusiness } from "@/lib/api/business";
import { createBusinessProduct } from "@/lib/api/products";
import {
  buildRegistrationFormData,
  clearDraft,
  emptyDraft,
  loadDraft,
  saveDraft,
  validateStep,
  REGISTRATION_STEPS,
  type BusinessRegistrationDraft,
} from "@/lib/business-registration";
import type { Category } from "@/types";
import { RegisterProgressPanel } from "./RegisterProgressPanel";
import { RegisterBenefitsPanel, RegisterBottomStatsBar } from "./RegisterBenefitsPanel";

const STEP_HINTS: Record<number, string> = {
  1: "Choose whether you sell products or offer services",
  2: "Business name, category and basic details",
  3: "City, address and map location",
  4: "Phone, WhatsApp and email for customer enquiries",
  5: "When customers can reach you",
  6: "Description, tags and SEO-friendly summary",
  7: "Add the products you sell — buyers can browse and get quotes",
  8: "Logo, banner and gallery photos",
};

function StepActions({
  step,
  totalSteps,
  submitting,
  checkingDuplicate,
  onBack,
  onNext,
  onSubmit,
  onSaveDraft,
  mobile = false,
}: {
  step: number;
  totalSteps: number;
  submitting: boolean;
  checkingDuplicate: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 shrink-0 px-4"
            onClick={onBack}
            disabled={step === 1 || submitting}
            aria-label="Previous step"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {step < totalSteps ? (
            <Button
              type="button"
              size="lg"
              className="h-12 flex-1 text-base"
              onClick={onNext}
              loading={checkingDuplicate}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="h-12 flex-1 text-base"
              onClick={onSubmit}
              loading={submitting}
            >
              Submit Listing
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 border-t border-neutral-400 pt-6">
      <Button type="button" variant="outline" onClick={onSaveDraft}>
        <Save className="h-4 w-4" /> Save Draft
      </Button>
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" onClick={onBack} disabled={step === 1 || submitting}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < totalSteps ? (
          <Button type="button" size="lg" onClick={onNext} loading={checkingDuplicate}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={onSubmit} loading={submitting}>
            Submit Listing
          </Button>
        )}
      </div>
    </div>
  );
}

export function RegisterBusinessForm({ registeredToday = 0 }: { registeredToday?: number }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<BusinessRegistrationDraft>(() => emptyDraft());
  const [categories, setCategories] = useState<Category[]>([]);
  const [banner, setBanner] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Visible steps depend on providerType — product providers get the Products step (id:7)
  const visibleSteps = useMemo((): Array<{ id: number; title: string; short: string }> => {
    if (draft.providerType === "product") {
      return [...REGISTRATION_STEPS];
    }
    return REGISTRATION_STEPS.filter((s) => s.id !== 7);
  }, [draft.providerType]);

  const TOTAL_STEPS = visibleSteps.length;
  // Map visual step position (1-based) to real step ID
  const currentStepId = visibleSteps[step - 1]?.id ?? 1;
  const currentStepMeta = REGISTRATION_STEPS.find((s) => s.id === currentStepId);
  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/register-business");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    setDraft(loadDraft());
    setMounted(true);
    fetchAllCategories().then(setCategories);
  }, []);

  const registrationCategories = useMemo(
    () => filterCategoriesForProvider(categories, draft.providerType),
    [categories, draft.providerType]
  );

  useEffect(() => {
    if (!draft.primaryCategory) return;
    const valid = registrationCategories.some((c) => c._id === draft.primaryCategory);
    if (!valid) {
      setDraft((prev) => ({ ...prev, primaryCategory: "", primarySubCategory: "" }));
    }
  }, [draft.primaryCategory, registrationCategories]);

  useEffect(() => {
    if (mounted) saveDraft(draft);
  }, [draft, mounted]);

  useEffect(() => {
    if (user?.mobile && !draft.mobile) {
      setDraft((prev) => ({ ...prev, mobile: user.mobile }));
    }
  }, [user, draft.mobile]);

  // When user switches from product to service type, reset visual step if on the products step
  useEffect(() => {
    if (draft.providerType !== "product" && currentStepId === 7) {
      setStep((s) => Math.max(s - 1, 1));
    }
  }, [draft.providerType, currentStepId]);

  const patchDraft = useCallback((patch: Partial<BusinessRegistrationDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setError("");
  }, []);

  const verifyNotDuplicate = async (currentDraft: BusinessRegistrationDraft) => {
    if (!currentDraft.name.trim() || !currentDraft.city.trim()) return null;

    const res = await checkDuplicateBusiness({
      name: currentDraft.name.trim(),
      city: currentDraft.city.trim(),
      mobile: currentDraft.mobile.trim() || undefined,
    });

    if (res.success && res.data?.duplicate) {
      return "This business is already registered. You cannot add the same listing again.";
    }

    return null;
  };

  const goNext = async () => {
    const err = validateStep(currentStepId, draft);
    if (err) {
      setError(err);
      return;
    }

    if (currentStepId >= 3 && draft.name.trim() && draft.city.trim()) {
      setCheckingDuplicate(true);
      try {
        const dupErr = await verifyNotDuplicate(draft);
        if (dupErr) {
          setError(dupErr);
          return;
        }
      } catch {
        // Backend check is authoritative on submit.
      } finally {
        setCheckingDuplicate(false);
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

  const handleSaveDraft = () => {
    saveDraft(draft);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleSubmit = async () => {
    // Validate all visible steps
    for (const vs of visibleSteps) {
      const err = validateStep(vs.id, draft);
      if (err) {
        setError(err);
        setStep(visibleSteps.findIndex((s) => s.id === vs.id) + 1);
        return;
      }
    }

    setSubmitting(true);
    setError("");

    try {
      const dupErr = await verifyNotDuplicate(draft);
      if (dupErr) {
        setError(dupErr);
        setStep(visibleSteps.findIndex((s) => s.id === 3) + 1);
        return;
      }

      const fd = buildRegistrationFormData(draft, { banner, images });
      const res = await createBusiness(fd);
      if (res.success) {
        // Save drafted products (fire-and-forget, don't block redirect)
        const businessId = res.data?._id;
        if (businessId && draft.products.length > 0) {
          Promise.allSettled(
            draft.products.map((p) =>
              createBusinessProduct({
                businessId,
                name: p.name,
                itemType: "product",
                description: p.description || undefined,
                price: p.price ? Number(p.price) : undefined,
                priceType: p.priceType || "fixed",
                brand: p.brand || undefined,
                unit: p.unit || undefined,
                minimumOrderQuantity: p.minimumOrderQuantity
                  ? Number(p.minimumOrderQuantity)
                  : undefined,
                inStock: true,
              })
            )
          );
        }

        clearDraft();
        router.push("/dashboard?registered=1");
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Registration failed. Please check all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <section className="bg-[#f4f6f8]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-full rounded-full bg-[#e8e8e8]" />
            <div className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f4f6f8]">
      {/* Mobile sticky progress */}
      <div className="sticky top-0 z-20 border-b border-[#e8e8e8] bg-[#0B3B6F]/95 px-4 py-3 shadow-sm backdrop-blur-md xl:hidden">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-white">{currentStepMeta?.title}</p>
          <span className="shrink-0 text-xs font-bold text-[#ff6c00]">{progressPct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#eee]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ff8533] to-[#ff6c00] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-10 xl:pb-10">
        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_220px] xl:gap-6">
          {/* Left — progress */}
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <RegisterProgressPanel
                step={step}
                progressPct={progressPct}
                visibleSteps={visibleSteps}
              />
            </div>
          </aside>

          {/* Center — form */}
          <div>
            <Card className="overflow-hidden border-neutral-400 shadow-md">
              <div className="border-b border-neutral-400 bg-white px-5 py-5 sm:px-7">
                <p className="text-xs font-bold uppercase tracking-wider text-[#ff6c00]">
                  Step {step} of {TOTAL_STEPS}
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#111] sm:text-2xl">
                  {currentStepMeta?.title}
                </h2>
                <p className="mt-1 text-sm text-[#888]">{STEP_HINTS[currentStepId]}</p>
              </div>

              <CardBody className="bg-white p-5 sm:p-7">
                {currentStepId === 1 && <StepBusinessType draft={draft} onChange={patchDraft} />}
                {currentStepId === 2 && (
                  <StepBusinessInfo draft={draft} categories={registrationCategories} onChange={patchDraft} />
                )}
                {currentStepId === 3 && <StepLocation draft={draft} onChange={patchDraft} />}
                {currentStepId === 4 && <StepContact draft={draft} onChange={patchDraft} />}
                {currentStepId === 5 && <StepBusinessHours draft={draft} onChange={patchDraft} />}
                {currentStepId === 6 && (
                  <StepAbout draft={draft} categories={categories} onChange={patchDraft} />
                )}
                {currentStepId === 7 && (
                  <StepProducts draft={draft} onChange={patchDraft} />
                )}
                {currentStepId === 8 && (
                  <StepMedia
                    draft={draft}
                    categories={categories}
                    banner={banner}
                    images={images}
                    onBannerChange={setBanner}
                    onImagesChange={setImages}
                  />
                )}

                {error && (
                  <div
                    className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {savedFlash && (
                  <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-green-700">
                    <CheckCircle2 className="h-4 w-4" /> Draft saved successfully
                  </p>
                )}

                <div className="mt-8 hidden sm:block">
                  <StepActions
                    step={step}
                    totalSteps={TOTAL_STEPS}
                    submitting={submitting}
                    checkingDuplicate={checkingDuplicate}
                    onBack={goBack}
                    onNext={goNext}
                    onSubmit={handleSubmit}
                    onSaveDraft={handleSaveDraft}
                  />
                </div>
              </CardBody>
            </Card>

            {currentStepId >= 5 && (
              <div className="mt-4 xl:hidden">
                <RegistrationSeoPreview draft={draft} categories={categories} />
              </div>
            )}

            <RegisterBottomStatsBar registeredToday={registeredToday} />
          </div>

          {/* Right — benefits */}
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              <RegisterBenefitsPanel />
              {currentStepId >= 5 && (
                <RegistrationSeoPreview draft={draft} categories={categories} />
              )}
            </div>
          </aside>
        </div>

        {/* Mobile benefits */}
        <div className="mt-6 xl:hidden">
          <RegisterBenefitsPanel />
        </div>
      </div>

      {/* Mobile bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e8e8e8] bg-white/98 px-4 py-3 shadow-[0_-8px_30px_rgb(0_0_0/0.08)] backdrop-blur-md sm:hidden">
        <StepActions
          step={step}
          totalSteps={TOTAL_STEPS}
          submitting={submitting}
          checkingDuplicate={checkingDuplicate}
          onBack={goBack}
          onNext={goNext}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          mobile
        />
      </div>
    </section>
  );
}
