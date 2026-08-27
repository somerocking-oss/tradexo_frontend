const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "span",
  "div",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  span: new Set(["class"]),
  div: new Set(["class"]),
  p: new Set(["class"]),
};

function stripDangerousProtocol(value: string) {
  const trimmed = value.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return "#";
  return trimmed;
}

export function sanitizeCmsHtml(html: string) {
  if (!html) return "";

  let output = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?iframe[\s\S]*?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  output = output.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tagName: string, attrsPart: string) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";

    const isClosing = match.startsWith("</");
    if (isClosing) return `</${tag}>`;

    const allowed = ALLOWED_ATTRS[tag] || new Set<string>();
    const attrs: string[] = [];
    const attrRegex = /([a-z0-9:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(attrsPart)) !== null) {
      const name = attrMatch[1].toLowerCase();
      if (!allowed.has(name)) continue;
      let value = attrMatch[3] ?? attrMatch[4] ?? attrMatch[5] ?? "";
      if (name === "href") value = stripDangerousProtocol(value);
      if (name === "target" && value === "_blank") {
        attrs.push('target="_blank"');
        attrs.push('rel="noopener noreferrer"');
        continue;
      }
      attrs.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
    }

    return attrs.length ? `<${tag} ${attrs.join(" ")}>` : `<${tag}>`;
  });

  return output.trim();
}
