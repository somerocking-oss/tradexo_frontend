"use client";

import { useState } from "react";
import { Package, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BusinessRegistrationDraft, DraftProduct } from "@/lib/business-registration";

const PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "starting", label: "Starting From" },
  { value: "per_unit", label: "Per Unit" },
  { value: "on_request", label: "Price on Request" },
] as const;

const UNITS = ["pieces", "kg", "gram", "litre", "dozen", "box", "carton", "set", "meter", "sqft"];

function emptyProduct(): DraftProduct {
  return {
    name: "",
    description: "",
    price: "",
    priceType: "fixed",
    brand: "",
    unit: "pieces",
    minimumOrderQuantity: "",
  };
}

export function StepProducts({
  draft,
  onChange,
}: {
  draft: BusinessRegistrationDraft;
  onChange: (patch: Partial<BusinessRegistrationDraft>) => void;
}) {
  const [form, setForm] = useState<DraftProduct>(emptyProduct());
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(draft.products.length === 0);

  const patchForm = (patch: Partial<DraftProduct>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const addProduct = () => {
    if (!form.name.trim()) {
      setFormError("Product name is required");
      return;
    }
    if (draft.products.length >= 15) {
      setFormError("Maximum 15 products allowed during registration");
      return;
    }
    setFormError("");
    onChange({ products: [...draft.products, { ...form, name: form.name.trim() }] });
    setForm(emptyProduct());
    setShowForm(false);
  };

  const removeProduct = (index: number) => {
    onChange({ products: draft.products.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <Package className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6C00]" />
          <div>
            <p className="text-sm font-semibold text-[#FF6C00]">
              List your products — buyers will see them directly
            </p>
            <p className="mt-0.5 text-xs text-orange-700/70">
              Add upto 15 products now. You can always add more from your dashboard later.
            </p>
          </div>
        </div>
      </div>

      {/* Existing products */}
      {draft.products.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-neutral-700">
            Added products ({draft.products.length})
          </p>
          <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
            {draft.products.map((product, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                  <Package className="h-4 w-4 text-[#FF6C00]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900">{product.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500">
                    {product.priceType === "on_request" || !product.price ? (
                      <span>Price on Request</span>
                    ) : (
                      <span className="font-medium text-[#FF6C00]">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                        {product.unit ? ` / ${product.unit}` : ""}
                      </span>
                    )}
                    {product.brand && <span>Brand: {product.brand}</span>}
                    {product.minimumOrderQuantity && (
                      <span>MOQ: {product.minimumOrderQuantity} {product.unit}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(i)}
                  className="shrink-0 rounded-md p-1 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${product.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add product form toggle */}
      {draft.products.length < 15 && (
        <div>
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-4 text-sm font-semibold text-neutral-500 hover:border-[#FF6C00] hover:text-[#FF6C00] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add {draft.products.length > 0 ? "Another" : "a"} Product
            </button>
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50">
              {/* Form header */}
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-700"
                onClick={() => {
                  if (draft.products.length > 0) setShowForm(false);
                }}
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#FF6C00]" />
                  New Product Details
                </span>
                {draft.products.length > 0 && (
                  <ChevronUp className="h-4 w-4 text-neutral-400" />
                )}
              </button>

              <div className="border-t border-neutral-200 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Product name */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => patchForm({ name: e.target.value })}
                      placeholder="e.g. Industrial Steel Pipe, Cotton T-Shirt"
                      className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                      Brand / Make
                    </label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={(e) => patchForm({ brand: e.target.value })}
                      placeholder="e.g. Tata, Samsung"
                      className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
                    />
                  </div>

                  {/* Price type */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                      Price Type
                    </label>
                    <select
                      value={form.priceType}
                      onChange={(e) => patchForm({ priceType: e.target.value as DraftProduct["priceType"] })}
                      className="h-10 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
                    >
                      {PRICE_TYPES.map((pt) => (
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  {form.priceType !== "on_request" && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => patchForm({ price: e.target.value })}
                        placeholder="0"
                        min="0"
                        className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
                      />
                    </div>
                  )}

                  {/* Unit */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                      Unit
                    </label>
                    <select
                      value={form.unit}
                      onChange={(e) => patchForm({ unit: e.target.value })}
                      className="h-10 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* MOQ */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                      Minimum Order Qty
                    </label>
                    <input
                      type="number"
                      value={form.minimumOrderQuantity}
                      onChange={(e) => patchForm({ minimumOrderQuantity: e.target.value })}
                      placeholder="e.g. 10"
                      min="1"
                      className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                      Description (Optional)
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => patchForm({ description: e.target.value })}
                      rows={2}
                      placeholder="Brief product details, specifications, colors, sizes…"
                      className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="mt-3 text-xs font-medium text-red-600">{formError}</p>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={addProduct}
                    className={cn(
                      "gap-2 bg-[#FF6C00] hover:bg-[#E86200] text-white",
                      "shadow-[0_4px_14px_rgba(255,108,0,0.25)]"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                  {draft.products.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => { setShowForm(false); setFormError(""); }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skip note */}
      {draft.products.length === 0 && (
        <p className="text-center text-xs text-neutral-400">
          You can skip this step and add products later from your dashboard.
        </p>
      )}
    </div>
  );
}
