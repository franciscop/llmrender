import { Fragment } from "react/jsx-runtime";
import type { ReactNode } from "react";
import type { RawHtml } from "./sanitize";
import { allowTag } from "./sanitize";
import type { HighlightFn, MathFn } from "./inline";
import { parseInline, renderItem } from "./inline";

const HEADER = /^ {0,3}(#{1,6}) /;
const HEADER_TRAIL = /\s+#+\s*$/;
const HR = /^([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const DISPLAY_MATH = /^\$\$(.+)\$\$$/;
const CALLOUT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/i;
const BLOCK_HTML_START = /^<[a-zA-Z]/;
const BLOCK_HTML_PAIR = /^<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?>(.+?)<\/\1>$/;
const BLOCK_HTML_VOID = /^<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?\s*\/?>$/;
const TABLE_ROW = /^\|.+\|$/;
const TABLE_SEP = /^\|[\s|:-]+\|$/;
const LIST_ITEM = /^([*+-])\s+(.+)/;
const SUB_LIST_ITEM = /^\s{2,4}[*+-]\s+(.+)/;
const INDENTED_CODE = /^ {4,}/;
const ORDERED_ITEM = /^\d+\. /;
const ORDERED_SUB_ITEM = /^   \d+\. /;
// A hard line break is two trailing spaces or a trailing backslash.
const TRAILING_BR = / {2,}$|\\$/;

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/[\s_]+/g, "-");

export function parseRow(line: string) {
  const trimmed = line.replace(/^\||\|$/g, "");
  const cells: string[] = [];
  let cell = "";
  let i = 0;
  while (i < trimmed.length) {
    if (trimmed[i] === "$") {
      const delim = trimmed[i + 1] === "$" ? "$$" : "$";
      cell += delim;
      i += delim.length;
      while (i < trimmed.length) {
        if (trimmed.startsWith(delim, i)) {
          cell += delim;
          i += delim.length;
          break;
        }
        cell += trimmed[i++];
      }
    } else if (trimmed[i] === "\\" && trimmed[i + 1] === "|") {
      cell += "|";
      i += 2;
    } else if (trimmed[i] === "|") {
      cells.push(cell.trim());
      cell = "";
      i++;
    } else {
      cell += trimmed[i++];
    }
  }
  cells.push(cell.trim());
  return cells;
}

export function parseAligns(sep: string): (string | undefined)[] {
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

export type Block =
  | { type: "paragraph"; lines: string[] }
  | { type: "heading"; level: number; text: string }
  | { type: "hr" }
  | { type: "code"; lang: string; lines: string[] }
  | { type: "math"; lines: string[] }
  | { type: "displayMath"; content: string }
  | { type: "list"; ordered: boolean; items: { text: string; sub: string[] }[] }
  | { type: "blockquote"; lines: string[] }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
      aligns: (string | undefined)[];
    }
  | {
      type: "rawHtml";
      tag: string;
      attrs: Record<string, string | boolean>;
      content?: string;
    };

export function collectBlocks(
  lines: string[],
  math: boolean,
  raw: RawHtml | boolean | undefined,
): Block[] {
  const blocks: Block[] = [];

  let inFencedCode = false;
  let codeLang = "";
  let codeLines: string[] = [];

  let inMathBlock = false;
  let mathLines: string[] = [];

  let inList = false;
  let listOrdered = false;
  let listItems: { text: string; sub: string[] }[] = [];

  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  let tableAligns: (string | undefined)[] = [];
  let tableSepSeen = false;

  let paraLines: string[] = [];

  function flushParagraph() {
    if (paraLines.length) {
      // A hard break on the final line has nothing to break to, so drop it.
      const last = paraLines.length - 1;
      paraLines[last] = paraLines[last].replace(/<br>$/, "");
      blocks.push({ type: "paragraph", lines: paraLines });
      paraLines = [];
    }
  }

  function flushList() {
    if (inList) {
      blocks.push({ type: "list", ordered: listOrdered, items: listItems });
      inList = false;
      listItems = [];
    }
  }

  function flushBlockquote() {
    if (inBlockquote) {
      blocks.push({ type: "blockquote", lines: blockquoteLines });
      inBlockquote = false;
      blockquoteLines = [];
    }
  }

  function flushTable() {
    if (inTable) {
      blocks.push({
        type: "table",
        headers: tableHeaders,
        rows: tableRows,
        aligns: tableAligns,
      });
      inTable = false;
      tableHeaders = [];
      tableRows = [];
      tableAligns = [];
      tableSepSeen = false;
    }
  }

  function flushCode() {
    blocks.push({ type: "code", lang: codeLang, lines: codeLines });
    codeLines = [];
    codeLang = "";
  }

  function flushAll() {
    flushParagraph();
    flushList();
    flushBlockquote();
    flushTable();
    if (codeLines.length > 0) flushCode();
    if (mathLines.length > 0) {
      blocks.push({ type: "math", lines: mathLines });
      mathLines = [];
      inMathBlock = false;
    }
  }

  for (const line of lines) {
    if (inFencedCode) {
      if (line.startsWith("```")) {
        flushCode();
        inFencedCode = false;
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (inMathBlock) {
      if (line.trim() === "$$") {
        blocks.push({ type: "math", lines: mathLines });
        mathLines = [];
        inMathBlock = false;
      } else {
        mathLines.push(line);
      }
      continue;
    }

    if (line.startsWith("```")) {
      flushAll();
      inFencedCode = true;
      codeLang = line.slice(3).trim();
      continue;
    }

    if (math && line.trim() === "$$") {
      flushAll();
      inMathBlock = true;
      continue;
    }

    if (math) {
      const dm = DISPLAY_MATH.exec(line.trim());
      if (dm) {
        flushAll();
        blocks.push({ type: "displayMath", content: dm[1].trim() });
        continue;
      }
    }

    if (line.trim() === "") {
      flushAll();
      continue;
    }

    // Indented code accumulates across lines but is flushed last in flushAll(),
    // so a later paragraph or table would be pushed ahead of it. Flush it as
    // soon as a non-indented line arrives to keep blocks in source order.
    if (codeLines.length > 0 && !INDENTED_CODE.test(line)) flushCode();

    const headerMatch = HEADER.exec(line);
    if (headerMatch) {
      flushAll();
      blocks.push({
        type: "heading",
        level: headerMatch[1].length,
        text: line.replace(HEADER, "").replace(HEADER_TRAIL, ""),
      });
      continue;
    }

    if (HR.test(line.trim())) {
      flushAll();
      blocks.push({ type: "hr" });
      continue;
    }

    if (raw && BLOCK_HTML_START.test(line)) {
      const pair = BLOCK_HTML_PAIR.exec(line);
      const voidEl = BLOCK_HTML_VOID.exec(line);
      const match = pair ?? voidEl;
      if (match) {
        const attrs = allowTag(match[1], raw, match[2] ?? "");
        if (attrs) {
          flushAll();
          blocks.push({
            type: "rawHtml",
            tag: match[1].toLowerCase(),
            attrs,
            content: pair ? pair[3] : undefined,
          });
          continue;
        }
      }
    }

    if (TABLE_ROW.test(line)) {
      flushParagraph();
      flushList();
      flushBlockquote();
      if (TABLE_SEP.test(line)) {
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

    const listMatch = LIST_ITEM.exec(line);
    if (listMatch) {
      flushParagraph();
      if (inList && listOrdered) flushList();
      flushBlockquote();
      flushTable();
      inList = true;
      listOrdered = false;
      listItems.push({ text: listMatch[2], sub: [] });
      continue;
    }

    const subListMatch = SUB_LIST_ITEM.exec(line);
    if (subListMatch && inList && !listOrdered) {
      listItems[listItems.length - 1].sub.push(subListMatch[1]);
      continue;
    }

    if (INDENTED_CODE.test(line) && !inFencedCode) {
      flushParagraph();
      flushList();
      flushBlockquote();
      flushTable();
      codeLines.push(line.replace(/^ {4}/, ""));
      continue;
    }

    if (ORDERED_ITEM.test(line)) {
      const text = line.replace(ORDERED_ITEM, "");
      if (!text) continue;
      flushParagraph();
      if (inList && !listOrdered) flushList();
      flushBlockquote();
      flushTable();
      inList = true;
      listOrdered = true;
      listItems.push({ text, sub: [] });
      continue;
    }

    if (ORDERED_SUB_ITEM.test(line) && inList && listOrdered) {
      listItems[listItems.length - 1].sub.push(line.replace(/^\s+\d+\. /, ""));
      continue;
    }

    if (line === ">" || line.startsWith("> ")) {
      flushParagraph();
      flushList();
      flushTable();
      inBlockquote = true;
      blockquoteLines.push(line.startsWith("> ") ? line.slice(2) : "");
      continue;
    }

    // Skip bare block-start markers that are partial streaming artifacts.
    // A lone "- " or "1. " with no content would otherwise land in paraLines
    // and flush before the current list, corrupting render order.
    if (/^([*+\-]|\d+\.)\s*$/.test(line)) continue;

    paraLines.push(
      TRAILING_BR.test(line)
        ? line.trimStart().replace(TRAILING_BR, "<br>")
        : line.trim(),
    );
  }

  flushAll();
  return blocks;
}

export function renderBlock(
  block: Block,
  key: number,
  highlight: HighlightFn | false,
  math: MathFn | false | undefined,
  raw: RawHtml | boolean | undefined,
  seen: Map<string, number> = new Map(),
): ReactNode {
  switch (block.type) {
    case "paragraph":
      return <p key={key}>{parseInline(block.lines.join(" "), math, raw)}</p>;

    case "heading": {
      const base = slugify(block.text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count}`;
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag key={key} id={id}>
          <a href={`#${id}`}>{parseInline(block.text, math, raw)}</a>
        </Tag>
      );
    }

    case "hr":
      return <hr key={key} />;

    case "code":
      return highlight ? (
        <Fragment key={key}>
          {highlight(block.lines.join("\n"), block.lang)}
        </Fragment>
      ) : (
        <pre key={key}>
          <code className={block.lang ? `language-${block.lang}` : undefined}>
            {block.lines.join("\n")}
          </code>
        </pre>
      );

    case "math":
      return math ? (
        <div key={key} className="math-block">
          {math(block.lines.join("\n"), true)}
        </div>
      ) : null;

    case "displayMath":
      return math ? (
        <div key={key} className="math-block">
          {math(block.content, true)}
        </div>
      ) : null;

    case "list": {
      const Tag = (block.ordered ? "ol" : "ul") as keyof JSX.IntrinsicElements;
      return (
        <Tag key={key}>
          {block.items.map(({ text, sub }, i) => (
            <li key={i}>
              {block.ordered
                ? parseInline(text, math, raw)
                : renderItem(text, math, raw)}
              {sub.length > 0 && (
                <Tag>
                  {sub.map((s, j) => (
                    <li key={j}>{parseInline(s, math, raw)}</li>
                  ))}
                </Tag>
              )}
            </li>
          ))}
        </Tag>
      );
    }

    case "blockquote": {
      const callout = CALLOUT.exec(block.lines[0] ?? "");
      const contentLines = callout ? block.lines.slice(1) : block.lines;
      const inner = collectBlocks(contentLines, !!math, raw).map((b, i) =>
        renderBlock(b, i, highlight, math, raw, seen),
      );
      if (callout) {
        const type = callout[1].toLowerCase();
        const label = type[0].toUpperCase() + type.slice(1);
        return (
          <blockquote key={key} className={`callout-${type}`}>
            <p className="callout-title">{label}</p>
            {inner}
          </blockquote>
        );
      }
      return <blockquote key={key}>{inner}</blockquote>;
    }

    case "table":
      return (
        <table key={key}>
          <thead>
            <tr>
              {block.headers.map((h, i) => (
                <th
                  key={i}
                  style={
                    block.aligns[i]
                      ? {
                          textAlign: block.aligns[i] as
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
            {block.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={
                      block.aligns[j]
                        ? {
                            textAlign: block.aligns[j] as
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
        </table>
      );

    case "rawHtml": {
      const Tag = block.tag as keyof JSX.IntrinsicElements;
      return (
        <Tag key={key} {...(block.attrs as any)}>
          {block.content ? parseInline(block.content, math, raw) : null}
        </Tag>
      );
    }
  }
}

export function parseLines(
  lines: string[],
  highlight: HighlightFn | false,
  math?: MathFn | false,
  raw?: RawHtml | boolean,
): ReactNode[] {
  const seen = new Map<string, number>();
  return collectBlocks(lines, !!math, raw).map((block, i) =>
    renderBlock(block, i, highlight, math, raw, seen),
  );
}
