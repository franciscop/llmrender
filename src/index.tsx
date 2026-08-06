/// <reference path="./global.d.ts" />
import type { HTMLAttributes, ReactElement } from "react";
import { parseLines } from "./blocks";
import highlightCode from "./highlight/highlight";
import type { HighlightFn, MathFn } from "./inline";
import renderMath from "./math/renderMath";
import type { RawHtml } from "./sanitize";
import { allowTags } from "./sanitize";

export type { HighlightFn, MathFn, RawHtml };
export { allowTags, highlightCode };

// Stripped before parsing: a scheme-obfuscation vector, and it keeps the
// hard-break sentinels unforgeable. Tab is left for expandTabs.
const CONTROL = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// Block rules measure indentation in spaces. A tab advances to the next
// 4-column stop, so the width depends on the current column.
function expandTabs(line: string): string {
  if (!line.includes("\t")) return line;
  let out = "";
  for (const char of line) {
    if (char !== "\t") {
      out += char;
      continue;
    }
    out += " ".repeat(4 - (out.length % 4));
  }
  return out;
}

export default function Markdown({
  children,
  highlight = true,
  math = true,
  rawHtml = false,
  ...props
}: {
  children: string;
  highlight?: boolean | HighlightFn;
  math?: boolean | MathFn;
  rawHtml?: boolean | RawHtml;
} & HTMLAttributes<HTMLDivElement>): ReactElement {
  const hl = highlight === true ? highlightCode : highlight || false;
  const m = math === true ? renderMath : math || false;
  const raw = rawHtml === true ? allowTags : rawHtml || false;

  const lines = (children ?? "")
    .split(/\r?\n/)
    .map((line) => expandTabs(line.replace(CONTROL, "")));
  const content = parseLines(lines, hl, m, raw);
  return <div {...props}>{content}</div>;
}
