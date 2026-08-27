/** Minimal inline re-implementations of a few Lucide icon paths (ISC licensed,
 *  same as the lucide-react package already used in this project) — needed
 *  here because these icons get stamped into a raw HTML string (blog content
 *  post-processing), where React components can't be rendered. */
const ICON_PATHS: Record<string, string> = {
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  package:
    '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  phone:
    '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  "layout-grid":
    '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  "file-text":
    '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  "shield-check":
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  "circle-check": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  "map-pin":
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
};

function iconSvg(name: keyof typeof ICON_PATHS, className: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}">${ICON_PATHS[name]}</svg>`;
}

const KEYWORD_ICONS: Array<[RegExp, keyof typeof ICON_PATHS]> = [
  [/search/i, "search"],
  [/product|catalog|images?/i, "package"],
  [/categor|navigat|menu/i, "layout-grid"],
  [/location|area|city|region/i, "map-pin"],
  [/contact|phone|call/i, "phone"],
  [/email|mail|submit|enqui|inquir/i, "mail"],
  [/description|content|detail|info/i, "file-text"],
  [/customer|buyer|supplier|user|people|team|business name/i, "users"],
  [/verified|secure|trust|quality|accurate/i, "shield-check"],
  [/view|profile/i, "user"],
];

function pickIcon(text: string): keyof typeof ICON_PATHS {
  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(text)) return icon;
  }
  return "circle-check";
}

const MAX_GRID_ITEM_LENGTH = 32;
const MIN_GRID_ITEMS = 3;
const MAX_GRID_ITEMS = 8;

/** Turns short, punchy <ul> lists (3-8 items, each under ~32 chars) into an
 *  icon grid, and styles the paragraph immediately following any list as a
 *  highlighted callout — mirrors how well-structured "quick facts" content
 *  reads best, without needing special authoring markup. Runs on already-
 *  sanitized HTML. */
export function enhanceContentBlocks(html: string): string {
  let output = html.replace(/<ul>([\s\S]*?)<\/ul>/gi, (match, inner: string) => {
    const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());

    const qualifies =
      items.length >= MIN_GRID_ITEMS &&
      items.length <= MAX_GRID_ITEMS &&
      items.every((item) => item.length > 0 && item.length <= MAX_GRID_ITEM_LENGTH);

    if (!qualifies) return match;

    const cells = items
      .map(
        (item) =>
          `<div class="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center">` +
          `<span class="flex size-10 items-center justify-center rounded-full bg-[#FF6C00]/10 text-[#ff6c00]">${iconSvg(
            pickIcon(item),
            "size-5"
          )}</span>` +
          `<span class="text-sm font-medium text-slate-700">${item}</span>` +
          `</div>`
      )
      .join("");

    return `<div class="grid grid-cols-2 gap-3 rounded-2xl border border-[#FF6C00]/15 bg-[#FFF7ED] p-4 sm:grid-cols-3">${cells}</div>`;
  });

  output = output.replace(/(<\/ul>|<\/ol>)\s*<p[^>]*>([\s\S]*?)<\/p>/gi, (match, closingTag: string, text: string) => {
    if (!text.trim() || text.trim() === "<br>") return match;
    return (
      `${closingTag}<div class="flex items-start gap-3 rounded-2xl border border-[#FF6C00]/20 bg-[#FFF7ED] p-4">` +
      `<span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#ff6c00]">${iconSvg(
        "star",
        "size-4"
      )}</span>` +
      `<p class="!mt-0 text-slate-700">${text}</p>` +
      `</div>`
    );
  });

  return output;
}
