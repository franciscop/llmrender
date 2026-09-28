import type { ReactNode } from "react";
import type { RawHtml } from "./sanitize";
import { allowTag } from "./sanitize";
import type { HighlightFn, MathFn, RefMap } from "./inline";
import {
  MATH_DISPLAY,
  MATH_INLINE,
  parseInline,
  refLabel,
  renderItem,
} from "./inline";
import {
  COMMENT_ALL,
  HTML_PAIR_LINE,
  HTML_VOID_LINE,
  clearBreak,
  markBreak,
} from "./utils";

// A keyed fragment: `<>` cannot take a key, so wrap one in a component.
// Pure JSX, so it follows whichever runtime `jsxImportSource` points at.
const Frag = ({ children }: { children?: ReactNode }) => <>{children}</>;

const HEADER = /^ {0,3}(#{1,6})(?: |$)/;
const HEADER_TRAIL = /(^|\s)#+\s*$/;
const HR = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const BLOCKQUOTE = /^ {0,3}>[ \t]?(.*)$/;
// A lone "-" is a list item still streaming in, not an underline.
const SETEXT = /^ {0,3}(=+|--+)[ \t]*$/;
// "[^1]: note" is a footnote, left as text rather than a link destination.
const REF_DEF = /^ {0,3}\[([^\]^][^\]]*)\]:\s*(\S+)(?:\s+["'(](.*)["')])?\s*$/;
// Inner spaces tell \[ x \] apart from the escaped brackets in \[text\].
const DISPLAY_MATH = /^(?:\$\$(.+)\$\$|\\\[\s(.+)\s\\\])$/;
const MATH_OPEN = /^(\$\$|\\\[)$/;
const MATH_CLOSE = /^(\$\$|\\\])$/;
const CALLOUT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/i;
const BLOCK_HTML_START = /^<[a-zA-Z]/;
// The one multi-line HTML construct we support. Everything else must fit on a
// single line; see readme.
const DETAILS = /^ {0,3}<details(\s[^>]*)?>([\s\S]*?)(?:<\/details>|$)/i;
const SUMMARY = /<summary(?:\s[^>]*)?>([\s\S]*?)<\/summary>/i;
const FENCE = /^( {0,3})(`{3,}|~{3,})([^`]*)$/;
const TABLE_ROW = /^\|.+\|$/;
const TABLE_SEP = /^\|[\s|:-]+\|$/;
// Groups: indent, bullet, number, number delimiter.
const LIST_ITEM = /^( {0,3})(?:([*+-])|(\d{1,9})([.)]))(?: +|$)/;
const INDENTED_CODE = /^ {4,}/;
const MATH_SPAN = new RegExp(
  "^(?:" + MATH_DISPLAY.source + "|" + MATH_INLINE.source + ")",
);

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
    // Math keeps its pipes, as in $|x|$
    const math = trimmed[i] === "$" && MATH_SPAN.exec(trimmed.slice(i));
    if (math) {
      cell += math[0];
      i += math[0].length;
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
      const l = c.startsWith(":");
      const r = c.endsWith(":");
      return l && r ? "center" : r ? "right" : l ? "left" : undefined;
    });
}

export type Block =
  | { type: "P"; lines: string[] }
  | { type: "H"; level: number; text: string }
  | { type: "R" }
  | { type: "C"; lang: string; lines: string[] }
  | { type: "M"; content: string }
  | {
      type: "L";
      ordered: boolean;
      start?: number;
      // Each item's lines, parsed as blocks of their own when rendered.
      items: string[][];
    }
  | { type: "Q"; lines: string[] }
  | {
      type: "T";
      headers: string[];
      rows: string[][];
      aligns: (string | undefined)[];
    }
  | { type: "G"; open: boolean; lines: string[] }
  | {
      type: "X";
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
  let fenceDedent = /^/;
  let codeLang = "";
  let codeLines: string[] = [];

  let inMathBlock = false;
  let mathLines: string[] = [];

  let inComment = false;

  let inList = false;
  let listOrdered = false;
  let listMarker = "";
  let listStart = 1;
  let listItems: string[][] = [];
  // Lines indented this far belong to the open item; the dedent strips its
  // content column. Lenient: two spaces nest even under "1. ".
  let listIndent = 0;
  let listDedent = /^/;

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
      blocks.push({ type: "P", lines: paraLines });
      paraLines = [];
    }
  }

  function flushList() {
    if (inList) {
      blocks.push({
        type: "L",
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
      blocks.push({ type: "Q", lines: blockquoteLines });
      inBlockquote = false;
      blockquoteLines = [];
    }
  }

  function flushTable() {
    if (inTable) {
      blocks.push({
        type: "T",
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
    blocks.push({ type: "C", lang: codeLang, lines: codeLines });
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
      blocks.push({ type: "M", content: mathLines.join("\n") });
      mathLines = [];
      inMathBlock = false;
    }
  }
  // A different marker, or ordered vs unordered, starts a separate list.
  function openListItem(match: RegExpExecArray, text: string) {
    const ordered = !!match[3];
    const marker = match[2] ?? match[4];
    if (inList && (listOrdered !== ordered || listMarker !== marker)) {
      flushList();
    }
    flushAll("list");
    if (!inList && ordered) listStart = +match[3];
    inList = true;
    listOrdered = ordered;
    listMarker = marker;
    listIndent = match[1].length + 2;
    listDedent = new RegExp(`^ {0,${match[0].length}}`);
    listItems.push([text]);
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
        codeLines.push(line.replace(fenceDedent, ""));
      }
      continue;
    }

    if (inMathBlock) {
      if (MATH_CLOSE.test(line.trim())) {
        blocks.push({ type: "M", content: mathLines.join("\n") });
        mathLines = [];
        inMathBlock = false;
      } else {
        mathLines.push(line);
      }
      continue;
    }

    if (inList) {
      const item = listItems[listItems.length - 1];
      const indent = line.search(/\S/);
      if (indent < 0 || indent >= listIndent) {
        item.push(line.replace(listDedent, ""));
        continue;
      }
      // After a blank line, only a new item keeps the list going.
      if (!item[item.length - 1] && !LIST_ITEM.test(line)) flushList();
    }

    const fence = FENCE.exec(line);
    if (fence) {
      flushAll();
      inFencedCode = true;
      fenceChar = fence[2][0];
      fenceSize = fence[2].length;
      fenceDedent = new RegExp(`^ {0,${fence[1].length}}`);
      codeLang = fence[3].trim().split(/\s+/)[0] ?? "";
      continue;
    }

    if (math && MATH_OPEN.test(line.trim())) {
      flushAll();
      inMathBlock = true;
      continue;
    }

    if (math) {
      const dm = DISPLAY_MATH.exec(line.trim());
      if (dm) {
        flushAll();
        blocks.push({ type: "M", content: (dm[1] ?? dm[2]).trim() });
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
        type: "H",
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
        type: "H",
        level: setext[1][0] === "=" ? 1 : 2,
        text: paraLines.join(" "),
      });
      paraLines = [];
      continue;
    }

    if (HR.test(line)) {
      flushAll();
      blocks.push({ type: "R" });
      continue;
    }

    if (raw && DETAILS.test(line)) {
      flushAll();
      const d = DETAILS.exec(lines.slice(index).join("\n"))!;
      blocks.push({
        type: "G",
        open: /\bopen\b/i.test(d[1] ?? ""),
        lines: d[2].split("\n"),
      });
      index += d[0].split("\n").length - 1;
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
            type: "X",
            tag: match[1].toLowerCase(),
            attrs,
            content: pair ? pair[3] : undefined,
          });
          continue;
        }
      }
    }

    const row = line.trimEnd();
    if (TABLE_ROW.test(row)) {
      flushAll("table");
      if (TABLE_SEP.test(row)) {
        tableSepSeen = true;
        tableAligns = parseAligns(row);
      } else if (!tableSepSeen) {
        inTable = true;
        tableHeaders = parseRow(row);
      } else {
        tableRows.push(parseRow(row));
      }
      continue;
    }

    // A bare marker is a partial streaming item. CommonMark emits an empty
    // item; see streaming.test.tsx for why we skip instead.
    const listMatch = LIST_ITEM.exec(line);
    if (listMatch) {
      const text = line.slice(listMatch[0].length);
      if (text) openListItem(listMatch, text);
      continue;
    }

    // Mid-paragraph an indented line is a continuation, not code.
    if (INDENTED_CODE.test(line) && !inFencedCode && paraLines.length === 0) {
      flushAll("code");
      codeLines.push(line.replace(/^ {4}/, ""));
      continue;
    }

    const quote = BLOCKQUOTE.exec(line);
    if (quote) {
      flushAll("blockquote");
      inBlockquote = true;
      blockquoteLines.push(quote[1]);
      continue;
    }

    // Lazy continuation, unless the quote's paragraph already closed.
    if (inBlockquote) {
      if (blockquoteLines[blockquoteLines.length - 1] !== "") {
        blockquoteLines.push(line.trim());
        continue;
      }
      flushBlockquote();
    }

    // Lazy continuation of the open item's paragraph.
    if (inList) {
      listItems[listItems.length - 1].push(line);
      continue;
    }

    // Flushed now, or the paragraph would render above the table.
    if (inTable) flushTable();
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
    case "P":
      return (
        <p key={key}>{parseInline(block.lines.join(" "), math, raw, defs)}</p>
      );

    case "H": {
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

    case "R":
      return <hr key={key} />;

    case "C":
      return highlight ? (
        <Frag key={key}>{highlight(block.lines.join("\n"), block.lang)}</Frag>
      ) : (
        <pre key={key}>
          <code className={block.lang ? `language-${block.lang}` : undefined}>
            {block.lines.join("\n")}
          </code>
        </pre>
      );

    case "M":
      return math ? (
        <div key={key} className="math-block">
          {math(block.content, true)}
        </div>
      ) : null;

    case "L": {
      const Tag = (block.ordered ? "ol" : "ul") as keyof JSX.IntrinsicElements;
      return (
        <Tag
          key={key}
          start={block.ordered && block.start !== 1 ? block.start : undefined}
        >
          {block.items.map((lines, i) => {
            // A leading paragraph renders bare, as in a tight list.
            const [first, ...rest] = collectBlocks(lines, !!math, raw, defs);
            return (
              <li key={i}>
                {first?.type === "P"
                  ? renderItem(first.lines.join(" "), math, raw, defs)
                  : first &&
                    renderBlock(first, 0, highlight, math, raw, seen, defs)}
                {rest.map((b, j) =>
                  renderBlock(b, j + 1, highlight, math, raw, seen, defs),
                )}
              </li>
            );
          })}
        </Tag>
      );
    }

    case "Q": {
      const callout = CALLOUT.exec(block.lines[0] ?? "");
      const contentLines = callout ? block.lines.slice(1) : block.lines;
      const inner = collectBlocks(contentLines, !!math, raw, defs).map((b, i) =>
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

    case "T": {
      const cell = (Tag: "th" | "td", text: string, i: number) => (
        <Tag
          key={i}
          style={
            block.aligns[i]
              ? { textAlign: block.aligns[i] as "left" | "center" | "right" }
              : undefined
          }
        >
          {parseInline(text, math, raw, defs)}
        </Tag>
      );
      return (
        <table key={key}>
          <thead>
            <tr>{block.headers.map((h, i) => cell("th", h, i))}</tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i}>{row.map((c, j) => cell("td", c, j))}</tr>
            ))}
          </tbody>
        </table>
      );
    }

    case "G": {
      const joined = block.lines.join("\n");
      const sm = SUMMARY.exec(joined);
      return (
        <details key={key} open={block.open}>
          {sm && <summary>{parseInline(sm[1], math, raw, defs)}</summary>}
          {collectBlocks(
            joined.replace(SUMMARY, "").split("\n"),
            !!math,
            raw,
            defs,
          ).map((x, i) => renderBlock(x, i, highlight, math, raw, seen, defs))}
        </details>
      );
    }

    case "X": {
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
