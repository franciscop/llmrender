import type { ReactNode } from "react";
import type { RawHtml } from "./sanitize";
import { BLOCK_EL, allowTag, sanitize } from "./sanitize";

export type HighlightFn = (
  code: string,
  lang: string,
) => ReactNode | ReactNode[];
export type MathFn = (tex: string, block: boolean) => ReactNode;

export const CHECKBOX = /^\[[x\s]\] /i;
export const IS_CHECKED = /^\[[x]\] /i;

type Render = (
  m: RegExpExecArray,
  i: number,
  r: (s: string) => ReactNode[],
) => ReactNode;

const truncate = (text: string, max = 60) =>
  text.length > max ? text.slice(0, max) + "…" : text;

const patterns: { regex: RegExp; render: Render }[] = [
  {
    // Any ASCII punctuation is escapable, per CommonMark.
    regex: /\\([!-\/:-@\[-`{-~])/,
    render: (m) => m[1],
  },
  {
    regex: /~~(.+?)~~/,
    render: (m, i, r) => <del key={i}>{r(m[1])}</del>,
  },
  // Emphasis follows CommonMark's flanking rules: a delimiter cannot open when
  // followed by whitespace, nor close when preceded by it. Underscore also
  // cannot open or close inside a word, so `snake_case_name` stays literal
  // while `*` is still allowed intraword. Asterisk and underscore are separate
  // patterns because only underscore carries the intraword restriction.
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
    regex: /``\s*(.+?)\s*``/,
    render: (m, i) => <code key={i}>{m[1]}</code>,
  },
  { regex: /`(.+?)`/, render: (m, i) => <code key={i}>{m[1]}</code> },
  { regex: /<br\s*\/?>/i, render: (_, i) => <br key={i} /> },
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

export function renderItem(
  text: string,
  math?: MathFn | false,
  raw?: RawHtml | boolean,
) {
  return (
    <>
      {CHECKBOX.test(text) && (
        <input type="checkbox" disabled checked={IS_CHECKED.test(text)} />
      )}
      {parseInline(text.replace(CHECKBOX, ""), math, raw)}
    </>
  );
}
