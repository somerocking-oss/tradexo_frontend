import { getLeadBusinessName } from "@/lib/api/lead";
import type { Business, Lead } from "@/types";

function escapeCsvCell(value: unknown) {
  return String(value ?? "").replace(/"/g, '""');
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: unknown[][]
) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${escapeCsvCell(cell)}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportLeadsToCsv(leads: Lead[], filename?: string) {
  const headers = [
    "Name",
    "Phone",
    "Email",
    "Business",
    "Type",
    "Status",
    "Product",
    "Quantity",
    "Unit",
    "Delivery City",
    "Items Count",
    "RFQ Locked",
    "Message",
    "Date",
  ];

  const rows = leads.map((lead) => [
    lead.customerName || lead.name || "",
    lead.isContactMasked ? `${lead.mobile || lead.phone || ""} (masked)` : lead.mobile || lead.phone || "",
    lead.email || "",
    getLeadBusinessName(lead),
    lead.type || "",
    lead.status || "",
    lead.productName || "",
    lead.quantity ?? "",
    lead.unit || "",
    lead.deliveryCity || "",
    lead.items?.length || (lead.type === "bulk_order" ? 1 : 0),
    lead.isRfqOpportunity && !lead.isUnlocked ? "Yes" : "No",
    lead.message || "",
    lead.createdAt ? new Date(lead.createdAt).toISOString() : "",
  ]);

  downloadCsv(
    filename || `leads-${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows
  );
}

export function exportAnalyticsSummary(
  leads: Lead[],
  businesses: Business[],
  filename?: string
) {
  const statusCounts: Record<string, number> = {};
  for (const lead of leads) {
    const status = lead.status || "new";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  const converted = statusCounts.converted || 0;
  const conversionRate =
    leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;

  const profileScores = businesses
    .map((b) => b.profileCompletionPercent)
    .filter((score): score is number => typeof score === "number");
  const avgProfile =
    profileScores.length > 0
      ? Math.round(profileScores.reduce((a, b) => a + b, 0) / profileScores.length)
      : 0;

  const headers = ["Metric", "Value"];
  const rows: unknown[][] = [
    ["Export Date", new Date().toISOString()],
    ["Total Businesses", businesses.length],
    ["Active Listings", businesses.filter((b) => b.status === "active").length],
    ["Verified Listings", businesses.filter((b) => b.isVerified).length],
    ["Total Leads", leads.length],
    ["New Leads", statusCounts.new || 0],
    ["RFQ Opportunities", leads.filter((l) => l.isRfqOpportunity).length],
    ["Converted Leads", converted],
    ["Conversion Rate %", conversionRate],
    ["Avg Profile Score %", avgProfile],
    ...Object.entries(statusCounts).map(([status, count]) => [
      `Status: ${status}`,
      count,
    ]),
  ];

  downloadCsv(
    filename || `analytics-summary-${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows
  );
}
