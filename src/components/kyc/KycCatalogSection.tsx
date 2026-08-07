"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { BookOpen, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATALOG_PRICE_TYPES, uploadCatalogItemImage } from "@/lib/api/kyc";
import { getImageUrl } from "@/lib/utils";
import type { BusinessCatalogItem, CatalogItemType } from "@/types";

interface KycCatalogSectionProps {
  businessId: string;
  items: BusinessCatalogItem[];
  defaultItemType?: CatalogItemType;
  onChange: (items: BusinessCatalogItem[]) => void;
  onSave?: () => void;
  saving?: boolean;
}

export function KycCatalogSection({
  businessId,
  items,
  defaultItemType = "product",
  onChange,
  onSave,
  saving,
}: KycCatalogSectionProps) {
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const updateItem = (index: number, patch: Partial<BusinessCatalogItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        name: "",
        description: "",
        itemType: defaultItemType,
        priceType: "on_request",
        unit: defaultItemType === "product" ? "piece" : "",
        brand: "",
        inStock: true,
        images: [],
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const res = await uploadCatalogItemImage(businessId, file);
      const image = res.data;
      if (image?.url) {
        updateItem(index, {
          images: [{ url: image.url, public_id: image.public_id }],
        });
      }
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <BookOpen className="h-5 w-5 text-violet-600" />
            Product / Service Catalogue
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Add products with photos, MOQ & price — showcase your catalogue on your public profile.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4" /> Add Item
          </Button>
          {onSave && (
            <Button type="button" size="sm" onClick={onSave} loading={saving}>
              Save Catalogue
            </Button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No catalogue items yet. Click &quot;Add Item&quot; to list your products or services.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const imageUrl = item.images?.[0]?.url;

            return (
              <div key={item._id || `catalog-${index}`} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-medium text-slate-800">Item {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>

                <div className="mb-4 flex flex-wrap items-start gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {imageUrl ? (
                      <>
                        <Image
                          src={getImageUrl(imageUrl)}
                          alt={item.name || "Product"}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                        <button
                          type="button"
                          onClick={() => updateItem(index, { images: [] })}
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white"
                          aria-label="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <ImagePlus className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      ref={(el) => {
                        fileRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={uploadingIndex === index}
                      onClick={() => fileRefs.current[index]?.click()}
                    >
                      {uploadingIndex === index ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      {imageUrl ? "Change Photo" : "Add Photo"}
                    </Button>
                    <p className="mt-1 text-xs text-slate-500">JPG/PNG, max 5MB</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm sm:col-span-2">
                    <span className="mb-1 block text-slate-600">Name *</span>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      placeholder="e.g. LED Bulb 9W / AC Repair Service"
                    />
                  </label>

                  <label className="block text-sm sm:col-span-2">
                    <span className="mb-1 block text-slate-600">Description</span>
                    <textarea
                      className="min-h-[80px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
                      value={item.description || ""}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                      placeholder="Short details, specs, or service coverage"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Type *</span>
                    <select
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
                      value={item.itemType}
                      onChange={(e) =>
                        updateItem(index, { itemType: e.target.value as CatalogItemType })
                      }
                    >
                      <option value="product">Product</option>
                      <option value="service">Service</option>
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Brand</span>
                    <Input
                      value={item.brand || ""}
                      onChange={(e) => updateItem(index, { brand: e.target.value })}
                      placeholder="Optional"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Price Type</span>
                    <select
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
                      value={item.priceType || "on_request"}
                      onChange={(e) =>
                        updateItem(index, {
                          priceType: e.target.value as BusinessCatalogItem["priceType"],
                        })
                      }
                    >
                      {CATALOG_PRICE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Price (₹)</span>
                    <Input
                      type="number"
                      min={0}
                      value={item.price ?? ""}
                      onChange={(e) =>
                        updateItem(index, {
                          price: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Leave blank for on request"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Unit</span>
                    <Input
                      value={item.unit || ""}
                      onChange={(e) => updateItem(index, { unit: e.target.value })}
                      placeholder="piece, kg, hour..."
                    />
                  </label>

                  {item.itemType === "product" && (
                    <label className="block text-sm">
                      <span className="mb-1 block text-slate-600">Min. Order Qty (MOQ)</span>
                      <Input
                        type="number"
                        min={1}
                        value={item.minimumOrderQuantity ?? ""}
                        onChange={(e) =>
                          updateItem(index, {
                            minimumOrderQuantity: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </label>
                  )}

                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={item.inStock !== false}
                      onChange={(e) => updateItem(index, { inStock: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-slate-700">Available / In Stock</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
