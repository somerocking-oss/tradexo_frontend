"use client";

import { useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DOCUMENT_TYPES,
  deleteBusinessDocument,
  updateBusinessDocument,
  uploadBusinessDocument,
} from "@/lib/api/kyc";
import { API_URL } from "@/lib/api-url";
import type { BusinessDocument } from "@/types";

interface KycDocumentsSectionProps {
  businessId: string;
  documents: BusinessDocument[];
  onRefresh: () => Promise<void>;
}

export function KycDocumentsSection({
  businessId,
  documents,
  onRefresh,
}: KycDocumentsSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("gst");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (file?: File | null) => {
    if (!file) return;
    if (!name.trim()) {
      setError("Document name is required");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const res = await uploadBusinessDocument(businessId, file, {
        name: name.trim(),
        type,
      });
      if (!res.success) {
        setError(res.message || "Upload failed");
        return;
      }
      setName("");
      setType("gst");
      if (fileRef.current) fileRef.current.value = "";
      await onRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleTypeChange = async (documentId: string, nextType: string) => {
    await updateBusinessDocument(documentId, { type: nextType });
    await onRefresh();
  };

  const handleDelete = async (documentId: string) => {
    await deleteBusinessDocument(documentId);
    await onRefresh();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
        <FileText className="h-5 w-5 text-violet-600" />
        KYC Documents
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Upload GST, PAN, license, or identity documents. Admin will review and verify your business manually.
      </p>

      <div className="mt-5 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Document Name *</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GST Certificate" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Document Type *</span>
          <select
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {DOCUMENT_TYPES.map((docType) => (
              <option key={docType.value} value={docType.value}>
                {docType.label}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          <Button
            type="button"
            loading={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-3">
        {documents.length === 0 ? (
          <p className="text-sm text-slate-500">No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{doc.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{doc.type || "other"}</Badge>
                  {doc.isVerified ? (
                    <Badge variant="success">Doc Approved</Badge>
                  ) : doc.rejectedReason ? (
                    <Badge variant="outline">Rejected</Badge>
                  ) : (
                    <Badge variant="warning">Pending Review</Badge>
                  )}
                </div>
                {doc.rejectedReason && (
                  <p className="mt-2 text-sm text-red-600">{doc.rejectedReason}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                  value={doc.type || "other"}
                  onChange={(e) => handleTypeChange(doc._id, e.target.value)}
                >
                  {DOCUMENT_TYPES.map((docType) => (
                    <option key={docType.value} value={docType.value}>
                      {docType.label}
                    </option>
                  ))}
                </select>
                {(doc.url || doc.secureUrl) && (
                  <a
                    href={
                      (doc.secureUrl || doc.url)?.startsWith("http")
                        ? doc.secureUrl || doc.url
                        : `${API_URL}${doc.secureUrl || doc.url}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-[#e86200] hover:underline"
                  >
                    View
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(doc._id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
