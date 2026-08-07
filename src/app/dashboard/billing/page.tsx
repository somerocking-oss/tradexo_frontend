"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { LeadCreditsCard } from "@/components/dashboard/LeadCreditsCard";
import { extractBusinessList, getMyBusinesses } from "@/lib/api/business";
import {
  downloadInvoicePdf,
  extractInvoiceList,
  extractTransactionList,
  getMyInvoices,
  getMyTransactions,
  type Invoice,
  type Transaction,
} from "@/lib/api/billing";
import type { Business } from "@/types";

function formatAmount(amount?: number) {
  if (amount == null) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function BillingPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    getMyBusinesses().then((res) => {
      if (res.success && res.data) {
        const list = extractBusinessList(res.data);
        setBusinesses(list);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const params = businessId ? { businessId } : undefined;
    Promise.all([getMyTransactions(params), getMyInvoices(params)]).then(
      ([txnRes, invRes]) => {
        if (txnRes.success && txnRes.data) setTransactions(extractTransactionList(txnRes.data));
        if (invRes.success && invRes.data) setInvoices(extractInvoiceList(invRes.data));
      }
    );
  }, [businessId]);

  const handleDownload = async (invoice: Invoice) => {
    setDownloading(invoice._id);
    try {
      await downloadInvoicePdf(invoice._id, invoice.invoiceNumber);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6 px-4 lg:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing & Transactions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Wallet top-ups, subscriptions, payments, and invoice downloads.
        </p>
      </div>

      {businesses.length > 1 && (
        <select
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All businesses</option>
          {businesses.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      )}

      {(businessId || businesses[0]?._id) && (
        <LeadCreditsCard businessId={businessId || businesses[0]._id} />
      )}

      <Card>
        <CardBody className="border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <FileText className="h-4 w-4 text-[#ff6c00]" /> Invoices
          </h2>
        </CardBody>
        <CardBody className="p-0">
          {invoices.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500">
              No invoices yet. Invoices are generated after successful payments.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <div key={invoice._id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">
                      {invoice.invoiceDate || invoice.createdAt
                        ? new Date(invoice.invoiceDate || invoice.createdAt!).toLocaleDateString(
                            "en-IN"
                          )
                        : "—"}
                      {invoice.business?.name ? ` · ${invoice.business.name}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-900">
                      {formatAmount(invoice.totalAmount ?? invoice.amount)}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={downloading === invoice._id}
                      onClick={() => handleDownload(invoice)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloading === invoice._id ? "..." : "PDF"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Receipt className="h-4 w-4 text-[#ff6c00]" /> Transaction History
          </h2>
        </CardBody>
        <CardBody className="p-0">
          {transactions.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((txn) => (
                <div key={txn._id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-lg bg-[#e8e8e8] p-2 text-[#ff6c00]">
                      <Receipt className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium capitalize text-slate-900">
                        {txn.type?.replace(/_/g, " ") || "Payment"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {txn.createdAt
                          ? new Date(txn.createdAt).toLocaleString("en-IN")
                          : "—"}
                        {txn.orderId ? ` · ${txn.orderId}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatAmount(txn.amount)}</p>
                    <p className="text-xs capitalize text-slate-500">{txn.status || "pending"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
