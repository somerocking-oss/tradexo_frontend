"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { extractBusinessList, getMyBusinesses } from "@/lib/api/business";
import {
  createBranch,
  deleteBranch,
  extractBranchList,
  getBusinessBranches,
  updateBranch,
  type BusinessBranch,
} from "@/lib/api/branches";
import type { Business } from "@/types";

export default function BranchesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [branches, setBranches] = useState<BusinessBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", city: "", area: "", mobile: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const reloadBranches = useCallback(() => {
    if (!businessId) return;
    getBusinessBranches(businessId).then((res) => {
      if (res.success && res.data) setBranches(extractBranchList(res.data));
    });
  }, [businessId]);

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
      setBranches([]);
      return;
    }
    reloadBranches();
  }, [businessId, reloadBranches]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setSaving(true);
    setError("");
    try {
      const res = await createBranch({ businessId, ...form });
      if (!res.success) throw new Error(res.message || "Failed to add branch");
      setForm({ name: "", city: "", area: "", mobile: "" });
      reloadBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add branch");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError("");
    try {
      const res = await updateBranch(editingId, form);
      if (!res.success) throw new Error(res.message || "Failed to update branch");
      setEditingId(null);
      setForm({ name: "", city: "", area: "", mobile: "" });
      reloadBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update branch");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (branch: BusinessBranch) => {
    setEditingId(branch._id);
    setForm({
      name: branch.name,
      city: branch.city,
      area: branch.area || "",
      mobile: branch.mobile || "",
    });
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm("Delete this branch?")) return;
    await deleteBranch(branchId);
    setBranches((prev) => prev.filter((b) => b._id !== branchId));
  };

  if (loading) return <div className="py-20 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6 px-4 lg:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Branch Locations</h1>
        <p className="mt-1 text-sm text-slate-600">Manage multiple outlets for your business.</p>
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
                  <h2 className="mb-4 font-semibold">{editingId ? "Edit Branch" : "Add Branch"}</h2>
                  <form
                    onSubmit={editingId ? handleUpdate : handleCreate}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <Input
                      placeholder="Branch name *"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="City *"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Area / locality"
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                    />
                    <Input
                      placeholder="Mobile"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    />
                    <div className="flex gap-2 sm:col-span-2">
                      <Button type="submit" disabled={saving}>
                        {editingId ? (
                          <>
                            <Pencil className="h-4 w-4" /> Update Branch
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" /> Add Branch
                          </>
                        )}
                      </Button>
                      {editingId && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setForm({ name: "", city: "", area: "", mobile: "" });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </CardBody>
              </Card>

              <div className="space-y-3">
                {branches.length === 0 ? (
                  <p className="text-sm text-slate-500">No branches yet.</p>
                ) : (
                  branches.map((branch) => (
                    <Card key={branch._id}>
                      <CardBody className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{branch.name}</p>
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="h-3.5 w-3.5" />
                            {[branch.area, branch.city].filter(Boolean).join(", ")}
                          </p>
                          {branch.mobile && (
                            <p className="mt-1 text-sm text-slate-500">{branch.mobile}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(branch)}>
                            <Pencil className="h-4 w-4 text-[#ff6c00]" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(branch._id)}>
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
