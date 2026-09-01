"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getOtpSettings, sendOtp, verifyOtp } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";
import { SITE_NAME } from "@/lib/constants";

type OtpChannel = "sms" | "whatsapp";

// ─── 6-box OTP input ─────────────────────────────────────────────────────────
function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const focus = (i: number) => refs.current[i]?.focus();

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = digits.map((d, idx) => (idx === i ? "" : d));
      onChange(next.join(""));
      if (i > 0) focus(i - 1);
    } else if (e.key === "ArrowLeft" && i > 0) {
      focus(i - 1);
    } else if (e.key === "ArrowRight" && i < 5) {
      focus(i + 1);
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    // Handle paste: spread digits across boxes
    if (raw.length > 1) {
      const spread = raw.slice(0, 6).split("");
      const next = digits.map((d, idx) => spread[idx] ?? d);
      onChange(next.join(""));
      focus(Math.min(raw.length, 5));
      return;
    }
    const next = digits.map((d, idx) => (idx === i ? raw : d));
    onChange(next.join(""));
    if (i < 5) focus(i + 1);
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={digit}
          disabled={disabled}
          onKeyDown={(e) => handleKey(i, e)}
          onChange={(e) => handleChange(i, e)}
          onFocus={(e) => e.target.select()}
          className={[
            "h-12 w-10 rounded-lg border-2 text-center text-lg font-bold transition-all duration-150 outline-none sm:h-14 sm:w-12",
            "border-neutral-300 bg-white text-neutral-900",
            "focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20 focus:scale-[1.05]",
            "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400",
            digit ? "border-[#FF6C00] bg-[#FFF3E8]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ─── Resend timer ─────────────────────────────────────────────────────────────
function ResendTimer({
  onResend,
  disabled,
}: {
  onResend: () => void;
  disabled: boolean;
}) {
  const [seconds, setSeconds] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    setSeconds(30);
    setCanResend(false);
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          setCanResend(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (canResend) {
    return (
      <button
        type="button"
        onClick={() => {
          setSeconds(30);
          setCanResend(false);
          onResend();
        }}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#FF6C00] hover:text-[#E86200] transition-colors disabled:opacity-50"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Resend OTP
      </button>
    );
  }

  return (
    <p className="text-sm text-neutral-400">
      Resend OTP in{" "}
      <span className="font-semibold text-neutral-600 tabular-nums">
        0:{String(seconds).padStart(2, "0")}
      </span>
    </p>
  );
}

// ─── Left brand panel ─────────────────────────────────────────────────────────
function BrandPanel() {
  const [trustStats, setTrustStats] = useState<
    Array<{ icon: typeof Building2; value: string; label: string }>
  >([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003"}/api/v1/businesses/platform-stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data;
        if (!data) return;
        const next: Array<{ icon: typeof Building2; value: string; label: string }> = [];
        if (data.businessCount > 0) {
          next.push({
            icon: Building2,
            value:
              data.businessCount >= 1000
                ? `${Math.floor(data.businessCount / 100) / 10}K+`
                : `${data.businessCount}+`,
            label: "Verified Businesses",
          });
        }
        if (data.cityCount > 0) {
          next.push({
            icon: MapPin,
            value: `${data.cityCount}+`,
            label: "Cities Covered",
          });
        }
        if (data.leadCount > 0) {
          next.push({
            icon: ShoppingCart,
            value:
              data.leadCount >= 100000
                ? `${Math.floor(data.leadCount / 100000)}L+`
                : `${Math.floor(data.leadCount / 100) / 10}K+`,
            label: "RFQs Processed",
          });
        }
        setTrustStats(next);
      })
      .catch(() => setTrustStats([]));
  }, []);

  return (
    <div className="hidden lg:flex lg:w-[40%] relative flex-col items-center justify-center bg-[#0B3B6F] overflow-hidden px-12 py-16">
      {/* Decorative gradient circles */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle at center, #FF6C00 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle at center, #FF6C00 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5"
        style={{
          background:
            "radial-gradient(circle at center, #FF6C00 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo mark */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF6C00]">
          <ShoppingCart className="h-8 w-8 text-white" strokeWidth={1.75} />
        </div>

        {/* Brand name */}
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          {SITE_NAME}
        </h1>
        <p className="mt-3 max-w-xs text-base text-neutral-400 leading-relaxed">
          India&rsquo;s fastest growing B2B marketplace. Connect, source, and
          grow your business.
        </p>

        {/* Divider */}
        <div className="my-10 h-px w-16 bg-neutral-800" />

        {trustStats.length > 0 ? (
        <div className="flex flex-col gap-6 w-full max-w-xs">
          {trustStats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800">
                <Icon className="h-5 w-5 text-[#FF6C00]" strokeWidth={1.75} />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-white leading-none">
                  {value}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
        ) : null}

        {/* Bottom badge */}
        <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2">
          <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
          <span className="text-xs text-neutral-400">
            Verified &amp; secure platform
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main login form ──────────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const referralCode = searchParams.get("ref")?.trim().toUpperCase() || "";
  const { setSession, isAuthenticated } = useAuth();

  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpChannels, setOtpChannels] = useState<OtpChannel[]>(["sms"]);
  const [otpChannel, setOtpChannel] = useState<OtpChannel>("sms");
  const [allowChannelChoice, setAllowChannelChoice] = useState(false);
  const [sentChannel, setSentChannel] = useState<OtpChannel>("sms");

  useEffect(() => {
    getOtpSettings()
      .then((res) => {
        const otpSettings = res.data?.settings?.otp;
        if (!otpSettings) return;
        const channels = (otpSettings.channels || ["sms"]).filter(
          (c): c is OtpChannel => c === "sms" || c === "whatsapp"
        );
        if (channels.length) setOtpChannels(channels);
        if (
          otpSettings.defaultChannel === "sms" ||
          otpSettings.defaultChannel === "whatsapp"
        ) {
          setOtpChannel(otpSettings.defaultChannel);
        }
        setAllowChannelChoice(
          !!otpSettings.allowUserChoice && channels.length > 1
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.replace(/\D/g, "").length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await sendOtp(mobile.replace(/\D/g, ""), otpChannel);
      if (res.success) {
        const used = (res.data?.channel as OtpChannel) || otpChannel;
        setSentChannel(used);
        setStep("otp");
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch (err: unknown) {
      const msg = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setError(msg || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await verifyOtp(
        mobile.replace(/\D/g, ""),
        otp,
        undefined,
        referralCode || undefined
      );
      if (res.success && res.data) {
        setSession(res.data.accessToken, res.data.user);
        router.push(redirect);
      } else {
        setError(res.message || "Invalid OTP");
      }
    } catch (err: unknown) {
      const msg = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setError(msg || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setOtp("");
    try {
      const res = await sendOtp(mobile.replace(/\D/g, ""), otpChannel);
      if (res.success) {
        const used = (res.data?.channel as OtpChannel) || otpChannel;
        setSentChannel(used);
      } else {
        setError(res.message || "Failed to resend OTP");
      }
    } catch (err: unknown) {
      const msg = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setError(msg || "Failed to resend OTP");
    }
  };

  const deliveryLabel =
    sentChannel === "whatsapp"
      ? `OTP sent via WhatsApp to +91 ${mobile}`
      : `OTP sent via SMS to +91 ${mobile}`;

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left brand panel ── */}
      <BrandPanel />

      {/* ── Right form panel ── */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-[#F4F6F8]">
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(11,59,111,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,59,111,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top bar */}
        <div className="relative flex items-center justify-between px-4 pt-4 pb-0 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-[#FF6C00] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Logo — mobile only */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6C00]">
              <ShoppingCart className="h-4 w-4 text-white" strokeWidth={1.75} />
            </div>
            <span className="text-base font-bold text-neutral-900">
              {SITE_NAME}
            </span>
          </div>
        </div>

        {/* Trust strip — mobile only, desktop already has BrandPanel's stats */}
        <div className="relative mt-4 flex items-center justify-center gap-2 px-4 lg:hidden">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
          </span>
          <span className="text-xs font-semibold text-neutral-500">
            Trusted by thousands of verified businesses across India
          </span>
        </div>

        {/* Step progress */}
        <div className="relative mx-auto mt-6 flex w-full max-w-sm items-center gap-2 px-4">
          <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step === "mobile" || step === "otp" ? "bg-[#FF6C00]" : "bg-neutral-200"}`} />
          <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step === "otp" ? "bg-[#FF6C00]" : "bg-neutral-200"}`} />
        </div>

        {/* Centered form */}
        <div className="relative flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm">
            {step === "mobile" ? (
              /* ── Step 1: Phone ── */
              <div className="animate-[fadeIn_200ms_ease-out]">
                <div className="mb-8">
                  {/* Icon */}
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#FFD9B0] bg-[#FFF3E8]">
                    {otpChannel === "whatsapp" ? (
                      <FaWhatsapp className="h-5 w-5 text-[#FF6C00]" />
                    ) : (
                      <Phone
                        className="h-5 w-5 text-[#FF6C00]"
                        strokeWidth={1.75}
                      />
                    )}
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Welcome back
                  </h2>
                  <p className="mt-1.5 text-sm text-neutral-500">
                    Enter your mobile number to receive an OTP
                  </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-7">
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    {/* Phone input */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-neutral-700">
                        Mobile Number
                      </label>
                      <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-neutral-300 bg-white transition-colors focus-within:border-[#FF6C00] focus-within:ring-2 focus-within:ring-[#FF6C00]/20">
                        <span className="flex shrink-0 items-center border-r border-neutral-200 bg-neutral-50 px-3 text-sm font-semibold text-neutral-600">
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={mobile}
                          onChange={(e) =>
                            setMobile(
                              e.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                          }
                          placeholder="9876543210"
                          maxLength={10}
                          required
                          disabled={loading}
                          className="h-full w-full px-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
                        />
                      </div>
                    </div>

                    {/* Channel choice */}
                    {allowChannelChoice && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700">
                          Receive OTP via
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {otpChannels.includes("sms") && (
                            <button
                              type="button"
                              onClick={() => setOtpChannel("sms")}
                              disabled={loading}
                              className={[
                                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                                otpChannel === "sms"
                                  ? "border-[#FF6C00] bg-[#F0F0F0] text-[#E86200]"
                                  : "border-neutral-300 text-neutral-600 hover:border-[#FF6C00]/40 hover:text-[#FF6C00]",
                                loading ? "cursor-not-allowed opacity-50" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              SMS
                            </button>
                          )}
                          {otpChannels.includes("whatsapp") && (
                            <button
                              type="button"
                              onClick={() => setOtpChannel("whatsapp")}
                              disabled={loading}
                              className={[
                                "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                                otpChannel === "whatsapp"
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                  : "border-neutral-300 text-neutral-600 hover:border-emerald-600/40 hover:text-emerald-700",
                                loading ? "cursor-not-allowed opacity-50" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              <FaWhatsapp className="h-4 w-4" />
                              WhatsApp
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-[#FEE2E2] px-3 py-2.5">
                        <span className="mt-px h-4 w-4 shrink-0 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center">
                          !
                        </span>
                        <p className="text-sm text-[#DC2626]">{error}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || mobile.length !== 10}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#FF6C00] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(255,108,0,0.3)] transition-all duration-200 ease-out hover:bg-[#E86200] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {loading
                        ? "Sending…"
                        : otpChannel === "whatsapp"
                          ? "Send OTP on WhatsApp"
                          : "Send OTP"}
                    </button>
                  </form>
                </div>

                {/* Terms */}
                <p className="mt-5 text-center text-xs text-neutral-400">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-[#FF6C00] hover:underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-[#FF6C00] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            ) : (
              /* ── Step 2: OTP ── */
              <div className="animate-[fadeIn_200ms_ease-out]">
                <div className="mb-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#FFD9B0] bg-[#FFF3E8]">
                    {sentChannel === "whatsapp" ? (
                      <FaWhatsapp className="h-5 w-5 text-[#FF6C00]" />
                    ) : (
                      <Phone
                        className="h-5 w-5 text-[#FF6C00]"
                        strokeWidth={1.75}
                      />
                    )}
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Enter OTP
                  </h2>
                  <p className="mt-1.5 text-sm text-neutral-500">
                    {deliveryLabel}
                  </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-7">
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    {/* OTP boxes */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-700">
                        6-digit OTP
                      </label>
                      <OtpBoxes
                        value={otp}
                        onChange={setOtp}
                        disabled={loading}
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-[#FEE2E2] px-3 py-2.5">
                        <span className="mt-px h-4 w-4 shrink-0 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center">
                          !
                        </span>
                        <p className="text-sm text-[#DC2626]">{error}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || otp.replace(/\D/g, "").length !== 6}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#FF6C00] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(255,108,0,0.3)] transition-all duration-200 ease-out hover:bg-[#E86200] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {loading ? "Verifying…" : "Verify & Login"}
                    </button>

                    {/* Resend + change number */}
                    <div className="flex items-center justify-between pt-1">
                      <ResendTimer onResend={handleResend} disabled={loading} />
                      <button
                        type="button"
                        onClick={() => {
                          setStep("mobile");
                          setOtp("");
                          setError("");
                        }}
                        disabled={loading}
                        className="text-sm font-medium text-neutral-500 hover:text-[#FF6C00] transition-colors disabled:opacity-50"
                      >
                        Change number
                      </button>
                    </div>
                  </form>
                </div>

                {/* Terms */}
                <p className="mt-5 text-center text-xs text-neutral-400">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-[#FF6C00] hover:underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-[#FF6C00] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-200" />
            <div className="h-4 w-32 animate-pulse rounded-md bg-neutral-200" />
            <div className="h-3 w-24 animate-pulse rounded-md bg-neutral-100" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
