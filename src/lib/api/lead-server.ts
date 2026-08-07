import { cache } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
const FETCH_TIMEOUT_MS = 8000;

export interface PublicRequirement {
  id: string;
  productName: string;
  quantity?: number;
  unit?: string;
  city: string;
  state: string;
  buyerType?: string;
  type: string;
  category: { name: string; slug: string } | null;
  createdAt: string;
}

export const getLatestRequirementsServer = cache(
  async (limit = 8): Promise<PublicRequirement[]> => {
    try {
      const res = await fetch(`${API}/api/v1/leads/public/latest?limit=${limit}`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch {
      return [];
    }
  }
);
