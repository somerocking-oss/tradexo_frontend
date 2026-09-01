"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useUserCity } from "@/hooks/useUserCity";
import { fetchAllCategories } from "@/lib/api/category";
import { createBusiness, checkDuplicateBusiness } from "@/lib/api/business";
import { sendOtp, verifyOtp } from "@/lib/api/auth";
import type { Category } from "@/types";

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Business & Category",
  2: "Verify Mobile",
  3: "City",
};

export function MinimalRegisterForm() {
  const router = useRouter();
  const { user, isAuthenticated, setSession } = useAuth();
  const { city, setCity, detecting, wasAutoDetected } = useUserCity();

  const [step, setStep] = useState<Step>(1);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState("");

  const [mobile, setMobile] = useState("");
  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ _id: string } | null>(null);

  useEffect(() => {
    fetchAllCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.mobile) {
      setMobile(user.mobile.replace(/\D/g, "").slice(-10));
    }
  }, [isAuthenticated, user]);

  const mobileVerified = isAuthenticated || otpStep === "verified";

  const goNext = () => {
    setError("");
    if (step === 1) {
      if (!name.trim()) {
        setError("Enter your business name");
        return;
      }
      if (!primaryCategory) {
        setError("Select a category");
        return;
      }
    }
    if (step === 2) {
      if (!mobileVerified) {
        setError("Please verify your mobile number to continue");
        return;
      }
    }
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  };

  const goBack = () => {
    setError("");
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  };

  const handleSendOtp = async () => {
    if (mobile.length !== 10) return;
    setOtpSending(true);
    setOtpError("");
    try {
      const res = await sendOtp(mobile);
      if (res.success) {
        setOtpStep("sent");
        setOtpCode("");
      } else {
        setOtpError(res.message || "Failed to send OTP");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setOtpError(msg || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setOtpError("Enter the 6-digit OTP");
      return;
    }
    setOtpVerifying(true);
    setOtpError("");
    try {
      const res = await verifyOtp(mobile, otpCode);
      if (res.success && res.data) {
        setSession(res.data.accessToken, res.data.user);
        setOtpStep("verified");
        setOtpError("");
      } else {
        setOtpError(res.message || "Invalid OTP");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setOtpError(msg || "Invalid OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!city.trim()) {
      setError("Enter your city");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const dup = await checkDuplicateBusiness({ name: name.trim(), city: city.trim(), mobile });
      if (dup.success && dup.data?.duplicate) {
        setError("A business with this name already looks registered in this city. Check My Businesses in your dashboard.");
        setSubmitting(false);
        return;
      }

      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("primaryCategory", primaryCategory);
      fd.append("mobile", mobile);
      fd.append("phone", mobile);
      fd.append("city", city.trim());
      fd.append("registrationMode", "minimal");

      const res = await createBusiness(fd);
      if (res.success && res.data) {
        setCreated(res.data);
        setTimeout(() => {
          router.push(`/dashboard/business/${res.data._id}/edit`);
        }, 1200);
      } else {
        setError(res.message || "Could not create your listing. Please try again.");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Could not create your listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
        <h2 className="text-xl font-bold text-neutral-900">You&apos;re listed on Tradexo!</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Taking you to your dashboard to add location, photos and more — free, in a few minutes.
        </p>
        <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-[#FF6C00]" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#F4F6F8] py-10">
      {/* Decorative branded background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle at center, #FF6C00 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle at center, #0B3B6F 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-lg px-4 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                  s === step
                    ? "bg-[#FF6C00] text-white shadow-[0_4px_14px_rgba(255,108,0,0.35)]"
                    : s < step
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${s < step ? "bg-emerald-300" : "bg-neutral-200"}`} />}
            </div>
          ))}
        </div>
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Step {step} of 3 — {STEP_LABELS[step]}
        </p>

      <Card className="rounded-2xl border-neutral-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <CardBody className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-900">Business Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sharma Traders"
                  className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-900">Category</label>
                <select
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.icon ? `${c.icon} ` : ""}
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-900">Mobile Number</label>
                <div className="flex gap-2">
                  <input
                    value={mobile}
                    onChange={(e) => {
                      const next = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setMobile(next);
                      if (otpStep !== "idle") setOtpStep("idle");
                    }}
                    disabled={isAuthenticated}
                    placeholder="10-digit mobile number"
                    className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20 disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                  {!isAuthenticated && mobile.length === 10 && otpStep !== "verified" && (
                    <Button type="button" variant="outline" onClick={handleSendOtp} disabled={otpSending} className="shrink-0">
                      {otpSending ? "Sending..." : otpStep === "sent" ? "Resend" : "Send OTP"}
                    </Button>
                  )}
                </div>
              </div>

              {isAuthenticated && (
                <p className="flex items-center gap-1.5 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Verified — you&apos;re logged in
                </p>
              )}

              {!isAuthenticated && otpStep === "sent" && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-900">Enter OTP</label>
                  <div className="flex gap-2">
                    <input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit code"
                      className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm tracking-widest focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
                    />
                    <Button type="button" onClick={handleVerifyOtp} disabled={otpVerifying} className="shrink-0">
                      {otpVerifying ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              )}

              {!isAuthenticated && otpStep === "verified" && (
                <p className="flex items-center gap-1.5 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Mobile verified
                </p>
              )}

              {otpError && <p className="text-sm text-red-600">{otpError}</p>}
            </>
          )}

          {step === 3 && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-900">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={detecting ? "Detecting your city..." : "e.g. Ghaziabad"}
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
              />
              {wasAutoDetected && city && (
                <p className="mt-1 text-xs text-neutral-400">Detected automatically — edit if needed.</p>
              )}
              <p className="mt-3 text-xs text-neutral-400">
                You&apos;ll add your exact location, description and photos in the next step from your dashboard.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={goBack} disabled={step === 1 || submitting}>
              Back
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={goNext}>
                Continue
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} loading={submitting}>
                {submitting ? "Creating your listing..." : "List My Business Free"}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
      </div>
    </div>
  );
}
