import type { ReactNode } from "react";
import type { RawHtml } from "./sanitize";
import { BLOCK_EL, allowTag, sanitize } from "./sanitize";
import {
  COMMENT,
  HARD_BREAK,
  HTML_PAIR,
  HTML_VOID,
  breakToSpace,
} from "./utils";

export type HighlightFn = (
  code: string,
  lang: string,
) => ReactNode | ReactNode[];
export type MathFn = (tex: string, block: boolean) => ReactNode;

/** Destinations collected from `[label]: url "title"` lines. */
export type RefMap = Map<string, { url: string; title?: string }>;

/** Reference labels match case-insensitively and ignore whitespace runs. */
export const refLabel = (raw: string) =>
  raw.trim().replace(/\s+/g, " ").toLowerCase();

export const CHECKBOX = /^\[[x\s]\] /i;
export const IS_CHECKED = /^\[[x]\] /i;

type Render = (
  m: RegExpExecArray,
  i: number,
  r: (s: string) => ReactNode[],
) => ReactNode;

// Common subset; the full HTML5 list is ~2000 names.
const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  copy: "©",
  reg: "®",
  trade: "™",
  deg: "°",
  sect: "§",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  times: "×",
  plusmn: "±",
  euro: "€",
  pound: "£",
};

const ENTITY = /&(#\d{1,7}|#[xX][\da-fA-F]{1,6}|[a-zA-Z][a-zA-Z\d]{1,31});/g;

// Safe because the result is a React text child, which React escapes, so a
// decoded "<" cannot open a tag. Code never reaches here.
const decodeEntities = (text: string) =>
  text.includes("&")
    ? text.replace(ENTITY, (whole, body: string) => {
        if (body[0] !== "#") return NAMED[body] ?? whole;
        const code =
          body[1] === "x" || body[1] === "X"
            ? parseInt(body.slice(2), 16)
            : +body.slice(1);
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "�";
      })
    : text;

const truncate = (text: string, max = 60) =>
  text.length > max ? text.slice(0, max) + "…" : text;

// One space is stripped from each end unless the span is all spaces.
const stripSpan = (text: string) =>
  text.length > 2 && text.startsWith(" ") && text.endsWith(" ") && text.trim()
    ? text.slice(1, -1)
    : text;

// Stays literal, but its contents are still inline markdown.
const unresolved = (
  m: RegExpExecArray,
  _i: number,
  r: (s: string) => ReactNode[],
  prefix: string,
): ReactNode => [
  prefix + "[",
  ...r(m[1]),
  "]" + (m[2] === undefined ? "" : "[" + m[2] + "]"),
];

const patterns: { regex: RegExp; render: Render }[] = [
  {
    regex: /\\([!-\/:-@\[-`{-~])/,
    render: (m) => m[1],
  },
  {
    // Dropped in every mode. A code span matches earlier, so it keeps its own.
    regex: COMMENT,
    render: () => null,
  },
  {
    regex: /~~(.+?)~~/,
    render: (m, i, r) => <del key={i}>{r(m[1])}</del>,
  },
  // CommonMark flanking rules. Split by delimiter because only underscore
  // carries the intraword restriction, keeping `snake_case_name` literal.
  {
    regex: /\*\*\*(?!\s)(.+?)(?<!\s)\*\*\*/,
    render: (m, i, r) => (
      <strong key={i}>
        <em>{r(m[1])}</em>
      </strong>
    ),
  },
  {
    regex: /(?<![^\s\p{P}\p{S}])___(?!\s)(.+?)(?<!\s)___(?![^\s\p{P}\p{S}])/u,
    render: (m, i, r) => (
      <strong key={i}>
        <em>{r(m[1])}</em>
      </strong>
    ),
  },
  {
    regex: /\*\*(?!\s)(.+?)(?<!\s)\*\*/,
    render: (m, i, r) => <strong key={i}>{r(m[1])}</strong>,
  },
  {
    regex: /(?<![^\s\p{P}\p{S}])__(?!\s)(.+?)(?<!\s)__(?![^\s\p{P}\p{S}])/u,
    render: (m, i, r) => <strong key={i}>{r(m[1])}</strong>,
  },
  {
    regex: /(?<!\*)\*(?!\*)(?!\s)(.+?)(?<!\s)(?<!\*)\*(?!\*)/,
    render: (m, i, r) => <em key={i}>{r(m[1])}</em>,
  },
  {
    regex:
      /(?<!_)(?<![^\s\p{P}\p{S}])_(?!_)(?!\s)(.+?)(?<!\s)(?<!_)_(?!_)(?![^\s\p{P}\p{S}])/u,
    render: (m, i, r) => <em key={i}>{r(m[1])}</em>,
  },
  {
    // Closed by a run of exactly the same length.
    regex: /(?<!`)(`+)(?!`)([\s\S]*?)(?<!`)\1(?!`)/,
    render: (m, i) => <code key={i}>{stripSpan(breakToSpace(m[2]))}</code>,
  },
  { regex: HARD_BREAK, render: (_, i) => <br key={i} /> },
  {
    regex: /!\[(.*?)\]\((.*?)(?:\s+"([^"]*)")?\)/,
    render: (m, i) => (
      <img key={i} alt={m[1]} src={sanitize(m[2])} title={m[3] || undefined} />
    ),
  },
  {
    regex:
      /\[((?:[^[\]]|\[[^\]]*\])*)\]\(((?:[^()\s"]|\s(?!\s*")|\([^()]*\))*)(?:\s+"([^"]*)")?\)/,
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
    // Any scheme matches so the brackets never leak, but sanitize() still
    // reduces anything outside http/https to "#".
    regex: /<([a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^\s<>]*)>/,
    render: (m, i) => (
      <a key={i} href={sanitize(m[1])}>
        {m[1]}
      </a>
    ),
  },
  {
    regex: /(https?:\/\/[^\s<>")\]]+)/,
    render: (m, i) => (
      <a key={i} href={m[1]}>
        {truncate(m[1])}
      </a>
    ),
  },
];

export function parseInline(
  text: string,
  math?: MathFn | false,
  rawHtml?: RawHtml | boolean,
  defs?: RefMap,
): ReactNode[] {
  const parts: ReactNode[] = [];
  let remaining = text;
  let index = 0;

  // Built here, not in `patterns`, because they need the document's
  // definitions, and cost nothing when there are none.
  const refPatterns: typeof patterns = defs?.size
    ? [
        {
          regex: /!\[((?:[^[\]]|\[[^\]]*\])*)\](?:\[([^\]]*)\])?/,
          render: (m, i, r) => {
            const def = defs.get(refLabel(m[2] || m[1]));
            if (!def) return unresolved(m, i, r, "!");
            return (
              <img
                key={i}
                alt={m[1].replace(/[*_`~]/g, "")}
                src={sanitize(def.url)}
                title={def.title}
              />
            );
          },
        },
        {
          regex: /\[((?:[^[\]]|\[[^\]]*\])+)\](?:\[([^\]]*)\])?/,
          render: (m, i, r) => {
            const def = defs.get(refLabel(m[2] || m[1]));
            if (!def) return unresolved(m, i, r, "");
            return (
              <a key={i} href={sanitize(def.url)} title={def.title}>
                {r(m[1])}
              </a>
            );
          },
        },
      ]
    : [];

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
          regex: HTML_PAIR,
          render: (m, i) => {
            const tag = m[1].toLowerCase();
            if (BLOCK_EL.test(tag)) return m[0];
            const attrs = allowTag(m[1], rawHtml, m[2] ?? "");
            if (!attrs) return m[0];
            const Tag = tag as keyof JSX.IntrinsicElements;
            return (
              <Tag key={i} {...(attrs as any)}>
                {parseInline(m[3], math, rawHtml, defs)}
              </Tag>
            );
          },
        },
        {
          // void / self-closing: <tag attrs /> or <tag attrs>
          regex: HTML_VOID,
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

  const activePatterns = [
    ...mathPatterns,
    ...patterns,
    ...refPatterns,
    ...htmlPatterns,
  ];

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
      parts.push(decodeEntities(remaining));
      break;
    }

    if (earliest.index > 0) {
      parts.push(decodeEntities(remaining.slice(0, earliest.index)));
    }
    parts.push(
      earliestPattern.render(earliest, index++, (s) =>
        parseInline(s, math, rawHtml, defs),
      ),
    );
    remaining = remaining.slice(earliest.index + earliest[0].length);
  }

  return parts;
}

export function renderItem(
  text: string,
  math?: MathFn | false,
  raw?: RawHtml | boolean,
  defs?: RefMap,
) {
  return (
    <>
      {CHECKBOX.test(text) && (
        <input type="checkbox" disabled checked={IS_CHECKED.test(text)} />
      )}
      {parseInline(text.replace(CHECKBOX, ""), math, raw, defs)}
    </>
  );
}
