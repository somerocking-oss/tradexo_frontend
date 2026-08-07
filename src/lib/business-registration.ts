export type ProviderType = "service" | "product";

export type ProductRole =
  | "b2b_supplier"
  | "manufacturer"
  | "wholesaler"
  | "distributor";

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DaySchedule {
  isClosed: boolean;
  is24Hours: boolean;
  open: string;
  close: string;
}

export interface DraftProduct {
  name: string;
  description: string;
  price: string;
  priceType: "fixed" | "starting" | "per_unit" | "on_request";
  brand: string;
  unit: string;
  minimumOrderQuantity: string;
}

export interface BusinessRegistrationDraft {
  providerType: ProviderType | "";
  productRole: ProductRole | "";
  minimumOrderQuantity: string;
  moqUnit: string;
  name: string;
  contactPerson: string;
  primaryCategory: string;
  primarySubCategory: string;
  establishmentYear: string;
  address: string;
  building: string;
  landmark: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  email: string;
  website: string;
  open24Hours: boolean;
  sameForAllDays: boolean;
  defaultOpen: string;
  defaultClose: string;
  weeklySchedule: Record<DayKey, DaySchedule>;
  shortDescription: string;
  description: string;
  keywords: string;
  products: DraftProduct[];
}

export const REGISTRATION_STORAGE_KEY = "Tradexo_business_registration";

export const MOQ_UNITS = [
  { value: "pieces", label: "Pieces" },
  { value: "kg", label: "Kilogram (Kg)" },
  { value: "gram", label: "Gram" },
  { value: "litre", label: "Litre" },
  { value: "boxes", label: "Boxes" },
  { value: "cartons", label: "Cartons" },
  { value: "tons", label: "Tons" },
  { value: "units", label: "Units" },
  { value: "sets", label: "Sets" },
] as const;

export const PRODUCT_ROLES: {
  value: ProductRole;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "b2b_supplier",
    label: "Supplier",
    description: "Supply products to businesses & retailers",
    icon: "📦",
  },
  {
    value: "manufacturer",
    label: "Manufacturer",
    description: "Produce goods at scale for B2B buyers",
    icon: "🏭",
  },
  {
    value: "wholesaler",
    label: "Wholesaler",
    description: "Sell in bulk to dealers & distributors",
    icon: "🏬",
  },
  {
    value: "distributor",
    label: "Distributor",
    description: "Distribute brands across regions",
    icon: "🚚",
  },
];

export const WEEKDAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

export const REGISTRATION_STEPS = [
  { id: 1, title: "Business Type", short: "Type" },
  { id: 2, title: "Business Info", short: "Info" },
  { id: 3, title: "Location", short: "Location" },
  { id: 4, title: "Contact Details", short: "Contact" },
  { id: 5, title: "Business Hours", short: "Hours" },
  { id: 6, title: "About Business", short: "About" },
  { id: 7, title: "Your Products", short: "Products" },
  { id: 8, title: "Photos & Logo", short: "Photos" },
] as const;

function defaultDaySchedule(): DaySchedule {
  return { isClosed: false, is24Hours: false, open: "09:00", close: "18:00" };
}

export function defaultWeeklySchedule(): Record<DayKey, DaySchedule> {
  return WEEKDAYS.reduce(
    (acc, { key }) => {
      acc[key] = defaultDaySchedule();
      return acc;
    },
    {} as Record<DayKey, DaySchedule>
  );
}

function formatTime12h(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatHoursSummary(draft: BusinessRegistrationDraft): string {
  if (draft.open24Hours) return "Open 24 hours · All days";

  if (draft.sameForAllDays) {
    return `Mon – Sun: ${formatTime12h(draft.defaultOpen)} – ${formatTime12h(draft.defaultClose)}`;
  }

  const parts = WEEKDAYS.map(({ key, short }) => {
    const day = draft.weeklySchedule[key];
    if (day.isClosed) return `${short}: Closed`;
    if (day.is24Hours) return `${short}: 24 hrs`;
    return `${short}: ${formatTime12h(day.open)} – ${formatTime12h(day.close)}`;
  });

  return parts.join(" · ");
}

export function buildTimingsPayload(draft: BusinessRegistrationDraft) {
  if (draft.open24Hours) {
    return WEEKDAYS.map(({ key }) => ({
      day: key,
      isClosed: false,
      is24Hours: true,
      slots: [],
    }));
  }

  if (draft.sameForAllDays) {
    return WEEKDAYS.map(({ key }) => ({
      day: key,
      isClosed: false,
      is24Hours: false,
      slots: [{ open: draft.defaultOpen, close: draft.defaultClose }],
    }));
  }

  return WEEKDAYS.map(({ key }) => {
    const day = draft.weeklySchedule[key];
    if (day.isClosed) {
      return { day: key, isClosed: true, is24Hours: false, slots: [] };
    }
    if (day.is24Hours) {
      return { day: key, isClosed: false, is24Hours: true, slots: [] };
    }
    return {
      day: key,
      isClosed: false,
      is24Hours: false,
      slots: [{ open: day.open, close: day.close }],
    };
  });
}

export const emptyDraft = (): BusinessRegistrationDraft => ({
  providerType: "",
  productRole: "",
  minimumOrderQuantity: "",
  moqUnit: "pieces",
  name: "",
  contactPerson: "",
  primaryCategory: "",
  primarySubCategory: "",
  establishmentYear: "",
  address: "",
  building: "",
  landmark: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  phone: "",
  mobile: "",
  whatsapp: "",
  email: "",
  website: "",
  open24Hours: false,
  sameForAllDays: true,
  defaultOpen: "09:00",
  defaultClose: "18:00",
  weeklySchedule: defaultWeeklySchedule(),
  shortDescription: "",
  description: "",
  keywords: "",
  products: [],
});

export function loadDraft(): BusinessRegistrationDraft {
  if (typeof window === "undefined") return emptyDraft();
  try {
    const raw = sessionStorage.getItem(REGISTRATION_STORAGE_KEY);
    if (!raw) return emptyDraft();
    const parsed = JSON.parse(raw) as Partial<BusinessRegistrationDraft>;
    return {
      ...emptyDraft(),
      ...parsed,
      weeklySchedule: {
        ...defaultWeeklySchedule(),
        ...(parsed.weeklySchedule || {}),
      },
    };
  } catch {
    return emptyDraft();
  }
}

export function saveDraft(draft: BusinessRegistrationDraft) {
  sessionStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  sessionStorage.removeItem(REGISTRATION_STORAGE_KEY);
}

export function buildRegistrationFormData(
  draft: BusinessRegistrationDraft,
  files: { banner: File | null; images: File[] }
): FormData {
  const fd = new FormData();

  const sellerIntent = draft.providerType === "product" ? "products" : "services";
  const marketplaceType =
    draft.providerType === "product"
      ? draft.productRole || "b2b_supplier"
      : "local_service";
  const businessModel = draft.providerType === "product" ? "b2b" : "b2c";

  fd.append("name", draft.name);
  fd.append("contactPerson", draft.contactPerson);
  fd.append("primaryCategory", draft.primaryCategory);
  if (draft.primarySubCategory) {
    fd.append("subCategoryId", draft.primarySubCategory);
    fd.append(
      "categoryMaps",
      JSON.stringify([
        {
          category: draft.primaryCategory,
          subCategory: draft.primarySubCategory,
        },
      ])
    );
  }
  fd.append("sellerIntent", sellerIntent);
  fd.append("marketplaceType", marketplaceType);
  fd.append("businessModel", businessModel);

  if (draft.establishmentYear) fd.append("establishmentYear", draft.establishmentYear);
  if (draft.shortDescription) fd.append("shortDescription", draft.shortDescription);
  if (draft.description) fd.append("description", draft.description);

  fd.append("address", draft.address);
  if (draft.building) fd.append("building", draft.building);
  if (draft.landmark) fd.append("landmark", draft.landmark);
  fd.append("area", draft.area);
  fd.append("city", draft.city);
  if (draft.state) fd.append("state", draft.state);
  if (draft.pincode) fd.append("pincode", draft.pincode);

  if (draft.latitude && draft.longitude) {
    fd.append("latitude", draft.latitude);
    fd.append("longitude", draft.longitude);
    fd.append("lat", draft.latitude);
    fd.append("lng", draft.longitude);
  }

  fd.append("mobile", draft.mobile);
  if (draft.phone) fd.append("phone", draft.phone);
  if (draft.whatsapp) fd.append("whatsapp", draft.whatsapp);
  if (draft.email) fd.append("email", draft.email);
  if (draft.website) fd.append("website", draft.website);

  const timings = buildTimingsPayload(draft);
  fd.append("timings", JSON.stringify(timings));
  fd.append(
    "timing",
    JSON.stringify({
      open24Hours: draft.open24Hours,
      sameForAllDays: draft.sameForAllDays,
      summary: formatHoursSummary(draft),
      weekly: draft.weeklySchedule,
    })
  );

  const keywords = draft.keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (sellerIntent === "products") {
    fd.append("productKeywords", JSON.stringify(keywords));
    fd.append("acceptsBulkOrders", "true");
    fd.append("rfqEnabled", "true");

    if (draft.minimumOrderQuantity) {
      fd.append(
        "supplyCapacity",
        JSON.stringify({
          minimumOrderQuantity: Number(draft.minimumOrderQuantity),
          unit: draft.moqUnit,
        })
      );
    }
  } else if (keywords.length) {
    fd.append("serviceKeywords", JSON.stringify(keywords));
  }

  if (files.banner) fd.append("banner", files.banner);
  files.images.forEach((file) => fd.append("images", file));

  return fd;
}

export function validateStep(step: number, draft: BusinessRegistrationDraft): string | null {
  switch (step) {
    case 1:
      if (!draft.providerType) return "Please select your business type";
      if (draft.providerType === "product" && !draft.productRole) {
        return "Please select your business type";
      }
      return null;
    case 2:
      if (!draft.name.trim()) return "Business name is required";
      if (!draft.primaryCategory) return "Please select a category";
      if (!draft.primarySubCategory) return "Please select a subcategory";
      if (!draft.contactPerson.trim()) return "Contact person name is required";
      if (draft.providerType === "product") {
        if (!draft.minimumOrderQuantity || Number(draft.minimumOrderQuantity) < 1) {
          return "Please enter minimum products you sell in a lead (MOQ)";
        }
      }
      return null;
    case 3:
      if (!draft.city.trim()) return "City is required";
      if (!draft.area.trim()) return "Area / locality is required";
      if (!draft.address.trim()) return "Address is required";
      if (draft.pincode && !/^\d{6}$/.test(draft.pincode)) return "Enter a valid 6-digit pincode";
      if (!draft.latitude || !draft.longitude) {
        return "Drop your shop pin on the map (Use my location or tap the map)";
      }
      return null;
    case 4:
      if (!draft.mobile.trim() || draft.mobile.replace(/\D/g, "").length !== 10) {
        return "Valid 10-digit mobile number is required";
      }
      return null;
    case 5:
      if (!draft.open24Hours) {
        if (draft.sameForAllDays) {
          if (!draft.defaultOpen || !draft.defaultClose) {
            return "Please set opening and closing times";
          }
          if (draft.defaultOpen >= draft.defaultClose) {
            return "Closing time must be after opening time";
          }
        } else {
          const hasOpenDay = WEEKDAYS.some(({ key }) => {
            const day = draft.weeklySchedule[key];
            return !day.isClosed && (day.is24Hours || (day.open && day.close && day.open < day.close));
          });
          if (!hasOpenDay) {
            return "Please set open hours for at least one day";
          }
        }
      }
      return null;
    case 6:
      if (!draft.shortDescription.trim()) return "Short description is required";
      return null;
    case 7:
      return null;
    case 8:
      return null;
    default:
      return null;
  }
}

export interface ExistingGalleryImage {
  id: string;
  url: string;
  type?: string;
}

type DraftGalleryImage =
  | string
  | { _id?: string; url?: string; secureUrl?: string; type?: string };

interface BusinessTimingRecord {
  day?: string;
  isClosed?: boolean;
  is24Hours?: boolean;
  slots?: { open?: string; close?: string }[];
}

interface BusinessRecordForDraft {
  sellerIntent?: string;
  marketplaceType?: string;
  supplyCapacity?: { minimumOrderQuantity?: number; unit?: string };
  name?: string;
  contactPerson?: string;
  primaryCategory?: { _id?: string } | string;
  categoryMaps?: Array<{ category?: { _id?: string } | string; subCategory?: { _id?: string } | string }>;
  establishmentYear?: number | string;
  address?: string;
  building?: string;
  landmark?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  mobile?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  timing?: {
    open24Hours?: boolean;
    sameForAllDays?: boolean;
    defaultOpen?: string;
    defaultClose?: string;
    weekly?: Record<DayKey, DaySchedule>;
  };
  timings?: BusinessTimingRecord[];
  shortDescription?: string;
  description?: string;
  productKeywords?: string[];
  serviceKeywords?: string[];
  images?: DraftGalleryImage[];
}

function resolveCategoryId(category: BusinessRecordForDraft["primaryCategory"]) {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category._id || "";
}

function parseHoursFromBusiness(business: BusinessRecordForDraft): Partial<BusinessRegistrationDraft> {
  const timing = business.timing;
  if (timing?.open24Hours) {
    return {
      open24Hours: true,
      sameForAllDays: true,
      weeklySchedule: defaultWeeklySchedule(),
    };
  }

  if (timing?.weekly) {
    return {
      open24Hours: false,
      sameForAllDays: false,
      weeklySchedule: {
        ...defaultWeeklySchedule(),
        ...timing.weekly,
      },
    };
  }

  if (timing?.sameForAllDays !== undefined) {
    return {
      open24Hours: false,
      sameForAllDays: !!timing.sameForAllDays,
      defaultOpen: timing.defaultOpen || "09:00",
      defaultClose: timing.defaultClose || "18:00",
      weeklySchedule: defaultWeeklySchedule(),
    };
  }

  const records = business.timings || [];
  if (!records.length) {
    return {
      open24Hours: false,
      sameForAllDays: true,
      weeklySchedule: defaultWeeklySchedule(),
    };
  }

  if (records.every((item) => item.is24Hours)) {
    return { open24Hours: true, sameForAllDays: true, weeklySchedule: defaultWeeklySchedule() };
  }

  const weeklySchedule = defaultWeeklySchedule();
  records.forEach((item) => {
    const day = item.day?.toLowerCase() as DayKey;
    if (!day || !weeklySchedule[day]) return;
    weeklySchedule[day] = {
      isClosed: !!item.isClosed,
      is24Hours: !!item.is24Hours,
      open: item.slots?.[0]?.open || "09:00",
      close: item.slots?.[0]?.close || "18:00",
    };
  });

  const activeDays = records.filter((item) => !item.isClosed && !item.is24Hours);
  const firstSlot = activeDays[0]?.slots?.[0];
  const sameForAllDays =
    activeDays.length > 0 &&
    activeDays.every(
      (item) =>
        item.slots?.[0]?.open === firstSlot?.open &&
        item.slots?.[0]?.close === firstSlot?.close
    );

  return {
    open24Hours: false,
    sameForAllDays,
    defaultOpen: firstSlot?.open || "09:00",
    defaultClose: firstSlot?.close || "18:00",
    weeklySchedule,
  };
}

function resolveSubCategoryId(
  business: BusinessRecordForDraft
): string {
  const map = business.categoryMaps?.[0];
  if (!map?.subCategory) return "";
  if (typeof map.subCategory === "string") return map.subCategory;
  return map.subCategory._id || "";
}

export function businessToDraft(business: BusinessRecordForDraft): BusinessRegistrationDraft {
  const isProduct =
    business.sellerIntent === "products" ||
    (business.marketplaceType && business.marketplaceType !== "local_service");

  const keywords = (isProduct ? business.productKeywords : business.serviceKeywords) || [];

  return {
    ...emptyDraft(),
    providerType: isProduct ? "product" : "service",
    productRole: isProduct
      ? ((business.marketplaceType as ProductRole) || "b2b_supplier")
      : "",
    minimumOrderQuantity: business.supplyCapacity?.minimumOrderQuantity
      ? String(business.supplyCapacity.minimumOrderQuantity)
      : "",
    moqUnit: business.supplyCapacity?.unit || "pieces",
    name: business.name || "",
    contactPerson: business.contactPerson || "",
    primaryCategory: resolveCategoryId(business.primaryCategory),
    primarySubCategory: resolveSubCategoryId(business),
    establishmentYear: business.establishmentYear ? String(business.establishmentYear) : "",
    address: business.address || "",
    building: business.building || "",
    landmark: business.landmark || "",
    area: business.area || "",
    city: business.city || "",
    state: business.state || "",
    pincode: business.pincode || "",
    latitude:
      business.latitude != null && !Number.isNaN(Number(business.latitude))
        ? String(business.latitude)
        : "",
    longitude:
      business.longitude != null && !Number.isNaN(Number(business.longitude))
        ? String(business.longitude)
        : "",
    phone: business.phone || "",
    mobile: business.mobile || "",
    whatsapp: business.whatsapp || "",
    email: business.email || "",
    website: business.website || "",
    shortDescription: business.shortDescription || "",
    description: business.description || "",
    keywords: keywords.join(", "),
    ...parseHoursFromBusiness(business),
  };
}

export function extractExistingGalleryImages(
  business: BusinessRecordForDraft
): ExistingGalleryImage[] {
  const images = business.images || [];
  return images
    .map((image, index) => {
      if (typeof image === "string") {
        return { id: `existing-${index}`, url: image };
      }
      const url = image.secureUrl || image.url;
      if (!url) return null;
      return {
        id: image._id || `existing-${index}`,
        url,
        type: image.type,
      };
    })
    .filter(Boolean) as ExistingGalleryImage[];
}

export function extractExistingBannerUrl(business: BusinessRecordForDraft): string | null {
  const images = business.images || [];
  const banner = images.find((image) => {
    if (typeof image === "string") return false;
    return image.type === "banner";
  });
  if (banner && typeof banner !== "string") {
    return banner.secureUrl || banner.url || null;
  }
  return null;
}
