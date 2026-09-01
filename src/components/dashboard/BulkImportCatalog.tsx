"use client";

import { useRef, useState } from "react";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { bulkCreateBusinessProducts, type BulkImportRow, type BulkImportResult } from "@/lib/api/products";
import type { BusinessCatalogItem } from "@/types";

const TEMPLATE_HEADERS = [
  "name",
  "itemType",
  "description",
  "price",
  "priceType",
  "brand",
  "unit",
  "minimumOrderQuantity",
  "inStock",
];

const TEMPLATE_SAMPLE_ROW = [
  "Industrial Water Pump",
  "product",
  "Heavy-duty centrifugal pump for industrial use",
  "12500",
  "fixed",
  "Acme",
  "pieces",
  "5",
  "true",
];

function downloadCsvTemplate() {
  const csv = [TEMPLATE_HEADERS, TEMPLATE_SAMPLE_ROW]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "catalog-import-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/** Minimal CSV parser — handles quoted fields, embedded commas and escaped
 * quotes ("") without pulling in a parsing library for a simple seller-authored
 * upload flow. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

function rowsToItems(rows: string[][]): BulkImportRow[] {
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  if (nameIdx === -1) return [];

  return rows.slice(1).map((cells) => {
    const get = (key: string) => {
      const idx = headers.indexOf(key);
      return idx === -1 ? "" : (cells[idx] || "").trim();
    };

    const price = get("price");
    const moq = get("minimumorderquantity");
    const inStockRaw = get("instock").toLowerCase();

    return {
      name: get("name"),
      itemType: get("itemtype").toLowerCase() === "product" ? "product" : "service",
      description: get("description") || undefined,
      price: price ? Number(price) : undefined,
      priceType: get("pricetype") || undefined,
      brand: get("brand") || undefined,
      unit: get("unit") || undefined,
      minimumOrderQuantity: moq ? Number(moq) : undefined,
      inStock: inStockRaw ? inStockRaw !== "false" && inStockRaw !== "0" : true,
    };
  });
}

export function BulkImportCatalog({
  businessId,
  onImported,
}: {
  businessId: string;
  onImported: (items: BusinessCatalogItem[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<BulkImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRows([]);
    setFileName("");
    setParseError("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = async (file: File) => {
    setParseError("");
    setResult(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = rowsToItems(parseCsv(text));
      if (!parsed.length) {
        setParseError('No valid rows found — make sure the CSV has a "name" column.');
        setRows([]);
        return;
      }
      const validRows = parsed.filter((r) => r.name.trim().length > 0);
      if (!validRows.length) {
        setParseError("Every row is missing a name — nothing to import.");
        setRows([]);
        return;
      }
      setRows(validRows);
    } catch {
      setParseError("Could not read that file. Please upload a plain .csv file.");
      setRows([]);
    }
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setSubmitting(true);
    try {
      const res = await bulkCreateBusinessProducts(businessId, rows);
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.created.length) onImported(res.data.created);
      } else {
        setParseError(res.message || "Import failed");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setParseError(msg || "Import failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="gap-1.5"
      >
        <Upload className="h-4 w-4" /> Import Catalog
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Bulk Import Catalog" className="lg:max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-xs text-neutral-600">
              Upload a CSV with your products/services — one row per item. Download the template to see the expected columns.
            </p>
            <Button type="button" size="sm" variant="ghost" onClick={downloadCsvTemplate} className="shrink-0 gap-1.5">
              <Download className="h-3.5 w-3.5" /> Template
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#FF6C00] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#E86200]"
          />

          {parseError && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" /> {parseError}
            </p>
          )}

          {rows.length > 0 && !result && (
            <>
              <p className="text-sm font-medium text-neutral-700">
                {fileName} — {rows.length} row{rows.length === 1 ? "" : "s"} ready to import
              </p>
              <div className="max-h-56 overflow-auto rounded-lg border border-neutral-200">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-neutral-50">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-neutral-600">Name</th>
                      <th className="px-3 py-2 font-semibold text-neutral-600">Type</th>
                      <th className="px-3 py-2 font-semibold text-neutral-600">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {rows.slice(0, 20).map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5 text-neutral-800">{r.name}</td>
                        <td className="px-3 py-1.5 text-neutral-500">{r.itemType}</td>
                        <td className="px-3 py-1.5 text-neutral-500">{r.price ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 20 && (
                  <p className="px-3 py-2 text-xs text-neutral-400">
                    +{rows.length - 20} more row{rows.length - 20 === 1 ? "" : "s"} not shown
                  </p>
                )}
              </div>
              <Button type="button" onClick={handleImport} disabled={submitting} className="w-full">
                {submitting ? "Importing..." : `Import ${rows.length} item${rows.length === 1 ? "" : "s"}`}
              </Button>
            </>
          )}

          {result && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {result.created.length} item{result.created.length === 1 ? "" : "s"} imported successfully
              </p>
              {result.errors.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <p className="font-semibold">{result.errors.length} row{result.errors.length === 1 ? "" : "s"} skipped:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {result.errors.slice(0, 10).map((e, i) => (
                      <li key={i}>Row {e.row}: {e.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
