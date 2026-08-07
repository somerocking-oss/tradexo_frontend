"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { extractBusinessList, getMyBusinesses } from "@/lib/api/business";
import {
  createOffer,
  deleteOffer,
  extractOfferList,
  getBusinessOffers,
  updateOffer,
  type BusinessOffer,
} from "@/lib/api/offers";
import type { Business } from "@/types";

export default function OffersPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [offers, setOffers] = useState<BusinessOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", discount: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const reloadOffers = () => {
    if (!businessId) return;
    getBusinessOffers(businessId, false).then((res) => {
      if (res.success && res.data) setOffers(extractOfferList(res.data));
    });
  };

  useEffect(() => {
    getMyBusinesses().then((res) => {
      if (res.success && res.data) {
        const list = extractBusinessList(res.data);
        setBusinesses(list);
        if (list.length === 1) setBusinessId(String(list[0]._id));
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!businessId) {
      setOffers([]);
      return;
    }
    getBusinessOffers(businessId, false).then((res) => {
      if (res.success && res.data) setOffers(extractOfferList(res.data));
    });
  }, [businessId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setSaving(true);
    setError("");
    try {
      const res = await createOffer({ businessId, ...form, isActive: true });
      if (!res.success) throw new Error(res.message || "Failed to create offer");
      setForm({ title: "", description: "", discount: "" });
      reloadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create offer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm("Delete this offer?")) return;
    await deleteOffer(offerId);
    setOffers((prev) => prev.filter((o) => o._id !== offerId));
  };

  const startEdit = (offer: BusinessOffer) => {
    setEditingId(offer._id);
    setForm({
      title: offer.title,
      description: offer.description || "",
      discount: String(offer.discount || ""),
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError("");
    try {
      const res = await updateOffer(editingId, { ...form, isActive: true });
      if (!res.success) throw new Error(res.message || "Failed to update offer");
      setEditingId(null);
      setForm({ title: "", description: "", discount: "" });
      reloadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update offer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6 px-4 lg:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Offers & Promotions</h1>
        <p className="mt-1 text-sm text-slate-600">Show deals on your business profile.</p>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center">
            <p className="text-slate-600">Register a business first.</p>
            <Button href="/register-business" className="mt-4">
              Add Business
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          {businesses.length > 1 && (
            <select
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select business</option>
              {businesses.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {businessId && (
            <>
              <Card>
                <CardBody>
                  <h2 className="mb-4 font-semibold">{editingId ? "Edit Offer" : "Create Offer"}</h2>
                  <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-3">
                    <Input
                      placeholder="Offer title *"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Discount (e.g. 20% off, Buy 1 Get 1)"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    />
                    <textarea
                      placeholder="Description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                    <Button type="submit" disabled={saving}>
                      {editingId ? (
                        <>
                          <Pencil className="h-4 w-4" /> Update Offer
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" /> Publish Offer
                        </>
                      )}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setForm({ title: "", description: "", discount: "" });
                        }}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </form>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </CardBody>
              </Card>

              <div className="space-y-3">
                {offers.length === 0 ? (
                  <p className="text-sm text-slate-500">No offers yet.</p>
                ) : (
                  offers.map((offer) => (
                    <Card key={offer._id}>
                      <CardBody className="flex items-start justify-between gap-4">
                        <div>
                          <p className="flex items-center gap-2 font-semibold text-slate-900">
                            <Tag className="h-4 w-4 text-[#ff6c00]" />
                            {offer.title}
                          </p>
                          {offer.discount && (
                            <p className="mt-1 text-sm font-medium text-emerald-700">
                              {String(offer.discount)}
                            </p>
                          )}
                          {offer.description && (
                            <p className="mt-1 text-sm text-slate-600">{offer.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(offer)}>
                            <Pencil className="h-4 w-4 text-[#ff6c00]" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(offer._id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
