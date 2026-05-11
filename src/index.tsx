/// <reference path="./global.d.ts" />
import type { HTMLAttributes, ReactElement } from "react";
import { parseLines } from "./blocks";
import highlightCode from "./highlight";
import type { HighlightFn, MathFn } from "./inline";
import renderMath from "./renderMath";
import type { RawHtml } from "./sanitize";
import { allowTags } from "./sanitize";

export type { HighlightFn, MathFn, RawHtml };
export { allowTags, highlightCode };

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

  const content = parseLines(children.split("\n"), hl, m, raw);
  return <div {...props}>{content}</div>;
}
