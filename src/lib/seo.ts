import { titleCase } from "@/lib/browse-slug";
import {
  buildListingsCanonical,
  DEFAULT_NEAR_ME_RADIUS_KM,
  nearMeRadiusLabel,
} from "@/lib/listings-url";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import type { OnPageSeoSettings } from "@/lib/cms";

export function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function applySeoTemplate(
  template: string | undefined,
  vars: Record<string, string>,
  fallback: string
) {
  if (!template?.trim()) return fallback;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

export function buildListingsSeo(
  params: Record<string, string | string[] | undefined>,
  onPage?: OnPageSeoSettings,
  siteName = SITE_NAME
) {
  const keyword = getParam(params, "keyword") || getParam(params, "q");
  const city = getParam(params, "city");
  const categoryName = getParam(params, "categoryName");
  const categorySlug = getParam(params, "categorySlug") || getParam(params, "category");
  const subCategoryName = getParam(params, "subCategoryName");
  const subCategorySlug =
    getParam(params, "subCategorySlug") ||
    getParam(params, "subcategory") ||
    getParam(params, "subCategory");
  const page = Number(getParam(params, "page") || "1");
  const nearMe = getParam(params, "nearMe") === "true";
  const view = getParam(params, "view");
  const radiusKm = Number(getParam(params, "radiusKm") || String(DEFAULT_NEAR_ME_RADIUS_KM));
  const listings = onPage?.listings;

  const keywordLabel = keyword ? titleCase(keyword) : "";
  const cityLabel = city ? titleCase(city) : "";
  const categoryLabel = categoryName ? titleCase(categoryName) : "";
  const subCategoryLabel = subCategoryName ? titleCase(subCategoryName) : "";
  const vars = {
    keyword: keywordLabel,
    city: cityLabel,
    category: categoryLabel,
    subCategory: subCategoryLabel,
    siteName,
    citySuffix: cityLabel
      ? applySeoTemplate(listings?.citySuffix, { city: cityLabel }, ` in ${cityLabel}`)
      : "",
  };

  let title = listings?.defaultTitle || "Search Businesses & B2B Suppliers";
  let h1 = title;
  let description =
    listings?.defaultDescription ||
    "Search verified local businesses, manufacturers, wholesalers and B2B suppliers across India. Filter by city, category, map view and get instant quotes.";
  let subtitle =
    listings?.defaultSubtitle ||
    "Discover verified businesses, compare quotes and grow your business faster.";

  if (nearMe) {
    const radiusLabel = nearMeRadiusLabel(radiusKm);
    title =
      view === "map"
        ? `Businesses Near Me — Map (${radiusLabel})`
        : `Businesses Near Me (${radiusLabel})`;
    h1 = title;
    description = `Find verified suppliers and local businesses within ${radiusLabel} of your location. Browse on map, call, WhatsApp or request quotes on ${siteName}.`;
    subtitle = `Map search — discover businesses within ${radiusLabel} of you`;
  } else if (keyword && city) {
    title = applySeoTemplate(
      listings?.keywordCityTitle,
      vars,
      `Top ${keywordLabel} Manufacturers, Wholesalers & Suppliers in ${cityLabel}`
    );
    h1 = `Verified ${keywordLabel} Suppliers in ${cityLabel}`;
    description = applySeoTemplate(
      listings?.keywordCityDescription,
      vars,
      `Find verified ${keywordLabel} manufacturers and wholesale suppliers in ${cityLabel}. Get latest price quotes, contact numbers, and addresses instantly on ${siteName}.`
    );
  } else if (city && categoryLabel) {
    title = `Top ${categoryLabel} Manufacturers, Wholesalers & Suppliers in ${cityLabel}`;
    h1 = `Verified ${categoryLabel} Suppliers in ${cityLabel}`;
    description = `Find verified ${categoryLabel} manufacturers and wholesale suppliers in ${cityLabel}. Get latest price quotes, contact numbers, and addresses instantly on ${siteName}.`;
  } else if (keyword) {
    title = applySeoTemplate(
      listings?.keywordTitle,
      vars,
      `${keywordLabel} Manufacturers, Wholesalers & Suppliers in India`
    );
    h1 = `Verified ${keywordLabel} Suppliers`;
    description = applySeoTemplate(
      listings?.keywordDescription,
      vars,
      `Find verified ${keywordLabel} manufacturers and wholesale suppliers across India. Get latest price quotes, contact numbers, and addresses instantly on ${siteName}.`
    );
  } else if (city) {
    title = applySeoTemplate(listings?.cityTitle, vars, `Businesses in ${cityLabel}`);
    h1 = title;
    description = applySeoTemplate(
      listings?.cityDescription,
      vars,
      `Browse verified businesses, suppliers and services in ${cityLabel} on ${siteName}.`
    );
  } else if (categoryLabel && subCategoryLabel) {
    title = `Top ${subCategoryLabel} Manufacturers, Wholesalers & Suppliers`;
    h1 = `Verified ${subCategoryLabel} Suppliers — ${categoryLabel}`;
    description = `Find verified ${subCategoryLabel} manufacturers and wholesale suppliers under ${categoryLabel} across India. Get latest price quotes, contact numbers, and addresses instantly on ${siteName}.`;
  } else if (categoryLabel) {
    title = `Top ${categoryLabel} Manufacturers, Wholesalers & Suppliers`;
    h1 = `Verified ${categoryLabel} Suppliers`;
    description = `Find verified ${categoryLabel} manufacturers and wholesale suppliers across India. Get latest price quotes, contact numbers, and addresses instantly on ${siteName}.`;
  }

  if (keyword || city || categoryLabel || subCategoryLabel) {
    subtitle = applySeoTemplate(
      listings?.filteredSubtitle,
      vars,
      `Compare verified listings${vars.citySuffix} — call, WhatsApp or get quotes`
    );
  }

  const canonicalPath = buildListingsCanonical({
    keyword,
    city,
    categorySlug: categorySlug || undefined,
    subCategorySlug: subCategorySlug || undefined,
    nearMe,
    viewMode: view === "map" ? "map" : "list",
    radiusKm: nearMe ? radiusKm : undefined,
    page,
  });
  const canonical = `${SITE_URL}${canonicalPath}`;

  // Deep multi-filter combinations (e.g. ?isVerified=true&isFeatured=true&
  // marketplaceType=x) create a combinatorial explosion of thin/near-duplicate
  // URLs with no unique content of their own — noindex (but still follow, so
  // link equity to the underlying businesses still flows) once 2+ secondary
  // filters are stacked. A single filter (e.g. the "Verified Suppliers"
  // footer link) is still a real, intentionally-linked page and stays indexable.
  const secondaryFilterCount = [
    getParam(params, "isVerified") === "true",
    getParam(params, "isFeatured") === "true",
    getParam(params, "acceptsBulkOrders") === "true",
    !!getParam(params, "marketplaceType"),
    !!getParam(params, "sellerIntent"),
  ].filter(Boolean).length;

  return {
    title,
    description,
    canonical,
    h1,
    subtitle,
    noIndex: page > 1 || secondaryFilterCount >= 2,
  };
}

export function buildBrowseSeo(
  keyword: string,
  city: string | undefined,
  onPage?: OnPageSeoSettings,
  siteName = SITE_NAME
) {
  const browse = onPage?.browse;
  const keywordLabel = titleCase(keyword);
  const cityLabel = city ? titleCase(city) : "";
  const vars = { keyword: keywordLabel, city: cityLabel, siteName };

  const title = city
    ? applySeoTemplate(browse?.titleWithCity, vars, `${keywordLabel} in ${cityLabel}`)
    : applySeoTemplate(browse?.title, vars, keywordLabel);

  const description = city
    ? applySeoTemplate(
        browse?.descriptionWithCity,
        vars,
        `Find verified ${keyword} suppliers and local businesses in ${cityLabel}. Compare listings, call, WhatsApp or request quotes on ${siteName}.`
      )
    : applySeoTemplate(
        browse?.description,
        vars,
        `Find verified ${keyword} suppliers and local businesses across India. Compare listings, call, WhatsApp or request quotes on ${siteName}.`
      );

  return { title, description, h1: title };
}

export function buildWebSiteJsonLd(siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/listings?keyword={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd(
  siteName: string,
  siteUrl?: string,
  extra?: {
    logo?: string;
    contactEmail?: string;
    contactPhone?: string;
    sameAs?: string[];
  }
) {
  const contactPoint =
    extra?.contactPhone?.trim() || extra?.contactEmail?.trim()
      ? {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: extra?.contactPhone?.trim() || undefined,
          email: extra?.contactEmail?.trim() || undefined,
          areaServed: "IN",
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl || SITE_URL,
    logo: extra?.logo,
    contactPoint,
    sameAs: extra?.sameAs?.length ? extra.sameAs : undefined,
  };
}

export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export function buildProductJsonLd(product: {
  name: string;
  description?: string;
  images?: Array<{ url?: string }>;
  brand?: string;
  price?: number;
  priceUnit?: string;
  businessName?: string;
  url: string;
  inStock?: boolean;
  sku?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: (product.images || []).map((img) => img.url).filter(Boolean),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    sku: product.sku,
    offers: product.price
      ? {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "INR",
          availability:
            product.inStock === false
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          url: product.url,
          seller: product.businessName ? { "@type": "Organization", name: product.businessName } : undefined,
        }
      : undefined,
  };
}

const SCHEMA_DAY_NAMES: Record<string, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

type BusinessTiming = {
  open24Hours?: boolean;
  sameForAllDays?: boolean;
  defaultOpen?: string;
  defaultClose?: string;
  weekly?: Record<string, { isClosed?: boolean; is24Hours?: boolean; open?: string; close?: string }>;
};

type BusinessTimingRecord = {
  day?: string;
  isClosed?: boolean;
  is24Hours?: boolean;
  slots?: Array<{ open?: string; close?: string }>;
};

/** Maps a business's opening hours (either the newer `timing` object or the
 *  legacy `timings[]` array) to schema.org OpeningHoursSpecification entries. */
export function buildOpeningHoursJsonLd(business: {
  timing?: BusinessTiming;
  timings?: BusinessTimingRecord[];
}) {
  const timing = business.timing;

  if (timing?.open24Hours) {
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: Object.values(SCHEMA_DAY_NAMES),
        opens: "00:00",
        closes: "23:59",
      },
    ];
  }

  if (timing?.weekly) {
    const specs = Object.entries(timing.weekly)
      .filter(([, day]) => day && !day.isClosed && (day.is24Hours || (day.open && day.close)))
      .map(([key, day]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SCHEMA_DAY_NAMES[key.toLowerCase()] || key,
        opens: day.is24Hours ? "00:00" : day.open,
        closes: day.is24Hours ? "23:59" : day.close,
      }));
    return specs.length ? specs : undefined;
  }

  if (timing?.sameForAllDays && timing.defaultOpen && timing.defaultClose) {
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: Object.values(SCHEMA_DAY_NAMES),
        opens: timing.defaultOpen,
        closes: timing.defaultClose,
      },
    ];
  }

  const records = business.timings || [];
  const specs = records
    .filter((r) => r.day && !r.isClosed && (r.is24Hours || r.slots?.[0]?.open))
    .map((r) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAY_NAMES[String(r.day).toLowerCase()] || r.day,
      opens: r.is24Hours ? "00:00" : r.slots?.[0]?.open,
      closes: r.is24Hours ? "23:59" : r.slots?.[0]?.close,
    }));

  return specs.length ? specs : undefined;
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildItemListJsonLd(
  businesses: Array<{ _id?: string; name?: string }>,
  listName: string,
  listUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    url: listUrl,
    numberOfItems: businesses.length,
    itemListElement: businesses.slice(0, 24).map((business, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: business.name,
      url: `${SITE_URL}/business/${business._id}`,
    })),
  };
}

/** Programmatic FAQ content for category/category+city listing pages —
 *  answers the questions B2B buyers most commonly search for, so category
 *  pages qualify for an FAQPage rich result instead of relying on
 *  business-authored FAQs (which only exist on individual listings). */
export function buildCategoryFaqs(categoryLabel: string, cityLabel?: string) {
  const place = cityLabel ? ` in ${cityLabel}` : " across India";
  const supplierPhrase = cityLabel ? `${cityLabel}-based` : "verified";

  return [
    {
      question: `Who are the best ${categoryLabel} suppliers${place}?`,
      answer: `Tradexo lists ${supplierPhrase} ${categoryLabel} manufacturers, wholesalers and suppliers, ranked by verification status, ratings and response rate. Compare profiles and contact details before you order.`,
    },
    {
      question: `What is the average Minimum Order Quantity (MOQ) for ${categoryLabel}?`,
      answer: `MOQ varies by supplier and product — it's listed on each supplier's product catalogue where available. Contact the supplier directly via Tradexo to confirm exact MOQ and bulk pricing.`,
    },
    {
      question: `How do I get price quotes from ${categoryLabel} suppliers${place}?`,
      answer: `Click "Get Bulk Quotes" on any listing, or post your requirement once on Tradexo to receive quotes from multiple verified ${categoryLabel} suppliers${place}.`,
    },
    {
      question: `Are the ${categoryLabel} suppliers on Tradexo verified?`,
      answer: `Suppliers marked "Verified" or "TrustSEAL Verified" have completed Tradexo's KYC process, including GST and business document verification.`,
    },
  ];
}

export function buildFaqPageJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  const items = faqs.filter((faq) => faq.question?.trim() && faq.answer?.trim());
  if (!items.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.trim(),
      },
    })),
  };
}

export function buildListingsSearchParams(
  params: Record<string, string | string[] | undefined>
) {
  const keyword = getParam(params, "keyword") || getParam(params, "q");
  const city = getParam(params, "city");
  const categoryId = getParam(params, "categoryId");
  const categorySlug = getParam(params, "categorySlug") || getParam(params, "category");
  const categoryName = getParam(params, "categoryName");
  const subCategoryId = getParam(params, "subCategoryId");
  const subCategorySlug =
    getParam(params, "subCategorySlug") ||
    getParam(params, "subcategory") ||
    getParam(params, "subCategory");
  const subCategoryName = getParam(params, "subCategoryName");
  const sort = getParam(params, "sort") || "priority";
  const page = Number(getParam(params, "page") || "1");
  const nearMe = getParam(params, "nearMe") === "true";
  const radiusKm = Number(getParam(params, "radiusKm") || String(DEFAULT_NEAR_ME_RADIUS_KM));
  const view = getParam(params, "view");

  return {
    keyword,
    city,
    categoryId,
    categorySlug,
    categoryName,
    subCategoryId,
    subCategorySlug,
    subCategoryName,
    sort,
    page,
    nearMe,
    radiusKm: nearMe ? radiusKm : undefined,
    viewMode: view === "map" ? "map" as const : undefined,
    isVerified: getParam(params, "isVerified") === "true" || undefined,
    isFeatured: getParam(params, "isFeatured") === "true" || undefined,
    acceptsBulkOrders: getParam(params, "acceptsBulkOrders") === "true" || undefined,
    marketplaceType: getParam(params, "marketplaceType") || undefined,
    sellerIntent: getParam(params, "sellerIntent") || undefined,
  };
}
