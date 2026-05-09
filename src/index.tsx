/// <reference path="./global.d.ts" />
import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import highlightCode from "./highlight";
import renderMath from "./renderMath";

export type HighlightFn = (code: string, lang: string) => ReactNode[];
export type MathFn = (tex: string, block: boolean) => ReactNode;
export type RawHtmlProp = boolean | Record<string, string[]>;

// Only http/https are allowed as URL schemes. Anything with a scheme that
// isn't one of these two is blocked — including javascript:, data:, vbscript:,
// blob:, ftp:, custom protocols, and anything browsers add in the future.
// Relative URLs and fragments (#) have no scheme and are always allowed.
const HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const SAFE_SCHEME = /^https?:/i;
// on* event handlers + srcdoc (embedded HTML); style (CSS injection); ping (tracker beacon)
const UNSAFE_ATTR = /^on|^srcdoc$|^style$|^ping$/;
// Hard-blocked regardless of allowlist — these can never be rendered.
const BLOCKED_TAGS =
  /^(script|style|meta|base|link|frame|frameset|iframe|object|embed|applet|portal|noscript|template|form)$/i;
// URL-bearing attributes that must be sanitized; keys are pre-lowercased
const URL_ATTRS = /^(href|src|action|formaction|data|cite|poster|background)$/;

// Default allowlist for rawHtml={true}: known-safe content elements only.
// Excludes script, style, iframe, form, svg, canvas, and anything that loads
// or executes external content beyond what URL_ATTRS already sanitizes.
const DEFAULT_TAGS = new Set([
  // inline
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",
  // block
  "address",
  "article",
  "aside",
  "blockquote",
  "dd",
  "del",
  "details",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "ins",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "summary",
  "ul",
  // tables
  "caption",
  "col",
  "colgroup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  // media (URL attrs still sanitized via URL_ATTRS)
  "audio",
  "img",
  "map",
  "area",
  "picture",
  "source",
  "track",
  "video",
]);
const HEADER = /^#{1,6} /;
const CHECKBOX = /^\[[x\s]\] /i;
const IS_CHECKED = /^\[[x]\] /i;

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/[\s_]+/g, "-");

// Strip control chars browsers use to bypass scheme detection, then reject
// any URL that has a scheme other than http or https.
const isUnsafeUrl = (url: string) => {
  const s = url.replace(/[\x00-\x20\x7F"']/g, "");
  return HAS_SCHEME.test(s) && !SAFE_SCHEME.test(s);
};
const sanitize = (url?: string) => (url && isUnsafeUrl(url) ? "#" : url);

// Elements that are block-level and cannot appear as <p> descendants.
const BLOCK_EL =
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

// Returns sanitized React props for tag, or null if tag is blocked.
function allowTag(
  tag: string,
  raw: RawHtmlProp,
  attrStr: string,
): Record<string, string | boolean> | null {
  if (!raw) return null;
  if (BLOCKED_TAGS.test(tag)) return null;
  const tagLower = tag.toLowerCase();
  // allowedAttrs: null = all attrs pass (minus UNSAFE_ATTR/URL_ATTRS); string[] = only these
  let allowedAttrs: string[] | null;
  if (raw === true) {
    if (!DEFAULT_TAGS.has(tagLower)) return null;
    allowedAttrs = null;
  } else {
    allowedAttrs = (raw as Record<string, string[]>)[tagLower] ?? null;
    if (!allowedAttrs) return null;
  }
  const parsed = parseAttrs(attrStr);
  const result: Record<string, string | boolean> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (UNSAFE_ATTR.test(k)) continue;
    if (URL_ATTRS.test(k) && isUnsafeUrl(v)) continue;
    if (allowedAttrs && !allowedAttrs.includes(k)) continue;
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

type Render = (
  m: RegExpExecArray,
  i: number,
  r: (s: string) => ReactNode[],
) => ReactNode;

const patterns: { regex: RegExp; render: Render }[] = [
  {
    regex: /\\([\\`*_{}\[\]()#+\-.!|~])/,
    render: (m) => m[1],
  },
  {
    regex: /~~(.+?)~~/,
    render: (m, i, r) => <del key={i}>{r(m[1])}</del>,
  },
  {
    regex: /(?:\*\*\*|___)(.+?)(?:\*\*\*|___)/,
    render: (m, i, r) => (
      <strong key={i}>
        <em>{r(m[1])}</em>
      </strong>
    ),
  },
  {
    regex: /(?:\*\*|__)(.+?)(?:\*\*|__)/,
    render: (m, i, r) => <strong key={i}>{r(m[1])}</strong>,
  },
  {
    regex: /(?:\*|_)(.+?)(?:\*|_)/,
    render: (m, i, r) => <em key={i}>{r(m[1])}</em>,
  },
  {
    regex: /``\s*(.+?)\s*``/,
    render: (m, i) => <code key={i}>{m[1]}</code>,
  },
  { regex: /`(.+?)`/, render: (m, i) => <code key={i}>{m[1]}</code> },
  { regex: /<br\s*\/?>/i, render: (_, i) => <br key={i} /> },
  {
    regex: /!\[(.+?)\]\((.+?)(?:\s+"([^"]*)")?\)/,
    render: (m, i) => (
      <img key={i} alt={m[1]} src={sanitize(m[2])} title={m[3] || undefined} />
    ),
  },
  {
    regex: /\[((?:[^[\]]|\[[^\]]*\])+)\]\((.+?)(?:\s+"([^"]*)")?\)/,
    render: (m, i, r) => (
      <a key={i} href={sanitize(m[2])} title={m[3] || undefined}>
        {r(m[1])}
      </a>
    ),
  },
  {
    regex: /\[([^\]]+)\]\{([^}"]+?)(?:\s+"([^"]*)")?\}/,
    render: (m, i, r) => (
      <ruby key={i} title={m[3] || undefined}>
        {r(m[1])}
        <rt>{m[2]}</rt>
      </ruby>
    ),
  },
  {
    regex: /(https?:\/\/[^\s<>")\]]+)/,
    render: (m, i) => (
      <a key={i} href={m[1]}>
        {m[1]}
      </a>
    ),
  },
];

function parseInline(
  text: string,
  math?: MathFn | false,
  rawHtml?: RawHtmlProp,
): ReactNode[] {
  const parts: ReactNode[] = [];
  let remaining = text;
  let index = 0;

  const mathPatterns: typeof patterns = math
    ? [
        {
          regex: /\$\$([^$]+?)\$\$/,
          render: (m, i) => (
            <span key={i} className="math-display">
              {math(m[1], true)}
            </span>
          ),
        },
        {
          regex: /\$([^$\n]+?)\$/,
          render: (m, i) => (
            <span key={i} className="math-inline">
              {math(m[1], false)}
            </span>
          ),
        },
      ]
    : [];

  const htmlPatterns: typeof patterns = rawHtml
    ? [
        {
          // paired tags: <tag attrs>content</tag>
          regex: /<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?>(.+?)<\/\1>/,
          render: (m, i) => {
            const tag = m[1].toLowerCase();
            if (BLOCK_EL.test(tag)) return m[0];
            const attrs = allowTag(m[1], rawHtml, m[2] ?? "");
            if (!attrs) return m[0];
            const Tag = tag as keyof JSX.IntrinsicElements;
            return (
              <Tag key={i} {...(attrs as any)}>
                {parseInline(m[3], math, rawHtml)}
              </Tag>
            );
          },
        },
        {
          // void / self-closing: <tag attrs /> or <tag attrs>
          regex: /<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?\s*\/?>/,
          render: (m, i) => {
            const tag = m[1].toLowerCase();
            if (BLOCK_EL.test(tag)) return m[0];
            const attrs = allowTag(m[1], rawHtml, m[2] ?? "");
            if (!attrs) return m[0];
            const Tag = tag as keyof JSX.IntrinsicElements;
            return <Tag key={i} {...(attrs as any)} />;
          },
        },
      ]
    : [];

  const activePatterns = [...mathPatterns, ...patterns, ...htmlPatterns];

  while (remaining.length > 0) {
    let earliest: RegExpExecArray | null = null;
    let earliestPattern: (typeof activePatterns)[0] | null = null;

    for (const p of activePatterns) {
      const m = p.regex.exec(remaining);
      if (m && (earliest === null || m.index < earliest.index)) {
        earliest = m;
        earliestPattern = p;
      }
    }

    if (!earliest || !earliestPattern) {
      parts.push(remaining);
      break;
    }

    if (earliest.index > 0) parts.push(remaining.slice(0, earliest.index));
    parts.push(
      earliestPattern.render(earliest, index++, (s) =>
        parseInline(s, math, rawHtml),
      ),
    );
    remaining = remaining.slice(earliest.index + earliest[0].length);
  }

  return parts;
}

function parseRow(line: string) {
  return line
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.replace(/\\\|/g, "|").trim());
}

function parseAligns(sep: string): (string | undefined)[] {
  return sep
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => {
      c = c.trim();
      const STARTS_WITH = c.at(0) === ":";
      const ENDS_WITH = c.at(-1) === ":";
      if (STARTS_WITH && ENDS_WITH) return "center";
      if (ENDS_WITH) return "right";
      if (STARTS_WITH) return "left";
      return undefined;
    });
}

function renderItem(text: string, math?: MathFn | false, raw?: RawHtmlProp) {
  return (
    <>
      {CHECKBOX.test(text) && (
        <input type="checkbox" disabled checked={IS_CHECKED.test(text)} />
      )}
      {parseInline(text.replace(CHECKBOX, ""), math, raw)}
    </>
  );
}

function parseLines(
  lines: string[],
  key: { v: number },
  highlight: HighlightFn,
  math?: MathFn | false,
  raw?: RawHtmlProp,
): ReactNode[] {
  const elements: ReactNode[] = [];
  let buffer: string[] = [];

  let inCodeBlock = false;
  let codeLang = "";
  let codeLines: string[] = [];

  let inMathBlock = false;
  let mathLines: string[] = [];

  let inList = false;
  let listItems: { text: string; sub: string[] }[] = [];

  let inOrderedList = false;
  let orderedItems: { text: string; sub: string[] }[] = [];

  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  let tableAligns: (string | undefined)[] = [];
  let tableSepSeen = false;

  function flushParagraph() {
    if (buffer.length > 0) {
      elements.push(
        <p key={key.v++}>{parseInline(buffer.join(" "), math, raw)}</p>,
      );
      buffer = [];
    }
  }

  function flushList() {
    if (inList) {
      elements.push(
        <ul key={key.v++}>
          {listItems.map(({ text, sub }, i) => (
            <li key={i}>
              {renderItem(text, math, raw)}
              {sub.length > 0 && (
                <ul>
                  {sub.map((s, j) => (
                    <li key={j}>{parseInline(s, math, raw)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>,
      );
      inList = false;
      listItems = [];
    }
  }

  function flushOrderedList() {
    if (inOrderedList) {
      elements.push(
        <ol key={key.v++}>
          {orderedItems.map(({ text, sub }, i) => (
            <li key={i}>
              {parseInline(text, math, raw)}
              {sub.length > 0 && (
                <ol>
                  {sub.map((s, j) => (
                    <li key={j}>{parseInline(s, math, raw)}</li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>,
      );
      inOrderedList = false;
      orderedItems = [];
    }
  }

  function flushBlockquote() {
    if (inBlockquote) {
      const callout = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/i.exec(
        blockquoteLines[0],
      );
      if (callout) {
        const type = callout[1].toLowerCase();
        const label = type[0].toUpperCase() + type.slice(1);
        elements.push(
          <blockquote key={key.v++} className={`callout-${type}`}>
            <p className="callout-title">{label}</p>
            {parseLines(blockquoteLines.slice(1), key, highlight, math, raw)}
          </blockquote>,
        );
      } else {
        elements.push(
          <blockquote key={key.v++}>
            {parseLines(blockquoteLines, key, highlight, math, raw)}
          </blockquote>,
        );
      }
      inBlockquote = false;
      blockquoteLines = [];
    }
  }

  function flushCodeBlock() {
    elements.push(
      <pre key={key.v++}>
        <code className={codeLang ? `language-${codeLang}` : undefined}>
          {highlight(codeLines.join("\n"), codeLang)}
        </code>
      </pre>,
    );
    codeLines = [];
    codeLang = "";
  }

  function flushTable() {
    if (inTable) {
      elements.push(
        <table key={key.v++}>
          <thead>
            <tr>
              {tableHeaders.map((h, i) => (
                <th
                  key={i}
                  style={
                    tableAligns[i]
                      ? {
                          textAlign: tableAligns[i] as
                            | "left"
                            | "center"
                            | "right",
                        }
                      : undefined
                  }
                >
                  {parseInline(h, math, raw)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={
                      tableAligns[j]
                        ? {
                            textAlign: tableAligns[j] as
                              | "left"
                              | "center"
                              | "right",
                          }
                        : undefined
                    }
                  >
                    {parseInline(cell, math, raw)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      inTable = false;
      tableHeaders = [];
      tableRows = [];
      tableAligns = [];
      tableSepSeen = false;
    }
  }

  function flushAll() {
    flushParagraph();
    flushList();
    flushOrderedList();
    flushBlockquote();
    flushTable();
    if (codeLines.length > 0) flushCodeBlock();
  }

  for (const line of lines) {
    if (inCodeBlock) {
      if (line.startsWith("```")) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (inMathBlock) {
      if (line.trim() === "$$") {
        if (math) {
          elements.push(
            <div key={key.v++} className="math-block">
              {math(mathLines.join("\n"), true)}
            </div>,
          );
        }
        mathLines = [];
        inMathBlock = false;
      } else {
        mathLines.push(line);
      }
      continue;
    }

    if (line.startsWith("```")) {
      flushAll();
      inCodeBlock = true;
      codeLang = line.slice(3).trim();
      continue;
    }

    if (math && line.trim() === "$$") {
      flushAll();
      inMathBlock = true;
      continue;
    }

    if (math) {
      const displayMath = /^\$\$(.+)\$\$$/.exec(line.trim());
      if (displayMath) {
        flushAll();
        elements.push(
          <div key={key.v++} className="math-block">
            {math(displayMath[1].trim(), true)}
          </div>,
        );
        continue;
      }
    }

    if (line.trim() === "") {
      flushAll();
      continue;
    }

    if (HEADER.test(line)) {
      flushAll();
      // This _also_ matches the space, so remove it
      const level = line.match(HEADER)![0].length - 1;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const text = line.replace(HEADER, "");
      const id = slugify(text);
      elements.push(
        <Tag key={key.v++} id={id}>
          <a href={`#${id}`}>{parseInline(text, math, raw)}</a>
        </Tag>,
      );
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushAll();
      elements.push(<hr key={key.v++} />);
      continue;
    }

    // Single-line block HTML
    if (raw && /^<[a-zA-Z]/.test(line)) {
      const pair = /^<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?>(.+?)<\/\1>$/.exec(line);
      const voidEl = /^<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?\s*\/?>$/.exec(line);
      const match = pair ?? voidEl;
      if (match) {
        const attrs = allowTag(match[1], raw, match[2] ?? "");
        if (attrs) {
          flushAll();
          const Tag = match[1].toLowerCase() as keyof JSX.IntrinsicElements;
          elements.push(
            <Tag key={key.v++} {...(attrs as any)}>
              {pair ? parseInline(pair[3], math, raw) : null}
            </Tag>,
          );
          continue;
        }
      }
    }

    if (/^\|.+\|$/.test(line)) {
      flushParagraph();
      flushList();
      flushOrderedList();
      flushBlockquote();
      if (/^\|[\s|:-]+\|$/.test(line)) {
        tableSepSeen = true;
        tableAligns = parseAligns(line);
      } else if (!tableSepSeen) {
        inTable = true;
        tableHeaders = parseRow(line);
      } else {
        tableRows.push(parseRow(line));
      }
      continue;
    }

    const listMatch = /^([*+-])\s+(.+)/.exec(line);
    if (listMatch) {
      flushParagraph();
      flushOrderedList();
      flushBlockquote();
      flushTable();
      inList = true;
      listItems.push({ text: listMatch[2], sub: [] });
      continue;
    }

    const subListMatch = /^\s{2,4}[*+-]\s+(.+)/.exec(line);
    if (subListMatch && inList) {
      listItems[listItems.length - 1].sub.push(subListMatch[1]);
      continue;
    }

    if (/^ {4,}/.test(line) && !inCodeBlock) {
      flushParagraph();
      flushList();
      flushOrderedList();
      flushBlockquote();
      flushTable();
      codeLines.push(line.replace(/^ {4}/, ""));
      continue;
    }

    if (/^\d+\. /.test(line)) {
      flushParagraph();
      flushList();
      flushBlockquote();
      flushTable();
      inOrderedList = true;
      orderedItems.push({ text: line.replace(/^\d+\. /, ""), sub: [] });
      continue;
    }

    if (/^   \d+\. /.test(line) && inOrderedList) {
      orderedItems[orderedItems.length - 1].sub.push(
        line.replace(/^\s+\d+\. /, ""),
      );
      continue;
    }

    if (line === ">" || line.startsWith("> ")) {
      flushParagraph();
      flushList();
      flushOrderedList();
      flushTable();
      inBlockquote = true;
      blockquoteLines.push(line.startsWith("> ") ? line.slice(2) : "");
      continue;
    }

    buffer.push(
      / {2,}$/.test(line)
        ? line.trimStart().replace(/ {2,}$/, "<br>")
        : line.trim(),
    );
  }

  flushAll();
  return elements;
}

export default function Markdown({
  children,
  highlight = highlightCode,
  math = renderMath,
  rawHtml,
  ...props
}: {
  children: string;
  highlight?: HighlightFn;
  math?: MathFn | false;
  rawHtml?: RawHtmlProp;
} & HTMLAttributes<HTMLDivElement>): ReactElement {
  const content = parseLines(
    children.split("\n"),
    { v: 0 },
    highlight,
    math || false,
    rawHtml,
  );
  return <div {...props}>{content}</div>;
}
