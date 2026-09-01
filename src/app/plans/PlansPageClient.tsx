"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Headphones,
  Megaphone,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { extractBusinessList, getMyBusinesses } from "@/lib/api/business";
import {
  createPaymentOrder,
  getPaymentConfig,
  getPlans,
  loadRazorpayScript,
  verifyPayment,
  type PlanFromApi,
} from "@/lib/api/payment";
import type { Business } from "@/types";
import { PlansFaq } from "./PlansFaq";

const UPGRADE_STEPS = [
  {
    step: "1",
    title: "Pick a plan",
    desc: "Compare features and choose the tier that fits your growth goals.",
  },
  {
    step: "2",
    title: "Select your business",
    desc: "Upgrade the listing you want to promote — one business per subscription.",
  },
  {
    step: "3",
    title: "Pay & go live",
    desc: "Complete Razorpay checkout. Premium benefits activate instantly.",
  },
] as const;

const PLAN_BENEFITS = [
  "Priority ranking in search results",
  "Featured badge on your profile",
  "More calls, WhatsApp & RFQ leads",
  "Seller analytics & engagement stats",
  "Higher trust with verified buyers",
  "Renew or upgrade anytime",
] as const;

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function PlanCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="h-5 w-20 rounded-full bg-neutral-200" />
      <div className="mt-5 h-10 w-28 rounded-lg bg-neutral-100" />
      <div className="mt-1 h-4 w-16 rounded bg-neutral-100" />
      <div className="mt-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 shrink-0 rounded-full bg-neutral-200" />
            <div className="h-3 flex-1 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
      <div className="mt-8 h-10 rounded-lg bg-neutral-200" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface PlansPageClientProps {
  initialTitle?: string;
  initialSubtitle?: string;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function PlansPageClient({
  initialTitle = "Premium Plans for Growing Businesses",
  initialSubtitle = "Get featured visibility, priority ranking, lead insights, and tools to convert more enquiries — upgrade in minutes.",
}: PlansPageClientProps) {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<PlanFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanFromApi | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pageTitle, setPageTitle] = useState(initialTitle);
  const [pageSubtitle, setPageSubtitle] = useState(initialSubtitle);

  useEffect(() => {
    Promise.all([getPlans(), getPaymentConfig()])
      .then(([plansRes, configRes]) => {
        if (plansRes.success && plansRes.data) {
          const payload = plansRes.data;
          if (Array.isArray(payload)) {
            setPlans(payload);
          } else {
            setPlans(Array.isArray(payload.plans) ? payload.plans : []);
            if (payload.pageTitle) setPageTitle(payload.pageTitle);
            if (payload.pageSubtitle) setPageSubtitle(payload.pageSubtitle);
          }
        }
        if (configRes.success && configRes.data) {
          setPaymentsEnabled(!!configRes.data.enabled);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openCheckout = async (plan: PlanFromApi) => {
    setError("");
    if (plan.price <= 0) {
      router.push("/register-business");
      return;
    }
    if (!isAuthenticated) {
      router.push("/login?redirect=/plans");
      return;
    }

    setSelectedPlan(plan);
    const bizRes = await getMyBusinesses();
    if (bizRes.success && bizRes.data) {
      const list = extractBusinessList(bizRes.data);
      setBusinesses(list);
      if (list.length === 1) setSelectedBusinessId(String(list[0]._id));
    }
  };

  const handlePay = async () => {
    if (!selectedPlan || !selectedBusinessId) {
      setError("Please select a business to upgrade");
      return;
    }

    setCheckoutLoading(true);
    setError("");

    try {
      const orderRes = await createPaymentOrder({
        planId: selectedPlan.id,
        businessId: selectedBusinessId,
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || "Could not create payment order");
      }

      const { order, keyId, paymentsEnabled: enabled } = orderRes.data;

      if (!enabled || !keyId) {
        setError(
          "Online payments are not configured yet. Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET to backend .env"
        );
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setError("Failed to load Razorpay checkout");
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Tradexo",
        description: `${selectedPlan.name} Plan Subscription`,
        order_id: order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.mobile || "",
        },
        theme: { color: "#FF6C00" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setSelectedPlan(null);
              setSuccessMsg(
                `${selectedPlan.name} plan activated! Your business is now upgraded.`
              );
            } else {
              setError(verifyRes.message || "Payment verification failed");
            }
          } catch {
            setError("Payment verification failed");
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: () => setCheckoutLoading(false),
        },
      });

      rzp.open();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Checkout failed");
      setCheckoutLoading(false);
    }
  };

  const isPopular = (plan: PlanFromApi) => plan.popular || plan.id === "premium";

  /* ---------- Enterprise detection heuristic ---------- */
  const isEnterprise = (plan: PlanFromApi) =>
    plan.name.toLowerCase().includes("enterprise") || plan.id === "enterprise";

  return (
    <div className="bg-neutral-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-8xl space-y-12">

        {/* ------------------------------------------------------------------ */}
        {/* Demo / info strip                                                   */}
        {/* ------------------------------------------------------------------ */}
        {!paymentsEnabled && !loading && (
          <div className="flex items-start gap-3 rounded-xl border border-[#D4D4D4] bg-[#F0F0F0] px-5 py-4">
            <span className="mt-0.5 text-[#FF6C00]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 10.5h-1.5v-1.5h1.5v1.5zm0-3h-1.5V4h1.5v4.5z" />
              </svg>
            </span>
            <p className="text-sm text-neutral-700">
              <span className="font-semibold text-neutral-900">Demo mode — </span>
              Configure Razorpay keys in backend to enable live checkout.
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Success state                                                       */}
        {/* ------------------------------------------------------------------ */}
        {successMsg && (
          <div className="rounded-xl border border-[#DCFCE7] bg-[#DCFCE7] p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-[#16A34A]" />
            <p className="mt-3 text-lg font-bold text-neutral-900">{successMsg}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button href="/dashboard" size="md">
                Go to Seller Portal
              </Button>
              <Button href="/dashboard/billing" size="md" variant="outline">
                View billing
              </Button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Pricing grid                                                        */}
        {/* ------------------------------------------------------------------ */}
        <section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Choose your plan</h2>
              <p className="mt-1.5 text-base text-neutral-500">
                Flexible tiers for local shops, service providers, and B2B suppliers
              </p>
            </div>
            <Button href="/register-business" variant="outline" size="sm">
              Start free listing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* ---------- Loading ---------- */}
          {loading || authLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <PlanCardSkeleton key={i} />
              ))}
            </div>
          ) : plans.length === 0 ? (
            /* ---------- Empty ---------- */
            <div className="rounded-xl border border-neutral-100 bg-white py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <Star className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-base font-semibold text-neutral-900">Plans coming soon</p>
              <p className="mt-2 text-sm text-neutral-500">
                Register your business for free while we finalize pricing.
              </p>
              <Button href="/register-business" className="mt-6 inline-flex">
                Register business
              </Button>
            </div>
          ) : (
            /* ---------- Plans ---------- */
            <div
              className={`grid gap-6 ${
                plans.length >= 5
                  ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                  : plans.length >= 3
                    ? "sm:grid-cols-2 lg:grid-cols-3"
                    : "sm:grid-cols-2"
              }`}
            >
              {plans.map((plan) => {
                const popular = isPopular(plan);
                const enterprise = isEnterprise(plan);
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-xl bg-white p-6 transition-all duration-200 ${
                      popular
                        ? "border-2 border-[#FF6C00] shadow-[0_8px_32px_rgba(255,108,0,0.15)] lg:scale-[1.02]"
                        : "border border-neutral-100 shadow-sm hover:border-[#FF6C00]/20 hover:shadow-md hover:translate-y-[-2px]"
                    }`}
                  >
                    {/* Most popular badge */}
                    {popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6C00] px-3 py-1 text-xs font-bold text-white shadow-sm">
                          <Star className="h-3 w-3" aria-hidden />
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Plan name + icon */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          popular
                            ? "bg-[#E5E5E5] text-[#FF6C00]"
                            : enterprise
                              ? "bg-neutral-900 text-white"
                              : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {plan.name}
                      </span>
                      {plan.price > 0 && (
                        <Sparkles
                          className={`h-4 w-4 shrink-0 ${popular ? "text-[#FF6C00]" : "text-neutral-400"}`}
                          aria-hidden
                        />
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-5">
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-extrabold tracking-tight text-neutral-900">
                          {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
                        </span>
                      </div>
                      {plan.price > 0 && (
                        <p className="mt-0.5 text-sm text-neutral-400">
                          / {plan.durationDays || 30} days
                        </p>
                      )}
                      {plan.price === 0 && (
                        <p className="mt-0.5 text-sm text-neutral-400">forever</p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="my-5 h-px bg-neutral-100" />

                    {/* Features */}
                    <ul className="flex-1 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-600">
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              popular ? "text-[#FF6C00]" : "text-[#16A34A]"
                            }`}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={() => openCheckout(plan)}
                      className={`mt-7 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        enterprise
                          ? "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-700"
                          : popular
                            ? "bg-[#FF6C00] text-white shadow-sm hover:bg-[#E86200] focus-visible:ring-[#FF6C00]/50"
                            : "border border-neutral-300 bg-white text-neutral-700 hover:border-[#FF6C00] hover:text-[#FF6C00] focus-visible:ring-neutral-300"
                      }`}
                    >
                      {plan.price === 0 ? (
                        <>
                          <Building2 className="h-4 w-4" />
                          Get started free
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          {enterprise ? "Contact sales" : "Upgrade now"}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Body: how-it-works + FAQ + sidebar                                  */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Left / main column */}
          <section className="space-y-8 lg:col-span-2">

            {/* How it works */}
            <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="flex items-center gap-2.5 text-xl font-bold text-neutral-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F0F0]">
                  <BarChart3 className="h-4 w-4 text-[#FF6C00]" />
                </span>
                How upgrade works
              </h2>
              <ol className="mt-7 space-y-6">
                {UPGRADE_STEPS.map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF6C00] text-sm font-bold text-white shadow-sm">
                      {step}
                    </span>
                    <div className="pt-1">
                      <p className="font-semibold text-neutral-900">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-500">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Why upgrade */}
            <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-neutral-900">Why upgrade?</h2>
              <p className="mt-1.5 text-sm text-neutral-500">
                Premium plans help serious sellers stand out when buyers compare options
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {PLAN_BENEFITS.map((b) => (
                  <div
                    key={b}
                    className="flex items-center gap-2.5 rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 transition-colors duration-150 hover:border-[#FF6C00]/20 hover:bg-[#F0F0F0]"
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-[#FF6C00]" />
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <section>
              <h2 className="mb-5 text-xl font-bold text-neutral-900">
                Frequently asked questions
              </h2>
              <PlansFaq />
            </section>

            {/* Trust / logo strip */}
            <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-center text-sm font-semibold uppercase tracking-widest text-neutral-400">
                Join thousands of businesses on Tradexo
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 opacity-60 grayscale">
                {/* Logo placeholders — replace with real <Image> tags when available */}
                {[
                  "Metals & Alloys",
                  "Textile Hub",
                  "AgriSupply",
                  "ChemSource",
                  "BuildMart",
                ].map((name) => (
                  <div
                    key={name}
                    className="flex h-8 items-center justify-center rounded-md bg-neutral-100 px-4"
                  >
                    <span className="text-xs font-semibold text-neutral-500">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">

            {/* Not ready CTA */}
            <div className="sticky top-24 space-y-5">
              <div className="rounded-xl border border-[#D4D4D4] bg-gradient-to-br from-[#F0F0F0] to-white p-6 shadow-md">
                <h2 className="text-lg font-bold text-neutral-900">Not ready to upgrade?</h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  List your business for free and start receiving calls, WhatsApp messages, and RFQ
                  enquiries today.
                </p>
                <div className="mt-5 space-y-2.5">
                  <Button href="/register-business" className="flex w-full justify-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Register for free
                  </Button>
                  <Button href="/dashboard" variant="outline" className="flex w-full justify-center">
                    Open seller dashboard
                  </Button>
                </div>
              </div>

              {/* Need more reach */}
              <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900">
                  <Megaphone className="h-4 w-4 text-[#FF6C00]" />
                  Need more reach?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  Explore featured ads, city promotions, and banner placements for larger campaigns.
                </p>
                <Button
                  href="/page/advertise"
                  variant="outline"
                  className="mt-4 flex w-full justify-center gap-2"
                  size="sm"
                >
                  View advertising options
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Need help */}
              <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900">
                  <Headphones className="h-4 w-4 text-[#FF6C00]" />
                  Need help choosing?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  Our support team can help you pick the right plan for your category and city.
                </p>
                <Button
                  href="/support"
                  variant="outline"
                  className="mt-4 flex w-full justify-center"
                  size="sm"
                >
                  Contact support
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Checkout modal                                                        */}
      {/* -------------------------------------------------------------------- */}
      <Modal
        open={!!selectedPlan}
        onClose={() => {
          if (!checkoutLoading) setSelectedPlan(null);
        }}
        title={selectedPlan ? `Upgrade to ${selectedPlan.name}` : "Checkout"}
      >
        {selectedPlan && (
          <div className="space-y-5">
            {/* Plan summary */}
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Selected plan
              </p>
              <p className="mt-1 text-xl font-bold text-neutral-900">
                {selectedPlan.name}
              </p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-neutral-900">
                  ₹{selectedPlan.price.toLocaleString("en-IN")}
                </span>
                <span className="mb-1 text-sm text-neutral-400">
                  / {selectedPlan.durationDays || 30} days
                </span>
              </div>
            </div>

            {/* Business selector */}
            {businesses.length === 0 ? (
              <div className="rounded-xl border border-[#D4D4D4] bg-[#F0F0F0] p-4 text-sm text-neutral-700">
                No business found.{" "}
                <Link href="/register-business" className="font-semibold text-[#FF6C00] underline underline-offset-2">
                  Register a business
                </Link>{" "}
                first to upgrade.
              </div>
            ) : (
              <div>
                <label
                  htmlFor="business-select"
                  className="mb-1.5 block text-sm font-semibold text-neutral-700"
                >
                  Select business to upgrade
                </label>
                <div className="relative">
                  <select
                    id="business-select"
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-9 text-sm text-neutral-900 outline-none transition-colors focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Choose business...</option>
                    {businesses.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} {b.city ? `(${b.city})` : ""}
                      </option>
                    ))}
                  </select>
                  {/* Custom chevron */}
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg
                      className="h-4 w-4 text-neutral-400"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden
                    >
                      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-[#FEE2E2] bg-[#FEE2E2] px-4 py-3 text-sm text-[#DC2626]">
                <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 10.5h-1.5v-1.5h1.5v1.5zm0-3h-1.5V4h1.5v4.5z" />
                </svg>
                {error}
              </div>
            )}

            {/* Pay button */}
            <Button
              className="w-full justify-center gap-2"
              loading={checkoutLoading}
              disabled={!selectedBusinessId || businesses.length === 0}
              onClick={handlePay}
            >
              <CreditCard className="h-4 w-4" />
              Pay ₹{selectedPlan.price.toLocaleString("en-IN")} with Razorpay
            </Button>

            <p className="text-center text-xs text-neutral-400">
              Secure payment powered by Razorpay · UPI, cards &amp; net banking
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
