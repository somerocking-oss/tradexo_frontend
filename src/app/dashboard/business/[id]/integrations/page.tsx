"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil, RefreshCw, Save, Send, Webhook } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBusinessKyc } from "@/lib/api/kyc";
import { updateBusiness, testBusinessWebhook } from "@/lib/api/business";
import { useAuth } from "@/context/AuthContext";
import type { BusinessKycProfile } from "@/types";

function formatDate(date?: string | null) {
  if (!date) return "Never";
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BusinessIntegrationsPage() {
  const params = useParams<{ id: string }>();
  const { loading } = useAuth();
  const businessId = params.id;

  const [profile, setProfile] = useState<BusinessKycProfile | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [lastWebhookStatus, setLastWebhookStatus] = useState<string | null | undefined>(null);
  const [lastWebhookAttemptAt, setLastWebhookAttemptAt] = useState<string | null | undefined>(null);
  const [notifyViaWhatsApp, setNotifyViaWhatsApp] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    const res = await getBusinessKyc(businessId);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Unable to load business");
    }
    const data = res.data;
    setProfile(data);
    setWebhookUrl(data.webhookUrl || "");
    setWebhookSecret(data.webhookSecret || "");
    setWebhookEnabled(!!data.webhookEnabled);
    setLastWebhookStatus(data.lastWebhookStatus);
    setLastWebhookAttemptAt(data.lastWebhookAttemptAt);
    setNotifyViaWhatsApp(data.notifyViaWhatsApp !== false);
    return data;
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    loadProfile()
      .catch((err: Error) => setError(err.message || "Failed to load business"))
      .finally(() => setFetching(false));
  }, [businessId, loadProfile]);

  const generateSecret = () => {
    setWebhookSecret(crypto.randomUUID().replace(/-/g, ""));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    if (webhookUrl.trim() && !webhookUrl.trim().startsWith("https://")) {
      setError("Webhook URL must start with https://");
      setSaving(false);
      return;
    }

    try {
      const res = await updateBusiness(businessId, {
        webhookUrl: webhookUrl.trim() || null,
        webhookSecret: webhookSecret.trim() || null,
        webhookEnabled,
        notifyViaWhatsApp,
      });
      if (res.success) {
        setMessage("Integration settings saved successfully!");
      } else {
        setError(res.message || "Failed to save settings");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError("");
    setMessage("");
    try {
      const res = await testBusinessWebhook(businessId);
      if (res.data?.success) {
        setMessage("Test webhook delivered successfully!");
      } else {
        setError(res.data?.error || res.message || "Test webhook delivery failed");
      }
      await loadProfile();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Test webhook delivery failed");
    } finally {
      setTesting(false);
    }
  };

  if (loading || fetching) {
    return <div className="py-20 text-center text-slate-500">Loading integration settings...</div>;
  }

  if (!profile) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600">{error || "Business not found"}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-[#e86200] hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-r from-[#ff6c00] to-[#ff8533] px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/dashboard/business/${businessId}/edit`}
            className="mb-3 mr-4 inline-flex items-center gap-1 text-sm text-[#e8e8e8] hover:text-white"
          >
            <Pencil className="h-4 w-4" /> Edit All Business Info
          </Link>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-1 text-sm text-[#e8e8e8] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <Webhook className="h-7 w-7" /> CRM Webhook Integration
          </h1>
          <p className="mt-1 text-[#e8e8e8]">
            {profile.name} — auto-sync new leads to your CRM (Zoho, HubSpot, etc.)
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <Card>
          <CardBody className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Webhook URL (https only)
              </label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-crm.com/webhooks/tradexo"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                We&apos;ll POST a JSON payload here every time you receive a new direct lead.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Signing Secret
              </label>
              <div className="flex gap-2">
                <Input
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Used to sign requests via X-Tradexo-Signature (HMAC-SHA256)"
                />
                <Button type="button" variant="outline" onClick={generateSecret} className="shrink-0">
                  <RefreshCw className="h-3.5 w-3.5" /> Generate
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={webhookEnabled}
                onChange={(e) => setWebhookEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Enable webhook — dispatch on new leads
            </label>

            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Last delivery:{" "}
              <span
                className={
                  lastWebhookStatus === "success"
                    ? "font-semibold text-emerald-700"
                    : lastWebhookStatus === "failed"
                      ? "font-semibold text-red-700"
                      : "font-semibold text-slate-500"
                }
              >
                {lastWebhookStatus === "success"
                  ? "Success"
                  : lastWebhookStatus === "failed"
                    ? "Failed"
                    : "Never delivered"}
              </span>{" "}
              · {formatDate(lastWebhookAttemptAt)}
            </div>

            {message && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
            )}
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Button type="button" onClick={handleSave} loading={saving}>
                <Save className="h-4 w-4" /> Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                loading={testing}
                disabled={!webhookUrl.trim()}
              >
                <Send className="h-4 w-4" /> Send Test Webhook
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <FaWhatsapp className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Lead Notifications</h2>
                <p className="text-xs text-slate-500">Choose how you get notified of new leads</p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={notifyViaWhatsApp}
                onChange={(e) => setNotifyViaWhatsApp(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Notify me on WhatsApp for new leads
            </label>
            <p className="text-xs text-slate-500">
              When enabled, we&apos;ll try WhatsApp first for new lead alerts. Otherwise SMS is used.
            </p>

            <div className="border-t border-slate-100 pt-4">
              <Button type="button" onClick={handleSave} loading={saving}>
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
