/** Parse SEO slug like "plumbers-in-mumbai" → { keyword, city } */
export function parseBrowseSlug(slug: string): { keyword: string; city: string } {
  const decoded = decodeURIComponent(slug).trim().toLowerCase();
  const inIndex = decoded.lastIndexOf("-in-");

  if (inIndex > 0) {
    return {
      keyword: decoded.slice(0, inIndex).replace(/-/g, " "),
      city: decoded.slice(inIndex + 4).replace(/-/g, " "),
    };
  }

  return {
    keyword: decoded.replace(/-/g, " "),
    city: "",
  };
}

export function buildBrowseSlug(keyword: string, city: string) {
  const k = keyword.trim().toLowerCase().replace(/\s+/g, "-");
  const c = city.trim().toLowerCase().replace(/\s+/g, "-");
  return c ? `${k}-in-${c}` : k;
}

export function slugToCity(slug: string) {
  return titleCase(decodeURIComponent(slug).replace(/-/g, " "));
}

export function titleCase(text: string) {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}
