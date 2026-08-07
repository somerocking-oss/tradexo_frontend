"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  IndianRupee,
  LogIn,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Sparkles,
  ShieldCheck,
  Trash2,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CityInput } from "@/components/search/CityInput";
import { createRfq } from "@/lib/api/lead";
import { sendOtp, verifyOtp } from "@/lib/api/auth";
import { getAiSettings, parseRfqWithAi } from "@/lib/api/ai";
import { fetchAllCategories } from "@/lib/api/category";
import { useAuth } from "@/context/AuthContext";
import { useUserCity } from "@/hooks/useUserCity";
import { cn } from "@/lib/utils";
import type { Category, RfqLineItem } from "@/types";

// ── constants ────────────────────────────────────────────────────────────────

const EMPTY_ITEM: RfqLineItem = {
  productName: "",
  categoryId: "",
  quantity: undefined,
  unit: "pieces",
  specifications: "",
};

const UNIT_OPTIONS = [
  { value: "pieces", label: "Pieces" },
  { value: "kg", label: "Kg" },
  { value: "tons", label: "Tons" },
  { value: "litres", label: "Litres" },
  { value: "boxes", label: "Boxes" },
  { value: "sets", label: "Sets" },
];

const SIDEBAR_STEPS = [
  { label: "Fill requirement", hint: "Describe product, quantity & city" },
  { label: "Get quotes", hint: "Matched suppliers send quotes" },
  { label: "Compare & choose", hint: "Compare prices & finalize deal" },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Verified suppliers only",
    desc: "Every supplier is KYC-verified before listing",
  },
  {
    icon: MessageSquare,
    title: "Free quotes — no commission",
    desc: "We never charge buyers. Quotes are 100% free",
  },
  {
    icon: MapPin,
    title: "Local suppliers in your city",
    desc: "Get quotes from nearby businesses for faster delivery",
  },
  {
    icon: Phone,
    title: "Direct call & WhatsApp",
    desc: "Connect directly without any middlemen",
  },
];

// ── sub-components ────────────────────────────────────────────────────────────

function SelectField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 pr-8 text-sm text-neutral-800 outline-none transition-colors focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20"
      >
        {UNIT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-neutral-400">
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.5 6l3.5 4 3.5-4H4.5z" />
        </svg>
      </span>
    </div>
  );
}

function CategorySelectField({
  value,
  categories,
  onChange,
  className,
}: {
  value: string;
  categories: Category[];
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 pr-8 text-sm text-neutral-800 outline-none transition-colors focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20"
      >
        <option value="">Category (optional)</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-neutral-400">
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.5 6l3.5 4 3.5-4H4.5z" />
        </svg>
      </span>
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Package;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F0F0] text-[#FF6C00]">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-neutral-700">
      {children}
      {required && <span className="ml-0.5 text-[#FF6C00]">*</span>}
    </label>
  );
}

function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: Zap, label: "Fast quotes" },
        { icon: ShieldCheck, label: "100% free" },
        { icon: Users, label: "10k+ buyers" },
      ].map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1.5 rounded-lg border border-neutral-100 bg-white py-3 text-center shadow-sm"
        >
          <Icon className="h-5 w-5 text-[#FF6C00]" />
          <span className="text-xs font-medium text-neutral-600">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── success state ─────────────────────────────────────────────────────────────

function SuccessState({
  mode,
  matchedCount,
  city,
  phone,
  isAuthenticated,
  onReset,
}: {
  mode: "single" | "bulk";
  matchedCount: number;
  city: string;
  phone: string;
  isAuthenticated: boolean;
  onReset: () => void;
}) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      {/* checkmark */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#DCFCE7] ring-8 ring-[#DCFCE7]/40">
        <CheckCircle2 className="h-10 w-10 text-[#16A34A]" />
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
        Requirement Posted!
      </h2>

      <p className="mt-4 text-base leading-relaxed text-neutral-600">
        {mode === "bulk" ? "Bulk RFQ" : "Your RFQ"} has been submitted successfully.{" "}
        {matchedCount > 0 ? (
          <>
            <span className="font-semibold text-[#FF6C00]">
              {matchedCount} verified supplier{matchedCount > 1 ? "s" : ""}
            </span>{" "}
            in {city || "your city"} will contact you on{" "}
            <span className="font-semibold text-neutral-900">{phone}</span>.
          </>
        ) : (
          <>
            Verified suppliers in {city || "your city"} will reach out on{" "}
            <span className="font-semibold text-neutral-900">{phone}</span>.
          </>
        )}
      </p>

      {/* "within 24h" callout */}
      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F0F0F0] px-4 py-2 text-sm font-semibold text-[#FF6C00]">
        <Clock className="h-4 w-4" />
        You&apos;ll receive quotes within 24 hours
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {isAuthenticated ? (
          <Button
            size="lg"
            onClick={() => router.push("/profile/requirements")}
          >
            View My Quotes <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => router.push("/login?redirect=/profile/requirements")}
          >
            Login to Track Quotes <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/listings")}
        >
          Browse Suppliers
        </Button>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 text-sm text-neutral-400 underline-offset-2 hover:text-[#FF6C00] hover:underline"
      >
        Post another requirement
      </button>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function PostRequirementForm({
  initialProduct = "",
  initialCity = "",
  initialBulk = false,
}: {
  initialProduct?: string;
  initialCity?: string;
  initialBulk?: boolean;
}) {
  const { user, isAuthenticated, loading: authLoading, setSession } = useAuth();
  const { setCity: saveCity, detecting, detectCity } = useUserCity({ autoDetect: false });

  const [mode, setMode] = useState<"single" | "bulk">(initialBulk ? "bulk" : "single");
  const [productName, setProductName] = useState(initialProduct);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pieces");
  const [items, setItems] = useState<RfqLineItem[]>([{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }]);
  const [city, setCity] = useState(initialCity);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [exclusivity, setExclusivity] = useState<"shared" | "exclusive">("shared");
  const [website, setWebsite] = useState(""); // honeypot — must stay empty

  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiApplied, setAiApplied] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getAiSettings()
      .then((settings) => setAiAvailable(settings.enabled && settings.features.rfqHelper))
      .catch(() => setAiAvailable(false));
    fetchAllCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleAiAutofill = async () => {
    if (aiText.trim().length < 10) {
      setAiError("Describe your requirement in at least 10 characters");
      return;
    }
    setAiLoading(true);
    setAiError("");
    try {
      const res = await parseRfqWithAi({ text: aiText });
      if (res.success && res.data) {
        const result = res.data;
        if (result.title) setProductName(result.title);
        if (result.city) setCity(result.city);
        if (result.quantity && /^\d+$/.test(result.quantity.trim())) {
          setQuantity(result.quantity.trim());
        }
        if (result.category) {
          const match = categories.find(
            (c) => c.name.toLowerCase() === result.category!.toLowerCase()
          );
          if (match) setCategoryId(match._id);
        }
        const detailParts = [
          result.budget ? `Budget: ${result.budget}` : "",
          result.timeline ? `Timeline: ${result.timeline}` : "",
          result.details || "",
        ].filter(Boolean);
        if (detailParts.length) setMessage(detailParts.join("\n"));
        setAiApplied(true);
      } else {
        setAiError(res.message || "Could not parse requirement. Try rephrasing.");
      }
    } catch {
      setAiError("Could not parse requirement. Try rephrasing.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.name) setName((prev) => prev || user.name || "");
    if (user.mobile) {
      setPhone((prev) => prev || user.mobile!.replace(/\D/g, "").slice(-10));
    }
    if (user.email) setEmail((prev) => prev || user.email || "");
  }, [user]);

  const updateItem = (index: number, patch: Partial<RfqLineItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const phoneVerified = isAuthenticated || (otpStep === "verified" && verifiedPhone === phone);

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    setOtpSending(true);
    setOtpError("");
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setOtpStep("sent");
        setOtpCode("");
      } else {
        setOtpError(res.message || "Failed to send OTP");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
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
      const res = await verifyOtp(phone, otpCode);
      if (res.success && res.data) {
        setSession(res.data.accessToken, res.data.user);
        setOtpStep("verified");
        setVerifiedPhone(phone);
        setError("");
      } else {
        setOtpError(res.message || "Invalid OTP");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setOtpError(msg || "Invalid OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneVerified) {
      setError("Please verify your mobile number to post the requirement");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (city.trim()) saveCity(city);

      const bulkItems =
        mode === "bulk"
          ? items
              .filter((item) => item.productName.trim())
              .map((item) => ({
                productName: item.productName.trim(),
                categoryId: (typeof item.categoryId === "string" && item.categoryId) || undefined,
                quantity: item.quantity ? Number(item.quantity) : undefined,
                unit: item.unit,
                specifications: item.specifications?.trim() || undefined,
              }))
          : undefined;

      if (mode === "bulk" && (bulkItems?.length || 0) < 2) {
        setError("Add at least 2 products for a bulk RFQ");
        setLoading(false);
        return;
      }

      const res = await createRfq({
        productName:
          mode === "bulk" ? `${bulkItems!.length} products bulk order` : productName,
        quantity: mode === "single" && quantity ? Number(quantity) : undefined,
        unit: mode === "single" ? unit : undefined,
        deliveryCity: city,
        customerName: name,
        phone,
        email,
        message,
        requirement: message,
        categoryId: mode === "single" ? categoryId || undefined : undefined,
        items: bulkItems,
        exclusivity,
        website,
      });

      if (res.success) {
        const data = res.data as { matchedSupplierCount?: number } | undefined;
        setMatchedCount(data?.matchedSupplierCount || 0);
        setSuccess(true);
      } else {
        setError(res.message || "Failed to post requirement");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setError(msg || "Failed to post requirement");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SuccessState
        mode={mode}
        matchedCount={matchedCount}
        city={city}
        phone={phone}
        isAuthenticated={isAuthenticated}
        onReset={() => {
          setSuccess(false);
          setProductName("");
          setQuantity("");
          setUnit("pieces");
          setItems([{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }]);
          setMessage("");
          setError("");
          setExclusivity("shared");
        }}
      />
    );
  }

  const showGuestCard = !authLoading && !isAuthenticated;

  return (
    <div className="bg-neutral-200 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">

          {/* ── LEFT COLUMN: form ─────────────────────────────────────── */}
          <div className="space-y-6">

            {/* page heading */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Post Your Requirement
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Fill in the details below and get free quotes from verified suppliers.
              </p>
            </div>

            {/* AI auto-fill */}
            {aiAvailable && (
              <div className="rounded-xl border border-[#FFE0C2] bg-[#FFF7ED] p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FF6C00]" />
                  <p className="text-sm font-semibold text-neutral-900">
                    Describe your need in your own words — AI fills the form for you
                  </p>
                </div>
                <textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  rows={2}
                  placeholder="e.g. Need 500 corrugated boxes for packaging in Pune, budget around 50k, needed within 2 weeks"
                  className="mt-2.5 w-full rounded-lg border border-[#FFE0C2] bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20"
                />
                {aiError && <p className="mt-1.5 text-xs font-medium text-red-600">{aiError}</p>}
                {aiApplied && !aiError && (
                  <p className="mt-1.5 text-xs font-medium text-emerald-600">Form filled — review and adjust below.</p>
                )}
                <Button
                  type="button"
                  size="sm"
                  loading={aiLoading}
                  onClick={handleAiAutofill}
                  className="mt-2.5 gap-1.5 bg-[#FF6C00] text-white hover:bg-[#E86200]"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Auto-fill with AI
                </Button>
              </div>
            )}

            {/* mode toggle */}
            <div className="flex gap-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
              {(["single", "bulk"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                    mode === m
                      ? "bg-[#FF6C00] text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800"
                  )}
                >
                  {m === "single" ? "Single Product" : "Bulk Order (2+ items)"}
                </button>
              ))}
            </div>

            {/* exclusivity toggle */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="mb-2.5 text-sm font-semibold text-neutral-900">
                Who should see this requirement?
              </p>
              <div className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1">
                {(
                  [
                    {
                      value: "shared" as const,
                      label: "Shared",
                      hint: "Compare quotes from multiple suppliers",
                    },
                    {
                      value: "exclusive" as const,
                      label: "Exclusive",
                      hint: "Only one supplier will see this requirement",
                    },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExclusivity(opt.value)}
                    className={cn(
                      "flex-1 rounded-md px-3 py-2 text-left text-xs font-medium transition-all duration-200",
                      exclusivity === opt.value
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-700"
                    )}
                  >
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="block text-[11px] text-neutral-400">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* form card */}
            <form onSubmit={handleSubmit}>
              <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8">
                {/* Honeypot — hidden from real users, tempting for bots */}
                <div aria-hidden="true" className="sr-only">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="space-y-8">

                  {/* ── SECTION 1: What do you need ── */}
                  <FormSection icon={Package} title="What do you need?">
                    {mode === "single" ? (
                      <div className="space-y-4">
                        <div>
                          <FieldLabel required>Product / Service</FieldLabel>
                          <Input
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="e.g. Packaging boxes, Industrial valves, CA services"
                            required
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <FieldLabel>Quantity</FieldLabel>
                            <Input
                              type="number"
                              min={1}
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              placeholder="e.g. 100"
                            />
                          </div>
                          <div>
                            <FieldLabel>Unit</FieldLabel>
                            <SelectField value={unit} onChange={setUnit} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-neutral-500">Add at least 2 products</p>
                          <button
                            type="button"
                            onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-[#FF6C00] hover:text-[#FF6C00]"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add Item
                          </button>
                        </div>
                        {items.map((item, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-neutral-100 bg-neutral-200 p-4"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                                Item {index + 1}
                              </span>
                              {items.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setItems((prev) => prev.filter((_, i) => i !== index))
                                  }
                                  className="rounded p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="sm:col-span-2">
                                <Input
                                  value={item.productName}
                                  onChange={(e) =>
                                    updateItem(index, { productName: e.target.value })
                                  }
                                  placeholder="Product name *"
                                  required={index < 2}
                                />
                              </div>
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity ?? ""}
                                onChange={(e) =>
                                  updateItem(index, {
                                    quantity: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                placeholder="Quantity"
                              />
                              <SelectField
                                value={item.unit || "pieces"}
                                onChange={(v) => updateItem(index, { unit: v })}
                              />
                              <CategorySelectField
                                value={typeof item.categoryId === "string" ? item.categoryId : ""}
                                categories={categories}
                                onChange={(v) => updateItem(index, { categoryId: v })}
                                className="sm:col-span-2"
                              />
                              <div className="sm:col-span-2">
                                <Input
                                  value={item.specifications || ""}
                                  onChange={(e) =>
                                    updateItem(index, { specifications: e.target.value })
                                  }
                                  placeholder="Specifications (optional)"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </FormSection>

                  {/* ── SECTION 2: Delivery & details ── */}
                  <FormSection icon={Truck} title="Delivery & details">
                    <div>
                      <FieldLabel required>Delivery City</FieldLabel>
                      <div className="rounded-lg border border-neutral-300 bg-white px-2 transition-colors focus-within:border-[#FF6C00] focus-within:ring-2 focus-within:ring-[#FF6C00]/20">
                        <CityInput
                          value={city}
                          onChange={setCity}
                          onDetect={async () => {
                            const detected = await detectCity();
                            if (detected) setCity(detected);
                          }}
                          detecting={detecting}
                          showDetectButton
                          inputClassName="h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Budget Range</FieldLabel>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                          <IndianRupee className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          value={message.match(/budget[:\s]+([^\n.]+)/i)?.[1] || ""}
                          onChange={(e) => {
                            const budgetLine = e.target.value
                              ? `Budget: ${e.target.value}`
                              : "";
                            setMessage((prev) => {
                              const cleaned = prev.replace(/^Budget:[^\n]*\n?/im, "").trim();
                              return budgetLine
                                ? `${budgetLine}\n${cleaned}`.trim()
                                : cleaned;
                            });
                          }}
                          placeholder="e.g. ₹50,000 – ₹1,00,000 (optional)"
                          className="h-10 w-full rounded-lg border border-neutral-300 bg-white py-0 pl-9 pr-3 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Detailed Requirement</FieldLabel>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/20"
                        placeholder="Brand preference, delivery timeline, quality specs, any other requirements..."
                      />
                    </div>
                  </FormSection>

                  {/* ── SECTION 3: Contact ── */}
                  <FormSection icon={Phone} title="Your contact">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel required>Your Name</FieldLabel>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div>
                        <FieldLabel required>Mobile</FieldLabel>
                        <div className="flex gap-2">
                          <Input
                            value={phone}
                            onChange={(e) => {
                              const next = e.target.value.replace(/\D/g, "").slice(0, 10);
                              setPhone(next);
                              if (otpStep !== "idle" && next !== verifiedPhone) {
                                setOtpStep("idle");
                                setOtpCode("");
                                setOtpError("");
                              }
                            }}
                            maxLength={10}
                            required
                            placeholder="10-digit mobile number"
                          />
                          {!isAuthenticated && phone.length === 10 && otpStep !== "verified" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              loading={otpSending}
                              onClick={handleSendOtp}
                              className="shrink-0"
                            >
                              {otpStep === "sent" ? "Resend" : "Verify"}
                            </Button>
                          )}
                        </div>
                        {!isAuthenticated && otpStep === "verified" && verifiedPhone === phone && (
                          <p className="mt-1.5 text-xs font-medium text-emerald-600">
                            ✓ Mobile number verified
                          </p>
                        )}
                        {!isAuthenticated && otpStep === "sent" && (
                          <div className="mt-2 flex gap-2">
                            <Input
                              value={otpCode}
                              onChange={(e) =>
                                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                              }
                              maxLength={6}
                              placeholder="Enter 6-digit OTP"
                              className="max-w-[160px]"
                            />
                            <Button
                              type="button"
                              size="sm"
                              loading={otpVerifying}
                              onClick={handleVerifyOtp}
                            >
                              Confirm
                            </Button>
                          </div>
                        )}
                        {otpError && (
                          <p className="mt-1.5 text-xs font-medium text-red-600">{otpError}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com (optional)"
                      />
                    </div>
                  </FormSection>

                  {/* error */}
                  {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-[#FEE2E2] px-4 py-3 text-sm text-[#DC2626]">
                      <span className="mt-0.5 shrink-0">⚠</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* submit */}
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="h-13 w-full text-base"
                      size="lg"
                      loading={loading}
                    >
                      {loading ? "Posting requirement…" : mode === "bulk"
                        ? "Post Bulk RFQ — Get Free Quotes"
                        : "Post Requirement — Get Free Quotes"}
                    </Button>
                    <p className="text-center text-xs text-neutral-400">
                      By posting, you agree to receive calls/WhatsApp from verified suppliers
                    </p>
                  </div>

                </div>
              </div>
            </form>
          </div>

          {/* ── RIGHT COLUMN: sidebar ─────────────────────────────────── */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">

            {/* guest card */}
            {showGuestCard && (
              <div className="rounded-xl border border-[#E5E5E5] bg-[#F0F0F0] p-5">
                <p className="font-semibold text-neutral-900">Guest posting enabled</p>
                <p className="mt-1.5 text-sm text-neutral-600">
                  No account needed — just verify your mobile number with an OTP before posting.
                </p>
                <Link
                  href="/login?redirect=/profile/requirements"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6C00] hover:underline"
                >
                  <LogIn className="h-4 w-4" /> Login to track quotes
                </Link>
              </div>
            )}

            {/* why post here */}
            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
                Why post here?
              </h3>
              <div className="mt-4 space-y-4">
                {BENEFITS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F0F0] text-[#FF6C00]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{title}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* trust badges */}
            <TrustBadges />

            {/* how it works */}
            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
                How it works
              </h3>
              <ol className="mt-4 space-y-4">
                {SIDEBAR_STEPS.map((step, i) => (
                  <li key={step.label} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0F0F0] text-xs font-bold text-[#FF6C00]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{step.label}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{step.hint}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-center text-xs text-neutral-400 lg:text-left">
              Need help?{" "}
              <Link href="/support" className="text-[#FF6C00] hover:underline">
                Contact support
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
