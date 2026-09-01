"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Scale, Package, Search, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { LeadModal } from "@/components/business/LeadModal";
import { ProductCard } from "@/components/business/ProductCard";
import { Modal } from "@/components/ui/modal";
import { ProductCompareTable } from "@/components/products/ProductCompareTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchMarketplaceProducts, type MarketplaceProduct } from "@/lib/api/products";
import { fetchAllCategories } from "@/lib/api/category";
import type { Business, Category } from "@/types";

const MAX_COMPARE = 4;

export function ProductsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [itemType, setItemType] = useState<"" | "product" | "service">(
    (searchParams.get("itemType") as "product" | "service" | null) || ""
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [leadProduct, setLeadProduct] = useState<MarketplaceProduct | null>(null);
  // Keyed by product _id so selections survive pagination/filter changes
  // (the `products` array they came from gets replaced on refetch).
  const [compareMap, setCompareMap] = useState<Map<string, MarketplaceProduct>>(new Map());
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareError, setCompareError] = useState("");

  const debouncedKeyword = useDebounce(keyword);
  const debouncedCity = useDebounce(city);
  // On mount, honor the page number already read from the URL instead of
  // forcing page 1 — otherwise refreshing/deep-linking to ?page=3 silently
  // resets to page 1.
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    fetchAllCategories().then(setCategories);
  }, []);

  const fetchProducts = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const res = await fetchMarketplaceProducts({
          keyword: debouncedKeyword || undefined,
          categoryId: categoryId || undefined,
          city: debouncedCity || undefined,
          itemType: itemType || undefined,
          page: pageNum,
          limit: 24,
        });
        const data = res.data;
        setProducts(data?.items || []);
        setTotalResults(data?.pagination?.total || 0);
        setTotalPages(data?.pagination?.totalPages || 1);
      } catch {
        setProducts([]);
        setTotalResults(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [debouncedKeyword, categoryId, debouncedCity, itemType]
  );

  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      fetchProducts(page);
      return;
    }

    setPage(1);
    fetchProducts(1);

    const params = new URLSearchParams();
    if (debouncedKeyword) params.set("keyword", debouncedKeyword);
    if (categoryId) params.set("categoryId", categoryId);
    if (debouncedCity) params.set("city", debouncedCity);
    if (itemType) params.set("itemType", itemType);
    router.replace(`/products?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword, categoryId, debouncedCity, itemType, fetchProducts, router]);

  const goToPage = (p: number) => {
    setPage(p);
    fetchProducts(p);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const params = new URLSearchParams();
    if (debouncedKeyword) params.set("keyword", debouncedKeyword);
    if (categoryId) params.set("categoryId", categoryId);
    if (debouncedCity) params.set("city", debouncedCity);
    if (itemType) params.set("itemType", itemType);
    if (p > 1) params.set("page", String(p));
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  const toggleCompare = (product: MarketplaceProduct) => {
    if (!product._id) return;
    setCompareMap((prev) => {
      const next = new Map(prev);
      if (next.has(product._id!)) {
        next.delete(product._id!);
        setCompareError("");
      } else {
        if (next.size >= MAX_COMPARE) {
          setCompareError(`You can compare up to ${MAX_COMPARE} products at a time.`);
          return prev;
        }
        next.set(product._id!, product);
        setCompareError("");
      }
      return next;
    });
  };

  const compareProducts = Array.from(compareMap.values());

  return (
    <>
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-3">
            <Package className="h-7 w-7 text-[#FF6C00]" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Products &amp; Services</h1>
              <p className="text-sm text-neutral-500">
                Verified suppliers ke products aur services browse karo — click karke unki company dekho
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky filters */}
      <div className="sticky top-14 z-30 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-8xl px-4 py-3 sm:px-6">
          {/* Product / Service toggle */}
          <div className="mb-3 flex items-center gap-1.5">
            {(
              [
                { value: "", label: "All" },
                { value: "product", label: "Products" },
                { value: "service", label: "Services" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value || "all"}
                type="button"
                onClick={() => setItemType(opt.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  itemType === opt.value
                    ? "bg-[#FF6C00] text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-[#FF6C00]/40 hover:text-[#FF6C00]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchProducts(1);
            }}
          >
            {/* Keyword */}
            <div className="relative flex flex-1 items-center rounded-xl border-2 border-neutral-200 bg-white transition-colors focus-within:border-[#FF6C00]">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-400" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products, brands…"
                className="h-11 border-0 pl-10 shadow-none focus-visible:ring-0"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-3 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* City */}
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. Delhi)"
              className="h-11 w-full rounded-xl border-2 border-neutral-200 focus:border-[#FF6C00] focus-visible:ring-0 sm:max-w-[160px]"
            />

            {/* Category */}
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-11 appearance-none rounded-xl border-2 border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:border-[#FF6C00] focus:border-[#FF6C00] sm:max-w-[200px]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF6C00] px-6 text-sm font-semibold text-white hover:bg-[#E86200]"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="bg-neutral-50 min-h-screen">
        <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6">
          {/* Count */}
          <p className="mb-5 text-sm font-medium text-neutral-500" aria-live="polite">
            {loading ? (
              <span className="inline-block h-4 w-40 animate-pulse rounded bg-neutral-200" />
            ) : (
              <>
                <span className="font-bold text-neutral-900">{totalResults.toLocaleString("en-IN")}</span>
                {" "}
                {itemType === "service" ? "service" : itemType === "product" ? "product" : "result"}
                {totalResults !== 1 ? "s" : ""} found
                {debouncedCity && (
                  <span className="text-neutral-400"> in <span className="font-semibold text-neutral-600">{debouncedCity}</span></span>
                )}
              </>
            )}
          </p>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="mb-3 h-36 rounded-xl bg-neutral-200" />
                  <div className="mb-2 h-4 rounded bg-neutral-200" />
                  <div className="h-3 w-3/4 rounded bg-neutral-100" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white py-16 text-center">
              <Package className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
              <p className="font-semibold text-neutral-700">Koi product nahi mila</p>
              <p className="mt-1 text-sm text-neutral-500">Filter change karke dobara try karo.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product, i) => (
                  <ProductCard
                    key={product._id || `p-${i}`}
                    product={product}
                    onQuote={() => setLeadProduct(product)}
                    compareChecked={!!product._id && compareMap.has(product._id)}
                    onToggleCompare={() => toggleCompare(product)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 disabled:opacity-40 hover:border-[#FF6C00] hover:text-[#FF6C00]"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-neutral-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 disabled:opacity-40 hover:border-[#FF6C00] hover:text-[#FF6C00]"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating compare bar */}
      {compareMap.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:px-6">
          <div className="mx-auto flex max-w-8xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#FF6C00]" />
              <span className="text-sm font-medium text-neutral-700">
                {compareMap.size} product{compareMap.size > 1 ? "s" : ""} selected to compare
              </span>
              {compareError && <span className="text-xs text-red-600">{compareError}</span>}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCompareMap(new Map())}>
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={compareMap.size < 2}
                onClick={() => setCompareOpen(true)}
              >
                Compare Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compare modal */}
      <Modal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="Compare Products"
        className="lg:max-w-5xl"
      >
        <ProductCompareTable
          products={compareProducts}
          onContactSupplier={(product) => {
            setCompareOpen(false);
            setLeadProduct(product);
          }}
        />
      </Modal>

      {/* Lead modal — uses business from product */}
      <LeadModal
        business={leadProduct?.business ? (leadProduct.business as unknown as Business) : null}
        open={!!leadProduct}
        onClose={() => setLeadProduct(null)}
        initialMessage={
          leadProduct
            ? `Hi, I'm interested in "${leadProduct.name}"${
                leadProduct.minimumOrderQuantity
                  ? ` (MOQ: ${leadProduct.minimumOrderQuantity}${leadProduct.unit ? ` ${leadProduct.unit}` : ""})`
                  : ""
              }. Please share availability and pricing.`
            : ""
        }
      />
    </>
  );
}

