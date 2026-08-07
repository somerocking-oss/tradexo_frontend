"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductsManager } from "@/components/dashboard/ProductsManager";
import { extractBusinessList, getMyBusinesses } from "@/lib/api/business";
import type { Business } from "@/types";

export default function CatalogPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="py-20 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6 px-4 lg:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Catalog Manager</h1>
        <p className="mt-1 text-sm text-slate-600">
          Add and manage the products &amp; services buyers see on your profile and in search.
        </p>
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

          {businessId && <ProductsManager businessId={businessId} />}
        </>
      )}
    </div>
  );
}
