"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSubCategoriesForCategory } from "@/lib/api/subcategory";
import type { Category, SubCategory } from "@/types";

const selectClass =
  "h-10 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 pr-8 text-sm text-neutral-900 transition-colors focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20";

interface Props {
  categories: Category[];
  categoryId: string;
  subCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onSubCategoryChange: (subCategoryId: string) => void;
  categoryRequired?: boolean;
  subCategoryRequired?: boolean;
}

export function CategorySubcategoryFields({
  categories,
  categoryId,
  subCategoryId,
  onCategoryChange,
  onSubCategoryChange,
  categoryRequired = true,
  subCategoryRequired = true,
}: Props) {
  const [categoryQuery, setCategoryQuery] = useState("");
  const [subCategoryQuery, setSubCategoryQuery] = useState("");
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }, [categories, categoryQuery]);

  const filteredSubcategories = useMemo(() => {
    const q = subCategoryQuery.trim().toLowerCase();
    if (!q) return subcategories;
    return subcategories.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug?.toLowerCase().includes(q) ||
        s.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }, [subcategories, subCategoryQuery]);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    let cancelled = false;
    setLoadingSubs(true);

    fetchSubCategoriesForCategory(categoryId)
      .then((list) => {
        if (!cancelled) setSubcategories(list);
      })
      .finally(() => {
        if (!cancelled) setLoadingSubs(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const handleCategoryChange = (nextId: string) => {
    onCategoryChange(nextId);
    onSubCategoryChange("");
    setSubCategoryQuery("");
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-900">
          Category {categoryRequired && <span className="text-[#DC2626]">*</span>}
        </label>
        <input
          type="search"
          value={categoryQuery}
          onChange={(e) => setCategoryQuery(e.target.value)}
          placeholder="Search categories…"
          className="mb-2 h-9 w-full rounded-lg border border-neutral-200 px-3 text-sm focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20"
        />
        <div className="relative">
          <select
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Select category</option>
            {filteredCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
                {c.subCategoryCount ? ` (${c.subCategoryCount})` : ""}
              </option>
            ))}
          </select>
          <Chevron />
        </div>
        {categoryQuery && filteredCategories.length === 0 && (
          <p className="mt-1 text-xs text-neutral-500">No categories match your search.</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-900">
          Subcategory {subCategoryRequired && <span className="text-[#DC2626]">*</span>}
        </label>
        <input
          type="search"
          value={subCategoryQuery}
          onChange={(e) => setSubCategoryQuery(e.target.value)}
          placeholder={categoryId ? "Search subcategories…" : "Select a category first"}
          disabled={!categoryId || loadingSubs}
          className="mb-2 h-9 w-full rounded-lg border border-neutral-200 px-3 text-sm focus:border-[#FF6C00] focus:outline-none focus:ring-2 focus:ring-[#FF6C00]/20 disabled:bg-neutral-50 disabled:text-neutral-400"
        />
        <div className="relative">
          <select
            value={subCategoryId}
            onChange={(e) => onSubCategoryChange(e.target.value)}
            disabled={!categoryId || loadingSubs}
            className={`${selectClass} disabled:bg-neutral-50 disabled:text-neutral-400`}
          >
            <option value="">
              {loadingSubs
                ? "Loading subcategories…"
                : categoryId
                  ? "Select subcategory"
                  : "Select category first"}
            </option>
            {filteredSubcategories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <Chevron />
        </div>
        {categoryId && !loadingSubs && subcategories.length === 0 && (
          <p className="mt-1 text-xs text-amber-600">No subcategories found for this category.</p>
        )}
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  );
}
