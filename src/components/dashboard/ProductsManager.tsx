"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Film,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BulkImportCatalog } from "@/components/dashboard/BulkImportCatalog";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils";
import {
  createBusinessProduct,
  deleteBusinessProduct,
  deleteProductVideo,
  fetchBusinessProducts,
  updateBusinessProduct,
  uploadProductImage,
  uploadProductVideo,
} from "@/lib/api/products";
import type { BusinessCatalogItem } from "@/types";

const PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "starting", label: "Starting From" },
  { value: "per_unit", label: "Per Unit" },
  { value: "on_request", label: "Price on Request" },
] as const;

const UNITS = ["pieces", "kg", "gram", "litre", "dozen", "box", "carton", "set", "meter", "sqft"];

interface ProductForm {
  name: string;
  description: string;
  price: string;
  priceType: "fixed" | "starting" | "per_unit" | "on_request";
  brand: string;
  unit: string;
  minimumOrderQuantity: string;
  inStock: boolean;
}

function emptyForm(): ProductForm {
  return {
    name: "",
    description: "",
    price: "",
    priceType: "fixed",
    brand: "",
    unit: "pieces",
    minimumOrderQuantity: "",
    inStock: true,
  };
}

function productToForm(p: BusinessCatalogItem): ProductForm {
  return {
    name: p.name || "",
    description: p.description || "",
    price: p.price != null ? String(p.price) : "",
    priceType: (p.priceType as ProductForm["priceType"]) || "fixed",
    brand: p.brand || "",
    unit: p.unit || "pieces",
    minimumOrderQuantity: p.minimumOrderQuantity != null ? String(p.minimumOrderQuantity) : "",
    inStock: p.inStock !== false,
  };
}

/* ────────────────────────────────────── */
/* Single product card with inline edit  */
/* ────────────────────────────────────── */

function ProductCard({
  product,
  onSaved,
  onDeleted,
}: {
  product: BusinessCatalogItem;
  onSaved: (updated: BusinessCatalogItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProductForm>(() => productToForm(product));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [error, setError] = useState("");
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const patchForm = (patch: Partial<ProductForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product._id) return;
    setImgPreview(URL.createObjectURL(file));
    setImgUploading(true);
    try {
      const res = await uploadProductImage(product._id, file);
      if (res.success && res.data) onSaved(res.data);
    } catch {
      setError("Image upload failed");
    } finally {
      setImgUploading(false);
    }
  };

  const handleVideoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product._id) return;
    setVideoUploading(true);
    setError("");
    try {
      const res = await uploadProductVideo(product._id, file);
      if (res.success && res.data) {
        onSaved(res.data);
      } else {
        setError(res.message || "Video upload failed");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Video upload failed");
    } finally {
      setVideoUploading(false);
      if (videoRef.current) videoRef.current.value = "";
    }
  };

  const handleVideoDelete = async (publicId?: string) => {
    if (!product._id || !publicId) return;
    try {
      const res = await deleteProductVideo(product._id, publicId);
      if (res.success && res.data) onSaved(res.data);
    } catch {
      setError("Failed to remove video");
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Product name required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await updateBusinessProduct(product._id!, {
        name: form.name.trim(),
        description: form.description || undefined,
        price: form.price && form.priceType !== "on_request" ? Number(form.price) : undefined,
        priceType: form.priceType,
        brand: form.brand || undefined,
        unit: form.unit || undefined,
        minimumOrderQuantity: form.minimumOrderQuantity ? Number(form.minimumOrderQuantity) : undefined,
        inStock: form.inStock,
      });
      if (res.success && res.data) {
        onSaved(res.data);
        setEditing(false);
      } else {
        setError("Failed to update");
      }
    } catch {
      setError("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteBusinessProduct(product._id!);
      onDeleted(product._id!);
    } catch {
      setError("Delete failed");
      setDeleting(false);
    }
  };

  const imageUrl = imgPreview || (product.images?.[0]?.url ? getImageUrl(product.images[0].url) : null);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {/* Product image + actions bar */}
      <div className="flex items-start gap-4 p-4">
        {/* Image thumb */}
        <div
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 cursor-pointer group"
          onClick={() => fileRef.current?.click()}
          title="Click to change image"
        >
          {imgUploading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#FF6C00]" />
            </div>
          ) : imageUrl ? (
            <>
              <Image src={imageUrl} alt={product.name || ""} fill className="object-cover" sizes="80px" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1">
              <Package className="h-6 w-6 text-neutral-300" />
              <span className="text-[9px] text-neutral-400 group-hover:text-[#FF6C00]">Add Photo</span>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImagePick}
          />
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-neutral-900 truncate">{product.name}</p>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                product.itemType === "service" ? "bg-[#DBEAFE] text-[#2563EB]" : "bg-neutral-100 text-neutral-600"
              )}
            >
              {product.itemType === "service" ? "Service" : "Product"}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500">
            {product.priceType === "on_request" || !product.price ? (
              <span>Price on Request</span>
            ) : (
              <span className="font-semibold text-[#FF6C00]">
                ₹{product.price.toLocaleString("en-IN")}
                {product.unit ? ` / ${product.unit}` : ""}
              </span>
            )}
            {product.brand && <span>Brand: {product.brand}</span>}
            {product.itemType !== "service" && product.minimumOrderQuantity != null && (
              <span>MOQ: {product.minimumOrderQuantity} {product.unit || "units"}</span>
            )}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                product.inStock !== false
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-600"
              )}
            >
              {product.inStock !== false ? "In Stock" : "Out of Stock"}
            </span>
          </div>
          {product.description && (
            <p className="mt-1 line-clamp-1 text-xs text-neutral-400">{product.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => { setEditing((v) => !v); setError(""); setForm(productToForm(product)); }}
            className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:border-[#FF6C00] hover:text-[#FF6C00] transition-colors"
            title="Edit"
          >
            {editing ? <ChevronUp className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-40"
            title="Delete"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Inline edit form */}
      {editing && (
        <div className="border-t border-neutral-100 bg-neutral-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => patchForm({ name: e.target.value })}
                className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => patchForm({ brand: e.target.value })}
                placeholder="e.g. Tata"
                className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
              />
            </div>

            {/* Price type */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Price Type</label>
              <select
                value={form.priceType}
                onChange={(e) => patchForm({ priceType: e.target.value as ProductForm["priceType"] })}
                className="h-9 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00]"
              >
                {PRICE_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            {form.priceType !== "on_request" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => patchForm({ price: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
                />
              </div>
            )}

            {/* Unit + MOQ — not meaningful for services */}
            {product.itemType !== "service" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-600">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => patchForm({ unit: e.target.value })}
                    className="h-9 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00]"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-600">Min Order Qty</label>
                  <input
                    type="number"
                    value={form.minimumOrderQuantity}
                    onChange={(e) => patchForm({ minimumOrderQuantity: e.target.value })}
                    placeholder="e.g. 10"
                    min="1"
                    className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
                  />
                </div>
              </>
            )}

            {/* In stock toggle */}
            <div className="flex items-center gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => patchForm({ inStock: !form.inStock })}
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  form.inStock ? "bg-emerald-500" : "bg-neutral-300"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    form.inStock ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </button>
              <span className="text-xs font-medium text-neutral-700">
                {form.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => patchForm({ description: e.target.value })}
                rows={2}
                placeholder="Product details, specifications…"
                className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
              />
            </div>
          </div>

          {/* Videos */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-600">
                Product Videos ({(product.videos || []).length}/3)
              </label>
              {(product.videos || []).length < 3 && (
                <button
                  type="button"
                  onClick={() => videoRef.current?.click()}
                  disabled={videoUploading}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6C00] hover:text-[#E86200] disabled:opacity-50"
                >
                  {videoUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
                  {videoUploading ? "Uploading…" : "Add Video"}
                </button>
              )}
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoPick}
              />
            </div>
            {(product.videos || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(product.videos || []).map((video) => (
                  <div
                    key={video.public_id}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5"
                  >
                    <Film className="h-3.5 w-3.5 text-neutral-500" />
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-neutral-700 hover:text-[#FF6C00]"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleVideoDelete(video.public_id)}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No videos yet — add a demo or unboxing video (max 50MB each).</p>
            )}
          </div>

          {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              onClick={handleSave}
              loading={saving}
              className="gap-1.5 bg-[#FF6C00] text-white hover:bg-[#E86200]"
              size="sm"
            >
              <Check className="h-3.5 w-3.5" /> Save Changes
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setEditing(false); setError(""); }}
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────── */
/* Add new product form   */
/* ────────────────────── */

function AddProductForm({
  businessId,
  onAdded,
  onCancel,
}: {
  businessId: string;
  onAdded: (product: BusinessCatalogItem) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [itemType, setItemType] = useState<"product" | "service">("product");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const patchForm = (patch: Partial<ProductForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!form.name.trim()) { setError("Product name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await createBusinessProduct({
        businessId,
        name: form.name.trim(),
        itemType,
        description: form.description || undefined,
        price: form.price && form.priceType !== "on_request" ? Number(form.price) : undefined,
        priceType: form.priceType,
        brand: form.brand || undefined,
        unit: form.unit || undefined,
        minimumOrderQuantity: form.minimumOrderQuantity ? Number(form.minimumOrderQuantity) : undefined,
        inStock: form.inStock,
      });

      if (!res.success || !res.data) {
        setError("Failed to add product");
        return;
      }

      let product = res.data;

      // Upload image if selected
      if (imageFile && product._id) {
        try {
          const imgRes = await uploadProductImage(product._id, imageFile);
          if (imgRes.success && imgRes.data) product = imgRes.data;
        } catch {
          // Image upload failure is non-fatal
        }
      }

      onAdded(product);
    } catch {
      setError("Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-[#FF6C00]/40 bg-orange-50/40 p-4">
      <p className="mb-3 text-sm font-semibold text-neutral-800">New Catalog Item</p>

      {/* Product / Service toggle */}
      <div className="mb-4 flex gap-1.5">
        {(["product", "service"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setItemType(t)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors",
              itemType === t
                ? "bg-[#FF6C00] text-white"
                : "border border-neutral-300 bg-white text-neutral-600 hover:border-[#FF6C00]/40 hover:text-[#FF6C00]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Image picker */}
      <div
        className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 hover:border-[#FF6C00]/40 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        {imgPreview ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
            <Image src={imgPreview} alt="Preview" fill className="object-cover" sizes="56px" />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
            <Camera className="h-5 w-5 text-neutral-400" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-neutral-700">
            {imgPreview ? "Change product photo" : "Add product photo"}
          </p>
          <p className="text-xs text-neutral-400">JPG, PNG — max 5 MB</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-neutral-600">
            {itemType === "service" ? "Service Name *" : "Product Name *"}
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => patchForm({ name: e.target.value })}
            placeholder={itemType === "service" ? "e.g. Digital Marketing" : "e.g. Industrial Steel Pipe"}
            className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Brand</label>
          <input
            type="text"
            value={form.brand}
            onChange={(e) => patchForm({ brand: e.target.value })}
            placeholder="e.g. Tata"
            className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
          />
        </div>

        {/* Price type */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Price Type</label>
          <select
            value={form.priceType}
            onChange={(e) => patchForm({ priceType: e.target.value as ProductForm["priceType"] })}
            className="h-9 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00]"
          >
            {PRICE_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        {form.priceType !== "on_request" && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-600">Price (₹)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => patchForm({ price: e.target.value })}
              placeholder="0"
              min="0"
              className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
            />
          </div>
        )}

        {/* Unit + MOQ — not meaningful for services */}
        {itemType !== "service" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Unit</label>
              <select
                value={form.unit}
                onChange={(e) => patchForm({ unit: e.target.value })}
                className="h-9 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00]"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Min Order Qty</label>
              <input
                type="number"
                value={form.minimumOrderQuantity}
                onChange={(e) => patchForm({ minimumOrderQuantity: e.target.value })}
                placeholder="e.g. 10"
                min="1"
                className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
              />
            </div>
          </>
        )}

        {/* In stock */}
        <div className="flex items-center gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={() => patchForm({ inStock: !form.inStock })}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              form.inStock ? "bg-emerald-500" : "bg-neutral-300"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                form.inStock ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </button>
          <span className="text-xs font-medium text-neutral-700">
            {form.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => patchForm({ description: e.target.value })}
            rows={2}
            placeholder="Product details, specs, colors, sizes…"
            className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#FF6C00] focus:ring-2 focus:ring-[#FF6C00]/15"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      <div className="mt-4 flex items-center gap-2">
        <Button
          type="button"
          onClick={handleAdd}
          loading={saving}
          className="gap-1.5 bg-[#FF6C00] text-white hover:bg-[#E86200] shadow-[0_4px_14px_rgba(255,108,0,0.25)]"
        >
          <Plus className="h-4 w-4" /> {itemType === "service" ? "Add Service" : "Add Product"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────── */
/* Main ProductsManager */
/* ─────────────────── */

export function ProductsManager({ businessId }: { businessId: string }) {
  const [products, setProducts] = useState<BusinessCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBusinessProducts(businessId);
      setProducts(res.data?.items || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSaved = (updated: BusinessCatalogItem) => {
    setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  const handleDeleted = (id: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const handleAdded = (product: BusinessCatalogItem) => {
    setProducts((prev) => [product, ...prev]);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-800">
            {products.length > 0 ? `${products.length} Catalog Item${products.length !== 1 ? "s" : ""}` : "No catalog items yet"}
          </p>
          <p className="text-xs text-neutral-500">
            Click any item&apos;s image to change it. Click <span className="font-medium">Edit</span> to update details.
          </p>
        </div>
        {!showAddForm && (
          <div className="flex items-center gap-2">
            <BulkImportCatalog
              businessId={businessId}
              onImported={(items) => setProducts((prev) => [...items, ...prev])}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-1.5 bg-[#FF6C00] text-white hover:bg-[#E86200]"
            >
              <Plus className="h-4 w-4" /> Add Product / Service
            </Button>
          </div>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddProductForm
          businessId={businessId}
          onAdded={handleAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Product cards */}
      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      ) : !showAddForm ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-600">No products or services listed yet</p>
          <p className="mt-0.5 text-xs text-neutral-400">Add items buyers can browse and get quotes for</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <BulkImportCatalog
              businessId={businessId}
              onImported={(items) => setProducts((prev) => [...items, ...prev])}
            />
            <Button
              type="button"
              size="sm"
              className="gap-1.5 bg-[#FF6C00] text-white hover:bg-[#E86200]"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" /> Add Your First Item
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
