import { Fragment } from "react/jsx-runtime";
import type { ReactNode } from "react";
import type { RawHtml } from "./sanitize";
import { allowTag } from "./sanitize";
import type { HighlightFn, MathFn, RefMap } from "./inline";
import { parseInline, refLabel, renderItem } from "./inline";
import {
  COMMENT_ALL,
  HTML_PAIR_LINE,
  HTML_VOID_LINE,
  clearBreak,
  markBreak,
} from "./utils";

const HEADER = /^ {0,3}(#{1,6})(?: |$)/;
const HEADER_TRAIL = /(^|\s)#+\s*$/;
const HR = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const BLOCKQUOTE = /^ {0,3}>[ \t]?(.*)$/;
const SETEXT = /^ {0,3}(=+|-+)[ \t]*$/;
const REF_DEF = /^ {0,3}\[([^\]]+)\]:\s*(\S+)(?:\s+["'(](.*)["')])?\s*$/;
const DISPLAY_MATH = /^\$\$(.+)\$\$$/;
const CALLOUT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/i;
const BLOCK_HTML_START = /^<[a-zA-Z]/;
const FENCE = /^( {0,3})(`{3,}|~{3,})([^`]*)$/;
const TABLE_ROW = /^\|.+\|$/;
const TABLE_SEP = /^\|[\s|:-]+\|$/;
const LIST_ITEM = /^([*+-])\s+(.+)/;
const SUB_LIST_ITEM = /^\s{2,4}[*+-]\s+(.+)/;
const INDENTED_CODE = /^ {4,}/;
const ORDERED_ITEM = /^(\d{1,9})([.)]) /;
const ORDERED_SUB_ITEM = /^ {3}\d{1,9}[.)] (.+)/;

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
  | { type: "math"; content: string }
  | {
      type: "list";
      ordered: boolean;
      start?: number;
      items: { text: string; sub: string[] }[];
    }
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
  defs?: RefMap,
): Block[] {
  const blocks: Block[] = [];

  let inFencedCode = false;
  let fenceChar = "";
  let fenceSize = 0;
  let fenceIndent = 0;
  let codeLang = "";
  let codeLines: string[] = [];

  let inMathBlock = false;
  let mathLines: string[] = [];

  let inComment = false;

  let inList = false;
  let listOrdered = false;
  let listMarker = "";
  let listStart = 1;
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
      const last = paraLines.length - 1;
      paraLines[last] = clearBreak(paraLines[last]);
      blocks.push({ type: "paragraph", lines: paraLines });
      paraLines = [];
    }
  }

  function flushList() {
    if (inList) {
      blocks.push({
        type: "list",
        ordered: listOrdered,
        start: listStart,
        items: listItems,
      });
      inList = false;
      listItems = [];
      listStart = 1;
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

  // Everything except the block about to be extended.
  function flushAll(except?: "list" | "blockquote" | "table" | "code") {
    flushParagraph();
    if (except !== "list") flushList();
    if (except !== "blockquote") flushBlockquote();
    if (except !== "table") flushTable();
    if (except !== "code" && codeLines.length > 0) flushCode();
    if (mathLines.length > 0) {
      blocks.push({ type: "math", content: mathLines.join("\n") });
      mathLines = [];
      inMathBlock = false;
    }
  }
  // A different marker, or ordered vs unordered, starts a separate list.
  function openListItem(
    ordered: boolean,
    marker: string,
    text: string,
    start?: number,
  ) {
    if (inList && (listOrdered !== ordered || listMarker !== marker)) {
      flushList();
    }
    flushAll("list");
    if (!inList && start !== undefined) listStart = start;
    inList = true;
    listOrdered = ordered;
    listMarker = marker;
    listItems.push({ text, sub: [] });
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (inFencedCode) {
      // Same character, and at least as long as the opening run.
      const close = FENCE.exec(line);
      if (
        close &&
        close[2][0] === fenceChar &&
        close[2].length >= fenceSize &&
        !close[3].trim()
      ) {
        flushCode();
        inFencedCode = false;
      } else {
        codeLines.push(line.replace(new RegExp(`^ {0,${fenceIndent}}`), ""));
      }
      continue;
    }

    if (inMathBlock) {
      if (line.trim() === "$$") {
        blocks.push({ type: "math", content: mathLines.join("\n") });
        mathLines = [];
        inMathBlock = false;
      } else {
        mathLines.push(line);
      }
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      flushAll();
      inFencedCode = true;
      fenceChar = fence[2][0];
      fenceSize = fence[2].length;
      fenceIndent = fence[1].length;
      codeLang = fence[3].trim().split(/\s+/)[0] ?? "";
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
        blocks.push({ type: "math", content: dm[1].trim() });
        continue;
      }
    }

    // Multi-line only; single-line comments are stripped inline.
    if (inComment) {
      if (line.includes("-->")) inComment = false;
      continue;
    }
    if (line.includes("<!--") && !INDENTED_CODE.test(line)) {
      // A line holding nothing but comments leaves no paragraph behind.
      if (!line.replace(COMMENT_ALL, "").trim()) {
        if (!line.includes("-->")) inComment = true;
        continue;
      }
      if (!line.includes("-->")) {
        flushAll();
        inComment = true;
        continue;
      }
    }

    if (line.trim() === "") {
      flushAll();
      continue;
    }

    // flushAll() emits code last, so flush here to keep source order.
    if (codeLines.length > 0 && !INDENTED_CODE.test(line)) flushCode();

    // Matched here, not in a pre-pass, so definitions inside fences stay code.
    if (defs && paraLines.length === 0) {
      const def = REF_DEF.exec(line);
      if (def) {
        const label = refLabel(def[1]);
        if (!defs.has(label)) defs.set(label, { url: def[2], title: def[3] });
        continue;
      }
    }

    const headerMatch = HEADER.exec(line);
    if (headerMatch) {
      flushAll();
      blocks.push({
        type: "heading",
        level: headerMatch[1].length,
        text: line.replace(HEADER, "").replace(HEADER_TRAIL, "").trim(),
      });
      continue;
    }

    // Before HR: "---" matches both, an open paragraph decides which.
    const setext = paraLines.length > 0 && SETEXT.exec(line);
    if (setext) {
      const last = paraLines.length - 1;
      paraLines[last] = clearBreak(paraLines[last]);
      blocks.push({
        type: "heading",
        level: setext[1][0] === "=" ? 1 : 2,
        text: paraLines.join(" "),
      });
      paraLines = [];
      continue;
    }

    if (HR.test(line)) {
      flushAll();
      blocks.push({ type: "hr" });
      continue;
    }

    if (raw && BLOCK_HTML_START.test(line)) {
      const pair = HTML_PAIR_LINE.exec(line);
      const voidEl = HTML_VOID_LINE.exec(line);
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
      flushAll("table");
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
      openListItem(false, listMatch[1], listMatch[2]);
      continue;
    }

    const subItem = inList
      ? (listOrdered ? ORDERED_SUB_ITEM : SUB_LIST_ITEM).exec(line)
      : null;
    if (subItem) {
      listItems[listItems.length - 1].sub.push(subItem[1]);
      continue;
    }

    // Mid-paragraph an indented line is a continuation, not code.
    if (INDENTED_CODE.test(line) && !inFencedCode && paraLines.length === 0) {
      flushAll("code");
      codeLines.push(line.replace(/^ {4}/, ""));
      continue;
    }

    const orderedMatch = ORDERED_ITEM.exec(line);
    if (orderedMatch) {
      const text = line.replace(ORDERED_ITEM, "");
      if (!text) continue;
      openListItem(true, orderedMatch[2], text, +orderedMatch[1]);
      continue;
    }

    const quote = BLOCKQUOTE.exec(line);
    if (quote) {
      flushAll("blockquote");
      inBlockquote = true;
      blockquoteLines.push(quote[1]);
      continue;
    }

    // Partial streaming markers. CommonMark emits an empty item; see
    // streaming.test.tsx for why we skip instead.
    if (/^([*+\-]|\d{1,9}[.)])[ \t]*$/.test(line)) continue;

    // Lazy continuation, unless the quote's paragraph already closed.
    if (inBlockquote) {
      if (blockquoteLines[blockquoteLines.length - 1] !== "") {
        blockquoteLines.push(line.trim());
        continue;
      }
      flushBlockquote();
    }

    paraLines.push(markBreak(line));
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
  defs?: RefMap,
): ReactNode {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={key}>{parseInline(block.lines.join(" "), math, raw, defs)}</p>
      );

    case "heading": {
      const base = slugify(block.text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count}`;
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag key={key} id={id}>
          <a href={`#${id}`}>{parseInline(block.text, math, raw, defs)}</a>
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
          {math(block.content, true)}
        </div>
      ) : null;

    case "list": {
      const Tag = (block.ordered ? "ol" : "ul") as keyof JSX.IntrinsicElements;
      return (
        <Tag
          key={key}
          start={block.ordered && block.start !== 1 ? block.start : undefined}
        >
          {block.items.map(({ text, sub }, i) => (
            <li key={i}>
              {block.ordered
                ? parseInline(text, math, raw, defs)
                : renderItem(text, math, raw, defs)}
              {sub.length > 0 && (
                <Tag>
                  {sub.map((s, j) => (
                    <li key={j}>{parseInline(s, math, raw, defs)}</li>
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
        renderBlock(b, i, highlight, math, raw, seen, defs),
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
                  {parseInline(h, math, raw, defs)}
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
                    {parseInline(cell, math, raw, defs)}
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
          {block.content ? parseInline(block.content, math, raw, defs) : null}
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
  // Complete before rendering, so links can reference definitions below them.
  const defs: RefMap = new Map();
  return collectBlocks(lines, !!math, raw, defs).map((block, i) =>
    renderBlock(block, i, highlight, math, raw, seen, defs),
  );
}
