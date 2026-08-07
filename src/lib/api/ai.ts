import { apiGet, apiPost } from "@/lib/api/client";

export type AiFeatureFlags = {
  listingAssistant: boolean;
  smartSearch: boolean;
  rfqHelper: boolean;
  leadReply: boolean;
  chatModeration: boolean;
  seoContent: boolean;
};

export type AiSettings = {
  enabled: boolean;
  provider: string | null;
  features: AiFeatureFlags;
};

export type AiListingResult = {
  shortDescription?: string;
  description?: string;
  keywords?: string;
  seoTitle?: string;
  seoDescription?: string;
  faqs?: Array<{ question: string; answer: string }>;
};

export async function getAiSettings() {
  const res = await apiGet<AiSettings>("/ai/settings");
  return (
    res.data || {
      enabled: false,
      provider: null,
      features: {
        listingAssistant: false,
        smartSearch: false,
        rfqHelper: false,
        leadReply: false,
        chatModeration: false,
        seoContent: false,
      },
    }
  );
}

export async function generateListingWithAi(payload: {
  name: string;
  category: string;
  city: string;
  providerType?: string;
  keywords?: string;
}) {
  const res = await apiPost<AiListingResult>("/ai/listing/generate", payload);
  return res;
}

export type AiRfqParseResult = {
  title?: string;
  category?: string;
  city?: string;
  quantity?: string;
  budget?: string;
  timeline?: string;
  details?: string;
};

export async function parseRfqWithAi(payload: { text: string }) {
  const res = await apiPost<AiRfqParseResult>("/ai/rfq/parse", payload);
  return res;
}

export type AiSearchInterpretResult = {
  keyword?: string;
  city?: string;
  category?: string;
  nearMe?: boolean;
};

export async function interpretSearchWithAi(query: string) {
  const res = await apiPost<AiSearchInterpretResult>("/ai/search/interpret", { query });
  return res;
}

export type AiLeadReplyResult = {
  reply?: string;
  followUpQuestions?: string[];
};

export async function suggestLeadReplyWithAi(lead: {
  title?: string;
  message?: string;
  buyerName?: string;
  businessName?: string;
}) {
  const res = await apiPost<AiLeadReplyResult>("/ai/lead/reply-suggest", { lead });
  return res;
}
