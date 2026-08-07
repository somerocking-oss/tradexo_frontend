import { SEO_LANDING_CITIES } from "./seo-cities";

export { SEO_LANDING_CITIES };

/** @deprecated use SEO_LANDING_CITIES */
export const POPULAR_CITIES = SEO_LANDING_CITIES.slice(0, 8);

export const CITY_CATEGORY_SUGGESTIONS: Record<
  string,
  { label: string; keyword: string }[]
> = {
  Mumbai: [
    { label: "Manufacturers", keyword: "Manufacturers" },
    { label: "Packers and Movers", keyword: "Packers and Movers" },
    { label: "Hotels", keyword: "Hotels" },
    { label: "Doctors", keyword: "Doctors" },
    { label: "Wholesalers", keyword: "Wholesalers" },
    { label: "Logistics", keyword: "Logistics Companies" },
  ],
  Delhi: [
    { label: "Manufacturers", keyword: "Manufacturers" },
    { label: "Furniture", keyword: "Furniture Manufacturers" },
    { label: "Electricians", keyword: "Electricians" },
    { label: "CA Firms", keyword: "Chartered Accountants" },
    { label: "Packers and Movers", keyword: "Packers and Movers" },
    { label: "Hotels", keyword: "Hotels" },
  ],
  Noida: [
    { label: "Packers and Movers", keyword: "Packers and Movers" },
    { label: "IT Services", keyword: "IT Services" },
    { label: "Manufacturers", keyword: "Manufacturers" },
    { label: "Doctors", keyword: "Doctors" },
    { label: "Hotels", keyword: "Hotels" },
    { label: "Real Estate", keyword: "Real Estate Agents" },
  ],
  Patna: [
    { label: "Doctors", keyword: "Doctors" },
    { label: "Hospitals", keyword: "Hospitals" },
    { label: "Hotels", keyword: "Hotels" },
    { label: "Manufacturers", keyword: "Manufacturers" },
    { label: "Coaching", keyword: "Coaching Classes" },
    { label: "CA Firms", keyword: "Chartered Accountants" },
  ],
  Jaipur: [
    { label: "Hotels", keyword: "Hotels" },
    { label: "Marble", keyword: "Marble Suppliers" },
    { label: "Jewellery", keyword: "Jewellery" },
    { label: "Tour Operators", keyword: "Travel Agents" },
    { label: "Manufacturers", keyword: "Manufacturers" },
    { label: "Interior", keyword: "Interior Designers" },
  ],
};
