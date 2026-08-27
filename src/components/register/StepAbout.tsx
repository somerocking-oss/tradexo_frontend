"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  MIN_FULL_DESCRIPTION_LENGTH,
  MIN_SHORT_DESCRIPTION_LENGTH,
  RECOMMENDED_FULL_DESCRIPTION_LENGTH,
  type BusinessRegistrationDraft,
} from "@/lib/business-registration";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateListingWithAi, getAiSettings } from "@/lib/api/ai";
import type { Category } from "@/types";

interface Props {
  draft: BusinessRegistrationDraft;
  categories?: Category[];
  onChange: (patch: Partial<BusinessRegistrationDraft>) => void;
}

export function StepAbout({ draft, categories = [], onChange }: Props) {
  const isProduct = draft.providerType === "product";
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    getAiSettings()
      .then((settings) => {
        setAiEnabled(!!settings.enabled && !!settings.features?.listingAssistant);
      })
      .catch(() => setAiEnabled(false));
  }, []);

  const categoryLabel =
    categories.find(
      (c) => c._id === draft.primaryCategory || c.name === draft.primaryCategory
    )?.name || draft.primaryCategory;

  const handleGenerate = async () => {
    if (!draft.name.trim() || !draft.city.trim() || !categoryLabel) {
      setAiError("Fill business name, category, and city first (steps 2–3).");
      return;
    }

    setAiLoading(true);
    setAiError("");
    try {
      const res = await generateListingWithAi({
        name: draft.name.trim(),
        category: categoryLabel,
        city: draft.city.trim(),
        providerType: draft.providerType,
        keywords: draft.keywords,
      });

      if (res.success && res.data) {
        onChange({
          shortDescription: res.data.shortDescription || draft.shortDescription,
          description: res.data.description || draft.description,
          keywords: res.data.keywords || draft.keywords,
        });
      } else {
        setAiError(res.message || "AI generation failed");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setAiError(msg || "AI is unavailable. Check admin AI settings.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {aiEnabled && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleGenerate} loading={aiLoading}>
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
        </div>
      )}

      {aiError && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{aiError}</p>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Short Description *{" "}
            <span className="font-normal text-slate-400">
              ({MIN_SHORT_DESCRIPTION_LENGTH}–300 chars)
            </span>
          </label>
          <textarea
            rows={2}
            maxLength={300}
            placeholder={
              isProduct
                ? "e.g. Leading manufacturer of industrial packaging materials..."
                : "e.g. 24/7 home plumbing & electrical repair in South Delhi..."
            }
            value={draft.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
          />
          <p
            className={`mt-1 text-xs ${
              draft.shortDescription.trim().length < MIN_SHORT_DESCRIPTION_LENGTH
                ? "text-amber-600"
                : "text-slate-400"
            }`}
          >
            {draft.shortDescription.trim().length}/{MIN_SHORT_DESCRIPTION_LENGTH} minimum
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Full Description *{" "}
            <span className="font-normal text-slate-400">
              ({MIN_FULL_DESCRIPTION_LENGTH}+ chars, {RECOMMENDED_FULL_DESCRIPTION_LENGTH}+ recommended)
            </span>
          </label>
          <textarea
            rows={7}
            placeholder="Tell buyers what your business does, what products/services you provide, where you operate, and why customers should choose you. Include experience, certifications and delivery areas..."
            value={draft.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
          />
          <p
            className={`mt-1 text-xs ${
              draft.description.trim().length < MIN_FULL_DESCRIPTION_LENGTH
                ? "text-amber-600"
                : "text-slate-400"
            }`}
          >
            {draft.description.trim().length}/{MIN_FULL_DESCRIPTION_LENGTH} minimum
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {isProduct ? "Product Keywords" : "Service Keywords"}
          </label>
          <Input
            placeholder="Comma separated: e.g. LED bulbs, wiring, switches"
            value={draft.keywords}
            onChange={(e) => onChange({ keywords: e.target.value })}
          />
          <p className="mt-1 text-xs text-slate-500">Improves search visibility for your listing</p>
        </div>
      </div>
    </div>
  );
}
