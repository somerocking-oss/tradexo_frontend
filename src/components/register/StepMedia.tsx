"use client";

import Image from "next/image";
import { Upload, X } from "lucide-react";
import {
  MOQ_UNITS,
  PRODUCT_ROLES,
  formatHoursSummary,
  type BusinessRegistrationDraft,
  type ExistingGalleryImage,
} from "@/lib/business-registration";
import { getImageUrl } from "@/lib/utils";
import type { Category } from "@/types";

interface Props {
  draft: BusinessRegistrationDraft;
  categories: Category[];
  banner: File | null;
  images: File[];
  onBannerChange: (file: File | null) => void;
  onImagesChange: (files: File[]) => void;
  existingBannerUrl?: string | null;
  existingGallery?: ExistingGalleryImage[];
  mode?: "create" | "edit";
}

export function StepMedia({
  draft,
  categories,
  banner,
  images,
  onBannerChange,
  onImagesChange,
  existingBannerUrl,
  existingGallery = [],
  mode = "create",
}: Props) {
  const categoryName = (Array.isArray(categories) ? categories : []).find(
    (c) => c._id === draft.primaryCategory
  )?.name;
  const productRoleLabel = PRODUCT_ROLES.find((r) => r.value === draft.productRole)?.label;
  const moqUnitLabel = MOQ_UNITS.find((u) => u.value === draft.moqUnit)?.label;

  const addImages = (fileList: FileList | null) => {
    if (!fileList) return;
    onImagesChange([...images, ...Array.from(fileList)].slice(0, 10));
  };

  return (
    <div className="space-y-6">
      {mode === "edit" && (existingBannerUrl || existingGallery.length > 0) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Current Photos</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {existingBannerUrl && (
              <div>
                <p className="mb-1 text-xs text-slate-500">Banner</p>
                <div className="relative h-32 overflow-hidden rounded-lg border border-slate-200">
                  <Image
                    src={getImageUrl(existingBannerUrl)}
                    alt="Current banner"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              </div>
            )}
            {existingGallery.filter((img) => img.type !== "banner").length > 0 && (
              <div>
                <p className="mb-1 text-xs text-slate-500">Gallery</p>
                <div className="flex flex-wrap gap-2">
                  {existingGallery
                    .filter((img) => img.type !== "banner")
                    .slice(0, 4)
                    .map((img) => (
                      <div key={img.id} className="relative h-16 w-16 overflow-hidden rounded-lg border">
                        <Image src={getImageUrl(img.url)} alt="" fill className="object-cover" sizes="64px" />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Banner Photo</label>
          {banner ? (
            <div className="relative h-40 overflow-hidden rounded-xl border border-slate-200">
              <Image src={URL.createObjectURL(banner)} alt="Banner preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => onBannerChange(null)}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 hover:border-[#ff6c00] hover:bg-[#e8e8e8]/50">
              <Upload className="mb-2 h-8 w-8 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Upload banner image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onBannerChange(e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Gallery Photos</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((file, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg border">
                <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" sizes="100px" />
                <button
                  type="button"
                  onClick={() => onImagesChange(images.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 10 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-[#ff6c00]">
                <Upload className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addImages(e.target.files)}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm">
        <h3 className="mb-3 font-semibold text-slate-900">Listing Summary</h3>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Type</dt>
            <dd className="font-medium capitalize text-slate-900">
              {draft.providerType === "product" ? "Product Provider" : "Service Provider"}
              {productRoleLabel ? ` · ${productRoleLabel}` : ""}
            </dd>
          </div>
          {draft.providerType === "product" && draft.minimumOrderQuantity && (
            <div>
              <dt className="text-slate-500">Min. per lead</dt>
              <dd className="font-medium text-slate-900">
                {draft.minimumOrderQuantity} {moqUnitLabel}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-slate-500">Business</dt>
            <dd className="font-medium text-slate-900">{draft.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Category</dt>
            <dd className="font-medium text-slate-900">{categoryName || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd className="font-medium text-slate-900">
              {[draft.area, draft.city].filter(Boolean).join(", ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Mobile</dt>
            <dd className="font-medium text-slate-900">{draft.mobile || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Business Hours</dt>
            <dd className="font-medium text-slate-900">{formatHoursSummary(draft)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
