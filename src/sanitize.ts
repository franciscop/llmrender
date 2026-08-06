export type RawHtml = Record<string, string[]>;

const HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const SAFE_SCHEME = /^https?:/i;
// on* event handlers + srcdoc (embedded HTML); style (CSS injection); ping (tracker beacon)
const UNSAFE_ATTR = /^on|^srcdoc$|^style$|^ping$/;
// Hard-blocked regardless of allowlist — these can never be rendered.
const BLOCKED_TAGS =
  /^(script|style|meta|base|link|frame|frameset|iframe|object|embed|applet|portal|noscript|template|form)$/i;
// URL-bearing attributes that must be sanitized
const URL_ATTRS = /^(href|src|action|formaction|data|cite|poster|background)$/;

// Default allowlist for rawHtml={true}: known-safe content elements only.
// Grouped inline, block, tables, media.
const DEFAULT_TAGS = (
  "a abbr b bdi bdo br cite code data dfn em i kbd mark q rp rt ruby s samp small span strong sub sup time u var wbr " +
  "address article aside blockquote dd del details div dl dt figcaption figure footer h1 h2 h3 h4 h5 h6 header hr ins li main nav ol p pre section summary ul " +
  "caption col colgroup table tbody td th thead tr " +
  "audio img map area picture source track video"
).split(" ");

export const allowTags: RawHtml = Object.fromEntries(
  DEFAULT_TAGS.map((tag) => [tag, ["*"]]),
);

// Elements that are block-level and cannot appear as <p> descendants.
export const BLOCK_EL =
  /^(hr|div|p|ul|ol|li|table|thead|tbody|tr|th|td|pre|blockquote|h[1-6]|section|article|aside|header|footer|main|nav|figure|details|summary|form|fieldset|address)$/;

// HTML attribute name → React prop name (critical mappings only)
const ATTR_MAP: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  colspan: "colSpan",
  rowspan: "rowSpan",
};

function parseAttrs(str = ""): Record<string, string> {
  const out: Record<string, string> = {};
  str.replace(
    /([a-zA-Z][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g,
    (_, k, v1, v2, v3) => {
      out[k.toLowerCase()] = v1 ?? v2 ?? v3 ?? "";
      return "";
    },
  );
  return out;
}

// Strip control chars browsers use to bypass scheme detection, then reject
// any URL that has a scheme other than http or https.
export const isUnsafeUrl = (url: string) => {
  const s = url.replace(/[\x00-\x20\x7F"']/g, "");
  return HAS_SCHEME.test(s) && !SAFE_SCHEME.test(s);
};

export const sanitize = (url?: string) => (url && isUnsafeUrl(url) ? "#" : url);

// Returns sanitized React props for tag, or null if tag is blocked.
export function allowTag(
  tag: string,
  raw: RawHtml | boolean,
  attrStr: string,
): Record<string, string | boolean> | null {
  if (!raw) return null;
  if (BLOCKED_TAGS.test(tag)) return null;
  const tagLower = tag.toLowerCase();
  const allowedAttrs = (raw as RawHtml)[tagLower] ?? null;
  if (!allowedAttrs) return null;
  const parsed = parseAttrs(attrStr);
  const result: Record<string, string | boolean> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (UNSAFE_ATTR.test(k)) continue;
    if (URL_ATTRS.test(k) && isUnsafeUrl(v)) continue;
    if (!allowedAttrs.includes("*") && !allowedAttrs.includes(k)) continue;
    const reactKey = ATTR_MAP[k] ?? k;
    result[reactKey] = v === "" ? true : v;
  }
  // Prevent tabnapping: any <a target="_blank"> must sever window.opener.
  if (tagLower === "a" && result["target"] === "_blank") {
    const parts = new Set(
      typeof result["rel"] === "string" ? result["rel"].split(/\s+/) : [],
    );
    parts.add("noopener");
    parts.add("noreferrer");
    result["rel"] = [...parts].filter(Boolean).join(" ");
  }
  return result;
}
